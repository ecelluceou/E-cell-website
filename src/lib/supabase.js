import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const supabaseUrl = String(rawUrl).trim().replace(/[\r\n]/g, '');
const supabaseAnonKey = String(rawKey).trim().replace(/[\r\n]/g, '');

// Provide a dummy client if variables are missing to prevent crashing the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

