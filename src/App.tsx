import React from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AdminProvider } from './contexts/AdminContext'
import { AppProvider } from './contexts/AppContext'
import { VoiceProvider } from './contexts/VoiceContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LandingPage from './components/LandingPage'
import { StakeholderBotProvider } from './context/StakeholderBotContext'
import LoginSignup from './components/LoginSignup'
import MainLayout from './components/Layout/MainLayout'
import { AlertCircle } from 'lucide-react'
import { MeetingSetupProvider } from './contexts/MeetingSetupContext'
import { OnboardingProvider } from './contexts/OnboardingContext'
import GlobalWatermark from './components/GlobalWatermark'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [isMounted, setIsMounted] = React.useState(false)

  // Prevent hydration flash by waiting for mount
  React.useEffect(() => {
    console.log('🚀 APP - Component mounted')
    setIsMounted(true)
  }, [])

  console.log('🚀 APP - Render state:', { user: !!user, loading, isMounted })

  if (loading || !isMounted) {
    console.log('🚀 APP - Showing loading screen')
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-xs text-gray-500 mt-2">Loading: {loading}, Mounted: {isMounted.toString()}</p>
        </div>
      </div>
    )
  }

  console.log('🚀 APP - Rendering main content, user:', !!user)
  return user ? <MainLayout /> : <LandingPage />
}

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error)
      setHasError(true)
      setError(event.error)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      setHasError(true)
      setError(new Error(event.reason))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Error</h1>
          <p className="text-gray-600 mb-6">
            {error?.message || 'An unexpected error occurred. Please check the console for details.'}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              Try refreshing the page or check the browser console for more details.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

class ReactErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">React Error</h1>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'A React component error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return <>{this.props.children}</>
  }
}

function App() {
  return (
    <ReactErrorBoundary>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <AdminProvider>
              <VoiceProvider>
                <AppProvider>
                  <OnboardingProvider>
                    <MeetingSetupProvider>
                      <StakeholderBotProvider>
                        <AppContent />
                        <GlobalWatermark />
                      </StakeholderBotProvider>
                    </MeetingSetupProvider>
                  </OnboardingProvider>
                </AppProvider>
              </VoiceProvider>
            </AdminProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </ReactErrorBoundary>
  )
}

export default App

