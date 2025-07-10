import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { Clock, Users, ArrowRight, Target, TrendingUp } from 'lucide-react'

const ProjectsView: React.FC = () => {
  const { projects, setSelectedProject, setCurrentView } = useApp()

  const handleViewBrief = (project: any) => {
    setSelectedProject(project)
    setCurrentView('project-brief')
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Beginner':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Intermediate':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Advanced':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'Beginner':
        return <Target className="w-4 h-4" />
      case 'Intermediate':
        return <TrendingUp className="w-4 h-4" />
      case 'Advanced':
        return <Target className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Business Analysis Training Projects</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Select a project to begin your comprehensive Business Analysis training. Each project provides 
            real-world scenarios with stakeholder interviews, requirements gathering, and deliverable creation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{project.name}</h3>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full border ${getComplexityColor(project.complexity)}`}>
                        {getComplexityIcon(project.complexity)}
                        <span>{project.complexity} Level</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 text-base mb-8 leading-relaxed line-clamp-4">{project.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-8 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Duration: {project.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">5 Stakeholders</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleViewBrief(project)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md"
                >
                  <span>View Project Brief</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Training Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Professional Development Framework</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Requirements Analysis</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Master stakeholder interview techniques, requirements elicitation, and documentation best practices
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Stakeholder Management</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Develop skills in stakeholder identification, communication strategies, and conflict resolution
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Deliverable Creation</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create professional BRDs, user stories, acceptance criteria, and process documentation
              </p>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Objectives</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-medium">Conduct effective stakeholder interviews and requirements gathering sessions</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-medium">Analyze business processes and identify improvement opportunities</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-medium">Create comprehensive business requirements documentation</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-medium">Develop user stories and acceptance criteria following industry standards</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-medium">Apply structured analysis techniques to complex business problems</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-medium">Present findings and recommendations to senior stakeholders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectsView