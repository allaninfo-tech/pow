'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { cn, formatRelativeTime } from '@/lib/utils';
import { X, Zap, Trophy, Users, Star, Bell, CheckCheck, Megaphone, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ─── Notification types (future activity feed) ────────────────────────────────
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

type NotifTab = 'notifications' | 'announcements';

interface Announcement {
    id: string;
    title: string;
    body: string;
    created_at: string;
    is_active: boolean;
}

export default function NotificationsPanel() {
    const { ui, toggleNotifications, markNotificationsRead, unreadNotifications } = useStore();
    const [tab, setTab] = useState<NotifTab>('notifications');
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);
    const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

    // Fetch active announcements whenever panel opens
    useEffect(() => {
        if (!ui.notificationsOpen) return;
        setLoading(true);
        const supabase = createClient();
        (supabase as any)
            .from('platform_announcements')
            .select('id, title, body, created_at, is_active')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(20)
            .then(({ data }: { data: Announcement[] | null }) => {
                setAnnouncements(data || []);
                setLoading(false);
            });
    }, [ui.notificationsOpen]);

    // Mark announcements as "seen" when switching to that tab
    const handleTabClick = (t: NotifTab) => {
        setTab(t);
        if (t === 'announcements') {
            setSeenIds(new Set(announcements.map(a => a.id)));
        }
    };

    // Unread announcements = active ones we haven't seen yet
    const unseenCount = announcements.filter(a => !seenIds.has(a.id)).length;

    if (!ui.notificationsOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                onClick={toggleNotifications}
            />

            {/* Panel */}
            <div
                className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md flex flex-col"
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
                        {(unreadNotifications > 0 || unseenCount > 0) && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                                {unreadNotifications + unseenCount} new
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

                {/* Tab bar */}
                <div className="flex border-b border-white/[0.06]">
                    <button
                        onClick={() => handleTabClick('notifications')}
                        className={cn(
                            'flex-1 py-3 text-sm font-medium transition-colors border-b-2',
                            tab === 'notifications'
                                ? 'text-indigo-400 border-indigo-500'
                                : 'text-slate-500 border-transparent hover:text-slate-300'
                        )}
                    >
                        Activity
                    </button>
                    <button
                        onClick={() => handleTabClick('announcements')}
                        className={cn(
                            'flex-1 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2',
                            tab === 'announcements'
                                ? 'text-violet-400 border-violet-500'
                                : 'text-slate-500 border-transparent hover:text-slate-300'
                        )}
                    >
                        Announcements
                        {unseenCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center">
                                {unseenCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">

                    {/* ── Activity Tab ── */}
                    {tab === 'notifications' && (
                        <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center py-16">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                                <Bell size={24} className="text-slate-700" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-400">No activity yet</p>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    You&apos;ll be notified when challenges are posted, your submissions are scored, or you receive squad invites.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── Announcements Tab ── */}
                    {tab === 'announcements' && (
                        <div>
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 size={20} className="text-slate-600 animate-spin" />
                                </div>
                            ) : announcements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center py-16">
                                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                                        <Megaphone size={24} className="text-slate-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-400">No announcements</p>
                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                            Platform announcements from admins will appear here.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                announcements.map((a) => {
                                    const isNew = !seenIds.has(a.id);
                                    return (
                                        <div
                                            key={a.id}
                                            className={cn(
                                                'flex items-start gap-3 px-5 py-4 border-b border-white/[0.04] transition-all hover:bg-white/[0.02]',
                                                isNew && 'bg-violet-500/[0.04]'
                                            )}
                                        >
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-violet-400 bg-violet-500/15">
                                                <Megaphone size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={cn('text-sm font-medium', isNew ? 'text-slate-200' : 'text-slate-400')}>
                                                        {a.title}
                                                    </p>
                                                    {isNew && (
                                                        <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{a.body}</p>
                                                <p className="text-[10px] text-slate-600 mt-2">
                                                    {formatRelativeTime(a.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/[0.06]">
                    <button
                        onClick={() => { toggleNotifications(); window.location.href = '/settings?tab=notifications'; }}
                        className="w-full py-2.5 rounded-xl text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                    >
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
