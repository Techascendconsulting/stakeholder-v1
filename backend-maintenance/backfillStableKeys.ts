import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function makeStableKey(prefix: string, title: string) {
  const slug = slugify(title, { lower: true, strict: true });
  return `${prefix}_${slug}`.toUpperCase();
}

async function run() {
  console.log("Assigning stable keys…");

  const tables = [
    { table: 'modules', prefix: 'MOD' },
    { table: 'lessons', prefix: 'LES' },
    { table: 'topics', prefix: 'TOP' }
  ];

  for (const { table, prefix } of tables) {
    const { data, error } = await supabase.from(table).select('id, title, stable_key');
    if (error) throw error;

    for (const row of data ?? []) {
      if (!row.stable_key) {
        const stable_key = makeStableKey(prefix, row.title);
        await supabase.from(table).update({ stable_key }).eq('id', row.id);
        console.log(`✅ ${table} → ${row.title} assigned → ${stable_key}`);
      }
    }
  }

  console.log("Done.");
}

run().catch(console.error);

















