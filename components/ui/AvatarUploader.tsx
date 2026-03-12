'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { uploadAvatar } from '@/lib/firebase-storage';
import { Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AvatarUploaderProps {
    userId: string;
    currentInitials: string;    // shown while no photo uploaded yet
    currentPhotoUrl?: string;   // shown if user already has a Firebase photo
    onUploadComplete: (url: string) => void;
}

export default function AvatarUploader({
    userId, currentInitials, currentPhotoUrl, onUploadComplete,
}: AvatarUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type and size (max 3 MB)
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file.');
            return;
        }
        if (file.size > 3 * 1024 * 1024) {
            setError('Image must be under 3 MB.');
            return;
        }

        setError(null);
        setSuccess(false);
        setProgress(0);

        try {
            const url = await uploadAvatar(file, userId, (pct) => setProgress(pct));
            onUploadComplete(url);
            setSuccess(true);
            setProgress(null);
        } catch (err: any) {
            console.error('Avatar upload failed:', err);
            setError('Upload failed. Please try again.');
            setProgress(null);
        }

        // Reset input so same file can be re-selected
        if (inputRef.current) inputRef.current.value = '';
    };

    const uploading = progress !== null;

    return (
        <div className="flex items-center gap-5">
            {/* Avatar preview */}
            <div className="relative flex-shrink-0 group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/[0.08] bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 flex items-center justify-center">
                    {currentPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={currentPhotoUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-2xl font-black text-white/80">
                            {currentInitials}
                        </span>
                    )}

                    {/* Hover overlay */}
                    {!uploading && (
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                            aria-label="Change avatar"
                        >
                            <Camera size={22} className="text-white" />
                        </button>
                    )}

                    {/* Upload progress overlay */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-2xl gap-1">
                            <Loader2 size={20} className="text-indigo-400 animate-spin" />
                            <span className="text-[10px] font-bold text-indigo-300">{progress}%</span>
                        </div>
                    )}
                </div>

                {/* Progress ring */}
                {uploading && (
                    <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] -rotate-90" viewBox="0 0 88 88">
                        <circle cx="44" cy="44" r="42" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="3" />
                        <circle
                            cx="44" cy="44" r="42" fill="none"
                            stroke="#6366f1" strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 42}`}
                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - (progress ?? 0) / 100)}`}
                            className="transition-all duration-300"
                        />
                    </svg>
                )}
            </div>

            {/* Right side: info + button */}
            <div className="flex-1">
                <p className="text-sm font-semibold text-slate-200 mb-1">Profile Picture</p>
                <p className="text-xs text-slate-500 mb-3">
                    JPG, PNG or WebP · Max 3 MB · Stored securely on Firebase
                </p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                            uploading
                                ? 'border-white/[0.06] text-slate-600 cursor-not-allowed'
                                : 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50'
                        )}
                    >
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                        {uploading ? `Uploading ${progress}%…` : 'Change Photo'}
                    </button>

                    {success && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <CheckCircle size={14} /> Saved!
                        </span>
                    )}
                </div>

                {error && (
                    <p className="flex items-center gap-1.5 text-xs text-rose-400 mt-2">
                        <AlertCircle size={12} /> {error}
                    </p>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}
