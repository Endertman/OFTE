import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';

/**
 * A single page in the flipbook.
 * react-pageflip requires every child to accept a forwarded ref.
 */
const Page = forwardRef(({ src, alt, pageNumber, totalPages }, ref) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            ref={ref}
            style={{
                width: '100%',
                height: '100%',
                background: '#0b2b27',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* Loading skeleton */}
            {!loaded && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#10403b',
                    }}
                >
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#8aa6a3"
                        strokeWidth="2"
                        style={{ animation: 'spin 1s linear infinite' }}
                    >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }}
            />
            {/* Page number */}
            <span
                style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: pageNumber % 2 === 0 ? '12px' : 'auto',
                    left: pageNumber % 2 !== 0 ? '12px' : 'auto',
                    fontSize: '11px',
                    color: '#8aa6a3',
                    fontFamily: 'Inter, sans-serif',
                    userSelect: 'none',
                }}
            >
                {pageNumber} / {totalPages}
            </span>
        </div>
    );
});

Page.displayName = 'Page';

/**
 * Generates page image URLs from the magazine data.
 */
function getPageUrls(folder, pageCount, filePattern) {
    return Array.from({ length: pageCount }, (_, i) => {
        const num = String(i + 1).padStart(5, '0');
        return `${folder}/${filePattern.replace('{NUM}', num)}`;
    });
}

/**
 * Calculates flipbook dimensions based on container width.
 * Uses A4-ish aspect ratio (1 : 1.414).
 */
function calcDimensions(containerWidth) {
    const ASPECT = 1.414;

    // Mobile: single page, nearly full width
    if (containerWidth < 640) {
        const w = containerWidth - 32;
        return { width: w, height: Math.round(w * ASPECT), usePortrait: true };
    }
    // Tablet
    if (containerWidth < 1024) {
        const w = Math.round(containerWidth * 0.42);
        return { width: w, height: Math.round(w * ASPECT), usePortrait: false };
    }
    // Desktop: 85% of container width → each page is ~42.5%
    const w = Math.round(containerWidth * 0.425);
    return { width: w, height: Math.round(w * ASPECT), usePortrait: false };
}

/**
 * Calculates the distance between two touch points.
 */
function getTouchDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the midpoint between two touch points.
 */
function getTouchMidpoint(t1, t2) {
    return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
    };
}

