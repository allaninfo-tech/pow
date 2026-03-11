'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useStore } from '@/lib/store';
import LeagueBadge from '@/components/ui/LeagueBadge';
import Avatar from '@/components/ui/Avatar';
import { cn, formatNumber, formatRankChange, getRoleIcon, getRoleShort } from '@/lib/utils';
import { Trophy, Users, TrendingUp, Star, Flame, ChevronUp, ChevronDown, Minus, Search } from 'lucide-react';
import { League, Role } from '@/lib/types';

const leagues: (League | 'All')[] = ['All', 'Elite', 'Pro', 'Newbie'];
const roleFilters: (Role | 'All')[] = ['All', 'Frontend Specialist', 'Backend Engineer', 'Full Stack Engineer', 'DevOps Engineer', 'ML Engineer', 'Data Scientist'];

function RankIcon({ rank }: { rank: number }) {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="text-sm font-bold text-slate-500">#{rank}</span>;
}

function RankChange({ change }: { change: number }) {
    if (change > 0) return <span className="flex items-center gap-0.5 text-xs text-emerald-400"><ChevronUp size={12} />{change}</span>;
    if (change < 0) return <span className="flex items-center gap-0.5 text-xs text-rose-400"><ChevronDown size={12} />{Math.abs(change)}</span>;
    return <span className="text-xs text-slate-600"><Minus size={12} /></span>;
}

