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

      {/* Hero Section - Enhanced with background image */}
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
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-white">
                Do the actual work of a Business Analyst
              </h1>
              
              <p className="text-lg text-gray-300 leading-relaxed">
                Step into the Business Analyst role inside realistic project environments — practicing stakeholder conversations, documentation, and delivery work with guidance as you go.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => setShowAuth(true)}
                  className="group px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:-translate-y-0.5 hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start the Work
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
              
              <p className="text-sm font-medium text-gray-400 pt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                Not theory. Not passive learning. Real role performance.
              </p>
            </div>
            
            {/* Right: Chat Preview */}
            <div className="relative">
              <ConversationTypingPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Text Section with Dynamic Curved Background */}
      <section className="relative py-24 mt-16 overflow-hidden">
        {/* Vibrant curved background with gradient and glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 rounded-[80px] mx-4 sm:mx-8 shadow-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/50 via-transparent to-blue-100/50 rounded-[80px] mx-4 sm:mx-8"></div>
        
        {/* Animated geometric shapes */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-[60px] opacity-15 rotate-12 blur-2xl animate-float"></div>
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-[40px] opacity-15 -rotate-6 blur-2xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-10 blur-3xl animate-pulse-slow"></div>
        
        {/* Content with enhanced styling */}
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Decorative badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-6 border border-purple-200">
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
            <span className="text-sm font-semibold text-purple-900">Real Work Experience</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-8 bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
            BA WorkXP gives you the closest thing to real work experience.
          </h2>
          <p className="text-xl sm:text-2xl leading-relaxed text-gray-800 max-w-3xl mx-auto font-medium">
            You'll interact with stakeholders, run workshops, write user stories, participate in Scrum ceremonies, and support solution delivery — just like a Business Analyst in a real team.
          </p>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-100 shadow-md hover:shadow-xl transition-shadow">
              <MessageSquare className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">Stakeholder Talks</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-md hover:shadow-xl transition-shadow">
              <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">Run Workshops</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-md hover:shadow-xl transition-shadow">
              <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">Write Stories</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-100 shadow-md hover:shadow-xl transition-shadow">
              <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">Scrum Work</p>
            </div>
          </div>
        </div>
      </section>

      {/* Second Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2">
            {/* Left: Meeting Preview with Lavender Background */}
            <div className={`py-12 px-6 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-[#C5CAE9]'} rounded-3xl`}>
              <MeetingPreview />
            </div>
            
            {/* Right: Text Content with White Background */}
            <div className={`py-12 px-6 flex items-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="space-y-6">
              <div>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Platform
                </p>
                <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Be the Business Analyst — inside a real project environment, with guidance every step of the way.
                </h2>
                <p className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  You learn the role by performing it:
                </p>
                <ul className={`space-y-2 text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span>
                    <span>Interacting with stakeholders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span>
                    <span>Clarifying requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span>
                    <span>Exploring business problems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span>
                    <span>Participating in Scrum ceremonies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span>
                    <span>Creating real deliverables</span>
                  </li>
                </ul>
                <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  And you're guided and corrected as you go — so you know you're doing it right.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-700 text-white hover:shadow-xl hover:shadow-purple-500/30 transition-all transform hover:-translate-y-0.5"
                >
                  Start Now
                </button>
                
                <button
                  onClick={() => setShowRequestAccess(true)}
                  className={`px-8 py-3.5 rounded-xl font-semibold border-2 transition-all flex items-center gap-2 ${
                    isDark 
                      ? 'border-purple-500/50 text-white hover:bg-purple-900/20' 
                      : 'border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-purple-400'
                  }`}
                >
                  <span>Watch demo</span>
                  <Play className="w-4 h-4" />
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Third Section: Platform Features */}
      <section className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              What You'll Do Inside the Platform
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Real project experience through guided role performance.
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

