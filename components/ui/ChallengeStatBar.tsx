'use client';

import { useState } from 'react';
import { Users, MessageSquare, Code2 } from 'lucide-react';
import ParticipantsModal from './ParticipantsModal';
import CommentsModal from './CommentsModal';

interface Props {
    challengeId: string;
    challengeTitle: string;
    participantsCount: number;
    submissionsCount: number;
    userId: string | null;
}

export default function ChallengeStatBar({ challengeId, challengeTitle, participantsCount, submissionsCount, userId }: Props) {
    const [showParticipants, setShowParticipants] = useState(false);
    const [showComments, setShowComments] = useState(false);

    return (
        <>
            <div className="flex items-center gap-1 flex-wrap">
                {/* Participants */}
                <button
                    onClick={() => setShowParticipants(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/[0.08] transition-all"
                >
                    <Users size={15} />
                    <span className="font-medium">{participantsCount}</span>
                    <span>participants</span>
                </button>

                <span className="text-slate-700">·</span>

                {/* Submissions */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400">
                    <Code2 size={15} />
                    <span className="font-medium">{submissionsCount}</span>
                    <span>submissions</span>
                </div>

                <span className="text-slate-700">·</span>

                {/* Discussion */}
                <button
                    onClick={() => setShowComments(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/[0.08] transition-all"
                >
                    <MessageSquare size={15} />
                    <span>Discussion</span>
                </button>
            </div>

            {showParticipants && (
                <ParticipantsModal
                    challengeId={challengeId}
                    challengeTitle={challengeTitle}
                    participantsCount={participantsCount}
                    onClose={() => setShowParticipants(false)}
                />
            )}

            {showComments && (
                <CommentsModal
                    challengeId={challengeId}
                    challengeTitle={challengeTitle}
                    userId={userId}
                    onClose={() => setShowComments(false)}
                />
            )}
        </>
    );
}
