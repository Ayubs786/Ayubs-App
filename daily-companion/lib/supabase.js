import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key (bypasses RLS).
// This is safe because it only runs in API routes, never sent to the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
