import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { Target, Zap, FileText, BarChart3, ArrowRight, Users, BookOpen, TrendingUp } from 'lucide-react'

const PracticeView: React.FC = () => {
  const { setCurrentView } = useApp()

  const practiceOptions = [
    {
      id: 'project-workspace',
      title: 'Project Practice',
      description: 'Practice stakeholder conversations with realistic business scenarios and AI-powered stakeholders',
      icon: Target,
      color: 'from-blue-600 to-indigo-600',
      hoverColor: 'hover:from-blue-700 hover:to-indigo-700',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-800'
    },
    {
      id: 'agile-practice',
      title: 'Scrum Practice',
      description: 'Master Scrum ceremonies, user stories, and agile methodologies with interactive training',
      icon: Zap,
      color: 'from-purple-600 to-pink-600',
      hoverColor: 'hover:from-purple-700 hover:to-pink-700',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconBg: 'bg-purple-100 dark:bg-purple-800'
    },
    {
      id: 'training-deliverables',
      title: 'Practice Deliverables',
      description: 'Create and manage project deliverables, documentation, and stakeholder artifacts',
      icon: FileText,
      color: 'from-green-600 to-emerald-600',
      hoverColor: 'hover:from-green-700 hover:to-emerald-700',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconBg: 'bg-green-100 dark:bg-green-800'
    },
    {
      id: 'progress-tracking',
      title: 'Progress Tracking',
      description: 'Monitor your learning progress, track achievements, and analyze your skill development',
      icon: BarChart3,
      color: 'from-orange-600 to-red-600',
      hoverColor: 'hover:from-orange-700 hover:to-red-700',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconBg: 'bg-orange-100 dark:bg-orange-800'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Practice Hub
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose your practice area to develop your stakeholder conversation and project management skills
            </p>
          </div>
        </div>
      </div>

      {/* Practice Options Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {practiceOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <div
                key={option.id}
                onClick={() => setCurrentView(option.id as any)}
                className={`${option.bgColor} rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-200 dark:border-gray-700`}
              >
                <div className="flex items-start space-x-6">
                  <div className={`${option.iconBg} p-4 rounded-xl`}>
                    <IconComponent className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {option.description}
                    </p>
                    <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${option.color} ${option.hoverColor} text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl`}>
                      <span>Start Practicing</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl mb-4">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">50+ Scenarios</h3>
              <p className="text-gray-600 dark:text-gray-400">Realistic business situations to practice with</p>
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl mb-4">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Interactive Learning</h3>
              <p className="text-gray-600 dark:text-gray-400">Hands-on practice with AI-powered stakeholders</p>
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl mb-4">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">Monitor your skill development over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PracticeView
