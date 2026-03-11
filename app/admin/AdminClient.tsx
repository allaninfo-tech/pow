'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Database } from '@/lib/database.types';
import { Plus, Edit, Trash2, ShieldAlert, Users, Code2, Activity, Shield, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

type Challenge = Database['public']['Tables']['challenges']['Row'];
type User = { id: string; display_name: string; email: string; league: string | null; global_rank: number | null; joined_at: string | null; is_admin: boolean | null };
type Stats = { totalUsers: number; totalSubmissions: number; activeChallenges: number };

export default function AdminClient({ 
    initialChallenges, 
    stats, 
    users: initialUsers 
}: { 
    initialChallenges: Challenge[]; 
    stats: Stats; 
    users: User[]; 
}) {
    const [activeTab, setActiveTab] = useState<'challenges' | 'users'>('challenges');
    
    const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
    const [users, setUsers] = useState<User[]>(initialUsers);

    // Editing Challenge State
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentChallenge, setCurrentChallenge] = useState<Partial<Challenge>>({});

    // Helpers to manage array states in the challenge
    const handleArrayChange = (field: keyof Challenge, value: string, index: number) => {
        const arr = [...(currentChallenge[field] as string[] || [])];
        arr[index] = value;
        setCurrentChallenge(prev => ({ ...prev, [field]: arr }));
    };

    const addArrayItem = (field: keyof Challenge) => {
        const arr = [...(currentChallenge[field] as string[] || []), ''];
        setCurrentChallenge(prev => ({ ...prev, [field]: arr }));
    };

    const removeArrayItem = (field: keyof Challenge, index: number) => {
        const arr = [...(currentChallenge[field] as string[] || [])];
        arr.splice(index, 1);
        setCurrentChallenge(prev => ({ ...prev, [field]: arr }));
    };

    // JSON Evaluation Criteria
    const handleCriteriaChange = (index: number, key: string, value: any) => {
        const criteria = [...(currentChallenge.evaluation_criteria as any[] || [])];
        criteria[index] = { ...criteria[index], [key]: value };
        setCurrentChallenge(prev => ({ ...prev, evaluation_criteria: criteria as any }));
    };

    const addCriteria = () => {
        const criteria = [...(currentChallenge.evaluation_criteria as any[] || []), { name: '', weight: 10, description: '' }];
        setCurrentChallenge(prev => ({ ...prev, evaluation_criteria: criteria as any }));
    };

    const removeCriteria = (index: number) => {
        const criteria = [...(currentChallenge.evaluation_criteria as any[] || [])];
        criteria.splice(index, 1);
        setCurrentChallenge(prev => ({ ...prev, evaluation_criteria: criteria as any }));
    };

    const handleSaveChallenge = async () => {
        const supabase = createClient();
        
        // Clean up empty strings from arrays
        const cleanArray = (arr: any) => Array.isArray(arr) ? arr.filter(x => typeof x === 'string' && x.trim() !== '') : [];
        
        const payload: any = {
            title: currentChallenge.title || 'New Challenge',
            short_description: currentChallenge.short_description || '',
            client_scenario: currentChallenge.client_scenario || '',
            tier: currentChallenge.tier || 1,
            mode: currentChallenge.mode || 'Solo',
            status: currentChallenge.status || 'Draft',
            deadline: currentChallenge.deadline || null,
            functional_requirements: cleanArray(currentChallenge.functional_requirements),
            technical_constraints: cleanArray(currentChallenge.technical_constraints),
            performance_constraints: cleanArray(currentChallenge.performance_constraints),
            allowed_stack: cleanArray(currentChallenge.allowed_stack),
            required_roles: cleanArray(currentChallenge.required_roles),
            tags: cleanArray(currentChallenge.tags),
            evaluation_criteria: Array.isArray(currentChallenge.evaluation_criteria) ? currentChallenge.evaluation_criteria : []
        };

        if (currentChallenge.id) {
            const { error, data } = await supabase.from('challenges').update(payload).eq('id', currentChallenge.id).select().single();
            if (!error && data) {
                 setChallenges(prev => prev.map(c => c.id === data.id ? data : c));
                 setIsEditing(false);
            } else {
                 alert('Error updating challenge');
            }
        } else {
            const { error, data } = await supabase.from('challenges').insert([payload]).select().single();
            if (!error && data) {
                setChallenges(prev => [data, ...prev]);
                setIsEditing(false);
            } else {
                alert('Error creating challenge');
            }
        }
    };

    const handleDeleteChallenge = async (id: string) => {
        if (!confirm('Are you sure you want to delete this challenge?')) return;
        const supabase = createClient();
        const { error } = await supabase.from('challenges').delete().eq('id', id);
        if (!error) {
            setChallenges(prev => prev.filter(c => c.id !== id));
        }
    };

    const toggleAdminStatus = async (userId: string, currentAdminStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentAdminStatus ? 'revoke' : 'grant'} admin privileges?`)) return;
        
        const supabase = createClient();
        const { error } = await supabase.from('users').update({ is_admin: !currentAdminStatus } as any).eq('id', userId);
        if (!error) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentAdminStatus } : u));
        } else {
            alert('Failed to update user privileges');
        }
    };

    const renderArrayInput = (field: keyof Challenge, label: string) => {
        const arr = (currentChallenge[field] as string[]) || [];
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</label>
                    <button onClick={() => addArrayItem(field)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">+ Add Item</button>
                </div>
                {arr.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <input 
                            value={val} 
                            onChange={e => handleArrayChange(field, e.target.value, idx)}
                            className="input-field py-1.5 text-sm flex-1"
                            placeholder="Enter value..."
                        />
                        <button onClick={() => removeArrayItem(field, idx)} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <AppShell>
            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                {/* Header & Stats */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ShieldAlert size={28} className="text-rose-400" /> 
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">Platform overview and management console.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-card p-5 border-indigo-500/20 bg-indigo-500/[0.02]">
                            <div className="flex items-center gap-3 mb-2 text-indigo-400">
                                <Users size={18} />
                                <h3 className="font-semibold text-sm">Total Members</h3>
                            </div>
                            <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
                        </div>
                        <div className="glass-card p-5 border-emerald-500/20 bg-emerald-500/[0.02]">
                            <div className="flex items-center gap-3 mb-2 text-emerald-400">
                                <Activity size={18} />
                                <h3 className="font-semibold text-sm">Active Challenges</h3>
                            </div>
                            <p className="text-3xl font-black text-white">{stats.activeChallenges}</p>
                        </div>
                        <div className="glass-card p-5 border-cyan-500/20 bg-cyan-500/[0.02]">
                            <div className="flex items-center gap-3 mb-2 text-cyan-400">
                                <Code2 size={18} />
                                <h3 className="font-semibold text-sm">Total Submissions</h3>
                            </div>
                            <p className="text-3xl font-black text-white">{stats.totalSubmissions}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4 border-b border-white/[0.06] mb-6">
                    <button 
                        onClick={() => setActiveTab('challenges')}
                        className={cn("px-4 py-3 text-sm font-medium transition-colors border-b-2", activeTab === 'challenges' ? "text-indigo-400 border-indigo-500" : "text-slate-400 border-transparent hover:text-white")}
                    >
                        Challenges
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={cn("px-4 py-3 text-sm font-medium transition-colors border-b-2", activeTab === 'users' ? "text-indigo-400 border-indigo-500" : "text-slate-400 border-transparent hover:text-white")}
                    >
                        User Management
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'challenges' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button 
                                onClick={() => {
                                    setCurrentChallenge({ status: 'Draft', tier: 1, mode: 'Solo' });
                                    setIsEditing(true);
                                }}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Plus size={16} /> Create Challenge
                            </button>
                        </div>

                        <div className="glass-card overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/[0.06] text-xs font-medium text-slate-400 bg-white/[0.02]">
                                        <th className="px-4 py-3">Title</th>
                                        <th className="px-4 py-3">Tier</th>
                                        <th className="px-4 py-3">Mode</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Deadline</th>
                                        <th className="px-4 py-3">Participants</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.06]">
                                    {challenges.map(challenge => (
                                        <tr key={challenge.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-4 text-sm font-medium text-slate-200">
                                                <div className="line-clamp-1">{challenge.title}</div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-400">Tier {challenge.tier}</td>
                                            <td className="px-4 py-4 text-sm text-slate-400">{challenge.mode}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                                    challenge.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                                                    challenge.status === 'Draft' ? "bg-slate-500/10 text-slate-400 border-slate-500/20" : 
                                                    challenge.status === 'Completed' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                    "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                )}>
                                                    {challenge.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-400">
                                                {challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-400">{challenge.participants_count || 0}</td>
                                            <td className="px-4 py-4 text-right space-x-2 whitespace-nowrap">
                                                <button 
                                                    onClick={() => {
                                                        setCurrentChallenge(challenge);
                                                        setIsEditing(true);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors border border-transparent hover:border-indigo-500/20"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteChallenge(challenge.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {challenges.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                                                No challenges found. Create one.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/[0.06] text-xs font-medium text-slate-400 bg-white/[0.02]">
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">League</th>
                                    <th className="px-4 py-3">Rank</th>
                                    <th className="px-4 py-3">Joined</th>
                                    <th className="px-4 py-3 text-right">Admin Access</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.06]">
                                {users.map((u, i) => (
                                    <tr key={u.id || i} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                                    {u.display_name ? u.display_name.slice(0, 2).toUpperCase() : '??'}
                                                </div>
                                                <span className="text-sm font-medium text-slate-200">{u.display_name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-400">{u.email}</td>
                                        <td className="px-4 py-4 text-sm text-slate-400">
                                            <span className="badge bg-slate-800 border-white/10 text-slate-300">
                                                {u.league || 'Newbie'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-mono text-indigo-400">#{u.global_rank || 0}</td>
                                        <td className="px-4 py-4 text-sm text-slate-400">
                                            {u.joined_at ? new Date(u.joined_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button 
                                                onClick={() => toggleAdminStatus(u.id, !!u.is_admin)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 ml-auto transition-colors",
                                                    u.is_admin 
                                                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20" 
                                                        : "bg-slate-800 border-white/10 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/30"
                                                )}
                                            >
                                                <Shield size={14} />
                                                {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* FULL COMPREHENSIVE EDIT MODAL */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/90 backdrop-blur-sm overflow-y-auto">
                    <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col my-auto border-indigo-500/20 relative">
                       <div className="sticky top-0 z-20 p-5 border-b border-white/[0.06] flex items-center justify-between w-full bg-slate-950/80 backdrop-blur-md">
                           <h2 className="text-xl font-bold text-white flex items-center gap-2">
                               <Edit size={20} className="text-indigo-400"/>
                               {currentChallenge.id ? 'Edit Challenge' : 'Create New Challenge'}
                           </h2>
                           <button onClick={() => setIsEditing(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                               <X size={20} />
                           </button>
                       </div>
                       
                       <div className="p-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto">
                           {/* LEFT COLUMN: Basic Info */}
                           <div className="space-y-6">
                               <div className="space-y-4">
                                   <h3 className="text-sm font-bold text-indigo-400 border-b border-indigo-500/20 pb-2">Basic Details</h3>
                                   <div>
                                       <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Title</label>
                                       <input 
                                           value={currentChallenge.title || ''} 
                                           onChange={e => setCurrentChallenge(prev => ({...prev, title: e.target.value}))}
                                           className="input-field py-2.5" 
                                           placeholder="E.g., Neural Network Optimizer"
                                       />
                                   </div>
                                   
                                   <div>
                                       <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Short Description</label>
                                       <textarea 
                                           value={currentChallenge.short_description || ''} 
                                           onChange={e => setCurrentChallenge(prev => ({...prev, short_description: e.target.value}))}
                                           className="input-field min-h-[80px]" 
                                           placeholder="A brief summary of the task..."
                                       />
                                   </div>

                                   <div>
                                       <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Client Scenario (Rich Context)</label>
                                       <textarea 
                                           value={currentChallenge.client_scenario || ''} 
                                           onChange={e => setCurrentChallenge(prev => ({...prev, client_scenario: e.target.value}))}
                                           className="input-field min-h-[120px]" 
                                           placeholder="Detailed background on why this needs to be built..."
                                       />
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                       <div>
                                           <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Tier (1-5)</label>
                                           <input 
                                               type="number" 
                                               min="1" max="5" 
                                               value={currentChallenge.tier || 1} 
                                               onChange={e => setCurrentChallenge(prev => ({...prev, tier: parseInt(e.target.value)}))}
                                               className="input-field py-2.5" 
                                           />
                                       </div>
                                       <div>
                                           <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Mode</label>
                                           <select 
                                                value={currentChallenge.mode || 'Solo'} 
                                                onChange={e => setCurrentChallenge(prev => ({...prev, mode: e.target.value}))}
                                                className="input-field py-2.5 w-full bg-slate-900"
                                            >
                                                <option value="Solo">Solo</option>
                                                <option value="Squad">Squad</option>
                                                <option value="Both">Both</option>
                                           </select>
                                       </div>
                                       <div>
                                           <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Status</label>
                                           <select 
                                                value={currentChallenge.status || 'Draft'} 
                                                onChange={e => setCurrentChallenge(prev => ({...prev, status: e.target.value}))}
                                                className="input-field py-2.5 w-full bg-slate-900"
                                            >
                                                <option value="Draft">Draft</option>
                                                <option value="Upcoming">Upcoming</option>
                                                <option value="Active">Active</option>
                                                <option value="Completed">Completed</option>
                                           </select>
                                       </div>
                                       <div>
                                           <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Deadline</label>
                                           <input 
                                               type="datetime-local" 
                                               value={currentChallenge.deadline ? new Date(new Date(currentChallenge.deadline).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} 
                                               onChange={e => setCurrentChallenge(prev => ({...prev, deadline: new Date(e.target.value).toISOString()}))}
                                               className="input-field py-2.5 w-full bg-slate-900 text-sm" 
                                           />
                                       </div>
                                   </div>
                               </div>

                               <div className="space-y-4 pt-4">
                                   <h3 className="text-sm font-bold text-emerald-400 border-b border-emerald-500/20 pb-2">Technical Specs</h3>
                                   {renderArrayInput('allowed_stack', 'Allowed Stack (e.g. React, Python)')}
                                   {renderArrayInput('required_roles', 'Required Roles')}
                                   {renderArrayInput('tags', 'Tags (e.g. database, api)')}
                               </div>
                           </div>

                           {/* RIGHT COLUMN: dynamic arrays */}
                           <div className="space-y-6">
                               <div className="space-y-6">
                                   <h3 className="text-sm font-bold text-rose-400 border-b border-rose-500/20 pb-2">Requirements & Constraints</h3>
                                   {renderArrayInput('functional_requirements', 'Functional Requirements')}
                                   {renderArrayInput('technical_constraints', 'Technical Constraints')}
                                   {renderArrayInput('performance_constraints', 'Performance Constraints')}
                               </div>

                               <div className="space-y-4 pt-4">
                                   <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                                       <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Evaluation Criteria</h3>
                                       <button onClick={addCriteria} className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-1 flex items-center gap-1 rounded border border-indigo-500/20">
                                            <Plus size={12} /> Add Metric
                                       </button>
                                   </div>
                                   
                                   <div className="space-y-3">
                                       {((currentChallenge.evaluation_criteria as any[]) || []).map((crit, idx) => (
                                           <div key={idx} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl relative group">
                                               <button onClick={() => removeCriteria(idx)} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                   <X size={12} />
                                               </button>
                                               <div className="grid grid-cols-4 gap-3 mb-3">
                                                   <div className="col-span-3">
                                                       <input 
                                                           placeholder="Criteria Name (e.g. Code Quality)"
                                                           value={crit.name || ''}
                                                           onChange={(e) => handleCriteriaChange(idx, 'name', e.target.value)}
                                                           className="input-field py-1.5 text-sm"
                                                       />
                                                   </div>
                                                   <div className="col-span-1 relative">
                                                       <input 
                                                           type="number"
                                                           placeholder="%"
                                                           value={crit.weight || 0}
                                                           onChange={(e) => handleCriteriaChange(idx, 'weight', parseInt(e.target.value))}
                                                           className="input-field py-1.5 text-sm pr-6"
                                                       />
                                                       <span className="absolute right-3 top-2 text-xs text-slate-500">%</span>
                                                   </div>
                                               </div>
                                               <input 
                                                   placeholder="Description..."
                                                   value={crit.description || ''}
                                                   onChange={(e) => handleCriteriaChange(idx, 'description', e.target.value)}
                                                   className="input-field py-1.5 text-sm w-full"
                                               />
                                           </div>
                                       ))}
                                       {((currentChallenge.evaluation_criteria as any[]) || []).length === 0 && (
                                           <p className="text-xs text-slate-500 italic text-center py-4 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                                               No evaluation criteria added. Progress bars won't appear.
                                           </p>
                                       )}
                                   </div>
                               </div>
                           </div>
                       </div>
                       
                       <div className="sticky bottom-0 z-20 p-5 border-t border-white/[0.06] flex items-center justify-between w-full bg-slate-950/80 backdrop-blur-md">
                           <button onClick={() => setIsEditing(false)} className="btn-ghost text-slate-400">Cancel</button>
                           <button onClick={handleSaveChallenge} className="btn-primary flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                               <Save size={16} /> Save Challenge Structure
                           </button>
                       </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
