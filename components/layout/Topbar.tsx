'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Bell, Menu, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import NotificationBell from '@/components/ui/NotificationBell';

const breadcrumbMap: Record<string, string> = {
    dashboard: 'Dashboard',
    challenges: 'Challenges',
    leaderboard: 'Leaderboard',
    squad: 'Squad',
    profile: 'Profile',
    resume: 'Resume Generator',
    submit: 'Submit',
    settings: 'Settings',
    auth: 'Authentication',
    admin: 'Admin',
};

function Breadcrumb() {
    const pathname = usePathname();
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    return (
        <nav className="flex items-center gap-1.5 text-sm">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">
                Home
            </Link>
            {parts.map((part, i) => {
                const label = breadcrumbMap[part] || decodeURIComponent(part);
                const isLast = i === parts.length - 1;
                return (
                    <span key={i} className="flex items-center gap-1.5">
                        <ChevronRight size={14} className="text-slate-600" />
                        {isLast ? (
                            <span className="text-slate-300 font-medium">{label}</span>
                        ) : (
                            <Link href={'/' + parts.slice(0, i + 1).join('/')} className="text-slate-500 hover:text-slate-300 transition-colors">
                                {label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}

export default function Topbar() {
    const { toggleSidebar } = useStore();
    const [userId, setUserId] = useState<string | null>(null);

    // Fetch current user id
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id);
        });
    }, []);

    return (
        <header className="topbar-container h-16 border-b flex items-center gap-4 px-6 sticky top-0 z-30 backdrop-blur-xl">
            {/* Mobile menu toggle */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all"
                aria-label="Toggle sidebar"
            >
                <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="flex-1 hidden sm:block">
                <Breadcrumb />
            </div>

            {/* Notifications bell */}
            <NotificationBell userId={userId} />
        </header>
    );
}
