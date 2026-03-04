'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { cn, getLeagueIcon, getAvatarColor } from '@/lib/utils';
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
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/challenges', label: 'Challenges', icon: Zap },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/squad', label: 'My Squad', icon: Users },
    { href: '/profile/dev.user', label: 'Profile', icon: User },
    { href: '/resume', label: 'Resume', icon: FileText },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { ui, toggleSidebar, currentUser, unreadNotifications, toggleNotifications } = useStore();
    const collapsed = ui.sidebarCollapsed;

    return (
        <aside
            className={cn(
                'flex flex-col h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out',
                'border-r border-white/[0.06]',
                'bg-gradient-to-b from-navy-800 to-navy-900',
                collapsed ? 'w-[68px]' : 'w-[240px]'
            )}
            style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #060b14 100%)' }}
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
                            title={collapsed ? label : undefined}
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
                    title={collapsed ? 'Notifications' : undefined}
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

                <Link href="/settings" className={cn('nav-item', collapsed && 'justify-center px-0')}>
                    <Settings size={18} />
                    {!collapsed && <span>Settings</span>}
                </Link>

                {/* User card */}
                <div className={cn(
                    'flex items-center gap-2 p-2 rounded-xl mt-2',
                    'bg-white/[0.03] border border-white/[0.06]',
                    collapsed && 'justify-center'
                )}>
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
                        <button className="text-slate-600 hover:text-rose-400 transition-colors" title="Logout">
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
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>
        </aside>
    );
}
