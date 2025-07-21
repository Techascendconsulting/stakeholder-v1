import React, { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { Clock, Users, ArrowRight, Target, TrendingUp, DollarSign, AlertTriangle, Building2, Calendar, Star, Lock, Crown, Plus } from 'lucide-react'

const ProjectsView: React.FC = () => {
  const { projects, selectProject, setCurrentView, studentSubscription, canAccessProject, user } = useApp()

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleViewBrief = async (project: any) => {
    try {
      // Temporary bypass: Allow access to all projects
      // if (!canAccessProject(project.id)) {
      //   alert('This project is not available in your current plan. Please upgrade to access more projects.')
      //   return
      // }
      
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
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: Target,
          description: 'Foundation Level'
        }
      case 'Intermediate':
        return {
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: TrendingUp,
          description: 'Professional Level'
        }
      case 'Advanced':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: Star,
          description: 'Expert Level'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Target,
          description: 'Standard Level'
        }
    }
  }

  const getBusinessImpact = (projectId: string) => {
    const impacts = {
      'proj-1': { value: '£1.8M', type: 'Annual Cost Savings', priority: 'High' },
      'proj-2': { value: '£250K', type: 'Process Efficiency', priority: 'Critical' },
      'proj-3': { value: '£3.3M', type: 'Revenue Impact', priority: 'High' },
      'proj-4': { value: '£140K', type: 'Operational Savings', priority: 'Medium' },
      'proj-5': { value: '£300K', type: 'Strategic Investment', priority: 'High' }
    }
    return impacts[projectId as keyof typeof impacts] || { value: 'TBD', type: 'Business Value', priority: 'Medium' }
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return { color: 'text-red-600 bg-red-50 border-red-200', icon: AlertTriangle }
      case 'High':
        return { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: TrendingUp }
      case 'Medium':
        return { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Target }
      default:
        return { color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Target }
    }
  }

  const getSubscriptionIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Star className="w-4 h-4 text-yellow-500" />
      case 'enterprise':
        return <Crown className="w-4 h-4 text-purple-500" />
      default:
        return null
    }
  }

  const getProjectRequirement = (projectId: string) => {
    // First project is free, others require premium/enterprise
    if (projectId === 'proj-3') return 'free' // Inventory Management - beginner level
    if (projectId === 'proj-1' || projectId === 'proj-4') return 'premium'
    return 'enterprise'
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">Business Analysis Training Projects</h1>
            <p className="text-lg text-gray-600">Professional Development Portfolio</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl">
              Select a project to begin your comprehensive Business Analysis training. Each project provides 
              real-world scenarios with stakeholder interviews, requirements gathering, and deliverable creation. 
              <span className="font-semibold text-gray-900"> Projects are based on actual industry case studies</span> and 
              designed to build essential BA competencies.
            </p>
          </div>
        </div>

        {/* Enhanced Project Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
          {projects.map((project) => {
            const complexityConfig = getComplexityConfig(project.complexity)
            const businessImpact = getBusinessImpact(project.id)
            const priorityConfig = getPriorityConfig(businessImpact.priority)
            const requiredTier = getProjectRequirement(project.id)
            const isAccessible = true // Temporary bypass: All projects accessible
            const isSelected = studentSubscription?.selected_project_id === project.id
            
            return (
              <div key={project.id} className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 group relative ${
                isAccessible ? 'hover:shadow-lg' : 'opacity-75'
              } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                
                {/* Lock overlay for inaccessible projects */}
                {!isAccessible && (
                  <div className="absolute inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-10 rounded-2xl">
                    <div className="text-center p-6">
                      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {requiredTier === 'premium' ? 'Premium' : 'Enterprise'} Required
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Upgrade to access this project
                      </p>
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Selected badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium z-20">
                    Selected
                  </div>
                )}

                {/* Project Header */}
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </h3>
                        {getSubscriptionIcon(requiredTier)}
                      </div>
                      <div className="flex items-center space-x-3 mb-4">
                        <span className={`inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold rounded-full border ${complexityConfig.color}`}>
                          <complexityConfig.icon className="w-4 h-4" />
                          <span>{project.complexity}</span>
                        </span>
                        <span className={`inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-full border ${priorityConfig.color}`}>
                          <priorityConfig.icon className="w-3 h-3" />
                          <span>{businessImpact.priority} Priority</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-base leading-relaxed line-clamp-3 mb-6">{project.description}</p>
                </div>

                {/* Project Metrics */}
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Project Duration</p>
                          <p className="text-lg font-bold text-gray-900">{project.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Stakeholders</p>
                          <p className="text-lg font-bold text-gray-900">5 Key Roles</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Business Impact</p>
                          <p className="text-lg font-bold text-gray-900">{businessImpact.value}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Focus Area</p>
                          <p className="text-lg font-bold text-gray-900">{businessImpact.type}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Outcomes Preview */}
                <div className="px-8 py-6 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Key Learning Outcomes</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-gray-700 font-medium">Stakeholder interview techniques</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-sm text-gray-700 font-medium">Requirements elicitation & documentation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      <span className="text-sm text-gray-700 font-medium">Professional deliverable creation</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-6">
                  <button
                    onClick={() => handleViewBrief(project)}
                    disabled={!isAccessible}
                    className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md group ${
                      isAccessible 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{isSelected ? 'Continue Project' : 'View Project Brief'}</span>
                    {isAccessible && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Create Custom Project */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-dashed border-purple-300 rounded-2xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Your Own Project</h3>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              Already a BA with your own project? Describe your context and practice stakeholder interviews 
              with AI stakeholders who will adapt to your specific scenario.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Describe Your Project</p>
                <p className="text-xs text-gray-600 mt-1">Context, goals, stakeholders</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <p className="text-sm font-medium text-gray-900">AI Generates Questions</p>
                <p className="text-xs text-gray-600 mt-1">Tailored to your scenario</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-emerald-200">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-emerald-600 font-bold">3</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Practice Interviews</p>
                <p className="text-xs text-gray-600 mt-1">With adaptive AI stakeholders</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('custom-project')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create Custom Project
            </button>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Or access this feature from the sidebar: <span className="font-semibold">Create Your Own Project</span>
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        {studentSubscription && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Current Plan: {studentSubscription.subscription_tier?.charAt(0).toUpperCase() + studentSubscription.subscription_tier?.slice(1) || 'Loading...'}
                </h3>
                <p className="text-gray-600">
                  {studentSubscription.subscription_tier === 'free' && `${2 - (studentSubscription.meeting_count || 0)} meetings remaining`}
                  {studentSubscription.subscription_tier === 'premium' && 'Access to 2 projects with unlimited meetings'}
                  {studentSubscription.subscription_tier === 'enterprise' && 'Full access to all features'}
                </p>
              </div>
              {studentSubscription.subscription_tier === 'free' && (
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Professional Training Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional Development Framework</h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive training methodology follows industry best practices and prepares you for real-world BA challenges
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Requirements Analysis</h4>
              <p className="text-gray-600 leading-relaxed">
                Master stakeholder interview techniques, requirements elicitation methodologies, and documentation best practices following BABOK® standards
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Stakeholder Management</h4>
              <p className="text-gray-600 leading-relaxed">
                Develop advanced skills in stakeholder identification, influence mapping, communication strategies, and conflict resolution techniques
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Deliverable Creation</h4>
              <p className="text-gray-600 leading-relaxed">
                Create professional BRDs, user stories, acceptance criteria, and process documentation using industry-standard templates and formats
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Learning Objectives */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Comprehensive Learning Objectives</h3>
            <p className="text-lg text-gray-700">
              Upon completion, you will have demonstrated proficiency in core BA competencies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Stakeholder Engagement Excellence</h4>
                  <p className="text-gray-700">Conduct effective stakeholder interviews and requirements gathering sessions using proven methodologies</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Process Analysis & Optimization</h4>
                  <p className="text-gray-700">Analyze business processes and identify improvement opportunities using structured analysis techniques</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Professional Documentation</h4>
                  <p className="text-gray-700">Create comprehensive business requirements documentation following industry standards and best practices</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Agile Requirements Management</h4>
                  <p className="text-gray-700">Develop user stories and acceptance criteria following industry standards and agile methodologies</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">5</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Strategic Business Analysis</h4>
                  <p className="text-gray-700">Apply structured analysis techniques to complex business problems and present solutions to senior stakeholders</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">6</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Executive Communication</h4>
                  <p className="text-gray-700">Present findings and recommendations to senior stakeholders with confidence and professional clarity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectsView