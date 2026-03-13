'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Code2, Github, Terminal, ArrowRight, CheckCircle2, ChevronRight, UserCircle, Target, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerConfetti } from '@/lib/confetti';

const roles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer', 'UI/UX Designer', 'Data Scientist', 'DevOps Engineer'];
const techStacks = [
    'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 
    'Node.js', 'Python', 'Go', 'Rust', 'Java', 'C#', 
    'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS'
];

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);

    // Form state
    const [role, setRole] = useState('');
    const [githubUsername, setGithubUsername] = useState('');
    const [selectedTech, setSelectedTech] = useState<string[]>([]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth');
                return;
            }
            setUserId(user.id);
            
            // Check if already onboarded (has role)
            const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
            if (data?.role && data.role !== 'Developer') {
                // Already onboarded
                router.push('/dashboard');
                return;
            }
            setProfile(data);
            setLoading(false);
        };
        checkUser();
    }, [router, supabase]);

    const handleTechToggle = (tech: string) => {
        if (selectedTech.includes(tech)) {
            setSelectedTech(prev => prev.filter(t => t !== tech));
        } else if (selectedTech.length < 5) {
            setSelectedTech(prev => [...prev, tech]);
        }
    };

    const handleComplete = async () => {
        if (!userId) return;
        setSaving(true);

        try {
            // Check if username starts with @ or full url and clean it
            let cleanGithub = githubUsername.trim();
            if (cleanGithub.startsWith('https://github.com/')) {
                cleanGithub = cleanGithub.replace('https://github.com/', '');
            } else if (cleanGithub.startsWith('@')) {
                cleanGithub = cleanGithub.substring(1);
            }

            const techStackJson = selectedTech.map(t => ({ name: t, count: 1 }));

            await supabase.from('users').update({
                role: role || 'Developer',
                github_username: cleanGithub || null,
                tech_stack: techStackJson
            }).eq('id', userId);

            triggerConfetti();
            router.push('/dashboard');
        } catch (error) {
            console.error('Error saving onboarding data:', error);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6 text-white">
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
                <p className="text-slate-400">Preparing your personalized experience...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy-950 flex flex-col p-6 text-white relative leading-relaxed">
            
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between mb-16 pt-8">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Terminal size={22} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">ProofStack</span>
                </div>
                
                {/* Steps indicator */}
                <div className="hidden sm:flex items-center gap-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                                step > s ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                step === s ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" :
                                "bg-white/5 text-slate-500"
                            )}>
                                {step > s ? <CheckCircle2 size={16} /> : s}
                            </div>
                            {s !== 3 && <ChevronRight size={16} className="text-slate-600" />}
                        </div>
                    ))}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 flex items-center justify-center">
                <div className="max-w-xl w-full">
                    
                    {/* Step 1: Role */}
                    <div className={cn("transition-all duration-500", step === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8 absolute pointer-events-none")}>
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
                                <UserCircle size={14} /> Step 1 of 3
                            </div>
                            <h1 className="text-4xl font-bold mb-3 tracking-tight">How do you identify?</h1>
                            <p className="text-slate-400 text-lg">Select your primary role to help us categorize your ranking on the leaderboard.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            {roles.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={cn(
                                        "p-4 rounded-xl text-left border transition-all duration-200",
                                        role === r
                                            ? "bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] text-white font-medium"
                                            : "bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.04] hover:border-white/10"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button 
                                onClick={() => setStep(2)}
                                disabled={!role}
                                className="btn-primary flex items-center gap-2"
                            >
                                Continue <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Step 2: GitHub (Optional) */}
                    <div className={cn("transition-all duration-500 hidden sm:block", step === 2 ? "opacity-100 translate-x-0 !block" : "opacity-0 translate-x-8 absolute pointer-events-none")}>
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
                                <Github size={14} /> Step 2 of 3
                            </div>
                            <h1 className="text-4xl font-bold mb-3 tracking-tight">Connect your work</h1>
                            <p className="text-slate-400 text-lg">Add your GitHub handle so others can check out your open-source contributions.</p>
                        </div>

                        <div className="mb-8 p-1 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                            <div className="bg-navy-950/80 rounded-xl p-6 backdrop-blur-xl">
                                <label className="block text-sm font-medium text-slate-300 mb-2">GitHub Username or URL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Github className="text-slate-500" size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="e.g. torvalds"
                                        value={githubUsername}
                                        onChange={(e) => setGithubUsername(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                                    <Target size={12} /> This will be displayed on your public ProofStack profile.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button onClick={() => setStep(1)} className="btn-ghost px-4 py-2 text-sm text-slate-400 hover:text-white">Back</button>
                            <div className="flex items-center gap-3">
                                {!githubUsername && (
                                    <button onClick={() => setStep(3)} className="text-sm font-medium text-slate-400 hover:text-white mr-2">Skip for now</button>
                                )}
                                <button 
                                    onClick={() => setStep(3)}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    Continue <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Tech Stack */}
                    <div className={cn("transition-all duration-500 hidden sm:block", step === 3 ? "opacity-100 translate-x-0 !block" : "opacity-0 translate-x-8 absolute pointer-events-none")}>
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
                                <Code2 size={14} /> Step 3 of 3
                            </div>
                            <h1 className="text-4xl font-bold mb-3 tracking-tight">Your primary weapons</h1>
                            <p className="text-slate-400 text-lg">Select up to 5 technologies you work with the most. We'll use this to recommend challenges.</p>
                        </div>

                        <div className="flex flex-wrap gap-2.5 mb-8">
                            {techStacks.map((tech) => {
                                const isSelected = selectedTech.includes(tech);
                                const isDisabled = !isSelected && selectedTech.length >= 5;
                                
                                return (
                                    <button
                                        key={tech}
                                        onClick={() => handleTechToggle(tech)}
                                        disabled={isDisabled}
                                        className={cn(
                                            "px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200",
                                            isSelected 
                                                ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                                                : isDisabled 
                                                    ? "bg-white/[0.01] border-white/5 text-slate-600 cursor-not-allowed"
                                                    : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:border-white/20"
                                        )}
                                    >
                                        {tech}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/10">
                            <button onClick={() => setStep(2)} disabled={saving} className="btn-ghost px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-50">Back</button>
                            <button 
                                onClick={handleComplete}
                                disabled={selectedTech.length === 0 || saving}
                                className="btn-primary py-3 px-8 text-base shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_45px_rgba(99,102,241,0.4)] flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : null}
                                {saving ? 'Preparing Dashboard...' : 'Jump into ProofStack !'} 
                                {!saving && <ArrowRight size={18} />}
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
