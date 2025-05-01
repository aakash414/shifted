// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

declare global {
  // Allow global var reuse for hot reload in dev
  // eslint-disable-next-line no-var
  var supabase: ReturnType<typeof createClient> | undefined;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

export const supabase =
  globalThis.supabase || createClient(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== 'production') globalThis.supabase = supabase;

export type School = {
  district: string;
  school: string;
  post: string;
};

/**
 * Utility to fetch schools filtered by districts and post.
 * Usable in API routes or server actions (server-side only).
 */
export async function getFilteredSchools(
  districts: string[],
  post: string
): Promise<School[]> {
  let query = supabase
    .from('schools')
    .select('*')
    .in('district', districts)
    .eq('post', post);

  const { data, error } = await query;
  if (error) throw error;
  return data as School[];
}
