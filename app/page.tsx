'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Trophy, Users, Star, Github, Shield, BarChart3, Code2, Terminal, Globe, GitBranch, Menu, X, MessageSquare } from 'lucide-react';

const stats = [
  { label: 'Engineers', value: 12400, suffix: '+', icon: Users, color: 'text-indigo-400' },
  { label: 'Challenges Completed', value: 48920, suffix: '', icon: Zap, color: 'text-cyan-400' },
  { label: 'Active Squads', value: 2180, suffix: '', icon: Shield, color: 'text-emerald-400' },
  { label: 'Projects Validated', value: 91340, suffix: '', icon: Code2, color: 'text-amber-400' },
];

const features = [
  {
    icon: Zap,
    title: 'AI-Generated Challenges',
    description: 'Every 48 hours our AI generates real-world enterprise briefs with full technical specs, constraints, and evaluation criteria.',
    color: 'from-indigo-500/20 to-purple-500/20',
    border: 'border-indigo-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    icon: Code2,
    title: 'Automated AI Scoring',
    description: 'Submit your GitHub repo and live URL. Our validation pipeline analyzes code quality, architecture, security, and performance automatically.',
    color: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Users,
    title: 'Squad Collaboration',
    description: 'Form squads of 2–5 engineers with diverse roles. Collaborate on multi-repo solutions and earn collective and individual scores.',
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Trophy,
    title: 'League Progression',
    description: 'Advance from Newbie to Pro to Elite league based on your verified project history, AI scores, and peer review ratings.',
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: GitBranch,
    title: 'GitHub-Verified Portfolio',
    description: 'Every project is backed by real commits. Contribution analysis maps code to contributors — no fake projects, no inflation.',
    color: 'from-violet-500/20 to-indigo-500/20',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-400',
  },
  {
    icon: Globe,
    title: 'Dynamic Resume + Badge',
    description: 'Auto-generated GitHub SVG badge and one-page PDF resume with verified AI scores, tech stack frequency, and deployment history.',
    color: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/20',
    iconColor: 'text-rose-400',
  },
];

const roles = [
  { icon: '🎨', name: 'Frontend Specialist' },
  { icon: '⚙️', name: 'Backend Engineer' },
  { icon: '🔗', name: 'Full Stack Engineer' },
  { icon: '🚀', name: 'DevOps Engineer' },
  { icon: '📊', name: 'Data Scientist' },
  { icon: '🤖', name: 'ML Engineer' },
  { icon: '✨', name: 'UI/UX Designer' },
];

const topEngineers = [
  { initials: 'KM', name: 'Kiran Mehta', role: 'Backend Engineer', score: 96.3, rank: 1, league: 'Elite' },
  { initials: 'RS', name: 'Rafael Santos', role: 'Full Stack', score: 95.1, rank: 2, league: 'Elite' },
  { initials: 'ZC', name: 'Zara Chen', role: 'Full Stack', score: 94.2, rank: 3, league: 'Elite' },
];

const testimonials = [
  { name: 'Alex Rivera', role: 'Frontend Specialist · Elite', quote: 'ProofStack completely replaced my portfolio. Recruiters contact me based on my verified score, not a resume.' },
  { name: 'Priya Kaur', role: 'Full Stack Engineer · Pro', quote: 'The AI scoring pushed me to write production-grade code. My architecture skills improved 3x in two months.' },
  { name: 'Marcus Okafor', role: 'DevOps Engineer · Elite', quote: 'Squad challenges taught me more about real team collaboration than any bootcamp ever could.' },
];

