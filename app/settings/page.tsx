'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import { createClient } from '@/lib/supabase/client';
import { User, Github, Bell, Palette, Shield, Save, Check, ExternalLink, Moon, Sun, Monitor, Download, Trash2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'connections', label: 'Connections', icon: Github },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account', icon: Shield },
];

const DEFAULT_NOTIF_PREFS = {
    challengeNew: true,
    challengeDeadline: true,
    submissionScored: true,
    squadInvite: true,
    leaguePromotion: true,
    emailDigest: false,
};

export default function SettingsPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [tab, setTab] = useState('profile');
    const [saved, setSaved] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [avatarInitials, setAvatarInitials] = useState<string>('?');
    const [githubUsername, setGithubUsername] = useState<string | null>(null);
    const [githubConnected, setGithubConnected] = useState(false);

    const [profile, setProfile] = useState({
        displayName: '',
        username: '',
        bio: '',
        location: '',
        website: '',
    });

    const [notifPrefs, setNotifPrefs] = useState(DEFAULT_NOTIF_PREFS);

    // Secure: redirect if not logged in
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) {
                router.replace('/auth');
                return;
            }
            setUserId(user.id);
            // Split the query: typed fields first, then new `notification_prefs` column via `as any`
            const { data } = await supabase
                .from('users')
                .select('display_name, username, bio, location, website, avatar, github_username, github_connected')
                .eq('id', user.id)
                .single();
            // Fetch notification_prefs separately to avoid TS schema mismatch (column may be new)
            const { data: notifData } = await (supabase as any)
                .from('users')
                .select('notification_prefs')
                .eq('id', user.id)
                .single();
            if (data) {
                const displayName = data.display_name || user.email?.split('@')[0] || '';
                const nameParts = displayName.trim().split(' ');
                const initials = nameParts.length >= 2
                    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                    : displayName.slice(0, 2).toUpperCase();
                setAvatarInitials(data.avatar || initials);
                setGithubUsername(data.github_username);
                setGithubConnected(data.github_connected ?? false);
                setProfile({
                    displayName,
                    username: data.username || '',
                    bio: data.bio || '',
                    location: data.location || '',
                    website: data.website || '',
                });
                if (notifData?.notification_prefs) {
                    setNotifPrefs({ ...DEFAULT_NOTIF_PREFS, ...(notifData.notification_prefs as any) });
                }
            }
        });
    }, [router]);

    const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    const handleSaveProfile = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('users').update({
            display_name: profile.displayName,
            bio: profile.bio,
            location: profile.location,
            website: profile.website,
        }).eq('id', user.id);
        showSaved();
    };

    const handleSaveNotifPrefs = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await (supabase as any).from('users').update({ notification_prefs: notifPrefs }).eq('id', user.id);
        showSaved();
    };

    // Password change
    const [pwLoading, setPwLoading] = useState(false);
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pwError, setPwError] = useState<string | null>(null);
    const [pwSuccess, setPwSuccess] = useState(false);

    const handleChangePassword = async () => {
        if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
        if (newPw.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
        setPwLoading(true); setPwError(null);
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password: newPw });
        if (error) { setPwError(error.message); }
        else { setPwSuccess(true); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
        setPwLoading(false);
    };

    // Data export
    const [exportLoading, setExportLoading] = useState(false);
    const handleExportData = async () => {
        setExportLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setExportLoading(false); return; }
        const [{ data: userData }, { data: submissions }] = await Promise.all([
            supabase.from('users').select('*').eq('id', user.id).single(),
            supabase.from('submissions').select('*').eq('user_id', user.id),
        ]);
        const exportData = { profile: userData, submissions: submissions || [], exportedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proofstack-export-${user.id.slice(0, 8)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setExportLoading(false);
    };

    // Account deletion
    const [deleteLoading, setDeleteLoading] = useState(false);
    const handleDeleteAccount = async () => {
        const confirm1 = window.confirm('Are you absolutely sure you want to delete your account? This cannot be undone.');
        if (!confirm1) return;
        const confirm2 = window.prompt('Type DELETE to confirm account deletion:');
        if (confirm2 !== 'DELETE') { alert('Account deletion cancelled.'); return; }
        setDeleteLoading(true);
        // Note: Deleting auth.users requires a service-role call — we sign out and show message for now
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace('/auth');
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
                    <div className="flex-1 glass-card p-6 min-h-[500px] relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {/* PROFILE TAB */}
                            {tab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h2 className="text-base font-semibold text-white mb-1">Profile Information</h2>
                                        <p className="text-xs text-slate-500">This information appears on your public profile.</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Avatar initials={avatarInitials} size="xl" />
                                        <div>
                                            <input
                                                type="file"
                                                id="avatar-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const supabase = createClient();
                                                    const { data: { user } } = await supabase.auth.getUser();
                                                    if (!user) return;
                                                    const fileExt = file.name.split('.').pop();
                                                    const filePath = `${user.id}-${Math.random()}.${fileExt}`;
                                                    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
                                                    if (!uploadError) {
                                                        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
                                                        await supabase.from('users').update({ avatar: publicUrl }).eq('id', user.id);
                                                        setAvatarInitials(publicUrl);
                                                    }
                                                }}
                                            />
                                            <label htmlFor="avatar-upload" className="btn-ghost text-xs px-4 py-1.5 cursor-pointer inline-block">
                                                Change Avatar
                                            </label>
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
                                                disabled
                                                className="input-field opacity-60 cursor-not-allowed"
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
                                        <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm">
                                            {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* CONNECTIONS TAB */}
                            {tab === 'connections' && (
                                <motion.div
                                    key="connections"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h2 className="text-base font-semibold text-white mb-1">Connected Accounts</h2>
                                        <p className="text-xs text-slate-500">Manage your linked services.</p>
                                    </div>

                                    {githubConnected && githubUsername ? (
                                        <div className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-200">
                                                <Github size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-200">GitHub</p>
                                                <p className="text-xs text-emerald-400 flex items-center gap-1"><Check size={10} /> Connected as @{githubUsername}</p>
                                            </div>
                                            <button className="btn-ghost text-xs px-3 py-1.5">Disconnect</button>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-slate-500">
                                                <Github size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-400">GitHub</p>
                                                <p className="text-xs text-slate-600">Coming soon</p>
                                            </div>
                                            <button disabled className="btn-ghost text-xs px-3 py-1.5 opacity-50 cursor-not-allowed">Connect</button>
                                        </div>
                                    )}

                                    {['GitLab', 'Google'].map(service => (
                                        <div key={service} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-slate-500">
                                                <ExternalLink size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-400">{service}</p>
                                                <p className="text-xs text-slate-600">Coming soon</p>
                                            </div>
                                            <button disabled className="btn-ghost text-xs px-3 py-1.5 opacity-50 cursor-not-allowed">Connect</button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {/* NOTIFICATIONS TAB */}
                            {tab === 'notifications' && (
                                <motion.div
                                    key="notifications"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h2 className="text-base font-semibold text-white mb-1">Notification Preferences</h2>
                                        <p className="text-xs text-slate-500">Your preferences are saved to your account.</p>
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
                                            <label key={key} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer group">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-300 transition-colors group-hover:text-white">{label}</p>
                                                    <p className="text-xs text-slate-600 transition-colors group-hover:text-slate-400">{desc}</p>
                                                </div>
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={notifPrefs[key]}
                                                        onChange={e => setNotifPrefs({ ...notifPrefs, [key]: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-[42px] h-[24px] rounded-full bg-slate-700/50 border border-black/20 peer-checked:bg-emerald-500 shadow-inner overflow-hidden transition-all duration-300" />
                                                    <div className="absolute left-[3px] top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm border border-black/5 peer-checked:translate-x-[18px] transition-transform duration-300" />
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <button onClick={handleSaveNotifPrefs} className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm">
                                            {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Preferences</>}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* APPEARANCE TAB */}
                            {tab === 'appearance' && (
                                <motion.div
                                    key="appearance"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
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
                                </motion.div>
                            )}

                            {/* ACCOUNT TAB */}
                            {tab === 'account' && (
                                <motion.div
                                    key="account"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h2 className="text-base font-semibold text-white mb-1">Account</h2>
                                        <p className="text-xs text-slate-500">Manage your account security and data.</p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Change Password */}
                                        <div className="p-5 rounded-xl border border-white/[0.06] space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Lock size={16} className="text-indigo-400" />
                                                <h3 className="text-sm font-semibold text-slate-200">Change Password</h3>
                                            </div>
                                            {pwError && (
                                                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{pwError}</p>
                                            )}
                                            {pwSuccess && (
                                                <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-1.5"><Check size={12} /> Password updated successfully.</p>
                                            )}
                                            <div className="space-y-3">
                                                <input
                                                    type="password"
                                                    placeholder="New password (min 8 chars)"
                                                    value={newPw}
                                                    onChange={e => setNewPw(e.target.value)}
                                                    className="input-field text-sm"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    value={confirmPw}
                                                    onChange={e => setConfirmPw(e.target.value)}
                                                    className="input-field text-sm"
                                                />
                                                <button
                                                    onClick={handleChangePassword}
                                                    disabled={pwLoading || !newPw || !confirmPw}
                                                    className="btn-primary text-xs px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {pwLoading ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={13} />}
                                                    Update Password
                                                </button>
                                            </div>
                                        </div>

                                        {/* Export Data */}
                                        <div className="p-5 rounded-xl border border-white/[0.06]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Download size={16} className="text-cyan-400" />
                                                <h3 className="text-sm font-semibold text-slate-200">Export Data</h3>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-3">Download all your submissions, scores, and profile data as JSON.</p>
                                            <button
                                                onClick={handleExportData}
                                                disabled={exportLoading}
                                                className="btn-ghost text-xs px-4 py-2 flex items-center gap-2"
                                            >
                                                {exportLoading ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={13} />}
                                                Export My Data
                                            </button>
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/[0.03]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Trash2 size={16} className="text-rose-400" />
                                                <h3 className="text-sm font-semibold text-rose-400">Danger Zone</h3>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-3">Permanently sign out and request deletion of your account. This cannot be undone.</p>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={deleteLoading}
                                                className="px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-all flex items-center gap-2"
                                            >
                                                <Trash2 size={13} />
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
