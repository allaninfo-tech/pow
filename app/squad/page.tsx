'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { mockSquads } from '@/lib/mock/squads';
import Avatar from '@/components/ui/Avatar';
import { cn, getRoleIcon, getRoleShort, formatDate } from '@/lib/utils';
import { Users, Plus, Crown, Github, Link2, Search, Shield, UserPlus, Check, X, ExternalLink } from 'lucide-react';

const mySquad = mockSquads[0]; // Sigma Protocol
const recruitingSquads = mockSquads.filter(s => s.isRecruiting);

export default function SquadPage() {
    const [tab, setTab] = useState<'my-squad' | 'find' | 'create'>('my-squad');
    const [inviteName, setInviteName] = useState('');

    return (
        <AppShell>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Squads</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Collaborate on squad challenges and build collective rankings.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05] w-fit">
                    {[
                        { key: 'my-squad', label: 'My Squad', icon: Shield },
                        { key: 'find', label: 'Find Squads', icon: Search },
                        { key: 'create', label: 'Create Squad', icon: Plus },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key as any)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                tab === key
                                    ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(108,99,255,0.3)]'
                                    : 'text-slate-400 hover:text-slate-200'
                            )}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'my-squad' && (
                    <div className="space-y-5">
                        {/* Squad header card */}
                        <div className="glass-card p-6">
                            <div className="flex flex-col sm:flex-row items-start gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                                    {mySquad.avatarEmoji}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{mySquad.name}</h2>
                                            <p className="text-sm text-slate-400 mt-1 max-w-md">{mySquad.description}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-2xl font-black text-white">#{mySquad.globalRank}</p>
                                            <p className="text-xs text-slate-500">Global Squad Rank</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {mySquad.tags.map(tag => (
                                            <span key={tag} className="chip text-xs">{tag}</span>
                                        ))}
                                        {!mySquad.isRecruiting && (
                                            <span className="chip text-xs text-amber-300 border-amber-500/20 bg-amber-500/10">Closed</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.06]">
                                {[
                                    { label: 'Projects', value: mySquad.projectCount },
                                    { label: 'Avg AI Score', value: mySquad.avgAIScore },
                                    { label: 'Total Points', value: `${(mySquad.totalPoints / 1000).toFixed(1)}K` },
                                    { label: 'Members', value: mySquad.members.length },
                                ].map(({ label, value }) => (
                                    <div key={label} className="stat-card text-center">
                                        <p className="text-xs text-slate-500 mb-1">{label}</p>
                                        <p className="text-xl font-black text-white">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Members */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <Users size={16} className="text-indigo-400" /> Members ({mySquad.members.length})
                                </h3>
                                <button className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
                                    <UserPlus size={14} /> Invite
                                </button>
                            </div>
                            <div className="space-y-4">
                                {mySquad.members.map(member => (
                                    <div key={member.userId} className="flex items-center gap-4">
                                        <Avatar initials={member.avatar} size="md" online />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-200">{member.displayName}</p>
                                                {member.isLeader && <Crown size={14} className="text-amber-400" title="Squad Leader" />}
                                            </div>
                                            <p className="text-xs text-slate-500">@{member.username} · {getRoleIcon(member.role)} {getRoleShort(member.role)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-indigo-300">{member.contributionPercentage}%</p>
                                            <p className="text-xs text-slate-500">contribution</p>
                                        </div>
                                        <div className="w-24 hidden sm:block">
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${member.contributionPercentage}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* GitHub Repos */}
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                <Github size={16} className="text-slate-400" /> Linked Repositories
                            </h3>
                            <div className="space-y-2">
                                {mySquad.githubRepos.map(repo => (
                                    <div key={repo} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all">
                                        <Github size={16} className="text-slate-500 flex-shrink-0" />
                                        <span className="text-sm font-mono text-slate-300 flex-1">{repo}</span>
                                        <a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-indigo-400 transition-colors">
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                ))}
                                <button className="w-full flex items-center gap-2 p-3 rounded-xl border border-dashed border-white/[0.08] text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all text-sm">
                                    <Link2 size={14} /> Link a repository
                                </button>
                            </div>
                        </div>

                        {/* Pending invites */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <UserPlus size={16} className="text-cyan-400" /> Pending Invites
                                </h3>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Invite by username or email..."
                                    value={inviteName}
                                    onChange={e => setInviteName(e.target.value)}
                                    className="input-field flex-1 text-sm"
                                />
                                <button className="btn-primary px-4 py-2 text-sm">Send Invite</button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">No pending invites</p>
                        </div>
                    </div>
                )}

                {tab === 'find' && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="text" placeholder="Search squads by name or tag..." className="input-field pl-9" />
                        </div>
                        {recruitingSquads.map(squad => (
                            <div key={squad.id} className="glass-card p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                                        {squad.avatarEmoji}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-semibold text-white">{squad.name}</h3>
                                                <p className="text-sm text-slate-400 mt-0.5">{squad.description}</p>
                                                <div className="flex gap-2 mt-2">
                                                    {squad.tags.map(tag => <span key={tag} className="chip text-xs">{tag}</span>)}
                                                </div>
                                            </div>
                                            <button className="btn-primary text-xs px-4 py-2 flex-shrink-0">Apply</button>
                                        </div>
                                        <div className="flex gap-4 mt-3 pt-3 border-t border-white/[0.05]">
                                            <span className="text-xs text-slate-500">{squad.members.length} members</span>
                                            <span className="text-xs text-slate-500">Rank #{squad.globalRank}</span>
                                            <span className="text-xs text-emerald-400">Recruiting</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'create' && (
                    <div className="glass-card p-6 max-w-xl">
                        <h2 className="text-lg font-bold text-white mb-5">Create a New Squad</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Squad Name *</label>
                                <input type="text" placeholder="e.g. Apex Protocol" className="input-field" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                                <textarea placeholder="What is your squad about? What engineering areas do you focus on?" className="input-field resize-none h-20" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2">Required Roles</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Frontend Specialist', 'Backend Engineer', 'Full Stack Engineer', 'DevOps Engineer', 'Data Scientist', 'ML Engineer'].map(role => (
                                        <label key={role} className="flex items-center gap-2 p-2.5 rounded-lg border border-white/[0.06] hover:border-indigo-500/20 cursor-pointer text-sm text-slate-400">
                                            <input type="checkbox" className="rounded accent-indigo-500" />
                                            {getRoleIcon(role as any)} {getRoleShort(role as any)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                                    <input type="checkbox" className="rounded accent-indigo-500" defaultChecked /> Open for recruitment
                                </label>
                            </div>
                            <button className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                                <Plus size={16} /> Create Squad
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