// Animated counter hook
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function AnimatedStat({ label, value, suffix, icon: Icon, color }: { label: string; value: number; suffix: string; icon: typeof Users; color: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <div className={`flex justify-center mb-2 ${color}`}>
        <Icon size={22} />
      </div>
      <div className="text-3xl font-black text-white mb-1">{count.toLocaleString()}{suffix}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b topbar-container backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(108,99,255,0.5)]">
              <Terminal size={16} className="text-white" />
            </div>
            <span className="text-base font-bold text-gradient">ProofStack</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-slate-200 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-200 transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-slate-200 transition-colors">Roles</a>
            <a href="#leaderboard" className="hover:text-slate-200 transition-colors">Leaderboard</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth" className="btn-ghost text-sm py-2 px-4">Sign In</Link>
            <Link href="/auth?tab=register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] px-6 py-4 space-y-3 bg-[var(--bg-primary)]">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-300 py-2">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-300 py-2">How It Works</a>
            <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-300 py-2">Roles</a>
            <a href="#leaderboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-300 py-2">Leaderboard</a>
            <div className="flex gap-3 pt-2">
              <Link href="/auth" className="btn-ghost text-sm py-2 px-4 flex-1 text-center">Sign In</Link>
              <Link href="/auth?tab=register" className="btn-primary text-sm py-2 px-4 flex-1 text-center">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6">
        {/* Background orbs */}
        <div className="orb orb-indigo w-[600px] h-[600px] -top-40 -left-40" />
        <div className="orb orb-cyan w-[400px] h-[400px] top-20 right-0" />

        {/* Grid bg */}
        <div className="absolute inset-0 grid-bg opacity-40" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <Zap size={14} />
            4 New Challenges Live · Cycle 47
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            <span className="text-white">Your Skills,</span>
            <br />
            <span className="text-gradient">Permanently Verified.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop sending resumes. Build real projects, get scored by AI, get ranked globally.
            ProofStack is the engineering competition platform where code speaks louder than credentials.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/auth?tab=register" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
              Start Competing <ArrowRight size={18} />
            </Link>
            <Link href="/leaderboard" className="btn-ghost text-base px-8 py-3.5 flex items-center gap-2">
              <BarChart3 size={18} /> View Leaderboard
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Github size={16} />
            <span>Integrates with GitHub · No manual uploads · AI-verified</span>
          </div>
        </div>
      </section>

      {/* Animated Stats */}
      <section className="border-y border-white/[0.05] py-12 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Everything You Need to Prove Your Worth</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A complete engineering validation engine built for real-world performance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description, color, border, iconColor }) => (
              <div key={title} className={`glass-card p-6 bg-gradient-to-br ${color} ${border}`}>
                <div className={`w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-4 ${iconColor}`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">How ProofStack Works</h2>
          </div>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Register & Connect GitHub', desc: 'Create your account, select your role, and link your GitHub account. Your commit history becomes your credential.' },
              { step: '02', title: 'Pick an AI Challenge', desc: 'Browse challenges generated every 48 hours. Each brief includes a real client scenario, technical constraints, and evaluation criteria.' },
              { step: '03', title: 'Build & Submit', desc: 'Build your solution, deploy it, then submit your live URL and GitHub repo. Our pipeline validates deployment, analyzes your code, and scores it with AI.' },
              { step: '04', title: 'Get Ranked & Build Your Portfolio', desc: 'Your scores update the global leaderboard. Advance through leagues. Your dynamic resume and GitHub badge update automatically.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-mono font-bold text-gradient">{step}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">What Engineers Say</h2>
            <p className="text-slate-400">Real feedback from ProofStack competitors.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, quote }) => (
              <div key={name} className="glass-card p-6">
                <MessageSquare size={20} className="text-indigo-400/50 mb-4" />
                <p className="text-sm text-slate-300 leading-relaxed mb-4 italic">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{name}</p>
                    <p className="text-[10px] text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Built for Every Engineering Discipline</h2>
          <p className="text-slate-400 mb-12">Challenges are tailored to your role. Rankings are role-specific.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {roles.map(({ icon, name }) => (
              <div key={name} className="glass-card p-4 text-center hover:border-indigo-500/30 transition-all">
                <div className="text-2xl mb-2">{icon}</div>
                <p className="text-xs font-medium text-slate-300">{name}</p>
              </div>
            ))}
            <div className="glass-card p-4 text-center border-dashed border-white/10">
              <div className="text-2xl mb-2">+</div>
              <p className="text-xs font-medium text-slate-500">More coming</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live leaderboard preview */}
      <section id="leaderboard" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Real-Time Global Leaderboard</h2>
          <p className="text-slate-400 mb-12">Rankings update after every validated submission.</p>
          <div className="glass-card p-6 text-left">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <Trophy size={16} className="text-amber-400" /> Global Rankings
              </div>
              <div className="ml-auto flex gap-2">
                {['Elite', 'Pro', 'Newbie'].map(l => (
                  <span key={l} className="text-xs px-2 py-1 rounded-md bg-white/[0.04] text-slate-400">{l}</span>
                ))}
              </div>
            </div>
            {topEngineers.map(({ initials, name, role, score, rank }) => (
              <div key={rank} className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
                <span className={`text-sm font-bold w-6 text-center ${rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-300' : 'text-amber-600'}`}>
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{name}</p>
                  <p className="text-xs text-slate-500">{role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-emerald-400">{score}</p>
                  <p className="text-[10px] text-slate-500">AI Score</p>
                </div>
              </div>
            ))}
            <Link href="/leaderboard" className="flex items-center justify-center gap-2 mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              View Full Leaderboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="orb orb-indigo w-72 h-72 -top-20 -left-20 opacity-20" />
            <div className="orb orb-cyan w-48 h-48 -bottom-10 -right-10 opacity-20" />
            <div className="relative">
              <h2 className="text-4xl font-black text-white mb-4">Ready to Prove Yourself?</h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of engineers who've replaced their static resumes with verified project histories.
              </p>
              <Link href="/auth?tab=register" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
                Create Your Profile <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-indigo-400" />
            <span className="text-gradient font-bold">ProofStack</span>
            <span>— Dynamic Skill Validation Engine</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-300 transition-colors">API</a>
            <a href="#" className="hover:text-slate-300 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

