import React, { useState, useEffect } from 'react';
import DesktopFlipbook from './DesktopFlipbook';
import MobileFlipbook from './MobileFlipbook';
import './flipbook.css';

/**
 * Generates page image URLs from the magazine data.
 */
export function getPageUrls(folder, pageCount, filePattern) {
    return Array.from({ length: pageCount }, (_, i) => {
        const num = String(i + 1).padStart(4, '0');
        return `${folder}/${filePattern.replace('{NUM}', num)}`;
    });
}

/**
 * A shared single page component
 */
export const Page = React.memo(({ src, alt, pageNumber, totalPages }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className="c-flipbook__page" style={{ background: '#0b2b27' }}>
            {!loaded && (
                <div
                    style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', background: '#10403b',
                    }}
                >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8aa6a3" strokeWidth="2" className="animate-spin">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                </div>
            )}
            <img
                src={src} alt={alt} loading="lazy" onLoad={() => setLoaded(true)}
                className="c-flipbook-image"
                style={{ height: '100%', objectFit: 'contain', opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
            />
            <span
                style={{
                    position: 'absolute', bottom: '8px',
                    right: pageNumber % 2 === 0 ? 'auto' : '12px',
                    left: pageNumber % 2 !== 0 ? 'auto' : '12px',
                    fontSize: '11px', color: '#8aa6a3', fontFamily: 'Inter, sans-serif',
                    userSelect: 'none', zIndex: 10
                }}
            >
                {pageNumber} / {totalPages}
            </span>
        </div>
    );
});

export default function MagazineFlipbook(props) {
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile(); // Check immediately on mount
        
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Prevent hydration mismatch or incorrect sizing before mount
    if (!mounted) return null;

    return (
        <>
            {isMobile ? (
                <MobileFlipbook {...props} />
            ) : (
                <DesktopFlipbook {...props} />
            )}
            
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin { animation: spin 1s linear infinite; }
                .magazine-flipbook { border-radius: 4px; }
                .magazine-flipbook.is-mobile.at-front-cover,
                .magazine-flipbook.is-mobile.at-rear-cover { left: 0 !important; }
                .magazine-flipbook, .magazine-flipbook * { -webkit-user-select: none; user-select: none; }
            `}</style>
        </>
    );
}

