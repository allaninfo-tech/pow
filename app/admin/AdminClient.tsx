'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Database } from '@/lib/database.types';
import { Plus, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

type Challenge = Database['public']['Tables']['challenges']['Row'];

export default function AdminClient({ initialChallenges }: { initialChallenges: Challenge[] }) {
    const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentChallenge, setCurrentChallenge] = useState<Partial<Challenge>>({});
    
    // We can extract saving logic into handleSave
    const handleSave = async () => {
        // Implement save logic to create or update challenge
        const supabase = createClient();
        if (currentChallenge.id) {
            // Update
            const { error, data } = await supabase
                .from('challenges')
                .update(currentChallenge as any)
                .eq('id', currentChallenge.id)
                .select()
                .single();
            if (!error && data) {
                 setChallenges(prev => prev.map(c => c.id === data.id ? data : c));
                 setIsEditing(false);
            }
        } else {
            // Insert
            const { error, data } = await supabase
                .from('challenges')
                .insert([{
                    title: currentChallenge.title || 'New Challenge',
                    short_description: currentChallenge.short_description || '',
                    tier: currentChallenge.tier || 1,
                    mode: currentChallenge.mode || 'Solo',
                    status: currentChallenge.status || 'Draft',
                    client_scenario: currentChallenge.client_scenario,
                    deadline: currentChallenge.deadline,
                }] as any)
                .select()
                .single();
            if (!error && data) {
                setChallenges(prev => [data, ...prev]);
                setIsEditing(false);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this challenge?')) return;
        const supabase = createClient();
        const { error } = await supabase.from('challenges').delete().eq('id', id);
        if (!error) {
            setChallenges(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <AppShell>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ShieldAlert size={24} className="text-rose-400" /> 
                            Admin Portal
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">Manage challenges and platform data.</p>
                    </div>
                    <button 
                        onClick={() => {
                            setCurrentChallenge({});
                            setIsEditing(true);
                        }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={16} /> New Challenge
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
                                <th className="px-4 py-3">Participants</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                            {challenges.map(challenge => (
                                <tr key={challenge.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-4 text-sm font-medium text-slate-200">{challenge.title}</td>
                                    <td className="px-4 py-4 text-sm text-slate-400">Tier {challenge.tier}</td>
                                    <td className="px-4 py-4 text-sm text-slate-400">{challenge.mode}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                            challenge.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                                            challenge.status === 'Draft' ? "bg-slate-500/10 text-slate-400 border-slate-500/20" : 
                                            "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                        )}>
                                            {challenge.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-400">{challenge.participants_count || 0}</td>
                                    <td className="px-4 py-4 text-right space-x-2">
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
                                            onClick={() => handleDelete(challenge.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {challenges.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                        No challenges found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col items-center justify-center">
                       <div className="p-6 border-b border-white/[0.06] flex items-center justify-between w-full">
                           <h2 className="text-lg font-bold text-white">{currentChallenge.id ? 'Edit Challenge' : 'New Challenge'}</h2>
                           <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">✕</button>
                       </div>
                       
                       <div className="space-y-4 p-6 w-full">
                           <div>
                               <label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label>
                               <input 
                                   value={currentChallenge.title || ''} 
                                   onChange={e => setCurrentChallenge(prev => ({...prev, title: e.target.value}))}
                                   className="input-field" 
                               />
                           </div>
                           
                           <div>
                               <label className="block text-xs font-medium text-slate-400 mb-1.5">Short Description</label>
                               <textarea 
                                   value={currentChallenge.short_description || ''} 
                                   onChange={e => setCurrentChallenge(prev => ({...prev, short_description: e.target.value}))}
                                   className="input-field min-h-[80px]" 
                               />
                           </div>

                           <div className="grid grid-cols-3 gap-4">
                               <div>
                                   <label className="block text-xs font-medium text-slate-400 mb-1.5">Tier (1-5)</label>
                                   <input 
                                       type="number" 
                                       min="1" max="5" 
                                       value={currentChallenge.tier || 1} 
                                       onChange={e => setCurrentChallenge(prev => ({...prev, tier: parseInt(e.target.value)}))}
                                       className="input-field" 
                                   />
                               </div>
                               <div>
                                   <label className="block text-xs font-medium text-slate-400 mb-1.5">Mode</label>
                                   <select 
                                        value={currentChallenge.mode || 'Solo'} 
                                        onChange={e => setCurrentChallenge(prev => ({...prev, mode: e.target.value}))}
                                        className="input-field w-full"
                                    >
                                        <option value="Solo">Solo</option>
                                        <option value="Squad">Squad</option>
                                        <option value="Both">Both</option>
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                                   <select 
                                        value={currentChallenge.status || 'Draft'} 
                                        onChange={e => setCurrentChallenge(prev => ({...prev, status: e.target.value}))}
                                        className="input-field w-full"
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Active">Active</option>
                                        <option value="Completed">Completed</option>
                                   </select>
                               </div>
                           </div>
                       </div>
                       
                       <div className="p-6 border-t border-white/[0.06] flex justify-end gap-3 w-full">
                           <button onClick={() => setIsEditing(false)} className="btn-ghost">Cancel</button>
                           <button onClick={handleSave} className="btn-primary">Save Challenge</button>
                       </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
