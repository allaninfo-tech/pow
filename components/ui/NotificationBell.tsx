'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, Check, Loader2 } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string | null;
    link: string | null;
    read: boolean;
    created_at: string;
}

export default function NotificationBell({ userId }: { userId: string | null }) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initial fetch of unread count and latest notifications
    useEffect(() => {
        if (!userId) return;

        const fetchNotifications = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                const formattedData: Notification[] = data.map(n => ({
                    ...n,
                    read: !!n.read,
                    created_at: n.created_at || new Date().toISOString(),
                    link: n.link || null
                }));
                setNotifications(formattedData);
                setUnreadCount(formattedData.filter(n => !n.read).length);
            }
            setLoading(false);
            setInitialLoadDone(true);
        };

        fetchNotifications();
    }, [userId]);

    // Realtime subscription
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`notifications-${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                const newNotification = payload.new as Notification;
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                const updated = payload.new as Notification;
                setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n));
                // Recalculate unread count
                setUnreadCount(prev => updated.read ? Math.max(0, prev - 1) : prev + 1);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    const markAsRead = async (id: string, currentRead: boolean) => {
        if (currentRead) return;
        
        // Optimistic UI
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
    };

    const markAllAsRead = async () => {
        if (!userId || unreadCount === 0) return;

        // Optimistic UI
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);
    };

    if (!userId) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    "relative p-2 rounded-xl transition-all",
                    open ? "bg-white/[0.1] text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                )}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-[var(--bg-primary)]" />
                )}
            </button>

            {open && (
                <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
                            >
                                <Check size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[min(400px,60vh)] overflow-y-auto custom-scrollbar">
                        {!initialLoadDone || loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 size={24} className="animate-spin text-indigo-500" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                                <Bell size={32} className="mb-3 text-slate-600" />
                                <p className="text-sm text-slate-400">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.04]">
                                {notifications.map((n) => {
                                    const content = (
                                        <div className={cn(
                                            "p-4 transition-colors relative flex gap-3",
                                            n.read ? "hover:bg-white/[0.02]" : "bg-indigo-500/[0.03] hover:bg-indigo-500/[0.06]"
                                        )}>
                                            {!n.read && (
                                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-sm mb-1", n.read ? "text-slate-300" : "text-white font-medium")}>
                                                    {n.title}
                                                </p>
                                                {n.message && (
                                                    <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-slate-600 font-medium">
                                                    {formatRelativeTime(n.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    );

                                    return n.link ? (
                                        <Link 
                                            key={n.id} 
                                            href={n.link as string}
                                            onClick={() => {
                                                markAsRead(n.id, n.read);
                                                setOpen(false);
                                            }}
                                            className="block"
                                        >
                                            {content}
                                        </Link>
                                    ) : (
                                        <button 
                                            key={n.id}
                                            className="w-full text-left"
                                            onClick={() => markAsRead(n.id, n.read)}
                                        >
                                            {content}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
