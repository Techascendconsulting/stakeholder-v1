import React, { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { BookOpen, Play, ChevronDown, ChevronUp, Target, MessageSquare, Award, ArrowRight, Users, Brain, Zap, CheckCircle, Star, TrendingUp, Globe, Mic } from 'lucide-react'

const GuidedPracticeHub: React.FC = () => {
  const { setCurrentView } = useApp()
  const [activeTab, setActiveTab] = useState('how-it-works')

  // Scroll to top when component mounts
  useEffect(() => {
    const scrollToTop = () => {
      const mainContainer = document.querySelector('main')
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        mainContainer.scrollTop = 0
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
    
    scrollToTop()
    setTimeout(scrollToTop, 0)
    setTimeout(scrollToTop, 50)
  }, [])

  const handleStartPracticing = () => {
    setCurrentView('projects')
  }

  const tabs = [
    { id: 'how-it-works', label: 'How It Works', icon: Target },
    { id: 'why-questions-matter', label: 'Why Questions Matter', icon: MessageSquare },
    { id: 'scoring', label: 'How Scoring Works', icon: Award }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Header */}
      <div className="relative bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 dark:from-indigo-400/10 dark:to-purple-400/10"></div>
        
        {/* Skip to Projects Button - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={handleStartPracticing}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-white/20"
          >
            <span className="text-sm">Skip to Projects</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Meeting Mode Selection Cards */}
        <div className="absolute top-6 left-6 z-10">
          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentView('meeting')}
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-white/30"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Text Chat</span>
            </button>
            <button
              onClick={() => setCurrentView('voice-only-meeting')}
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-white/30"
            >
              <Mic className="w-4 h-4" />
              <span className="text-sm">Voice Only</span>
            </button>
            <button
              onClick={() => setCurrentView('individual-agent-meeting')}
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-white/30"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm">Individual Agents</span>
            </button>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Practice Stakeholder Conversations
            </h1>
            <div className="text-xl text-indigo-600 dark:text-indigo-400 font-semibold mb-4">
              The Core Skill for Business Analysts
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Business Analysts solve problems by working with people — not just writing documents.
                To do this well, you need to confidently ask the right questions, guide conversations, 
                and uncover the real issues hiding beneath the surface.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                This practice space helps you develop exactly that.
                You'll choose realistic projects, meet with stakeholders, and improve your confidence by doing — not memorising.
              </p>
            </div>

            {/* Key Stats */}
            <div className="flex flex-wrap justify-center gap-6 text-center mb-6">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Realistic scenarios</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">AI-powered stakeholders</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Safe practice environment</span>
              </div>
            </div>


          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Video Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 mb-8 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Watch this short video to see how the practice works and how to get the most from it.
            </h2>
            {/* YouTube Video Embed */}
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden shadow-lg">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/a2OEfUpXdnw?rel=0&modestbranding=1&showinfo=0"
                  title="How to Practice Stakeholder Conversations Effectively"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 dark:border-gray-700">
            <div className="flex flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'how-it-works' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  🔹 How It Works
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg font-bold text-sm">
                          1
                        </div>
                        <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
                        Choose a Sample Project
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 flex-grow">
                        Explore real-world scenarios like onboarding, fraud reduction, or process improvement.
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        This gives structure to your practice — you're not guessing.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-lg font-bold text-sm">
                          2
                        </div>
                        <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
                        Prepare for Your Meeting
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 flex-grow">
                        Read the project brief, understand what's going wrong, and learn who the stakeholders are.
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                        This helps you ask focused, relevant questions.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-600 text-white rounded-lg font-bold text-sm">
                          3
                        </div>
                        <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
                        Select Your Stakeholders
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 flex-grow">
                        Choose which stakeholders to interview based on the project needs and your learning goals.
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                        Start with one stakeholder, then try group meetings.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-600 text-white rounded-lg font-bold text-sm">
                          4
                        </div>
                        <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
                        Join Live Meeting
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 flex-grow">
                        Start your voice or text-based meeting with AI-powered stakeholders who behave like real people.
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                        Practice guiding conversations and uncovering insights.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'why-questions-matter' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                  🔹 Why Asking the Right Questions Matters
                </h3>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700 mb-8">
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    Most stakeholders won't hand you the full story. They'll share what they think the problem is — 
                    it's your job to dig deeper. That's why learning to ask the right questions is the most valuable 
                    skill a Business Analyst can have.
                  </p>
                </div>

                <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Good questions help you:
                </h4>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mt-1">
                      <Target className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-900 dark:text-slate-100">Uncover what the stakeholder truly needs</h5>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mt-1">
                      <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-900 dark:text-slate-100">Identify root causes behind surface complaints</h5>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mt-1">
                      <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-900 dark:text-slate-100">Spot missing requirements early</h5>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mt-1">
                      <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-900 dark:text-slate-100">Guide decisions with confidence</h5>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700 mt-8">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    This space helps you build that muscle by doing it repeatedly in safe, realistic scenarios — 
                    with support when you need it.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'scoring' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                  🔹 How Scoring Works
                </h3>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 mb-8">
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    After 3 meetings, you'll receive a Confidence Score — designed to help you track your growth over time.
                  </p>
                </div>

                <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                  Here's what we measure:
                </h4>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-700/50 rounded-xl p-6 border border-slate-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <h5 className="text-lg font-semibold text-slate-900 dark:text-slate-100">1. Question Quality</h5>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Did your questions dig deeper, clarify, and drive the conversation?
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700/50 rounded-xl p-6 border border-slate-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <h5 className="text-lg font-semibold text-slate-900 dark:text-slate-100">2. Listening & Follow-up</h5>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Did you adapt to what the stakeholder said, or just ask a fixed list?
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700/50 rounded-xl p-6 border border-slate-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <h5 className="text-lg font-semibold text-slate-900 dark:text-slate-100">3. Goal Alignment</h5>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Did your questions match the objective of the meeting?
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    What Your Score Means
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    You'll see a simple breakdown like:
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Early Stage:</span>
                        <span className="text-slate-600 dark:text-slate-400 ml-2">You're getting started. Keep showing up.</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Improving:</span>
                        <span className="text-slate-600 dark:text-slate-400 ml-2">You're asking better questions and thinking like a BA.</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Confident:</span>
                        <span className="text-slate-600 dark:text-slate-400 ml-2">You're handling conversations with structure and clarity.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-6 border border-slate-200 dark:border-gray-600 mt-8">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    If your score stays low, you'll get smart suggestions like:
                  </p>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li className="flex items-center space-x-2">
                      <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>🎥 Watch this video to improve questioning techniques</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>🔁 Try the meeting again with coaching tips visible</span>
                    </li>
                  </ul>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                    <strong>The goal is growth, not perfection.</strong> Your score is private. Use it as a mirror — not a judgment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-8">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-3">Ready to Start Practicing?</h3>
              <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Choose from our library of realistic projects and begin developing your stakeholder conversation skills today.
            </p>
            <button
              onClick={handleStartPracticing}
              className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
            >
              <span>Explore Projects and Start Practising</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuidedPracticeHub
