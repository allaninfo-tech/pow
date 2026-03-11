'use client';

import { useStore } from '@/lib/store';
import { cn, formatRelativeTime } from '@/lib/utils';
import { X, Zap, Trophy, Users, Star, Bell, CheckCheck } from 'lucide-react';

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

type NotificationType = keyof typeof typeIcons;

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    time: string;
    read: boolean;
}

export default function NotificationsPanel() {
    const { ui, toggleNotifications, markNotificationsRead, unreadNotifications } = useStore();

    // Real notifications will be fetched from DB. For now, new users have none.
    const notifications: Notification[] = [];

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

                {/* Notifications list or empty state */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => {
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
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center py-16">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                                <Bell size={24} className="text-slate-700" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-400">No notifications yet</p>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    You&apos;ll be notified when challenges are posted, your submissions are scored, or you receive squad invites.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/[0.06]">
                    <button className="w-full py-2.5 rounded-xl text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all">
                        Notification Settings
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
