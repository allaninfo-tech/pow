import { createClient } from '@/lib/supabase/server';
import SquadClient from './SquadClient';
import { redirect } from 'next/navigation';

export default async function SquadPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    // Use actual user id
    const dummyUserId = user.id;

    // 1. Check if user is in a squad
    const { data: memberRecord } = await supabase
        .from('squad_members')
        .select(`
            squad_id,
            role,
            contribution_percentage,
            is_leader,
            squads (*)
        `)
        .eq('user_id', dummyUserId)
        .single();

    let formattedMySquad = null;

    if (memberRecord && memberRecord.squads) {
        const squad = memberRecord.squads as any;

        // Fetch all members of this squad
        const { data: squadMembers } = await supabase
            .from('squad_members')
            .select(`
                user_id,
                role,
                contribution_percentage,
                is_leader,
                users (
                    display_name,
                    username,
                    avatar
                )
            `)
            .eq('squad_id', squad.id);

        const formattedMembers = (squadMembers || []).map(m => {
            const u = m.users as any;
            return {
                userId: m.user_id,
                role: m.role,
                contributionPercentage: m.contribution_percentage,
                isLeader: m.is_leader,
                displayName: u?.display_name || '',
                username: u?.username || '',
                avatar: u?.avatar || ''
            };
        });

        formattedMySquad = {
            id: squad.id,
            name: squad.name,
            description: squad.description,
            avatarEmoji: squad.avatar_emoji,
            globalRank: squad.global_rank,
            totalPoints: squad.total_points,
            projectCount: squad.project_count,
            avgAIScore: squad.avg_ai_score,
            isRecruiting: squad.is_recruiting,
            tags: squad.tags || [],
            githubRepos: squad.github_repos || [],
            members: formattedMembers
        };
    }

    // 2. Fetch recruiting squads
    const { data: recruitingSquads } = await supabase
        .from('squads')
        .select('*')
        .eq('is_recruiting', true)
        .order('global_rank', { ascending: true })
        .limit(20);

    // Fetch recruiting squad member counts all at once (avoids N+1)
    const recruitingIds = (recruitingSquads || []).map(s => s.id);
    const recruitingCountMap: Record<string, number> = {};
    if (recruitingIds.length > 0) {
        const { data: recruitingMemberCounts } = await supabase
            .from('squad_members')
            .select('squad_id')
            .in('squad_id', recruitingIds);
        (recruitingMemberCounts || []).forEach(m => {
            recruitingCountMap[m.squad_id] = (recruitingCountMap[m.squad_id] || 0) + 1;
        });
    }

    const formattedRecruiting = (recruitingSquads || []).map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        avatarEmoji: s.avatar_emoji,
        globalRank: s.global_rank,
        isRecruiting: s.is_recruiting,
        tags: s.tags || [],
        members: new Array(recruitingCountMap[s.id] || 0).fill({})
    }));

    return (
        <SquadClient
            initialMySquad={formattedMySquad}
            initialRecruitingSquads={formattedRecruiting}
        />
    );
}
