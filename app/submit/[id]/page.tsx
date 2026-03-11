import { createClient } from '@/lib/supabase/server';
import SubmitClient from './SubmitClient';
import { notFound, redirect } from 'next/navigation';

export default async function SubmitPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch challenge
    const { data: challenge } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

    if (!challenge) {
        notFound();
    }

    // 2. Fetch user's squad (from auth user)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const dummyUserId = user.id;

    const { data: memberRecord } = await supabase
        .from('squad_members')
        .select(`
            squad_id,
            squads (
                id,
                name
            )
        `)
        .eq('user_id', dummyUserId)
        .single();

    let formattedSquad = null;

    if (memberRecord && memberRecord.squads) {
        const squad = memberRecord.squads as any;

        // Fetch members for UI
        const { data: squadMembers } = await supabase
            .from('squad_members')
            .select(`
                user_id,
                users (
                    display_name
                )
            `)
            .eq('squad_id', squad.id);

        formattedSquad = {
            id: squad.id,
            name: squad.name,
            members: (squadMembers || []).map(m => {
                const u = m.users as any;
                return {
                    userId: m.user_id,
                    displayName: u?.display_name || ''
                };
            })
        };
    }

    return (
        <SubmitClient
            initialChallenge={challenge}
            initialMySquad={formattedSquad}
        />
    );
}
