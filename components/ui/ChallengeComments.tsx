'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn, formatRelativeTime, getAvatarColor } from '@/lib/utils';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import Avatar from './Avatar';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    users: {
        display_name: string;
        avatar: string | null;
    } | null;
}

interface Props {
    challengeId: string;
    userId: string | null;
}

export default function ChallengeComments({ challengeId, userId }: Props) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const supabase = createClient();
    const commentsEndRef = useRef<HTMLDivElement>(null);

    // Initial fetch
    useEffect(() => {
        const fetchComments = async () => {
            const { data } = await supabase
                .from('challenge_comments')
                .select(`
                    id, content, created_at, user_id,
                    users (display_name, avatar)
                `)
                .eq('challenge_id', challengeId)
                .order('created_at', { ascending: true }); // older first

            if (data) setComments(data as Comment[]);
            setLoading(false);
            scrollToBottom();
        };

        fetchComments();
    }, [challengeId, supabase]);

    // Setup realtime subscription
    useEffect(() => {
        const fetchUserForComment = async (payload: any) => {
            // we got a new comment row, but it lacks the 'users' join.
            // if it's our own comment, we handle it optimistically inside handleSend,
            // but this catches comments from others.
            
            // if we already have it optimistically, ignore
            if (comments.some(c => c.id === payload.new.id)) return;

            const { data: userData } = await supabase
                .from('users')
                .select('display_name, avatar')
                .eq('id', payload.new.user_id)
                .single();

            const newC: Comment = {
                id: payload.new.id,
                content: payload.new.content,
                created_at: payload.new.created_at,
                user_id: payload.new.user_id,
                users: userData || { display_name: 'Unknown', avatar: null }
            };

            setComments(prev => {
                if (prev.some(c => c.id === newC.id)) return prev;
                return [...prev, newC];
            });
            scrollToBottom();
        };

        const channel = supabase
            .channel(`challenge-comments-${challengeId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'challenge_comments',
                    filter: `challenge_id=eq.${challengeId}`
                },
                (payload) => {
                    fetchUserForComment(payload);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [challengeId, supabase, comments]);

    const scrollToBottom = () => {
        setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !newMessage.trim() || sending) return;

        const val = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Optimistic UI for ourselves
        const tempId = crypto.randomUUID();
        const { data: myProfile } = await supabase.from('users').select('display_name, avatar').eq('id', userId).single();
        
        const optimisticComment: Comment = {
            id: tempId,
            content: val,
            created_at: new Date().toISOString(),
            user_id: userId,
            users: myProfile || { display_name: 'Me', avatar: null }
        };
        setComments(prev => [...prev, optimisticComment]);
        scrollToBottom();

        // Actual insert
        const { data, error } = await supabase
            .from('challenge_comments')
            .insert({
                challenge_id: challengeId,
                user_id: userId,
                content: val
            })
            .select()
            .single();

        if (error) {
            // revert if failed
            setComments(prev => prev.filter(c => c.id !== tempId));
        } else if (data) {
            // swap temp ID for real ID silently
            setComments(prev => prev.map(c => c.id === tempId ? { ...c, id: data.id } : c));
        }

        setSending(false);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-white/[0.05] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.05] bg-slate-900/80 backdrop-blur-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <MessageSquare size={16} className="text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-200">Discussion</h3>
                    <p className="text-xs text-slate-500">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</p>
                </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto min-h-[300px] max-h-[500px] space-y-4 custom-scrollbar flex flex-col">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={24} className="text-indigo-500 animate-spin" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                        <MessageSquare size={32} className="text-slate-600 mb-3" />
                        <p className="text-sm text-slate-400">No comments yet.</p>
                        <p className="text-xs text-slate-500 mt-1">Be the first to share your thoughts or ask a question.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1" /> {/* push comments to bottom if few */}
                        {comments.map((c) => {
                            const isMe = c.user_id === userId;
                            const initials = c.users?.display_name?.substring(0, 2).toUpperCase() || 'U';
                            return (
                                <div key={c.id} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
                                    <div className="flex-shrink-0 mt-1">
                                        <Avatar initials={initials} photoUrl={c.users?.avatar} size="sm" />
                                    </div>
                                    <div className={cn(
                                        "flex flex-col max-w-[85%]",
                                        isMe ? "items-end" : "items-start"
                                    )}>
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-xs font-medium text-slate-400">
                                                {isMe ? 'You' : c.users?.display_name}
                                            </span>
                                            <span className="text-[10px] text-slate-600">
                                                {formatRelativeTime(c.created_at)}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                                            isMe 
                                                ? "bg-indigo-600 text-white rounded-tr-sm" 
                                                : "bg-slate-800 text-slate-200 border border-white/[0.05] rounded-tl-sm"
                                        )}>
                                            {c.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
                <div ref={commentsEndRef} />
            </div>

            <div className="p-4 border-t border-white/[0.05] bg-slate-900/80 backdrop-blur-md">
                {userId ? (
                    <form onSubmit={handleSend} className="relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Add a comment... (Press Enter to send)"
                            className="w-full bg-slate-800 border-none rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 resize-none h-[48px] custom-scrollbar overflow-hidden"
                            rows={1}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className={cn(
                                "absolute right-2 top-2 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                newMessage.trim() 
                                    ? "bg-indigo-500 text-white hover:bg-indigo-400" 
                                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                            )}
                        >
                            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className={newMessage.trim() ? "ml-0.5" : ""} />}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-2 px-4 rounded-xl bg-slate-800 border border-slate-700">
                        <p className="text-sm text-slate-400">Sign in to join the discussion.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
