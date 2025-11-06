import React, { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { Clock, Users, ArrowRight, Target, TrendingUp, DollarSign, AlertTriangle, Building2, Calendar, Star, Lock, Crown, Plus, BookOpen, Award, CheckCircle, Zap, Globe, Filter, Sparkles, Brain, Trophy, ChevronRight, PlayCircle, Briefcase, Code, Lightbulb, Search, SortAsc, Grid3X3, List, Eye, Clock3, Flame, Shield, ArrowUpRight, Info, XCircle, ArrowLeft } from 'lucide-react'

const ProjectsView: React.FC = () => {
  const { 
    projects, 
    selectProject, 
    setCurrentView, 
    studentSubscription, 
    canAccessProject, 
    user, 
    meetings,
    userSubscription,
    userProjectCount,
    userSelectedProjects,
    selectedProject
  } = useApp()
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'complexity' | 'priority' | 'impact'>('complexity')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showContactMessage, setShowContactMessage] = useState(false)

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
      console.log('🎯 PROJECTS VIEW: User selected project =', project.name);
      await selectProject(project)
      console.log('✅ PROJECTS VIEW: selectProject completed for =', project.name);
      setCurrentView('project-brief')
    } catch (error) {
      // Show upgrade modal if project limit reached
      if (error instanceof Error && error.message.includes('project limit')) {
        setShowUpgradeModal(true)
      } else {
        alert(error instanceof Error ? error.message : 'An error occurred')
      }
    }
  }
  
  const maxProjects = userSubscription?.maxProjects || 1
  const projectCount = userProjectCount || 0
  const selectedProjectIds = userSelectedProjects || []
  
  console.log('🔍 ProjectsView: userSubscription =', userSubscription);
  console.log('🔍 ProjectsView: projectCount =', projectCount);
  console.log('🔍 ProjectsView: selectedProjectIds =', selectedProjectIds);
  console.log('🔍 ProjectsView: maxProjects =', maxProjects);
  
  const isProjectLocked = (projectId: string) => {
    // Project is locked if user hasn't selected it AND they've reached their limit
    const locked = !selectedProjectIds.includes(projectId) && projectCount >= maxProjects;
    console.log(`🔍 ProjectsView: isProjectLocked(${projectId}) =`, locked, '| selected:', selectedProjectIds.includes(projectId), '| count:', projectCount, '>=', maxProjects);
    return locked;
  }

  const getProjectColorScheme = (projectId: string) => {
    const colorSchemes = {
      'proj-1': {
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
        header: 'from-emerald-400 to-emerald-600',
        accent: 'emerald',
        icon: 'bg-emerald-500',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        cardBg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
        border: 'border-emerald-200 dark:border-emerald-700'
      },
      'proj-2': {
        gradient: 'from-blue-500 via-indigo-500 to-purple-500',
        header: 'from-blue-400 to-blue-600',
        accent: 'blue',
        icon: 'bg-blue-500',
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
        cardBg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
        border: 'border-blue-200 dark:border-blue-700'
      },
      'proj-3': {
        gradient: 'from-purple-500 via-pink-500 to-rose-500',
        header: 'from-purple-400 to-purple-600',
        accent: 'purple',
        icon: 'bg-purple-500',
        badge: 'bg-purple-100 text-purple-700 border-purple-200',
        cardBg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
        border: 'border-purple-200 dark:border-purple-700'
      },
      'proj-4': {
        gradient: 'from-orange-500 via-red-500 to-pink-500',
        header: 'from-orange-400 to-orange-600',
        accent: 'orange',
        icon: 'bg-orange-500',
        badge: 'bg-orange-100 text-orange-700 border-orange-200',
        cardBg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
        border: 'border-orange-200 dark:border-orange-700'
      },
      'proj-5': {
        gradient: 'from-violet-500 via-purple-500 to-indigo-500',
        header: 'from-violet-400 to-violet-600',
        accent: 'violet',
        icon: 'bg-violet-500',
        badge: 'bg-violet-100 text-violet-700 border-violet-200',
        cardBg: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20',
        border: 'border-violet-200 dark:border-violet-700'
      }
    }
    return colorSchemes[projectId as keyof typeof colorSchemes] || {
      gradient: 'from-teal-500 via-cyan-500 to-blue-500',
      header: 'from-teal-400 to-teal-600',
      accent: 'teal',
      icon: 'bg-teal-500',
      badge: 'bg-teal-100 text-teal-700 border-teal-200',
      cardBg: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
      border: 'border-teal-200 dark:border-teal-700'
    }
  }

  const getComplexityConfig = (complexity: string) => {
    switch (complexity) {
      case 'Beginner':
        return {
          icon: Target,
          description: 'Perfect Starting Point',
          dot: 'bg-green-500'
        }
      case 'Intermediate':
        return {
          icon: Brain,
          description: 'Level Up Your Skills',
          dot: 'bg-blue-500'
        }
      case 'Advanced':
        return {
          icon: Trophy,
          description: 'Master-Level Challenge',
          dot: 'bg-purple-500'
        }
      default:
        return {
          icon: Star,
          description: 'Standard Level',
          dot: 'bg-slate-500'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Enhanced Header Section with Back Button */}
        <div className="mb-12">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => setCurrentView('project-flow')}
              className="flex items-center space-x-2 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Project Journey</span>
            </button>
          </div>

          {/* Main Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Choose Your Business Challenge
            </h1>
            <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Select from real-world business scenarios designed to accelerate your BA skills. Each project offers hands-on experience with industry-standard practices.
            </p>
            
            {/* Project Limit Counter */}
            {userSubscription && (
              <div className="mt-6 inline-flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border-2 border-indigo-200 dark:border-indigo-800 shadow-sm">
                <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {projectCount}/{maxProjects} Project{maxProjects > 1 ? 's' : ''} Selected
                </span>
                {projectCount >= maxProjects && userSubscription.tier === 'free' && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="ml-2 flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    <Crown className="w-3 h-3" />
                    <span>Upgrade</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Clean Professional Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          
          {/* Simple Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Clean Filter Controls */}
          <div className="flex items-center gap-3">
            
            {/* Complexity Filter */}
            <div className="flex items-center bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg p-1">
              {[
                { id: 'all', label: 'All', count: projects.length },
                { id: 'beginner', label: 'Beginner', count: projects.filter(p => p.complexity === 'Beginner').length },
                { id: 'intermediate', label: 'Intermediate', count: projects.filter(p => p.complexity === 'Intermediate').length },
                { id: 'advanced', label: 'Advanced', count: projects.filter(p => p.complexity === 'Advanced').length }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    selectedFilter === filter.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="complexity">Sort by Complexity</option>
              <option value="priority">Sort by Priority</option>
              <option value="impact">Sort by Impact</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-gray-300'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-slate-600 dark:text-gray-300">
            <span className="font-medium">{filteredProjects.length}</span> project{filteredProjects.length !== 1 ? 's' : ''} found
            {searchTerm && (
              <span className="ml-2 text-sm">for "{searchTerm}"</span>
            )}
          </div>
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No projects found</h3>
              <p className="text-slate-600 dark:text-gray-300">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Project Cards - Enhanced Design */}
        <div className={`${viewMode === 'grid' 
          ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8' 
          : 'space-y-6'
        } mb-16`}>
          {filteredProjects.map((project) => {
            const colorScheme = getProjectColorScheme(project.id)
            const complexityConfig = getComplexityConfig(project.complexity)
            const businessImpact = getBusinessImpact(project.id)
            const priorityConfig = getPriorityConfig(businessImpact.priority)
            const requiredTier = getProjectRequirement(project.id)
            const isAccessible = true
            const isSelected = selectedProject?.id === project.id // Active in current practice flow
            const hasMeetings = meetings.some(m => m.project_id === project.id)
            const ProjectIcon = getProjectIcon(project.id)
            const ComplexityIcon = complexityConfig.icon
            const isHovered = hoveredProject === project.id
            const showFullDetails = showDetails === project.id
            const locked = isProjectLocked(project.id)
            const alreadySelected = selectedProjectIds.includes(project.id)
            
            return (
              <div
                key={project.id}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                className={`group relative ${colorScheme.cardBg} rounded-3xl border-2 overflow-hidden transition-all duration-500 ${
                  locked ? '' : 'transform hover:scale-105 hover:shadow-2xl'
                } ${
                  isSelected 
                    ? `ring-4 ring-${colorScheme.accent}-500 shadow-2xl ${colorScheme.border}` 
                    : `${colorScheme.border} shadow-lg ${!locked && `hover:border-${colorScheme.accent}-400 dark:hover:border-${colorScheme.accent}-500`}`
                } ${isHovered && !locked ? 'shadow-2xl' : ''} ${viewMode === 'list' ? 'flex' : ''} ${locked ? 'opacity-75' : ''}`}
              >
                {/* Lock Overlay for Projects Over Limit */}
                {locked && (
                  <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div className="text-center px-6">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Project Locked</h3>
                      <p className="text-sm text-white/80 mb-4">
                        You've reached your {maxProjects} project limit
                      </p>
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Upgrade to Unlock</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Selected Badge */}
                {alreadySelected && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      <CheckCircle className="w-3 h-3" />
                      <span>SELECTED</span>
                    </div>
                  </div>
                )}
              
                {/* Enhanced Project Header with Unique Colors */}
                <div className={`relative ${viewMode === 'list' ? 'flex-1' : ''} p-6 bg-gradient-to-r ${colorScheme.header} text-white overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
                  <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r ${colorScheme.gradient} opacity-20 rounded-full blur-xl transform -translate-x-12 translate-y-12`}></div>
                  
                  <div className="relative z-10">
                    {/* Status Indicators */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                        alreadySelected ? 'bg-green-400/20 text-green-100 border border-green-300/30' : 'bg-white/10'
                      }`}>
                        {alreadySelected && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                        <span>{alreadySelected ? 'PROJECT SELECTED' : 'READY TO START'}</span>
                      </div>
                      
                      {requiredTier !== 'free' && (
                        <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-white/20 text-xs font-medium">
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
                    
                    {/* Project Icon and Complexity */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-12 h-12 ${colorScheme.icon} rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm`}>
                        <ProjectIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`w-2 h-2 ${complexityConfig.dot} rounded-full`}></div>
                          <span className="text-sm font-medium opacity-90">{project.complexity}</span>
                          <span className="text-xs opacity-75">• {complexityConfig.description}</span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 leading-tight">
                      {project.name}
                    </h3>
                  </div>
                </div>

                {/* Enhanced Project Content */}
                <div className={`${viewMode === 'list' ? 'flex-1' : ''} p-6`}>
                  <p className="text-slate-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {project.description}
                  </p>
                  
                  {/* Key Metrics - Vibrant Colors */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 ${colorScheme.icon} rounded-lg flex items-center justify-center`}>
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{businessImpact.value}</div>
                          <div className="text-xs text-slate-600 dark:text-gray-400">Impact</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{businessImpact.roi}</div>
                          <div className="text-xs text-slate-600 dark:text-gray-400">ROI</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Priority Indicator */}
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                      <div className={`w-2 h-2 ${priorityConfig.dot} rounded-full`}></div>
                      <span>{businessImpact.priority}</span>
                    </div>
                  </div>
                  
                  {/* Detailed Metrics - Progressive Disclosure */}
                  <div className="mb-6">
                    <button
                      onClick={() => setShowDetails(showFullDetails ? null : project.id)}
                      className="flex items-center space-x-2 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                    >
                      <Info className="w-4 h-4" />
                      <span>{showFullDetails ? 'Hide' : 'Show'} details</span>
                      <ArrowUpRight className={`w-4 h-4 transition-transform ${showFullDetails ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showFullDetails && (
                      <div className={`mt-4 p-4 ${colorScheme.cardBg} rounded-xl space-y-3 border ${colorScheme.border}`}>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Business Impact</div>
                            <div className="font-semibold text-slate-900 dark:text-white">{businessImpact.value}</div>
                            <div className="text-xs text-slate-600 dark:text-gray-300">{businessImpact.type}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">ROI Potential</div>
                            <div className="font-semibold text-slate-900 dark:text-white">{businessImpact.roi}</div>
                            <div className="text-xs text-slate-600 dark:text-gray-300">Expected Return</div>
                          </div>
                        </div>
                        <div className={`pt-2 border-t ${colorScheme.border}`}>
                          <div className="text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Project Type</div>
                          <div className="text-sm text-slate-900 dark:text-white">{complexityConfig.description}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Action Button */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleViewBrief(project)}
                      disabled={!isAccessible}
                      className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 group shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isHovered ? 'shadow-2xl' : ''
                      }`}
                    >
                      <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>{alreadySelected ? 'View Project Details' : 'Start Project'}</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    {hasMeetings && (
                      <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
                        <Clock3 className="w-4 h-4" />
                        <span>Last active: {new Date().toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Enhanced Bottom CTA Section */}
        <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 rounded-3xl p-12 text-center text-white shadow-2xl overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform -translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transform translate-x-48 translate-y-48"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            
            <h3 className="text-4xl font-bold mb-4">Ready to Master Business Analysis?</h3>
            <p className="text-xl text-slate-200 mb-8 leading-relaxed">
              Join thousands of professionals who have transformed their careers through our immersive, real-world training platform.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center space-y-3 p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-lg font-medium">Real-world scenarios</span>
                <span className="text-sm text-slate-300">Industry-standard challenges</span>
              </div>
              
              <div className="flex flex-col items-center space-y-3 p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-lg font-medium">AI-powered feedback</span>
                <span className="text-sm text-slate-300">Personalized learning</span>
              </div>
              
              <div className="flex flex-col items-center space-y-3 p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-lg font-medium">Industry recognition</span>
                <span className="text-sm text-slate-300">Career advancement</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>500+ Success Stories</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Industry Certified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>90% Career Growth</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Upgrade to Premium
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You've selected {projectCount} project{projectCount > 1 ? 's' : ''}. Upgrade to Premium to unlock unlimited projects and advanced features!
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Premium Benefits</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Unlimited Projects</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Priority AI Feedback</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Advanced Scenarios</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Certificate of Completion</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    setShowContactMessage(true);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Contact Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contact Admin Confirmation */}
      {showContactMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Contact Admin to Upgrade
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please reach out to your administrator to upgrade your account and unlock more projects.
              </p>
              <button
                onClick={() => setShowContactMessage(false)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsView