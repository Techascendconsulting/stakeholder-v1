import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { subscriptionService } from '../lib/subscription'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.warn('Session error, clearing auth state:', error.message)
        // Clear any stale tokens on auth errors
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setLoading(false)
        return
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.warn('Auth state change error:', error)
        // Clear auth state on any error
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Handle auth errors gracefully
  const handleAuthError = async (error: any) => {
    console.warn('Authentication error:', error.message)
    if (error.message?.includes('refresh_token') || 
        error.message?.includes('Invalid Refresh Token') ||
        error.message?.includes('Refresh Token Not Found')) {
      // Clear stale auth state
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        await handleAuthError(error)
      }
      return { error }
    } catch (error) {
      await handleAuthError(error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        await handleAuthError(error)
        return { error }
      }
      
      // If signup successful, try to create student record
      if (data.user) {
        try {
          await subscriptionService.createStudentRecord(
            data.user.id,
            email.split('@')[0],
            email
          )
        } catch (studentError) {
          console.warn('Could not create student record (database schema issue):', studentError)
          // Don't fail signup if student record creation fails
        }
      }
      
      return { error }
    } catch (error) {
      await handleAuthError(error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.warn('Sign out error:', error)
      // Force clear local state even if signOut fails
      setUser(null)
      setSession(null)
    }
  }
        if (error) {
          console.error('Auth state change error:', error)
          // Clear any stale tokens on error
          if (error.message?.includes('refresh_token_not_found') || 
              error.message?.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut()
            setUser(null)
            return
          }
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    // If signup successful, create student record immediately
    if (!error && data.user) {
      try {
        await subscriptionService.createStudentRecord(
          data.user.id,
          email.split('@')[0],
          email
        )
      } catch (studentError) {
        console.error('Error creating student record:', studentError)
      }
    }
    
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}