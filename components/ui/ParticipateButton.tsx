'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Users, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
    challengeId: string;
    challengeStatus: string;
    userId: string | null;
    initialJoined: boolean;
    initialCount: number;
}

export default function ParticipateButton({
    challengeId, challengeStatus, userId, initialJoined, initialCount,
}: Props) {
    const router = useRouter();
    const [joined, setJoined] = useState(initialJoined);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);
    const [justJoined, setJustJoined] = useState(false);

    if (challengeStatus !== 'Active') return null;

    if (!userId) {
        return (
            <Link
                href="/auth"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
            >
                Sign in to Participate <ArrowRight size={15} />
            </Link>
        );
    }

    const handleParticipate = async () => {
        if (joined || loading) return;
        setLoading(true);
        const supabase = createClient();

        const { error } = await supabase
            .from('participations')
            .insert({ challenge_id: challengeId, user_id: userId });

        if (!error) {
            // bump the denormalized count on the challenge row
            await supabase
                .from('challenges')
                .update({ participants_count: count + 1 })
                .eq('id', challengeId);

            setJoined(true);
            setCount(c => c + 1);
            setJustJoined(true);
            router.refresh();
        }
        setLoading(false);
    };

    if (joined) {
        return (
            <div className="space-y-3">
                <div className={cn(
                    'flex items-center gap-2.5 w-full py-3 rounded-xl border text-sm font-semibold justify-center',
                    justJoined
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-300'
                )}>
                    <CheckCircle size={16} />
                    {justJoined ? "You're in! 🎉" : 'Already Participating'}
                </div>
                <Link
                    href={`/submit/${challengeId}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                >
                    Submit Solution <ArrowRight size={15} />
                </Link>
                <p className="text-center text-xs text-slate-500">
                    {count} {count === 1 ? 'engineer' : 'engineers'} participating
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <button
                onClick={handleParticipate}
                disabled={loading}
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-[0.98]"
            >
                {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Joining…</>
                    : <><Users size={16} /> Join Challenge</>
                }
            </button>
            <p className="text-center text-xs text-slate-500">
                {count} {count === 1 ? 'engineer has' : 'engineers have'} joined · submit after joining
            </p>
        </div>
    );
}
