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
  BarChart3
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
            <div className="flex items-center space-x-3">
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
                Start Now
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                <Rocket className="w-4 h-4" />
                <span>AI-Powered BA Training Platform</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Do the actual work of a{' '}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  business analyst
                </span>
              </h1>

              <p className={`text-xl leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Master business analysis through hands-on practice with AI-powered stakeholders. 
                Build real requirements, conduct meetings, and create deliverables that matter.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center gap-2 group"
                >
                  <span>Start Learning Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setShowRequestAccess(true)}
                  className={`px-8 py-4 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    isDark 
                      ? 'bg-gray-800 text-white hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-white dark:border-gray-900" />
                    ))}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="font-semibold text-gray-900 dark:text-white">500+ Learners</div>
                    <div>Active this month</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/images/home7.jpg" 
                  alt="Business Analysis Training Platform"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl blur-3xl opacity-30" />
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-3xl opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* Transform Your Skills Section */}
      <section className={`py-20 px-6 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Transform your business analysis skills
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Learn by doing with our comprehensive, hands-on training platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Do the actual work',
                description: 'Practice real BA tasks with AI-powered stakeholders and realistic project scenarios',
                image: '/images/home3.jpg'
              },
              {
                icon: Users,
                title: 'Learn collaboratively and build skills',
                description: 'Master stakeholder management through live conversations and real-time feedback',
                image: '/images/home4.jpg'
              },
              {
                icon: Award,
                title: 'Proven application skills',
                description: 'Build a portfolio of actual deliverables that showcase your capabilities',
                image: '/images/home5.jpg'
              }
            ].map((item, index) => (
              <div 
                key={index}
                className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-purple-100'
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-xl bg-white/90 dark:bg-gray-900/90 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {item.description}
                  </p>
                  <button className="mt-4 text-purple-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* End-to-End Workflow Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              End-to-end business analysis workflow
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Experience the complete BA lifecycle from discovery to delivery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Target, title: 'Discover needs', description: 'Identify business problems and opportunities' },
              { icon: Users, title: 'Engage stakeholders', description: 'Conduct meetings and gather requirements' },
              { icon: FileText, title: 'Document requirements', description: 'Create clear, actionable specifications' },
              { icon: TrendingUp, title: 'Analyze options', description: 'Evaluate and recommend solutions' },
              { icon: BarChart3, title: 'Model processes', description: 'Visualize current and future states' },
              { icon: CheckCircle, title: 'Deliver value', description: 'Support implementation and measure success' }
            ].map((step, index) => (
              <div 
                key={index}
                className={`p-6 rounded-xl transition-all duration-300 border-2 hover:border-purple-500 hover:shadow-lg ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stakeholder Meetings */}
      <section className={`py-20 px-6 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Live stakeholder meetings
              </h2>
              <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Practice real conversations with AI-powered stakeholders who respond naturally to your questions 
                and challenge your assumptions just like real people.
              </p>
              <div className="space-y-4">
                {[
                  'Realistic voice conversations',
                  'Dynamic stakeholder personalities',
                  'Real-time feedback and coaching',
                  'Unlimited practice scenarios'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/images/home6.jpg" 
                  alt="Live stakeholder meetings"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Development */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Develop your business analysis career
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Build the skills and portfolio that employers are looking for
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Hands-on projects',
                description: 'Work on realistic business scenarios across multiple industries',
                icon: Briefcase
              },
              {
                title: 'Portfolio building',
                description: 'Create professional deliverables you can showcase to employers',
                icon: FileText
              },
              {
                title: 'Industry recognition',
                description: 'Earn certificates that validate your practical skills',
                icon: Award
              }
            ].map((item, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800' : 'bg-white shadow-lg'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`rounded-3xl p-12 relative overflow-hidden ${
            isDark ? 'bg-gradient-to-br from-purple-900 to-blue-900' : 'bg-gradient-to-br from-purple-600 to-blue-600'
          }`}>
            <div className="absolute inset-0 bg-[url('/images/home2.jpg')] opacity-10 bg-cover bg-center" />
            <div className="relative">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Begin your business analysis journey
              </h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Join hundreds of aspiring business analysts who are building real skills through hands-on practice
              </p>
              <button
                onClick={() => setShowAuth(true)}
                className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2 group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Get in Touch */}
      <section className={`py-20 px-6 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Get in touch
              </h2>
              <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Have questions about our platform? We're here to help you start your BA journey.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Email Us</div>
                    <a href="mailto:support@baworkxp.com" className="text-purple-600 hover:underline">
                      support@baworkxp.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Call Us</div>
                    <a href="tel:+1234567890" className="text-purple-600 hover:underline">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Visit Us</div>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      123 BA Street, Training City, TC 12345
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowContact(true); }}>
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 focus:border-purple-500' 
                        : 'bg-gray-50 border-gray-300 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 focus:border-purple-500' 
                        : 'bg-gray-50 border-gray-300 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 focus:border-purple-500' 
                        : 'bg-gray-50 border-gray-300 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Limited Access Training */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/images/home.jpg" 
                alt="Limited access training"
                className="w-full h-auto"
              />
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Limited access business analysis training
              </h2>
              <p className={`text-xl mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Get early access to our premium features and shape the future of BA training.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Priority access to new features',
                  'Exclusive training content',
                  'Direct feedback channel',
                  'Special pricing for early adopters'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowRequestAccess(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                Request Early Access
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Training for Instructors */}
      <section className={`py-20 px-6 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Training for academies and instructors
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Empower your students with hands-on BA training that complements your curriculum
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: 'Integrate with your curriculum',
                description: 'Seamlessly add practical exercises to your existing courses',
                icon: BookOpen
              },
              {
                title: 'Track student progress',
                description: 'Monitor learning outcomes with detailed analytics and reports',
                icon: BarChart3
              },
              {
                title: 'Customizable scenarios',
                description: 'Create custom projects that match your teaching objectives',
                icon: Target
              },
              {
                title: 'Instructor dashboard',
                description: 'Manage multiple classes and review student deliverables',
                icon: Users
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}
              >
                <feature.icon className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => setShowContact(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              Contact Sales
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Become a Trainer */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`rounded-3xl p-12 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Become a certified trainer
            </h2>
            <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Join our network of expert BA trainers and help shape the next generation of business analysts
            </p>
            <button
              onClick={() => setShowRequestAccess(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              Apply Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 border-t ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
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
