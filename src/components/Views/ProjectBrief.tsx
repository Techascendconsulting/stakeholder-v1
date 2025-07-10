import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { ArrowLeft, Target, AlertCircle, GitBranch, CheckCircle, Users, ArrowRight } from 'lucide-react'

const ProjectBrief: React.FC = () => {
  const { selectedProject, setCurrentView } = useApp()

  if (!selectedProject) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">No project selected</p>
          <button 
            onClick={() => setCurrentView('projects')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => setCurrentView('projects')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Projects</span>
        </button>
      </div>

      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedProject.name}</h1>
          <p className="text-lg text-gray-600">{selectedProject.description}</p>
        </div>

        {/* Project Brief Sections */}
        <div className="space-y-8">
          {/* Business Context */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Business Context</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">{selectedProject.businessContext}</p>
          </div>

          {/* Problem Statement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Problem Statement</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">{selectedProject.problemStatement}</p>
          </div>

          {/* As-Is Process */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Current Process (As-Is)</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">{selectedProject.asIsProcess}</p>
          </div>

          {/* Business Goals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Business Goals</h2>
            </div>
            <ul className="space-y-3">
              {selectedProject.businessGoals.map((goal, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
          <p className="text-gray-700 mb-6">
            Now that you understand the business context and goals, it's time to meet with the stakeholders 
            to gather detailed requirements and understand their perspectives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setCurrentView('stakeholders')}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Users className="w-5 h-5" />
              <span>Meet Stakeholders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView('deliverables')}
              className="flex items-center justify-center space-x-2 bg-white text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <span>View Deliverables</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectBrief