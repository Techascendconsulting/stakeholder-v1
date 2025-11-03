import React, { useState, useEffect } from 'react'
import { 
  GraduationCap, 
  Users, 
  FileText, 
  Target, 
  CheckCircle, 
  ArrowRight,
  Award,
  Briefcase,
  Bot,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  ChevronDown,
  BookOpen,
  Rocket,
  Mail
} from 'lucide-react'
import LoginSignup from './LoginSignup'
import ContactUsView from './Views/ContactUsView'
import FAQView from './Views/FAQView'
import RequestAccessModal from './RequestAccessModal'
import PrivacyPolicyView from './Views/PrivacyPolicyView'
import TermsOfServiceView from './Views/TermsOfServiceView'

const LandingPage: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showRequestAccess, setShowRequestAccess] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showTermsOfService, setShowTermsOfService] = useState(false)

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
    
    return () => {
      window.removeEventListener('openRequestAccess', openHandler as EventListener)
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
    return <FAQView 
      onBack={() => setShowFAQ(false)} 
      onContactClick={() => {
        setShowFAQ(false);
        setShowContact(true);
      }} 
    />
  }
  
  if (showRequestAccess) {
    return <RequestAccessModal 
      onClose={() => setShowRequestAccess(false)} 
      onBackToHome={() => setShowRequestAccess(false)}
      onSignIn={() => {
        setShowRequestAccess(false);
        setShowAuth(true);
      }}
    />
  }

  if (showPrivacyPolicy) {
    return <PrivacyPolicyView onBack={() => setShowPrivacyPolicy(false)} />
  }

  if (showTermsOfService) {
    return <TermsOfServiceView onBack={() => setShowTermsOfService(false)} />
  }

  // Company logos for dual-scrolling animation
  const companyLogos = [
    { name: "Microsoft" },
    { name: "Deloitte" },
    { name: "PwC" },
    { name: "Accenture" },
    { name: "KPMG" },
    { name: "EY" }
  ]

  // Stats matching new content
  const stats = [
    { number: "2,847", label: "Professionals Trained", sublabel: "+127% this year" },
    { number: "£47k", label: "Average Salary Increase", sublabel: "Within 6 months" },
    { number: "94%", label: "Job Placement Rate", sublabel: "Within 3 months" },
    { number: "4.9/5", label: "Student Rating", sublabel: "From 1,200+ reviews" }
  ]

  // Success stories/testimonials
  const successStories = [
    { name: "Adunni Okafor", role: "Senior Business Analyst", company: "Microsoft", location: "London, UK", salary: "£85k → £120k", quote: "This platform transformed my stakeholder management approach. The AI interviews felt incredibly real!", image: "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Chukwuemeka Nwosu", role: "Lead Product Analyst", company: "Deloitte", location: "Manchester, UK", salary: "£65k → £95k", quote: "The real-world scenarios prepared me perfectly for my role at Deloitte. Incredibly realistic practice.", image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Folake Adebayo", role: "Business Transformation Consultant", company: "PwC", location: "Birmingham, UK", salary: "£45k → £78k", quote: "From junior analyst to consultant in 8 months. The techniques I learned are exactly what we use at PwC.", image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Oluwaseun Adeleke", role: "Business Analyst", company: "Accenture", location: "Leeds, UK", salary: "£52k → £82k", quote: "The progressive learning system kept me engaged. Verity AI helped me whenever I got stuck.", image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Chiamaka Okonkwo", role: "Requirements Analyst", company: "KPMG", location: "London, UK", salary: "£48k → £72k", quote: "The documentation practice was invaluable. I now write user stories that developers actually love.", image: "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Emeka Obi", role: "Senior BA", company: "Barclays", location: "London, UK", salary: "£58k → £88k", quote: "The MVP prioritization module changed how I approach feature planning. Landed my dream role!", image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400" }
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header - Matching Wireframe */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BA WorkXP</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button className="text-gray-300 hover:text-white font-medium transition-colors">Home</button>
              <button 
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                How It Works
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => document.getElementById('success')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Success Stories
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAuth(true)}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setShowRequestAccess(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Request Access
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Image Background */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/home2.jpg" 
            alt="Business analysis professional working with modern technology" 
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 w-full">
          <div className="max-w-4xl">
            {/* Top Stats Bar */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md rounded-2xl px-4 py-3 border border-purple-500/40 shadow-xl hover:border-purple-400 transition-all">
                <div className="text-xl md:text-2xl font-bold text-white mb-1">3,247+</div>
                <div className="text-xs text-gray-300">Successful Analysts</div>
              </div>
              <div className="bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-md rounded-2xl px-4 py-3 border border-purple-500/40 shadow-xl hover:border-purple-400 transition-all">
                <div className="text-xl md:text-2xl font-bold text-white mb-1">Complete</div>
                <div className="text-xs text-gray-300">Learning Journey</div>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Master Business Analysis
              <span className="block bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
                with AI-Powered Training
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-gray-200 mb-10 leading-relaxed max-w-2xl drop-shadow-lg">
              Learn through comprehensive interactive modules, practice with AI stakeholders, and build real projects. Begin your Business Analysis career transformation today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => setShowRequestAccess(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-10 py-5 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 font-semibold text-lg shadow-2xl transform hover:scale-105 border border-purple-400/50 flex items-center justify-center"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Learning Now
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-10 py-5 rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold text-lg hover:shadow-xl"
              >
                Explore Platform
              </button>
            </div>

            {/* AI-Powered Business Analysis Training Platform Badge */}
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-xl px-6 py-3 border border-purple-400/30 shadow-lg">
              <Bot className="w-6 h-6 text-purple-300" />
              <span className="text-base text-white font-medium">AI-Powered Business Analysis Training Platform</span>
            </div>
          </div>
        </div>
      </section>

      {/* Your Learning Path Section - 3 Cards with App Colors */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-purple-200 via-purple-100 to-indigo-100 border-t border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A structured, progressive journey from foundational concepts to real-world application
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Learn */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-purple-100">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 w-20 h-20 flex items-center justify-center mb-6 shadow-lg">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                01. Learn business analysis fundamentals
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Complete comprehensive interactive modules covering all Business Analysis fundamentals. From core concepts to advanced techniques, build a solid foundation.
              </p>
            </div>

            {/* Card 2: Practice */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-cyan-100">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 w-20 h-20 flex items-center justify-center mb-6 shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                02. Practice real-world scenarios
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Apply your knowledge with AI-powered simulations. Practice elicitation, documentation, MVP building, and Scrum in realistic scenarios.
              </p>
            </div>

            {/* Card 3: Build */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-emerald-100">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 w-20 h-20 flex items-center justify-center mb-6 shadow-lg">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                03. Build professional portfolio
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Work on hands-on projects that mirror real-world BA work. Create requirements, map processes, and manage stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transforming Careers Worldwide Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white" id="stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Transforming Careers Worldwide
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Real results from real professionals
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-gray-900 border-2 border-purple-500/50 rounded-2xl p-8 text-center hover:border-purple-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
                {stat.sublabel && (
                  <div className="text-sm text-gray-400">{stat.sublabel}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why BA WorkXP? Section */}
      <section className="py-24 bg-gradient-to-br from-gray-800 via-gray-900 to-slate-900 text-white" id="why">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Why BA WorkXP?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              From Learning to Employment - Bridge the gap between training and getting hired with real digital work experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Practical Work Experience */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-purple-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Practical Work Experience</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Gain real, hands-on digital work experience without needing a corporate placement. Work on structured projects that mirror actual business problems.
              </p>
              <div className="text-sm font-semibold text-purple-600">Real-world confidence</div>
            </div>

            {/* Become Job-Ready */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-cyan-100">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Become Job-Ready</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Learn to speak and think like a real Business Analyst. Master interview-level skills and understand what hiring managers actually want.
              </p>
              <div className="text-sm font-semibold text-cyan-600">Interview-ready skills</div>
            </div>

            {/* Full Project Lifecycle */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-emerald-100">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Full Project Lifecycle</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Experience the complete journey from problem identification to solution delivery. Interact with simulated stakeholders across departments.
              </p>
              <div className="text-sm font-semibold text-emerald-600">Real BA activities</div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* AI-Powered Guidance */}
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-blue-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">AI-Powered Guidance</h4>
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                Receive step-by-step coaching just like in a real BA role. Get instant feedback to correct mistakes and improve your delivery depth.
              </p>
              <div className="text-xs font-semibold text-blue-600">Learn why, not just what</div>
            </div>

            {/* Build Your Portfolio */}
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Build Your Portfolio</h4>
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                Export real deliverables as portfolio samples. Showcase tangible project experience to recruiters and hiring managers.
              </p>
              <div className="text-xs font-semibold text-purple-600">Proof of experience</div>
            </div>

            {/* Confidence Through Practice */}
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-emerald-100">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Confidence Through Practice</h4>
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                Rehearse stakeholder meetings with instant feedback. Develop the fluency and composure that separate trained candidates from hired ones.
              </p>
              <div className="text-xs font-semibold text-emerald-600">Interview composure</div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white">
              <div className="mb-4">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-sm opacity-90">Digital Work Experience</div>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold mb-2">Real</div>
                <div className="text-sm opacity-90">Portfolio Projects</div>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold mb-2">Job-Ready</div>
                <div className="text-sm opacity-90">Skills & Confidence</div>
              </div>
              <div className="text-xs mt-4 opacity-80">
                Close the gap between "I've trained" and "I've got the job"
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setShowRequestAccess(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-10 py-4 rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
            >
              Start Building Experience
            </button>
          </div>
        </div>
      </section>

      {/* Comprehensive Curriculum Section - 2 Column with App Colors */}
      <section className="py-24 bg-gradient-to-br from-cyan-50/30 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Image */}
            <div className="relative">
              <div className="h-[500px] bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/2566581/pexels-photo-2566581.jpeg?auto=compress&cs=tinysrgb&w=1200" 
                  alt="Comprehensive curriculum" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl opacity-20 blur-2xl"></div>
            </div>

            {/* Right: Content */}
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Comprehensive curriculum for business analysts
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Master Business Analysis through comprehensive sequential modules. Core concepts, project initiation, elicitation, documentation, and more - all with interactive assignments and AI feedback.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg ml-3">Covers the industry's most in-demand skills</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg ml-3">10 interactive modules</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg ml-3">Personalized roadmap for career success</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowRequestAccess(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-10 py-5 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 font-semibold text-lg shadow-2xl transform hover:scale-105 flex items-center justify-center"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Request Access
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-transparent border-2 border-purple-600 text-purple-600 px-10 py-5 rounded-xl hover:bg-purple-50 hover:border-purple-700 transition-all duration-300 font-semibold text-lg hover:shadow-lg"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simulate Real Business Scenarios Section - 2 Column with App Colors */}
      <section className="py-24 bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Simulate real business scenarios
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience dynamic, AI-powered interactions through practical, immersive simulations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-6 leading-tight">
                Unlimited practice opportunities
              </h3>
              <p className="text-lg text-gray-300 mb-10 leading-relaxed">
                Practice elicitation, documentation, MVP building, and Scrum with realistic AI stakeholders. Get instant feedback and improve your skills with every session.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowRequestAccess(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-10 py-5 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg shadow-2xl transform hover:scale-105 flex items-center justify-center"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Request Access
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-10 py-5 rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold text-lg hover:shadow-xl"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="h-[500px] bg-gradient-to-br from-purple-200 to-indigo-200 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/7688339/pexels-photo-7688339.jpeg?auto=compress&cs=tinysrgb&w=1200" 
                  alt="AI-powered practice scenarios" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Growth Section - Separator */}
      <section className="py-20 bg-gradient-to-br from-purple-50/40 via-white to-purple-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Industry-Ready Skills
                </h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Build practical expertise with hands-on experience in real business environments
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: CheckCircle, text: "Certified Skills" },
                { icon: CheckCircle, text: "Real Experience" },
                { icon: CheckCircle, text: "Portfolio Ready" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
                  <item.icon className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-semibold text-gray-700 text-center">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Real-world Business Analysis Challenges Section - 2 Column with App Colors */}
      <section className="py-24 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Real-world business analysis challenges
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Engage with authentic business scenarios, learn from professional deliverables.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Image */}
            <div className="relative order-2 md:order-1">
              <div className="h-[500px] bg-gradient-to-br from-purple-200 to-indigo-200 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/15543115/pexels-photo-15543115.jpeg?auto=compress&cs=tinysrgb&w=1200" 
                  alt="Real-world BA challenges" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl opacity-20 blur-2xl"></div>
            </div>

            {/* Right: Content */}
            <div className="order-1 md:order-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Develop professional deliverables
              </h3>
              <p className="text-lg text-gray-700 mb-10 leading-relaxed">
                Work on real-world business scenarios. Apply your learning to actual Business Analysis projects with tools for requirements, process mapping, and stakeholder management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowRequestAccess(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-10 py-5 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg shadow-2xl transform hover:scale-105 flex items-center justify-center"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Request Access
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gray-900 text-white px-10 py-5 rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold text-lg hover:shadow-xl"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-50/30 via-purple-50/50 to-pink-50/30" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything You Need to Master BA - Our comprehensive platform combines learning, practice, and real-world application
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Learning Journey */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-xl p-8 border border-purple-100 hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Learning Journey</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Master Business Analysis through comprehensive sequential modules. Core concepts, project initiation, elicitation, documentation, and more - all with interactive assignments and AI feedback.
              </p>
              <button
                onClick={() => setShowRequestAccess(true)}
                className="text-purple-600 font-semibold hover:text-purple-700 flex items-center transition-all group"
              >
                Request Access
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Practice Sessions */}
            <div className="bg-gradient-to-br from-cyan-50 to-white rounded-2xl shadow-xl p-8 border border-cyan-100 hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Practice Sessions</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Practice elicitation, documentation, MVP building, and Scrum with realistic scenarios. Get instant feedback and improve your skills with every session.
              </p>
              <button
                onClick={() => setShowRequestAccess(true)}
                className="text-cyan-600 font-semibold hover:text-cyan-700 flex items-center transition-all group"
              >
                Request Access
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Hands-On Projects */}
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-xl p-8 border border-emerald-100 hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Hands-On Projects</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Work on real-world business scenarios. Apply your learning to actual Business Analysis projects with tools for requirements, process mapping, and stakeholder management.
              </p>
              <button
                onClick={() => setShowRequestAccess(true)}
                className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center transition-all group"
              >
                Request Access
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Verity AI Assistant */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-8 border border-blue-100 hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Verity AI Assistant</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your 24/7 learning companion. Get instant answers to Business Analysis questions, navigate the platform, and receive personalized guidance throughout your journey.
              </p>
              <button
                onClick={() => setShowRequestAccess(true)}
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center transition-all group"
              >
                Request Access
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Verity AI Learning Assistant Section - 2 Column with App Colors */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Verity AI Learning Assistant
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Get instant coaching, real-time feedback, and personalized guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Instant Learning Support
              </h3>
              <p className="text-lg text-gray-300 mb-10 leading-relaxed">
                Your 24/7 learning companion. Get instant answers to Business Analysis questions, navigate the platform, and receive personalized guidance throughout your journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowRequestAccess(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-10 py-5 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 font-semibold text-lg shadow-2xl transform hover:scale-105 flex items-center justify-center"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Request Access
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-10 py-5 rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold text-lg"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="h-[500px] bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl overflow-hidden shadow-2xl relative">
                <img 
                  src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200" 
                  alt="AI Bot Assistant" 
                  className="w-full h-full object-cover opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/30"></div>
                {/* Animated bot icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                  <Bot className="w-32 h-32 text-white/80 absolute drop-shadow-2xl" />
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50" id="success">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Career Transformations from Our Community - Real professionals, real results, real impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start mb-4">
                  <img 
                    src={story.image} 
                    alt={story.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{story.name}</h4>
                    <p className="text-sm text-gray-600">{story.role}</p>
                    <p className="text-sm font-semibold text-purple-600">{story.company}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed italic">"{story.quote}"</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">{story.location}</div>
                  <div className="text-sm font-bold text-purple-600">{story.salary}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Logos Section - Dual Scrolling Rows */}
      <section className="py-12 bg-gradient-to-b from-gray-50/50 via-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Our graduates work at leading companies worldwide
            </h2>
            <p className="text-gray-600 text-sm">
              Trusted by top organizations across the globe
            </p>
          </div>
          
          {/* Top row - scrolling left */}
          <div className="relative overflow-hidden mb-4">
            <div className="flex animate-scroll-left space-x-12 items-center">
              {[...companyLogos, ...companyLogos, ...companyLogos].map((company, index) => (
                <div 
                  key={`top-${index}`} 
                  className="flex-shrink-0 text-xl font-bold text-gray-400 hover:text-purple-600 transition-colors px-8 whitespace-nowrap"
                >
                  {company.name}
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom row - scrolling right */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-right space-x-12 items-center">
              {[...companyLogos, ...companyLogos, ...companyLogos].map((company, index) => (
                <div 
                  key={`bottom-${index}`} 
                  className="flex-shrink-0 text-xl font-bold text-gray-400 hover:text-purple-600 transition-colors px-8 whitespace-nowrap"
                >
                  {company.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Invite-Only Platform CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Invite-Only Platform
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Join BA WorkXP - Request access for yourself or explore partnership opportunities for your training platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Left: Individual Access */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6">For Individuals</h3>
              <ul className="space-y-4 mb-8 text-purple-100">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Complete Learning Journey - Master Business Analysis fundamentals with assignments and AI feedback</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <span>AI Practice Sessions - Unlock practice modules as you progress through learning</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <span>1 Hands-On Project - Work on a real-world BA project with all tools included</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Verity AI Assistant - 24/7 support with 20 questions per day</span>
                </li>
              </ul>
              <button
                onClick={() => setShowRequestAccess(true)}
                className="w-full bg-white text-purple-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
              >
                Request Access
              </button>
              <p className="text-sm text-purple-200 mt-4 text-center">
                For individuals and training platforms • We respond within 24 hours
              </p>
            </div>

            {/* Right: Partner Access */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6">For Training Platforms</h3>
              <ul className="space-y-4 mb-8 text-purple-100">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Exclusive access for training platform partners</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <span>White-label options available</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Custom integration support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Dedicated account management</span>
                </li>
              </ul>
              <button
                onClick={() => setShowContact(true)}
                className="w-full bg-white text-purple-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
              >
                Contact Us
              </button>
              <p className="text-sm text-purple-200 mt-4 text-center">
                Exclusive access for training platform partners • We respond within 24 hours
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold mb-4">Ready to Get Started?</p>
            <p className="text-lg text-purple-100 mb-8">
              Request access for individual learning or explore partnership opportunities for your training platform.
            </p>
            <button
              onClick={() => setShowRequestAccess(true)}
              className="bg-white text-purple-700 px-10 py-4 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-xl transform hover:scale-105"
            >
              Request Access
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your BA Career Transformation Starts Today
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals accelerating their BA careers with AI-powered training. Request access today.
          </p>
          <button
            onClick={() => setShowRequestAccess(true)}
            className="bg-white text-gray-900 px-10 py-4 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-xl transform hover:scale-105"
          >
            Request Access
          </button>
          <p className="text-sm text-gray-400 mt-6">
            For individuals and training platforms • We respond within 24 hours
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">BA WorkXP</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                The world's most advanced Business Analysis training platform.
              </p>
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Connect With Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Middle Column - Platform */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button 
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Learning Journey
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Practice Sessions
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Projects
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('success')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Success Stories
                  </button>
                </li>
              </ul>
            </div>

            {/* Right Column - Support */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button 
                    onClick={() => setShowFAQ(true)}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowContact(true)}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowTermsOfService(true)}
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-400 text-center">
              © 2025 BA WorkXP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        
        @keyframes scroll-right {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
        
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
        
        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }
        
        .animate-scroll-left:hover,
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-left,
          .animate-scroll-right {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

export default LandingPage
