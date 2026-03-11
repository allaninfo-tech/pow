import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
        redirect('/auth');
    }

    const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!currentUser) {
        // User authenticated but no profile row yet — redirect to auth
        redirect('/auth');
    }

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
