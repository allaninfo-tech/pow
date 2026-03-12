import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { cn, getTierColor, getTierLabel, formatTimeUntil, getRoleIcon } from '@/lib/utils';
import { Zap, Users, Clock, CheckCircle2, AlertCircle, ArrowRight, Code2, Shield, Gauge, BookOpen } from 'lucide-react';
import Link from 'next/link';
import ParticipateButton from '@/components/ui/ParticipateButton';

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: challenge } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

    if (!challenge) notFound();

    // Get current user + check if they've already joined
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? null;

    let alreadyJoined = false;
    if (userId && challenge.status === 'Active') {
        const { data: participation } = await supabase
            .from('participations')
            .select('id')
            .eq('challenge_id', challenge.id)
            .eq('user_id', userId)
            .maybeSingle();
        alreadyJoined = !!participation;
    }

    // Fetch up to 5 users who joined for social proof (avatar stack)
    const { data: recentParticipations } = await supabase
        .from('participations')
        .select(`
            users (
                avatar,
                display_name
            )
        `)
        .eq('challenge_id', challenge.id)
        .order('joined_at', { ascending: false })
        .limit(5);
    
    // Extract the inner users array from the join
    const recentParticipants = (recentParticipations || []).map(p => p.users as any).filter(Boolean);

    // Map snake_case DB fields to camelCase for template
    const c = {
        id: challenge.id,
        title: challenge.title,
        shortDescription: challenge.short_description || '',
        clientScenario: challenge.client_scenario || '',
        functionalRequirements: (challenge.functional_requirements || []) as string[],
        technicalConstraints: (challenge.technical_constraints || []) as string[],
        performanceConstraints: (challenge.performance_constraints || []) as string[],
        evaluationCriteria: (challenge.evaluation_criteria || []) as { name: string; weight: number; description: string }[],
        allowedStack: (challenge.allowed_stack || []) as string[],
        requiredRoles: (challenge.required_roles || []) as string[],
        tags: (challenge.tags || []) as string[],
        mode: challenge.mode || 'Solo',
        tier: challenge.tier || 1,
        status: challenge.status || 'Upcoming',
        deadline: challenge.deadline || new Date().toISOString(),
        submissionsCount: challenge.submissions_count || 0,
        participantsCount: challenge.participants_count || 0,
    };

    const urgency = c.deadline ? new Date(c.deadline).getTime() - Date.now() < 86400000 * 2 : false;

    return (
        <AppShell>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="glass-card p-6">
                    <div className="flex flex-wrap items-start gap-3 mb-4">
                        <span className={cn('badge', getTierColor(c.tier as any))}>
                            Tier {c.tier} · {getTierLabel(c.tier as any)}
                        </span>
                        <span className={cn('badge border', c.mode === 'Squad' ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : c.mode === 'Solo' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300')}>
                            {c.mode === 'Both' ? 'Solo + Squad' : c.mode}
                        </span>
                        {c.status === 'Active' && <span className="badge bg-indigo-500/10 border-indigo-500/20 text-indigo-300"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />Live</span>}
                        {c.status === 'Completed' && <span className="badge bg-emerald-500/10 border-emerald-500/20 text-emerald-300">Completed</span>}
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">{c.title}</h1>
                    <p className="text-slate-400">{c.shortDescription}</p>

                    {/* Stats row */}
                    <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t border-white/[0.06]">
                        {c.deadline && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={16} className={urgency ? 'text-rose-400' : 'text-slate-400'} />
                                <span className={urgency ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                                    {formatTimeUntil(c.deadline)} remaining
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Users size={16} />
                            {c.participantsCount} participants
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Code2 size={16} />
                            {c.submissionsCount} submissions
                        </div>
                        <div className="flex flex-wrap gap-1.5 ml-auto">
                            {c.requiredRoles.map(r => (
                                <span key={r} className="chip text-xs">{getRoleIcon(r as any)} {r}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Client Scenario */}
                        {c.clientScenario && (
                            <div className="glass-card p-6">
                                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <BookOpen size={16} className="text-indigo-400" /> Client Scenario
                                </h2>
                                <div className="p-4 rounded-xl bg-indigo-500/[0.05] border border-indigo-500/15">
                                    <p className="text-sm text-slate-300 leading-relaxed">{c.clientScenario}</p>
                                </div>
                            </div>
                        )}

                        {/* Functional Requirements */}
                        {c.functionalRequirements.length > 0 && (
                            <div className="glass-card p-6">
                                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-400" /> Functional Requirements
                                </h2>
                                <ul className="space-y-2.5">
                                    {c.functionalRequirements.map((req, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-[10px] font-bold text-emerald-400">{i + 1}</span>
                                            </span>
                                            <p className="text-sm text-slate-300">{req}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Technical Constraints */}
                        {(c.technicalConstraints.length > 0 || c.performanceConstraints.length > 0) && (
                            <div className="glass-card p-6">
                                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-amber-400" /> Technical Constraints
                                </h2>
                                <ul className="space-y-2.5">
                                    {c.technicalConstraints.map((constraint, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-slate-300">{constraint}</p>
                                        </li>
                                    ))}
                                </ul>
                                {c.performanceConstraints.length > 0 && (
                                    <div className="mt-5 pt-5 border-t border-white/[0.06]">
                                        <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                            <Gauge size={14} className="text-cyan-400" /> Performance Constraints
                                        </h3>
                                        <ul className="space-y-2">
                                            {c.performanceConstraints.map((pc, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                                                    {pc}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Evaluation Criteria */}
                        {c.evaluationCriteria.length > 0 && (
                            <div className="glass-card p-6">
                                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Shield size={16} className="text-violet-400" /> Evaluation Criteria
                                </h2>
                                <div className="space-y-4">
                                    {c.evaluationCriteria.map((crit) => (
                                        <div key={crit.name}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-medium text-slate-300">{crit.name}</span>
                                                <span className="text-xs font-mono font-bold text-indigo-400">{crit.weight}%</span>
                                            </div>
                                            <div className="progress-bar mb-1.5">
                                                <div className="progress-fill" style={{ width: `${crit.weight}%` }} />
                                            </div>
                                            <p className="text-xs text-slate-500">{crit.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-4">
                        {/* Participate / Submit CTA */}
                        {c.status === 'Completed' ? (
                            <div className="glass-card p-5 border-emerald-500/20 bg-emerald-500/[0.04]">
                                <h3 className="text-sm font-semibold text-slate-300 mb-3">Challenge Completed</h3>
                                <p className="text-xs text-slate-500 mb-4">This challenge has ended. Browse the verified submissions in the showcase.</p>
                                <Link href={`/showcase?search=${encodeURIComponent(c.title)}`} className="btn-primary bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.2)] border-emerald-400/50 w-full flex items-center justify-center gap-2 py-3 text-sm">
                                    See Submissions <ArrowRight size={16} />
                                </Link>
                            </div>
                        ) : c.status === 'Upcoming' ? (
                            <div className="glass-card p-5 border-amber-500/20 bg-amber-500/[0.04]">
                                <h3 className="text-sm font-semibold text-amber-300 mb-2">⏳ Launching Soon</h3>
                                <p className="text-xs text-slate-400">This challenge isn't live yet. Once the admin sets it to <span className="font-semibold text-amber-300">Active</span>, you'll be able to join and participate.</p>
                            </div>
                        ) : (
                            <div className="glass-card p-5 border-indigo-500/20 bg-indigo-500/[0.04]">
                                <h3 className="text-sm font-semibold text-slate-300 mb-1">Join the Challenge</h3>
                                <p className="text-xs text-slate-500 mb-4">Join to mark your participation. Once joined, submit your solution before the deadline.</p>
                                <ParticipateButton
                                    challengeId={c.id}
                                    challengeStatus={c.status}
                                    userId={userId}
                                    initialJoined={alreadyJoined}
                                    initialCount={c.participantsCount}
                                    recentParticipants={recentParticipants}
                                />
                            </div>
                        )}

                        {/* Deadline */}
                        {c.deadline && (
                            <div className="glass-card p-5">
                                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <Clock size={16} className="text-rose-400" /> Deadline
                                </h3>
                                <p className={cn('text-2xl font-black font-mono', urgency ? 'text-rose-400' : 'text-white')}>
                                    {formatTimeUntil(c.deadline)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">{new Date(c.deadline).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            </div>
                        )}

                        {/* Allowed Stack */}
                        {c.allowedStack.length > 0 && (
                            <div className="glass-card p-5">
                                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <Code2 size={16} className="text-emerald-400" /> Allowed Stack
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {c.allowedStack.map(tech => (
                                        <span key={tech} className="chip text-xs font-mono">{tech}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {c.tags.length > 0 && (
                            <div className="glass-card p-5">
                                <h3 className="text-sm font-semibold text-slate-300 mb-3">Tags</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {c.tags.map(tag => (
                                        <span key={tag} className="badge badge-pro">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Community stats */}
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-slate-300 mb-3">Community</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Participants</span>
                                    <span className="text-white font-semibold">{c.participantsCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Submissions</span>
                                    <span className="text-white font-semibold">{c.submissionsCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Completion rate</span>
                                    <span className="text-emerald-400 font-semibold">
                                        {c.participantsCount > 0
                                            ? Math.round((c.submissionsCount / c.participantsCount) * 100) + '%'
                                            : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
