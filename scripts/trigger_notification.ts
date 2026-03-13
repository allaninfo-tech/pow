import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Requires service role to bypass RLS for triggering
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTrigger() {
  const args = process.argv.slice(2);
  const userId = args[0]; // pass user ID as first arg

  if (!userId) {
    console.error('Please provide a user ID as the first argument.');
    process.exit(1);
  }

  console.log(`Sending test notification to user: ${userId}`);

  const { data, error } = await supabase.from('notifications').insert({
    user_id: userId,
    type: 'system',
    title: '🚀 Notification System Online',
    message: 'Your in-app notification bell is working perfectly. Realtime updates are active.',
    link: '/dashboard'
  });

  if (error) {
    console.error('Error sending notification:', error);
  } else {
    console.log('Successfully sent test notification.');
  }
}

testTrigger();
