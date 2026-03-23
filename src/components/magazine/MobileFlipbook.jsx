import React, { useState, useEffect, useRef, useCallback } from 'react';
import FlipBook from './FlipBook';
import { getPageUrls, Page } from './MagazineFlipbook';

function getTouchDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getTouchMidpoint(t1, t2) {
    return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
    };
}

export default function MobileFlipbook({ folder, pageCount, filePattern, title }) {
    const flipBookRootRef = useRef(null);
    const flipBookInstance = useRef(null);
    const containerRef = useRef(null);
    const flipbookWrapperRef = useRef(null);
    const overlayRef = useRef(null);

    const [dims, setDims] = useState({ bookWidth: 800, wrapperWidth: 400, height: 566 });
    const [currentPage, setCurrentPage] = useState(0);
    const [ready, setReady] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const isFullscreenRef = useRef(false);

    // Zoom state
    const [zoomScale, setZoomScale] = useState(1);
    const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
    const [isPinching, setIsPinching] = useState(false);

    const touchState = useRef({
        mode: 'none', startX: 0, startY: 0, startTime: 0, pinchStartDist: 0, pinchStartScale: 1,
    });
    const zoomScaleRef = useRef(zoomScale);
    useEffect(() => { zoomScaleRef.current = zoomScale; }, [zoomScale]);

    const pages = getPageUrls(folder, pageCount, filePattern);

    const calcDimensions = useCallback((containerWidth) => {
        const ASPECT = 1.414;
        const w = containerWidth - 16;
        return { bookWidth: w * 2, wrapperWidth: w, height: Math.round(w * ASPECT) };
    }, []);

    const handleResize = useCallback(() => {
        if (containerRef.current) {
            setDims(calcDimensions(containerRef.current.offsetWidth));
        }
    }, [calcDimensions]);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        const t = setTimeout(() => setReady(true), 100);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(t);
        };
    }, [handleResize]);

    // Init Vanilla FlipBook
    useEffect(() => {
        if (ready && flipBookRootRef.current && !flipBookInstance.current) {
            flipBookInstance.current = new FlipBook(flipBookRootRef.current, {
                canClose: true,
                arrowKeys: false, // Disable native arrow keys on mobile so they don't jump pages
                initialActivePage: 0,
                width: dims.bookWidth + 'px',
                height: dims.height + 'px',
                onPageTurn: (el, { pagesActive }) => {
                    if (pagesActive && pagesActive.length > 0) {
                        const activeIndex = Array.from(el.querySelectorAll('.c-flipbook__page, .hidden-cover')).indexOf(pagesActive[0]);
                        setCurrentPage(Math.max(0, activeIndex));
                    }
                    setZoomScale(1);
                    setZoomOrigin({ x: 50, y: 50 });
                }
            });
        }

        if (flipBookInstance.current && flipBookRootRef.current) {
            flipBookRootRef.current.style.width = dims.bookWidth + 'px';
            flipBookRootRef.current.style.height = dims.height + 'px';
        }
    }, [ready, dims]);

    useEffect(() => {
        const onFsChange = () => {
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
            const fs = !!fsEl;
            setIsFullscreen(fs);
            isFullscreenRef.current = fs;
            setTimeout(handleResize, 100);
        };
        document.addEventListener('fullscreenchange', onFsChange);
        document.addEventListener('webkitfullscreenchange', onFsChange);
        return () => {
            document.removeEventListener('fullscreenchange', onFsChange);
            document.removeEventListener('webkitfullscreenchange', onFsChange);
        };
    }, [handleResize]);

    const flipPrev = useCallback(() => {
        if (currentPage <= 0) return;
        if (currentPage % 2 !== 0) { // Left page (1,3). Need to flip physical book backward to reveal right page.
            flipBookInstance.current?.turnPage('back');
        } else { // Right page (2,4). Physical flip already happened. Expose previously turned Left page.
            setCurrentPage(prev => Math.max(0, prev - 1));
        }
    }, [currentPage]);

    const flipNext = useCallback(() => {
        if (currentPage >= pageCount - 1) return;
        if (currentPage % 2 === 0) { // Right page (0,2). Need to flip physical book forward to reveal left page.
            flipBookInstance.current?.turnPage('forward');
        } else { // Left page (1,3). Physical flip already happened. Expose already turned Right page.
            setCurrentPage(prev => Math.min(pageCount - 1, prev + 1));
        }
    }, [currentPage, pageCount]);

    // Touch Handling - High Performance DOM Driven
    const zoomTransformRef = useRef({ scale: 1, x: 50, y: 50 });

    useEffect(() => {
        const el = overlayRef.current;
        if (!el) return;

        const SWIPE_THRESHOLD = 30;
        const SWIPE_TIME = 600;

        const onStart = (e) => {
            const ts = touchState.current;
            if (e.touches.length === 2) {
                e.preventDefault();
                setIsPinching(true);
                ts.mode = 'pinching';
                ts.pinchStartDist = getTouchDistance(e.touches[0], e.touches[1]);
                ts.pinchStartScale = zoomTransformRef.current.scale;

                const rect = el.getBoundingClientRect();
                const mid = getTouchMidpoint(e.touches[0], e.touches[1]);
                const ox = ((mid.x - rect.left) / rect.width) * 100;
                const oy = ((mid.y - rect.top) / rect.height) * 100;

                zoomTransformRef.current.x = ox;
                zoomTransformRef.current.y = oy;

                if (flipbookWrapperRef.current) {
                    flipbookWrapperRef.current.style.transformOrigin = `${ox}% ${oy}%`;
                    flipbookWrapperRef.current.style.transition = 'none';
                }
                return;
            }
            if (e.touches.length === 1) {
                if (zoomTransformRef.current.scale > 1) {
                    e.preventDefault();
                    ts.mode = 'panning';
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
            const inFs = isFullscreenRef.current;

            if (e.touches.length === 2 && ts.mode !== 'pinching') {
                e.preventDefault();
                setIsPinching(true);
                ts.mode = 'pinching';
                ts.pinchStartDist = getTouchDistance(e.touches[0], e.touches[1]);
                ts.pinchStartScale = zoomTransformRef.current.scale;
                if (flipbookWrapperRef.current) {
                    flipbookWrapperRef.current.style.transition = 'none';
                }
                return;
            }

            if (ts.mode === 'pinching' && e.touches.length === 2) {
                e.preventDefault();
                const dist = getTouchDistance(e.touches[0], e.touches[1]);
                const ratio = dist / ts.pinchStartDist;
                const newScale = Math.min(Math.max(ts.pinchStartScale * ratio, 1), 4);

                zoomTransformRef.current.scale = newScale;
                if (flipbookWrapperRef.current) {
                    flipbookWrapperRef.current.style.transform = `scale(${newScale})`;
                }
                return;
            }

            if (ts.mode === 'panning' && e.touches.length === 1) {
                e.preventDefault(); // Prevent body scroll when zoomed
            }

            if (ts.mode === 'waiting' && e.touches.length === 1) {
                const dx = Math.abs(e.touches[0].clientX - ts.startX);
                const dy = Math.abs(e.touches[0].clientY - ts.startY);
                if (dx > 10 || dy > 10) {
                    if (dx > dy * 0.8) {
                        e.preventDefault();
                        ts.mode = 'swiping';
                    } else {
                        ts.mode = inFs ? 'swiping' : 'scrolling';
                    }
                }
            }

            if (ts.mode === 'swiping' || zoomTransformRef.current.scale > 1) e.preventDefault();
        };

        const onEnd = (e) => {
            const ts = touchState.current;
            if (ts.mode === 'swiping') {
                const touch = e.changedTouches[0];
                const dx = touch.clientX - ts.startX;
                const elapsed = Date.now() - ts.startTime;

                if (Math.abs(dx) > SWIPE_THRESHOLD && elapsed < SWIPE_TIME) {
                    if (dx < 0) flipNext();
                    else flipPrev();
                }
            }

            if (ts.mode === 'pinching') {
                setIsPinching(false);
                let finalScale = zoomTransformRef.current.scale;

                if (flipbookWrapperRef.current) {
                    flipbookWrapperRef.current.style.transition = 'transform 0.2s ease-out';
                }

                if (finalScale < 1.15) {
                    finalScale = 1;
                    zoomTransformRef.current.scale = 1;
                    zoomTransformRef.current.x = 50;
                    zoomTransformRef.current.y = 50;
                    if (flipbookWrapperRef.current) {
                        flipbookWrapperRef.current.style.transform = 'none';
                        flipbookWrapperRef.current.style.transformOrigin = 'center center';
                    }
                }
                setZoomScale(finalScale); // Update UI badge only
            }
            if (e.touches.length === 0) ts.mode = 'none';
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
    }, [flipNext, flipPrev]);

    const toggleFullscreen = async () => {
        const el = containerRef.current;
        if (!el) return;
        try {
            if (!isFullscreen) {
                if (el.requestFullscreen) await el.requestFullscreen();
                else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
            } else {
                if (document.exitFullscreen) await document.exitFullscreen();
                else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
            }
        } catch (err) { }
    };

    const handleDoubleTap = useCallback(() => {
        if (zoomTransformRef.current.scale > 1) {
            zoomTransformRef.current.scale = 1;
            zoomTransformRef.current.x = 50;
            zoomTransformRef.current.y = 50;
            if (flipbookWrapperRef.current) {
                flipbookWrapperRef.current.style.transition = 'transform 0.2s ease-out';
                flipbookWrapperRef.current.style.transform = 'none';
                flipbookWrapperRef.current.style.transformOrigin = 'center center';
            }
            setZoomScale(1);
        }
    }, []);

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
                overflow: 'hidden', // Contain scaled content!
            }}
        >
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

            <div
                ref={flipbookWrapperRef}
                onDoubleClick={handleDoubleTap}
                style={{
                    display: 'flex',
                    width: dims.wrapperWidth,
                    margin: '0 auto',
                    alignItems: 'center',
                    minHeight: isFullscreen ? 'auto' : dims.height + 40,
                    flex: isFullscreen ? '1' : 'none',
                    position: 'relative',
                    touchAction: isFullscreen ? 'none' : 'pan-y',
                    overscrollBehavior: 'contain',
                    overscrollBehaviorX: 'none',
                    transformStyle: 'preserve-3d', // Safari compatibility
                    zIndex: zoomScale > 1 ? 50 : 1, // Float over UI
                    willChange: 'transform',
                }}
            >
                {ready && (
                    <div
                        ref={flipBookRootRef}
                        className="c-flipbook magazine-flipbook is-mobile"
                        style={{
                            width: dims.bookWidth,
                            height: dims.height,
                            position: 'relative',
                            left: 'auto',
                            top: 'auto',
                            flexShrink: 0,
                            transform: `translateX(${currentPage % 2 === 0 ? '-50%' : '0%'})`,
                            transition: 'transform 0.6s ease'
                        }}
                    >
                        {pages.map((url, i) => (
                            <Page key={i} src={url} alt={`Página ${i + 1}`} pageNumber={i + 1} totalPages={pageCount} />
                        ))}
                    </div>
                )}

                <div
                    ref={overlayRef}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 20,
                        touchAction: isFullscreen ? 'none' : 'pan-y',
                        overscrollBehavior: 'contain',
                        overscrollBehaviorX: 'none',
                        cursor: zoomScale > 1 ? 'grab' : 'default',
                    }}
                />

                {!ready && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: dims.wrapperWidth,
                            height: dims.height,
                            background: '#10403b',
                            borderRadius: '8px',
                            position: 'absolute',
                            zIndex: 10,
                        }}
                    >
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8aa6a3" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                    </div>
                )}

                {zoomScale > 1 && (
                    <div
                        style={{
                            position: 'absolute', top: '8px', right: '8px',
                            background: 'rgba(16, 64, 59, 0.85)', color: '#8aa6a3',
                            padding: '4px 10px', borderRadius: '12px',
                            fontSize: '12px', fontFamily: 'Inter, sans-serif',
                            zIndex: 30, pointerEvents: 'none',
                        }}
                    >
                        {Math.round(zoomScale * 100)}%
                    </div>
                )}
            </div>

            <div
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '16px', marginTop: isFullscreen ? '12px' : '20px', flexWrap: 'wrap',
                }}
            >
                <button onClick={flipPrev} aria-label="Anterior" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #396d67', background: 'transparent', color: '#127369', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.background = '#127369'; e.currentTarget.style.color = '#f0f0f0'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#127369'; }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <button onClick={flipNext} aria-label="Siguiente" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #396d67', background: 'transparent', color: '#127369', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.background = '#127369'; e.currentTarget.style.color = '#f0f0f0'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#127369'; }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
                <button onClick={toggleFullscreen} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #396d67', background: isFullscreen ? '#127369' : 'transparent', color: isFullscreen ? '#f0f0f0' : '#127369', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    {isFullscreen ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
                    )}
                </button>
            </div>
            <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: '#637371', fontFamily: 'Inter, sans-serif' }}>
                Desliza para cambiar de página · Pellizca para hacer zoom
            </p>
        </div>
    );
}
