import { createClient } from '@/lib/supabase/server';
import LeaderboardClient from './LeaderboardClient';

export default async function LeaderboardPage() {
    const supabase = await createClient();

    // Current user (may be null if not logged in)
    const { data: { user } } = await supabase.auth.getUser();
    let currentUserData = null;
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('id, display_name, global_rank, league')
            .eq('id', user.id)
            .single();
        if (data) {
            currentUserData = {
                id: data.id,
                displayName: data.display_name,
                globalRank: data.global_rank ?? 0,
                league: data.league ?? 'Newbie',
            };
        }
    }

    // Fetch top 50 users based on global_rank
    const { data: users } = await supabase
        .from('users')
        .select('*')
        .gt('global_rank', 0)
        .order('global_rank', { ascending: true })
        .limit(50);

    // Fetch top 50 squads based on global_rank
    const { data: squads } = await supabase
        .from('squads')
        .select('*')
        .gt('global_rank', 0)
        .order('global_rank', { ascending: true })
        .limit(50);

    const formattedGlobal = (users || []).map(u => ({
        userId: u.id,
        rank: u.global_rank,
        displayName: u.display_name,
        username: u.username,
        role: u.role,
        league: u.league,
        avgAIScore: Number(u.avg_ai_score) || 0,
        projectCount: u.project_count || 0,
        streak: u.streak || 0,
        rankChange: 0,
        avatar: u.avatar || (u.display_name || u.username || 'U').slice(0, 2).toUpperCase(),
    }));

    // Get real member counts for ALL squads in one query (avoids N+1)
    const squadIds = (squads || []).map(s => s.id);
    let memberCountMap: Record<string, number> = {};
    if (squadIds.length > 0) {
        const { data: memberCounts } = await supabase
            .from('squad_members')
            .select('squad_id')
            .in('squad_id', squadIds);
        (memberCounts || []).forEach(m => {
            memberCountMap[m.squad_id] = (memberCountMap[m.squad_id] || 0) + 1;
        });
    }

    const formattedSquads = (squads || []).map(s => ({
        squadId: s.id,
        rank: s.global_rank,
        name: s.name,
        members: memberCountMap[s.id] || 0,
        avgAIScore: Number(s.avg_ai_score) || 0,
        projectCount: s.project_count || 0,
        rankChange: 0,
        avatarEmoji: s.avatar_emoji || '🏆',
    }));

    return (
        <LeaderboardClient
            globalLeaderboard={formattedGlobal}
            squadLeaderboard={formattedSquads}
            currentUser={currentUserData}
        />
    );
}

