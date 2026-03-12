'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Terminal, Github, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import TypewriterTerminal from '@/components/ui/TypewriterTerminal';
import { createClient } from '@/lib/supabase/client';

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-cyan-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
}

const roles = [
    { icon: '🎨', name: 'Frontend Specialist', desc: 'React, Vue, UI systems' },
    { icon: '⚙️', name: 'Backend Engineer', desc: 'APIs, databases, services' },
    { icon: '🔗', name: 'Full Stack Engineer', desc: 'End-to-end development' },
    { icon: '🚀', name: 'DevOps Engineer', desc: 'Infra, CI/CD, Kubernetes' },
    { icon: '📊', name: 'Data Scientist', desc: 'Analytics, ML, data pipelines' },
    { icon: '🤖', name: 'ML Engineer', desc: 'Model training, MLOps' },
    { icon: '✨', name: 'UI/UX Designer', desc: 'Design systems, prototyping' },
];

export default function AuthPage() {
    const router = useRouter();
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const strength = useMemo(() => getPasswordStrength(password), [password]);

    const supabase = createClient();

    const handleOAuth = async (provider: 'google' | 'github') => {
        setLoading(true);
        setError(null);
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        // Page will redirect — no need to setLoading(false)
    };

    // supabase client created inside handleOAuth to avoid stale closure issues

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        router.refresh();
        router.push('/dashboard');
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) { setStep(2); return; }
        if (step === 2 && !selectedRole) return;
        setLoading(true);
        setError(null);
        setSuccess(null);

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: name || email.split('@')[0],
                    role: selectedRole,
                }
            }
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // Insert user profile row
        if (authData.user) {
            const displayName = name || email.split('@')[0];
            await supabase.from('users').upsert({
                id: authData.user.id,
                email: email,
                username: email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + Math.floor(Math.random() * 1000),
                display_name: displayName,
                role: selectedRole,
                league: 'Newbie',
                joined_at: new Date().toISOString()
            }, { onConflict: 'id' });
        }

        setLoading(false);

        // If email confirmation is required, the session won't be set yet
        if (!authData.session) {
            setSuccess('Account created! Check your email to confirm your account, then sign in.');
            setTab('login');
            setStep(1);
            return;
        }

        // Session is active — go straight to dashboard
        router.refresh();
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex bg-[var(--bg-primary)]">
            {/* Left panel */}
            <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden border-r border-white/[0.06]">
                <div className="orb orb-indigo w-96 h-96 -top-20 -left-20" />
                <div className="orb orb-cyan w-64 h-64 bottom-20 right-0" />
                <div className="absolute inset-0 grid-bg opacity-30" />

                {/* Animated Background Code */}
                <TypewriterTerminal className="z-0" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(108,99,255,0.5)]">
                            <Terminal size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-bold text-gradient">ProofStack</span>
                    </Link>
                </div>

                <div className="relative">
                    <h2 className="text-4xl font-black text-white mb-6 leading-tight">
                        Your Code.<br />Your Proof.<br /><span className="text-gradient">Your Rank.</span>
                    </h2>
                    <div className="space-y-4">
                        {[
                            'AI evaluates every line you write',
                            'Real-time global leaderboard',
                            'Verified portfolio recruiters trust',
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                    <Check size={11} className="text-emerald-400" />
                                </div>
                                <span className="text-sm text-slate-400">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative text-xs text-slate-600 mt-6 z-10">© 2026 ProofStack. All rights reserved.</p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                <div className="absolute inset-0 grid-bg opacity-10" />
                <div className="w-full max-w-md relative z-10">
                    {/* Logo mobile */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                            <Terminal size={16} className="text-white" />
                        </div>
                        <span className="text-base font-bold text-gradient">ProofStack</span>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-8">
                        {(['login', 'register'] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => { setTab(t); setStep(1); }}
                                className={cn(
                                    'flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 capitalize',
                                    tab === t
                                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_0_15px_rgba(108,99,255,0.4)]'
                                        : 'text-slate-400 hover:text-slate-200'
                                )}
                            >
                                {t === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        ))}
                    </div>

                    {/* Loading Bar */}
                    {loading && (
                        <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-white/10">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 absolute left-0 w-1/3 animate-[slideRight_1s_infinite_linear]" />
                            <style>{`
                                @keyframes slideRight {
                                    0% { transform: translateX(-100%); }
                                    100% { transform: translateX(300%); }
                                }
                            `}</style>
                        </div>
                    )}

                    {success && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
                            {success}
                        </div>
                    )}

                    {tab === 'login' ? (
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
                            <p className="text-sm text-slate-400 mb-8">Sign in to continue building your verified portfolio.</p>

                            {/* OAuth buttons */}
                            <div className="space-y-2.5 mb-6">
                                <button
                                    type="button"
                                    onClick={() => handleOAuth('google')}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-slate-300 hover:bg-white/[0.07] transition-all disabled:opacity-50"
                                >
                                    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                                        <path d="M43.6 20.5H24v7h11.3c-1.6 5.5-6.4 9-11.3 9a12 12 0 1 1 0-24c3 0 5.7 1.1 7.8 2.9l5.3-5.3A20 20 0 1 0 24 44c11 0 20-9 20-20 0-1.2-.1-2.5-.4-3.5z" fill="#FFC107"/>
                                        <path d="m6.3 14.7 6.1 4.5A12 12 0 0 1 24 12c3 0 5.7 1.1 7.8 2.9l5.3-5.3A20 20 0 0 0 6.3 14.7z" fill="#FF3D00"/>
                                        <path d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.3A12 12 0 0 1 12.3 26L6.3 30.6C9.5 37.6 16.3 44 24 44z" fill="#4CAF50"/>
                                        <path d="M43.6 20.5H24v7h11.3c-.7 2.5-2.4 4.6-4.7 6l6.2 5.3C40.5 35.7 44 30.3 44 24c0-1.2-.1-2.5-.4-3.5z" fill="#1976D2"/>
                                    </svg>
                                    Continue with Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOAuth('github')}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-slate-300 hover:bg-white/[0.07] transition-all disabled:opacity-50"
                                >
                                    <Github size={18} />
                                    Continue with GitHub
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <div className="divider" />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-0.5 bg-[var(--bg-primary)] text-xs text-slate-500">
                                    or email
                                </span>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                        {error}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            className="input-field pl-10"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder=""
                                            className="input-field pl-10 pr-10"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 mt-1.5 inline-block">Forgot password?</a>
                                </div>
                                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <><span>Sign In</span><ArrowRight size={16} /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            {step === 1 ? (
                                <>
                                    <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
                                    <p className="text-sm text-slate-400 mb-8">Join the global engineering competition platform.</p>

                                    {/* OAuth buttons */}
                                    <div className="space-y-2.5 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => handleOAuth('google')}
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-slate-300 hover:bg-white/[0.07] transition-all disabled:opacity-50"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                                                <path d="M43.6 20.5H24v7h11.3c-1.6 5.5-6.4 9-11.3 9a12 12 0 1 1 0-24c3 0 5.7 1.1 7.8 2.9l5.3-5.3A20 20 0 1 0 24 44c11 0 20-9 20-20 0-1.2-.1-2.5-.4-3.5z" fill="#FFC107"/>
                                                <path d="m6.3 14.7 6.1 4.5A12 12 0 0 1 24 12c3 0 5.7 1.1 7.8 2.9l5.3-5.3A20 20 0 0 0 6.3 14.7z" fill="#FF3D00"/>
                                                <path d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.3A12 12 0 0 1 12.3 26L6.3 30.6C9.5 37.6 16.3 44 24 44z" fill="#4CAF50"/>
                                                <path d="M43.6 20.5H24v7h11.3c-.7 2.5-2.4 4.6-4.7 6l6.2 5.3C40.5 35.7 44 30.3 44 24c0-1.2-.1-2.5-.4-3.5z" fill="#1976D2"/>
                                            </svg>
                                            Register with Google
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOAuth('github')}
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-slate-300 hover:bg-white/[0.07] transition-all disabled:opacity-50"
                                        >
                                            <Github size={18} />
                                            Register with GitHub
                                        </button>
                                    </div>

                                    <div className="relative mb-6">
                                        <div className="divider" />
                                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-0.5 bg-[var(--bg-primary)] text-xs text-slate-500">
                                            or email
                                        </span>
                                    </div>

                                    <form onSubmit={handleRegister} className="space-y-4">
                                        {error && (
                                            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                                {error}
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                                            <div className="relative">
                                                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Your Name"
                                                    className="input-field pl-10"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                                            <div className="relative">
                                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    className="input-field pl-10"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                                            <div className="relative">
                                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="password"
                                                    placeholder="At least 8 characters"
                                                    className="input-field pl-10"
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                />
                                            </div>
                                            {password.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="flex gap-1 mb-1">
                                                        {[1, 2, 3, 4].map(level => (
                                                            <div key={level} className={cn(
                                                                'h-1 flex-1 rounded-full transition-all',
                                                                level <= strength.score ? strength.color : 'bg-white/[0.06]'
                                                            )} />
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <ShieldCheck size={10} className={cn(
                                                            strength.score <= 1 ? 'text-rose-400' :
                                                                strength.score <= 2 ? 'text-amber-400' :
                                                                    strength.score <= 3 ? 'text-cyan-400' : 'text-emerald-400'
                                                        )} />
                                                        <span className={cn('text-[10px] font-medium',
                                                            strength.score <= 1 ? 'text-rose-400' :
                                                                strength.score <= 2 ? 'text-amber-400' :
                                                                    strength.score <= 3 ? 'text-cyan-400' : 'text-emerald-400'
                                                        )}>{strength.label}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                                            Continue <ArrowRight size={16} />
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-2xl font-bold text-white mb-1">Choose Your Role</h1>
                                    <p className="text-sm text-slate-400 mb-6">Your role shapes the challenges you receive and how you're ranked.</p>
                                    <div className="space-y-2 mb-6 max-h-72 overflow-y-auto pr-1 scrollbar-hide">
                                        {roles.map(({ icon, name, desc }) => (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => setSelectedRole(name)}
                                                className={cn(
                                                    'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                                                    selectedRole === name
                                                        ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(108,99,255,0.2)]'
                                                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                                                )}
                                            >
                                                <span className="text-xl">{icon}</span>
                                                <div className="flex-1">
                                                    <p className={cn('text-sm font-medium', selectedRole === name ? 'text-indigo-300' : 'text-slate-300')}>{name}</p>
                                                    <p className="text-xs text-slate-500">{desc}</p>
                                                </div>
                                                {selectedRole === name && (
                                                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                                        <Check size={11} className="text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <form onSubmit={handleRegister} className="flex gap-3">
                                        <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 py-3">Back</button>
                                        <button
                                            type="submit"
                                            className={cn('btn-primary flex-1 py-3 flex items-center justify-center gap-2', !selectedRole && 'opacity-50 cursor-not-allowed')}
                                            disabled={!selectedRole || loading}
                                        >
                                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Complete</span><ArrowRight size={16} /></>}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
