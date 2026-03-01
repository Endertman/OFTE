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
    const overlayRef = useRef(null); // SHIELD REF - intercepts all touch events on mobile

    const [dims, setDims] = useState({ width: 400, height: 566, usePortrait: false });
    const [currentPage, setCurrentPage] = useState(0);
    const [ready, setReady] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Pinch-to-zoom state
    const [zoomScale, setZoomScale] = useState(1);
    const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
    const [isPinching, setIsPinching] = useState(false);

    // Touch tracking ref for the shield (no re-renders during gestures)
    const touchState = useRef({
        mode: 'none', // 'none' | 'waiting' | 'swiping' | 'pinching'
        startX: 0,
        startY: 0,
        startTime: 0,
        pinchStartDist: 0,
        pinchStartScale: 1,
    });

    // Refs that mirror state so touch handlers never read stale closures
    const zoomScaleRef = useRef(zoomScale);
    useEffect(() => { zoomScaleRef.current = zoomScale; }, [zoomScale]);

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
            setTimeout(handleResize, 100);
        };
        document.addEventListener('fullscreenchange', onFsChange);
        document.addEventListener('webkitfullscreenchange', onFsChange);
        return () => {
            document.removeEventListener('fullscreenchange', onFsChange);
            document.removeEventListener('webkitfullscreenchange', onFsChange);
        };
    }, [handleResize]);

    // Flip controls (must be declared before the touch effect)
    const flipPrev = useCallback(() => {
        flipBookRef.current?.pageFlip()?.flipPrev();
    }, []);

    const flipNext = useCallback(() => {
        flipBookRef.current?.pageFlip()?.flipNext();
    }, []);

    // ── NATIVE TOUCH HANDLER ON THE OVERLAY (THE SHIELD) ──
    // This overlay intercepts all touch events on mobile, preventing the flipbook
    // from receiving them directly. We then manually handle swipes and pinch-to-zoom.
    useEffect(() => {
        const el = overlayRef.current;
        if (!el || !isMobile) return;

        const SWIPE_THRESHOLD = 50; // px
        const SWIPE_TIME = 400; // ms

        const onStart = (e) => {
            const ts = touchState.current;

            // Two-finger touch: start pinch-to-zoom
            if (e.touches.length === 2) {
                e.preventDefault();
                e.stopPropagation();
                setIsPinching(true);
                ts.mode = 'pinching';
                ts.pinchStartDist = getTouchDistance(e.touches[0], e.touches[1]);
                ts.pinchStartScale = zoomScaleRef.current;

                // Calculate zoom origin relative to the overlay
                const rect = el.getBoundingClientRect();
                const mid = getTouchMidpoint(e.touches[0], e.touches[1]);
                setZoomOrigin({
                    x: ((mid.x - rect.left) / rect.width) * 100,
                    y: ((mid.y - rect.top) / rect.height) * 100,
                });
                return;
            }

            // Single-finger touch
            if (e.touches.length === 1) {
                if (zoomScaleRef.current > 1) {
                    // Block taps/swipes if already zoomed in (prevents accidental flips)
                    e.preventDefault();
                } else {
                    ts.mode = 'waiting';
                    ts.startX = e.touches[0].clientX;
                    ts.startY = e.touches[0].clientY;
                    ts.startTime = Date.now();
                }
            }
        };

        const onMove = (e) => {
            const ts = touchState.current;

            // If a second finger is added during a gesture, switch to pinching
            if (e.touches.length === 2 && ts.mode !== 'pinching') {
                e.preventDefault();
                setIsPinching(true);
                ts.mode = 'pinching';
                ts.pinchStartDist = getTouchDistance(e.touches[0], e.touches[1]);
                ts.pinchStartScale = zoomScaleRef.current;
                return;
            }

            // Handle active pinch gesture
            if (ts.mode === 'pinching' && e.touches.length === 2) {
                e.preventDefault();
                const dist = getTouchDistance(e.touches[0], e.touches[1]);
                const ratio = dist / ts.pinchStartDist;
                const newScale = Math.min(Math.max(ts.pinchStartScale * ratio, 1), 4);
                setZoomScale(newScale);
                return;
            }

            // Detect horizontal swipe from waiting state
            if (ts.mode === 'waiting' && e.touches.length === 1) {
                const dx = Math.abs(e.touches[0].clientX - ts.startX);
                const dy = Math.abs(e.touches[0].clientY - ts.startY);
                // If finger moved enough horizontally, commit to swipe
                if (dx > 15 && dx > dy) {
                    e.preventDefault();
                    ts.mode = 'swiping';
                }
            }

            // Prevent scroll while swiping or zoomed
            if (ts.mode === 'swiping' || zoomScaleRef.current > 1) {
                e.preventDefault();
            }
        };

        const onEnd = (e) => {
            const ts = touchState.current;

            // Complete swipe gesture
            if (ts.mode === 'swiping') {
                const touch = e.changedTouches[0];
                const dx = touch.clientX - ts.startX;
                const elapsed = Date.now() - ts.startTime;

                if (Math.abs(dx) > SWIPE_THRESHOLD && elapsed < SWIPE_TIME) {
                    if (dx < 0) flipNext();
                    else flipPrev();
                }
            }

            // Complete pinch gesture
            if (ts.mode === 'pinching') {
                setIsPinching(false);
                // Snap back to 1x if zoom is close to 1
                if (zoomScaleRef.current < 1.15) {
                    setZoomScale(1);
                    setZoomOrigin({ x: 50, y: 50 });
                }
            }

            // Reset mode when all fingers are lifted
            if (e.touches.length === 0) {
                ts.mode = 'none';
            }
        };

        el.addEventListener('touchstart', onStart, { passive: false });
        el.addEventListener('touchmove', onMove, { passive: false });
        el.addEventListener('touchend', onEnd, { passive: false });
        el.addEventListener('touchcancel', onEnd, { passive: false });

        return () => {
            el.removeEventListener('touchstart', onStart);
            el.removeEventListener('touchmove', onMove);
            el.removeEventListener('touchend', onEnd);
            el.removeEventListener('touchcancel', onEnd);
        };
    }, [isMobile, flipNext, flipPrev]);

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
                    touchAction: 'none', // Block native touch behaviors
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
                        mobileScrollSupport={false} // Disable library's touch handling
                        usePortrait={dims.usePortrait}
                        onFlip={onFlip}
                        className="magazine-flipbook"
                        style={{}}
                        startPage={0}
                        flippingTime={600}
                        useMouseEvents={!isMobile} // Mouse on desktop, blocked on mobile
                        swipeDistance={9999} // High value to prevent library swipe detection
                        showPageCorners={!isMobile}
                        disableFlipByClick={isMobile} // Prevent accidental clicks on mobile
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

                {/* --- THE TOUCH SHIELD --- */}
                {/* On mobile, this overlay sits on top of the flipbook and intercepts
                    all touch events. This prevents the flipbook from triggering page
                    flips during pinch-to-zoom gestures. */}
                {isMobile && (
                    <div
                        ref={overlayRef}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 20,
                            touchAction: 'none',
                            cursor: zoomScale > 1 ? 'grab' : 'default',
                        }}
                    />
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
                            position: 'absolute',
                            zIndex: 10,
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
                            zIndex: 30,
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
        /* Prevent native touch behaviors on the flipbook */
        .magazine-flipbook,
        .magazine-flipbook * {
          touch-action: none !important;
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
