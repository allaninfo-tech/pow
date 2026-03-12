require('dotenv').config({ path: 'c:/Users/allan/proofstack/proofstack/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const migrations = [
    { 
        name: 'Add users.status',
        sql: "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'"
    },
    { 
        name: 'Add users.notification_prefs',
        sql: "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT NULL"
    },
    { 
        name: 'Create admin_activity_log',
        sql: `CREATE TABLE IF NOT EXISTS public.admin_activity_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), admin_id TEXT NOT NULL, action TEXT NOT NULL, target_type TEXT, target_id TEXT, metadata JSONB, created_at TIMESTAMPTZ DEFAULT now())`
    },
    { 
        name: 'Create platform_announcements',
        sql: `CREATE TABLE IF NOT EXISTS public.platform_announcements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, body TEXT NOT NULL, created_by TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now())`
    }
];

async function run() {
    console.log('Supabase URL:', url);
    for (const m of migrations) {
        const r = await fetch(url + '/rest/v1/rpc/exec_sql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: key, Authorization: 'Bearer ' + key },
            body: JSON.stringify({ sql: m.sql })
        });
        const body = await r.text();
        console.log(m.name, '->', r.status === 200 || r.status === 204 ? '✓ OK' : '✗ ' + body.slice(0, 120));
    }

    // Verify all 3 new tables/columns exist by querying them
    const checks = [
        supabase.from('admin_activity_log').select('id').limit(1),
        supabase.from('platform_announcements').select('id').limit(1),
        supabase.from('users').select('status, notification_prefs').limit(1),
    ];
    const results = await Promise.all(checks);
    const names = ['admin_activity_log', 'platform_announcements', 'users.status+notification_prefs'];
    results.forEach((r, i) => {
        if (r.error) {
            console.log(names[i], '→ MISSING:', r.error.message);
        } else {
            console.log(names[i], '→ ✓ EXISTS');
        }
    });
}

run().catch(console.error);
