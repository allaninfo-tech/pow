import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import AdminClient from './AdminClient';
import { Database } from '@/lib/database.types';

export default async function AdminPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    // 1. Auth + admin gate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: profile } = await supabase
        .from('users')
        .select('is_admin, id')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) redirect('/dashboard');

    const adminId = profile.id;

    // 2. Core data fetches (parallel)
    const [
        { data: challenges },
        { count: totalUsers },
        { count: totalSubmissions },
        { count: activeChallenges },
        { data: users },
        { data: submissions },
        { data: topUsers },
        { data: announcements },
        { data: activityLog },
        { data: leagueCounts },
    ] = await Promise.all([
        // Challenges
        supabase.from('challenges').select('*').order('created_at', { ascending: false }),
        // Stats
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('submissions').select('*', { count: 'exact', head: true }),
        supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        // Full user list
        supabase.from('users')
            .select('id, display_name, email, league, global_rank, joined_at, is_admin, role, project_count, avg_ai_score, status')
            .order('joined_at', { ascending: false }),
        // All submissions
        supabase.from('submissions')
            .select('id, challenge_id, challenge_title, user_id, username, display_name, total_score, status, tier, submitted_at, live_url, github_repos, showcase_enabled')
            .order('submitted_at', { ascending: false })
            .limit(200),
        // Top 5 users by score
        supabase.from('users')
            .select('id, display_name, avg_ai_score, league, role')
            .gt('avg_ai_score', 0)
            .order('avg_ai_score', { ascending: false })
            .limit(5),
        // Platform announcements (graceful - table may not exist)
        (supabase as any).from('platform_announcements').select('*').order('created_at', { ascending: false }).limit(20),
        // Activity log (graceful - table may not exist)
        (supabase as any).from('admin_activity_log').select('*').order('created_at', { ascending: false }).limit(100),
        // League distribution
        supabase.from('users').select('league'),
    ]);

    // Compute league distribution
    const leagueDistribution = { Newbie: 0, Pro: 0, Elite: 0 };
    (leagueCounts || []).forEach((u: any) => {
        const l = u.league as string;
        if (l === 'Pro') leagueDistribution.Pro++;
        else if (l === 'Elite') leagueDistribution.Elite++;
        else leagueDistribution.Newbie++;
    });

    // Compute avg AI score
    const allScores = (users || []).filter((u: any) => u.avg_ai_score > 0).map((u: any) => Number(u.avg_ai_score));
    const platformAvgScore = allScores.length > 0
        ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length)
        : 0;

    // Count squads
    const { count: totalSquads } = await supabase.from('squads').select('*', { count: 'exact', head: true });

    const stats = {
        totalUsers: totalUsers || 0,
        totalSubmissions: totalSubmissions || 0,
        activeChallenges: activeChallenges || 0,
        platformAvgScore,
        totalSquads: totalSquads || 0,
        leagueDistribution,
    };

    return (
        <AdminClient
            adminId={adminId}
            initialChallenges={challenges || []}
            stats={stats}
            users={(users || []) as any[]}
            submissions={(submissions || []) as any[]}
            topUsers={(topUsers || []) as any[]}
            announcements={(announcements || []) as any[]}
            activityLog={(activityLog || []) as any[]}
        />
    );
}
