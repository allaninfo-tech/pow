import { LeaderboardEntry, SquadLeaderboardEntry } from '@/lib/types';

export const globalLeaderboard: LeaderboardEntry[] = [
    { rank: 1, previousRank: 1, userId: 'user-010', username: 'kiran.mehta', displayName: 'Kiran Mehta', avatar: 'KM', role: 'Backend Engineer', league: 'Elite', totalPoints: 62400, avgAIScore: 96.3, projectCount: 22, streak: 61, rankChange: 0 },
    { rank: 2, previousRank: 3, userId: 'user-011', username: 'rafael.santos', displayName: 'Rafael Santos', avatar: 'RS', role: 'Full Stack Engineer', league: 'Elite', totalPoints: 57800, avgAIScore: 95.1, projectCount: 19, streak: 44, rankChange: 1 },
    { rank: 3, previousRank: 2, userId: 'user-001', username: 'zara.chen', displayName: 'Zara Chen', avatar: 'ZC', role: 'Full Stack Engineer', league: 'Elite', totalPoints: 48200, avgAIScore: 94.2, projectCount: 18, streak: 34, rankChange: -1 },
    { rank: 4, previousRank: 5, userId: 'user-012', username: 'yuki.nakamura', displayName: 'Yuki Nakamura', avatar: 'YN', role: 'Frontend Specialist', league: 'Elite', totalPoints: 44900, avgAIScore: 93.7, projectCount: 16, streak: 28, rankChange: 1 },
    { rank: 5, previousRank: 4, userId: 'user-013', username: 'aisha.bello', displayName: 'Aisha Bello', avatar: 'AB', role: 'ML Engineer', league: 'Elite', totalPoints: 42100, avgAIScore: 92.9, projectCount: 15, streak: 19, rankChange: -1 },
    { rank: 6, previousRank: 6, userId: 'user-014', username: 'leo.fischer', displayName: 'Leo Fischer', avatar: 'LF', role: 'DevOps Engineer', league: 'Elite', totalPoints: 41300, avgAIScore: 92.4, projectCount: 17, streak: 32, rankChange: 0 },
    { rank: 7, previousRank: 8, userId: 'user-002', username: 'marcus.osei', displayName: 'Marcus Osei', avatar: 'MO', role: 'Backend Engineer', league: 'Elite', totalPoints: 38900, avgAIScore: 91.8, projectCount: 14, streak: 21, rankChange: 1 },
    { rank: 8, previousRank: 7, userId: 'user-015', username: 'mia.johansson', displayName: 'Mia Johansson', avatar: 'MJ', role: 'Data Scientist', league: 'Elite', totalPoints: 37200, avgAIScore: 91.2, projectCount: 13, streak: 15, rankChange: -1 },
    { rank: 9, previousRank: 10, userId: 'user-016', username: 'chen.wei', displayName: 'Chen Wei', avatar: 'CW', role: 'Backend Engineer', league: 'Elite', totalPoints: 35600, avgAIScore: 90.6, projectCount: 15, streak: 10, rankChange: 1 },
    { rank: 10, previousRank: 9, userId: 'user-017', username: 'amara.diallo', displayName: 'Amara Diallo', avatar: 'AD', role: 'Frontend Specialist', league: 'Elite', totalPoints: 34800, avgAIScore: 90.1, projectCount: 12, streak: 8, rankChange: -1 },
    { rank: 11, previousRank: 12, userId: 'user-018', username: 'nate.murphy', displayName: 'Nate Murphy', avatar: 'NM', role: 'DevOps Engineer', league: 'Elite', totalPoints: 33400, avgAIScore: 89.8, projectCount: 13, streak: 22, rankChange: 1 },
    { rank: 12, previousRank: 11, userId: 'user-003', username: 'priya.sharma', displayName: 'Priya Sharma', avatar: 'PS', role: 'ML Engineer', league: 'Elite', totalPoints: 31500, avgAIScore: 89.5, projectCount: 11, streak: 15, rankChange: -1 },
    { rank: 54, previousRank: 58, userId: 'user-current', username: 'dev.user', displayName: 'Jordan Blake', avatar: 'JB', role: 'Full Stack Engineer', league: 'Pro', totalPoints: 11400, avgAIScore: 76.3, projectCount: 5, streak: 5, rankChange: 4 },
];

export const squadLeaderboard: SquadLeaderboardEntry[] = [
    { rank: 1, previousRank: 1, squadId: 'squad-004', name: 'Apex Protocol', avatarEmoji: '🔥', members: 4, totalPoints: 148200, avgAIScore: 95.2, projectCount: 18, rankChange: 0 },
    { rank: 2, previousRank: 3, squadId: 'squad-001', name: 'Sigma Protocol', avatarEmoji: '⚡', members: 3, totalPoints: 101300, avgAIScore: 92.1, projectCount: 11, rankChange: 1 },
    { rank: 3, previousRank: 2, squadId: 'squad-005', name: 'Quantum Forge', avatarEmoji: '💎', members: 5, totalPoints: 98700, avgAIScore: 91.8, projectCount: 14, rankChange: -1 },
    { rank: 4, previousRank: 4, squadId: 'squad-006', name: 'Byte Architects', avatarEmoji: '🏗️', members: 4, totalPoints: 87500, avgAIScore: 90.4, projectCount: 12, rankChange: 0 },
    { rank: 5, previousRank: 6, squadId: 'squad-002', name: 'Neural Collective', avatarEmoji: '🧠', members: 3, totalPoints: 73400, avgAIScore: 89.7, projectCount: 7, rankChange: 1 },
];
