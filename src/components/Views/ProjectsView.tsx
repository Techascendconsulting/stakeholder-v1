import React, { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { Clock, Users, ArrowRight, Target, TrendingUp, DollarSign, AlertTriangle, Building2, Calendar, Star, Lock, Crown, Plus, BookOpen, Award, CheckCircle, Zap, Globe, Filter, Sparkles, Brain, Trophy, ChevronRight, PlayCircle, Briefcase, Code, Lightbulb, Search, SortAsc, Grid3X3, List, Eye, Clock3, Flame, Shield, ArrowUpRight, Info } from 'lucide-react'

const ProjectsView: React.FC = () => {
  const { projects, selectProject, setCurrentView, studentSubscription, canAccessProject, user, meetings } = useApp()
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'complexity' | 'priority' | 'impact'>('complexity')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetails, setShowDetails] = useState<string | null>(null)

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
      setCurrentView('project-setup')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const getComplexityConfig = (complexity: string) => {
    switch (complexity) {
      case 'Beginner':
        return {
          color: 'from-emerald-400 to-emerald-600',
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          icon: Target,
          description: 'Perfect Starting Point',
          iconBg: 'bg-emerald-500'
        }
      case 'Intermediate':
        return {
          color: 'from-blue-400 to-blue-600',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: Brain,
          description: 'Level Up Your Skills',
          iconBg: 'bg-blue-500'
        }
      case 'Advanced':
        return {
          color: 'from-purple-400 to-purple-600',
          textColor: 'text-purple-700',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          icon: Trophy,
          description: 'Master-Level Challenge',
          iconBg: 'bg-purple-500'
        }
      default:
        return {
          color: 'from-slate-400 to-slate-600',
          textColor: 'text-slate-700',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          icon: Star,
          description: 'Standard Level',
          iconBg: 'bg-slate-500'
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
        return { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' }
      case 'High':
        return { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' }
      case 'Medium':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' }
      default:
        return { color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' }
    }
  }

  const getProjectRequirement = (projectId: string) => {
    if (projectId === 'proj-3') return 'premium'
    if (projectId === 'proj-1' || projectId === 'proj-4') return 'premium'
    return 'enterprise'
  }

  const getProjectIcon = (projectId: string) => {
    const icons = {
      'proj-1': Building2,
      'proj-2': TrendingUp,
      'proj-3': Target,
      'proj-4': Code,
      'proj-5': Lightbulb
    }
    return icons[projectId as keyof typeof icons] || Briefcase
  }

  // Enhanced filtering and sorting logic
  const filteredProjects = projects
    .filter(project => {
      // Filter by complexity
      if (selectedFilter !== 'all' && project.complexity.toLowerCase() !== selectedFilter) return false
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.complexity.toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })
    .sort((a, b) => {
      const aImpact = getBusinessImpact(a.id)
      const bImpact = getBusinessImpact(b.id)
      
      switch (sortBy) {
        case 'complexity':
          const complexityOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 }
          return complexityOrder[a.complexity as keyof typeof complexityOrder] - complexityOrder[b.complexity as keyof typeof complexityOrder]
        case 'priority':
          const priorityOrder = { 'Critical': 1, 'High': 2, 'Medium': 3 }
          return priorityOrder[aImpact.priority as keyof typeof priorityOrder] - priorityOrder[bImpact.priority as keyof typeof priorityOrder]
        case 'impact':
          return parseFloat(bImpact.value.replace(/[£$,]/g, '')) - parseFloat(aImpact.value.replace(/[£$,]/g, ''))
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Select Your Challenge Level</h2>
            <p className="text-lg text-slate-600 dark:text-gray-300">Choose the complexity that matches your experience and goals</p>
          </div>
          
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-2 shadow-lg">
            {[
              { id: 'all', label: 'All Projects', icon: Globe },
              { id: 'beginner', label: 'Beginner', icon: Target },
              { id: 'intermediate', label: 'Intermediate', icon: Brain },
              { id: 'advanced', label: 'Advanced', icon: Trophy }
            ].map((filter) => {
              const Icon = filter.icon
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedFilter === filter.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {filteredProjects.map((project) => {
            const complexityConfig = getComplexityConfig(project.complexity)
            const businessImpact = getBusinessImpact(project.id)
            const priorityConfig = getPriorityConfig(businessImpact.priority)
            const requiredTier = getProjectRequirement(project.id)
            const isAccessible = true
            const isSelected = studentSubscription?.selected_project_id === project.id
            const hasMeetings = meetings.some(m => m.project_id === project.id)
            const ProjectIcon = getProjectIcon(project.id)
            const ComplexityIcon = complexityConfig.icon
            const isHovered = hoveredProject === project.id
            
            return (
              <div
                key={project.id}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                className={`group relative bg-white dark:bg-gray-800 rounded-3xl border overflow-hidden transition-all duration-500 transform hover:scale-105 hover:shadow-2xl ${
                  isSelected 
                    ? 'ring-4 ring-indigo-500 shadow-2xl border-indigo-200 dark:border-indigo-700' 
                    : 'border-slate-200 dark:border-gray-700 shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700'
                } ${isHovered ? 'shadow-2xl' : ''}`}
              >
                {/* Project Header with Gradient */}
                <div className={`relative p-8 bg-gradient-to-r ${complexityConfig.color} text-white overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
                  
                  <div className="relative z-10">
                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-bl-2xl text-xs font-bold">
                        ACTIVE
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-12 h-12 ${complexityConfig.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <ProjectIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <ComplexityIcon className="w-4 h-4" />
                          <span className="text-sm font-medium opacity-90">{project.complexity}</span>
                        </div>
                        <div className="text-xs opacity-75">{complexityConfig.description}</div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 leading-tight">
                      {project.name}
                    </h3>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-8">
                  <p className="text-slate-600 dark:text-gray-300 mb-6 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                  
                  {/* Impact Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-slate-500">Business Impact</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">{businessImpact.value}</div>
                      <div className="text-xs text-slate-600 dark:text-gray-300">{businessImpact.type}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-slate-500">ROI Potential</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">{businessImpact.roi}</div>
                      <div className="text-xs text-slate-600 dark:text-gray-300">Expected Return</div>
                    </div>
                  </div>
                  
                  {/* Priority Badge */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${priorityConfig.color} dark:border-gray-600`}>
                      <div className={`w-2 h-2 ${priorityConfig.dot} rounded-full`}></div>
                      <span>{businessImpact.priority} Priority</span>
                    </div>
                    
                    {requiredTier !== 'free' && (
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-xs font-medium border border-amber-300">
                        {requiredTier === 'premium' ? (
                          <>
                            <Star className="w-3 h-3" />
                            <span>Premium</span>
                          </>
                        ) : (
                          <>
                            <Crown className="w-3 h-3" />
                            <span>Enterprise</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewBrief(project)}
                    disabled={!isAccessible}
                    className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 group shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                      isHovered ? 'shadow-2xl' : ''
                    }`}
                  >
                    <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>{hasMeetings ? 'Continue Project' : 'Start Project'}</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-12 text-center text-white shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your BA Skills?</h3>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of business analysts who have accelerated their careers through our immersive training platform.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-lg">Real-world scenarios</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-lg">AI-powered feedback</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-lg">Industry recognition</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectsView