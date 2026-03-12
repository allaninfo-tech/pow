'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
    ShieldAlert, Users, Code2, Activity, Shield, X, Save, Plus, Edit, Trash2,
    BarChart3, Megaphone, Eye, EyeOff, Ban, Star, Globe, Github,
    CheckCircle, XCircle, Clock, Trophy
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Stats = {
    totalUsers: number; totalSubmissions: number; activeChallenges: number;
    platformAvgScore: number; totalSquads: number;
    leagueDistribution: { Newbie: number; Pro: number; Elite: number };
};
type Challenge = any;
type User = any;
type Submission = any;
type Announcement = any;
type ActivityEntry = any;

type Tab = 'overview' | 'challenges' | 'submissions' | 'showcase' | 'users' | 'activity' | 'platform';

const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'challenges', label: 'Challenges', icon: Code2 },
    { id: 'submissions', label: 'Submissions', icon: Activity },
    { id: 'showcase', label: 'Showcase', icon: Trophy },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Activity Log', icon: Clock },
    { id: 'platform', label: 'Platform', icon: Megaphone },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function logActivity(supabase: any, adminId: string, action: string, targetType?: string, targetId?: string, metadata?: any) {
    await (supabase as any).from('admin_activity_log').insert([{ admin_id: adminId, action, target_type: targetType, target_id: targetId, metadata }]);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
    return (
        <div className={cn('glass-card p-5 border', color)}>
            <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={color.replace('border-', 'text-').replace('/20', '/80')} />
                <span className="text-xs font-medium text-slate-400">{label}</span>
            </div>
            <p className="text-3xl font-black text-white">{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        Completed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        Upcoming: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        Approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        Rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        banned: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return (
        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border', map[status] ?? 'bg-slate-700 text-slate-300 border-slate-600')}>
            {status}
        </span>
    );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ stats, topUsers }: { stats: Stats; topUsers: User[] }) {
    const { leagueDistribution: ld } = stats;
    const total = ld.Newbie + ld.Pro + ld.Elite || 1;
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Total Members" value={stats.totalUsers} icon={Users} color="border-indigo-500/20" />
                <StatCard label="Active Challenges" value={stats.activeChallenges} icon={Code2} color="border-emerald-500/20" />
                <StatCard label="Total Submissions" value={stats.totalSubmissions} icon={Activity} color="border-cyan-500/20" />
                <StatCard label="Platform Avg Score" value={stats.platformAvgScore || '—'} icon={Star} color="border-amber-500/20" />
                <StatCard label="Total Squads" value={stats.totalSquads} icon={Shield} color="border-violet-500/20" />
                <StatCard label="Elite Engineers" value={ld.Elite} icon={Trophy} color="border-rose-500/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* League distribution */}
                <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">League Distribution</h3>
                    <div className="space-y-3">
                        {([['Elite', ld.Elite, 'bg-amber-400'], ['Pro', ld.Pro, 'bg-indigo-400'], ['Newbie', ld.Newbie, 'bg-slate-500']] as const).map(([league, count, color]) => (
                            <div key={league} className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 w-14">{league}</span>
                                <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden">
                                    <div className={cn('h-full rounded-full', color)} style={{ width: `${(count / total) * 100}%` }} />
                                </div>
                                <span className="text-xs font-mono text-slate-300 w-8 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top users */}
                <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Engineers by Score</h3>
                    <div className="space-y-3">
                        {topUsers.map((u, i) => (
                            <div key={u.id} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-amber-400 w-5">#{i + 1}</span>
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                    {(u.display_name || 'U').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-200 truncate">{u.display_name}</p>
                                    <p className="text-[10px] text-slate-500">{u.role}</p>
                                </div>
                                <span className="text-xs font-mono font-bold text-emerald-400">{Number(u.avg_ai_score).toFixed(1)}</span>
                            </div>
                        ))}
                        {topUsers.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No scored users yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Challenges Tab ───────────────────────────────────────────────────────────
function ChallengesTab({ challenges: init, adminId }: { challenges: Challenge[]; adminId: string }) {
    const [challenges, setChallenges] = useState<Challenge[]>(init);
    const [editing, setEditing] = useState(false);
    const [current, setCurrent] = useState<Partial<Challenge>>({});

    const handleArray = (field: string, val: string, idx: number) => {
        const arr = [...(current[field] as string[] || [])]; arr[idx] = val;
        setCurrent(p => ({ ...p, [field]: arr }));
    };
    const addItem = (f: string) => setCurrent(p => ({ ...p, [f]: [...((p[f] as string[]) || []), ''] }));
    const removeItem = (f: string, i: number) => { const a = [...(current[f] as string[] || [])]; a.splice(i, 1); setCurrent(p => ({ ...p, [f]: a })); };
    const handleCrit = (i: number, k: string, v: any) => { const c = [...(current.evaluation_criteria as any[] || [])]; c[i] = { ...c[i], [k]: v }; setCurrent(p => ({ ...p, evaluation_criteria: c })); };

    const save = async () => {
        const supabase = createClient();
        const clean = (a: any) => Array.isArray(a) ? a.filter((x: string) => x.trim()) : [];
        const payload: any = {
            title: current.title || 'New Challenge', short_description: current.short_description || '',
            client_scenario: current.client_scenario || '', tier: current.tier || 1, mode: current.mode || 'Solo',
            status: current.status || 'Draft', deadline: current.deadline || null,
            functional_requirements: clean(current.functional_requirements), technical_constraints: clean(current.technical_constraints),
            performance_constraints: clean(current.performance_constraints), allowed_stack: clean(current.allowed_stack),
            required_roles: clean(current.required_roles), tags: clean(current.tags),
            evaluation_criteria: Array.isArray(current.evaluation_criteria) ? current.evaluation_criteria : [],
        };
        if (current.id) {
            const { data, error } = await supabase.from('challenges').update(payload).eq('id', current.id).select().single();
            if (!error && data) { setChallenges(p => p.map(c => c.id === data.id ? data : c)); setEditing(false); await logActivity(supabase, adminId, 'UPDATE_CHALLENGE', 'challenge', current.id, { title: payload.title }); }
            else alert('Error updating');
        } else {
            const { data, error } = await supabase.from('challenges').insert([payload]).select().single();
            if (!error && data) { setChallenges(p => [data, ...p]); setEditing(false); await logActivity(supabase, adminId, 'CREATE_CHALLENGE', 'challenge', data.id, { title: payload.title }); }
            else alert('Error creating');
        }
    };

    const del = async (id: string) => {
        if (!confirm('Delete this challenge?')) return;
        const supabase = createClient();
        await supabase.from('challenges').delete().eq('id', id);
        setChallenges(p => p.filter(c => c.id !== id));
        await logActivity(supabase, adminId, 'DELETE_CHALLENGE', 'challenge', id);
    };

    const ArrayField = ({ field, label }: { field: string; label: string }) => (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase">{label}</label>
                <button onClick={() => addItem(field)} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add</button>
            </div>
            {((current[field] as string[]) || []).map((v, i) => (
                <div key={i} className="flex gap-2">
                    <input value={v} onChange={e => handleArray(field, e.target.value, i)} className="input-field py-1.5 text-sm flex-1" placeholder="Enter..." />
                    <button onClick={() => removeItem(field, i)} className="text-slate-500 hover:text-rose-400 p-1"><X size={14} /></button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={() => { setCurrent({ status: 'Draft', tier: 1, mode: 'Solo' }); setEditing(true); }} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={15} /> Create Challenge
                </button>
            </div>
            <div className="glass-card overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b border-white/[0.06] text-xs text-slate-400 bg-white/[0.02]">
                        {['Title', 'Tier', 'Mode', 'Status', 'Deadline', 'Participants', ''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-white/[0.06]">
                        {challenges.map(c => (
                            <tr key={c.id} className="hover:bg-white/[0.02]">
                                <td className="px-4 py-3 text-sm font-medium text-slate-200 max-w-xs truncate">{c.title}</td>
                                <td className="px-4 py-3 text-sm text-slate-400">Tier {c.tier}</td>
                                <td className="px-4 py-3 text-sm text-slate-400">{c.mode}</td>
                                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                                <td className="px-4 py-3 text-xs text-slate-400">{c.deadline ? new Date(c.deadline).toLocaleDateString() : '—'}</td>
                                <td className="px-4 py-3 text-sm text-slate-400">{c.participants_count || 0}</td>
                                <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                                    <button onClick={() => { setCurrent(c); setEditing(true); }} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg border border-transparent hover:border-indigo-500/20 transition-colors"><Edit size={15} /></button>
                                    <button onClick={() => del(c.id)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-colors"><Trash2 size={15} /></button>
                                </td>
                            </tr>
                        ))}
                        {challenges.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">No challenges. Create one.</td></tr>}
                    </tbody>
                </table>
            </div>

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                    <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto my-auto border-indigo-500/20 flex flex-col">
                        <div className="sticky top-0 z-10 p-5 border-b border-white/[0.06] flex items-center justify-between bg-slate-950/90 backdrop-blur-md">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Edit size={18} className="text-indigo-400" />{current.id ? 'Edit' : 'Create'} Challenge</h2>
                            <button onClick={() => setEditing(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400"><X size={18} /></button>
                        </div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-indigo-400 uppercase border-b border-indigo-500/20 pb-2">Basic Details</h3>
                                {[['Title', 'title'], ['Short Description', 'short_description']].map(([l, f]) => (
                                    <div key={f}><label className="block text-xs text-slate-400 mb-1">{l}</label>
                                        <input value={(current as any)[f] || ''} onChange={e => setCurrent(p => ({ ...p, [f]: e.target.value }))} className="input-field" /></div>
                                ))}
                                <div><label className="block text-xs text-slate-400 mb-1">Client Scenario</label>
                                    <textarea value={current.client_scenario || ''} onChange={e => setCurrent(p => ({ ...p, client_scenario: e.target.value }))} className="input-field min-h-[100px]" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs text-slate-400 mb-1">Tier</label>
                                        <input type="number" min={1} max={5} value={current.tier || 1} onChange={e => setCurrent(p => ({ ...p, tier: +e.target.value }))} className="input-field" /></div>
                                    <div><label className="block text-xs text-slate-400 mb-1">Mode</label>
                                        <select value={current.mode || 'Solo'} onChange={e => setCurrent(p => ({ ...p, mode: e.target.value }))} className="input-field bg-slate-900 w-full">
                                            {['Solo', 'Squad', 'Both'].map(m => <option key={m}>{m}</option>)}
                                        </select></div>
                                    <div><label className="block text-xs text-slate-400 mb-1">Status</label>
                                        <select value={current.status || 'Draft'} onChange={e => setCurrent(p => ({ ...p, status: e.target.value }))} className="input-field bg-slate-900 w-full">
                                            {['Draft', 'Upcoming', 'Active', 'Completed'].map(s => <option key={s}>{s}</option>)}
                                        </select></div>
                                    <div><label className="block text-xs text-slate-400 mb-1">Deadline</label>
                                        <input type="datetime-local"
                                            value={current.deadline ? new Date(new Date(current.deadline).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                            onChange={e => setCurrent(p => ({ ...p, deadline: new Date(e.target.value).toISOString() }))}
                                            className="input-field bg-slate-900 w-full text-sm" /></div>
                                </div>
                                <ArrayField field="allowed_stack" label="Allowed Stack" />
                                <ArrayField field="required_roles" label="Required Roles" />
                                <ArrayField field="tags" label="Tags" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-rose-400 uppercase border-b border-rose-500/20 pb-2">Requirements & Constraints</h3>
                                <ArrayField field="functional_requirements" label="Functional Requirements" />
                                <ArrayField field="technical_constraints" label="Technical Constraints" />
                                <ArrayField field="performance_constraints" label="Performance Constraints" />
                                <div>
                                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-3">
                                        <h3 className="text-xs font-bold text-amber-400 uppercase">Evaluation Criteria</h3>
                                        <button onClick={() => setCurrent(p => ({ ...p, evaluation_criteria: [...((p.evaluation_criteria as any[]) || []), { name: '', weight: 10, description: '' }] }))} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><Plus size={12} /> Add</button>
                                    </div>
                                    {((current.evaluation_criteria as any[]) || []).map((cr, i) => (
                                        <div key={i} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-2 relative group">
                                            <button onClick={() => { const a = [...(current.evaluation_criteria as any[])]; a.splice(i, 1); setCurrent(p => ({ ...p, evaluation_criteria: a })); }} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                            <div className="grid grid-cols-4 gap-2 mb-2">
                                                <input className="input-field col-span-3 py-1 text-sm" placeholder="Name" value={cr.name || ''} onChange={e => handleCrit(i, 'name', e.target.value)} />
                                                <input className="input-field py-1 text-sm" placeholder="%" type="number" value={cr.weight || 0} onChange={e => handleCrit(i, 'weight', +e.target.value)} />
                                            </div>
                                            <input className="input-field w-full py-1 text-sm" placeholder="Description" value={cr.description || ''} onChange={e => handleCrit(i, 'description', e.target.value)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 p-5 border-t border-white/[0.06] flex justify-between bg-slate-950/90 backdrop-blur-md">
                            <button onClick={() => setEditing(false)} className="btn-ghost text-slate-400">Cancel</button>
                            <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={15} /> Save Challenge</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Submissions Tab ──────────────────────────────────────────────────────────
function SubmissionsTab({ submissions: init, adminId }: { submissions: Submission[]; adminId: string }) {
    const [submissions, setSubmissions] = useState<Submission[]>(init);
    const [filter, setFilter] = useState('All');

    const statuses = ['All', 'Pending', 'Completed', 'Approved', 'Rejected'];
    const filtered = filter === 'All' ? submissions : submissions.filter(s => s.status === filter);

    const updateStatus = async (id: string, status: string) => {
        const supabase = createClient();
        const { error } = await supabase.from('submissions').update({ status }).eq('id', id);
        if (!error) {
            setSubmissions(p => p.map(s => s.id === id ? { ...s, status } : s));
            await logActivity(supabase, adminId, `${status.toUpperCase()}_SUBMISSION`, 'submission', id);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
                {statuses.map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                            filter === s ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' : 'border-white/[0.06] text-slate-400 hover:text-slate-200')}>
                        {s}
                    </button>
                ))}
                <span className="ml-auto text-xs text-slate-500 self-center">{filtered.length} submissions</span>
            </div>
            <div className="glass-card overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b border-white/[0.06] text-xs text-slate-400 bg-white/[0.02]">
                        {['Challenge', 'User', 'Score', 'Tier', 'Status', 'Submitted', 'Links', 'Actions'].map(h => <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-white/[0.06]">
                        {filtered.map(s => (
                            <tr key={s.id} className="hover:bg-white/[0.02]">
                                <td className="px-4 py-3 text-sm text-slate-200 max-w-[160px] truncate">{s.challenge_title || '—'}</td>
                                <td className="px-4 py-3 text-sm text-slate-400">{s.display_name || s.username || '—'}</td>
                                <td className="px-4 py-3 text-sm font-mono font-bold text-emerald-400">{s.total_score || '—'}</td>
                                <td className="px-4 py-3 text-xs text-slate-400">Tier {s.tier || 1}</td>
                                <td className="px-4 py-3"><StatusBadge status={s.status || 'Pending'} /></td>
                                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '—'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        {s.live_url && <a href={s.live_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300"><Globe size={14} /></a>}
                                        {s.github_repos?.[0] && <a href={`https://github.com/${s.github_repos[0]}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-200"><Github size={14} /></a>}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1">
                                        <button onClick={() => updateStatus(s.id, 'Approved')} title="Approve" className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"><CheckCircle size={15} /></button>
                                        <button onClick={() => updateStatus(s.id, 'Rejected')} title="Reject" className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"><XCircle size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">No submissions found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Showcase Tab ─────────────────────────────────────────────────────────────
function ShowcaseTab({ submissions: init, adminId }: { submissions: Submission[]; adminId: string }) {
    const [submissions, setSubmissions] = useState<Submission[]>(init.filter(s => s.status === 'Completed' || s.status === 'Approved' || s.showcase_enabled));

    const toggleShowcase = async (id: string, current: boolean) => {
        const supabase = createClient();
        const { error } = await supabase.from('submissions').update({ showcase_enabled: !current }).eq('id', id);
        if (!error) {
            setSubmissions(p => p.map(s => s.id === id ? { ...s, showcase_enabled: !current } : s));
            await logActivity(supabase, adminId, current ? 'HIDE_SHOWCASE' : 'FEATURE_SHOWCASE', 'submission', id);
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-400">Toggle visibility of submissions in the public Showcase.</p>
            <div className="glass-card overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b border-white/[0.06] text-xs text-slate-400 bg-white/[0.02]">
                        {['Challenge', 'Author', 'Score', 'Featured', 'Live URL', 'Toggle'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-white/[0.06]">
                        {submissions.map(s => (
                            <tr key={s.id} className="hover:bg-white/[0.02]">
                                <td className="px-4 py-3 text-sm text-slate-200 max-w-[180px] truncate">{s.challenge_title || '—'}</td>
                                <td className="px-4 py-3 text-sm text-slate-400">{s.display_name || s.username || '—'}</td>
                                <td className="px-4 py-3 text-sm font-mono text-emerald-400">{s.total_score || '—'}</td>
                                <td className="px-4 py-3">
                                    <span className={cn('text-xs font-medium', s.showcase_enabled ? 'text-emerald-400' : 'text-slate-500')}>
                                        {s.showcase_enabled ? '✓ Featured' : 'Hidden'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {s.live_url ? <a href={s.live_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline truncate block max-w-[120px]">{s.live_url}</a> : <span className="text-slate-600 text-xs">—</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggleShowcase(s.id, !!s.showcase_enabled)}
                                        className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                                            s.showcase_enabled
                                                ? 'border-slate-600 text-slate-400 hover:border-rose-500/30 hover:text-rose-400 hover:bg-rose-500/10'
                                                : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10')}>
                                        {s.showcase_enabled ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Feature</>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {submissions.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">No completed submissions yet.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ users: init, adminId }: { users: User[]; adminId: string }) {
    const [users, setUsers] = useState<User[]>(init);
    const [search, setSearch] = useState('');

    const filtered = users.filter(u =>
        !search || (u.display_name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const toggleAdmin = async (uid: string, cur: boolean) => {
        if (!confirm(`${cur ? 'Revoke' : 'Grant'} admin privileges?`)) return;
        const supabase = createClient();
        const { error } = await supabase.from('users').update({ is_admin: !cur } as any).eq('id', uid);
        if (!error) { setUsers(p => p.map(u => u.id === uid ? { ...u, is_admin: !cur } : u)); await logActivity(supabase, adminId, cur ? 'REVOKE_ADMIN' : 'GRANT_ADMIN', 'user', uid); }
    };

    const toggleBan = async (uid: string, cur: string) => {
        const isBanned = cur === 'banned';
        if (!confirm(`${isBanned ? 'Unban' : 'Ban'} this user?`)) return;
        const newStatus = isBanned ? 'active' : 'banned';
        const supabase = createClient();
        const { error } = await (supabase as any).from('users').update({ status: newStatus }).eq('id', uid);
        if (!error) { setUsers(p => p.map(u => u.id === uid ? { ...u, status: newStatus } : u)); await logActivity(supabase, adminId, isBanned ? 'UNBAN_USER' : 'BAN_USER', 'user', uid); }
    };

    const setLeague = async (uid: string, league: string) => {
        const supabase = createClient();
        await supabase.from('users').update({ league }).eq('id', uid);
        setUsers(p => p.map(u => u.id === uid ? { ...u, league } : u));
        await logActivity(supabase, adminId, 'OVERRIDE_LEAGUE', 'user', uid, { league });
    };

    const setRole = async (uid: string, role: string) => {
        const supabase = createClient();
        await supabase.from('users').update({ role }).eq('id', uid);
        setUsers(p => p.map(u => u.id === uid ? { ...u, role } : u));
        await logActivity(supabase, adminId, 'CHANGE_ROLE', 'user', uid, { role });
    };

    const LEAGUES = ['Newbie', 'Pro', 'Elite'];
    const ROLES = ['Full Stack Engineer', 'Frontend Specialist', 'Backend Engineer', 'DevOps Engineer', 'Data Scientist', 'ML Engineer', 'UI/UX Designer'];

    return (
        <div className="space-y-4">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="input-field max-w-sm" />
            <div className="glass-card overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b border-white/[0.06] text-xs text-slate-400 bg-white/[0.02]">
                        {['User', 'Email', 'League', 'Role', 'Avg Score', 'Status', 'Admin', 'Actions'].map(h => <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-white/[0.06]">
                        {filtered.map(u => (
                            <tr key={u.id} className="hover:bg-white/[0.02]">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 flex-shrink-0">{(u.display_name || '??').slice(0, 2).toUpperCase()}</div>
                                        <span className="text-sm font-medium text-slate-200 truncate max-w-[100px]">{u.display_name || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-400 max-w-[150px] truncate">{u.email}</td>
                                <td className="px-4 py-3">
                                    <select value={u.league || 'Newbie'} onChange={e => setLeague(u.id, e.target.value)} className="bg-slate-900 border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-slate-300">
                                        {LEAGUES.map(l => <option key={l}>{l}</option>)}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <select value={u.role || 'Full Stack Engineer'} onChange={e => setRole(u.id, e.target.value)} className="bg-slate-900 border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-slate-300 max-w-[140px]">
                                        {ROLES.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-sm font-mono text-amber-400">{u.avg_ai_score ? Number(u.avg_ai_score).toFixed(1) : '—'}</td>
                                <td className="px-4 py-3"><StatusBadge status={u.status || 'active'} /></td>
                                <td className="px-4 py-3">
                                    {u.is_admin ? <span className="text-xs text-rose-400 flex items-center gap-1"><Shield size={12} /> Admin</span> : <span className="text-xs text-slate-600">—</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1">
                                        <button onClick={() => toggleBan(u.id, u.status || 'active')} title={u.status === 'banned' ? 'Unban' : 'Ban'}
                                            className={cn('p-1.5 rounded-lg text-xs border transition-colors', u.status === 'banned' ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10' : 'border-rose-500/20 text-rose-400 hover:bg-rose-500/10')}>
                                            <Ban size={14} />
                                        </button>
                                        <button onClick={() => toggleAdmin(u.id, !!u.is_admin)} title={u.is_admin ? 'Revoke Admin' : 'Grant Admin'}
                                            className={cn('p-1.5 rounded-lg text-xs border transition-colors', u.is_admin ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10')}>
                                            <Shield size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">No users found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Activity Log Tab ─────────────────────────────────────────────────────────
function ActivityTab({ log }: { log: ActivityEntry[] }) {
    const actionColor: Record<string, string> = {
        CREATE_CHALLENGE: 'text-emerald-400', UPDATE_CHALLENGE: 'text-indigo-400', DELETE_CHALLENGE: 'text-rose-400',
        APPROVED_SUBMISSION: 'text-emerald-400', REJECTED_SUBMISSION: 'text-rose-400',
        BAN_USER: 'text-rose-400', UNBAN_USER: 'text-emerald-400', GRANT_ADMIN: 'text-amber-400', REVOKE_ADMIN: 'text-slate-400',
        FEATURE_SHOWCASE: 'text-cyan-400', HIDE_SHOWCASE: 'text-slate-400',
        POST_ANNOUNCEMENT: 'text-violet-400', DEACTIVATE_ANNOUNCEMENT: 'text-slate-400',
    };
    return (
        <div className="space-y-3">
            {log.length === 0 && <div className="text-center py-16 text-slate-500"><Clock size={32} className="mx-auto mb-3 text-slate-700" /><p>No admin activity recorded yet.</p></div>}
            {log.map(entry => (
                <div key={entry.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn('text-xs font-mono font-bold', actionColor[entry.action] ?? 'text-slate-300')}>{entry.action}</span>
                            {entry.target_type && <span className="text-xs text-slate-500">on {entry.target_type}</span>}
                            {entry.metadata?.title && <span className="text-xs text-slate-400 truncate">"{entry.metadata.title}"</span>}
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5">{entry.created_at ? new Date(entry.created_at).toLocaleString() : ''}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Platform (Announcements) Tab ─────────────────────────────────────────────
function PlatformTab({ announcements: init, adminId }: { announcements: Announcement[]; adminId: string }) {
    const [announcements, setAnnouncements] = useState<Announcement[]>(init);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [posting, setPosting] = useState(false);

    const post = async () => {
        if (!title.trim() || !body.trim()) return;
        setPosting(true);
        const supabase = createClient();
        const { data, error } = await (supabase as any).from('platform_announcements').insert([{ title, body, created_by: adminId, is_active: true }]).select().single();
        if (!error && data) {
            setAnnouncements(p => [data, ...p]);
            setTitle(''); setBody('');
            await logActivity(supabase, adminId, 'POST_ANNOUNCEMENT', 'announcement', data.id, { title });
        }
        setPosting(false);
    };

    const deactivate = async (id: string) => {
        const supabase = createClient();
        await (supabase as any).from('platform_announcements').update({ is_active: false }).eq('id', id);
        setAnnouncements(p => p.map(a => a.id === id ? { ...a, is_active: false } : a));
        await logActivity(supabase, adminId, 'DEACTIVATE_ANNOUNCEMENT', 'announcement', id);
    };

    const del = async (id: string) => {
        if (!confirm('Delete this announcement?')) return;
        const supabase = createClient();
        await (supabase as any).from('platform_announcements').delete().eq('id', id);
        setAnnouncements(p => p.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 border-violet-500/20">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4"><Megaphone size={16} className="text-violet-400" /> Post Announcement</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="Announcement title…" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Body</label>
                        <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="input-field resize-none" placeholder="Announcement content…" />
                    </div>
                    <div className="flex justify-end">
                        <button onClick={post} disabled={posting || !title.trim() || !body.trim()} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
                            {posting ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Megaphone size={14} />}
                            Post Announcement
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">All Announcements ({announcements.length})</h3>
                {announcements.length === 0 && <p className="text-sm text-slate-500 py-8 text-center">No announcements posted yet.</p>}
                {announcements.map(a => (
                    <div key={a.id} className={cn('p-4 rounded-xl border transition-colors', a.is_active ? 'border-violet-500/20 bg-violet-500/[0.03]' : 'border-white/[0.04] bg-white/[0.01] opacity-60')}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-semibold text-slate-200">{a.title}</h4>
                                    {a.is_active ? <span className="text-[10px] text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">Active</span> : <span className="text-[10px] text-slate-500 border border-white/[0.06] px-1.5 py-0.5 rounded-full">Inactive</span>}
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">{a.body}</p>
                                <p className="text-[10px] text-slate-600 mt-2">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                                {a.is_active && <button onClick={() => deactivate(a.id)} title="Deactivate" className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors border border-transparent hover:border-amber-500/20"><EyeOff size={14} /></button>}
                                <button onClick={() => del(a.id)} title="Delete" className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminClient({
    adminId, initialChallenges, stats, users, submissions, topUsers, announcements, activityLog,
}: {
    adminId: string; initialChallenges: Challenge[]; stats: Stats; users: User[];
    submissions: Submission[]; topUsers: User[]; announcements: Announcement[]; activityLog: ActivityEntry[];
}) {
    const [tab, setTab] = useState<Tab>('overview');

    return (
        <AppShell>
            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldAlert size={26} className="text-rose-400" /> Admin Dashboard
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Platform management console · {stats.totalUsers} members</p>
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto pb-0">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap -mb-px',
                                tab === id ? 'text-indigo-400 border-indigo-500' : 'text-slate-400 border-transparent hover:text-white')}>
                            <Icon size={15} />{label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div>
                    {tab === 'overview' && <OverviewTab stats={stats} topUsers={topUsers} />}
                    {tab === 'challenges' && <ChallengesTab challenges={initialChallenges} adminId={adminId} />}
                    {tab === 'submissions' && <SubmissionsTab submissions={submissions} adminId={adminId} />}
                    {tab === 'showcase' && <ShowcaseTab submissions={submissions} adminId={adminId} />}
                    {tab === 'users' && <UsersTab users={users} adminId={adminId} />}
                    {tab === 'activity' && <ActivityTab log={activityLog} />}
                    {tab === 'platform' && <PlatformTab announcements={announcements} adminId={adminId} />}
                </div>
            </div>
        </AppShell>
    );
}
