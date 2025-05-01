// Usage: pnpm tsx scripts/clean_supabase_posts.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const HSST_POST_OPTIONS = [
  "HSST Jr Arabic",
  "HSST Jr Botany",
  "HSST Botany",
  "HSST Chemistry",
  "HSST Jr Commerce",
  "HSST Commerce",
  "HSST Communicative English",
  "HSST Jr Computer Science",
  "HSST Computer Science",
  "HSST Jr Economics",
  "HSST Economics",
  "HSST Electronics",
  "HSST Jr English",
  "HSST English",
  "HSST Gandhian Studies",
  "HSST Jr Geography",
  "HSST Geography",
  "HSST Geology",
  "HSST Jr German",
  "HSST Jr Hindi",
  "HSST Hindi",
  "HSST Jr History",
  "HSST History",
  "HSST Home Science",
  "HSST Journalism",
  "HSST Jr Malayalam",
  "HSST Malayalam",
  "HSST Jr Mathematics",
  "HSST Mathematics",
  "HSST Jr Physics",
  "HSST Physics",
  "HSST Jr Political Science",
  "HSST Political Science",
  "HSST Psychology",
  "HSST Jr Russian",
  "HSST Jr Sanskrit",
  "HSST Social Work",
  "HSST Sociology",
  "HSST Jr Statistics",
  "HSST Statistics",
  "HSST Jr Tamil",
  "HSST Jr Zoology",
  "HSST Zoology"
];

async function cleanPosts() {
  // Fetch all schools
  const { data: schools, error } = await supabase
    .from('schools')
    .select('id, post');
  if (error) throw error;

  // Prepare updates: set post to the first valid match from HSST_POST_OPTIONS
  const updates = (schools || [])
    .map(s => {
      const match = HSST_POST_OPTIONS.find(opt =>
        typeof s.post === 'string' && s.post.includes(opt)
      );
      if (match) {
        return { id: s.id, post: match };
      }
      return null;
    })
    .filter(Boolean);

  // Batch update (in chunks for large tables)
  const chunkSize = 100;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const { error: updateError } = await supabase
      .from('schools')
      .upsert(chunk, { onConflict: 'id' });
    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log(`Updated ${chunk.length} rows`);
    }
  }
  console.log('Done cleaning posts.');
}

cleanPosts().catch(e => {
  console.error(e);
  process.exit(1);
});
