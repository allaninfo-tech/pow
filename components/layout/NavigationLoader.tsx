'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationLoader() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setLoading(true);
        setProgress(0);

        // Fast initial progress
        const t1 = setTimeout(() => setProgress(40), 50);
        const t2 = setTimeout(() => setProgress(70), 200);
        const t3 = setTimeout(() => setProgress(90), 400);
        const t4 = setTimeout(() => { setProgress(100); }, 600);
        const t5 = setTimeout(() => { setLoading(false); setProgress(0); }, 900);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
    }, [pathname]);

    if (!loading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-[2.5px]">
            <div
                className="h-full rounded-r-full transition-all duration-300 ease-out"
                style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #6c63ff 0%, #00d4ff 50%, #6c63ff 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'nav-shimmer 1.2s ease-in-out infinite',
                    boxShadow: '0 0 12px rgba(108,99,255,0.6), 0 0 4px rgba(0,212,255,0.4)',
                }}
            />
        </div>
    );
}
