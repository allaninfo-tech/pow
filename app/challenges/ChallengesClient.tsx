'use client';

import { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import ChallengeCard from '@/components/ui/ChallengeCard';
import { useStore } from '@/lib/store';
import { Role, DifficultyTier, ChallengeMode } from '@/lib/types';
import { getTierLabel, getRoleShort } from '@/lib/utils';
import { Search, SlidersHorizontal, X, Zap, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

const allRoles: (Role | 'All')[] = ['All', 'Frontend Specialist', 'Backend Engineer', 'Full Stack Engineer', 'DevOps Engineer', 'Data Scientist', 'ML Engineer', 'UI/UX Designer'];
const allTiers: (DifficultyTier | 'All')[] = ['All', 1, 2, 3, 4, 5];
const allModes: (ChallengeMode | 'All')[] = ['All', 'Solo', 'Squad', 'Both'];
const allStatuses = ['All', 'Active', 'Upcoming'] as const;
export default function ChallengesClient({ initialChallenges }: { initialChallenges: any[] }) {
    const { challengeFilters, setChallengeFilter, resetChallengeFilters } = useStore();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filtered = useMemo(() => {
        return initialChallenges.filter(c => {
            if (challengeFilters.status !== 'All' && c.status !== challengeFilters.status) return false;
            if (challengeFilters.role !== 'All' && !c.requiredRoles.includes(challengeFilters.role as Role)) return false;
            if (challengeFilters.tier !== 'All' && c.tier !== challengeFilters.tier) return false;
            if (challengeFilters.mode !== 'All' && c.mode !== challengeFilters.mode && c.mode !== 'Both') return false;
            if (challengeFilters.search && !c.title.toLowerCase().includes(challengeFilters.search.toLowerCase()) &&
                !c.shortDescription.toLowerCase().includes(challengeFilters.search.toLowerCase())) return false;
            return true;
        });
    }, [challengeFilters]);

    const hasFilters = challengeFilters.role !== 'All' || challengeFilters.tier !== 'All' || challengeFilters.mode !== 'All' || challengeFilters.status !== 'All' || !!challengeFilters.search;
    const activeCnt = initialChallenges.filter(c => c.status === 'Active').length;
    const upcomingCnt = initialChallenges.filter(c => c.status === 'Upcoming').length;

    return (
        <AppShell>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Challenges</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            <span className="text-indigo-400 font-medium">{activeCnt} active</span> · {upcomingCnt} upcoming · New challenges every 48 hours
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded-lg border transition-all', viewMode === 'grid' ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400' : 'border-white/[0.06] text-slate-500 hover:text-slate-300')}>
                            <LayoutGrid size={16} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-lg border transition-all', viewMode === 'list' ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400' : 'border-white/[0.06] text-slate-500 hover:text-slate-300')}>
                            <List size={16} />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal size={16} className="text-slate-500" />
                        <span className="text-sm font-medium text-slate-400">Filters</span>
                        {hasFilters && (
                            <button onClick={resetChallengeFilters} className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 ml-auto">
                                <X size={12} /> Clear all
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search challenges..."
                            value={challengeFilters.search}
                            onChange={e => setChallengeFilter('search', e.target.value)}
                            className="input-field pl-9"
                        />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Status */}
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Status</label>
                            <div className="flex gap-1 flex-wrap">
                                {allStatuses.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setChallengeFilter('status', s as any)}
                                        className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all border',
                                            challengeFilters.status === s
                                                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                                                : 'bg-transparent border-white/[0.06] text-slate-400 hover:border-white/20'
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mode */}
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Mode</label>
                            <div className="flex gap-1 flex-wrap">
                                {allModes.map(m => (
                                    <button
                                        key={m as string}
                                        onClick={() => setChallengeFilter('mode', m as any)}
                                        className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all border',
                                            challengeFilters.mode === m
                                                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                                                : 'bg-transparent border-white/[0.06] text-slate-400 hover:border-white/20'
                                        )}
                                    >
                                        {m as string}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tier */}
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Difficulty Tier</label>
                            <div className="flex gap-1 flex-wrap">
                                {allTiers.map(t => (
                                    <button
                                        key={t as string}
                                        onClick={() => setChallengeFilter('tier', t as any)}
                                        className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all border',
                                            challengeFilters.tier === t
                                                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                                                : 'bg-transparent border-white/[0.06] text-slate-400 hover:border-white/20'
                                        )}
                                    >
                                        {t === 'All' ? 'All' : `T${t}`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Role</label>
                            <select
                                value={challengeFilters.role as string}
                                onChange={e => setChallengeFilter('role', e.target.value as any)}
                                className="input-field py-2 text-xs"
                            >
                                {allRoles.map(r => (
                                    <option key={r as string} value={r as string}>{r === 'All' ? 'All Roles' : getRoleShort(r as Role)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results count */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Zap size={14} className="text-indigo-400" />
                    <span><span className="text-slate-300 font-medium">{filtered.length}</span> challenges found</span>
                </div>

                {/* Challenge grid */}
                {filtered.length > 0 ? (
                    <div className={cn(
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                            : 'space-y-3'
                    )}>
                        {filtered.map(ch => (
                            <ChallengeCard key={ch.id} challenge={ch} />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center">
                        <Zap size={32} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No challenges match your filters</p>
                        <p className="text-sm text-slate-600 mt-1">Try adjusting or clearing your filters</p>
                        <button onClick={resetChallengeFilters} className="btn-ghost mt-4 text-sm">Clear Filters</button>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
