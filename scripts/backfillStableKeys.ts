import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function makeStableKey(prefix: string, title: string): string {
  // Simple slugify: lowercase, replace spaces/special chars with underscores
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${prefix}_${slug}`.toUpperCase();
}

async function run() {
  console.log('Starting backfill of stable keys...\n');

  // 1) Backfill modules
  console.log('Processing modules...');
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('id, title, stable_key');

  if (modulesError) {
    console.error('Error fetching modules:', modulesError);
    process.exit(1);
  }

  for (const m of modules ?? []) {
    if (!m.stable_key) {
      const stable_key = makeStableKey('MOD', m.title);
      console.log(`  Setting module "${m.title}" -> ${stable_key}`);
      const { error } = await supabase
        .from('modules')
        .update({ stable_key })
        .eq('id', m.id);
      if (error) console.error(`    Error: ${error.message}`);
    }
  }

  // 2) Backfill lessons
  console.log('\nProcessing lessons...');
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, title, stable_key');

  if (lessonsError) {
    console.error('Error fetching lessons:', lessonsError);
    process.exit(1);
  }

  for (const l of lessons ?? []) {
    if (!l.stable_key) {
      const stable_key = makeStableKey('LES', l.title);
      console.log(`  Setting lesson "${l.title}" -> ${stable_key}`);
      const { error } = await supabase
        .from('lessons')
        .update({ stable_key })
        .eq('id', l.id);
      if (error) console.error(`    Error: ${error.message}`);
    }
  }

  // 3) Backfill topics
  console.log('\nProcessing topics...');
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id, title, stable_key');

  if (topicsError) {
    console.error('Error fetching topics:', topicsError);
    process.exit(1);
  }

  for (const t of topics ?? []) {
    if (!t.stable_key) {
      const stable_key = makeStableKey('TOP', t.title);
      console.log(`  Setting topic "${t.title}" -> ${stable_key}`);
      const { error } = await supabase
        .from('topics')
        .update({ stable_key })
        .eq('id', t.id);
      if (error) console.error(`    Error: ${error.message}`);
    }
  }

  console.log('\n✅ Stable keys backfill completed successfully!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});













