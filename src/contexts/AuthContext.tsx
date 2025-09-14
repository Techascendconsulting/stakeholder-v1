import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { deviceLockService, DeviceLockResult } from '../services/deviceLockService'
import { userActivityService } from '../services/userActivityService'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null; deviceLockResult?: DeviceLockResult }>
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
  const deviceCheckInterval = useRef<NodeJS.Timeout | null>(null)
  const lastDeviceId = useRef<string | null>(null)
  const deviceLockFailed = useRef<boolean>(false)
  const activityLogInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔐 AUTH - Getting initial session...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('🔐 AUTH - Error getting session:', error)
        } else {
          console.log('🔐 AUTH - Initial session:', session ? 'Found' : 'None')
          
          // If user is logged in, check device lock
          if (session?.user) {
            console.log('🔐 AUTH - Checking device lock for existing session')
            const deviceLockResult = await deviceLockService.checkDeviceLock(session.user.id)
            
            if (!deviceLockResult.success) {
              console.log('🔐 AUTH - Device lock failed for existing session, signing out')
              // Sign out but don't wait for it to complete
              supabase.auth.signOut()
              setSession(null)
              setUser(null)
              
              // Store device lock error for display on login page
              localStorage.setItem('deviceLockError', JSON.stringify(deviceLockResult))
            } else {
              console.log('🔐 AUTH - Device lock successful for existing session')
              setSession(session)
              setUser(session.user)
            }
          } else {
            setSession(session)
            setUser(session?.user ?? null)
          }
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
        console.error('🔐 AUTH - Sign in failed:', error.message)
        
        // Log failed sign-in attempt
        try {
          // Try to find the user ID first
          const { data: userData } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', email)
            .single();
          
          if (userData?.id) {
            const deviceId = await deviceLockService.getDeviceId()
            await userActivityService.logSignInFailure(
              userData.id,
              error.message,
              deviceId || undefined
            );
          } else {
            // Log with email as identifier if user not found
            await userActivityService.logActivity(
              'unknown-user',
              'sign_in_failed',
              {
                deviceId: await deviceLockService.getDeviceId(),
                email: email,
                failureReason: error.message,
                success: false
              }
            );
          }
        } catch (logError) {
          console.error('🔐 AUTH - Failed to log sign-in failure:', logError);
        }
        
        return { error }
      }

      // If login successful, check device lock
      if (data.user) {
        console.log('🔐 AUTH - Checking device lock for user:', data.user.id)
        const deviceLockResult = await deviceLockService.checkDeviceLock(data.user.id)
        
        console.log('🔐 AUTH - Device lock result:', deviceLockResult)
        
        if (!deviceLockResult.success) {
          // Device lock failed, sign out the user but don't wait for it
          console.log('🔐 AUTH - Device lock failed, signing out user')
          
          // Set flag to prevent continuous monitoring
          deviceLockFailed.current = true
          
          // Log device lock failure
          const deviceId = await deviceLockService.getDeviceId()
          await userActivityService.logDeviceLockFailure(
            data.user.id, 
            deviceId || 'unknown', 
            deviceLockResult.message
          )
          
          // Store device lock error for AppContext to detect
          localStorage.setItem('deviceLockError', JSON.stringify(deviceLockResult))
          
          supabase.auth.signOut() // Don't await this to avoid blocking
          
          // Clear the session locally to prevent redirect
          setSession(null)
          setUser(null)
          
          return { 
            error: new Error(deviceLockResult.message),
            deviceLockResult 
          }
        }
        
        console.log('🔐 AUTH - Device lock successful')
        // Reset device lock failed flag on successful login
        deviceLockFailed.current = false
        
        // Log successful sign-in
        const deviceId = await deviceLockService.getDeviceId()
        await userActivityService.logSignIn(data.user.id, deviceId || undefined, data.session?.access_token)
        
        return { error: null, deviceLockResult }
      }

      return { error: null }
    } catch (error) {
      // Log unexpected errors during sign-in
      try {
        await userActivityService.logActivity(
          'unknown-user',
          'sign_in_error',
          {
            deviceId: await deviceLockService.getDeviceId(),
            email: email,
            failureReason: (error as Error).message,
            success: false
          }
        );
      } catch (logError) {
        console.error('🔐 AUTH - Failed to log sign-in error:', logError);
      }
      
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
      console.log('🔐 AUTH - Attempting signout...')
      
      // Log sign-out before actually signing out
      if (user) {
        await userActivityService.logSignOut(user.id, session?.access_token)
      }
      
      await supabase.auth.signOut()
      console.log('🔐 AUTH - Signout successful')
    } catch (error) {
      console.error('🔐 AUTH - Signout failed, clearing session locally:', error)
      // If signout fails, clear the session locally
      setSession(null)
      setUser(null)
    }
  }

  // Continuous device lock monitoring
  useEffect(() => {
    if (!user) {
      // Clear intervals if no user
      if (deviceCheckInterval.current) {
        console.log('🔐 AUTH - Clearing device monitoring interval (no user)')
        clearInterval(deviceCheckInterval.current)
        deviceCheckInterval.current = null
      }
      if (activityLogInterval.current) {
        console.log('🔐 AUTH - Clearing activity tracking interval (no user)')
        clearInterval(activityLogInterval.current)
        activityLogInterval.current = null
      }
      // Reset device lock failed flag when user is logged out
      deviceLockFailed.current = false
      return
    }

    // Don't start monitoring if device lock just failed
    if (deviceLockFailed.current) {
      console.log('🔐 AUTH - Skipping device monitoring (device lock just failed)')
      return
    }

    // Check if user is admin - admins should NOT be monitored for device lock
    const checkIfAdmin = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('is_admin, is_super_admin, is_senior_admin')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('🔐 AUTH - Error checking admin status:', error);
          return false;
        }

        const isAdmin = profile?.is_admin || profile?.is_super_admin || profile?.is_senior_admin;
        if (isAdmin) {
          console.log('🔐 AUTH - Admin user detected, skipping device lock monitoring entirely');
          return true;
        }
        return false;
      } catch (error) {
        console.error('🔐 AUTH - Error checking admin status:', error);
        return false;
      }
    };

    // Check admin status first
    checkIfAdmin().then((isAdmin) => {
      if (isAdmin) {
        // Admin users only get activity tracking, NO device lock monitoring
        console.log('🔐 AUTH - Starting activity tracking for admin user (no device monitoring)');
        startActivityTracking();
        return;
      }
      
      // Non-admin users get both device monitoring and activity tracking
      console.log('🔐 AUTH - Starting device monitoring and activity tracking for student user');
      startDeviceMonitoring();
      startActivityTracking();
    });

    // Start continuous device lock monitoring
    const startDeviceMonitoring = async () => {
      // Get initial device ID
      const initialDeviceId = await deviceLockService.getDeviceId()
      lastDeviceId.current = initialDeviceId
      
      console.log('🔐 AUTH - Starting continuous device lock monitoring, initial device ID:', initialDeviceId)
      
      // Check every 5 seconds
      deviceCheckInterval.current = setInterval(async () => {
        try {
          const currentDeviceId = await deviceLockService.getDeviceId()
          
          // Check if device ID has changed (different browser/incognito)
          if (currentDeviceId && lastDeviceId.current && currentDeviceId !== lastDeviceId.current) {
            console.log('🔐 AUTH - Device ID changed! Locking account immediately')
            console.log('🔐 AUTH - Previous device:', lastDeviceId.current)
            console.log('🔐 AUTH - Current device:', currentDeviceId)
            
            // Log device switching attempt
            await userActivityService.logDeviceLockFailure(
              user.id,
              currentDeviceId,
              'Device switching detected during session'
            )
            
            // Lock the account immediately
            await deviceLockService.lockAccount(user.id)
            
            // Sign out the user
            await signOut()
            
            // Show alert
            alert('Your account has been locked due to device switching. Please contact support.')
            
            return
          }
          
          // Update last known device ID
          lastDeviceId.current = currentDeviceId
          
        } catch (error) {
          console.error('🔐 AUTH - Device monitoring error:', error)
        }
      }, 5000) // Check every 5 seconds
    }

    // Start last active tracking
    const startActivityTracking = () => {
      console.log('🔐 AUTH - Starting last active tracking')
      
      // Log last active every 30 seconds
      activityLogInterval.current = setInterval(async () => {
        try {
          await userActivityService.logLastActive(user.id, session?.access_token)
        } catch (error) {
          console.error('🔐 AUTH - Activity tracking error:', error)
        }
      }, 30000) // Log every 30 seconds
    }

    // Cleanup on unmount or user change
    return () => {
      if (deviceCheckInterval.current) {
        clearInterval(deviceCheckInterval.current)
        deviceCheckInterval.current = null
      }
      if (activityLogInterval.current) {
        clearInterval(activityLogInterval.current)
        activityLogInterval.current = null
      }
    }
  }, [user])

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