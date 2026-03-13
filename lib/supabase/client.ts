import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
    return createBrowserClient<Database>(
        'https://mwqncgfujyddexudjlcw.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaG1neW13ZGFodXllbWlvc3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTQ1MzksImV4cCI6MjA4ODk3MDUzOX0.1vV9H_b_mGQZYOm59PKyrt0UvfbNVMV64T_SlAnqRJI'
    )
}
