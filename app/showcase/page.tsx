'use client';

import { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import Avatar from '@/components/ui/Avatar';
import LeagueBadge from '@/components/ui/LeagueBadge';
import { mockUsers } from '@/lib/mock/users';
import { mockChallenges } from '@/lib/mock/challenges';
import { cn, getScoreColor, formatRelativeTime, getRoleShort } from '@/lib/utils';
import {
    ThumbsUp,
    MessageCircle,
    ExternalLink,
    Github,
    Eye,
    Code2,
    Trophy,
    ChevronDown,
    ChevronUp,
    Send,
    SlidersHorizontal,
    GalleryVerticalEnd,
    Search,
    Flame,
} from 'lucide-react';

// ── Mock showcase submissions (completed challenges with community data) ──
const showcaseProjects = [
    {
        id: 'sp-001',
        challengeId: 'ch-004',
        challengeTitle: 'Developer Portfolio CMS with GitHub Sync',
        userId: 'user-001',
        username: 'zara.chen',
        displayName: 'Zara Chen',
        avatar: 'ZC',
        league: 'Elite' as const,
        role: 'Full Stack Engineer',
        liveUrl: 'https://devportfolio.vercel.app',
        githubRepo: 'zarachen/portfolio-cms',
        screenshotUrl: 'https://placehold.co/800x500/1a1a2e/6c63ff?text=Portfolio+CMS',
        totalScore: 94,
        tier: 3,
        submittedAt: '2026-02-20T14:30:00Z',
        techStack: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind'],
        description: 'Full-featured portfolio generator that syncs with your GitHub repos, generates beautiful project cards, and supports custom themes with live preview.',
        upvotes: 47,
        upvotedByMe: false,
        commentsCount: 12,
        comments: [
            { id: 'c1', username: 'marcus.osei', avatar: 'MO', text: 'The GitHub sync is buttery smooth. Great OAuth flow.', time: '2026-02-21T10:00:00Z' },
            { id: 'c2', username: 'priya.sharma', avatar: 'PS', text: 'Love the theme system! How did you handle SSR with dynamic themes?', time: '2026-02-21T14:30:00Z' },
            { id: 'c3', username: 'nia.williams', avatar: 'NW', text: 'Animations are 🔥 — Framer Motion?', time: '2026-02-22T09:15:00Z' },
        ],
    },
    {
        id: 'sp-002',
        challengeId: 'ch-001',
        challengeTitle: 'FinTech Real-Time Transaction Dashboard',
        userId: 'user-002',
        username: 'marcus.osei',
        displayName: 'Marcus Osei',
        avatar: 'MO',
        league: 'Elite' as const,
        role: 'Backend Engineer',
        liveUrl: 'https://novapay-dashboard.vercel.app',
        githubRepo: 'marcosei/fintech-dashboard',
        screenshotUrl: 'https://placehold.co/800x500/0a0e1a/10b981?text=FinTech+Dashboard',
        totalScore: 92,
        tier: 4,
        submittedAt: '2026-02-18T09:00:00Z',
        techStack: ['React', 'Go', 'PostgreSQL', 'WebSocket'],
        description: 'Real-time transaction monitoring with fraud detection, WebSocket-powered live feeds, and a comprehensive analytics dashboard handling 1K TPS.',
        upvotes: 63,
        upvotedByMe: true,
        commentsCount: 18,
        comments: [
            { id: 'c4', username: 'zara.chen', avatar: 'ZC', text: 'WebSocket reconnection logic is solid. The fraud alert UI is clean.', time: '2026-02-18T15:00:00Z' },
            { id: 'c5', username: 'alex.voss', avatar: 'AV', text: 'Impressted with the Go backend — sub-millisecond response times.', time: '2026-02-19T08:30:00Z' },
        ],
    },
    {
        id: 'sp-003',
        challengeId: 'ch-002',
        challengeTitle: 'AI-Powered Code Review Assistant',
        userId: 'user-003',
        username: 'priya.sharma',
        displayName: 'Priya Sharma',
        avatar: 'PS',
        league: 'Elite' as const,
        role: 'ML Engineer',
        liveUrl: 'https://codereviewer.ai',
        githubRepo: 'priyasharma/code-reviewer',
        screenshotUrl: 'https://placehold.co/800x500/0f1526/f59e0b?text=Code+Review+AI',
        totalScore: 89,
        tier: 5,
        submittedAt: '2026-02-15T11:00:00Z',
        techStack: ['Python', 'FastAPI', 'PyTorch', 'React'],
        description: 'AI-powered code review tool that provides intelligent suggestions, detects anti-patterns, and generates architectural improvement recommendations.',
        upvotes: 82,
        upvotedByMe: false,
        commentsCount: 24,
        comments: [
            { id: 'c6', username: 'marcus.osei', avatar: 'MO', text: 'The diff analysis is incredible. How large is the model?', time: '2026-02-16T10:00:00Z' },
            { id: 'c7', username: 'zara.chen', avatar: 'ZC', text: 'This is genuinely useful — tried it on a real PR and caught 3 issues code review missed.', time: '2026-02-16T14:00:00Z' },
        ],
    },
    {
        id: 'sp-004',
        challengeId: 'ch-003',
        challengeTitle: 'E-Commerce Microservices Platform',
        userId: 'user-004',
        username: 'alex.voss',
        displayName: 'Alex Voss',
        avatar: 'AV',
        league: 'Pro' as const,
        role: 'DevOps Engineer',
        liveUrl: 'https://shopscale.demo.app',
        githubRepo: 'alexvoss/shopscale',
        screenshotUrl: 'https://placehold.co/800x500/1a0a2e/e879f9?text=E-Commerce+Platform',
        totalScore: 84,
        tier: 4,
        submittedAt: '2026-02-10T16:00:00Z',
        techStack: ['Kubernetes', 'Go', 'Terraform', 'Redis'],
        description: 'Fully containerized e-commerce platform with auto-scaling microservices, Helm charts, and a GitOps deployment pipeline using ArgoCD.',
        upvotes: 35,
        upvotedByMe: false,
        commentsCount: 9,
        comments: [
            { id: 'c8', username: 'priya.sharma', avatar: 'PS', text: 'The Helm chart structure is textbook clean. Nice work.', time: '2026-02-11T09:00:00Z' },
        ],
    },
    {
        id: 'sp-005',
        challengeId: 'ch-005',
        challengeTitle: 'Accessibility-First Design System',
        userId: 'user-005',
        username: 'nia.williams',
        displayName: 'Nia Williams',
        avatar: 'NW',
        league: 'Pro' as const,
        role: 'Frontend Specialist',
        liveUrl: 'https://a11y-system.vercel.app',
        githubRepo: 'niawilliams/a11y-system',
        screenshotUrl: 'https://placehold.co/800x500/0a1a0e/34d399?text=A11y+Design+System',
        totalScore: 81,
        tier: 3,
        submittedAt: '2026-02-25T13:00:00Z',
        techStack: ['React', 'TypeScript', 'Storybook', 'CSS'],
        description: 'WCAG 2.1 AA compliant design system with 30+ components, automated a11y testing, and interactive Storybook documentation.',
        upvotes: 51,
        upvotedByMe: true,
        commentsCount: 14,
        comments: [
            { id: 'c9', username: 'zara.chen', avatar: 'ZC', text: 'Every project should start with this level of a11y. Incredible documentation.', time: '2026-02-26T10:00:00Z' },
            { id: 'c10', username: 'marcus.osei', avatar: 'MO', text: 'The focus indicators are beautiful and functional. Rare combo.', time: '2026-02-26T15:00:00Z' },
        ],
    },
    {
        id: 'sp-006',
        challengeId: 'ch-001',
        challengeTitle: 'FinTech Real-Time Transaction Dashboard',
        userId: 'user-current',
        username: 'dev.user',
        displayName: 'Jordan Blake',
        avatar: 'JB',
        league: 'Pro' as const,
        role: 'Full Stack Engineer',
        liveUrl: 'https://novapay-dashboard.vercel.app',
        githubRepo: 'jordanblake/fintech-dashboard',
        screenshotUrl: 'https://placehold.co/800x500/0a0e1a/6c63ff?text=FinTech+Dashboard+v2',
        totalScore: 76,
        tier: 4,
        submittedAt: '2026-01-15T09:00:00Z',
        techStack: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
        description: 'WebSocket-powered transaction dashboard with real-time fraud alerts and comprehensive analytics. Features SSR, optimistic UI updates, and role-based access.',
        upvotes: 22,
        upvotedByMe: false,
        commentsCount: 5,
        comments: [
            { id: 'c11', username: 'nia.williams', avatar: 'NW', text: 'Clean UI — the chart animations are a nice touch!', time: '2026-01-16T11:00:00Z' },
        ],
    },
];

type SortOption = 'newest' | 'top-score' | 'most-upvoted';

export default function ShowcasePage() {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortOption>('newest');
    const [upvotes, setUpvotes] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        showcaseProjects.forEach(p => { initial[p.id] = p.upvotedByMe; });
        return initial;
    });
    const [upvoteCounts, setUpvoteCounts] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        showcaseProjects.forEach(p => { initial[p.id] = p.upvotes; });
        return initial;
    });
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [newComment, setNewComment] = useState<Record<string, string>>({});

    const toggleUpvote = (id: string) => {
        setUpvotes(prev => {
            const wasUpvoted = prev[id];
            return { ...prev, [id]: !wasUpvoted };
        });
        setUpvoteCounts(prev => {
            const wasUpvoted = upvotes[id];
            return { ...prev, [id]: wasUpvoted ? prev[id] - 1 : prev[id] + 1 };
        });
    };

    const toggleComments = (id: string) => {
        setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filtered = useMemo(() => {
        let items = [...showcaseProjects];
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
            case 'most-upvoted': items.sort((a, b) => (upvoteCounts[b.id] || 0) - (upvoteCounts[a.id] || 0)); break;
        }
        return items;
    }, [search, sort, upvoteCounts]);

    return (
        <AppShell>
            <div className="max-w-6xl mx-auto space-y-6">
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

                {/* Results */}
                <div className="text-sm text-slate-500 flex items-center gap-2">
                    <GalleryVerticalEnd size={14} className="text-indigo-400" />
                    <span><span className="text-slate-300 font-medium">{filtered.length}</span> projects found</span>
                </div>

                {/* Project Cards */}
                <div className="space-y-6">
                    {filtered.map(project => (
                        <div key={project.id} className="glass-card overflow-hidden">
                            {/* Screenshot (blurred) + CTA overlay */}
                            <div className="relative group cursor-pointer" onClick={() => window.open(project.liveUrl, '_blank')}>
                                <div className="w-full h-52 sm:h-64 overflow-hidden bg-navy-900">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={project.screenshotUrl}
                                        alt={project.challengeTitle}
                                        className="w-full h-full object-cover transition-all duration-500 filter blur-[6px] group-hover:blur-[3px] scale-105 group-hover:scale-100"
                                    />
                                </div>
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105">
                                        <Eye size={16} />
                                        View Live Project
                                        <ExternalLink size={14} />
                                    </div>
                                </div>
                                {/* Score badge */}
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
                                    <Trophy size={12} className="text-amber-400" />
                                    <span className={cn('text-sm font-mono font-bold', getScoreColor(project.totalScore))}>{project.totalScore}</span>
                                </div>
                                {/* Tier badge */}
                                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-xs text-slate-300 font-medium">
                                    Tier {project.tier}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                {/* Title + meta */}
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <h3 className="text-base font-semibold text-white">{project.challengeTitle}</h3>
                                        <p className="text-sm text-slate-400 mt-1 leading-relaxed">{project.description}</p>
                                    </div>
                                </div>

                                {/* Author row */}
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.06]">
                                    <Avatar initials={project.avatar} size="sm" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{project.displayName}</p>
                                        <p className="text-xs text-slate-500">{getRoleShort(project.role as any)} · {formatRelativeTime(project.submittedAt)}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <LeagueBadge league={project.league} size="sm" />
                                    </div>
                                </div>

                                {/* Tech stack */}
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {project.techStack.map(tech => (
                                        <span key={tech} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400">
                                            <Code2 size={10} className="text-indigo-400" />
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                {/* Actions row */}
                                <div className="flex items-center gap-4">
                                    {/* Upvote */}
                                    <button
                                        onClick={() => toggleUpvote(project.id)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                                            upvotes[project.id]
                                                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                                                : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:border-indigo-500/20 hover:text-indigo-300'
                                        )}
                                    >
                                        <ThumbsUp size={14} className={upvotes[project.id] ? 'fill-current' : ''} />
                                        {upvoteCounts[project.id] || 0}
                                    </button>

                                    {/* Comments toggle */}
                                    <button
                                        onClick={() => toggleComments(project.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all"
                                    >
                                        <MessageCircle size={14} />
                                        {project.commentsCount}
                                        {expandedComments[project.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>

                                    <div className="ml-auto flex gap-2">
                                        <a
                                            href={project.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 border border-indigo-500/15 hover:border-indigo-500/30 transition-all"
                                        >
                                            <ExternalLink size={12} /> Live
                                        </a>
                                        <a
                                            href={`https://github.com/${project.githubRepo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-300 bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all"
                                        >
                                            <Github size={12} /> Source
                                        </a>
                                    </div>
                                </div>

                                {/* Comments section (expandable) */}
                                {expandedComments[project.id] && (
                                    <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                                        {project.comments.map(comment => (
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

                                        {/* Add comment input */}
                                        <div className="flex gap-3 pt-2">
                                            <Avatar initials="JB" size="xs" />
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    placeholder="Add a comment..."
                                                    value={newComment[project.id] || ''}
                                                    onChange={e => setNewComment(prev => ({ ...prev, [project.id]: e.target.value }))}
                                                    className="input-field pr-10 text-sm"
                                                />
                                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all">
                                                    <Send size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <GalleryVerticalEnd size={32} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No projects match your search</p>
                        <p className="text-sm text-slate-600 mt-1">Try different keywords or clear your search</p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
