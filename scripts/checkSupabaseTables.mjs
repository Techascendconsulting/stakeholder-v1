import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ckppwcsnkbrgekxtwccq.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrcHB3Y3Nua2JyZ2VreHR3Y2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODU0NDgsImV4cCI6MjA2NzY2MTQ0OH0.ki1ybDPuBnwBLvvdiuRPLT42nqAtGMuZSGQvpFf5Ctg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const requiredTables = ['user_progress', 'user_projects', 'user_meetings', 'user_deliverables']

async function checkTables() {
  console.log('Checking Supabase tables using:', supabaseUrl)
  const results = []
  for (const table of requiredTables) {
    try {
      const { error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`[MISSING] ${table} -> ${error.message}`)
        results.push({ table, exists: false, error: error.message })
      } else {
        console.log(`[OK] ${table} exists${typeof count === 'number' ? ` (rows: ${count})` : ''}`)
        results.push({ table, exists: true, count })
      }
    } catch (err) {
      console.log(`[ERROR] ${table} -> ${(err && err.message) || String(err)}`)
      results.push({ table, exists: false, error: (err && err.message) || String(err) })
    }
  }

  const missing = results.filter(r => !r.exists)
  if (missing.length) {
    console.log(`\nMissing tables: ${missing.map(m => m.table).join(', ')}`)
    process.exitCode = 1
  } else {
    console.log('\nAll required tables are present.')
  }
}

checkTables()


