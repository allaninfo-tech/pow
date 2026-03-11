import { createClient } from '@/lib/supabase/server';
import ShowcaseClient from './ShowcaseClient';

export const revalidate = 60; // ISR: re-generate every 60s

export default async function ShowcasePage() {
    const supabase = await createClient();

    // Get current logged-in user (for upvote state)
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch showcase submissions — all that are Completed or Approved
    // (showcase_enabled is auto-set by DB trigger when status becomes Completed/Approved)
    const { data: submissions } = await supabase
        .from('submissions')
        .select(`
            id,
            challenge_id,
            challenge_title,
            user_id,
            username,
            live_url,
            github_repos,
            screenshot_url,
            description,
            total_score,
            tier,
            submitted_at,
            upvotes,
            users (
                display_name,
                avatar,
                league,
                role
            )
        `)
        .in('status', ['Completed', 'Approved'])
        .gt('total_score', 0)
        .order('total_score', { ascending: false })
        .limit(60);

    // Fetch this user's upvoted submission IDs
    let myUpvotedIds: string[] = [];
    if (user) {
        const { data: myUpvotes } = await supabase
            .from('submission_upvotes')
            .select('submission_id')
            .eq('user_id', user.id);
        myUpvotedIds = (myUpvotes || []).map((u: any) => u.submission_id);
    }

    // Fetch real comment counts per submission
    const submissionIds = (submissions || []).map(s => s.id);
    const commentCounts: Record<string, number> = {};
    if (submissionIds.length > 0) {
        const { data: counts } = await supabase
            .from('submission_comments')
            .select('submission_id')
            .in('submission_id', submissionIds);
        (counts || []).forEach((c: any) => {
            commentCounts[c.submission_id] = (commentCounts[c.submission_id] || 0) + 1;
        });
    }

    const formatted = (submissions || []).map(s => {
        const u = s.users as any;
        const rawName = u?.display_name || s.username || 'Developer';
        const nameParts = rawName.trim().split(' ');
        const initials = u?.avatar || (nameParts.length >= 2
            ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
            : rawName.slice(0, 2).toUpperCase());
        return {
            id: s.id,
            challengeId: s.challenge_id,
            challengeTitle: s.challenge_title || 'Untitled Challenge',
            userId: s.user_id,
            username: s.username || '',
            displayName: rawName,
            avatar: initials,
            league: u?.league || null,
            role: u?.role || 'Engineer',
            liveUrl: s.live_url || '',
            githubRepo: (s.github_repos || [])[0] || '',
            screenshotUrl: s.screenshot_url || '',
            totalScore: Number(s.total_score) || 0,
            tier: s.tier || 1,
            submittedAt: s.submitted_at || new Date().toISOString(),
            techStack: [] as string[],
            description: s.description || '',
            upvotes: s.upvotes || 0,
            upvotedByMe: myUpvotedIds.includes(s.id),
            commentsCount: commentCounts[s.id] || 0,
        };
    });

    return <ShowcaseClient projects={formatted} currentUserId={user?.id || null} />;
}

