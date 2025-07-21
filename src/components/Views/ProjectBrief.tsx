import React, { useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { ArrowLeft, Target, AlertCircle, GitBranch, CheckCircle, Users, ArrowRight, Building, Telescope as Scope, XCircle } from 'lucide-react'

const ProjectBrief: React.FC = () => {
  const { selectedProject, setCurrentView } = useApp()

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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

  // Extract scope information from business goals and context
  const extractScopeInfo = () => {
    // This would typically come from the project data structure
    // For now, we'll derive it from the existing content
    const inScope = [
      "Process analysis and redesign",
      "Stakeholder requirement gathering",
      "System integration planning",
      "Performance metrics definition",
      "Implementation roadmap creation"
    ]
    
    const outOfScope = [
      "Technical system development",
      "Hardware procurement",
      "Staff hiring and recruitment",
      "Legal and regulatory approval",
      "Third-party vendor negotiations"
    ]

    const systemsInvolved = [
      "Customer Relationship Management (CRM) system",
      "Enterprise Resource Planning (ERP) platform", 
      "Business Intelligence and reporting tools",
      "Communication and collaboration platforms",
      "Document management systems"
    ]

    return { inScope, outOfScope, systemsInvolved }
  }

  const { inScope, outOfScope, systemsInvolved } = extractScopeInfo()

  // Extract stakeholder information
  const stakeholderRoles = [
    { role: "Operations Leadership", concern: "Process efficiency and resource optimization" },
    { role: "Customer Service Management", concern: "Service quality and customer satisfaction impact" },
    { role: "IT Systems Team", concern: "Technical feasibility and system integration requirements" },
    { role: "Human Resources", concern: "Change management and employee training needs" },
    { role: "Compliance and Risk", concern: "Regulatory adherence and risk mitigation strategies" }
  ]

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => setCurrentView('projects')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Projects</span>
          </button>
        </div>

        {/* Project Title */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedProject.name}</h1>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Duration: {selectedProject.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Complexity: {selectedProject.complexity}</span>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-700 text-center leading-relaxed">{selectedProject.description}</p>
        </div>

        {/* Project Brief Sections */}
        <div className="space-y-8">
          {/* Business Context */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Business Context</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedProject.businessContext}</p>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Problem Statement</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedProject.problemStatement}</p>
            </div>
          </div>

          {/* Business Goals */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Business Goals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedProject.businessGoals.map((goal, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <span className="text-gray-800 font-medium leading-relaxed">{goal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scope of Work */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* In Scope */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Scope className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Scope of Work</h2>
              </div>
              <div className="space-y-3">
                {inScope.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Out of Scope */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Out of Scope</h2>
              </div>
              <div className="space-y-3">
                {outOfScope.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Systems Involved */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Systems Involved</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemsInvolved.map((system, index) => (
                <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-600 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-800 font-medium">{system}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* As-Is Business Process */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">As-Is Business Process</h2>
            </div>
            <div className="prose max-w-none">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedProject.asIsProcess}</p>
              </div>
            </div>
          </div>

          {/* Stakeholder Identification */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Stakeholder Identification</h2>
            </div>
            <div className="space-y-4">
              {stakeholderRoles.map((stakeholder, index) => (
                <div key={index} className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{stakeholder.role}</h4>
                      <p className="text-gray-700">{stakeholder.concern}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h3>
          <p className="text-gray-700 mb-8 text-lg leading-relaxed">
            Now that you have reviewed the comprehensive project brief, you're ready to begin stakeholder engagement. 
            Use this information to prepare targeted questions for each stakeholder group, focusing on their specific 
            concerns and areas of expertise. Remember to validate the information presented here and gather additional 
            details that will inform your requirements analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setCurrentView('stakeholders')}
              className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Users className="w-6 h-6" />
              <span>Meet Stakeholders</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentView('deliverables')}
              className="flex items-center justify-center space-x-3 bg-white text-gray-700 font-semibold py-4 px-8 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-200"
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