import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔐 AUTH - Getting initial session...')
        console.log('🔐 AUTH - Supabase URL:', supabaseUrl)
        console.log('🔐 AUTH - Supabase Key exists:', !!supabaseAnonKey)
        
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('🔐 AUTH - Error getting session:', error)
        } else {
          console.log('🔐 AUTH - Initial session:', session ? 'Found' : 'None')
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('🔐 AUTH - Error in getInitialSession:', error)
      } finally {
        console.log('🔐 AUTH - Setting loading to false')
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AUTH - State changed:', event, session?.user?.email)
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('🔐 AUTH - User signed in, persisting session')
            break
          case 'SIGNED_OUT':
            console.log('🔐 AUTH - User signed out, clearing session')
            break
          case 'TOKEN_REFRESHED':
            console.log('🔐 AUTH - Token refreshed, updating session')
            break
          case 'USER_UPDATED':
            console.log('🔐 AUTH - User updated')
            break
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined // Disable email confirmation
        }
      })
      
      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}