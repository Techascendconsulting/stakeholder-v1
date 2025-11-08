import React, { useState } from 'react'
import { CheckCircle, ArrowRight, Briefcase, MessageSquare, Users, Target, BarChart3, FileText, Rocket, Award, BookOpen, TrendingUp, Play, GraduationCap, Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import ConversationTypingPreview from '../ConversationTypingPreview'

interface FeaturesViewProps {
  onClose: () => void
  onStartNow?: () => void
  onShowPricing?: () => void
  onShowFAQ?: () => void
  onShowContact?: () => void
}

const FeaturesView: React.FC<FeaturesViewProps> = ({ onClose, onStartNow, onShowPricing, onShowFAQ, onShowContact }) => {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Navigation - Same as Landing Page */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={onClose}>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BA WorkXP</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={onClose}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Home
              </button>
              <button 
                className="text-white font-medium border-b-2 border-purple-500"
              >
                Features
              </button>
              <button 
                onClick={onShowPricing}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={onShowFAQ}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                FAQ
              </button>
              <button 
                onClick={onShowContact}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Contact
              </button>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={onStartNow}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Start Free
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <nav className="flex flex-col space-y-4">
                <button 
                  onClick={onClose}
                  className="text-left text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Home
                </button>
                <button 
                  className="text-left text-white font-medium"
                >
                  Features
                </button>
                <button 
                  onClick={onShowPricing}
                  className="text-left text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Pricing
                </button>
                <button 
                  onClick={onShowFAQ}
                  className="text-left text-gray-300 hover:text-white font-medium transition-colors"
                >
                  FAQ
                </button>
                <button 
                  onClick={onShowContact}
                  className="text-left text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Contact
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-left text-gray-300 hover:text-white font-medium transition-colors"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={onStartNow}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold text-center"
                >
                  Start Free
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
          {/* Hero */}
          <div className="text-center mb-20">
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Everything You Need to Get Hired
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Interviewers want candidates with experience in complex projects. Build a complete portfolio that proves you've done the work.
            </p>
          </div>

          {/* How It Works - Detailed */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm rounded-full border border-blue-500/30 mb-6">
                <Rocket className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Simple Process</span>
              </div>
              
              <h2 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                How BA WorkXP Works
              </h2>
              <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
                Experience the full BA lifecycle from stakeholder interviews to Scrum ceremonies
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Connecting Line */}
              <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 via-emerald-500 to-orange-500 opacity-20"></div>

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
                  <h3 className={`text-xl font-bold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>Write User Stories in Jira</h3>
                  <p className={`text-center leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Create properly formatted user stories with acceptance criteria. Interact with developers to ensure clarity.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border-2 border-gray-200'} shadow-xl hover:shadow-2xl transition-all`}>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6 mx-auto relative z-10">
                    <span className="text-2xl font-bold text-white">4</span>
                  </div>
                  <h3 className={`text-xl font-bold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>Attend Scrum Ceremonies</h3>
                  <p className={`text-center leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Participate in Sprint Planning, Refinement, and Retrospectives to ensure implementation meets business goals.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* What You'll Build - Full Portfolio */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full border border-blue-500/30 mb-6">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">Your BA Portfolio</span>
              </div>
              
              <h2 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Build Your Portfolio Through the BA Lifecycle
              </h2>
              <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
                Follow the complete BA workflow from project discovery to delivery — creating real deliverables employers want to see
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Portfolio Items with Images - Reordered to follow BA workflow */}
              
              {/* 1. Project Context & Business Cases */}
              <div className="group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-pink-500/20 hover:border-pink-500/50">
                <div className="h-48 overflow-hidden bg-gradient-to-br from-pink-900 to-purple-900">
                  <img 
                    src="/images/collaborate1.jpg" 
                    alt="Business Cases" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-80"
                  />
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Project Context & Business Cases</h3>
                  </div>
                  <p className="text-gray-400 mb-4 leading-relaxed text-sm">
                    Work across 5+ realistic projects. Understand context, identify problems, and articulate business value — skills employers want.
                  </p>
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm font-semibold text-pink-400">✓ Interview Answer: Ready</p>
                  </div>
                </div>
              </div>

              {/* 2. Requirements Elicitation - Stakeholder Interviews */}
              <div className="group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-blue-500/20 hover:border-blue-500/50">
                <div className="h-48 overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900">
                  <img 
                    src="/images/collaborate1.jpg" 
                    alt="Requirements Elicitation" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-80"
                  />
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Requirements Elicitation Transcripts</h3>
                  </div>
                  <p className="text-gray-400 mb-4 leading-relaxed text-sm">
                    30+ stakeholder interviews showing mastery of elicitation techniques. Demonstrate how you gather requirements, handle conflicting needs, and probe for hidden details.
                  </p>
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm font-semibold text-blue-400">✓ Interview Answer: Ready</p>
                  </div>
                </div>
              </div>

              {/* 3. Process Maps & Flow Diagrams */}
              <div className="group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-purple-500/20 hover:border-purple-500/50">
                <div className="h-48 overflow-hidden bg-gradient-to-br from-purple-900 to-pink-900">
                  <img 
                    src="/images/home4.jpg" 
                    alt="Process Maps" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-80"
                  />
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Process Maps & Flow Diagrams</h3>
                  </div>
                  <p className="text-gray-400 mb-4 leading-relaxed text-sm">
                    As-Is and To-Be process maps for multiple business processes. Visual documentation of workflows, pain points, and improvements.
                  </p>
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm font-semibold text-purple-400">✓ Portfolio Piece: Deliverable</p>
                  </div>
                </div>
              </div>

              {/* 4. User Stories & Acceptance Criteria */}
              <div className="group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-emerald-500/20 hover:border-emerald-500/50">
                <div className="h-48 overflow-hidden bg-gradient-to-br from-emerald-900 to-green-900">
                  <img 
                    src="/images/scrum1.jpg" 
                    alt="User Stories" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-80"
                  />
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">User Stories & Acceptance Criteria</h3>
                  </div>
                  <p className="text-gray-400 mb-4 leading-relaxed text-sm">
                    50+ user stories written across real projects. Stories with proper format, acceptance criteria, and edge cases considered.
                  </p>
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm font-semibold text-emerald-400">✓ Portfolio Piece: Deliverable</p>
                  </div>
                </div>
              </div>

              {/* 5. Requirements Documents */}
              <div className="group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-orange-500/20 hover:border-orange-500/50">
                <div className="h-48 overflow-hidden bg-gradient-to-br from-orange-900 to-red-900">
                  <img 
                    src="/images/home4.jpg" 
                    alt="Requirements Documents" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-80"
                  />
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Requirements Documents</h3>
                  </div>
                  <p className="text-gray-400 mb-4 leading-relaxed text-sm">
                    Functional and non-functional requirements, business rules, and constraints. Structured documentation employers recognize.
                  </p>
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm font-semibold text-orange-400">✓ Portfolio Piece: Deliverable</p>
                  </div>
                </div>
              </div>

              {/* 6. Scrum Ceremony Experience */}
              <div className="group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-cyan-500/20 hover:border-cyan-500/50">
                <div className="h-48 overflow-hidden bg-gradient-to-br from-cyan-900 to-blue-900">
                  <img 
                    src="/images/scrum1.jpg" 
                    alt="Scrum Ceremonies" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-80"
                  />
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Scrum Ceremony Experience</h3>
                  </div>
                  <p className="text-gray-400 mb-4 leading-relaxed text-sm">
                    Participated in Sprint Planning, Refinement, and Retrospectives. Know what to do and say as the BA in Agile ceremonies.
                  </p>
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm font-semibold text-cyan-400">✓ Interview Answer: Ready</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Platform Preview */}
          <section className="mb-24">
            <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
              {/* Left: Conversation Preview */}
              <div className="relative py-16 px-8 flex items-center justify-center bg-gradient-to-br from-gray-800 via-purple-900/30 to-gray-900">
                <div className="absolute top-10 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl animate-float-slow"></div>
                
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
              
              {/* Right: Features List */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 px-8 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-full border border-purple-700 mb-6 self-start">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-purple-100">Platform Features</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 leading-tight">
                  Real Projects. Real Skills. Real Confidence.
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">AI Stakeholder Conversations</h3>
                      <p className="text-gray-400 leading-relaxed">
                        Interview realistic AI stakeholders with unique personalities, goals, and concerns. Practice elicitation, negotiation, and conflict resolution.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Real-Time AI Coaching</h3>
                      <p className="text-gray-400 leading-relaxed">
                        Get instant feedback as you work. The AI coach helps when you're stuck, suggests better approaches, and explains what you did well.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Portfolio Builder</h3>
                      <p className="text-gray-400 leading-relaxed">
                        Automatically generate professional deliverables you can download and show employers. Process maps, user stories, requirements docs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Progress Tracking</h3>
                      <p className="text-gray-400 leading-relaxed">
                        See your improvement over time. Track completed projects, conversations, and deliverables. Know when you're interview-ready.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center">
            <div className={`rounded-2xl p-12 ${isDark ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200'}`}>
              <h3 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Ready to start building your portfolio?
              </h3>
              <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Everything you need to get interview-ready in one platform
              </p>
              <button
                onClick={onStartNow}
                className="px-12 py-5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all inline-flex items-center gap-2"
              >
                Start Free Today
                <ArrowRight className="w-6 h-6" />
              </button>
              <p className={`text-sm mt-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                No credit card required • Join 2,500+ aspiring BAs
              </p>
            </div>
          </div>
        </div>
    </div>
  )
}

export default FeaturesView

