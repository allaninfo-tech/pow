import { createClient } from '@/lib/supabase/server';
import ProfileClient from './ProfileClient';
import { notFound } from 'next/navigation';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (!user) notFound();

    // Fetch submissions + badges in parallel
    const [{ data: userSubmissions }, { data: userBadges }] = await Promise.all([
        supabase
            .from('submissions')
            .select('*')
            .eq('user_id', user.id)
            .order('submitted_at', { ascending: false }),
        supabase
            .from('user_badges')
            .select(`
                earned_at,
                badges (
                    id, name, icon, rarity, type, description
                )
            `)
            .eq('user_id', user.id),
    ]);

    const formattedUser = {
        ...user,
        displayName: user.display_name,
        globalRank: user.global_rank,
        roleRank: user.role_rank,
        avgAIScore: user.avg_ai_score,
        projectCount: user.project_count,
        soloProjects: user.solo_projects,
        squadProjects: user.squad_projects,
        techStack: Array.isArray(user.tech_stack) ? user.tech_stack : [],
        githubUsername: user.github_username,
        githubConnected: user.github_connected,
        joinedAt: user.joined_at,
        badges: (userBadges || []).map((ub: any) => ({
            ...(ub.badges || {}),
            earnedAt: ub.earned_at,
        })).filter(b => b.id),
    };

    const formattedSubmissions = (userSubmissions || []).map(s => ({
        ...s,
        challengeTitle: s.challenge_title,
        totalScore: s.total_score,
        submittedAt: s.submitted_at,
        commitCount: s.commit_count,
        liveUrl: s.live_url,
        githubRepos: s.github_repos || [],
        aiReviewSummary: s.ai_review_summary || '',
        scores: s.scores || {},
    }));

    return <ProfileClient user={formattedUser} userSubmissions={formattedSubmissions} />;
}

