/**
 * Supabase Server Client
 * 
 * SECURITY: This file is for SERVER-SIDE operations only
 * Uses the service role key which bypasses Row Level Security (RLS)
 * 
 * ⚠️ WARNING: Never import this file in client-side components!
 * ⚠️ Only use in:
 *    - Supabase Edge Functions
 *    - Server-side API routes (if you add a backend)
 *    - Admin-only operations that require elevated permissions
 * 
 * For client-side operations, always use src/lib/supabase.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ckppwcsnkbrgekxtwccq.supabase.co';

// SECURITY: Service role key should NEVER be in VITE_ variables
// It should only be used in Edge Functions or secure backend
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.warn(
    '⚠️ SUPABASE_SERVICE_ROLE_KEY not found. ' +
    'This is expected for client-side code. ' +
    'Only set this in Edge Functions or secure backend.'
  );
}

/**
 * Server client with elevated permissions
 * Bypasses RLS - use with extreme caution
 * 
 * TODO: Move all admin operations to Supabase Edge Functions
 * TODO: Remove client-side usage of this file
 */
export const supabaseServer = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Prevent accidental client-side usage
if (typeof window !== 'undefined' && supabaseServer) {
  console.error(
    '🚨 SECURITY WARNING: supabaseServer is being used in the browser! ' +
    'This exposes the service role key. Move this logic to Edge Functions immediately!'
  );
}

/**
 * Example secure usage (move to Edge Function):
 * 
 * // In supabase/functions/admin-operation/index.ts
 * import { createClient } from '@supabase/supabase-js'
 * 
 * const supabaseAdmin = createClient(
 *   Deno.env.get('SUPABASE_URL')!,
 *   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
 * )
 * 
 * // Now you can bypass RLS safely on the server
 * const { data } = await supabaseAdmin.from('user_profiles').select('*')
 */
















