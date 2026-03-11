import { createClient } from '@/lib/supabase/server';
import ChallengesClient from './ChallengesClient';

export const revalidate = 30; // refresh every 30s

export default async function ChallengesPage() {
    const supabase = await createClient();

    const { data: challenges } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

    // Get real submission + participant counts per challenge
    const { data: submissionAggregates } = await supabase
        .from('submissions')
        .select('challenge_id, user_id');

    // Build aggregated counts indexed by challenge_id
    const aggMap: Record<string, { submissions: number; participants: Set<string> }> = {};
    for (const row of (submissionAggregates || [])) {
        if (!row.challenge_id) continue;
        if (!aggMap[row.challenge_id]) {
            aggMap[row.challenge_id] = { submissions: 0, participants: new Set() };
        }
        aggMap[row.challenge_id].submissions++;
        if (row.user_id) aggMap[row.challenge_id].participants.add(row.user_id);
    }

    const formattedChallenges = (challenges || []).map(c => {
        const agg = aggMap[c.id] || { submissions: 0, participants: new Set() };
        return {
            ...c,
            shortDescription: c.short_description || '',
            functionalRequirements: c.functional_requirements || [],
            technicalConstraints: c.technical_constraints || [],
            performanceConstraints: c.performance_constraints || [],
            allowedStack: c.allowed_stack || [],
            requiredRoles: c.required_roles || [],
            evaluationCriteria: c.evaluation_criteria || [],
            createdAt: c.created_at,
            deadline: c.deadline,
            // Use real live counts, fall back to seeded DB column
            submissionsCount: agg.submissions > 0 ? agg.submissions : (c.submissions_count || 0),
            participantsCount: agg.participants.size > 0 ? agg.participants.size : (c.participants_count || 0),
        };
    });

    return <ChallengesClient initialChallenges={formattedChallenges} />;
}

