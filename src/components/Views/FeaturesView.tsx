import React from 'react'
import { X, CheckCircle, ArrowRight, Briefcase, MessageSquare, Users, Target, BarChart3, FileText, Rocket, Award, BookOpen, TrendingUp, Play } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import ConversationTypingPreview from '../ConversationTypingPreview'

interface FeaturesViewProps {
  onClose: () => void
  onStartNow?: () => void
}

const FeaturesView: React.FC<FeaturesViewProps> = ({ onClose, onStartNow }) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm">
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <header className={`sticky top-0 z-10 ${isDark ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Features
            </h1>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
            >
              <X className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Hero */}
          <div className="text-center mb-20">
            <h2 className={`text-4xl sm:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Everything You Need to Get Interview-Ready
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              From learning BA fundamentals to practicing with AI stakeholders — build a complete portfolio of real work
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
          </section>

          {/* What You'll Build - Full Portfolio */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full border border-blue-500/30 mb-6">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">Your BA Portfolio</span>
              </div>
              
              <h2 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                What You'll Build Inside BA WorkXP
              </h2>
              <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
                A portfolio of real BA work products you can show employers — proving you can do the job, not just talk about it
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Portfolio Items with Images */}
              <div className="group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-blue-500/20 hover:border-blue-500/50">
                <div className="h-48 overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900">
                  <img 
                    src="/images/collaborate1.jpg" 
                    alt="Stakeholder Conversations" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-80"
                  />
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Stakeholder Interview Transcripts</h3>
                  </div>
                  <p className="text-gray-400 mb-4 leading-relaxed text-sm">
                    30+ practice sessions with AI stakeholders. Interview transcripts showing how you elicit requirements, handle pushback, and navigate ambiguity.
                  </p>
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm font-semibold text-blue-400">✓ Interview Answer: Ready</p>
                  </div>
                </div>
              </div>

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
    </div>
  )
}

export default FeaturesView

