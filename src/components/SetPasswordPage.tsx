import React, { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const SetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  // Extract token from URL hash or query params and set session
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Check URL hash (Supabase redirects with tokens in hash after verification)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        // Check for error parameters first (expired token, etc.)
        const error = hashParams.get('error')
        const errorCode = hashParams.get('error_code')
        const errorDescription = hashParams.get('error_description')
        
        if (error || errorCode) {
          // Clear the error from URL
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
          
          setIsValidToken(false)
          
          // Handle specific error cases
          if (errorCode === 'otp_expired' || error === 'access_denied') {
            setError('This password reset link has expired. Please request a new password reset link from the login page.')
          } else {
            const decodedDescription = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : 'Unknown error'
            setError(`Password reset link error: ${decodedDescription}. Please request a new password reset link.`)
          }
          return
        }
        
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        // If we have tokens in hash from Supabase redirect, set the session
        if (accessToken && type === 'recovery') {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })

          if (sessionError) {
            console.error('Error setting session:', sessionError)
            setIsValidToken(false)
            setError('Failed to activate password reset session. Please try again.')
          } else {
            // Clear the hash after setting session
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
            setIsValidToken(true)
          }
          return
        }

        // Also check query params (for direct token links)
        const queryParams = new URLSearchParams(window.location.search)
        const token = queryParams.get('token')
        const recoveryType = queryParams.get('type')

        if (token && recoveryType === 'recovery') {
          // Try to use token to set session
          try {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: ''
            })
            if (!sessionError) {
              setIsValidToken(true)
              return
            }
          } catch (e) {
            // Token might need verification first
            console.log('Token may need verification through Supabase endpoint')
          }
        }

        // Check if user is already authenticated via session
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setIsValidToken(true)
        } else {
          setIsValidToken(false)
          setError('Invalid or missing password reset token. Please request a new password reset link.')
        }
      } catch (err) {
        console.error('Error checking token:', err)
        setIsValidToken(false)
        setError('Failed to verify reset token. Please try again.')
      }
    }

    checkToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!password) {
      setError('Please enter a new password')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Session should already be set from useEffect if tokens were in hash
      // Verify we have a valid session before updating password
      const { data: { session }, error: sessionCheckError } = await supabase.auth.getSession()
      
      if (sessionCheckError || !session) {
        // Try to extract tokens one more time as fallback
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
          if (sessionError) {
            throw new Error('Failed to activate password reset session. Please use a fresh reset link.')
          }
        } else {
          throw new Error('No active session. Please use a valid password reset link.')
        }
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        throw updateError
      }

      setSuccess(true)
      setTimeout(() => {
        // Redirect to login (show login form on landing page)
        localStorage.setItem('showLoginForm', 'true')
        localStorage.setItem('passwordSet', 'true')
        window.location.href = '/'
      }, 2000)

    } catch (err: any) {
      console.error('Error setting password:', err)
      setError(err.message || 'Failed to set password. Please try again or request a new reset link.')
    } finally {
      setLoading(false)
    }
  }

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600/95 via-indigo-600/95 to-purple-800/95 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Verifying reset token...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isValidToken === false && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600/95 via-indigo-600/95 to-purple-800/95 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Invalid Token</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This password reset link is invalid or has expired. Please request a new password reset.
            </p>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                localStorage.setItem('showLoginForm', 'true')
                window.location.href = '/'
              }}
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Show error state with helpful message
  if (isValidToken === false && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600/95 via-indigo-600/95 to-purple-800/95 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Link Expired</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  localStorage.setItem('showLoginForm', 'true')
                  window.location.href = '/'
                }}
                className="inline-block w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Go to Login
              </a>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                On the login page, click "Forgot Password" to request a new reset link.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600/95 via-indigo-600/95 to-purple-800/95 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Password Set Successfully</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your password has been set. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600/95 via-indigo-600/95 to-purple-800/95 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
            <Lock className="h-8 w-8 text-purple-600 dark:text-purple-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Set Your Password</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please enter a new password for your account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter new password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Confirm new password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}

export default SetPasswordPage

