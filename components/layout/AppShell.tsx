'use client';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { ui } = useStore();

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 page-enter">
                    {children}
                </main>
            </div>
        </div>
    );
}
