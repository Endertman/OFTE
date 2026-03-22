import React, { useState, useEffect, useRef, useCallback } from 'react';
import FlipBook from './FlipBook';
import { getPageUrls, Page } from './MagazineFlipbook';

export default function DesktopFlipbook({ folder, pageCount, filePattern, title }) {
    const flipBookRootRef = useRef(null);
    const flipBookInstance = useRef(null);
    const containerRef = useRef(null);
    const flipbookWrapperRef = useRef(null);

    const [dims, setDims] = useState({ width: 800, height: 566 });
    const [currentPage, setCurrentPage] = useState(0);
    const [ready, setReady] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const pages = getPageUrls(folder, pageCount, filePattern);

    const calcDimensions = useCallback((containerWidth) => {
        const ASPECT = 1.414;
        const w = containerWidth < 1024 
            ? Math.round(containerWidth * 0.9) 
            : Math.round(containerWidth * 0.85);
        return { width: w, height: Math.round((w / 2) * ASPECT) };
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
                arrowKeys: true,
                initialActivePage: 0,
                width: dims.width + 'px',
                height: dims.height + 'px',
                onPageTurn: (el, { pagesActive }) => {
                    if (pagesActive && pagesActive.length > 0) {
                        const activeIndex = Array.from(el.querySelectorAll('.c-flipbook__page, .hidden-cover')).indexOf(pagesActive[0]);
                        setCurrentPage(Math.max(0, activeIndex));
                    }
                }
            });
        }
        
        // Update dimensions when resized
        if (flipBookInstance.current && flipBookRootRef.current) {
            flipBookRootRef.current.style.width = dims.width + 'px';
            flipBookRootRef.current.style.height = dims.height + 'px';
        }
    }, [ready, dims]);

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

    const flipPrev = useCallback(() => flipBookInstance.current?.turnPage('back'), []);
    const flipNext = useCallback(() => flipBookInstance.current?.turnPage('forward'), []);

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
        } catch (err) {
            console.warn('Fullscreen not supported:', err);
        }
    };

    let displayPage = currentPage;
    if (currentPage >= pageCount) displayPage = pageCount;
    else if (currentPage <= 0) displayPage = 1;

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
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: isFullscreen ? 'auto' : dims.height + 40,
                    flex: isFullscreen ? '1' : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {ready && (
                    <div 
                        ref={flipBookRootRef} 
                        className="c-flipbook magazine-flipbook"
                        style={{ width: dims.width, height: dims.height, position: 'relative' }}
                    >
                        {pages.map((url, i) => (
                            <Page key={i} src={url} alt={`Página ${i + 1}`} pageNumber={i + 1} totalPages={pageCount} />
                        ))}
                    </div>
                )}

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
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8aa6a3" strokeWidth="2" className="animate-spin">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    </div>
                )}
            </div>

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
                    onMouseEnter={e => { e.currentTarget.style.background = '#127369'; e.currentTarget.style.color = '#f0f0f0'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#127369'; }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>

                <span style={{ fontSize: '0.875rem', color: '#637371', fontFamily: 'Inter, sans-serif', minWidth: '100px', textAlign: 'center', userSelect: 'none' }}>
                    Página {displayPage} de {pageCount}
                </span>

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
                    onMouseEnter={e => { e.currentTarget.style.background = '#127369'; e.currentTarget.style.color = '#f0f0f0'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#127369'; }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>

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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                    )}
                </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: '#637371', fontFamily: 'Inter, sans-serif' }}>
                Usa las flechas ← → o haz clic en las páginas para navegar
            </p>
        </div>
    );
}
