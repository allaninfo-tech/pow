'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, Loader2, MessageSquare, Shield } from 'lucide-react';
import Avatar from './Avatar';
import { cn, formatRelativeTime } from '@/lib/utils';

interface Message {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    users: {
        display_name: string;
        avatar: string;
    };
}

export default function SquadChat({ squadId, userId }: { squadId: string; userId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        if (!squadId) return;

        const fetchMessages = async () => {
            setLoading(true);
            const { data } = await (supabase as any)
                .from('squad_messages')
                .select(`
                    id, 
                    content, 
                    created_at, 
                    user_id,
                    users (display_name, avatar)
                `)
                .eq('squad_id', squadId)
                .order('created_at', { ascending: true })
                .limit(50);

            if (data) setMessages(data as any);
            setLoading(false);
        };

        fetchMessages();

        // Realtime subscription
        const channel = (supabase as any)
            .channel(`squad-chat-${squadId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'squad_messages',
                filter: `squad_id=eq.${squadId}`
            }, async (payload: any) => {
                // Fetch the user info for the new message
                const { data: userData } = await (supabase as any)
                    .from('users')
                    .select('display_name, avatar')
                    .eq('id', payload.new.user_id)
                    .single();

                const msgWithUser = {
                    ...payload.new,
                    users: userData
                } as Message;

                setMessages(prev => [...prev, msgWithUser]);
            })
            .subscribe();

        return () => { (supabase as any).removeChannel(channel); };
    }, [squadId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const { error } = await (supabase as any)
            .from('squad_messages')
            .insert({
                squad_id: squadId,
                user_id: userId,
                content: newMessage.trim()
            });

        if (!error) {
            setNewMessage('');
        }
        setSending(false);
    };

    return (
        <div className="flex flex-col h-[500px] border border-white/[0.08] bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="px-5 py-3 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white">Squad Comms</h3>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Live</span>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[url('/grid.svg')] bg-repeat"
            >
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                        <Loader2 size={20} className="animate-spin text-indigo-500" />
                        <span className="text-xs text-slate-400">Syncing comms...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                        <Shield size={32} className="mb-2 text-slate-600" />
                        <p className="text-xs text-slate-500">No messages yet.<br />Start the first discussion!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.user_id === userId;
                        return (
                            <div key={msg.id} className={cn(
                                "flex gap-3 max-w-[85%]",
                                isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}>
                                <div className="flex-shrink-0 pt-1">
                                    <Avatar initials={msg.users?.avatar || '?'} size="sm" />
                                </div>
                                <div className={cn(
                                    "flex flex-col",
                                    isMe ? "items-end" : "items-start"
                                )}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-slate-500">
                                            {isMe ? 'You' : msg.users?.display_name}
                                        </span>
                                        <span className="text-[9px] text-slate-600">
                                            {formatRelativeTime(msg.created_at)}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-2 rounded-2xl text-sm leading-relaxed",
                                        isMe 
                                            ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/10" 
                                            : "bg-white/5 text-slate-200 border border-white/5 rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white/[0.02] border-t border-white/[0.08]">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-4 pr-12 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="absolute right-1.5 top-1.5 w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </div>
            </form>
        </div>
    );
}
