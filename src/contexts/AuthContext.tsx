import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { deviceLockService, DeviceLockResult } from '../services/deviceLockService'
import { userActivityService } from '../services/userActivityService'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  showDeviceRegistration: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null; deviceLockResult?: DeviceLockResult }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  completeDeviceRegistration: () => void
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
  const [showDeviceRegistration, setShowDeviceRegistration] = useState(false)
  const deviceRegistrationCompleted = useRef<boolean>(false)

  // Shared admin check used in multiple places
  const checkIfAdmin = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('is_admin, is_super_admin, is_senior_admin')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('🔐 AUTH - Error checking admin status:', error);
        return false;
      }

      const isAdmin = !!(profile?.is_admin || profile?.is_super_admin || profile?.is_senior_admin);
      return isAdmin;
    } catch (error) {
      console.error('🔐 AUTH - Error checking admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    // Safety timeout: Force loading to false after 5 seconds to prevent blank screen
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('🔐 AUTH - Loading timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 5000);

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔐 AUTH - Getting initial session...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('🔐 AUTH - Error getting session:', error)
          // Even on error, set loading to false so app can render
          setLoading(false)
          return
        } else {
          console.log('🔐 AUTH - Initial session:', session ? 'Found' : 'None')
          
          // If user is logged in, restore session WITHOUT device lock check
          // SECURITY APPROACH:
          // - Session restoration: Trust existing sessions (less aggressive)
          // - New logins: Full device lock check (maintains 1-device security)
          // - Continuous monitoring: Real-time device switching detection
          if (session?.user) {
            console.log('🔐 AUTH - Restoring existing session (no device lock check on restoration)')
            setSession(session)
            setUser(session.user)
            
            // Log successful session restoration
            try {
              await userActivityService.logActivity(
                session.user.id,
                'session_restored',
                'Session restored on page refresh',
                true
              )
            } catch (logError) {
              console.log('Failed to log session restoration:', logError)
            }
          } else {
            setSession(session)
            setUser(session?.user ?? null)
          }
        }
      } catch (error) {
        console.error('🔐 AUTH - Error in getInitialSession:', error)
        // Even on error, set loading to false so app can render
        setLoading(false)
      } finally {
        console.log('🔐 AUTH - Setting loading to false')
        clearTimeout(loadingTimeout)
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

    return () => {
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  // Enforce device lock on focus/visibility change without constant polling
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const checkLocked = async () => {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('locked, is_admin, is_super_admin, is_senior_admin')
          .eq('user_id', user.id)
          .single();
        const isAdmin = !!(data?.is_admin || data?.is_super_admin || data?.is_senior_admin);
        if (!cancelled && data?.locked && !isAdmin) {
          try {
            localStorage.setItem('deviceLockError', JSON.stringify({ locked: true, message: 'Your account has been LOCKED due to login from a different device. Please contact support to unlock your account.' }));
          } catch {}
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
        }
      } catch (_) {
        // ignore
      }
    };

    // Check immediately and whenever the tab gains focus or visibility changes
    checkLocked();
    const onFocusOrVis = () => { checkLocked(); };
    window.addEventListener('focus', onFocusOrVis);
    document.addEventListener('visibilitychange', onFocusOrVis);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocusOrVis);
      document.removeEventListener('visibilitychange', onFocusOrVis);
    };
  }, [user?.id])

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

      // If login successful, check if user is blocked FIRST
      if (data.user) {
        console.debug('🔐 [auth] signIn -> begin checks', { userId: data.user.id, email })
        
        // Check if user is blocked
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('blocked, block_reason, registered_device, locked, is_admin, is_super_admin, is_senior_admin')
          .eq('user_id', data.user.id)
          .single();
        
        // If user is blocked, immediately sign out and show error
        if (userProfile?.blocked) {
          console.log('🚫 AUTH - User is blocked, preventing access')
          
          // Sign out immediately
          await supabase.auth.signOut()
          
          // Store blocked status for UI to display
          localStorage.setItem('accountBlocked', JSON.stringify({
            blocked: true,
            reason: userProfile.block_reason || 'Your account has been blocked.',
            email: email
          }))
          
          // Log blocked access attempt
          await userActivityService.logActivity(
            data.user.id,
            'blocked_access_attempt',
            {
              email,
              deviceId: await deviceLockService.getDeviceId(),
              blockReason: userProfile.block_reason,
              success: false
            }
          )
          
          return {
            error: new Error(`Account blocked. ${userProfile.block_reason || 'Contact support@baworkxp.com for assistance.'}`)
          }
        }
        
        // If user account is LOCKED (device lock), block login and require admin unlock
        if (userProfile?.locked && !userProfile?.is_admin && !userProfile?.is_super_admin && !userProfile?.is_senior_admin) {
          console.log('🔐 AUTH - User account is LOCKED (device lock), preventing access')
          
          // Sign out immediately
          await supabase.auth.signOut()
          
          // Log locked account access attempt
          await userActivityService.logActivity(
            data.user.id,
            'locked_account_access_attempt',
            {
              email,
              deviceId: await deviceLockService.getDeviceId(),
              reason: 'Account locked due to multiple device usage',
              success: false
            }
          )
          
          return {
            error: new Error('Your account has been LOCKED due to login from multiple devices. Please contact support to unlock your account and register a single device.')
          }
        }
        
        console.debug('🔐 [auth] not blocked/locked -> proceeding to device lock check')
        
        const isAdminUser = userProfile?.is_admin || userProfile?.is_super_admin || userProfile?.is_senior_admin;
        const isDeviceResetScenario = !userProfile?.registered_device && userProfile?.locked && !isAdminUser;
        
        if (isDeviceResetScenario) {
          console.log('🔐 AUTH - Device reset scenario detected for student, auto-unlocking account');
          
          // Step 3: Auto-unlock account (System Action)
          const { error: unlockError } = await supabase
            .from('user_profiles')
            .update({ locked: false })
            .eq('user_id', data.user.id);
          
          if (unlockError) {
            console.error('🔐 AUTH - Failed to auto-unlock account:', unlockError);
          } else {
            console.log('🔐 AUTH - Account auto-unlocked successfully');
            
            // Log the auto-unlock action
            await userActivityService.logActivity(
              data.user.id,
              'auto_unlock_after_device_reset',
              {
                deviceId: await deviceLockService.getDeviceId(),
                sessionId: data.session?.access_token,
                success: true,
                metadata: { auto_unlock: true, device_reset_flow: true }
              }
            );
          }
        } else if (isAdminUser) {
          console.log('🔐 AUTH - Admin user detected, skipping device reset auto-unlock');
        }
        
        // LOGIN-TIME DEVICE CHECK: Prevents multiple device logins
        // If user tries to login from different device than registered, account is LOCKED immediately
        // This blocks the new login attempt AND prevents any existing sessions from continuing
        const deviceLockResult = await deviceLockService.checkDeviceLock(data.user.id)
        
        console.debug('🔐 [auth] device lock result', deviceLockResult)
        
        if (!deviceLockResult.success) {
          // Device mismatch detected at login - account locked immediately
          // This blocks this login attempt AND any existing sessions on other devices
          console.warn('🔐 [auth] device mismatch -> account LOCKED, aborting login')
          
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
        
        console.debug('🔐 [auth] device lock successful -> continue sign-in')
        
        // Log successful sign-in
        const deviceId = await deviceLockService.getDeviceId()
        await userActivityService.logSignIn(data.user.id, deviceId || undefined, data.session?.access_token)
        
        // Check if device registration is needed (after device reset scenario)
        // BUT ONLY for non-admin users
        const { data: finalUserProfile } = await supabase
          .from('user_profiles')
          .select('registered_device, is_admin, is_super_admin, is_senior_admin')
          .eq('user_id', data.user.id)
          .single();
        
        const isAdminForRegistration = finalUserProfile?.is_admin || finalUserProfile?.is_super_admin || finalUserProfile?.is_senior_admin;
        
        if (!finalUserProfile?.registered_device && !isAdminForRegistration) {
          console.log('🔐 AUTH - No device registered for student user, auto-registering current device');
          const autoDeviceId = await deviceLockService.getDeviceId();
          if (autoDeviceId) {
            await supabase
              .from('user_profiles')
              .update({ registered_device: autoDeviceId })
              .eq('user_id', data.user.id);
          }
          deviceRegistrationCompleted.current = true;
        } else if (isAdminForRegistration) {
          console.log('🔐 AUTH - Admin user detected, skipping device registration prompt');
          // Admin users can start monitoring immediately (but won't due to admin check)
          deviceRegistrationCompleted.current = true;
        } else {
          // User has registered device, can start monitoring
          deviceRegistrationCompleted.current = true;
        }
        
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

  const completeDeviceRegistration = () => {
    setShowDeviceRegistration(false)
    deviceRegistrationCompleted.current = true
    console.log('🔐 AUTH - Device registration completed')
  }

  // REMOVED: Continuous device monitoring
  // Device lock is now enforced ONLY at login time via checkDeviceLock()
  // This is more efficient and prevents the issue at the source rather than detecting it later
  // When user tries to login from different device, account is locked immediately

  const value = {
    user,
    session,
    loading,
    showDeviceRegistration,
    signIn,
    signUp,
    signOut,
    completeDeviceRegistration
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* DeviceRegistrationPrompt removed: devices are auto-registered silently */}
    </AuthContext.Provider>
  )
}