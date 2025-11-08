import React, { useState, useEffect } from 'react'
import { 
  ArrowRight,
  CheckCircle,
  Users,
  FileText,
  Target,
  Briefcase,
  Award,
  BookOpen,
  Rocket,
  Mail,
  Phone,
  MapPin,
  Moon,
  Sun,
  Menu,
  X,
  Play,
  TrendingUp,
  MessageSquare,
  BarChart3,
  GraduationCap,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import LoginSignup from './LoginSignup'
import ContactUsView from './Views/ContactUsView'
import FAQView from './Views/FAQView'
import PricingView from './Views/PricingView'
import FeaturesView from './Views/FeaturesView'
import RequestAccessModal from './RequestAccessModal'
import PrivacyPolicyView from './Views/PrivacyPolicyView'
import TermsOfServiceView from './Views/TermsOfServiceView'
import CookiePolicyView from './Views/CookiePolicyView'
import CookieConsent from './CookieConsent'
import { useTheme } from '../contexts/ThemeContext'
import ConversationTypingPreview from './ConversationTypingPreview'
import MeetingPreview from './MeetingPreview'

const LandingPage: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [showAuth, setShowAuth] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)
  const [showRequestAccess, setShowRequestAccess] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showTermsOfService, setShowTermsOfService] = useState(false)
  const [showCookiePolicy, setShowCookiePolicy] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showFullExperience, setShowFullExperience] = useState(false)
  const [showWhatYouBuild, setShowWhatYouBuild] = useState(false)
  const [showPlatformFeatures, setShowPlatformFeatures] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const showLoginForm = localStorage.getItem('showLoginForm')
    if (showLoginForm === 'true') {
      setShowAuth(true)
      localStorage.removeItem('showLoginForm')
    }

    const openHandler = () => {
      setShowRequestAccess(true)
    }
    window.addEventListener('openRequestAccess', openHandler as EventListener)

    try {
      const shouldOpen = localStorage.getItem('openRequestAccess')
      if (shouldOpen === '1') {
        setShowRequestAccess(true)
        localStorage.removeItem('openRequestAccess')
      }
    } catch (e) {
      console.warn('LandingPage: failed to read openRequestAccess flag', e)
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('openRequestAccess', openHandler as EventListener)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  if (showAuth) {
    return <LoginSignup onBack={() => setShowAuth(false)} />
  }

  if (showContact) {
    return <ContactUsView 
      onBack={() => setShowContact(false)} 
      onFAQClick={() => {
        setShowContact(false);
        setShowFAQ(true);
      }}
    />
  }

  if (showFAQ) {
    return <FAQView onBack={() => setShowFAQ(false)} />
  }

  if (showPrivacyPolicy) {
    return <PrivacyPolicyView onBack={() => setShowPrivacyPolicy(false)} />
  }

  if (showTermsOfService) {
    return <TermsOfServiceView onBack={() => setShowTermsOfService(false)} />
  }

  if (showCookiePolicy) {
    return <CookiePolicyView onBack={() => setShowCookiePolicy(false)} />
  }

  if (showPricing) {
    return (
      <PricingView 
        onClose={() => setShowPricing(false)} 
        onStartNow={() => { setShowPricing(false); setShowAuth(true); }}
        onShowFeatures={() => { setShowPricing(false); setShowFeatures(true); }}
        onShowFAQ={() => { setShowPricing(false); setShowFAQ(true); }}
        onShowContact={() => { setShowPricing(false); setShowContact(true); }}
      />
    )
  }

  if (showFeatures) {
    return (
      <FeaturesView 
        onClose={() => setShowFeatures(false)} 
        onStartNow={() => { setShowFeatures(false); setShowAuth(true); }}
        onShowPricing={() => { setShowFeatures(false); setShowPricing(true); }}
        onShowFAQ={() => { setShowFeatures(false); setShowFAQ(true); }}
        onShowContact={() => { setShowFeatures(false); setShowContact(true); }}
      />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-lg' 
          : 'bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BA WorkXP</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => setShowFeatures(true)}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => setShowPricing(true)}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => setShowFAQ(true)}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                FAQ
              </button>
              <button 
                onClick={() => setShowContact(true)}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Contact
              </button>
            </nav>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 py-2 text-white hover:text-gray-200 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuth(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Request Access
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-800 py-4 space-y-4">
              <button 
                onClick={() => { 
                  window.scrollTo({ top: 0, behavior: 'smooth' }); 
                  setMobileMenuOpen(false); 
                }}
                className="block w-full text-left text-gray-300 hover:text-white font-medium transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => { 
                  setMobileMenuOpen(false);
                  setShowFeatures(true);
                }}
                className="block w-full text-left text-gray-300 hover:text-white font-medium transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => { 
                  setMobileMenuOpen(false);
                  setShowPricing(true);
                }}
                className="block w-full text-left text-gray-300 hover:text-white font-medium transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => { setShowFAQ(true); setMobileMenuOpen(false); }}
                className="block w-full text-left text-gray-300 hover:text-white font-medium transition-colors"
              >
                FAQ
              </button>
              <button 
                onClick={() => { setShowContact(true); setMobileMenuOpen(false); }}
                className="block w-full text-left text-gray-300 hover:text-white font-medium transition-colors"
              >
                Contact
              </button>
              <div className="pt-4 border-t border-gray-700 space-y-2">
                <button
                  onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }}
                  className="w-full px-4 py-2 text-white hover:text-gray-200 font-medium transition-colors text-left"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }}
                  className="w-full px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-medium"
                >
                  Start Now
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Problem-Focused */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
            alt="Business team collaboration"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-purple-900/80 to-gray-900/95"></div>
        </div>
        
        {/* Animated Decorative elements */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl z-10 animate-float"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl z-10 animate-float-delayed"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl z-10 animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl z-10 animate-pulse-slow"></div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
            {/* Left: Text Content */}
            <div className="space-y-6">
              {/* Problem Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 backdrop-blur-sm rounded-full border border-red-500/30">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-red-300">The Career-Changer's Problem</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white">
                You can't get a BA job without experience.
                <span className="block text-purple-400 mt-2">But you can't get experience without a job.</span>
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed">
                Break the catch-22. Practice the actual work of a Business Analyst — stakeholder interviews, requirements documentation, process analysis, Scrum ceremonies — and build a portfolio that proves you can do the job.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => setShowAuth(true)}
                  className="group px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:-translate-y-0.5 hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Practicing Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <button
                  onClick={() => setShowRequestAccess(true)}
                  className="px-8 py-4 rounded-xl font-semibold bg-gray-800/80 hover:bg-gray-700 text-white border-2 border-gray-700 hover:border-purple-500 transition-all backdrop-blur-sm"
                >
                  See How It Works
                </button>
              </div>
              
              <div className="flex items-start gap-3 pt-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-gray-300">
                  No credit card required. Start building your BA portfolio today.
                </p>
              </div>

              {/* Social Proof Stats - Mini version in Hero */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-700/50 mt-6">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold">S</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold">J</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold">A</div>
                  </div>
                  <p className="text-sm text-gray-400">
                    <span className="font-bold text-white">2,500+</span> aspiring BAs practicing
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">
                    <span className="font-bold text-white">4.8/5</span> rating
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right: Meeting Preview - With Clear Context */}
            <div className="relative flex flex-col items-center justify-center">
              {/* Clear Explanation */}
              <div className="mb-6 text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-full border-2 border-emerald-400/40 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-sm font-bold text-emerald-100">YOU Practicing Right Now</span>
                </div>
                <h3 className="text-2xl font-bold text-white max-w-md mx-auto leading-tight">
                  This Is You Interviewing a Real Stakeholder
                </h3>
                <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
                  Practice eliciting requirements from AI stakeholders with real business problems. Build confidence before your first interview.
                </p>
              </div>
              <MeetingPreview />
              
              {/* What You're Building */}
              <div className="mt-6 flex items-center gap-3 px-6 py-3 bg-purple-600/10 backdrop-blur-sm rounded-xl border border-purple-500/30">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <p className="text-sm font-medium text-gray-200">
                  Every conversation becomes portfolio proof
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution - Breaking the Catch-22 */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              You can't get experience without a job?<br />
              <span className="text-emerald-600">Actually, you can.</span>
            </h2>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Here's what everyone misses: BA work doesn't require an employer's permission. You just need organizations, stakeholders, and projects.
            </p>

            {/* Virtual Organizations Visual */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Card 1: Join Organizations */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-emerald-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-2">Join Virtual Companies</h3>
                <p className="text-sm text-gray-600 text-center">Get employed virtually at realistic organizations with real business challenges</p>
              </div>

              {/* Card 2: Real Stakeholders */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-emerald-200">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-2">Meet Your Stakeholders</h3>
                <p className="text-sm text-gray-600 text-center">Interview department heads, product managers, and end users with unique needs</p>
              </div>

              {/* Card 3: Complex Projects */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-emerald-200">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-2">Solve Complex Projects</h3>
                <p className="text-sm text-gray-600 text-center">Work on enterprise-level projects with AI guidance every step of the way</p>
              </div>
            </div>

            <div className="bg-emerald-100 border-l-4 border-emerald-600 p-6 my-8 rounded-r-xl">
              <p className="text-xl font-bold text-emerald-900 mb-3">
                This IS work experience.
              </p>
              <p className="text-lg text-emerald-800 leading-relaxed">
                You're doing the actual BA job — same tasks, same deliverables, same problems to solve. The only difference? You're doing it from home, on your schedule, while keeping your current job.
              </p>
            </div>

            {/* Expandable Content */}
            {showFullExperience && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <p className="text-lg text-gray-700 text-center font-medium">
                  You do the same BA work as any employed BA:
                </p>

                <div className="grid md:grid-cols-2 gap-4 text-base">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Interview stakeholders in virtual meetings</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Gather and document requirements</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Create process maps and workflows</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Write user stories with acceptance criteria</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Manage scope and handle changes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Get AI coaching when you're stuck</span>
                  </div>
                </div>

                <p className="text-xl text-gray-700 leading-relaxed">
                  When interviewers ask "Tell me about your experience..." you'll have real answers. Because you have real experience.
                </p>
              </div>
            )}

            <div className="text-center mt-8">
              <button
                onClick={() => setShowFullExperience(!showFullExperience)}
                className="inline-flex items-center gap-2 px-6 py-3 text-emerald-700 font-semibold hover:text-emerald-800 transition-all mb-6"
              >
                {showFullExperience ? (
                  <>
                    Show Less
                    <ChevronUp className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Learn More About The Experience
                    <ChevronDown className="w-5 h-5" />
                  </>
                )}
              </button>

              <div>
                <button
                  onClick={() => setShowAuth(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                >
                  Start Building Experience Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-sm text-gray-600 mt-4">
                  No job required. No permission needed. Just start doing the work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* What You'll Build - Portfolio Outcomes */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full border border-blue-500/30 mb-6">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">Your BA Portfolio</span>
            </div>
            
            <h2 className={`text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              What You'll Build Inside BA WorkXP
            </h2>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              A portfolio of real BA work products you can show employers — proving you can do the job, not just talk about it.
            </p>
          </div>

          {/* Show 3 items initially, 6 when expanded */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Portfolio Item 1 */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Interview Transcripts</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                30+ AI stakeholder sessions with real examples
              </p>
            </div>

            {/* Portfolio Item 2 */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Process Maps</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                As-Is and To-Be workflows with visual documentation
              </p>
            </div>

            {/* Portfolio Item 3 */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">User Stories</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                50+ stories with proper acceptance criteria
              </p>
            </div>

            {/* Expandable items */}
            {showWhatYouBuild && (
              <>
                <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-orange-500/50 transition-all hover:shadow-2xl hover:shadow-orange-500/20 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Requirements Docs</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Functional & non-functional requirements
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/20 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Scrum Ceremonies</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Sprint Planning, Refinement & Retrospectives
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-pink-500/50 transition-all hover:shadow-2xl hover:shadow-pink-500/20 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Business Cases</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    5+ projects with context and business value
                  </p>
                </div>
              </>
            )}
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => setShowWhatYouBuild(!showWhatYouBuild)}
              className="inline-flex items-center gap-2 px-6 py-3 text-purple-400 font-semibold hover:text-purple-300 transition-all"
            >
              {showWhatYouBuild ? (
                <>
                  Show Less
                  <ChevronUp className="w-5 h-5" />
                </>
              ) : (
                <>
                  See All Deliverables
                  <ChevronDown className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-12 border border-purple-500/20 backdrop-blur-sm">
              <h3 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                This isn't a course. It's a portfolio builder.
              </h3>
              <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                When you finish, you'll have actual work products to show — and real stories to tell in interviews.
              </p>
              <button
                onClick={() => setShowAuth(true)}
                className="group px-10 py-5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Building Your Portfolio
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Preview with Features */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
            {/* Left: Conversation Preview with Enhanced Gradient Background */}
            <div className="relative py-16 px-8 flex items-center justify-center bg-gradient-to-br from-gray-800 via-purple-900/30 to-gray-900">
              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl animate-float-slow"></div>
              
              {/* Badge */}
              <div className="absolute top-6 left-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-purple-200">
                  <MessageSquare className="w-3 h-3 text-purple-600" />
                  <span className="text-xs font-bold text-purple-900">Practice Conversations</span>
                </div>
              </div>
              
              <div className="relative z-10">
                <ConversationTypingPreview />
              </div>
            </div>
            
            {/* Right: Text Content with Enhanced Styling */}
            <div className="py-16 px-8 lg:px-12 flex items-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="space-y-6 w-full">
                {/* Platform Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-full border border-purple-700">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-purple-100">How It Works</span>
                </div>
                
                {/* Heading */}
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                  Practice inside realistic project environments — with AI coaching every step of the way
                </h2>
                
                {/* Enhanced List with Checkmarks */}
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 group">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-200">AI Stakeholders That Feel Real</p>
                      <p className="text-sm text-gray-400">They push back. They're vague. They have conflicting priorities. Just like real stakeholders.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-200">Real-Time AI Coaching</p>
                      <p className="text-sm text-gray-400">Get nudges when you ask closed questions, miss key areas, or jump to solutions too early.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-200">Structured 4-Stage Training Path</p>
                      <p className="text-sm text-gray-400">Problem Exploration → As-Is Analysis → To-Be Design → Solution Design. Master each stage.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-200">Voice-Enabled Practice Sessions</p>
                      <p className="text-sm text-gray-400">Talk to stakeholders naturally. Practice the actual conversations, not just typing.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-200">Detailed Performance Feedback</p>
                      <p className="text-sm text-gray-400">Coverage analysis, question quality assessment, and specific improvement scripts after every session.</p>
                    </div>
                  </li>
                </ul>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    onClick={() => setShowAuth(true)}
                    className="group px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1 hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Try It Free
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setShowRequestAccess(true)}
                    className="px-8 py-4 rounded-xl font-semibold border-2 border-purple-500/50 text-white hover:bg-purple-900/30 hover:border-purple-400 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Watch demo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Minimal Teaser */}
      <section className={`py-16 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Simple. Effective. Practical.
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Three steps to interview-ready
            </p>
          </div>

          {/* 3 Icon Steps */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'} flex items-center justify-center`}>
                <Target className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Choose Project
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                Pick realistic scenario
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'} flex items-center justify-center`}>
                <MessageSquare className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Do the Work
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                Interview stakeholders
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'} flex items-center justify-center`}>
                <Award className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Get Hired
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                With real portfolio
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <button
                onClick={() => setShowAuth(true)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl hover:shadow-xl transition-all"
              >
                Start Free
              </button>
              <button
                onClick={() => setShowFeatures(true)}
                className={`px-8 py-3 font-semibold rounded-xl border-2 transition-all ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                See How It Works →
              </button>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              New to BA? Start with fundamentals. Already trained? Jump to projects.
            </p>
          </div>
        </div>
      </section>


      {/* Third Section: Platform Features */}
      <section className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Real Projects. Real Skills. Real Confidence.
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Everything you need to become interview-ready
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Card 1 - Enhanced */}
            <div className="group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-purple-500/20 hover:border-purple-500/50">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/images/home4.jpg" 
                  alt="Explore Business Problem" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-900 to-purple-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Explore the Business Problem
                  </h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Step into real project scenarios. Understand context, map processes, uncover pain points, and define what needs to change.
                </p>
              </div>
            </div>

            {/* Card 2 - Enhanced */}
            <div className="group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-indigo-500/20 hover:border-indigo-500/50">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/images/collaborate1.jpg" 
                  alt="Work With Stakeholders" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-900 to-indigo-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Work With Stakeholders
                  </h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Practice communicating with stakeholders. Ask clarifying questions, resolve ambiguity, capture requirements, and get guided feedback.
                </p>
              </div>
            </div>

            {/* Card 3 - Enhanced */}
            <div className="group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-blue-500/20 hover:border-blue-500/50">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/images/scrum1.jpg" 
                  alt="Deliver in a Scrum Team" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-900 to-blue-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Deliver in a Scrum Team
                  </h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Write user stories and acceptance criteria, take part in refinement and planning, and support developers/testers — with direction as you work.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className={`text-lg font-semibold mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              You don't just learn about the role.<br />
              You perform the role — with guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setShowAuth(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1 hover:scale-105"
              >
                Start free
              </button>
              
              <button
                onClick={() => setShowFeatures(true)}
                className={`px-8 py-4 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                  isDark 
                    ? 'border-purple-500/50 text-white hover:bg-purple-900/20 hover:border-purple-400' 
                    : 'border-purple-500/30 text-gray-900 hover:bg-purple-50 hover:border-purple-500'
                }`}
              >
                <span>See All Features</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Success Stories */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-indigo-900/20 to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 backdrop-blur-sm rounded-full border border-emerald-500/30 mb-6">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">Success Stories</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 text-white">
              From Stuck to Hired
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Career-changers who broke through the experience barrier with BA WorkXP
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-xl">
                  S
                </div>
                <div>
                  <p className="text-white font-bold">Sarah M.</p>
                  <p className="text-sm text-gray-400">From Marketing to BA</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                "After 6 months of failed applications, I practiced 30+ stakeholder sessions on BA WorkXP. In my next interview, I confidently answered every behavioral question with real examples. Landed my first BA role 2 weeks later."
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Now a Junior BA at Tech Startup</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  J
                </div>
                <div>
                  <p className="text-white font-bold">James K.</p>
                  <p className="text-sm text-gray-400">Career Switcher</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                "I had a CBAP certification but no experience. Employers didn't care about the cert. BA WorkXP gave me a portfolio of actual deliverables. That's what finally got me past the screening calls."
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">Now a BA at Financial Services</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-xl">
                  A
                </div>
                <div>
                  <p className="text-white font-bold">Aisha P.</p>
                  <p className="text-sm text-gray-400">From QA to BA</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                "The AI coaching was incredible. It caught when I asked closed questions, when I jumped to solutions too early. I improved my technique before the real interviews. Made all the difference."
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">Now a Business Analyst at E-commerce</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">2,500+</div>
              <p className="text-white text-sm font-semibold">Practice Sessions Completed</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">89%</div>
              <p className="text-white text-sm font-semibold">Feel Interview-Ready</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">4.8/5</div>
              <p className="text-white text-sm font-semibold">Average User Rating</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">50+</div>
              <p className="text-white text-sm font-semibold">Work Products Per User</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick FAQ + CTA Section */}
      <section className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ready to break the experience barrier?
            </h2>
            
            {/* Most Important FAQ */}
            <div className={`rounded-2xl p-8 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Is this really free to start?
              </h3>
              <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Yes. Start practicing immediately with no credit card. Access core features free. Upgrade anytime for unlimited practice.
              </p>
            </div>

            <button
              onClick={() => setShowFAQ(true)}
              className={`text-sm font-medium ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'} mb-8`}
            >
              View All FAQs →
            </button>

            {/* Final CTA */}
            <div className={`rounded-2xl p-12 ${isDark ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200'}`}>
              <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Start practicing today. Build your portfolio. Get interview-ready.
              </p>
              <button
                onClick={() => setShowAuth(true)}
                className="group px-12 py-5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Practicing Free
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <p className={`text-sm mt-4 font-medium ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>
                No credit card required • Cancel anytime • Join 2,500+ aspiring BAs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 ${isDark ? 'bg-gray-900 border-t border-gray-800' : 'bg-gray-50 border-t border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                BA WorkXP™
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Empowering the next generation of business analysts through hands-on, AI-powered training.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><button onClick={() => setShowRequestAccess(true)} className={`text-sm hover:text-purple-600 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Features</button></li>
                <li><button onClick={() => setShowRequestAccess(true)} className={`text-sm hover:text-purple-600 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pricing</button></li>
                <li><button onClick={() => setShowFAQ(true)} className={`text-sm hover:text-purple-600 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>FAQ</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><button onClick={() => setShowContact(true)} className={`text-sm hover:text-purple-600 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>About</button></li>
                <li><button onClick={() => setShowContact(true)} className={`text-sm hover:text-purple-600 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Contact</button></li>
                <li><button onClick={() => setShowContact(true)} className={`text-sm hover:text-purple-600 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Careers</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><button onClick={() => setShowPrivacyPolicy(true)} className={`text-sm hover:text-purple-600 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Privacy</button></li>
                <li><button onClick={() => setShowTermsOfService(true)} className={`text-sm hover:text-purple-600 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Terms</button></li>
                <li><button onClick={() => setShowCookiePolicy(true)} className={`text-sm hover:text-purple-600 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cookies</button></li>
              </ul>
            </div>
          </div>
          <div className={`pt-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                © 2024 BA WorkXP. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className={`hover:text-purple-600 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
                <a href="#" className={`hover:text-purple-600 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showRequestAccess && (
        <RequestAccessModal onClose={() => setShowRequestAccess(false)} />
      )}

      <CookieConsent />
    </div>
  )
}

export default LandingPage

