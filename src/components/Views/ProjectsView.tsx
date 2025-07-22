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
          color: 'bg-slate-50 text-slate-700 border border-slate-200',
          badge: 'bg-slate-100 text-slate-800',
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
        return { color: 'bg-red-100 text-red-700 border-red-200' }
      case 'High':
        return { color: 'bg-orange-100 text-orange-700 border-orange-200' }
      case 'Medium':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200' }
      default:
        return { color: 'bg-slate-100 text-slate-700 border-slate-200' }
    }
  }

  const getProjectRequirement = (projectId: string) => {
    if (projectId === 'proj-3') return 'free'
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
      <div className="relative bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {filteredProjects.map((project) => {
            const complexityConfig = getComplexityConfig(project.complexity)
            const businessImpact = getBusinessImpact(project.id)
            const priorityConfig = getPriorityConfig(businessImpact.priority)
            const requiredTier = getProjectRequirement(project.id)
            const isAccessible = true
            const isSelected = studentSubscription?.selected_project_id === project.id
            
            return (
              <div key={project.id} className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-400/10 hover:-translate-y-1 ${
                isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : ''
              }`}>
                
                {/* Project Header */}
                <div className="relative p-8 bg-gradient-to-br from-slate-50 to-white dark:from-gray-700 dark:to-gray-800">
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                      ✓ Active Project
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{project.description}</p>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-full ${complexityConfig.badge}`}>
                          {project.complexity}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full border ${priorityConfig.color}`}>
                          {businessImpact.priority} Priority
                        </span>
                        {requiredTier !== 'free' && (
                          <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            {requiredTier === 'premium' ? (
                              <>
                                <Star className="w-4 h-4 mr-1" />
                                Premium
                              </>
                            ) : (
                              <>
                                <Crown className="w-4 h-4 mr-1" />
                                Enterprise
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Metrics */}
                <div className="px-8 py-6 bg-slate-50/50 border-y border-slate-100">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Duration</p>
                          <p className="text-lg font-bold text-slate-900">{project.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Business Impact</p>
                          <p className="text-lg font-bold text-slate-900">{businessImpact.value}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Stakeholders</p>
                          <p className="text-lg font-bold text-slate-900">5 Key Roles</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Expected ROI</p>
                          <p className="text-lg font-bold text-slate-900">{businessImpact.roi}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Outcomes */}
                <div className="px-8 py-6">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">What You'll Master</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm text-slate-600 font-medium">Advanced stakeholder interview techniques</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm text-slate-600 font-medium">Requirements elicitation & documentation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm text-slate-600 font-medium">Professional deliverable creation</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-8 pb-8">
                  <button
                    onClick={() => handleViewBrief(project)}
                    disabled={!isAccessible}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-sm hover:shadow-lg group hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02]"
                  >
                    <span>{isSelected ? 'Continue Project' : 'Start Project'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Create Custom Project Section */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/50 rounded-3xl p-8 md:p-12 mb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-8 shadow-lg">
              <Plus className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Create Your Custom Project</h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Already working on a project? Create AI stakeholders tailored to your specific business context and practice your interview skills.
            </p>
            
            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-lg">1</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Define Context</h4>
                <p className="text-sm text-slate-600">Describe your project, goals, and business requirements</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-600 font-bold text-lg">2</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">AI Generation</h4>
                <p className="text-sm text-slate-600">Our AI creates realistic stakeholders for your scenario</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-600 font-bold text-lg">3</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Practice & Improve</h4>
                <p className="text-sm text-slate-600">Conduct interviews and receive feedback</p>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentView('custom-project')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-10 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center space-x-3"
            >
              <span>Create Custom Project</span>
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Professional Framework Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Industry-Leading Training Framework</h3>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Our methodology follows BABOK® standards and industry best practices, trusted by business analysts worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Requirements Mastery</h4>
              <p className="text-slate-600 leading-relaxed">
                Master advanced elicitation techniques, analysis methods, and documentation following BABOK® standards
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Stakeholder Excellence</h4>
              <p className="text-slate-600 leading-relaxed">
                Develop expert-level skills in stakeholder management, influence mapping, and conflict resolution
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Professional Delivery</h4>
              <p className="text-slate-600 leading-relaxed">
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