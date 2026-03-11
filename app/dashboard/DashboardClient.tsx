'use client';

import AppShell from '@/components/layout/AppShell';
import LeagueBadge from '@/components/ui/LeagueBadge';
import Avatar from '@/components/ui/Avatar';
import { cn, getScoreColor, formatTimeUntil, formatRelativeTime, getRoleIcon, getTierLabel } from '@/lib/utils';
import { Zap, TrendingUp, Code2, Star, Clock, ArrowRight, Flame, Target, GitCommit, Award, AlertTriangle, Trophy, CheckCircle2, InboxIcon } from 'lucide-react';
import Link from 'next/link';
import {
    RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';

function getGreeting(): { text: string; emoji: string } {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    if (hour < 21) return { text: 'Good evening', emoji: '🌆' };
    return { text: 'Good night', emoji: '🌙' };
}

function ScoreRadar({ scores }: { scores: { codeQuality: number; architecture: number; performance: number; security: number; requirementAdherence: number } }) {
    const data = [
        { subject: 'Code Quality', value: scores.codeQuality },
        { subject: 'Architecture', value: scores.architecture },
        { subject: 'Performance', value: scores.performance },
        { subject: 'Security', value: scores.security },
        { subject: 'Requirements', value: scores.requirementAdherence },
    ];
    return (
        <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={data}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar dataKey="value" stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#6c63ff', r: 3 }} />
                <Tooltip
                    contentStyle={{ background: 'rgba(15,21,38,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#e2e8f0' }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}

function EmptyState({ icon: Icon, title, description, cta, ctaHref }: {
    icon: React.ElementType;
    title: string;
    description: string;
    cta?: string;
    ctaHref?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Icon size={20} className="text-slate-600" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-400">{title}</p>
                <p className="text-xs text-slate-600 mt-0.5">{description}</p>
            </div>
            {cta && ctaHref && (
                <Link href={ctaHref} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1">
                    {cta} <ArrowRight size={12} />
                </Link>
            )}
        </div>
    );
}

export default function DashboardClient({
    currentUser,
    activeChallenges,
    recentSubmissions
}: {
    currentUser: any;
    activeChallenges: any[];
    recentSubmissions: any[];
}) {
    const greeting = getGreeting();

    // Use real avg scores from submissions if available, otherwise show zeros
    const avgScores = {
        codeQuality: 0,
        architecture: 0,
        performance: 0,
        security: 0,
        requirementAdherence: 0,
    };

    const stats = [
        {
            label: 'Global Rank',
            value: currentUser.globalRank > 0 ? `#${currentUser.globalRank}` : '—',
            icon: TrendingUp,
            color: 'text-indigo-400',
            sub: currentUser.globalRank > 0 ? `Top ${Math.round(currentUser.globalRank / 12400 * 100)}%` : 'Not ranked yet'
        },
        {
            label: 'Avg AI Score',
            value: currentUser.avgAIScore > 0 ? `${currentUser.avgAIScore}` : '—',
            icon: Star,
            color: 'text-amber-400',
            sub: 'Out of 100'
        },
        {
            label: 'Projects Done',
            value: currentUser.projectCount > 0 ? currentUser.projectCount.toString() : '0',
            icon: Code2,
            color: 'text-cyan-400',
            sub: `${currentUser.soloProjects} solo · ${currentUser.squadProjects} squad`
        },
        {
            label: 'Day Streak',
            value: currentUser.streak > 0 ? `${currentUser.streak}d` : '—',
            icon: Flame,
            color: 'text-rose-400',
            sub: currentUser.streak > 0 ? 'Keep going!' : 'Submit to start'
        },
    ];

    const firstName = currentUser.displayName?.split(' ')[0] || 'Developer';

    return (
        <AppShell>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Welcome header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar initials={currentUser.avatar} size="lg" online />
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {greeting.emoji} {greeting.text}, <span className="text-gradient">{firstName}</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <LeagueBadge league={currentUser.league} size="sm" />
                                <span className="text-sm text-slate-500">· {getRoleIcon(currentUser.role)} {currentUser.role}</span>
                            </div>
                        </div>
                    </div>
                    <Link href="/challenges" className="btn-primary flex items-center gap-2 text-sm">
                        <Zap size={16} /> Browse Challenges
                    </Link>
                </div>

                {/* Animated stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map(({ label, value, icon: Icon, color, sub }, idx) => (
                        <div
                            key={label}
                            className="stat-card animate-slide-up"
                            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'backwards' }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500 font-medium">{label}</span>
                                <Icon size={16} className={color} />
                            </div>
                            <div className="text-2xl font-black text-white mb-0.5">{value}</div>
                            <p className="text-xs text-slate-600">{sub}</p>
                        </div>
                    ))}
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left col: Score radar + progress */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Score radar */}
                        <div className="glass-card p-5">
                            <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                <Target size={16} className="text-indigo-400" />
                                Average Score Profile
                            </h2>
                            {recentSubmissions.length > 0 ? (
                                <>
                                    <ScoreRadar scores={avgScores} />
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        {Object.entries(avgScores).map(([key, val]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <span className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <span className={cn('text-xs font-mono font-bold', getScoreColor(val))}>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <EmptyState
                                    icon={Target}
                                    title="No score data yet"
                                    description="Complete a challenge to see your score profile"
                                    cta="Browse challenges"
                                    ctaHref="/challenges"
                                />
                            )}
                        </div>

                        {/* League progress */}
                        <div className="glass-card p-5">
                            <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                <Award size={16} className="text-amber-400" />
                                League Progress
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">
                                        {currentUser.league === 'Elite' ? 'Elite League' : `${currentUser.league} → ${currentUser.league === 'Newbie' ? 'Pro' : 'Elite'}`}
                                    </span>
                                    <span className="text-slate-500">{currentUser.projectCount}/5 projects</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${Math.min((currentUser.projectCount / 5) * 100, 100)}%` }} />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Squad projects</span>
                                    <span className="text-slate-500">{currentUser.squadProjects}/2 needed</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${Math.min((currentUser.squadProjects / 2) * 100, 100)}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
                                </div>
                                {currentUser.league !== 'Elite' && (
                                    <p className="text-xs text-slate-500 mt-2">
                                        Complete more projects to reach <span className="text-amber-400 font-medium">{currentUser.league === 'Newbie' ? 'Pro' : 'Elite'}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Center/Right col: Active challenges + submissions + timeline */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Active challenges */}
                        <div className="glass-card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <Zap size={16} className="text-indigo-400" />
                                    Active Challenges
                                </h2>
                                <Link href="/challenges" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                    View all <ArrowRight size={12} />
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {activeChallenges.length > 0 ? activeChallenges.map((ch) => {
                                    const timeLeft = new Date(ch.deadline).getTime() - Date.now();
                                    const isUrgent = timeLeft < 86400000 * 2; // < 48h
                                    return (
                                        <Link key={ch.id} href={`/challenges/${ch.id}`}>
                                            <div className={cn(
                                                'flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 hover:bg-indigo-500/[0.04] transition-all cursor-pointer',
                                                isUrgent && 'border-rose-500/20 bg-rose-500/[0.03] hover:border-rose-500/30'
                                            )}>
                                                <div className={cn(
                                                    'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                                                    isUrgent
                                                        ? 'bg-gradient-to-br from-rose-500/20 to-amber-500/10 border border-rose-500/20'
                                                        : 'bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 border border-indigo-500/20'
                                                )}>
                                                    {isUrgent ? <AlertTriangle size={16} className="text-rose-400" /> : <Zap size={16} className="text-indigo-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-200 truncate">{ch.title}</p>
                                                    <p className="text-xs text-slate-500">Tier {ch.tier} · {getTierLabel(ch.tier)} · {ch.mode}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className={cn('flex items-center gap-1 text-xs', isUrgent ? 'text-rose-400 font-semibold' : 'text-slate-400')}>
                                                        <Clock size={11} className={isUrgent ? 'animate-pulse' : ''} />
                                                        {formatTimeUntil(ch.deadline)}
                                                    </div>
                                                    <p className="text-[10px] text-slate-600">{ch.submissionsCount} submitted</p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                }) : (
                                    <EmptyState
                                        icon={Zap}
                                        title="No active challenges"
                                        description="New challenges are posted regularly"
                                        cta="Browse all challenges"
                                        ctaHref="/challenges"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Recent submissions */}
                        <div className="glass-card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <GitCommit size={16} className="text-cyan-400" />
                                    Recent Submissions
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {recentSubmissions.length > 0 ? recentSubmissions.map((sub) => (
                                    <div key={sub.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                        <div className={cn(
                                            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold',
                                            'bg-emerald-500/10 border border-emerald-500/20'
                                        )}>
                                            <span className={cn('font-mono text-xs font-bold', getScoreColor(sub.totalScore))}>{sub.totalScore || '—'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-200 truncate">{sub.challengeTitle}</p>
                                            <p className="text-xs text-slate-500">Tier {sub.tier} · {formatRelativeTime(sub.submittedAt)}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className="badge badge-newbie">Completed</span>
                                        </div>
                                    </div>
                                )) : (
                                    <EmptyState
                                        icon={InboxIcon}
                                        title="No submissions yet"
                                        description="Your completed challenge submissions will appear here"
                                        cta="Start your first challenge"
                                        ctaHref="/challenges"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Activity Timeline — only shown when user has submissions */}
                        {recentSubmissions.length > 0 && (
                            <div className="glass-card p-5">
                                <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    Activity Timeline
                                </h2>
                                <div className="relative">
                                    <div className="absolute left-[17px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/30 via-cyan-500/20 to-transparent" />
                                    <div className="space-y-3">
                                        {recentSubmissions.map((sub, idx) => (
                                            <div key={idx} className="flex items-start gap-3 relative pl-1">
                                                <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center flex-shrink-0 z-10 text-cyan-400 bg-cyan-500/15">
                                                    <GitCommit size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0 pt-1">
                                                    <p className="text-sm text-slate-300">Submitted &ldquo;{sub.challengeTitle}&rdquo;</p>
                                                    <p className="text-[10px] text-slate-600 mt-0.5">{formatRelativeTime(sub.submittedAt)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tech stack */}
                        {currentUser.techStack && currentUser.techStack.length > 0 ? (
                            <div className="glass-card p-5">
                                <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                    <Code2 size={16} className="text-emerald-400" />
                                    Tech Stack Usage
                                </h2>
                                <div className="space-y-2.5">
                                    {currentUser.techStack.map(({ name, count }: { name: string, count: number }) => {
                                        const max = Math.max(...currentUser.techStack.map((t: any) => t.count));
                                        const pct = Math.round((count / max) * 100);
                                        return (
                                            <div key={name} className="flex items-center gap-3">
                                                <span className="text-xs text-slate-400 w-24 flex-shrink-0 font-mono">{name}</span>
                                                <div className="flex-1 progress-bar">
                                                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs text-slate-500 w-8 text-right">{count}x</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card p-5">
                                <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                    <Code2 size={16} className="text-emerald-400" />
                                    Tech Stack Usage
                                </h2>
                                <EmptyState
                                    icon={Trophy}
                                    title="No tech stack data"
                                    description="Complete challenges to build your tech stack profile"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
