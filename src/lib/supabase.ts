import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
const isValidUrl = (url: string): boolean => {
  if (!url || url === 'your_supabase_url_here' || url.trim() === '') {
    return false
  }
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const isValidKey = (key: string): boolean => {
  return !(!key || key === 'your_supabase_anon_key_here' || key.trim() === '')
}

// Create a fallback client if environment variables are missing or invalid
const createSupabaseClient = () => {
  if (!isValidUrl(supabaseUrl) || !isValidKey(supabaseAnonKey)) {
    console.warn('Missing or invalid Supabase environment variables. Using fallback configuration.')
    console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
    
    // Return a mock client that won't break the app
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ error: new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.') }),
        signUp: () => Promise.resolve({ error: new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.') }),
        signOut: () => Promise.resolve({ error: null })
      }
    } as any
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()