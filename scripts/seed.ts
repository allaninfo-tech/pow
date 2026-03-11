import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

import { mockUsers } from '../lib/mock/users'
import { mockSquads } from '../lib/mock/squads'
import { mockChallenges } from '../lib/mock/challenges'
import { mockSubmissions } from '../lib/mock/submissions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const idMap = new Map<string, string>()
const getId = (oldId: string) => {
    if (!oldId) return undefined
    if (!idMap.has(oldId)) idMap.set(oldId, crypto.randomUUID())
    return idMap.get(oldId)!
}

// Preserve the "current user" ID so we can easily log them in or identify them in the frontend if needed
idMap.set('user-current', '11111111-1111-1111-1111-111111111111')

async function seed() {
    console.log('Seeding Database...')

    // Insert Squads
    for (const s of mockSquads) {
        const squadId = getId(s.id)
        const { error } = await supabase.from('squads').upsert({
            id: squadId,
            name: s.name,
            description: s.description,
            avatar_emoji: s.avatarEmoji,
            required_roles: s.requiredRoles,
            global_rank: s.globalRank,
            total_points: s.totalPoints,
            project_count: s.projectCount,
            avg_ai_score: s.avgAIScore,
            created_at: s.createdAt,
            github_repos: s.githubRepos,
            tags: s.tags,
            is_recruiting: s.isRecruiting,
        })
        if (error) console.error('Error inserting squad:', error)
    }

    // Insert Users
    for (const u of mockUsers) {
        const userId = getId(u.id)
        const { error } = await supabase.from('users').upsert({
            id: userId,
            username: u.username,
            display_name: u.displayName,
            email: u.email,
            avatar: u.avatar,
            role: u.role,
            league: u.league,
            global_rank: u.globalRank,
            role_rank: u.roleRank,
            github_username: u.githubUsername,
            github_connected: u.githubConnected,
            joined_at: u.joinedAt,
            last_active_at: u.lastActiveAt,
            project_count: u.projectCount,
            solo_projects: u.soloProjects,
            squad_projects: u.squadProjects,
            avg_ai_score: u.avgAIScore,
            avg_peer_score: u.avgPeerScore,
            total_points: u.totalPoints,
            streak: u.streak,
            tech_stack: u.techStack,
            bio: u.bio,
            location: u.location,
            website: u.website,
            squad_id: u.squadId ? getId(u.squadId) : null,
        })
        if (error) console.error('Error inserting user:', u.username, error)
    }

    // Insert Squad Members
    for (const s of mockSquads) {
        for (const sm of s.members) {
            const { error } = await supabase.from('squad_members').upsert({
                user_id: getId(sm.userId),
                squad_id: getId(s.id),
                role: sm.role,
                contribution_percentage: sm.contributionPercentage,
                joined_squad_at: sm.joinedSquadAt,
                is_leader: sm.isLeader
            })
            if (error) console.error('Error inserting squad member:', sm.username, error)
        }
    }

    // Insert Challenges
    for (const c of mockChallenges) {
        const { error } = await supabase.from('challenges').upsert({
            id: getId(c.id),
            title: c.title,
            client_scenario: c.clientScenario,
            short_description: c.shortDescription,
            functional_requirements: c.functionalRequirements,
            technical_constraints: c.technicalConstraints,
            performance_constraints: c.performanceConstraints,
            evaluation_criteria: c.evaluationCriteria as any,
            required_roles: c.requiredRoles,
            allowed_stack: c.allowedStack,
            mode: c.mode,
            tier: c.tier,
            status: c.status,
            created_at: c.createdAt,
            deadline: c.deadline,
            generated_at: c.generatedAt,
            tags: c.tags,
            submissions_count: c.submissionsCount,
            participants_count: c.participantsCount
        })
        if (error) console.error('Error inserting challenge:', c.title, error)
    }

    // Insert Submissions
    for (const sub of mockSubmissions) {
        const { error } = await supabase.from('submissions').upsert({
            id: getId(sub.id),
            challenge_id: getId(sub.challengeId),
            challenge_title: sub.challengeTitle,
            user_id: getId(sub.userId),
            username: sub.username,
            squad_id: sub.squadId ? getId(sub.squadId) : null,
            squad_name: sub.squadName,
            live_url: sub.liveUrl,
            github_repos: sub.githubRepos,
            status: sub.status,
            submitted_at: sub.submittedAt,
            evaluated_at: sub.evaluatedAt,
            scores: sub.scores as any,
            total_score: sub.totalScore,
            ai_review_summary: sub.aiReviewSummary,
            validation_steps: sub.validationSteps as any,
            tier: sub.tier,
            peer_score: sub.peerScore,
            is_flagged: sub.isFlagged,
            commit_count: sub.commitCount,
            contribution_breakdown: sub.contributionBreakdown as any,
        })
        if (error) console.error('Error inserting submission:', sub.challengeTitle, error)
    }

    console.log('Seed Complete!')
}

seed()
