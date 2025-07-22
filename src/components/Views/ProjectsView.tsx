import React, { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { Clock, Users, ArrowRight, Target, TrendingUp, DollarSign, AlertTriangle, Building2, Calendar, Star, Lock, Crown, Plus, BookOpen, Award, CheckCircle, Zap, Globe, Filter } from 'lucide-react'

const ProjectsView: React.FC = () => {
  const { projects, selectProject, setCurrentView, studentSubscription, canAccessProject, user } = useApp()
  const [selectedFilter, setSelectedFilter] = useState('all')

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

  const handleViewBrief = async (project: any) => {
    try {
      await selectProject(project)
      setCurrentView('project-brief')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const getComplexityConfig = (complexity: string) => {
    switch (complexity) {
      case 'Beginner':
        return {
          color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
          badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200',
          description: 'Foundation Level'
        }
      case 'Intermediate':
        return {
          color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
          badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200',
          description: 'Professional Level'
        }
      case 'Advanced':
        return {
          color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700',
          badge: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
          description: 'Expert Level'
        }
      default:
        return {
          color: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
          badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
          description: 'Standard Level'
        }
    }
  }

  const getBusinessImpact = (projectId: string) => {
    const impacts = {
      'proj-1': { value: '£1.8M', type: 'Annual Cost Savings', priority: 'High', roi: '340%' },
      'proj-2': { value: '£250K', type: 'Process Efficiency', priority: 'Critical', roi: '180%' },
      'proj-3': { value: '£3.3M', type: 'Revenue Impact', priority: 'High', roi: '420%' },
      'proj-4': { value: '£140K', type: 'Operational Savings', priority: 'Medium', roi: '120%' },
      'proj-5': { value: '£300K', type: 'Strategic Investment', priority: 'High', roi: '200%' }
    }
    return impacts[projectId as keyof typeof impacts] || { value: 'TBD', type: 'Business Value', priority: 'Medium', roi: 'TBD' }
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return { color: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' }
      case 'High':
        return { color: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700' }
      case 'Medium':
        return { color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' }
      default:
        return { color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' }
    }
  }

  const getProjectRequirement = (projectId: string) => {
    if (projectId === 'proj-3') return 'premium'
    if (projectId === 'proj-1' || projectId === 'proj-4') return 'premium'
    return 'enterprise'
  }

  const filteredProjects = projects.filter(project => {
    if (selectedFilter === 'all') return true
    return project.complexity.toLowerCase() === selectedFilter
  })

      return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Professional Header */}
      <div className="relative bg-white dark:bg-gray-800 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 dark:from-indigo-400/10 dark:to-purple-400/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Professional Training Projects
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Master business analysis through immersive, real-world case studies designed by industry experts
            </p>
            
            {/* Key Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Used by 10,000+ BAs globally</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Industry-validated scenarios</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Proven learning outcomes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filter Section */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Choose Your Project</h2>
            <p className="text-slate-600 dark:text-slate-400">Select a complexity level that matches your experience</p>
          </div>
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-1 shadow-sm">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'beginner', label: 'Beginner' },
              { id: 'intermediate', label: 'Intermediate' },
              { id: 'advanced', label: 'Advanced' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFilter === filter.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
          {filteredProjects.map((project) => {
            const complexityConfig = getComplexityConfig(project.complexity)
            const businessImpact = getBusinessImpact(project.id)
            const priorityConfig = getPriorityConfig(businessImpact.priority)
            const requiredTier = getProjectRequirement(project.id)
            const isAccessible = true
            const isSelected = studentSubscription?.selected_project_id === project.id
            
            return (
              <div key={project.id} className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 ${
                isSelected ? 'ring-2 ring-indigo-500 shadow-md' : 'shadow-sm'
              }`}>
                
                {/* Project Header */}
                <div className="p-6">
                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-indigo-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Active
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" 
                        style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed" 
                       style={{ 
                         display: '-webkit-box',
                         WebkitLineClamp: 3,
                         WebkitBoxOrient: 'vertical',
                         overflow: 'hidden'
                       }}>
                      {project.description}
                    </p>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${complexityConfig.badge}`}>
                      {project.complexity}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${priorityConfig.color}`}>
                      {businessImpact.priority} Priority
                    </span>
                    {requiredTier !== 'free' && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                        {requiredTier === 'premium' ? (
                          <>
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </>
                        ) : (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Enterprise
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewBrief(project)}
                    disabled={!isAccessible}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    <span>{isSelected ? 'Continue Project' : 'View Details'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>



        {/* Professional Framework Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 p-8 md:p-12 shadow-sm">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Industry-Leading Training Framework</h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Our methodology follows BABOK® standards and industry best practices, trusted by business analysts worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Requirements Mastery</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Master advanced elicitation techniques, analysis methods, and documentation following BABOK® standards
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Stakeholder Excellence</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Develop expert-level skills in stakeholder management, influence mapping, and conflict resolution
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Professional Delivery</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Create executive-ready deliverables using industry-standard templates and communication strategies
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectsView