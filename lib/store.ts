'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, League, Role, DifficultyTier, ChallengeMode } from '@/lib/types';
import { currentUser } from '@/lib/mock/users';

interface ChallengeFilters {
    role: Role | 'All';
    tier: DifficultyTier | 'All';
    mode: ChallengeMode | 'All';
    status: 'Active' | 'Upcoming' | 'All';
    search: string;
}

interface UIState {
    sidebarCollapsed: boolean;
    notificationsOpen: boolean;
    commandPaletteOpen: boolean;
}

interface AppState {
    // Auth
    currentUser: User;
    isAuthenticated: boolean;
    setCurrentUser: (user: User) => void;
    logout: () => void;

    // Challenge filters
    challengeFilters: ChallengeFilters;
    setChallengeFilter: <K extends keyof ChallengeFilters>(key: K, value: ChallengeFilters[K]) => void;
    resetChallengeFilters: () => void;

    // Leaderboard
    leaderboardTab: 'global' | 'role' | 'squad';
    leaderboardLeague: League | 'All';
    leaderboardRole: Role | 'All';
    setLeaderboardTab: (tab: 'global' | 'role' | 'squad') => void;
    setLeaderboardLeague: (league: League | 'All') => void;
    setLeaderboardRole: (role: Role | 'All') => void;

    // UI
    ui: UIState;
    toggleSidebar: () => void;
    setSidebarCollapsed: (v: boolean) => void;
    toggleNotifications: () => void;
    toggleCommandPalette: () => void;

    // Notifications
    unreadNotifications: number;
    markNotificationsRead: () => void;
}

const defaultFilters: ChallengeFilters = {
    role: 'All',
    tier: 'All',
    mode: 'All',
    status: 'Active',
    search: '',
};

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            // Auth
            currentUser,
            isAuthenticated: true, // demo: auto-authenticated
            setCurrentUser: (user) => set({ currentUser: user }),
            logout: () => set({ isAuthenticated: false }),

            // Challenge filters
            challengeFilters: defaultFilters,
            setChallengeFilter: (key, value) =>
                set((state) => ({
                    challengeFilters: { ...state.challengeFilters, [key]: value },
                })),
            resetChallengeFilters: () => set({ challengeFilters: defaultFilters }),

            // Leaderboard
            leaderboardTab: 'global',
            leaderboardLeague: 'All',
            leaderboardRole: 'All',
            setLeaderboardTab: (tab) => set({ leaderboardTab: tab }),
            setLeaderboardLeague: (league) => set({ leaderboardLeague: league }),
            setLeaderboardRole: (role) => set({ leaderboardRole: role }),

            // UI
            ui: {
                sidebarCollapsed: false,
                notificationsOpen: false,
                commandPaletteOpen: false,
            },
            toggleSidebar: () =>
                set((state) => ({
                    ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
                })),
            setSidebarCollapsed: (v) =>
                set((state) => ({ ui: { ...state.ui, sidebarCollapsed: v } })),
            toggleNotifications: () =>
                set((state) => ({
                    ui: { ...state.ui, notificationsOpen: !state.ui.notificationsOpen },
                })),
            toggleCommandPalette: () =>
                set((state) => ({
                    ui: { ...state.ui, commandPaletteOpen: !state.ui.commandPaletteOpen },
                })),

            // Notifications
            unreadNotifications: 3,
            markNotificationsRead: () => set({ unreadNotifications: 0 }),
        }),
        {
            name: 'pow-platform-store',
            partialize: (state) => ({
                ui: { sidebarCollapsed: state.ui.sidebarCollapsed },
                leaderboardTab: state.leaderboardTab,
            }),
        }
    )
);
