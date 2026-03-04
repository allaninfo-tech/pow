'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return <div className={cn('skeleton', className)} />;
}

export function ChallengeCardSkeleton() {
    return (
        <div className="glass-card p-5">
            <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                </div>
                <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-px w-full mb-3" />
            <div className="flex justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );
}

export function LeaderboardRowSkeleton() {
    return (
        <tr>
            <td className="p-4"><Skeleton className="h-4 w-8" /></td>
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </td>
            <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
            <td className="p-4"><Skeleton className="h-4 w-16" /></td>
            <td className="p-4"><Skeleton className="h-4 w-12" /></td>
        </tr>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="stat-card">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
        </div>
    );
}
