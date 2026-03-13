'use client';

import { cn, getAvatarColor } from '@/lib/utils';

interface AvatarProps {
    initials: string | null | undefined;
    photoUrl?: string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    online?: boolean;
}

const sizeMap = {
    xs: 'w-6 h-6 text-[9px] rounded-md',
    sm: 'w-8 h-8 text-xs rounded-lg',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-12 h-12 text-base rounded-xl',
    xl: 'w-16 h-16 text-xl rounded-2xl',
};

export default function Avatar({ initials, photoUrl, size = 'md', className, online }: AvatarProps) {
    const displayInitials = initials || '?';
    // photoUrl prop takes priority, otherwise auto-detect http URLs placed in the initials field
    const imageSrc = photoUrl || (displayInitials.startsWith('http') ? displayInitials : null);

    return (
        <div className={cn('relative flex-shrink-0', className)}>
            {imageSrc ? (
                <img
                    src={imageSrc}
                    alt="Avatar"
                    className={cn('object-cover', sizeMap[size])}
                />
            ) : (
                <div
                    className={cn(
                        'bg-gradient-to-br flex items-center justify-center font-bold text-white',
                        sizeMap[size],
                        getAvatarColor(displayInitials)
                    )}
                >
                    {displayInitials.slice(0, 2)}
                </div>
            )}
            {online !== undefined && (
                <span
                    className={cn(
                        'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-navy-800',
                        online ? 'bg-emerald-400' : 'bg-slate-500'
                    )}
                />
            )}
        </div>
    );
}
