import React, { useRef, useState, useEffect, forwardRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';

/**
 * Wrapper para cada página – react-pageflip requiere forwardRef.
 */
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
    const zoomRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [dimensions, setDimensions] = useState({ width: 550, height: 733 });
    const [ready, setReady] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Zoom state
    const [zoom, setZoom] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const pinchStartDist = useRef(null);
    const pinchStartZoom = useRef(1);
    const panStart = useRef(null);
    const panStartOffset = useRef({ x: 0, y: 0 });

    // Generar URLs de las páginas
    const pages = Array.from({ length: pageCount }, (_, i) => {
        const num = String(i + 1).padStart(5, '0');
        return `${folder}/${filePattern.replace('{NUM}', num)}`;
    });

    // Calcular dimensiones basado en el viewport
    // En modo landscape (usePortrait=false), width/height = dimensión de UNA página.
    // El flipbook muestra dos páginas lado a lado automáticamente.
    const calcDimensions = useCallback((fullscreen = false) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const ratio = 1.5; // aspect ratio (height/width) de las páginas
        const mobile = w < 768;

        if (fullscreen) {
            const availH = h - 80;
            if (mobile) {
                // Fullscreen móvil: una sola página, todo el ancho
                const pageW = w - 10;
                const pageH = Math.min(Math.round(pageW * ratio), availH);
                return { width: pageW, height: pageH, mobile };
            }
            // Fullscreen desktop: dos páginas lado a lado
            const pageH = availH;
            const pageW = Math.round(pageH / ratio);
            // Verificar que 2 páginas quepan en el ancho
            if (pageW * 2 > w - 40) {
                const adjustedW = Math.round((w - 40) / 2);
                return { width: adjustedW, height: Math.round(adjustedW * ratio), mobile };
            }
            return { width: pageW, height: pageH, mobile };
        }

        if (mobile) {
            // Móvil: portrait, usar todo el ancho
            const mobileW = w - 16;
            return { width: mobileW, height: Math.round(mobileW * ratio), mobile };
        } else if (w < 1280) {
            // Tablet/laptop: dos páginas, cada una ~380px ancho
            const pageW = Math.min(380, Math.round((w - 80) / 2));
            return { width: pageW, height: Math.round(pageW * ratio), mobile };
        }
        // Desktop grande: dos páginas, cada una 450px
        return { width: 450, height: Math.round(450 * ratio), mobile };
    }, []);

    // Responsividad
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

    // Reset zoom when page changes or fullscreen toggles
    useEffect(() => {
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
    }, [currentPage, isFullscreen]);

    // Pinch-to-zoom handlers
    const getTouchDist = (touches) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = useCallback((e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            pinchStartDist.current = getTouchDist(e.touches);
            pinchStartZoom.current = zoom;
        } else if (e.touches.length === 1 && zoom > 1) {
            panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            panStartOffset.current = { ...panOffset };
        }
    }, [zoom, panOffset]);

    const onTouchMove = useCallback((e) => {
        if (e.touches.length === 2 && pinchStartDist.current) {
            e.preventDefault();
            const dist = getTouchDist(e.touches);
            const newZoom = Math.min(3, Math.max(1, pinchStartZoom.current * (dist / pinchStartDist.current)));
            setZoom(newZoom);
            if (newZoom <= 1) setPanOffset({ x: 0, y: 0 });
        } else if (e.touches.length === 1 && zoom > 1 && panStart.current) {
            const dx = e.touches[0].clientX - panStart.current.x;
            const dy = e.touches[0].clientY - panStart.current.y;
            setPanOffset({
                x: panStartOffset.current.x + dx,
                y: panStartOffset.current.y + dy,
            });
        }
    }, [zoom]);

    const onTouchEnd = useCallback(() => {
        pinchStartDist.current = null;
        panStart.current = null;
    }, []);

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
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
            }
        };
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    const onFlip = (e) => setCurrentPage(e.data);
    const goBack = () => bookRef.current?.pageFlip()?.flipPrev();
    const goForward = () => bookRef.current?.pageFlip()?.flipNext();

    const resetZoom = () => {
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
    };

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

    // Ancho total del contenedor:
    // - portrait (móvil): igual al ancho de una página
    // - landscape (desktop): 2x ancho de página (el flipbook muestra dos)
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
            {/* Title (hidden in fullscreen) */}
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

            {/* Flipbook container */}
            <div
                ref={zoomRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                    position: 'relative',
                    width: containerWidth + 'px',
                    height: dimensions.height + 'px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    touchAction: zoom > 1 ? 'none' : 'pan-y',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                        transformOrigin: 'center center',
                        transition: pinchStartDist.current ? 'none' : 'transform 0.15s ease-out',
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
                        clickEventForward={true}
                        useMouseEvents={true}
                        showPageCorners={true}
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

                {/* Zoom controls (mobile) */}
                {zoom > 1 && (
                    <button onClick={resetZoom} aria-label="Resetear zoom"
                        title="Resetear zoom"
                        style={{ ...btnStyle(false), fontSize: '14px' }}>
                        1:1
                    </button>
                )}

                {/* Fullscreen toggle */}
                <button
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                    title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                    style={{
                        ...btnStyle(false),
                        marginLeft: '4px',
                    }}
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

            {/* Hint de zoom en móvil */}
            {isMobile && zoom <= 1 && (
                <p style={{
                    fontSize: '0.75rem',
                    opacity: 0.45,
                    margin: 0,
                    color: isFullscreen ? '#999' : 'inherit',
                }}>
                    Pellizca para hacer zoom
                </p>
            )}

            <style>{`
        .magazine-flipbook {
          margin: 0 auto;
        }
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
