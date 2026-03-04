'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import { cn, getLeagueIcon, getAvatarColor } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
    LayoutDashboard,
    Zap,
    Trophy,
    Users,
    User,
    FileText,
    ChevronLeft,
    ChevronRight,
    Bell,
    Settings,
    LogOut,
    Terminal,
    Moon,
    Sun,
    GalleryVerticalEnd,
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/challenges', label: 'Challenges', icon: Zap },
    { href: '/showcase', label: 'Showcase', icon: GalleryVerticalEnd },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/squad', label: 'My Squad', icon: Users },
    { href: '/profile/dev.user', label: 'Profile', icon: User },
    { href: '/resume', label: 'Resume', icon: FileText },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { ui, toggleSidebar, currentUser, unreadNotifications, toggleNotifications } = useStore();
    const { resolvedTheme, setTheme } = useTheme();
    const collapsed = ui.sidebarCollapsed;

    const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
    const [hoverTop, setHoverTop] = useState<number>(0);

    const handleMouseEnter = (e: React.MouseEvent, label: string) => {
        if (!collapsed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverTop(rect.top + rect.height / 2);
        setHoveredLabel(label);
    };

    const handleMouseLeave = () => {
        setHoveredLabel(null);
    };

    return (
        <>
            <aside
                className={cn(
                    'sidebar-container flex flex-col h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out',
                    'border-r',
                    collapsed ? 'w-[68px]' : 'w-[240px]'
                )}
            >
                {/* Logo */}
                <div className={cn(
                    'flex items-center gap-3 p-4 border-b border-white/[0.06] h-16',
                    collapsed && 'justify-center'
                )}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(108,99,255,0.5)]">
                        <Terminal size={16} className="text-white" />
                    </div>
                    {!collapsed && (
                        <div>
                            <span className="text-sm font-bold text-gradient">ProofStack</span>
                            <p className="text-[10px] text-slate-500 leading-none">Engineering Platform</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn('nav-item', isActive && 'active', collapsed && 'justify-center px-0')}
                                aria-label={collapsed ? label : undefined}
                                onMouseEnter={(e) => handleMouseEnter(e, label)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <Icon size={18} className="flex-shrink-0" />
                                {!collapsed && <span>{label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="p-3 border-t border-white/[0.06] space-y-1">
                    {/* Notifications */}
                    <button
                        onClick={toggleNotifications}
                        className={cn('nav-item w-full relative', collapsed && 'justify-center px-0')}
                        aria-label="Notifications"
                        onMouseEnter={(e) => handleMouseEnter(e, 'Notifications')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="relative">
                            <Bell size={18} />
                            {unreadNotifications > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                                    {unreadNotifications}
                                </span>
                            )}
                        </div>
                        {!collapsed && <span>Notifications</span>}
                    </button>

                    <Link
                        href="/settings"
                        className={cn('nav-item', collapsed && 'justify-center px-0')}
                        aria-label={collapsed ? 'Settings' : undefined}
                        onMouseEnter={(e) => handleMouseEnter(e, 'Settings')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <Settings size={18} />
                        {!collapsed && <span>Settings</span>}
                    </Link>

                    {/* Theme toggle */}
                    <button
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        className={cn('nav-item w-full', collapsed && 'justify-center px-0')}
                        aria-label="Toggle theme"
                        onMouseEnter={(e) => handleMouseEnter(e, resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode')}
                        onMouseLeave={handleMouseLeave}
                    >
                        {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        {!collapsed && <span>{resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>

                    {/* User card */}
                    <div className={cn(
                        'flex items-center gap-2 p-2 rounded-xl mt-2',
                        'bg-white/[0.03] border border-white/[0.06]',
                        collapsed && 'justify-center cursor-pointer'
                    )}
                        onMouseEnter={(e) => handleMouseEnter(e, currentUser.displayName)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className={cn(
                            'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
                            getAvatarColor(currentUser.avatar)
                        )}>
                            {currentUser.avatar}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.displayName}</p>
                                <p className="text-[10px] text-slate-500 truncate">
                                    {getLeagueIcon(currentUser.league)} {currentUser.league} League
                                </p>
                            </div>
                        )}
                        {!collapsed && (
                            <button className="text-slate-600 hover:text-rose-400 transition-colors" title="Logout" aria-label="Logout">
                                <LogOut size={14} />
                            </button>
                        )}
                    </div>

                    {/* Collapse toggle */}
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            'flex items-center justify-center w-full p-2 rounded-lg',
                            'text-slate-600 hover:text-slate-400 hover:bg-white/[0.04] transition-all duration-200'
                        )}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        onMouseEnter={(e) => handleMouseEnter(e, collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
                        onMouseLeave={handleMouseLeave}
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>
            </aside>

            {/* Custom Animated Tooltip for Collapsed State */}
            <AnimatePresence>
                {collapsed && hoveredLabel && (
                    <motion.div
                        key={hoveredLabel}
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                        className="fixed left-[72px] z-[100] px-3.5 py-2 bg-slate-800/95 backdrop-blur-sm text-slate-200 text-xs font-semibold rounded-r-lg shadow-xl border border-l-2 border-white/10 border-l-indigo-500 pointer-events-none whitespace-nowrap origin-left"
                        style={{ top: hoverTop, transform: 'translateY(-50%)' }}
                    >
                        {hoveredLabel}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
