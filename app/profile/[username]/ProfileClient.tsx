'use client';

import AppShell from '@/components/layout/AppShell';
import LeagueBadge from '@/components/ui/LeagueBadge';
import Avatar from '@/components/ui/Avatar';
import { cn, getScoreColor, formatDate, getRoleIcon, formatRelativeTime } from '@/lib/utils';
import { Github, Globe, MapPin, Star, Code2, Flame, TrendingUp, Award, ExternalLink, Shield, GitCommit } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import Link from 'next/link';

export default function ProfileClient({ user, userSubmissions }: { user: any; userSubmissions: any[] }) {

    // Safe defaults
    const displayName = user.displayName || user.display_name || 'Developer';
    const username = user.username || '';
    const avatar = user.avatar || displayName.slice(0, 2).toUpperCase();
    const avgAIScore = Number(user.avgAIScore || user.avg_ai_score) || 0;
    const globalRank = user.globalRank || user.global_rank || 0;
    const roleRank = user.roleRank || user.role_rank || 0;
    const projectCount = user.projectCount || user.project_count || 0;
    const streak = user.streak || 0;
    const techStack: { name: string; count: number }[] = Array.isArray(user.techStack) ? user.techStack : [];
    const badges: any[] = Array.isArray(user.badges) ? user.badges : [];
    const githubUsername = user.githubUsername || user.github_username || null;

    const radarData = avgAIScore > 0 ? [
        { subject: 'Code Quality', value: Math.round(avgAIScore * 0.93) },
        { subject: 'Architecture', value: Math.round(avgAIScore * 0.87) },
        { subject: 'Performance', value: Math.round(avgAIScore * 0.97) },
        { subject: 'Security', value: Math.round(avgAIScore * 0.90) },
        { subject: 'Requirements', value: Math.round(avgAIScore * 0.95) },
    ] : [];

    // Build real heatmap from actual submission dates (last 52 weeks)
    const heatmapData = (() => {
        const weeks = 52;
        const grid: number[][] = Array.from({ length: weeks }, () => Array(7).fill(0));
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - weeks * 7);

        for (const sub of userSubmissions) {
            const date = sub.submittedAt ? new Date(sub.submittedAt) : null;
            if (!date || date < startDate) continue;
            const diffDays = Math.floor((date.getTime() - startDate.getTime()) / 86400000);
            const week = Math.floor(diffDays / 7);
            const day = diffDays % 7;
            if (week >= 0 && week < weeks && day >= 0 && day < 7) {
                grid[week][day]++;
            }
        }
        return grid;
    })();

    const maxHeatVal = Math.max(1, ...heatmapData.flatMap(w => w));

    return (
        <AppShell>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Profile header */}
                <div className="glass-card p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <Avatar initials={avatar} size="xl" online className="ring-2 ring-indigo-500/30" />
                        <div className="flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                                    <p className="text-sm text-slate-500">@{username}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <LeagueBadge league={user.league} size="sm" />
                                        {user.role && <span className="text-sm text-slate-400">{getRoleIcon(user.role)} {user.role}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-white">{globalRank > 0 ? `#${globalRank}` : '—'}</p>
                                        <p className="text-xs text-slate-500">Global Rank</p>
                                    </div>
                                    <Link href="/resume" className="btn-cyan text-xs px-4 py-1.5">View Resume</Link>
                                </div>
                            </div>
                            {user.bio && <p className="text-sm text-slate-400 mt-3 max-w-lg">{user.bio}</p>}
                            <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                                {user.location && <span className="flex items-center gap-1"><MapPin size={12} />{user.location}</span>}
                                {user.website && (
                                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                                        <Globe size={12} />{user.website.replace(/^https?:\/\//, '')}
                                    </a>
                                )}
                                {githubUsername && (
                                    <a href={`https://github.com/${githubUsername}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                                        <Github size={12} />@{githubUsername}
                                    </a>
                                )}
                                {user.joinedAt && <span className="flex items-center gap-1">Joined {formatDate(user.joinedAt)}</span>}
                            </div>
                        </div>
                    </div>

                    {/* GitHub badge */}
                    {githubUsername && (
                        <div className="mt-4 pt-4 border-t border-white/[0.06]">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-indigo-400" />
                                    <span className="text-xs font-medium text-slate-400">Dynamic GitHub Badge</span>
                                </div>
                                <code className="text-xs font-mono text-indigo-300/80 flex-1 truncate">
                                    ![ProofStack](https://proofstack.io/api/badge/{username})
                                </code>
                                <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Copy <ExternalLink size={10} /></button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Avg AI Score', value: avgAIScore > 0 ? avgAIScore : '—', icon: Star, color: 'text-amber-400' },
                        { label: 'Projects', value: projectCount, icon: Code2, color: 'text-cyan-400' },
                        { label: 'Day Streak', value: `${streak}d`, icon: Flame, color: 'text-rose-400' },
                        { label: 'Role Rank', value: roleRank > 0 ? `#${roleRank}` : '—', icon: TrendingUp, color: 'text-indigo-400' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="stat-card text-center">
                            <Icon size={18} className={cn('mx-auto mb-2', color)} />
                            <p className="text-2xl font-black text-white">{value}</p>
                            <p className="text-xs text-slate-500">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Contribution Heatmap — real submission dates */}
                <div className="glass-card p-5">
                    <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                        <GitCommit size={16} className="text-cyan-400" /> Submission Activity
                    </h2>
                    <div className="flex gap-[3px] overflow-x-auto pb-1">
                        {heatmapData.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-[3px]">
                                {week.map((count, day) => {
                                    const level = count === 0 ? 0 : count === 1 ? 2 : count === 2 ? 3 : 4;
                                    return (
                                        <div
                                            key={day}
                                            className="heatmap-cell"
                                            data-level={level}
                                            title={count > 0 ? `${count} submission${count > 1 ? 's' : ''}` : 'No activity'}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                        <span>Less</span>
                        {[0, 1, 2, 3, 4].map(l => <div key={l} className="heatmap-cell" data-level={l} />)}
                        <span>More</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Score Radar */}
                    <div className="glass-card p-5">
                        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <Star size={16} className="text-amber-400" /> Score Profile
                        </h2>
                        {radarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <RadarChart data={radarData}>
                                    <defs>
                                        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#6c63ff" stopOpacity={0.1} />
                                        </radialGradient>
                                    </defs>
                                    <PolarGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} />
                                    <Radar
                                        name="Score"
                                        dataKey="value"
                                        stroke="#00d4ff"
                                        strokeWidth={2}
                                        fill="url(#radarGlow)"
                                        className="drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]"
                                        animationDuration={1500}
                                        animationEasing="ease-out"
                                    />
                                    <Tooltip wrapperClassName="hud-tooltip" cursor={false} />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-center">
                                <div>
                                    <Star size={28} className="text-slate-700 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">No score data yet</p>
                                    <p className="text-xs text-slate-600 mt-1">Complete a challenge to see your score profile</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tech Stack */}
                    <div className="glass-card p-5">
                        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <Code2 size={16} className="text-emerald-400" /> Tech Stack
                        </h2>
                        {techStack.length > 0 ? (
                            <div className="space-y-2.5">
                                {techStack.map(({ name, count }) => {
                                    const max = Math.max(1, ...techStack.map(t => t.count));
                                    return (
                                        <div key={name} className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-slate-400 w-28 flex-shrink-0">{name}</span>
                                            <div className="flex-1 progress-bar">
                                                <div className="progress-fill" style={{ width: `${(count / max) * 100}%` }} />
                                            </div>
                                            <span className="text-xs text-slate-500 w-6 text-right">{count}x</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-center py-10">
                                <div>
                                    <Code2 size={28} className="text-slate-700 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">No tech stack recorded yet</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Project History */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                            <GitCommit size={16} className="text-cyan-400" /> Project History
                        </h2>
                    </div>
                    {userSubmissions.length > 0 ? (
                        <div className="space-y-4">
                            {userSubmissions.map(sub => (
                                <div key={sub.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-slate-200">{sub.challengeTitle || sub.challenge_title}</h3>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Tier {sub.tier} · {formatRelativeTime(sub.submittedAt || sub.submitted_at)}
                                                {(sub.commitCount || sub.commit_count) > 0 && ` · ${sub.commitCount || sub.commit_count} commits`}
                                            </p>
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {(sub.liveUrl || sub.live_url) && (
                                                    <a href={sub.liveUrl || sub.live_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                                        <Globe size={10} /> Live Demo
                                                    </a>
                                                )}
                                                {((sub.githubRepos && sub.githubRepos[0]) || (sub.github_repos && sub.github_repos[0])) && (
                                                    <a href={`https://github.com/${sub.githubRepos?.[0] || sub.github_repos?.[0]}`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1">
                                                        <Github size={10} /> Repository
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className={cn('text-2xl font-black font-mono', getScoreColor(sub.totalScore || sub.total_score || 0))}>
                                                {sub.totalScore || sub.total_score || 0}
                                            </p>
                                            <p className="text-xs text-slate-500">AI Score</p>
                                        </div>
                                    </div>
                                    {sub.scores && Object.keys(sub.scores).length > 0 && (
                                        <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-white/[0.05]">
                                            {Object.entries(sub.scores).map(([k, v]) => (
                                                <div key={k} className="text-center">
                                                    <p className={cn('text-sm font-bold font-mono', getScoreColor(v as number))}>{v as number}</p>
                                                    <p className="text-[9px] text-slate-600 capitalize">{k.replace(/([A-Z])/g, ' $1').trim().split(' ')[0]}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 text-center">
                            <GitCommit size={32} className="text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No submissions yet</p>
                            <p className="text-sm text-slate-600 mt-1">Join a challenge and submit your first project</p>
                            <Link href="/challenges" className="btn-ghost text-sm mt-4 inline-flex">Browse Challenges</Link>
                        </div>
                    )}
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                    <div className="glass-card p-5">
                        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <Award size={16} className="text-amber-400" /> Badges
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {badges.map((badge: any) => (
                                <div key={badge.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/20 transition-all text-center">
                                    <div className="text-2xl mb-1">{badge.icon || '🏅'}</div>
                                    <p className="text-xs font-medium text-slate-300">{badge.name}</p>
                                    <p className="text-[10px] text-slate-600 mt-0.5">{badge.rarity}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
