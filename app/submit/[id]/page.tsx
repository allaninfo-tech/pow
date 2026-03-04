'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { mockChallenges } from '@/lib/mock/challenges';
import { cn, isValidUrl, isValidGitHubRepo, getTierLabel } from '@/lib/utils';
import { Globe, Github, Users, Check, ArrowRight, ArrowLeft, Loader2, Shield, Zap, AlertCircle, Plus, Trash2 } from 'lucide-react';

const steps = [
    { id: 1, label: 'Live URL', icon: Globe },
    { id: 2, label: 'Repository', icon: Github },
    { id: 3, label: 'Squad', icon: Users },
    { id: 4, label: 'Review', icon: Check },
];

const validationPipeline = [
    { name: 'Deployment Validation', desc: 'Checking live URL, HTTPS, response time', icon: Globe },
    { name: 'Repository Analysis', desc: 'Commit history, tests, CI/CD, structure', icon: Github },
    { name: 'Security Scan', desc: 'Vulnerability check, headers, secrets', icon: Shield },
    { name: 'AI Code Review', desc: 'Architecture, scalability, requirement adherence', icon: Zap },
];

export default function SubmitPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const challenge = mockChallenges.find(c => c.id === id) || mockChallenges[0];
    const [step, setStep] = useState(1);
    const [liveUrl, setLiveUrl] = useState('');
    const [repos, setRepos] = useState(['']);
    const [isSquad, setIsSquad] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [currentPipeline, setCurrentPipeline] = useState(-1);

    const liveUrlValid = isValidUrl(liveUrl);
    const reposValid = repos.every(r => r === '' || isValidGitHubRepo(r));
    const filledRepos = repos.filter(r => r.trim().length > 0);

    const addRepo = () => setRepos([...repos, '']);
    const removeRepo = (i: number) => setRepos(repos.filter((_, idx) => idx !== i));
    const updateRepo = (i: number, v: string) => setRepos(repos.map((r, idx) => idx === i ? v : r));

    const handleSubmit = async () => {
        setSubmitting(true);
        setCurrentPipeline(0);
        for (let i = 0; i < validationPipeline.length; i++) {
            await new Promise(r => setTimeout(r, 1200));
            setCurrentPipeline(i + 1);
        }
        await new Promise(r => setTimeout(r, 600));
        setSubmitting(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <AppShell>
                <div className="max-w-2xl mx-auto py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                        <Check size={36} className="text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Submission Received!</h1>
                    <p className="text-slate-400 mb-8">Your project has entered the AI evaluation pipeline. Results are typically available within 2–4 hours.</p>
                    <div className="glass-card p-5 text-left mb-6">
                        <div className="space-y-3">
                            {validationPipeline.map((step, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                        <Check size={12} className="text-emerald-400" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{step.name}</p>
                                        <p className="text-xs text-slate-500">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => router.push('/dashboard')} className="btn-primary px-6 py-3 flex items-center gap-2">
                            View Dashboard <ArrowRight size={16} />
                        </button>
                        <button onClick={() => router.push('/challenges')} className="btn-ghost px-6 py-3">
                            More Challenges
                        </button>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Submit Solution</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {challenge.title} · Tier {challenge.tier} · {getTierLabel(challenge.tier as any)}
                    </p>
                </div>

                {/* Step indicators */}
                <div className="flex items-center gap-0">
                    {steps.map((s, i) => {
                        const isCompleted = step > s.id;
                        const isActive = step === s.id;
                        return (
                            <div key={s.id} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className={cn('wizard-step', isCompleted ? 'completed' : isActive ? 'active' : 'pending')}>
                                        {isCompleted ? <Check size={14} /> : <span>{s.id}</span>}
                                    </div>
                                    <span className={cn('text-xs font-medium hidden sm:block', isActive ? 'text-indigo-300' : isCompleted ? 'text-emerald-400' : 'text-slate-600')}>
                                        {s.label}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={cn('h-px flex-1 mx-2 mb-5', step > s.id ? 'bg-emerald-500/40' : 'bg-white/[0.06]')} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Step content */}
                <div className="glass-card p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-base font-semibold text-white mb-1">Live URL</h2>
                                <p className="text-sm text-slate-400 mb-4">Your project must be deployed and publicly accessible. HTTPS is required.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Live URL *</label>
                                <div className="relative">
                                    <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="url"
                                        placeholder="https://your-project.vercel.app"
                                        value={liveUrl}
                                        onChange={e => setLiveUrl(e.target.value)}
                                        className={cn('input-field pl-9', liveUrl && (liveUrlValid ? 'border-emerald-500/40' : 'border-rose-500/40'))}
                                    />
                                    {liveUrl && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {liveUrlValid ? <Check size={15} className="text-emerald-400" /> : <AlertCircle size={15} className="text-rose-400" />}
                                        </div>
                                    )}
                                </div>
                                {liveUrl && !liveUrlValid && <p className="text-xs text-rose-400 mt-1">URL must start with http:// or https://</p>}
                                {liveUrlValid && <p className="text-xs text-emerald-400 mt-1">✓ URL format valid</p>}
                            </div>
                            <div className="p-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/15">
                                <p className="text-xs text-amber-300 flex items-start gap-2"><AlertCircle size={13} className="flex-shrink-0 mt-0.5" />Our validator will check HTTPS, response time, and basic availability. Ensure your server is running.</p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-base font-semibold text-white mb-1">GitHub Repositories</h2>
                                <p className="text-sm text-slate-400 mb-4">Add all GitHub repositories used in your solution. At least one is required.</p>
                            </div>
                            <div className="space-y-3">
                                {repos.map((repo, i) => (
                                    <div key={i}>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Repository {i + 1} {i === 0 && '*'}</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Github size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="url"
                                                    placeholder="https://github.com/username/repo"
                                                    value={repo}
                                                    onChange={e => updateRepo(i, e.target.value)}
                                                    className={cn('input-field pl-9', repo && (isValidGitHubRepo(repo) ? 'border-emerald-500/40' : 'border-rose-500/40'))}
                                                />
                                                {repo && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        {isValidGitHubRepo(repo) ? <Check size={15} className="text-emerald-400" /> : <AlertCircle size={15} className="text-rose-400" />}
                                                    </div>
                                                )}
                                            </div>
                                            {repos.length > 1 && (
                                                <button onClick={() => removeRepo(i)} className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {repos.length < 5 && (
                                <button onClick={addRepo} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                    <Plus size={14} /> Add another repository
                                </button>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-base font-semibold text-white mb-1">Squad Submission</h2>
                                <p className="text-sm text-slate-400 mb-4">If this is a squad submission, enable squad mode for contribution attribution.</p>
                            </div>
                            <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all" style={{ borderColor: isSquad ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.06)', background: isSquad ? 'rgba(108,99,255,0.05)' : 'transparent' }}>
                                <input type="checkbox" checked={isSquad} onChange={e => setIsSquad(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
                                <div>
                                    <p className="text-sm font-medium text-slate-200">This is a Squad submission</p>
                                    <p className="text-xs text-slate-500">AI will attribute contributions to each squad member via commit analysis</p>
                                </div>
                            </label>
                            {isSquad && (
                                <div className="p-4 rounded-xl bg-indigo-500/[0.05] border border-indigo-500/15 space-y-2">
                                    <p className="text-xs font-medium text-indigo-300">Sigma Protocol</p>
                                    <div className="space-y-1.5">
                                        {['Zara Chen', 'Marcus Osei', 'Nia Williams'].map(m => (
                                            <div key={m} className="flex items-center gap-2 text-xs text-slate-400">
                                                <Check size={10} className="text-emerald-400" /> {m}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Contribution percentages will be calculated automatically from commit history.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 4 && !submitting && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-base font-semibold text-white mb-1">Review & Submit</h2>
                                <p className="text-sm text-slate-400 mb-4">Confirm your submission details before sending it through the validation pipeline.</p>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: 'Challenge', value: challenge.title },
                                    { label: 'Live URL', value: liveUrl || '—' },
                                    { label: 'Repositories', value: filledRepos.length > 0 ? `${filledRepos.length} linked` : '—' },
                                    { label: 'Mode', value: isSquad ? 'Squad (Sigma Protocol)' : 'Solo' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between text-sm py-2 border-b border-white/[0.04]">
                                        <span className="text-slate-500">{label}</span>
                                        <span className="text-slate-200 font-medium text-right max-w-xs truncate">{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                <p className="text-xs font-semibold text-slate-400 mb-2">Validation Pipeline</p>
                                <div className="space-y-1.5">
                                    {validationPipeline.map(p => (
                                        <div key={p.name} className="flex items-center gap-2 text-xs text-slate-500">
                                            <p.icon size={11} /> {p.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {submitting && (
                        <div className="space-y-5 py-4">
                            <div className="text-center mb-6">
                                <Loader2 size={32} className="animate-spin text-indigo-400 mx-auto mb-3" />
                                <h2 className="text-base font-semibold text-white">Running Validation Pipeline</h2>
                                <p className="text-sm text-slate-500">Please wait while we validate your submission…</p>
                            </div>
                            <div className="space-y-3">
                                {validationPipeline.map((p, i) => {
                                    const done = i < currentPipeline;
                                    const running = i === currentPipeline;
                                    return (
                                        <div key={p.name} className={cn('flex items-center gap-3 p-3 rounded-xl border transition-all',
                                            done ? 'bg-emerald-500/5 border-emerald-500/20' : running ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-transparent border-white/[0.04]'
                                        )}>
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: done ? 'rgba(16,185,129,0.15)' : running ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.04)' }}>
                                                {done ? <Check size={13} className="text-emerald-400" /> : running ? <Loader2 size={13} className="animate-spin text-indigo-400" /> : <p.icon size={13} className="text-slate-600" />}
                                            </div>
                                            <div>
                                                <p className={cn('text-sm font-medium', done ? 'text-emerald-300' : running ? 'text-indigo-300' : 'text-slate-600')}>{p.name}</p>
                                                <p className="text-xs text-slate-600">{p.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                {!submitting && (
                    <div className="flex gap-3">
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)} className="btn-ghost flex items-center gap-2 px-5 py-3">
                                <ArrowLeft size={16} /> Back
                            </button>
                        )}
                        {step < 4 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className={cn('btn-primary flex-1 flex items-center justify-center gap-2 py-3',
                                    (step === 1 && !liveUrlValid) && 'opacity-50 cursor-not-allowed'
                                )}
                                disabled={step === 1 && !liveUrlValid}
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                                <Zap size={16} /> Submit for AI Evaluation
                            </button>
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
