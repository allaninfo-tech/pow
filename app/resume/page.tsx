'use client';

import AppShell from '@/components/layout/AppShell';
import { useStore } from '@/lib/store';
import LeagueBadge from '@/components/ui/LeagueBadge';
import Avatar from '@/components/ui/Avatar';
import { cn, getScoreColor, formatDate, getRoleIcon, formatNumber } from '@/lib/utils';
import { mockSubmissions } from '@/lib/mock/submissions';
import { FileText, Download, Github, Globe, Shield, Code2, Star, Flame, MapPin, ExternalLink, Printer } from 'lucide-react';

export default function ResumePage() {
    const { currentUser } = useStore();
    const submissions = mockSubmissions;

    const avgScores = {
        codeQuality: Math.round(submissions.reduce((a, s) => a + s.scores.codeQuality, 0) / submissions.length),
        architecture: Math.round(submissions.reduce((a, s) => a + s.scores.architecture, 0) / submissions.length),
        performance: Math.round(submissions.reduce((a, s) => a + s.scores.performance, 0) / submissions.length),
        security: Math.round(submissions.reduce((a, s) => a + s.scores.security, 0) / submissions.length),
        requirementAdherence: Math.round(submissions.reduce((a, s) => a + s.scores.requirementAdherence, 0) / submissions.length),
    };

    return (
        <AppShell>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Resume Generator</h1>
                        <p className="text-sm text-slate-500 mt-0.5">AI-verified, dynamically generated · Updates after every submission.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-ghost text-sm flex items-center gap-2 py-2 px-4">
                            <Printer size={16} /> Print
                        </button>
                        <button className="btn-primary text-sm flex items-center gap-2 py-2 px-4">
                            <Download size={16} /> Download PDF
                        </button>
                    </div>
                </div>

                {/* Resume preview */}
                <div className="glass-card overflow-hidden">
                    {/* Resume header accent */}
                    <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-400" />

                    <div className="p-8 space-y-8">
                        {/* Profile section */}
                        <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 border-b border-white/[0.06]">
                            <Avatar initials={currentUser.avatar} size="xl" className="ring-2 ring-indigo-500/30 flex-shrink-0" />
                            <div className="flex-1">
                                <h2 className="text-3xl font-black text-white">{currentUser.displayName}</h2>
                                <p className="text-indigo-400 font-semibold mt-1">{currentUser.role}</p>
                                <div className="flex gap-2 mt-2">
                                    <LeagueBadge league={currentUser.league} size="sm" />
                                    <span className="badge bg-slate-800/50 border-white/10 text-slate-400">Rank #{currentUser.globalRank}</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-3 max-w-xl">{currentUser.bio || 'Full-stack engineer building products users love. Passionate about clean APIs and DX.'}</p>
                                <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                                    {currentUser.location && <span className="flex items-center gap-1"><MapPin size={11} />{currentUser.location}</span>}
                                    <span className="flex items-center gap-1"><Github size={11} />github.com/{currentUser.githubUsername}</span>
                                    <span className="flex items-center gap-1 text-emerald-400"><Shield size={11} />GitHub Verified</span>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                {/* Badge embed preview */}
                                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield size={14} className="text-indigo-400" />
                                        <span className="text-xs font-semibold text-indigo-300">ProofStack Badge</span>
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-800 border border-indigo-500/30 rounded-lg">
                                        <span className="text-xs text-slate-400">⚡ Pro</span>
                                        <span className="w-px h-3 bg-white/10" />
                                        <span className="text-xs text-emerald-400 font-mono">76.3</span>
                                        <span className="w-px h-3 bg-white/10" />
                                        <span className="text-xs text-slate-500">#{currentUser.globalRank}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Score Metrics */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">AI-Verified Performance Scores</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {Object.entries(avgScores).map(([key, val]) => (
                                    <div key={key} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                                        <p className={cn('text-2xl font-black font-mono', getScoreColor(val))}>{val}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 capitalize leading-tight">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-600 mt-2">Averaged across {submissions.length} AI-evaluated submissions · Last updated {formatDate(new Date().toISOString())}</p>
                        </div>

                        {/* Top Projects */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Verified Projects</h3>
                            <div className="space-y-4">
                                {submissions.map((sub, i) => (
                                    <div key={sub.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-mono text-slate-500">Project {i + 1}</span>
                                                    <span className="badge bg-emerald-500/10 border-emerald-500/20 text-emerald-400">Tier {sub.tier}</span>
                                                </div>
                                                <h4 className="text-base font-semibold text-white">{sub.challengeTitle}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{sub.commitCount} commits · {formatDate(sub.submittedAt)}</p>
                                                <div className="flex gap-3 mt-2">
                                                    <a href={sub.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 flex items-center gap-1 hover:text-indigo-300">
                                                        <Globe size={10} /> Live
                                                    </a>
                                                    {sub.githubRepos.map(r => (
                                                        <a key={r} href={`https://github.com/${r}`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-300">
                                                            <Github size={10} /> {r}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-center flex-shrink-0">
                                                <p className={cn('text-3xl font-black font-mono', getScoreColor(sub.totalScore))}>{sub.totalScore}</p>
                                                <p className="text-[10px] text-slate-500">AI Score</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-3 leading-relaxed border-t border-white/[0.04] pt-3">
                                            {sub.aiReviewSummary.slice(0, 200)}...
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {currentUser.techStack.map(({ name, count }) => (
                                    <span key={name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm font-medium text-slate-300">
                                        <Code2 size={12} className="text-indigo-400" />
                                        {name}
                                        <span className="text-xs text-slate-500">{count}x</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Footer of resume */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                            <p className="text-xs text-slate-600">Generated by ProofStack · proofstack.io · AI-verified on {formatDate(new Date().toISOString())}</p>
                            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                <Shield size={12} /> Blockchain-verified integrity
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Download, label: 'Download PDF', desc: 'One-page A4 formatted resume', action: 'Download', primary: true },
                        { icon: ExternalLink, label: 'Share Link', desc: 'Public URL • No login required', action: 'Copy Link', primary: false },
                        { icon: Github, label: 'Embed Badge', desc: 'Add to your GitHub README', action: 'Get Code', primary: false },
                    ].map(({ icon: Icon, label, desc, action, primary }) => (
                        <div key={label} className="glass-card p-4 text-center">
                            <Icon size={20} className="mx-auto mb-2 text-indigo-400" />
                            <p className="text-sm font-semibold text-slate-200">{label}</p>
                            <p className="text-xs text-slate-500 mb-3">{desc}</p>
                            <button className={primary ? 'btn-primary text-xs px-4 py-2 w-full' : 'btn-ghost text-xs px-4 py-2 w-full'}>{action}</button>
                        </div>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
