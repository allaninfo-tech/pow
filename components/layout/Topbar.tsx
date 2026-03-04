'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Search, Bell, Menu, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            >
                <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="flex-1 hidden sm:block">
                <Breadcrumb />
            </div>

            {/* Search */}
            <div className="relative hidden md:block">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search challenges, users… (⌘K)"
                    className="input-field pl-9 w-64 text-sm h-9"
                    readOnly
                />
            </div>

            {/* Active challenge indicator */}
            <Link href="/challenges" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 hover:bg-indigo-500/15 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <Zap size={12} />
                4 Active
            </Link>

            {/* Notifications */}
            <button
                onClick={toggleNotifications}
                className={cn(
                    'relative p-2 rounded-lg transition-all',
                    'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
                )}
            >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
            </button>
        </header>
    );
}
