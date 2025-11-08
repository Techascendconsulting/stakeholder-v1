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
  GraduationCap
} from 'lucide-react'
import LoginSignup from './LoginSignup'
import ContactUsView from './Views/ContactUsView'
import FAQView from './Views/FAQView'
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
  const [showRequestAccess, setShowRequestAccess] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showTermsOfService, setShowTermsOfService] = useState(false)
  const [showCookiePolicy, setShowCookiePolicy] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
              <button className="text-gray-300 hover:text-white font-medium transition-colors">
                Home
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
                Contact Us
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
                className="block w-full text-left text-gray-300 hover:text-white font-medium transition-colors"
              >
                Home
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
                Contact Us
              </button>
              <div className="pt-4 space-y-2">
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
          <div className="grid lg:grid-cols-2 gap-12 items-start">
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
            
            {/* Right: Meeting Preview - More Impressive Visual */}
            <div className="relative">
              <MeetingPreview />
            </div>
          </div>
        </div>
      </section>

      {/* The Problem - Light Purple Section with Better Contrast */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070')] opacity-[0.02] bg-cover bg-center"></div>
        
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 backdrop-blur-sm rounded-full border border-purple-600/30 mb-6">
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
              <span className="text-sm font-semibold text-purple-700">The Challenge</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 text-gray-900">
              The Interview Questions You Can't Answer Yet
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              You've studied. You know the theory. But when interviewers ask behavioral questions, you don't have real examples to share...
            </p>
          </div>

          {/* Interview Questions Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white backdrop-blur-sm border-2 border-purple-200 rounded-xl p-6 hover:border-purple-400 transition-all shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    "Tell me about a time you dealt with a difficult stakeholder..."
                  </p>
                  <p className="text-gray-700">
                    You haven't. You've only read about it. Your mind goes blank.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white backdrop-blur-sm border-2 border-purple-200 rounded-xl p-6 hover:border-purple-400 transition-all shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    "Can you show me examples of requirements you've documented?"
                  </p>
                  <p className="text-gray-700">
                    You don't have any. Just course exercises that don't feel real.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white backdrop-blur-sm border-2 border-purple-200 rounded-xl p-6 hover:border-purple-400 transition-all shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    "Walk me through how you'd analyze a business process..."
                  </p>
                  <p className="text-gray-700">
                    Theory is different from doing. You stumble through your answer.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white backdrop-blur-sm border-2 border-purple-200 rounded-xl p-6 hover:border-purple-400 transition-all shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    "How do you handle conflicting requirements from different stakeholders?"
                  </p>
                  <p className="text-gray-700">
                    You've read about it. But you've never actually been in that situation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* The Insight */}
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 border-l-4 border-purple-600 rounded-xl p-8 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-200 flex items-center justify-center flex-shrink-0">
                <Award className="w-8 h-8 text-purple-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-3">
                  Certificates prove you learned. Experience proves you can do.
                </p>
                <p className="text-lg text-gray-800 leading-relaxed">
                  Employers want evidence you can handle real stakeholders, navigate ambiguity, and deliver actual work products. They want stories. They want examples. They want confidence. <span className="font-semibold text-purple-700">That's what BA WorkXP gives you.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution - Transformation Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800">
        {/* Vibrant curved background with gradient and glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-purple-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-transparent to-emerald-900/10"></div>
        
        {/* Animated geometric shapes */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-emerald-400 to-green-600 rounded-[60px] opacity-15 rotate-12 blur-2xl animate-float"></div>
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-[40px] opacity-15 -rotate-6 blur-2xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-10 blur-3xl animate-pulse-slow"></div>
        
          {/* Content with enhanced styling */}
          <div className="relative max-w-6xl mx-auto px-6 text-center">
            {/* Decorative badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-sm rounded-full shadow-lg mb-6 border border-emerald-500/40">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-sm font-semibold text-emerald-300">The Solution</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-8 text-white">
              Get the experience before you need it.
            </h2>
            <p className="text-xl sm:text-2xl leading-relaxed text-gray-300 max-w-3xl mx-auto font-medium mb-12">
              BA WorkXP is a practice platform where you perform the actual work of a Business Analyst — so when interviewers ask "Tell me about a time..." you have real answers.
            </p>

            {/* Transformation Grid */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
              {/* Before */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border-2 border-red-500/30 shadow-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full mb-4">
                  <span className="text-sm font-bold text-red-300">Before BA WorkXP</span>
                </div>
                <ul className="space-y-4 text-left">
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">No real stakeholder conversations</span>
                </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Can't answer behavioral questions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">No portfolio of actual work</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Theory without application</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Nervous and unsure in interviews</span>
                  </li>
                </ul>
              </div>

              {/* After */}
              <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 rounded-2xl p-8 border-2 border-emerald-500/50 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500 rounded-full mb-4">
                    <span className="text-sm font-bold text-white">After BA WorkXP</span>
                  </div>
                  <ul className="space-y-4 text-left">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white font-medium">30+ practice stakeholder sessions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white font-medium">Real stories for "Tell me about..."</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white font-medium">Portfolio of process maps, user stories</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white font-medium">Hands-on experience you can prove</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white font-medium">Walk into interviews confident</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          <button
            onClick={() => setShowAuth(true)}
            className="group px-10 py-5 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white text-lg font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-1 hover:scale-105"
          >
            <span className="flex items-center justify-center gap-2">
              Start Building Your Experience
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Portfolio Item 1 */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/20 transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Stakeholder Interview Transcripts</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                30+ practice sessions with AI stakeholders. Interview transcripts showing how you elicit requirements, handle pushback, and navigate ambiguity.
              </p>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm font-semibold text-blue-400">Interview Answer: Ready</p>
              </div>
            </div>

            {/* Portfolio Item 2 */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Process Maps & Flow Diagrams</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                As-Is and To-Be process maps for multiple business processes. Visual documentation of workflows, pain points, and improvements.
              </p>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm font-semibold text-purple-400">Portfolio Piece: Deliverable</p>
              </div>
            </div>

            {/* Portfolio Item 3 */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/20 transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">User Stories & Acceptance Criteria</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                50+ user stories written across real projects. Stories with proper format, acceptance criteria, and edge cases considered.
              </p>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm font-semibold text-emerald-400">Portfolio Piece: Deliverable</p>
              </div>
            </div>

            {/* Portfolio Item 4 */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-orange-500/50 transition-all hover:shadow-2xl hover:shadow-orange-500/20 transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Requirements Documents</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                Functional and non-functional requirements, business rules, and constraints. Structured documentation employers recognize.
              </p>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm font-semibold text-orange-400">Portfolio Piece: Deliverable</p>
              </div>
            </div>

            {/* Portfolio Item 5 */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/20 transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Scrum Ceremony Experience</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                Participated in Sprint Planning, Refinement, and Retrospectives. Know what to do and say as the BA in Agile ceremonies.
              </p>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm font-semibold text-cyan-400">Interview Answer: Ready</p>
              </div>
            </div>

            {/* Portfolio Item 6 */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-pink-500/50 transition-all hover:shadow-2xl hover:shadow-pink-500/20 transform hover:-translate-y-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Project Context & Business Cases</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                Work across 5+ realistic projects. Understand context, identify problems, and articulate business value — skills employers want.
              </p>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm font-semibold text-pink-400">Interview Answer: Ready</p>
              </div>
            </div>
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

      {/* How It Works - Step by Step */}
      <section className={`py-24 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm rounded-full border border-blue-500/30 mb-6">
              <Rocket className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Simple Process</span>
            </div>
            
            <h2 className={`text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              How BA WorkXP Works
            </h2>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Four simple steps to go from uncertain to interview-ready
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-20"></div>

            {/* Step 1 */}
            <div className="relative">
              <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-xl hover:shadow-2xl transition-all`}>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 mx-auto relative z-10">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className={`text-xl font-bold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>Learn or Review</h3>
                <p className={`text-center leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  New to BA? Start with our BA Academy to learn fundamentals. Already trained? Jump straight to projects
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-xl hover:shadow-2xl transition-all`}>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 mx-auto relative z-10">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className={`text-xl font-bold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>Choose Projects</h3>
                <p className={`text-center leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select from 5+ realistic projects and start having stakeholder conversations with AI coaching
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-xl hover:shadow-2xl transition-all`}>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6 mx-auto relative z-10">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className={`text-xl font-bold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Deliverables</h3>
                <p className={`text-center leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Build process maps, user stories, requirements docs — actual work products for your portfolio
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-xl hover:shadow-2xl transition-all`}>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6 mx-auto relative z-10">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <h3 className={`text-xl font-bold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>Land the Job</h3>
                <p className={`text-center leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Walk into interviews confident with real examples and a portfolio that proves you can do the work
                </p>
              </div>
            </div>
          </div>

          {/* CTA with Navigation */}
          <div className="mt-16 text-center">
            <button
              onClick={() => setShowAuth(true)}
              className="group px-10 py-5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1 hover:scale-105 mb-6"
            >
              <span className="flex items-center justify-center gap-2">
                Start Your First Project
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Or <button onClick={() => setShowRequestAccess(true)} className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">watch a demo first</button>
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table Section - Improved Background */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 backdrop-blur-sm rounded-full border border-yellow-500/30 mb-6">
              <BarChart3 className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Why BA WorkXP Is Different</span>
            </div>
            
            <h2 className={`text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              The Smarter Way to Break Into Business Analysis
            </h2>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Compare the cost, time, and outcomes of different paths to becoming a Business Analyst
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className={`w-full border-collapse rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800/50' : 'bg-gray-50 border-2 border-gray-200'}`}>
              <thead>
                <tr className={`border-b ${isDark ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-gray-700' : 'bg-gradient-to-r from-purple-100 to-indigo-100 border-gray-300'}`}>
                  <th className={`text-left p-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Feature</th>
                  <th className={`text-center p-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Traditional Courses</th>
                  <th className={`text-center p-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bootcamps</th>
                  <th className={`text-center p-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Certifications</th>
                  <th className={`text-center p-6 border-l-2 border-purple-500 ${isDark ? 'bg-gradient-to-br from-purple-600/30 to-indigo-600/30' : 'bg-gradient-to-br from-purple-200 to-indigo-200'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-white font-bold">BA WorkXP</span>
                      <div className="px-2 py-1 bg-emerald-500 rounded-full text-xs font-bold text-white">BEST</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {/* Cost Row */}
                <tr className={`transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-purple-50/50'}`}>
                  <td className={`p-6 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Cost</td>
                  <td className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>$500 - $2,000</td>
                  <td className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>$5,000 - $15,000</td>
                  <td className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>$1,500 - $3,000</td>
                  <td className={`p-6 text-center border-l-2 border-purple-500 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`}>
                    <div className="text-emerald-400 font-bold">Free to Start</div>
                    <div className="text-sm text-gray-400 mt-1">Then $29/month</div>
                  </td>
                </tr>

                {/* Time Commitment Row */}
                <tr className={`transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-purple-50/50'}`}>
                  <td className={`p-6 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Time Commitment</td>
                  <td className={`p-6 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>3 - 6 months fixed</td>
                  <td className={`p-6 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>12 weeks fixed schedule</td>
                  <td className={`p-6 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>2 - 4 months fixed</td>
                  <td className={`p-6 text-center border-l-2 border-purple-500 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`}>
                    <div className="text-emerald-500 dark:text-emerald-400 font-bold">Learn at your pace</div>
                    <div className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>30min/day works</div>
                  </td>
                </tr>

                {/* Hands-On Practice Row */}
                <tr className={`transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-purple-50/50'}`}>
                  <td className={`p-6 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Real Stakeholder Practice</td>
                  <td className="p-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-6 text-center">
                    <div className="text-yellow-500 dark:text-yellow-400 text-sm font-medium">Limited</div>
                  </td>
                  <td className="p-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className={`p-6 text-center border-l-2 border-purple-500 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Unlimited</span>
                    </div>
                  </td>
                </tr>

                {/* AI Coaching Row */}
                <tr className={`transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-purple-50/50'}`}>
                  <td className={`p-6 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>AI Coaching & Feedback</td>
                  <td className="p-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-6 text-center">
                    <div className="text-yellow-500 dark:text-yellow-400 text-sm font-medium">Instructor only</div>
                  </td>
                  <td className="p-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className={`p-6 text-center border-l-2 border-purple-500 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Real-time</span>
                    </div>
                  </td>
                </tr>

                {/* Portfolio Row */}
                <tr className={`transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-purple-50/50'}`}>
                  <td className={`p-6 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Portfolio of Work Products</td>
                  <td className="p-6 text-center">
                    <div className="text-yellow-500 dark:text-yellow-400 text-sm font-medium">Basic exercises</div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="text-yellow-500 dark:text-yellow-400 text-sm font-medium">1-2 projects</div>
                  </td>
                  <td className="p-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className={`p-6 text-center border-l-2 border-purple-500 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">5+ Projects</span>
                    </div>
                  </td>
                </tr>

                {/* Interview Prep Row */}
                <tr className={`transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-purple-50/50'}`}>
                  <td className={`p-6 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Behavioral Interview Stories</td>
                  <td className="p-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-6 text-center">
                    <div className="text-yellow-500 dark:text-yellow-400 text-sm font-medium">Limited</div>
                  </td>
                  <td className="p-6 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className={`p-6 text-center border-l-2 border-purple-500 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Dozens</span>
                    </div>
                  </td>
                </tr>

                {/* What You Get Row */}
                <tr className={`transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-purple-50/50'}`}>
                  <td className={`p-6 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>What You Get</td>
                  <td className={`p-6 text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Certificate + Knowledge</td>
                  <td className={`p-6 text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Certificate + 1 Project</td>
                  <td className={`p-6 text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Certificate Only</td>
                  <td className={`p-6 text-center border-l-2 border-purple-500 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/50'}`}>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">Experience + Portfolio + Confidence</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Stats - Fixed Readability */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 border-2 border-emerald-200 text-center shadow-lg">
              <div className="text-5xl font-bold text-emerald-600 mb-3">90%</div>
              <p className="text-gray-900 font-bold text-lg">Less expensive than bootcamps</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 text-center shadow-lg">
              <div className="text-5xl font-bold text-blue-600 mb-3">5x</div>
              <p className="text-gray-900 font-bold text-lg">More hands-on practice than courses</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 text-center shadow-lg">
              <div className="text-5xl font-bold text-purple-600 mb-3">30+</div>
              <p className="text-gray-900 font-bold text-lg">Practice sessions to build confidence</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowAuth(true)}
              className="group px-10 py-5 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white text-lg font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-1 hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                Start Free — No Credit Card Required
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="text-gray-200 mt-4 text-base font-medium">Cancel anytime. No long-term commitment.</p>
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
                onClick={() => setShowRequestAccess(true)}
                className={`px-8 py-4 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                  isDark 
                    ? 'border-purple-500/50 text-white hover:bg-purple-900/20 hover:border-purple-400' 
                    : 'border-purple-500/30 text-gray-900 hover:bg-purple-50 hover:border-purple-500'
                }`}
              >
                <span>Learn more</span>
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

      {/* FAQ Section */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Common Questions
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Everything you need to know before you start
            </p>
          </div>

          <div className="space-y-6">
            {/* FAQ 1 */}
            <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Is this really free to start?
              </h3>
              <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Yes. You can start practicing immediately with no credit card required. Access core features and complete your first 3 projects free. When you're ready for unlimited practice and advanced features, upgrade to our paid plan.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                How is this different from taking a BA course?
              </h3>
              <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Courses teach you about Business Analysis. BA WorkXP lets you do Business Analysis. You practice actual stakeholder conversations, create real deliverables, and build a portfolio—not just watch videos or read slides. When interviewers ask "Tell me about a time..." you'll have real answers.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Will employers accept AI-generated practice as "experience"?
              </h3>
              <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                You're not claiming it's real job experience. You're demonstrating competency. When you show process maps you've created, user stories you've written, and can articulate your approach to stakeholder management, employers see proof you can do the work. That's what gets you past the screening stage.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                How long does it take to feel interview-ready?
              </h3>
              <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Most users feel confident after 4-6 weeks of consistent practice (30 minutes per day). By then, you'll have conducted 20-30 stakeholder sessions, created multiple deliverables, and have real stories to tell in interviews. Some go faster, some take longer—it's self-paced.
              </p>
            </div>

            {/* FAQ 5 */}
            <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Do I need BA knowledge before starting?
              </h3>
              <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Basic understanding helps but isn't required. We have a learning section covering fundamentals. However, BA WorkXP is designed for application, not initial learning. If you've never heard of Business Analysis, start with our foundational modules, then move to practice.
              </p>
            </div>

            {/* FAQ 6 */}
            <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                What if I get stuck or need help?
              </h3>
              <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Every practice session includes real-time AI coaching that nudges you when you're off track. After each session, you get detailed feedback on what you did well and what to improve. Plus, our community forum connects you with other learners and experienced BAs.
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-16 text-center">
            <div className={`rounded-2xl p-12 ${isDark ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200'}`}>
              <h3 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Ready to break the experience barrier?
              </h3>
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
                <li><button onClick={() => setShowFAQ(true)} className={`text-sm hover:text-purple-600 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Features</button></li>
                <li><button onClick={() => setShowFAQ(true)} className={`text-sm hover:text-purple-600 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pricing</button></li>
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