export default function MagazineFlipbook({ folder, pageCount, filePattern, title }) {
    const flipBookRef = useRef(null);
    const containerRef = useRef(null);
    const flipbookWrapperRef = useRef(null);
    const [dims, setDims] = useState({ width: 400, height: 566, usePortrait: false });
    const [currentPage, setCurrentPage] = useState(0);
    const [ready, setReady] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Pinch-to-zoom state
    const [zoomScale, setZoomScale] = useState(1);
    const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
    const [isPinching, setIsPinching] = useState(false);
    const pinchStartDist = useRef(0);
    const pinchStartScale = useRef(1);

    const pages = getPageUrls(folder, pageCount, filePattern);

    // Responsive resize handler
    const handleResize = useCallback(() => {
        if (containerRef.current) {
            setDims(calcDimensions(containerRef.current.offsetWidth));
        }
        setIsMobile(window.innerWidth < 640);
    }, []);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        const t = setTimeout(() => setReady(true), 100);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(t);
        };
    }, [handleResize]);

    // Listen for fullscreen changes
    useEffect(() => {
        const onFsChange = () => {
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
            setIsFullscreen(!!fsEl);
            // Recalculate dimensions after fullscreen toggle
            setTimeout(handleResize, 100);
        };
        document.addEventListener('fullscreenchange', onFsChange);
        document.addEventListener('webkitfullscreenchange', onFsChange);
        return () => {
            document.removeEventListener('fullscreenchange', onFsChange);
            document.removeEventListener('webkitfullscreenchange', onFsChange);
        };
    }, [handleResize]);

    // Pinch-to-zoom touch handlers (mobile only)
    useEffect(() => {
        const wrapper = flipbookWrapperRef.current;
        if (!wrapper || !isMobile) return;

        const onTouchStart = (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                e.stopPropagation();
                setIsPinching(true);
                pinchStartDist.current = getTouchDistance(e.touches[0], e.touches[1]);
                pinchStartScale.current = zoomScale;

                // Calculate zoom origin relative to the wrapper
                const rect = wrapper.getBoundingClientRect();
                const mid = getTouchMidpoint(e.touches[0], e.touches[1]);
                setZoomOrigin({
                    x: ((mid.x - rect.left) / rect.width) * 100,
                    y: ((mid.y - rect.top) / rect.height) * 100,
                });
            }
        };

        const onTouchMove = (e) => {
            if (e.touches.length === 2 && isPinching) {
                e.preventDefault();
                e.stopPropagation();
                const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
                const ratio = currentDist / pinchStartDist.current;
                const newScale = Math.min(Math.max(pinchStartScale.current * ratio, 1), 4);
                setZoomScale(newScale);
            }
        };

        const onTouchEnd = (e) => {
            if (e.touches.length < 2 && isPinching) {
                setIsPinching(false);
                // If zoom is close to 1, snap back
                if (zoomScale < 1.15) {
                    setZoomScale(1);
                    setZoomOrigin({ x: 50, y: 50 });
                }
            }
        };

        wrapper.addEventListener('touchstart', onTouchStart, { passive: false });
        wrapper.addEventListener('touchmove', onTouchMove, { passive: false });
        wrapper.addEventListener('touchend', onTouchEnd, { passive: false });

        return () => {
            wrapper.removeEventListener('touchstart', onTouchStart);
            wrapper.removeEventListener('touchmove', onTouchMove);
            wrapper.removeEventListener('touchend', onTouchEnd);
        };
    }, [isMobile, isPinching, zoomScale]);

    const flipPrev = () => {
        flipBookRef.current?.pageFlip()?.flipPrev();
    };

    const flipNext = () => {
        flipBookRef.current?.pageFlip()?.flipNext();
    };

    const onFlip = (e) => {
        setCurrentPage(e.data);
        // Reset zoom when flipping
        setZoomScale(1);
        setZoomOrigin({ x: 50, y: 50 });
    };

    const toggleFullscreen = async () => {
        const el = containerRef.current;
        if (!el) return;

        try {
            if (!isFullscreen) {
                if (el.requestFullscreen) {
                    await el.requestFullscreen();
                } else if (el.webkitRequestFullscreen) {
                    await el.webkitRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                }
            }
        } catch (err) {
            console.warn('Fullscreen not supported:', err);
        }
    };

    // Reset zoom on double-tap
    const handleDoubleTap = useCallback(() => {
        if (zoomScale > 1) {
            setZoomScale(1);
            setZoomOrigin({ x: 50, y: 50 });
        }
    }, [zoomScale]);

    const displayPage = currentPage + 1;

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                background: isFullscreen ? '#060708' : 'transparent',
                display: isFullscreen ? 'flex' : 'block',
                flexDirection: 'column',
                justifyContent: isFullscreen ? 'center' : 'flex-start',
                padding: isFullscreen ? '16px' : '0',
                boxSizing: 'border-box',
            }}
        >
            {/* Title */}
            <h1
                style={{
                    textAlign: 'center',
                    marginBottom: isFullscreen ? '12px' : '24px',
                    fontSize: isFullscreen ? '1.125rem' : '1.5rem',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    color: '#127369',
                }}
            >
                {title}
            </h1>

            {/* Flipbook container */}
            <div
                ref={flipbookWrapperRef}
                onDoubleClick={handleDoubleTap}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: isFullscreen ? 'auto' : dims.height + 40,
                    flex: isFullscreen ? '1' : 'none',
                    position: 'relative',
                    touchAction: 'pan-y',
                    overflow: 'hidden',
                    transform: isMobile && zoomScale > 1 ? `scale(${zoomScale})` : 'none',
                    transformOrigin: isMobile && zoomScale > 1 ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : 'center center',
                    transition: isPinching ? 'none' : 'transform 0.2s ease-out',
                }}
            >
                {ready && (
                    <HTMLFlipBook
                        ref={flipBookRef}
                        width={dims.width}
                        height={dims.height}
                        size="stretch"
                        minWidth={280}
                        maxWidth={1200}
                        minHeight={396}
                        maxHeight={1700}
                        maxShadowOpacity={0.5}
                        drawShadow={true}
                        showCover={true}
                        mobileScrollSupport={!isPinching}
                        usePortrait={dims.usePortrait}
                        onFlip={onFlip}
                        className="magazine-flipbook"
                        style={{}}
                        startPage={0}
                        flippingTime={600}
                        useMouseEvents={true}
                        swipeDistance={isPinching ? 9999 : 30}
                        showPageCorners={true}
                        disableFlipByClick={isPinching}
                    >
                        {pages.map((url, i) => (
                            <Page
                                key={i}
                                src={url}
                                alt={`${title} — Página ${i + 1}`}
                                pageNumber={i + 1}
                                totalPages={pageCount}
                            />
                        ))}
                    </HTMLFlipBook>
                )}

                {/* Loading placeholder while flipbook initializes */}
                {!ready && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: dims.width,
                            height: dims.height,
                            background: '#10403b',
                            borderRadius: '8px',
                        }}
                    >
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#8aa6a3"
                            strokeWidth="2"
                            style={{ animation: 'spin 1s linear infinite' }}
                        >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    </div>
                )}

                {/* Zoom indicator */}
                {isMobile && zoomScale > 1 && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(16, 64, 59, 0.85)',
                            color: '#8aa6a3',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontFamily: 'Inter, sans-serif',
                            zIndex: 10,
                            pointerEvents: 'none',
                        }}
                    >
                        {Math.round(zoomScale * 100)}%
                    </div>
                )}
            </div>

            {/* Navigation controls */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: isFullscreen ? '12px' : '20px',
                    flexWrap: 'wrap',
                }}
            >
                {/* Previous button */}
                <button
                    onClick={flipPrev}
                    aria-label="Página anterior"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        border: '1px solid #396d67',
                        background: 'transparent',
                        color: '#127369',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#127369';
                        e.currentTarget.style.color = '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#127369';
                    }}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>

                {/* Page indicator */}
                <span
                    style={{
                        fontSize: '0.875rem',
                        color: '#637371',
                        fontFamily: 'Inter, sans-serif',
                        minWidth: '100px',
                        textAlign: 'center',
                        userSelect: 'none',
                    }}
                >
                    Página {displayPage} de {pageCount}
                </span>

                {/* Next button */}
                <button
                    onClick={flipNext}
                    aria-label="Página siguiente"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        border: '1px solid #396d67',
                        background: 'transparent',
                        color: '#127369',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#127369';
                        e.currentTarget.style.color = '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#127369';
                    }}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>

                {/* Fullscreen button (mobile only) */}
                {isMobile && (
                    <button
                        onClick={toggleFullscreen}
                        aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            border: '1px solid #396d67',
                            background: isFullscreen ? '#127369' : 'transparent',
                            color: isFullscreen ? '#f0f0f0' : '#127369',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {isFullscreen ? (
                            /* Exit fullscreen icon */
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                                <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                                <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                                <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                            </svg>
                        ) : (
                            /* Enter fullscreen icon */
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {/* Hint text */}
            <p
                style={{
                    textAlign: 'center',
                    marginTop: '12px',
                    fontSize: '0.75rem',
                    color: '#637371',
                    fontFamily: 'Inter, sans-serif',
                }}
            >
                {isMobile
                    ? 'Desliza para cambiar de página · Pellizca para hacer zoom'
                    : 'Usa las flechas ← → o arrastra las páginas para navegar'}
            </p>

            {/* Styles */}
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .magazine-flipbook {
          box-shadow: 0 4px 24px rgba(11, 43, 39, 0.25);
          border-radius: 4px;
        }
        /* Prevent pinch-zoom and double-tap zoom on the flipbook area */
        .magazine-flipbook,
        .magazine-flipbook * {
          touch-action: pan-y !important;
          -webkit-user-select: none;
          user-select: none;
        }
        .magazine-flipbook .stf__wrapper {
          overflow: hidden !important;
        }
      `}</style>
        </div>
    );
}
