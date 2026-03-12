import { cn, getAvatarColor } from '@/lib/utils';
import Image from 'next/link';

interface UserParticipant {
    avatar: string | null;
    display_name: string;
}

interface AvatarStackProps {
    users: UserParticipant[];
    totalCount: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
};

export default function AvatarStack({ users, totalCount, className, size = 'sm' }: AvatarStackProps) {
    if (!users || users.length === 0) return null;

    const displayUsers = users.slice(0, 5);
    const extraCount = Math.max(0, totalCount - displayUsers.length);
    const sClass = sizeClasses[size];

    return (
        <div className={cn("flex items-center -space-x-2", className)}>
            {displayUsers.map((u, i) => {
                const initials = u.display_name?.substring(0, 2).toUpperCase() || '??';
                const zIndex = 10 - i;
                return (
                    <div
                        key={i}
                        className={cn(
                            "relative rounded-full border-2 border-slate-950 flex items-center justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br transition-transform hover:-translate-y-1 hover:z-20 cursor-default",
                            sClass,
                            getAvatarColor(initials)
                        )}
                        style={{ zIndex }}
                        title={u.display_name}
                    >
                        {u.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.avatar} alt={u.display_name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-white/90">{initials}</span>
                        )}
                    </div>
                );
            })}
            
            {extraCount > 0 && (
                <div 
                    className={cn(
                        "relative rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-300 font-semibold",
                        sClass
                    )}
                    style={{ zIndex: 0 }}
                >
                    +{extraCount > 99 ? '99' : extraCount}
                </div>
            )}
        </div>
    );
}
