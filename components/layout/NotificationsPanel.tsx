'use client';

import { useStore } from '@/lib/store';
import { cn, formatRelativeTime } from '@/lib/utils';
import { X, Zap, Trophy, Users, Star, Bell, Check, CheckCheck } from 'lucide-react';

const mockNotifications = [
    {
        id: '1',
        type: 'challenge' as const,
        title: 'New Challenge Available',
        description: 'FinTech Real-Time Transaction Dashboard — Tier 4 Expert',
        time: new Date(Date.now() - 1800000).toISOString(),
        read: false,
    },
    {
        id: '2',
        type: 'score' as const,
        title: 'Submission Scored',
        description: 'Your "Developer Portfolio CMS" received an AI score of 77/100',
        time: new Date(Date.now() - 7200000).toISOString(),
        read: false,
    },
    {
        id: '3',
        type: 'squad' as const,
        title: 'Squad Invite',
        description: 'Zara Chen invited you to join "Sigma Protocol"',
        time: new Date(Date.now() - 14400000).toISOString(),
        read: false,
    },
    {
        id: '4',
        type: 'league' as const,
        title: 'League Promotion!',
        description: 'You\'ve been promoted from Newbie to Pro League 🎉',
        time: new Date(Date.now() - 86400000).toISOString(),
        read: true,
    },
    {
        id: '5',
        type: 'challenge' as const,
        title: 'Challenge Deadline Approaching',
        description: 'AI-Powered Supply Chain Optimizer ends in 2 days',
        time: new Date(Date.now() - 172800000).toISOString(),
        read: true,
    },
];

const typeIcons = {
    challenge: Zap,
    score: Star,
    squad: Users,
    league: Trophy,
};

const typeColors = {
    challenge: 'text-indigo-400 bg-indigo-500/15',
    score: 'text-amber-400 bg-amber-500/15',
    squad: 'text-cyan-400 bg-cyan-500/15',
    league: 'text-emerald-400 bg-emerald-500/15',
};

export default function NotificationsPanel() {
    const { ui, toggleNotifications, markNotificationsRead, unreadNotifications } = useStore();

    if (!ui.notificationsOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                onClick={toggleNotifications}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md flex flex-col"
                style={{
                    background: 'linear-gradient(180deg, #0c1220 0%, #060b14 100%)',
                    borderLeft: '1px solid rgba(255,255,255,0.08)',
                    animation: 'slide-in-right 0.25s ease-out',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <Bell size={18} className="text-indigo-400" />
                        <h2 className="text-base font-bold text-white">Notifications</h2>
                        {unreadNotifications > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                                {unreadNotifications} new
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadNotifications > 0 && (
                            <button
                                onClick={markNotificationsRead}
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.04]"
                            >
                                <CheckCheck size={13} /> Mark all read
                            </button>
                        )}
                        <button
                            onClick={toggleNotifications}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Notifications list */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {mockNotifications.map((notif) => {
                        const Icon = typeIcons[notif.type];
                        const colorClass = typeColors[notif.type];
                        return (
                            <div
                                key={notif.id}
                                className={cn(
                                    'flex items-start gap-3 px-5 py-4 border-b border-white/[0.04] transition-all hover:bg-white/[0.02] cursor-pointer',
                                    !notif.read && 'bg-indigo-500/[0.03]'
                                )}
                            >
                                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', colorClass)}>
                                    <Icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={cn('text-sm font-medium', notif.read ? 'text-slate-400' : 'text-slate-200')}>
                                            {notif.title}
                                        </p>
                                        {!notif.read && (
                                            <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.description}</p>
                                    <p className="text-[10px] text-slate-600 mt-1.5">{formatRelativeTime(notif.time)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/[0.06]">
                    <button className="w-full py-2.5 rounded-xl text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all">
                        View All Notifications
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </>
    );
}
