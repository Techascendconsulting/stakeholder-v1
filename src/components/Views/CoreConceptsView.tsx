import React, { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { CoreConcept } from '../../types'
import { BookOpen, CheckCircle, Play, ArrowLeft } from 'lucide-react'

const coreConcepts: CoreConcept[] = [
  {
    id: '1',
    title: "Who Is a Business Analyst?",
    summary: "Understand what a Business Analyst is and why the role exists.",
    body: [
      "A Business Analyst helps organisations solve business problems.",
      "They work across teams to understand needs and shape the right solutions.",
      "They don't build the solution — they define and clarify it.",
      "The BA role exists because businesses often struggle to explain problems clearly."
    ],
    videoUrl: null
  },
  {
    id: '2',
    title: "How Organisations Work",
    summary: "To solve business problems, you must understand how businesses operate.",
    body: [
      "Every organisation either sells products, services, or both.",
      "They exist to deliver value — money, time saved, or impact.",
      "Understanding what they sell helps you understand their goals.",
      "BA work always ties back to business performance and value."
    ],
    videoUrl: null
  },
  {
    id: '3',
    title: "Departments in an Organisation",
    summary: "The different departments help the business deliver its services or products.",
    body: [
      "Common departments include Sales, Marketing, Finance, Operations, Compliance, and Customer Service.",
      "Each one has its own goals and pain points.",
      "BAs often work across departments to understand where processes break down.",
      "Knowing who does what helps you ask better questions and involve the right people."
    ],
    videoUrl: null
  },
  {
    id: '4',
    title: "Why Projects Happen",
    summary: "Projects begin when the business wants to fix something, improve, or stay competitive.",
    body: [
      "Projects are usually triggered by problems, regulations, inefficiencies, or growth plans.",
      "They are time-bound and goal-driven — not ongoing tasks.",
      "The BA helps define the project clearly before it begins.",
      "Your work prevents wasted time and money solving the wrong thing."
    ],
    videoUrl: null
  },
  {
    id: '5',
    title: "Why BAs Are Hired",
    summary: "BAs help the business understand itself before spending money on solutions.",
    body: [
      "Without BAs, teams may waste time building the wrong solution.",
      "The BA adds clarity, structure, and alignment.",
      "They reduce risk, surface hidden needs, and ensure what gets delivered actually helps.",
      "BAs are paid to improve decision-making before the build starts."
    ],
    videoUrl: null
  },
  {
    id: '6',
    title: "What a BA Does (and Doesn't Do)",
    summary: "A BA defines what's needed — but doesn't deliver it themselves.",
    body: [
      "They ask questions, gather info, and document what the business really needs.",
      "They write clear requirements — not vague guesses.",
      "They don't code, design, or test directly — but support those who do.",
      "Their job is to define the 'what' and 'why' — not the 'how'."
    ],
    videoUrl: null
  },
  {
    id: '7',
    title: "How a BA Works",
    summary: "BAs work through collaboration, research, and structured thinking.",
    body: [
      "They speak with stakeholders to uncover goals, gaps, and conflicts.",
      "They map out current and future states.",
      "They write user stories, acceptance criteria, and sometimes process flows.",
      "They support delivery teams by keeping the focus on solving the right problem."
    ],
    videoUrl: null
  },
  {
    id: '8',
    title: "Agile and Waterfall",
    summary: "Projects are delivered differently — BAs adapt based on the method.",
    body: [
      "Waterfall means plan everything up front, then build.",
      "Agile means break the work into small chunks and adjust along the way.",
      "In Agile, BAs work closely with teams during each sprint.",
      "In Waterfall, BAs often define everything before development begins."
    ],
    videoUrl: null
  },
  {
    id: '9',
    title: "Understanding the Problem",
    summary: "BAs must define the problem before anyone starts solving it.",
    body: [
      "Most people focus on symptoms — BAs go deeper.",
      "Good BAs ask 'What's really going wrong here?'",
      "You're not paid to guess — you're paid to confirm.",
      "The wrong solution to the wrong problem still fails."
    ],
    videoUrl: null
  },
  {
    id: '10',
    title: "Working With Stakeholders",
    summary: "Stakeholders are anyone affected by or involved in the change.",
    body: [
      "BAs interview stakeholders to understand different perspectives.",
      "You'll deal with conflict, uncertainty, and unclear needs.",
      "Listening well builds trust — guessing loses it.",
      "Keep stakeholders involved and aligned."
    ],
    videoUrl: null
  },
  {
    id: '11',
    title: "Working With Developers",
    summary: "You're the bridge between business needs and tech execution.",
    body: [
      "Developers rely on you to explain what needs to be built — clearly.",
      "You don't need to know code, but you must speak clearly and be available.",
      "You remove confusion and answer questions — fast.",
      "When you're clear, developers build better and faster."
    ],
    videoUrl: null
  },
  {
    id: '12',
    title: "Understanding Systems and Processes",
    summary: "BAs must understand how work flows and how systems support that work.",
    body: [
      "Processes = what people do. Systems = the tools they use to do it.",
      "BAs map out both — especially when things aren't working.",
      "A great system can still fail if the process behind it is broken.",
      "Always check how people and tech interact — that's where the truth is."
    ],
    videoUrl: null
  },
  {
    id: '13',
    title: "Spotting Inefficiencies",
    summary: "BAs help teams stop wasting time — even if they've gotten used to it.",
    body: [
      "Look for delays, double entry, unclear handoffs, and manual rework.",
      "You may hear: 'It's just how we do it.' That's your cue.",
      "Inefficiencies hide inside normal routines.",
      "Your job is to question what everyone else ignores."
    ],
    videoUrl: null
  },
  {
    id: '14',
    title: "Tools Business Analysts Use",
    summary: "BAs use tools to gather, write, and communicate — but tools aren't the point.",
    body: [
      "Common tools: Jira (requirements), Confluence (documentation), Excel (data), Miro (flows), Lucidchart (diagrams).",
      "You'll use CRM systems, ticketing platforms, and internal apps too.",
      "You don't need to master them all — just know how to use them for clarity.",
      "Good thinking always matters more than flashy tools."
    ],
    videoUrl: null
  }
]

const CoreConceptsView: React.FC = () => {
  const { setCurrentView } = useApp()
  const [selectedConcept, setSelectedConcept] = useState<CoreConcept | null>(null)
  const [completedConcepts, setCompletedConcepts] = useState<Set<string>>(new Set())

  const toggleCompletion = (conceptId: string) => {
    setCompletedConcepts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(conceptId)) {
        newSet.delete(conceptId)
      } else {
        newSet.add(conceptId)
      }
      return newSet
    })
  }

  if (selectedConcept) {
    const conceptNumber = parseInt(selectedConcept.id)
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500', 
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-blue-500'
    ]
    const gradient = gradients[(conceptNumber - 1) % gradients.length]
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-purple-900">
        <div className="max-w-5xl mx-auto p-6">
          {/* Enhanced Header */}
          <div className="mb-12">
            <button
              onClick={() => setSelectedConcept(null)}
              className="group flex items-center space-x-3 text-blue-600 hover:text-purple-600 transition-colors mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20 dark:border-gray-700/50"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 group-hover:bg-purple-100 dark:group-hover:bg-purple-900 rounded-full flex items-center justify-center transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Back to Core Concepts</span>
            </button>
            
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 mb-8">
              <div className="flex items-start space-x-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <span className="text-white font-bold text-2xl">{conceptNumber}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full inline-block mb-4">
                    Concept {selectedConcept.id} of {coreConcepts.length}
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4 leading-tight">
                    {selectedConcept.title}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    {selectedConcept.summary}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Video Placeholder */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 mb-8 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
              <div className="text-center relative z-10">
                <div className={`w-20 h-20 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4`}>
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Video Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400">Interactive video content will be available here</p>
              </div>
            </div>
          </div>

          {/* Enhanced Key Points */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 mb-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center`}>
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Key Learning Points</h2>
            </div>
            
            <div className="grid gap-6">
              {selectedConcept.body.map((point, index) => (
                <div key={index} className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className={`w-8 h-8 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Action Bar */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleCompletion(selectedConcept.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  completedConcepts.has(selectedConcept.id)
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl'
                    : `bg-gradient-to-r ${gradient} text-white shadow-lg hover:shadow-xl hover:scale-105`
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>
                  {completedConcepts.has(selectedConcept.id) ? '✓ Completed' : 'Mark as Complete'}
                </span>
              </button>

              <button
                onClick={() => setSelectedConcept(null)}
                className="flex items-center space-x-3 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <span>Back to Overview</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-500/5 dark:to-purple-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
              Core Concepts
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Master the essential business analyst principles that form the foundation of successful BA practice
            </p>
          </div>

          {/* Enhanced Progress Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Learning Journey</h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {completedConcepts.size} of {coreConcepts.length} concepts mastered
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {Math.round((completedConcepts.size / coreConcepts.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Complete</div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-700 ease-out shadow-lg relative overflow-hidden"
                  style={{ width: `${(completedConcepts.size / coreConcepts.length) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                </div>
              </div>
              {/* Progress milestones */}
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Expert</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Concepts Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreConcepts.map((concept, index) => {
            const isCompleted = completedConcepts.has(concept.id)
            const conceptNumber = parseInt(concept.id)
            
            // Different gradient combinations for visual variety
            const gradients = [
              'from-blue-500 to-cyan-500',
              'from-purple-500 to-pink-500', 
              'from-green-500 to-teal-500',
              'from-orange-500 to-red-500',
              'from-indigo-500 to-purple-500',
              'from-teal-500 to-blue-500'
            ]
            const gradient = gradients[index % gradients.length]
            
            return (
              <div
                key={concept.id}
                className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => setSelectedConcept(concept)}
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
                
                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-green-500 text-white rounded-full p-1 shadow-lg">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-lg">{conceptNumber}</span>
                      </div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        Concept {concept.id}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300 leading-tight">
                    {concept.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                    {concept.summary}
                  </p>

                  {/* Key Points Indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>{concept.body.length} key insights</span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      5 min read
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-4">
                    <div 
                      className={`bg-gradient-to-r ${gradient} h-1 rounded-full transition-all duration-300`}
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    ></div>
                  </div>

                  {/* Call to Action */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {isCompleted ? 'Completed ✓' : 'Ready to learn'}
                    </span>
                    <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 group-hover:text-purple-600 transition-colors">
                      <span className="text-sm font-medium">Explore</span>
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900 transition-colors">
                        <ArrowLeft className="w-3 h-3 rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CoreConceptsView