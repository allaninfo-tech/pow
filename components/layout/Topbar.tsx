'use client';

import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Bell, Menu, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
                            <Link
                                href={'/' + parts.slice(0, i + 1).join('/')}
                                className="text-slate-500 hover:text-slate-300 transition-colors"
                            >
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
    const { ui, toggleSidebar, unreadNotifications, toggleNotifications } = useStore();

    return (
        <header className="topbar-container h-16 border-b flex items-center gap-4 px-6 sticky top-0 z-30 backdrop-blur-xl"
        >
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


            {/* Notifications */}
            <button
                onClick={toggleNotifications}
                className={cn(
                    'relative p-2 rounded-lg transition-all',
                    'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
                )}
                aria-label="View notifications"
            >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
            </button>
        </header>
    );
}
