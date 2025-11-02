import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { deviceLockService, DeviceLockResult } from '../services/deviceLockService'
import { userActivityService } from '../services/userActivityService'
import DeviceRegistrationPrompt from '../components/DeviceRegistrationPrompt'

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
  const deviceCheckInterval = useRef<NodeJS.Timeout | null>(null)
  const lastDeviceId = useRef<string | null>(null)
  const deviceLockFailed = useRef<boolean>(false)
  const deviceRegistrationCompleted = useRef<boolean>(false)

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
        console.log('🔐 AUTH - Checking if user is blocked:', data.user.id)
        
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
        
        console.log('🔐 AUTH - User not blocked, proceeding with device lock check');
        
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
        
        // Check if device registration is needed (after device reset scenario)
        // BUT ONLY for non-admin users
        const { data: finalUserProfile } = await supabase
          .from('user_profiles')
          .select('registered_device, is_admin, is_super_admin, is_senior_admin')
          .eq('user_id', data.user.id)
          .single();
        
        const isAdminForRegistration = finalUserProfile?.is_admin || finalUserProfile?.is_super_admin || finalUserProfile?.is_senior_admin;
        
        if (!finalUserProfile?.registered_device && !isAdminForRegistration) {
          console.log('🔐 AUTH - No device registered for student user, showing registration prompt');
          setShowDeviceRegistration(true);
          // Don't start monitoring until device registration is complete
          deviceRegistrationCompleted.current = false;
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
    
    // Now start device monitoring since registration is complete
    console.log('🔐 AUTH - Device registration completed, starting monitoring')
    
    // Check if user is admin before starting monitoring
    const startMonitoringAfterRegistration = async () => {
      const isAdmin = await checkIfAdmin();
      if (!isAdmin) {
        console.log('🔐 AUTH - Starting device monitoring after registration');
        startDeviceMonitoring();
      } else {
        console.log('🔐 AUTH - Admin user, no monitoring needed after registration');
      }
    };
    
    startMonitoringAfterRegistration();
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
      // Reset device lock failed flag when user is logged out
      deviceLockFailed.current = false
      deviceRegistrationCompleted.current = false
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

    // Check admin status first - make it synchronous to prevent race conditions
    const startMonitoringIfNotAdmin = async () => {
      const isAdmin = await checkIfAdmin();
      if (isAdmin) {
        // Admin users get NO monitoring (device lock bypassed)
        console.log('🔐 AUTH - Admin user detected, no monitoring needed');
        return;
      }
      
      // For non-admin users, only start monitoring if device registration is complete
      if (deviceRegistrationCompleted.current) {
        console.log('🔐 AUTH - Starting device monitoring for student user (device registration complete)');
        startDeviceMonitoring();
      } else {
        console.log('🔐 AUTH - Device registration pending, monitoring will start after registration');
      }
    };

    startMonitoringIfNotAdmin();

    // Start continuous device lock monitoring
    const startDeviceMonitoring = async () => {
      // Get initial device ID
      const initialDeviceId = await deviceLockService.getDeviceId()
      lastDeviceId.current = initialDeviceId
      
      console.log('🔐 AUTH - Starting continuous device lock monitoring, initial device ID:', initialDeviceId)
      
      // Check every 5 seconds
      deviceCheckInterval.current = setInterval(async () => {
        try {
          // First: Check if user has been blocked
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('blocked, block_reason, is_admin, is_super_admin, is_senior_admin')
            .eq('user_id', user.id)
            .single();
          
          // If user is blocked, immediately sign out
          if (profile?.blocked) {
            console.log('🚫 AUTH - User was blocked during session, forcing sign out');
            
            // Store blocked status for UI
            localStorage.setItem('accountBlocked', JSON.stringify({
              blocked: true,
              reason: profile.block_reason || 'Your account has been blocked.',
              email: user.email
            }));
            
            // Clear interval
            if (deviceCheckInterval.current) {
              clearInterval(deviceCheckInterval.current);
              deviceCheckInterval.current = null;
            }
            
            // Sign out
            await supabase.auth.signOut();
            alert('Your account has been blocked. Contact support@baworkxp.com if you believe this is an error.');
            return;
          }
          
          // Double-check admin status before any device lock action
          const isAdmin = profile?.is_admin || profile?.is_super_admin || profile?.is_senior_admin;
          if (isAdmin) {
            console.log('🔐 AUTH - Admin user detected during monitoring, stopping device monitoring');
            if (deviceCheckInterval.current) {
              clearInterval(deviceCheckInterval.current);
              deviceCheckInterval.current = null;
            }
            return;
          }

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

    // Note: Removed last active tracking to reduce log volume
    // Last login date is sufficient for "last active" information

    // Cleanup on unmount or user change
    return () => {
      if (deviceCheckInterval.current) {
        clearInterval(deviceCheckInterval.current)
        deviceCheckInterval.current = null
      }
    }
  }, [user])

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
      {showDeviceRegistration && user && (
        <DeviceRegistrationPrompt
          userId={user.id}
          onComplete={completeDeviceRegistration}
        />
      )}
    </AuthContext.Provider>
  )
}