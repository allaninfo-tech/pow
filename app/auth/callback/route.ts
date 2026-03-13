import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') ?? '/dashboard';

    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            'https://mwqncgfujyddexudjlcw.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaG1neW13ZGFodXllbWlvc3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTQ1MzksImV4cCI6MjA4ODk3MDUzOX0.1vV9H_b_mGQZYOm59PKyrt0UvfbNVMV64T_SlAnqRJI',
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    },
                },
            }
        );

        // Exchange the OAuth code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Upsert the user row in our public.users table
            // (handles first-time Google/GitHub login creating the profile)
            const user = data.user;
            const displayName =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.user_metadata?.user_name ||
                user.email?.split('@')[0] ||
                'User';

            const username = (
                user.user_metadata?.user_name ||
                user.email?.split('@')[0] ||
                user.id.slice(0, 8)
            ).replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() + Math.floor(Math.random() * 100);

            await supabase.from('users').upsert({
                id: user.id,
                email: user.email ?? '',
                username,
                display_name: displayName,
                avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                league: 'Newbie',
                joined_at: new Date().toISOString(),
            }, { onConflict: 'id', ignoreDuplicates: true });

            // Redirect to dashboard (or wherever next points)
            return NextResponse.redirect(new URL(next, requestUrl.origin));
        }
    }

    // Something went wrong — send back to auth with error
    return NextResponse.redirect(new URL('/auth?error=oauth_failed', requestUrl.origin));
}
