'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import { User, Github, Bell, Palette, Shield, Save, Check, ExternalLink, Moon, Sun, Monitor } from 'lucide-react';

const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'connections', label: 'Connections', icon: Github },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account', icon: Shield },
];

export default function SettingsPage() {
    const { currentUser } = useStore();
    const { theme, setTheme } = useTheme();
    const [tab, setTab] = useState('profile');
    const [saved, setSaved] = useState(false);

    const [profile, setProfile] = useState({
        displayName: currentUser.displayName,
        username: currentUser.username,
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        website: currentUser.website || '',
    });

    const [notifPrefs, setNotifPrefs] = useState({
        challengeNew: true,
        challengeDeadline: true,
        submissionScored: true,
        squadInvite: true,
        leaguePromotion: true,
        emailDigest: false,
    });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your profile, connections, and preferences.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Tab sidebar */}
                    <div className="lg:w-56 flex-shrink-0">
                        <div className="glass-card p-2 space-y-0.5">
                            {tabs.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setTab(id)}
                                    className={cn(
                                        'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                                        tab === id
                                            ? 'text-indigo-300 bg-indigo-500/15 border border-indigo-500/20'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                                    )}
                                >
                                    <Icon size={16} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 glass-card p-6">
                        {/* PROFILE TAB */}
                        {tab === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-base font-semibold text-white mb-1">Profile Information</h2>
                                    <p className="text-xs text-slate-500">This information appears on your public profile.</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Avatar initials={currentUser.avatar} size="xl" />
                                    <div>
                                        <button className="btn-ghost text-xs px-4 py-1.5">Change Avatar</button>
                                        <p className="text-[10px] text-slate-600 mt-1">PNG, JPG up to 2MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Display Name</label>
                                        <input
                                            value={profile.displayName}
                                            onChange={e => setProfile({ ...profile, displayName: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
                                        <input
                                            value={profile.username}
                                            onChange={e => setProfile({ ...profile, username: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Bio</label>
                                    <textarea
                                        value={profile.bio}
                                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                        rows={3}
                                        className="input-field resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Location</label>
                                        <input
                                            value={profile.location}
                                            onChange={e => setProfile({ ...profile, location: e.target.value })}
                                            className="input-field"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Website</label>
                                        <input
                                            value={profile.website}
                                            onChange={e => setProfile({ ...profile, website: e.target.value })}
                                            className="input-field"
                                            placeholder="https://"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm">
                                        {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* CONNECTIONS TAB */}
                        {tab === 'connections' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-base font-semibold text-white mb-1">Connected Accounts</h2>
                                    <p className="text-xs text-slate-500">Manage your linked services.</p>
                                </div>

                                <div className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-200">
                                        <Github size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-200">GitHub</p>
                                        <p className="text-xs text-emerald-400 flex items-center gap-1"><Check size={10} /> Connected as @{currentUser.githubUsername}</p>
                                    </div>
                                    <button className="btn-ghost text-xs px-3 py-1.5">Disconnect</button>
                                </div>

                                {['GitLab', 'Google'].map(service => (
                                    <div key={service} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-slate-500">
                                            <ExternalLink size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-400">{service}</p>
                                            <p className="text-xs text-slate-600">Not connected</p>
                                        </div>
                                        <button className="btn-primary text-xs px-3 py-1.5">Connect</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* NOTIFICATIONS TAB */}
                        {tab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-base font-semibold text-white mb-1">Notification Preferences</h2>
                                    <p className="text-xs text-slate-500">Choose what you want to be notified about.</p>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { key: 'challengeNew' as const, label: 'New Challenges', desc: 'When a new challenge is published' },
                                        { key: 'challengeDeadline' as const, label: 'Deadline Reminders', desc: '24h before challenge deadline' },
                                        { key: 'submissionScored' as const, label: 'Submission Scored', desc: 'When your submission receives an AI score' },
                                        { key: 'squadInvite' as const, label: 'Squad Invitations', desc: 'When someone invites you to a squad' },
                                        { key: 'leaguePromotion' as const, label: 'League Changes', desc: 'Promotion or demotion notifications' },
                                        { key: 'emailDigest' as const, label: 'Weekly Email Digest', desc: 'Summary of your activity sent weekly' },
                                    ].map(({ key, label, desc }) => (
                                        <label key={key} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer">
                                            <div>
                                                <p className="text-sm font-medium text-slate-300">{label}</p>
                                                <p className="text-xs text-slate-600">{desc}</p>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={notifPrefs[key]}
                                                    onChange={e => setNotifPrefs({ ...notifPrefs, [key]: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5 rounded-full bg-white/[0.06] peer-checked:bg-indigo-500/60 transition-colors" />
                                                <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-slate-400 peer-checked:bg-white peer-checked:translate-x-5 transition-all" />
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex justify-end">
                                    <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm">
                                        {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Preferences</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* APPEARANCE TAB */}
                        {tab === 'appearance' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-base font-semibold text-white mb-1">Appearance</h2>
                                    <p className="text-xs text-slate-500">Customize how ProofStack looks for you.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-3">Theme</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'dark', label: 'Dark', icon: Moon, desc: 'Default dark mode' },
                                            { id: 'light', label: 'Light', icon: Sun, desc: 'Light theme' },
                                            { id: 'system', label: 'System', icon: Monitor, desc: 'Match OS preference' },
                                        ].map(({ id, label, icon: Icon, desc }) => (
                                            <button
                                                key={id}
                                                onClick={() => setTheme(id as 'dark' | 'light' | 'system')}
                                                className={cn(
                                                    'p-4 rounded-xl border text-center transition-all',
                                                    theme === id
                                                        ? 'border-indigo-500/40 bg-indigo-500/10'
                                                        : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                                                )}
                                            >
                                                <Icon size={20} className={theme === id ? 'text-indigo-400 mx-auto mb-2' : 'text-slate-500 mx-auto mb-2'} />
                                                <p className={cn('text-sm font-medium', theme === id ? 'text-indigo-300' : 'text-slate-400')}>{label}</p>
                                                <p className="text-[10px] text-slate-600 mt-0.5">{desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ACCOUNT TAB */}
                        {tab === 'account' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-base font-semibold text-white mb-1">Account</h2>
                                    <p className="text-xs text-slate-500">Manage your account security and data.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl border border-white/[0.06]">
                                        <h3 className="text-sm font-medium text-slate-300 mb-1">Change Password</h3>
                                        <p className="text-xs text-slate-500 mb-3">Update your password for email login.</p>
                                        <button className="btn-ghost text-xs px-4 py-2">Change Password</button>
                                    </div>

                                    <div className="p-4 rounded-xl border border-white/[0.06]">
                                        <h3 className="text-sm font-medium text-slate-300 mb-1">Export Data</h3>
                                        <p className="text-xs text-slate-500 mb-3">Download all your submissions, scores, and profile data as JSON.</p>
                                        <button className="btn-ghost text-xs px-4 py-2">Export My Data</button>
                                    </div>

                                    <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.03]">
                                        <h3 className="text-sm font-medium text-rose-400 mb-1">Danger Zone</h3>
                                        <p className="text-xs text-slate-500 mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>
                                        <button className="px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-all">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
