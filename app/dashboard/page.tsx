'use client';

import AppShell from '@/components/layout/AppShell';
import { useStore } from '@/lib/store';
import { mockSubmissions } from '@/lib/mock/submissions';
import { mockChallenges } from '@/lib/mock/challenges';
import LeagueBadge from '@/components/ui/LeagueBadge';
import Avatar from '@/components/ui/Avatar';
import { cn, getScoreColor, formatTimeUntil, formatRelativeTime, getRoleIcon, formatNumber, getTierLabel } from '@/lib/utils';
import { Zap, TrendingUp, Code2, Star, Clock, ArrowRight, Flame, Target, GitCommit, Award } from 'lucide-react';
import Link from 'next/link';
import {
    RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';

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

export default function DashboardPage() {
    const { currentUser } = useStore();
    const activeChallenges = mockChallenges.filter(c => c.status === 'Active').slice(0, 3);
    const latestSubmission = mockSubmissions[0];

    const avgScores = {
        codeQuality: 76,
        architecture: 73,
        performance: 80,
        security: 73,
        requirementAdherence: 78,
    };

    const stats = [
        { label: 'Global Rank', value: `#${currentUser.globalRank}`, icon: TrendingUp, color: 'text-indigo-400', sub: `Top ${Math.round(currentUser.globalRank / 12400 * 100)}%` },
        { label: 'Avg AI Score', value: `${currentUser.avgAIScore}`, icon: Star, color: 'text-amber-400', sub: 'Out of 100' },
        { label: 'Projects Done', value: currentUser.projectCount.toString(), icon: Code2, color: 'text-cyan-400', sub: `${currentUser.soloProjects} solo · ${currentUser.squadProjects} squad` },
        { label: 'Day Streak', value: `${currentUser.streak}d`, icon: Flame, color: 'text-rose-400', sub: 'Keep going!' },
    ];

    return (
        <AppShell>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Welcome header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar initials={currentUser.avatar} size="lg" online />
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Welcome back, <span className="text-gradient">{currentUser.displayName.split(' ')[0]}</span>
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

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map(({ label, value, icon: Icon, color, sub }) => (
                        <div key={label} className="stat-card">
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
                            <ScoreRadar scores={avgScores} />
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                {Object.entries(avgScores).map(([key, val]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span className={cn('text-xs font-mono font-bold', getScoreColor(val))}>{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* League progress */}
                        <div className="glass-card p-5">
                            <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                <Award size={16} className="text-amber-400" />
                                League Progress
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Pro → Elite</span>
                                    <span className="text-slate-500">{currentUser.projectCount}/5 projects</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${(currentUser.projectCount / 5) * 100}%` }} />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Squad projects</span>
                                    <span className="text-slate-500">{currentUser.squadProjects}/2 needed</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${(currentUser.squadProjects / 2) * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Need 0 more solo + 0 more squad projects to reach <span className="text-amber-400 font-medium">Elite</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Center/Right col: Active challenges + recent subs */}
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
                                {activeChallenges.map((ch) => (
                                    <Link key={ch.id} href={`/challenges/${ch.id}`}>
                                        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 hover:bg-indigo-500/[0.04] transition-all cursor-pointer">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                                <Zap size={16} className="text-indigo-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-200 truncate">{ch.title}</p>
                                                <p className="text-xs text-slate-500">Tier {ch.tier} · {getTierLabel(ch.tier)} · {ch.mode}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Clock size={11} />
                                                    {formatTimeUntil(ch.deadline)}
                                                </div>
                                                <p className="text-[10px] text-slate-600">{ch.submissionsCount} submitted</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
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
                                {mockSubmissions.map((sub) => (
                                    <div key={sub.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                        <div className={cn(
                                            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold',
                                            'bg-emerald-500/10 border border-emerald-500/20'
                                        )}>
                                            <span className={cn('font-mono text-xs font-bold', getScoreColor(sub.totalScore))}>{sub.totalScore}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-200 truncate">{sub.challengeTitle}</p>
                                            <p className="text-xs text-slate-500">Tier {sub.tier} · {formatRelativeTime(sub.submittedAt)}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className="badge badge-newbie">Completed</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tech stack */}
                        <div className="glass-card p-5">
                            <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                <Code2 size={16} className="text-emerald-400" />
                                Tech Stack Usage
                            </h2>
                            <div className="space-y-2.5">
                                {currentUser.techStack.map(({ name, count }) => {
                                    const max = Math.max(...currentUser.techStack.map(t => t.count));
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
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
