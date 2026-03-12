import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
        redirect('/auth');
    }

    // Fetch user profile
    let { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    // If no profile row exists (e.g. email confirmed after signup, but upsert was blocked by RLS),
    // auto-create one from auth.user metadata so the user can proceed to the dashboard.
    if (!profileData) {
        const displayName = (user.user_metadata?.display_name as string | undefined)
            || user.email?.split('@')[0]
            || 'User';
        const baseUsername = (user.email?.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_]/g, '');
        const username = baseUsername + Math.floor(Math.random() * 1000);

        await (supabase as any).from('users').upsert({
            id: user.id,
            email: user.email ?? '',
            username,
            display_name: displayName,
            role: (user.user_metadata?.role as string | undefined) || 'Full Stack Engineer',
            league: 'Newbie',
            joined_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        // Re-fetch after creating
        const { data: refreshed } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!refreshed) redirect('/auth');
        profileData = refreshed;
    }

    const currentUser = profileData!;

    const { data: activeChallenges } = await supabase
        .from('challenges')
        .select('*')
        .eq('status', 'Active')
        .limit(3);

    const { data: recentSubmissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('submitted_at', { ascending: false })
        .limit(5);

    // Compute avatar initials from display_name or email fallback
    const displayName = currentUser.display_name || user.email?.split('@')[0] || 'User';
    const nameParts = displayName.trim().split(' ');
    const avatarInitials = nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : displayName.slice(0, 2).toUpperCase();

    // Map database snake_case to frontend camelCase with null-safe defaults
    const formattedUser = {
        ...currentUser,
        displayName,
        avatar: currentUser.avatar || avatarInitials,
        globalRank: currentUser.global_rank ?? 0,
        roleRank: currentUser.role_rank ?? 0,
        avgAIScore: currentUser.avg_ai_score ?? 0,
        projectCount: currentUser.project_count ?? 0,
        soloProjects: currentUser.solo_projects ?? 0,
        squadProjects: currentUser.squad_projects ?? 0,
        streak: currentUser.streak ?? 0,
        techStack: currentUser.tech_stack || [],
        league: (currentUser.league as 'Newbie' | 'Pro' | 'Elite') || 'Newbie',
        role: currentUser.role || 'Full Stack Engineer',
    };

    const formattedChallenges = (activeChallenges || []).map(c => ({
        ...c,
        submissionsCount: c.submissions_count,
    }));

    const formattedSubmissions = (recentSubmissions || []).map(s => ({
        ...s,
        challengeTitle: s.challenge_title,
        totalScore: s.total_score,
        submittedAt: s.submitted_at,
    }));

    return (
        <DashboardClient
            currentUser={formattedUser}
            activeChallenges={formattedChallenges}
            recentSubmissions={formattedSubmissions}
        />
    );
}
