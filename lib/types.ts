// ─── Core Types for the Proof-of-Work Engineering Platform ───────────────────

export type League = 'Newbie' | 'Pro' | 'Elite';

export type Role =
    | 'Frontend Specialist'
    | 'Backend Engineer'
    | 'Full Stack Engineer'
    | 'DevOps Engineer'
    | 'Data Scientist'
    | 'ML Engineer'
    | 'UI/UX Designer';

export type DifficultyTier = 1 | 2 | 3 | 4 | 5;

export type ChallengeMode = 'Solo' | 'Squad' | 'Both';

export type ChallengeStatus = 'Active' | 'Upcoming' | 'Completed' | 'Archived';

export type SubmissionStatus = 'Pending' | 'Validating' | 'Scoring' | 'Completed' | 'Failed' | 'Flagged';

export type BadgeType = 'league' | 'completion' | 'role' | 'streak' | 'squad';

// ─── Challenge ────────────────────────────────────────────────────────────────

export interface EvaluationCriteria {
    name: string;
    description: string;
    weight: number; // 0-100
}

export interface Challenge {
    id: string;
    title: string;
    clientScenario: string;
    shortDescription: string;
    functionalRequirements: string[];
    technicalConstraints: string[];
    performanceConstraints: string[];
    evaluationCriteria: EvaluationCriteria[];
    requiredRoles: Role[];
    allowedStack: string[];
    mode: ChallengeMode;
    tier: DifficultyTier;
    status: ChallengeStatus;
    createdAt: string;
    deadline: string;
    generatedAt: string;
    tags: string[];
    submissionsCount: number;
    participantsCount: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface ScoreBreakdown {
    codeQuality: number;      // 0-100
    architecture: number;     // 0-100
    performance: number;      // 0-100
    security: number;         // 0-100
    requirementAdherence: number; // 0-100
}

export interface User {
    id: string;
    username: string;
    displayName: string;
    email: string;
    avatar: string;
    role: Role;
    league: League;
    globalRank: number;
    roleRank: number;
    githubUsername: string;
    githubConnected: boolean;
    joinedAt: string;
    lastActiveAt: string;
    projectCount: number;
    soloProjects: number;
    squadProjects: number;
    avgAIScore: number;
    avgPeerScore: number;
    totalPoints: number;
    streak: number;
    badges: Badge[];
    techStack: { name: string; count: number }[];
    bio: string;
    location: string;
    website: string;
    squadId?: string;
}

// ─── Squad ────────────────────────────────────────────────────────────────────

export interface SquadMember {
    userId: string;
    username: string;
    displayName: string;
    avatar: string;
    role: Role;
    contributionPercentage: number;
    joinedSquadAt: string;
    isLeader: boolean;
}

export interface Squad {
    id: string;
    name: string;
    description: string;
    avatarEmoji: string;
    members: SquadMember[];
    requiredRoles: Role[];
    globalRank: number;
    totalPoints: number;
    projectCount: number;
    avgAIScore: number;
    createdAt: string;
    githubRepos: string[];
    tags: string[];
    isRecruiting: boolean;
}

// ─── Submission ───────────────────────────────────────────────────────────────

export interface ValidationStep {
    name: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    detail?: string;
    timestamp?: string;
}

export interface Submission {
    id: string;
    challengeId: string;
    challengeTitle: string;
    userId: string;
    username: string;
    squadId?: string;
    squadName?: string;
    liveUrl: string;
    githubRepos: string[];
    status: SubmissionStatus;
    submittedAt: string;
    evaluatedAt?: string;
    scores: ScoreBreakdown;
    totalScore: number;
    aiReviewSummary: string;
    validationSteps: ValidationStep[];
    tier: DifficultyTier;
    peerScore?: number;
    isFlagged: boolean;
    commitCount: number;
    contributionBreakdown?: { [userId: string]: number };
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: BadgeType;
    earnedAt: string;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
    rank: number;
    previousRank: number;
    userId: string;
    username: string;
    displayName: string;
    avatar: string;
    role: Role;
    league: League;
    totalPoints: number;
    avgAIScore: number;
    projectCount: number;
    streak: number;
    rankChange: number; // positive = up, negative = down
}

export interface SquadLeaderboardEntry {
    rank: number;
    previousRank: number;
    squadId: string;
    name: string;
    avatarEmoji: string;
    members: number;
    totalPoints: number;
    avgAIScore: number;
    projectCount: number;
    rankChange: number;
}

// ─── Invite ───────────────────────────────────────────────────────────────────

export interface SquadInvite {
    id: string;
    squadId: string;
    squadName: string;
    invitedBy: string;
    invitedAt: string;
    status: 'Pending' | 'Accepted' | 'Declined';
    expiresAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
    id: string;
    type: 'challenge' | 'submission' | 'squad' | 'badge' | 'system';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    actionUrl?: string;
}
