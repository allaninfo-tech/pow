'use client';

import { useState } from 'react';
import { Challenge } from '@/lib/types';
import { cn, getTierColor, getTierLabel, formatTimeUntil, getRoleIcon, getRoleShort } from '@/lib/utils';
import { Zap, Users, Clock, ArrowRight, Code2, Play, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import ParticipantsModal from './ParticipantsModal';

interface ChallengeCardProps {
    challenge: Challenge;
    className?: string;
}

const modeColors = {
    Solo: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
    Squad: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
    Both: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
};

export default function ChallengeCard({ challenge, className }: ChallengeCardProps) {
    const [showParticipants, setShowParticipants] = useState(false);
    const timeLeft = formatTimeUntil(challenge.deadline);
    const isUrgent = challenge.deadline
        ? new Date(challenge.deadline).getTime() - Date.now() < 86400000 * 2
        : false;

    const isActive = challenge.status === 'Active';
    const isUpcoming = challenge.status === 'Upcoming';
    const isCompleted = challenge.status === 'Completed';

    return (
        <>
            <div className={cn('glass-card p-5 group relative flex flex-col', className)}>
                {/* Card body links to detail */}
                <Link href={`/challenges/${challenge.id}`} className="block flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={cn('badge', getTierColor(challenge.tier))}>
                                    Tier {challenge.tier} · {getTierLabel(challenge.tier)}
                                </span>
                                <span className={cn('badge border', modeColors[challenge.mode])}>
                                    {challenge.mode === 'Both' ? 'Solo + Squad' : challenge.mode}
                                </span>
                                {isUpcoming && (
                                    <span className="badge bg-amber-500/10 border border-amber-500/20 text-amber-300">
                                        Upcoming
                                    </span>
                                )}
                                {isCompleted && (
                                    <span className="badge bg-slate-500/10 border border-slate-500/20 text-slate-400">
                                        Ended
                                    </span>
                                )}
                            </div>
                            <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                                {challenge.title}
                            </h3>
                        </div>
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Zap size={18} className="text-indigo-400" />
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {challenge.shortDescription}
                    </p>

                    {/* Required roles */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {(challenge.requiredRoles || []).map((role) => (
                            <span key={role} className="chip text-[11px]">
                                <span>{getRoleIcon(role)}</span>
                                {getRoleShort(role)}
                            </span>
                        ))}
                    </div>

                    {/* Upcoming tip banner */}
                    {isUpcoming && (
                        <div className="mb-4 px-3 py-2 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 flex items-center gap-2">
                            <Clock size={13} className="text-amber-400 flex-shrink-0" />
                            <p className="text-xs text-amber-300/90 leading-relaxed">
                                This challenge is launching soon. Check back when it goes <span className="font-semibold text-amber-300">Active</span> to participate.
                            </p>
                        </div>
                    )}
                </Link>

                {/* Footer stats + CTA */}
                <div className="mt-3 pt-3 border-t border-white/[0.05]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                            {/* Participants — clickable */}
                            <button
                                onClick={() => setShowParticipants(true)}
                                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                                title="View participants"
                            >
                                <Users size={12} />
                                <span className="underline-offset-2 hover:underline">
                                    {challenge.participantsCount ?? 0} participants
                                </span>
                            </button>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Code2 size={12} />
                                <span>{challenge.submissionsCount ?? 0} submissions</span>
                            </div>
                        </div>
                        <div className={cn(
                            'flex items-center gap-1.5 text-xs font-semibold',
                            isUrgent && isActive ? 'text-rose-400' : 'text-slate-400'
                        )}>
                            <Clock size={12} />
                            {isUpcoming ? 'Starting soon' : (timeLeft || 'Ended')}
                        </div>
                    </div>

                    {/* Participate / View CTA button */}
                    {isActive && (
                        <Link
                            href={`/submit/${challenge.id}`}
                            className={cn(
                                'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
                                'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500',
                                'text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                            )}
                            onClick={e => e.stopPropagation()}
                        >
                            <Play size={14} /> Participate Now
                        </Link>
                    )}

                    {isCompleted && (
                        <Link
                            href={`/challenges/${challenge.id}`}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
                            onClick={e => e.stopPropagation()}
                        >
                            <CheckCircle size={14} /> See Submissions
                        </Link>
                    )}

                    {isUpcoming && (
                        <Link
                            href={`/challenges/${challenge.id}`}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-amber-500/20 text-amber-400 hover:bg-amber-500/[0.07] transition-all"
                            onClick={e => e.stopPropagation()}
                        >
                            <ArrowRight size={14} /> Preview Challenge
                        </Link>
                    )}
                </div>
            </div>

            {/* Participants Modal */}
            {showParticipants && (
                <ParticipantsModal
                    challengeId={challenge.id}
                    challengeTitle={challenge.title}
                    participantsCount={challenge.participantsCount ?? 0}
                    onClose={() => setShowParticipants(false)}
                />
            )}
        </>
    );
}
