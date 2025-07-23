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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <button
              onClick={() => setSelectedConcept(null)}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Core Concepts</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedConcept.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {selectedConcept.summary}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Video content coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Key Points</h2>
            <ul className="space-y-4">
              {selectedConcept.body.map((point, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{point}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <button
              onClick={() => toggleCompletion(selectedConcept.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                completedConcepts.has(selectedConcept.id)
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className={`w-5 h-5 ${
                completedConcepts.has(selectedConcept.id) ? 'text-green-600' : 'text-gray-400'
              }`} />
              <span>
                {completedConcepts.has(selectedConcept.id) ? 'Completed' : 'Mark as Completed'}
              </span>
            </button>

            <button
              onClick={() => setSelectedConcept(null)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Core Concepts
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Core Concepts</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Essential business analyst principles and foundational knowledge
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Your Progress</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {completedConcepts.size} of {coreConcepts.length} concepts completed
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedConcepts.size / coreConcepts.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {Math.round((completedConcepts.size / coreConcepts.length) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreConcepts.map((concept) => (
            <div
              key={concept.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => setSelectedConcept(concept)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    {completedConcepts.has(concept.id) && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Concept {concept.id}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 transition-colors">
                  {concept.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  {concept.summary}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{concept.body.length} key points</span>
                  <span className="group-hover:text-purple-600 transition-colors">
                    Click to learn →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CoreConceptsView
