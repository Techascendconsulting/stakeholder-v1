import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, GraduationCap, XCircle, Shield, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { subscriptionService } from '../lib/subscription'
import { DeviceLockResult } from '../services/deviceLockService'
import DeviceLockAlert from './DeviceLockAlert'
import { supabase } from '../lib/supabase'

interface LoginSignupProps {
  onBack?: () => void
}

const LoginSignup: React.FC<LoginSignupProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin') // Keep for now, but hide signup tab
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [deviceLockResult, setDeviceLockResult] = useState<DeviceLockResult | null>(null)
  const [blockedAccount, setBlockedAccount] = useState<{ blocked: boolean; reason: string; email: string } | null>(null)

  const { signIn, signUp } = useAuth()

  // Check for device lock error from localStorage on component mount and periodically
  useEffect(() => {
    const checkForErrors = () => {
      const storedError = localStorage.getItem('deviceLockError')
      if (storedError) {
        try {
          const deviceLockResult = JSON.parse(storedError)
          setDeviceLockResult(deviceLockResult)
          // Don't remove immediately - let user dismiss it
        } catch (error) {
          console.error('Error parsing device lock error:', error)
          localStorage.removeItem('deviceLockError')
        }
      }
      
      // Check for blocked account status
      const blockedStatus = localStorage.getItem('accountBlocked')
      if (blockedStatus) {
        try {
          const blocked = JSON.parse(blockedStatus)
          setBlockedAccount(blocked)
          // Don't remove immediately - let user dismiss it
        } catch (error) {
          console.error('Error parsing blocked account:', error)
          localStorage.removeItem('accountBlocked')
        }
      }
    }

    // Check immediately
    checkForErrors()

    // Also check periodically in case error is set after component mounts
    const interval = setInterval(checkForErrors, 500)
    
    return () => clearInterval(interval)
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Sign up specific validations
    if (activeTab === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setSuccess('')
    setDeviceLockResult(null)
    setErrors({})

    try {
      const { error, deviceLockResult } = await signIn(formData.email, formData.password)
      if (error) {
        setErrors({ general: error.message })
        // CRITICAL: Show lock modal IMMEDIATELY on first attempt
        if (deviceLockResult && deviceLockResult.locked) {
          console.log('🔐 LoginSignup: Device lock detected, showing modal immediately')
          setDeviceLockResult(deviceLockResult)
        }
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setSuccess('')

    try {
      // Create user in Supabase Auth
      const { error } = await signUp(formData.email, formData.password)
      
      if (error) {
        setErrors({ general: error.message })
        return
      }

      setSuccess('Account created successfully! Please check your email for verification.')
      setFormData({ name: '', email: '', password: '', confirmPassword: '' })
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: 'Please enter your email address first' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email)
      if (error) {
        setErrors({ general: error.message })
      } else {
        setSuccess('Password reset email sent! Check your inbox.')
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600/95 via-indigo-600/95 to-purple-800/95 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Beautiful Animated Background */}
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMCAwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
      
      {/* Blocked Account Alert */}
      {blockedAccount && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border-4 border-red-500 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
              Account Blocked
            </h2>
            
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-red-800 dark:text-red-200 text-center font-medium">
                {blockedAccount.reason}
              </p>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              If you believe this is a mistake, please contact us:
            </p>
            
            <a 
              href="mailto:support@baworkxp.com?subject=Account%20Blocked%20-%20Review%20Request"
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center px-6 py-3 rounded-lg font-semibold transition-colors mb-3"
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email support@baworkxp.com
            </a>
            
            <button
              onClick={() => setBlockedAccount(null)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        {/* Close Button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute top-4 right-4 z-30 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors hover:rotate-90 transform duration-300"
            title="Back to home"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        
        {/* Header */}
        <div className="p-8 text-center">
          {/* Clickable Logo - Returns to landing page */}
          <button
            type="button"
            onClick={onBack}
            className={`relative z-20 w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
              onBack ? 'cursor-pointer hover:scale-110 hover:shadow-xl' : 'cursor-default'
            }`}
            title={onBack ? 'Back to home' : undefined}
            disabled={!onBack}
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            BA WorkXP
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Professional Business Analysis Training
          </p>
          {onBack && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Click logo or X to return home
            </p>
          )}
        </div>

        {/* Invite-Only Notice */}
        <div className="px-8 mb-6">
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                  Invite-Only Access
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  BA WorkXP is currently invite-only for individuals and training platforms.
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                  Request access: {' '}
                  <a href="mailto:support@baworkxp.com" className="font-semibold underline hover:text-purple-900 dark:hover:text-purple-100">
                    support@baworkxp.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-8 mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mx-8 mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Forms */}
        <div className="px-8 pb-8">
          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type="email"
                    id="signin-email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.email ? 'border-red-300 bg-red-50' : ''
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signin-password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.password ? 'border-red-300 bg-red-50' : ''
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Request Access Link - Replace Sign Up */}
              <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Don't have an account?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                  BA WorkXP is currently invite-only for individuals and training platforms.
                </p>
                <a
                  href="mailto:support@baworkxp.com?subject=Access%20Request%20for%20BA%20WorkXP&body=Hello,%0D%0A%0D%0AI'm interested in accessing BA WorkXP.%0D%0A%0D%0AName:%0D%0AOrganization:%0D%0AReferral/How I heard about you:%0D%0A%0D%0AThank you!"
                  className="inline-flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-semibold hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  <span>Request Access</span>
                </a>
              </div>
            </form>
          ) : activeTab === 'signup' ? (
            // Signup is disabled - show invite-only message
            <div className="text-center py-8">
              <Shield className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Invite-Only Platform
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                BA WorkXP is currently invite-only for individual learners and training platform partnerships.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Request access for yourself or explore partnership opportunities for your organization:
              </p>
              <a
                href="mailto:support@baworkxp.com?subject=Partnership%20Inquiry%20-%20BA%20WorkXP"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Mail className="w-5 h-5" />
                <span>Email support@baworkxp.com</span>
              </a>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Already have an account?</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-semibold"
                >
                  Sign In Here
                </button>
              </div>
            </div>
          ) : null}
          
          {/* Original Signup Form (hidden but kept for dev/admin purposes) */}
          {false && activeTab === 'signup-hidden' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    id="signup-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.name ? 'border-red-300 bg-red-50' : ''
                    }`}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type="email"
                    id="signup-email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.email ? 'border-red-300 bg-red-50' : ''
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.password ? 'border-red-300 bg-red-50' : ''
                    }`}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="signup-confirm-password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : ''
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Sign Up'
                )}
              </button>

              {/* Sign In Link */}
              <div className="text-center mt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>

      {/* Device Lock Alert */}
      {deviceLockResult && (
        <DeviceLockAlert
          message={deviceLockResult.message}
          isLocked={deviceLockResult.locked}
          onClose={() => {
            setDeviceLockResult(null)
            localStorage.removeItem('deviceLockError') // Clear from localStorage when dismissed
          }}
        />
      )}
      </div>
    </div>
  )
}

export default LoginSignup