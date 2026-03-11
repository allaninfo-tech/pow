'use client';

import { League } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LeagueBadgeProps {
    league: League | null | undefined;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    className?: string;
}

const leagueConfig: Record<League, {
    icon: string;
    label: string;
    gradient: string;
    glow: string;
    border: string;
    textColor: string;
}> = {
    Newbie: {
        icon: '🌱',
        label: 'Newbie',
        gradient: 'from-emerald-600 to-teal-600',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
        border: 'border-emerald-500/30',
        textColor: 'text-emerald-300',
    },
    Pro: {
        icon: '⚡',
        label: 'Pro',
        gradient: 'from-indigo-600 to-violet-600',
        glow: 'shadow-[0_0_20px_rgba(108,99,255,0.5)]',
        border: 'border-indigo-500/30',
        textColor: 'text-indigo-300',
    },
    Elite: {
        icon: '🏆',
        label: 'Elite',
        gradient: 'from-amber-500 to-orange-600',
        glow: 'shadow-[0_0_25px_rgba(245,158,11,0.5)]',
        border: 'border-amber-500/30',
        textColor: 'text-amber-300',
    },
};

const sizeConfig = {
    sm: { badge: 'px-2.5 py-1 text-[11px]', icon: 'text-sm', wrapper: 'gap-1' },
    md: { badge: 'px-3 py-1.5 text-xs', icon: 'text-base', wrapper: 'gap-1.5' },
    lg: { badge: 'px-4 py-2 text-sm', icon: 'text-xl', wrapper: 'gap-2' },
};

export default function LeagueBadge({ league, size = 'md', showIcon = true, className }: LeagueBadgeProps) {
    const config = leagueConfig[league ?? 'Newbie'];
    const sz = sizeConfig[size];

    return (
        <div
            className={cn(
                'inline-flex items-center font-semibold rounded-full',
                `bg-gradient-to-r ${config.gradient}`,
                config.glow,
                `border ${config.border}`,
                sz.badge,
                sz.wrapper,
                className
            )}
        >
            {showIcon && <span className={sz.icon}>{config.icon}</span>}
            <span className="text-white">{config.label}</span>
        </div>
    );
}
