import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DifficultyTier, League, Role, ScoreBreakdown } from './types';

// ─── TailwindMerge Helper ─────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ─── Score Utilities ──────────────────────────────────────────────────────────
export function calculateTotalScore(scores: ScoreBreakdown): number {
    const weights = {
        codeQuality: 0.25,
        architecture: 0.25,
        performance: 0.20,
        security: 0.15,
        requirementAdherence: 0.15,
    };
    return Math.round(
        scores.codeQuality * weights.codeQuality +
        scores.architecture * weights.architecture +
        scores.performance * weights.performance +
        scores.security * weights.security +
        scores.requirementAdherence * weights.requirementAdherence
    );
}

export function getScoreColor(score: number): string {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-cyan-300';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
}

export function getScoreBg(score: number): string {
    if (score >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 75) return 'bg-cyan-500/10 border-cyan-500/20';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
}

// ─── Tier Utilities ───────────────────────────────────────────────────────────
export function getTierLabel(tier: DifficultyTier): string {
    const labels: Record<DifficultyTier, string> = {
        1: 'Beginner',
        2: 'Intermediate',
        3: 'Advanced',
        4: 'Expert',
        5: 'Elite',
    };
    return labels[tier];
}

export function getTierColor(tier: DifficultyTier): string {
    const colors: Record<DifficultyTier, string> = {
        1: 'badge-tier-1',
        2: 'badge-tier-2',
        3: 'badge-tier-3',
        4: 'badge-tier-4',
        5: 'badge-tier-5',
    };
    return colors[tier];
}

// ─── League Utilities ─────────────────────────────────────────────────────────
export function getLeagueColor(league: League): string {
    const colors: Record<League, string> = {
        Newbie: 'badge-newbie',
        Pro: 'badge-pro',
        Elite: 'badge-elite',
    };
    return colors[league];
}

export function getLeagueIcon(league: League): string {
    const icons: Record<League, string> = {
        Newbie: '🌱',
        Pro: '⚡',
        Elite: '🏆',
    };
    return icons[league];
}

// ─── Role Utilities ───────────────────────────────────────────────────────────
export function getRoleIcon(role: Role): string {
    const icons: Record<Role, string> = {
        'Frontend Specialist': '🎨',
        'Backend Engineer': '⚙️',
        'Full Stack Engineer': '🔗',
        'DevOps Engineer': '🚀',
        'Data Scientist': '📊',
        'ML Engineer': '🤖',
        'UI/UX Designer': '✨',
    };
    return icons[role];
}

export function getRoleShort(role: Role): string {
    const shorts: Record<Role, string> = {
        'Frontend Specialist': 'Frontend',
        'Backend Engineer': 'Backend',
        'Full Stack Engineer': 'Full Stack',
        'DevOps Engineer': 'DevOps',
        'Data Scientist': 'Data Sci',
        'ML Engineer': 'ML',
        'UI/UX Designer': 'UI/UX',
    };
    return shorts[role];
}

// ─── Date/Time Utilities ──────────────────────────────────────────────────────
export function formatTimeUntil(dateStr: string): string {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export function formatRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (days > 30) return new Date(dateStr).toLocaleDateString();
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// ─── Number Formatting ────────────────────────────────────────────────────────
export function formatNumber(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
}

export function formatRankChange(change: number): { label: string; color: string } {
    if (change > 0) return { label: `▲ ${change}`, color: 'text-emerald-400' };
    if (change < 0) return { label: `▼ ${Math.abs(change)}`, color: 'text-rose-400' };
    return { label: '—', color: 'text-slate-500' };
}

// ─── Validation Utilities ─────────────────────────────────────────────────────
export function isValidUrl(url: string): boolean {
    try {
        const u = new URL(url);
        return u.protocol === 'https:' || u.protocol === 'http:';
    } catch {
        return false;
    }
}

export function isValidGitHubRepo(url: string): boolean {
    try {
        const u = new URL(url);
        return u.hostname === 'github.com' && u.pathname.split('/').filter(Boolean).length >= 2;
    } catch {
        return false;
    }
}

// ─── Avatar Color ─────────────────────────────────────────────────────────────
export function getAvatarColor(initials: string): string {
    const colors = [
        'from-indigo-500 to-purple-600',
        'from-cyan-500 to-blue-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
        'from-rose-500 to-pink-600',
        'from-violet-500 to-indigo-600',
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
}
