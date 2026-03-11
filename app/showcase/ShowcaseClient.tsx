'use client';

import { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import Avatar from '@/components/ui/Avatar';
import LeagueBadge from '@/components/ui/LeagueBadge';
import { createClient } from '@/lib/supabase/client';
import { cn, getScoreColor, formatRelativeTime, getRoleShort } from '@/lib/utils';
import {
    ThumbsUp,
    MessageCircle,
    ExternalLink,
    Github,
    Eye,
    Trophy,
    Send,
    GalleryVerticalEnd,
    Search,
    Flame,
} from 'lucide-react';

type SortOption = 'newest' | 'top-score' | 'most-upvoted';

interface ShowcaseProject {
    id: string;
    challengeId: string | null;
    challengeTitle: string;
    userId: string | null;
    username: string;
    displayName: string;
    avatar: string;
    league: string;
    role: string;
    liveUrl: string;
    githubRepo: string;
    screenshotUrl: string;
    totalScore: number;
    tier: number;
    submittedAt: string;
    techStack: string[];
    description: string;
    upvotes: number;
    upvotedByMe: boolean;
    commentsCount: number;
}

interface Comment {
    id: string;
    username: string;
    avatar: string;
    text: string;
    time: string;
}

export default function ShowcaseClient({
    projects,
    currentUserId,
}: {
    projects: ShowcaseProject[];
    currentUserId: string | null;
}) {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortOption>('newest');
    const [upvoteState, setUpvoteState] = useState<Record<string, { upvoted: boolean; count: number }>>(() => {
        const init: Record<string, { upvoted: boolean; count: number }> = {};
        projects.forEach(p => { init[p.id] = { upvoted: p.upvotedByMe, count: p.upvotes }; });
        return init;
    });
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [newComment, setNewComment] = useState<Record<string, string>>({});

    const toggleUpvote = async (id: string) => {
        if (!currentUserId) return;
        const supabase = createClient();
        const was = upvoteState[id]?.upvoted;
        setUpvoteState(prev => ({
            ...prev,
            [id]: { upvoted: !was, count: was ? prev[id].count - 1 : prev[id].count + 1 },
        }));
        if (was) {
            await supabase.from('submission_upvotes').delete().eq('user_id', currentUserId).eq('submission_id', id);
            await supabase.from('submissions').update({ upvotes: upvoteState[id].count - 1 }).eq('id', id);
        } else {
            await supabase.from('submission_upvotes').upsert({ user_id: currentUserId, submission_id: id });
            await supabase.from('submissions').update({ upvotes: upvoteState[id].count + 1 }).eq('id', id);
        }
    };

    const toggleComments = async (id: string) => {
        const isOpen = expandedComments[id];
        setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
        if (!isOpen && !comments[id]) {
            const supabase = createClient();
            const { data } = await supabase
                .from('submission_comments')
                .select('id, text, created_at, user_id, users(username, avatar)')
                .eq('submission_id', id)
                .order('created_at', { ascending: true });
            if (data) {
                setComments(prev => ({
                    ...prev,
                    [id]: data.map((c: any) => ({
                        id: c.id,
                        username: c.users?.username || 'user',
                        avatar: c.users?.avatar || '??',
                        text: c.text,
                        time: c.created_at,
                    })),
                }));
            }
        }
    };

    const submitComment = async (id: string) => {
        const text = newComment[id]?.trim();
        if (!text || !currentUserId) return;
        const supabase = createClient();
        const { data } = await supabase
            .from('submission_comments')
            .insert({ submission_id: id, user_id: currentUserId, text })
            .select('id, text, created_at, user_id, users(username, avatar)')
            .single();
        if (data) {
            const c = data as any;
            setComments(prev => ({
                ...prev,
                [id]: [...(prev[id] || []), {
                    id: c.id,
                    username: c.users?.username || 'you',
                    avatar: c.users?.avatar || '??',
                    text: c.text,
                    time: c.created_at,
                }],
            }));
            setNewComment(prev => ({ ...prev, [id]: '' }));
        }
    };

    const filtered = useMemo(() => {
        let items = [...projects];
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(p =>
                p.challengeTitle.toLowerCase().includes(q) ||
                p.displayName.toLowerCase().includes(q) ||
                p.techStack.some(t => t.toLowerCase().includes(q))
            );
        }
        switch (sort) {
            case 'newest': items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()); break;
            case 'top-score': items.sort((a, b) => b.totalScore - a.totalScore); break;
            case 'most-upvoted': items.sort((a, b) => (upvoteState[b.id]?.count || 0) - (upvoteState[a.id]?.count || 0)); break;
        }
        return items;
    }, [search, sort, upvoteState, projects]);

    return (
        <AppShell>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Showcase</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Browse verified submissions from completed challenges. Upvote, comment, and discover the best engineering work.
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search projects, engineers, or tech..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input-field pl-9"
                        />
                    </div>
                    <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05] self-start">
                        {([
                            { key: 'newest', label: 'Newest' },
                            { key: 'top-score', label: 'Top Score' },
                            { key: 'most-upvoted', label: 'Most Voted' },
                        ] as { key: SortOption; label: string }[]).map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setSort(key)}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                    sort === key
                                        ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(108,99,255,0.3)]'
                                        : 'text-slate-400 hover:text-slate-200'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                <div className="text-sm text-slate-500 flex items-center gap-2">
                    <GalleryVerticalEnd size={14} className="text-indigo-400" />
                    <span><span className="text-slate-300 font-medium">{filtered.length}</span> projects found</span>
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="glass-card p-16 text-center">
                        <GalleryVerticalEnd size={40} className="text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 font-semibold text-base">
                            {search ? 'No projects match your search' : 'No showcase projects yet'}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                            {search ? 'Try different keywords or clear your search.' : 'Be the first to complete a challenge and share your work here.'}
                        </p>
                    </div>
                )}

                {/* Project Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(project => (
                        <div key={project.id} className="glass-card overflow-hidden flex flex-col">
                            {/* Screenshot */}
                            <div className="relative group cursor-pointer" onClick={() => project.liveUrl && window.open(project.liveUrl, '_blank')}>
                                <div className="w-full h-40 overflow-hidden bg-slate-900/50 flex items-center justify-center">
                                    {project.screenshotUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={project.screenshotUrl}
                                            alt={project.challengeTitle}
                                            className="w-full h-full object-cover transition-all duration-500 filter blur-[6px] group-hover:blur-[3px] scale-105 group-hover:scale-100"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-700">
                                            <Flame size={28} />
                                            <span className="text-xs">No preview</span>
                                        </div>
                                    )}
                                </div>
                                {project.liveUrl && (
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-all flex items-center justify-center">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium opacity-70 group-hover:opacity-100 transition-all group-hover:scale-105">
                                            <Eye size={14} />
                                            View Live
                                            <ExternalLink size={12} />
                                        </div>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10">
                                    <Trophy size={10} className="text-amber-400" />
                                    <span className={cn('text-xs font-mono font-bold', getScoreColor(project.totalScore))}>{project.totalScore}</span>
                                </div>
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] text-slate-300 font-medium">
                                    T{project.tier}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">{project.challengeTitle}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{project.description || 'No description provided.'}</p>

                                {/* Author */}
                                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/[0.06]">
                                    <Avatar initials={project.avatar} size="xs" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-200 truncate">{project.displayName}</p>
                                        <p className="text-[10px] text-slate-500">{getRoleShort(project.role as any)}</p>
                                    </div>
                                    <LeagueBadge league={project.league as any} size="sm" />
                                </div>

                                {/* Tech stack */}
                                {project.techStack.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {project.techStack.slice(0, 3).map(tech => (
                                            <span key={tech} className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] text-slate-400">
                                                {tech}
                                            </span>
                                        ))}
                                        {project.techStack.length > 3 && (
                                            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] text-slate-500">+{project.techStack.length - 3}</span>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/[0.06]">
                                    <button
                                        onClick={() => toggleUpvote(project.id)}
                                        className={cn(
                                            'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all border',
                                            upvoteState[project.id]?.upvoted
                                                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                                                : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-indigo-300'
                                        )}
                                        title={currentUserId ? 'Upvote' : 'Sign in to upvote'}
                                    >
                                        <ThumbsUp size={11} className={upvoteState[project.id]?.upvoted ? 'fill-current' : ''} />
                                        {upvoteState[project.id]?.count || 0}
                                    </button>

                                    <button
                                        onClick={() => toggleComments(project.id)}
                                        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all"
                                    >
                                        <MessageCircle size={11} />
                                        {expandedComments[project.id]
                                            ? (comments[project.id]?.length ?? project.commentsCount)
                                            : project.commentsCount}
                                    </button>

                                    <div className="ml-auto flex gap-1">
                                        {project.liveUrl && (
                                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                                                className="p-1.5 rounded-md text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 border border-indigo-500/15 hover:border-indigo-500/30 transition-all">
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                        {project.githubRepo && (
                                            <a href={`https://github.com/${project.githubRepo}`} target="_blank" rel="noopener noreferrer"
                                                className="p-1.5 rounded-md text-slate-400 hover:text-slate-300 bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all">
                                                <Github size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Comments (expandable) */}
                                {expandedComments[project.id] && (
                                    <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                                        {(comments[project.id] || []).length === 0 && (
                                            <p className="text-xs text-slate-600 text-center italic">No comments yet — be the first!</p>
                                        )}
                                        {(comments[project.id] || []).map(comment => (
                                            <div key={comment.id} className="flex gap-3">
                                                <Avatar initials={comment.avatar} size="xs" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-slate-300">@{comment.username}</span>
                                                        <span className="text-[10px] text-slate-600">{formatRelativeTime(comment.time)}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {currentUserId && (
                                            <div className="flex gap-3 pt-2">
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a comment..."
                                                        value={newComment[project.id] || ''}
                                                        onChange={e => setNewComment(prev => ({ ...prev, [project.id]: e.target.value }))}
                                                        onKeyDown={e => e.key === 'Enter' && submitComment(project.id)}
                                                        className="input-field pr-10 text-sm"
                                                    />
                                                    <button
                                                        onClick={() => submitComment(project.id)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                                                    >
                                                        <Send size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
