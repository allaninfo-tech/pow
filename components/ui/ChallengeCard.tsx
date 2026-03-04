'use client';

import { Challenge } from '@/lib/types';
import { cn, getTierColor, getTierLabel, formatTimeUntil, getRoleIcon, getRoleShort } from '@/lib/utils';
import { Zap, Users, Clock, ArrowRight, Code2 } from 'lucide-react';
import Link from 'next/link';

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
    const timeLeft = formatTimeUntil(challenge.deadline);
    const isUrgent = new Date(challenge.deadline).getTime() - Date.now() < 86400000 * 2; // < 2 days

    return (
        <Link href={`/challenges/${challenge.id}`}>
            <div className={cn('glass-card p-5 cursor-pointer group', className)}>
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
                            {challenge.status === 'Upcoming' && (
                                <span className="badge bg-amber-500/10 border border-amber-500/20 text-amber-300">
                                    Upcoming
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
                    {challenge.requiredRoles.map((role) => (
                        <span key={role} className="chip text-[11px]">
                            <span>{getRoleIcon(role)}</span>
                            {getRoleShort(role)}
                        </span>
                    ))}
                </div>

                {/* Footer stats */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Users size={12} />
                            <span>{challenge.participantsCount} participants</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Code2 size={12} />
                            <span>{challenge.submissionsCount} submissions</span>
                        </div>
                    </div>
                    <div className={cn(
                        'flex items-center gap-1.5 text-xs font-semibold',
                        isUrgent && challenge.status === 'Active' ? 'text-rose-400' : 'text-slate-400'
                    )}>
                        <Clock size={12} />
                        {challenge.status === 'Upcoming' ? 'Starting soon' : timeLeft}
                    </div>
                </div>

                {/* Hover action */}
                <div className="flex items-center gap-1 mt-3 text-xs font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Challenge <ArrowRight size={12} />
                </div>
            </div>
        </Link>
    );
}
