import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

// Service role client — bypasses RLS, use only on backend
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
