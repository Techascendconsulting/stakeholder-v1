import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { BookOpen, Target, MessageSquare, Users, FileText, Search, CheckCircle, ArrowRight, Lightbulb, Clock, Zap } from 'lucide-react'

const IntroductionToElicitation: React.FC = () => {
  const { setCurrentView } = useApp()

  return (
    <div className="content-root min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Header */}
      <div className="relative bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 dark:from-indigo-400/10 dark:to-purple-400/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={() => setCurrentView('elicitation-hub')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
            >
              <span className="text-sm">Skip to Elicitation Practice</span>
            </button>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Introduction to Elicitation
            </h1>
            <div className="text-xl text-indigo-600 dark:text-indigo-400 font-semibold mb-4">
              The Structured Journey of Requirements Discovery
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                As a Business Analyst, one of your most important responsibilities is to elicit requirements. 
                This is not about randomly booking meetings or collecting everything stakeholders say. 
                Strong elicitation is structured — you move through a sequence of stages, each with a clear purpose, 
                building a foundation that makes later analysis and delivery possible.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Think of elicitation as a journey. Each stage has its own focus, its own set of stakeholders, 
                and its own outputs. If you skip steps or treat elicitation as "just asking questions," 
                you risk missing the real problem or drowning in unorganised information.
              </p>
            </div>

            {/* Key Stats */}
            <div className="flex flex-wrap justify-center gap-6 text-center mb-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">7 structured stages</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Strategic stakeholder engagement</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Focused, purposeful sessions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stages Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-8 mb-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              The 7 Stages of Structured Elicitation
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Each stage builds logically on the last, ensuring you capture requirements that are focused, 
              grounded in business value, and ready for analysis.
            </p>
          </div>

          <div className="space-y-8">
            {/* Stage 1 */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg">
                  1
                </div>
              </div>
              <div className="flex-grow">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Problem Exploration</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Before any workshops or detailed sessions, you must understand the problem space. Why does this project exist? 
                    What pain point is the business trying to solve? At this stage you may meet with the sponsor, project manager, 
                    or product owner. Your aim is not to list features but to clarify the why. This anchors all future conversations.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg">
                  2
                </div>
              </div>
              <div className="flex-grow">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Early Document Analysis</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Alongside problem exploration, you often receive project artefacts — a business case, project charter, 
                    or project brief. These documents set boundaries: the scope, objectives, and constraints. Your role here 
                    is to study them carefully, make notes, and highlight gaps or questions you'll need to follow up with stakeholders. 
                    This ensures you walk into meetings informed, not blind.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg">
                  3
                </div>
              </div>
              <div className="flex-grow">
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Stakeholder Identification and Awareness</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Elicitation isn't just about "what" is needed, but also "who" to involve. At this stage, you start listing 
                    potential stakeholders. You may even sketch out a power–interest grid to understand who has influence, 
                    who has day-to-day knowledge, and who may resist change. This list helps you plan your elicitation sessions 
                    strategically rather than reactively.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-xl font-bold text-lg shadow-lg">
                  4
                </div>
              </div>
              <div className="flex-grow">
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">As-Is Exploration</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Only once the problem and stakeholders are understood do you move into the current state. Here, you ask: 
                    How is the work done today? What systems, processes, or workarounds are in place? You might hold workshops 
                    with front-line staff, observe processes, or review existing reports. The goal is to capture the baseline 
                    reality before discussing improvements.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 5 */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg">
                  5
                </div>
              </div>
              <div className="flex-grow">
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <Lightbulb className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">To-Be Exploration</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    With a shared picture of the current state, you can now guide stakeholders into imagining the future state. 
                    What goals should the project achieve? What changes are required? This isn't about locking in solutions 
                    but about shaping direction. The BA's role is to challenge assumptions, keep within scope, and ensure 
                    the future state reflects business value.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 6 */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-xl font-bold text-lg shadow-lg">
                  6
                </div>
              </div>
              <div className="flex-grow">
                <div className="bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 rounded-xl p-6 border border-rose-200 dark:border-rose-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <MessageSquare className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Requirements Detailing</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Once you've explored the problem, stakeholders, current state, and future state, you begin capturing 
                    requirements in usable form. This may mean drafting user stories with acceptance criteria, creating 
                    process models, or listing business rules. The key is that detailing comes after context — not before.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 7 */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg">
                  7
                </div>
              </div>
              <div className="flex-grow">
                <div className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-xl p-6 border border-teal-200 dark:border-teal-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Iteration and Follow-up</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Elicitation doesn't end after one round of workshops. You revisit stakeholders to clarify points, 
                    resolve conflicts, and refine what you've captured. Each new meeting has a purpose — to close gaps, 
                    confirm assumptions, or go deeper into specifics. This makes elicitation a cycle, not a one-off event.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Structure Matters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-8 mb-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Why This Structure Matters
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Notice how each stage builds logically on the last, ensuring focused and effective elicitation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Logical Progression</h3>
              <p className="text-slate-600 dark:text-slate-400">
                You don't ask for detailed requirements before clarifying the problem.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-4">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Focused Sessions</h3>
              <p className="text-slate-600 dark:text-slate-400">
                You don't design the future state before mapping the current one.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl mb-4">
                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Strategic Engagement</h3>
              <p className="text-slate-600 dark:text-slate-400">
                You don't meet stakeholders at random; you identify them deliberately.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
            <p className="text-slate-700 dark:text-slate-300 text-center font-medium">
              As a BA, you always know why you're booking a session, who needs to be in the room, 
              and what outcome you want from it. That structure keeps elicitation focused, reduces wasted time, 
              and ensures stakeholders feel heard without being overwhelmed.
            </p>
          </div>
        </div>

        {/* Preparing for Practice */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-8 mb-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Preparing for Practice
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Understanding these stages is just the beginning. In the next section, you'll move into Elicitation Practice, 
              where you'll be guided step by step through realistic scenarios.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Framing Questions</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Learn to frame the right questions for each stage of elicitation.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-4">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Stakeholder Selection</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Choose when to meet individuals vs. groups for maximum effectiveness.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl mb-4">
                <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Realistic Conversations</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Run realistic conversations with AI-powered stakeholders.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl mb-4">
                <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Stage Practice</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Practice problem exploration, As-Is discovery, To-Be visioning, and requirements detailing.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
            <p className="text-slate-700 dark:text-slate-300 text-center font-medium mb-4">
              This is where you go beyond theory and start building the confidence to elicit like a professional BA.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-center text-sm">
              In summary, elicitation is a structured journey — from problem exploration and document analysis, 
              through stakeholder mapping, As-Is and To-Be exploration, requirements detailing, and iterative follow-up. 
              Each stage has a clear purpose. Done well, elicitation ensures that the requirements you capture are 
              focused, grounded in business value, and ready to feed into Requirements Engineering.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            onClick={() => setCurrentView('elicitation-hub')}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>Go to Elicitation Practice</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default IntroductionToElicitation
