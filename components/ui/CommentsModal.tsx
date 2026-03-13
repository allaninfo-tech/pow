'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { cn, formatRelativeTime } from '@/lib/utils';
import { X, MessageSquare, Send, Loader2 } from 'lucide-react';
import Avatar from './Avatar';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    users: { display_name: string; avatar: string | null } | null;
}

interface Props {
    challengeId: string;
    challengeTitle: string;
    userId: string | null;
    onClose: () => void;
}

export default function CommentsModal({ challengeId, challengeTitle, userId, onClose }: Props) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const supabase = createClient();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const scrollToBottom = () => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // Initial fetch
    useEffect(() => {
        const fetchComments = async () => {
            const { data } = await supabase
                .from('challenge_comments')
                .select(`id, content, created_at, user_id, users (display_name, avatar)`)
                .eq('challenge_id', challengeId)
                .order('created_at', { ascending: true });

            if (data) setComments(data as Comment[]);
            setLoading(false);
            scrollToBottom();
        };
        fetchComments();
    }, [challengeId]);

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel(`challenge-comments-modal-${challengeId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'challenge_comments',
                filter: `challenge_id=eq.${challengeId}`,
            }, async (payload: any) => {
                // fetch profile for the new commenter
                const { data: uData } = await supabase
                    .from('users')
                    .select('display_name, avatar')
                    .eq('id', payload.new.user_id)
                    .single();

                const newComment: Comment = {
                    id: payload.new.id,
                    content: payload.new.content,
                    created_at: payload.new.created_at,
                    user_id: payload.new.user_id,
                    users: uData || { display_name: 'Unknown', avatar: null },
                };

                setComments(prev => {
                    if (prev.some(c => c.id === newComment.id)) return prev;
                    return [...prev, newComment];
                });
                scrollToBottom();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [challengeId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !newMessage.trim() || sending) return;

        const val = newMessage.trim();
        setNewMessage('');
        setSending(true);

        const tempId = crypto.randomUUID();
        const { data: myProfile } = await supabase.from('users').select('display_name, avatar').eq('id', userId).single();

        const optimistic: Comment = {
            id: tempId,
            content: val,
            created_at: new Date().toISOString(),
            user_id: userId,
            users: myProfile || { display_name: 'Me', avatar: null },
        };
        setComments(prev => [...prev, optimistic]);
        scrollToBottom();

        const { data, error } = await supabase
            .from('challenge_comments')
            .insert({ challenge_id: challengeId, user_id: userId, content: val })
            .select()
            .single();

        if (error) {
            setComments(prev => prev.filter(c => c.id !== tempId));
        } else if (data) {
            setComments(prev => prev.map(c => c.id === tempId ? { ...c, id: data.id } : c));
        }

        setSending(false);
    };

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="glass-card w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                style={{ height: 'min(600px, 88vh)' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/[0.08] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <MessageSquare size={16} className="text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">Discussion</h2>
                            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[260px]">{challengeTitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 size={24} className="text-indigo-500 animate-spin" />
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                            <MessageSquare size={32} className="text-slate-600 mb-3" />
                            <p className="text-sm text-slate-400">No comments yet.</p>
                            <p className="text-xs text-slate-500 mt-1">Be the first to start the discussion!</p>
                        </div>
                    ) : (
                        comments.map((c) => {
                            const isMe = c.user_id === userId;
                            const initials = c.users?.display_name?.substring(0, 2).toUpperCase() || 'U';
                            return (
                                <div key={c.id} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
                                    <div className="flex-shrink-0 mt-1">
                                        <Avatar initials={initials} photoUrl={c.users?.avatar ?? undefined} size="sm" />
                                    </div>
                                    <div className={cn("flex flex-col max-w-[85%]", isMe ? "items-end" : "items-start")}>
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-xs font-medium text-slate-400">
                                                {isMe ? 'You' : c.users?.display_name}
                                            </span>
                                            <span className="text-[10px] text-slate-600">
                                                {formatRelativeTime(c.created_at)}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words",
                                            isMe
                                                ? "bg-indigo-600 text-white rounded-tr-sm"
                                                : "bg-slate-800 text-slate-200 border border-white/[0.05] rounded-tl-sm"
                                        )}>
                                            {c.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/[0.05] flex-shrink-0">
                    {userId ? (
                        <form onSubmit={handleSend} className="relative">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e as React.FormEvent);
                                    }
                                }}
                                placeholder="Add a comment… (Enter to send, Shift+Enter for newline)"
                                className="w-full bg-slate-800 border border-white/[0.06] rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                                rows={2}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className={cn(
                                    "absolute right-2.5 bottom-2.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                    newMessage.trim()
                                        ? "bg-indigo-500 text-white hover:bg-indigo-400"
                                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                                )}
                            >
                                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className={newMessage.trim() ? "ml-0.5" : ""} />}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-3 px-4 rounded-xl bg-slate-800 border border-slate-700">
                            <p className="text-sm text-slate-400">
                                <a href="/auth" className="text-indigo-400 hover:underline">Sign in</a> to join the discussion.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
