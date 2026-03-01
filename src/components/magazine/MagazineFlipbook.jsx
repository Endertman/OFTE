import React, { useRef, useState, useEffect, forwardRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';

const Page = forwardRef(({ src, alt, pageNumber, totalPages }, ref) => (
    <div ref={ref} className="magazine-page">
        <img
            src={src}
            alt={alt}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
            }}
            loading="lazy"
            draggable={false}
        />
        <span
            style={{
                position: 'absolute',
                bottom: '8px',
                right: '12px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.6)',
                background: 'rgba(0,0,0,0.35)',
                padding: '2px 8px',
                borderRadius: '4px',
                pointerEvents: 'none',
            }}
        >
            {pageNumber} / {totalPages}
        </span>
    </div>
));

Page.displayName = 'Page';

export default function MagazineFlipbook({ folder, pageCount, filePattern, title }) {
    const bookRef = useRef(null);
    const containerRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [dimensions, setDimensions] = useState({ width: 550, height: 733 });
    const [ready, setReady] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Zoom state
    const [zoom, setZoom] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

    // Touch tracking refs (no re-renders needed)
    const touchState = useRef({
        mode: 'none',        // 'none' | 'waiting' | 'swiping' | 'pinching' | 'panning'
        startX: 0,
        startY: 0,
        startTime: 0,
        pinchStartDist: 0,
        pinchStartZoom: 1,
        panStartX: 0,
        panStartY: 0,
        panStartOffsetX: 0,
        panStartOffsetY: 0,
    });

    // We need refs for zoom/pan so touch handlers read latest values
    const zoomRef = useRef(1);
    const panRef = useRef({ x: 0, y: 0 });
    zoomRef.current = zoom;
    panRef.current = panOffset;

    const pages = Array.from({ length: pageCount }, (_, i) => {
        const num = String(i + 1).padStart(5, '0');
        return `${folder}/${filePattern.replace('{NUM}', num)}`;
    });

    const calcDimensions = useCallback((fullscreen = false) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const ratio = 1.5;
        const mobile = w < 768;

        if (fullscreen) {
            const availH = h - 80;
            if (mobile) {
                const pageW = w - 10;
                const pageH = Math.min(Math.round(pageW * ratio), availH);
                return { width: pageW, height: pageH, mobile };
            }
            const pageH = availH;
            const pageW = Math.round(pageH / ratio);
            if (pageW * 2 > w - 40) {
                const adjustedW = Math.round((w - 40) / 2);
                return { width: adjustedW, height: Math.round(adjustedW * ratio), mobile };
            }
            return { width: pageW, height: pageH, mobile };
        }

        if (mobile) {
            const mobileW = w - 16;
            return { width: mobileW, height: Math.round(mobileW * ratio), mobile };
        } else if (w < 1280) {
            const pageW = Math.min(380, Math.round((w - 80) / 2));
            return { width: pageW, height: Math.round(pageW * ratio), mobile };
        }
        return { width: 450, height: Math.round(450 * ratio), mobile };
    }, []);

    useEffect(() => {
        function updateSize() {
            const result = calcDimensions(isFullscreen);
            setDimensions({ width: result.width, height: result.height });
            setIsMobile(result.mobile);
        }
        updateSize();
        setReady(true);
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [isFullscreen, calcDimensions]);

    useEffect(() => {
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
    }, [currentPage, isFullscreen]);

    // ── Native touch handler on the overlay (mobile only) ──
    // Uses native addEventListener with {passive: false} so we can preventDefault
    // and completely block touch events from reaching the flipbook underneath.
    const overlayRef = useRef(null);

    useEffect(() => {
        const el = overlayRef.current;
        if (!el || !isMobile) return;

        const SWIPE_THRESHOLD = 50; // px to count as a swipe
        const SWIPE_TIME = 400;     // max ms
        const WAIT_MS = 120;        // wait before deciding swipe vs pinch

        const getTouchDist = (touches) => {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const onStart = (e) => {
            const ts = touchState.current;

            if (e.touches.length === 2) {
                // Immediately enter pinch mode
                e.preventDefault();
                ts.mode = 'pinching';
                ts.pinchStartDist = getTouchDist(e.touches);
                ts.pinchStartZoom = zoomRef.current;
                return;
            }

            if (e.touches.length === 1) {
                const z = zoomRef.current;
                if (z > 1) {
                    // Zoomed in → pan immediately
                    e.preventDefault();
                    ts.mode = 'panning';
                    ts.panStartX = e.touches[0].clientX;
                    ts.panStartY = e.touches[0].clientY;
                    ts.panStartOffsetX = panRef.current.x;
                    ts.panStartOffsetY = panRef.current.y;
                } else {
                    // Not zoomed → wait to see if second finger comes
                    ts.mode = 'waiting';
                    ts.startX = e.touches[0].clientX;
                    ts.startY = e.touches[0].clientY;
                    ts.startTime = Date.now();
                }
            }
        };

        const onMove = (e) => {
            const ts = touchState.current;

            // If a second finger arrives while waiting, switch to pinch
            if (e.touches.length === 2 && ts.mode !== 'pinching') {
                e.preventDefault();
                ts.mode = 'pinching';
                ts.pinchStartDist = getTouchDist(e.touches);
                ts.pinchStartZoom = zoomRef.current;
                return;
            }

            if (ts.mode === 'pinching' && e.touches.length === 2) {
                e.preventDefault();
                const dist = getTouchDist(e.touches);
                const newZoom = Math.min(3, Math.max(1, ts.pinchStartZoom * (dist / ts.pinchStartDist)));
                setZoom(newZoom);
                if (newZoom <= 1) setPanOffset({ x: 0, y: 0 });
                return;
            }

            if (ts.mode === 'panning' && e.touches.length === 1) {
                e.preventDefault();
                const dx = e.touches[0].clientX - ts.panStartX;
                const dy = e.touches[0].clientY - ts.panStartY;
                setPanOffset({
                    x: ts.panStartOffsetX + dx,
                    y: ts.panStartOffsetY + dy,
                });
                return;
            }

            if (ts.mode === 'waiting' && e.touches.length === 1) {
                const dx = Math.abs(e.touches[0].clientX - ts.startX);
                const dy = Math.abs(e.touches[0].clientY - ts.startY);
                // If finger moved enough horizontally, commit to swipe
                if (dx > 15 && dx > dy) {
                    e.preventDefault();
                    ts.mode = 'swiping';
                }
            }

            if (ts.mode === 'swiping') {
                e.preventDefault(); // prevent scroll while swiping
            }
        };

        const onEnd = (e) => {
            const ts = touchState.current;

            if (ts.mode === 'swiping') {
                // Completed a swipe – determine direction
                const touch = e.changedTouches[0];
                const dx = touch.clientX - ts.startX;
                const elapsed = Date.now() - ts.startTime;

                if (Math.abs(dx) > SWIPE_THRESHOLD && elapsed < SWIPE_TIME) {
                    if (dx < 0) {
                        bookRef.current?.pageFlip()?.flipNext();
                    } else {
                        bookRef.current?.pageFlip()?.flipPrev();
                    }
                }
            }

            if (ts.mode === 'pinching') {
                // If fingers lifted and zoom is ~1, snap to 1
                if (zoomRef.current <= 1.05) {
                    setZoom(1);
                    setPanOffset({ x: 0, y: 0 });
                }
            }

            // Only fully reset when all fingers are up
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
    }, [isMobile]);

    // Fullscreen API
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {
                setIsFullscreen(true);
            });
        } else {
            document.exitFullscreen?.().then(() => setIsFullscreen(false));
        }
    }, []);

    useEffect(() => {
        const onFsChange = () => {
            if (!document.fullscreenElement) setIsFullscreen(false);
        };
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    const onFlip = (e) => setCurrentPage(e.data);
    const goBack = () => bookRef.current?.pageFlip()?.flipPrev();
    const goForward = () => bookRef.current?.pageFlip()?.flipNext();
    const resetZoom = () => { setZoom(1); setPanOffset({ x: 0, y: 0 }); };

    if (!ready) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                <div style={{
                    width: '40px', height: '40px',
                    border: '3px solid rgba(18,115,105,0.2)',
                    borderTopColor: '#127369',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const btnStyle = (disabled) => ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '1px solid rgba(18,115,105,0.3)',
        background: 'rgba(18,115,105,0.08)',
        color: '#127369',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s',
        fontSize: '20px',
    });

    const containerWidth = isMobile ? dimensions.width : dimensions.width * 2;

    return (
        <div
            ref={containerRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                ...(isFullscreen ? {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: '#0a0a0a',
                    justifyContent: 'center',
                    padding: '16px',
                } : {}),
            }}
        >
            {title && !isFullscreen && (
                <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    textAlign: 'center',
                    margin: 0,
                    opacity: 0.85,
                }}>
                    {title}
                </h2>
            )}

            {/* Flipbook area */}
            <div
                style={{
                    position: 'relative',
                    width: containerWidth + 'px',
                    height: dimensions.height + 'px',
                    overflow: 'hidden',
                    flexShrink: 0,
                }}
            >
                {/* Zoom/pan wrapper */}
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                        transformOrigin: 'center center',
                        transition: touchState.current.mode === 'pinching' || touchState.current.mode === 'panning'
                            ? 'none' : 'transform 0.2s ease-out',
                    }}
                >
                    <HTMLFlipBook
                        width={dimensions.width}
                        height={dimensions.height}
                        size="fixed"
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={false}
                        onFlip={onFlip}
                        ref={bookRef}
                        style={{}}
                        drawShadow={true}
                        flippingTime={800}
                        usePortrait={isMobile}
                        startPage={0}
                        autoSize={false}
                        clickEventForward={!isMobile}
                        useMouseEvents={!isMobile}
                        showPageCorners={!isMobile}
                    >
                        {pages.map((src, i) => (
                            <Page
                                key={i}
                                src={src}
                                alt={`Página ${i + 1}`}
                                pageNumber={i + 1}
                                totalPages={pageCount}
                            />
                        ))}
                    </HTMLFlipBook>
                </div>

                {/* Mobile touch overlay – intercepts ALL touch events on mobile */}
                {isMobile && (
                    <div
                        ref={overlayRef}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 20,
                            touchAction: 'none',
                            cursor: zoom > 1 ? 'grab' : 'default',
                        }}
                    />
                )}
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: 'center',
            }}>
                <button onClick={goBack} disabled={currentPage === 0} aria-label="Página anterior"
                    style={btnStyle(currentPage === 0)}>‹</button>

                <span style={{
                    fontSize: '0.875rem',
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: '80px',
                    textAlign: 'center',
                    opacity: 0.7,
                    color: isFullscreen ? '#ccc' : 'inherit',
                }}>
                    {currentPage + 1} / {pageCount}
                </span>

                <button onClick={goForward} disabled={currentPage >= pageCount - 1}
                    aria-label="Página siguiente"
                    style={btnStyle(currentPage >= pageCount - 1)}>›</button>

                {zoom > 1 && (
                    <button onClick={resetZoom} aria-label="Resetear zoom"
                        title="Resetear zoom"
                        style={{ ...btnStyle(false), fontSize: '14px' }}>
                        1:1
                    </button>
                )}

                <button
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                    title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                    style={{ ...btnStyle(false), marginLeft: '4px' }}
                >
                    {isFullscreen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
                            <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                            <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    )}
                </button>
            </div>

            {isMobile && zoom <= 1 && (
                <p style={{
                    fontSize: '0.75rem',
                    opacity: 0.45,
                    margin: 0,
                    color: isFullscreen ? '#999' : 'inherit',
                }}>
                    Pellizca para hacer zoom · Desliza para pasar página
                </p>
            )}

            <style>{`
        .magazine-page {
          position: relative;
          background: #fff;
          overflow: hidden;
        }
        .magazine-page img {
          -webkit-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
      `}</style>
        </div>
    );
}