export default function LeaderboardClient({ globalLeaderboard, squadLeaderboard, currentUser }: { 
    globalLeaderboard: any[];
    squadLeaderboard: any[];
    currentUser: { id: string; displayName: string; globalRank: number; league: string } | null;
}) {
    const { leaderboardTab, leaderboardLeague, leaderboardRole, setLeaderboardTab, setLeaderboardLeague, setLeaderboardRole } = useStore();
    const [search, setSearch] = useState('');

    const filteredGlobal = globalLeaderboard.filter(e => {
        if (leaderboardLeague !== 'All' && e.league !== leaderboardLeague) return false;
        if (leaderboardRole !== 'All' && e.role !== leaderboardRole) return false;
        if (search && !e.displayName.toLowerCase().includes(search.toLowerCase()) && !e.username.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const top3 = globalLeaderboard.slice(0, 3);

    return (
        <AppShell>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Rankings update in real-time after each validated submission.</p>
                </div>

                {/* Top 3 Podium — only show if we have at least 1 real ranked user */}
                {globalLeaderboard.length > 0 && (
                <div className="glass-card p-6">
                    <div className="flex items-end justify-center gap-4 py-4">
                        {/* 2nd */}
                        {globalLeaderboard[1] ? (
                        <div className="flex flex-col items-center gap-3">
                            <Avatar initials={globalLeaderboard[1].avatar} size="lg" />
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-200">{globalLeaderboard[1].displayName}</p>
                                <p className="text-xs text-slate-500">{getRoleShort(globalLeaderboard[1].role)}</p>
                                <p className="text-base font-black text-slate-300 mt-1 font-mono">{globalLeaderboard[1].avgAIScore}</p>
                            </div>
                            <div className="w-20 h-16 bg-gradient-to-t from-slate-600/30 to-slate-500/10 border border-slate-500/20 rounded-t-xl flex items-center justify-center">
                                <span className="text-2xl">🥈</span>
                            </div>
                        </div>
                        ) : <div className="w-20" />}
                        {/* 1st */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <Avatar initials={globalLeaderboard[0].avatar} size="xl" className="ring-2 ring-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.4)]" />
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg">👑</div>
                            </div>
                            <div className="text-center">
                                <p className="text-base font-bold text-white">{globalLeaderboard[0].displayName}</p>
                                <p className="text-xs text-slate-500">{getRoleShort(globalLeaderboard[0].role)}</p>
                                <p className="text-xl font-black text-emerald-400 mt-1 font-mono">{globalLeaderboard[0].avgAIScore}</p>
                            </div>
                            <div className="w-24 h-24 bg-gradient-to-t from-amber-500/30 to-amber-500/10 border border-amber-500/30 rounded-t-xl flex items-center justify-center">
                                <span className="text-3xl">🥇</span>
                            </div>
                        </div>
                        {/* 3rd */}
                        {globalLeaderboard[2] ? (
                        <div className="flex flex-col items-center gap-3">
                            <Avatar initials={globalLeaderboard[2].avatar} size="lg" />
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-200">{globalLeaderboard[2].displayName}</p>
                                <p className="text-xs text-slate-500">{getRoleShort(globalLeaderboard[2].role)}</p>
                                <p className="text-base font-black text-amber-600 mt-1 font-mono">{globalLeaderboard[2].avgAIScore}</p>
                            </div>
                            <div className="w-20 h-10 bg-gradient-to-t from-amber-700/30 to-amber-700/10 border border-amber-700/20 rounded-t-xl flex items-center justify-center">
                                <span className="text-2xl">🥉</span>
                            </div>
                        </div>
                        ) : <div className="w-20" />}
                    </div>
                </div>
                )}

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search engineers..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input-field pl-9"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05] w-fit">
                    {[
                        { key: 'global', label: 'Global', icon: TrendingUp },
                        { key: 'role', label: 'By Role', icon: Star },
                        { key: 'squad', label: 'Squads', icon: Users },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setLeaderboardTab(key as any)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                leaderboardTab === key
                                    ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(108,99,255,0.3)]'
                                    : 'text-slate-400 hover:text-slate-200'
                            )}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Filters row */}
                {(leaderboardTab === 'global' || leaderboardTab === 'role') && (
                    <div className="flex flex-wrap gap-3">
                        <div className="flex gap-1">
                            {leagues.map(l => (
                                <button
                                    key={l}
                                    onClick={() => setLeaderboardLeague(l)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                        leaderboardLeague === l
                                            ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
                                            : 'border-white/[0.06] text-slate-500 hover:border-white/20 hover:text-slate-300'
                                    )}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                        {leaderboardTab === 'role' && (
                            <select
                                value={leaderboardRole}
                                onChange={e => setLeaderboardRole(e.target.value as any)}
                                className="input-field py-1.5 text-xs w-auto"
                            >
                                {roleFilters.map(r => (
                                    <option key={r as string} value={r as string}>{r === 'All' ? 'All Roles' : getRoleShort(r as Role)}</option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {/* Table */}
                {leaderboardTab !== 'squad' ? (
                    <div className="glass-card overflow-hidden">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="w-16">Rank</th>
                                    <th>Engineer</th>
                                    <th className="hidden md:table-cell">Role</th>
                                    <th className="hidden sm:table-cell">League</th>
                                    <th>AI Score</th>
                                    <th className="hidden lg:table-cell">Projects</th>
                                    <th className="hidden lg:table-cell">Streak</th>
                                    <th className="hidden sm:table-cell w-16">Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGlobal.slice(0, 20).map((entry) => {
                                    const isCurrentUser = currentUser && entry.userId === currentUser.id;
                                    return (
                                        <tr key={entry.userId} className={cn(isCurrentUser && 'ring-1 ring-inset ring-indigo-500/30 !bg-indigo-500/[0.08]')}>
                                            <td className="text-center">
                                                <RankIcon rank={entry.rank} />
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <Avatar initials={entry.avatar} size="sm" />
                                                    <div>
                                                        <p className={cn('text-sm font-semibold', isCurrentUser ? 'text-indigo-300' : 'text-slate-200')}>
                                                            {entry.displayName}
                                                            {isCurrentUser && <span className="ml-1.5 text-xs text-indigo-400">(you)</span>}
                                                        </p>
                                                        <p className="text-xs text-slate-500">@{entry.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell">
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <span>{getRoleIcon(entry.role)}</span>
                                                    {getRoleShort(entry.role)}
                                                </span>
                                            </td>
                                            <td className="hidden sm:table-cell">
                                                <LeagueBadge league={entry.league} size="sm" />
                                            </td>
                                            <td>
                                                <span className="font-mono font-bold text-emerald-400 text-sm">{entry.avgAIScore}</span>
                                            </td>
                                            <td className="hidden lg:table-cell text-slate-400 text-sm">{entry.projectCount}</td>
                                            <td className="hidden lg:table-cell">
                                                <span className="flex items-center gap-1 text-sm">
                                                    <Flame size={12} className="text-rose-400" />
                                                    <span className="text-slate-400">{entry.streak}</span>
                                                </span>
                                            </td>
                                            <td className="hidden sm:table-cell text-center">
                                                <RankChange change={entry.rankChange} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="w-16">Rank</th>
                                    <th>Squad</th>
                                    <th className="hidden sm:table-cell">Members</th>
                                    <th>Avg AI Score</th>
                                    <th className="hidden md:table-cell">Projects</th>
                                    <th className="hidden sm:table-cell w-16">Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {squadLeaderboard.map(entry => (
                                    <tr key={entry.squadId}>
                                        <td className="text-center"><RankIcon rank={entry.rank} /></td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg">{entry.avatarEmoji}</div>
                                                <p className="text-sm font-semibold text-slate-200">{entry.name}</p>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell text-slate-400 text-sm">{entry.members} members</td>
                                        <td><span className="font-mono font-bold text-emerald-400 text-sm">{entry.avgAIScore}</span></td>
                                        <td className="hidden md:table-cell text-slate-400 text-sm">{entry.projectCount}</td>
                                        <td className="hidden sm:table-cell text-center"><RankChange change={entry.rankChange} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Your rank callout — only shown when logged in */}
                {currentUser && (
                <div className="glass-card p-4 flex items-center gap-4 border-indigo-500/20">
                    <Trophy size={20} className="text-indigo-400 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-300">Your Current Rank</p>
                        {currentUser.globalRank > 0 ? (
                            <p className="text-xs text-slate-500">You're ranked <span className="text-indigo-400 font-bold">#{currentUser.globalRank}</span> globally in the <span className="text-indigo-400">{currentUser.league}</span> league.</p>
                        ) : (
                            <p className="text-xs text-slate-500">Submit a challenge to earn your global ranking.</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-white">{currentUser.globalRank > 0 ? `#${currentUser.globalRank}` : '—'}</p>
                        <p className="text-xs text-slate-600">Submit more to rank up</p>
                    </div>
                </div>
                )}
            </div>
        </AppShell>
    );
}
