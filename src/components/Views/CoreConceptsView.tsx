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
  }
]

const CoreConceptsView: React.FC = () => {
  const { setCurrentView } = useApp()
  const [selectedConcept, setSelectedConcept] = useState<CoreConcept | null>(null)
  const [completedConcepts, setCompletedConcepts] = useState<Set<string>>(new Set())

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Core Concepts</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Essential business analyst principles and foundational knowledge
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreConcepts.map((concept) => (
            <div key={concept.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{concept.title}</h3>
              <p className="text-gray-600">{concept.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CoreConceptsView
