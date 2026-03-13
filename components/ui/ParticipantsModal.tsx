'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import Avatar from '@/components/ui/Avatar';
import LeagueBadge from '@/components/ui/LeagueBadge';
import { cn, getRoleShort, getScoreColor } from '@/lib/utils';
import { X, Users, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Participant {
    userId: string;
    username: string;
    displayName: string;
    avatar: string;
    league: string | null;
    role: string | null;
    submissionStatus: string | null;
    totalScore: number;
    submittedAt: string | null;
}

export default function ParticipantsModal({
    challengeId,
    challengeTitle,
    participantsCount,
    onClose,
}: {
    challengeId: string;
    challengeTitle: string;
    participantsCount: number;
    onClose: () => void;
}) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            // Fetch all submissions for this challenge, joined with user info
            const { data } = await supabase
                .from('submissions')
                .select(`
                    user_id,
                    username,
                    status,
                    total_score,
                    submitted_at,
                    users (
                        display_name,
                        username,
                        avatar,
                        league,
                        role
                    )
                `)
                .eq('challenge_id', challengeId)
                .order('total_score', { ascending: false });

            if (data) {
                // Also check participations for users who joined but haven't submitted yet
                const { data: joinedOnly } = await supabase
                    .from('participations')
                    .select(`
                        user_id,
                        joined_at,
                        users (
                            display_name,
                            username,
                            avatar,
                            league,
                            role
                        )
                    `)
                    .eq('challenge_id', challengeId);

                const submissionUserIds = new Set(data.map(s => s.user_id));

                const fromSubmissions: Participant[] = data.map(s => {
                    const u = s.users as any;
                    return {
                        userId: s.user_id || '',
                        username: u?.username || s.username || '',
                        displayName: u?.display_name || s.username || 'Developer',
                        avatar: u?.avatar || null,
                        league: u?.league || null,
                        role: u?.role || null,
                        submissionStatus: s.status,
                        totalScore: Number(s.total_score) || 0,
                        submittedAt: s.submitted_at,
                    };
                });

                const fromJoined: Participant[] = (joinedOnly || [])
                    .filter(j => !submissionUserIds.has(j.user_id))
                    .map(j => {
                        const u = j.users as any;
                        return {
                            userId: j.user_id,
                            username: u?.username || '',
                            displayName: u?.display_name || u?.username || 'Developer',
                            avatar: u?.avatar || null,
                            league: u?.league || null,
                            role: u?.role || null,
                            submissionStatus: null,
                            totalScore: 0,
                            submittedAt: null,
                        };
                    });

                setParticipants([...fromSubmissions, ...fromJoined]);
            }
            setLoading(false);
        }
        load();
    }, [challengeId]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const statusIcon = (status: string | null) => {
        if (status === 'Completed' || status === 'Approved') return <CheckCircle2 size={12} className="text-emerald-400" />;
        if (status === 'Pending') return <Clock size={12} className="text-amber-400" />;
        return <Clock size={12} className="text-slate-500" />;
    };

    const statusLabel = (status: string | null) => {
        if (!status) return 'Joined';
        return status;
    };

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={handleBackdropClick}
        >
            <div className="glass-card w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <Users size={16} className="text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">Participants</h2>
                            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[260px]">{challengeTitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium">{participantsCount} total</span>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
                            ))}
                        </div>
                    ) : participants.length === 0 ? (
                        <div className="py-12 text-center">
                            <Users size={32} className="text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium">No participants yet</p>
                            <p className="text-xs text-slate-600 mt-1">Be the first to join this challenge</p>
                        </div>
                    ) : (
                        participants.map(p => (
                            <Link
                                key={p.userId}
                                href={`/profile/${p.username}`}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/25 hover:bg-indigo-500/[0.04] transition-all group"
                            >
                                <Avatar initials={p.displayName.substring(0, 2).toUpperCase()} photoUrl={p.avatar} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                                        {p.displayName}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-slate-500">@{p.username}</span>
                                        {p.role && (
                                            <span className="text-[10px] text-slate-600">· {getRoleShort(p.role as any)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <LeagueBadge league={p.league as any} size="sm" />
                                    {p.totalScore > 0 && (
                                        <span className={cn('text-xs font-mono font-bold', getScoreColor(p.totalScore))}>
                                            {p.totalScore}
                                        </span>
                                    )}
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                        {statusIcon(p.submissionStatus)}
                                        {statusLabel(p.submissionStatus)}
                                    </div>
                                    <ExternalLink size={12} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
