import { createClient } from '@/lib/supabase/server';
import ResumeClient from './ResumeClient';
import { redirect } from 'next/navigation';

export default async function ResumePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!currentUser) redirect('/auth');

    const { data: recentSubmissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('submitted_at', { ascending: false });

    // Format for frontend
    const formattedUser = {
        ...currentUser,
        displayName: currentUser.display_name,
        globalRank: currentUser.global_rank,
        roleRank: currentUser.role_rank,
        avgAIScore: currentUser.avg_ai_score,
        projectCount: currentUser.project_count,
        soloProjects: currentUser.solo_projects,
        squadProjects: currentUser.squad_projects,
        techStack: currentUser.tech_stack || [],
        githubUsername: currentUser.github_username,
        githubConnected: currentUser.github_connected,
    };

    const formattedSubmissions = (recentSubmissions || []).map(s => ({
        ...s,
        challengeTitle: s.challenge_title,
        totalScore: s.total_score,
        submittedAt: s.submitted_at,
        aiReviewSummary: s.ai_review_summary || '',
        githubRepos: s.github_repos || [],
        scores: s.scores || { codeQuality: 0, architecture: 0, performance: 0, security: 0, requirementAdherence: 0 }
    }));

    return <ResumeClient currentUser={formattedUser} submissions={formattedSubmissions} />;
}
