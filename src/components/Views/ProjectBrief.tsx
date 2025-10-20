import React, { useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { ArrowLeft, Target, AlertCircle, GitBranch, CheckCircle, Users, ArrowRight, Building, Telescope as Scope, XCircle, Clock, DollarSign, TrendingUp, BarChart3, Sparkles, Zap, Award, Shield, Lightbulb, BookOpen, Star, ChevronRight, PlayCircle, Trophy, Flame, Eye, Info } from 'lucide-react'

const ProjectBrief: React.FC = () => {
  const { selectedProject, setCurrentView } = useApp()

  // Scroll to top when component mounts
  useEffect(() => {
    // The main content area is the scrolling container, not the window
    const scrollToTop = () => {
      // Find the main scrolling container
      const mainContainer = document.querySelector('main')
      if (mainContainer) {
        mainContainer.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        })
        // Fallback
        mainContainer.scrollTop = 0
      }
      
      // Also scroll window just in case
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      })
    }
    
    // Execute immediately and after short delays to ensure it works
    scrollToTop()
    setTimeout(scrollToTop, 0)
    setTimeout(scrollToTop, 50)
  }, [])

  if (!selectedProject) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No project selected</p>
          <button 
            onClick={() => setCurrentView('projects')}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
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

  // Get business impact data (moved from ProjectsView)
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

  const businessImpact = getBusinessImpact(selectedProject.id)

  // Extract stakeholder information
  const stakeholderRoles = [
    { role: "Operations Leadership", concern: "Process efficiency and resource optimization" },
    { role: "Customer Service Management", concern: "Service quality and customer satisfaction impact" },
    { role: "IT Systems Team", concern: "Technical feasibility and system integration requirements" },
    { role: "Human Resources", concern: "Change management and employee training needs" },
    { role: "Compliance and Risk", concern: "Regulatory adherence and risk mitigation strategies" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header with Breadcrumbs & Back Button */}
        <div className="mb-10">
          {/* Back Button & Continue Button */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('projects')}
              className="flex items-center space-x-2 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Project Selection</span>
            </button>
            
            <button
              onClick={() => setCurrentView('stage-selection')}
              className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span>Continue to Stage Selection</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Project Title Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-3xl shadow-lg border border-blue-200/50 dark:border-blue-800/50 p-10 mb-10">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative">
            <div className="text-center mb-8">
              {/* Project Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent mb-6">
                {selectedProject.name}
              </h1>
              
              {/* Enhanced Project Badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full border border-blue-200 dark:border-blue-800">
                  <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {selectedProject.complexity} Complexity
                  </span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    {selectedProject.duration}
                  </span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/50 dark:to-violet-900/50 rounded-full border border-purple-200 dark:border-purple-800">
                  <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    Training Scenario
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700/20">
              <p className="text-xl text-gray-700 dark:text-gray-300 text-center leading-relaxed font-medium">
                {selectedProject.description}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Project Metrics */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl shadow-lg border border-indigo-200/50 dark:border-indigo-800/50 p-10 mb-10">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-400/20 to-pink-400/20 rounded-full translate-x-20 translate-y-20"></div>
          
          <div className="relative">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Project Impact Overview</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Key metrics and business impact for this training scenario
              </p>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Duration */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8 shadow-lg border border-blue-200/50 dark:border-blue-800/50 text-center group hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3">Duration</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedProject.duration}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Training Timeline</p>
              </div>
            </div>

            {/* Business Impact */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-8 shadow-lg border border-emerald-200/50 dark:border-emerald-800/50 text-center group hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-3">Business Impact</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{businessImpact.value}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{businessImpact.type}</p>
              </div>
            </div>

            {/* Stakeholders */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-8 shadow-lg border border-purple-200/50 dark:border-purple-800/50 text-center group hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-3">Stakeholders</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">5</p>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Key Roles</p>
              </div>
            </div>

            {/* Expected ROI */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-8 shadow-lg border border-orange-200/50 dark:border-orange-800/50 text-center group hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-sm font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider mb-3">Expected ROI</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{businessImpact.roi}</p>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Return on Investment</p>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Enhanced Project Brief Sections */}
        <div className="space-y-10">
          {/* Business Context */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-blue-900/10 dark:to-indigo-900/10 rounded-3xl shadow-lg border border-blue-200/50 dark:border-blue-800/50 p-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Business Context</h2>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">Understanding the organizational landscape</p>
                </div>
              </div>
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700/20">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-medium">{selectedProject.businessContext}</p>
              </div>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-red-50 to-orange-50 dark:from-gray-800 dark:via-red-900/10 dark:to-orange-900/10 rounded-3xl shadow-lg border border-red-200/50 dark:border-red-800/50 p-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="relative">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Problem Statement</h2>
                  <p className="text-red-600 dark:text-red-400 font-medium">Identifying the core challenges to address</p>
                </div>
              </div>
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700/20">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-medium">{selectedProject.problemStatement}</p>
              </div>
            </div>
          </div>

          {/* Business Goals */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50 to-green-50 dark:from-gray-800 dark:via-emerald-900/10 dark:to-green-900/10 rounded-3xl shadow-lg border border-emerald-200/50 dark:border-emerald-800/50 p-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Business Goals</h2>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">Strategic objectives to achieve</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedProject.businessGoals.map((goal, index) => (
                  <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full -translate-y-8 translate-x-8"></div>
                    <div className="relative flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-white text-lg font-bold">{index + 1}</span>
                      </div>
                      <span className="text-gray-800 dark:text-gray-200 font-semibold leading-relaxed text-lg">{goal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scope of Work */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* In Scope */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-emerald-900/10 dark:to-teal-900/10 rounded-3xl shadow-lg border border-emerald-200/50 dark:border-emerald-800/50 p-10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -translate-y-12 translate-x-12"></div>
              <div className="relative">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Scope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">In Scope</h2>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">What's included</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {inScope.map((item, index) => (
                    <div key={index} className="group flex items-start space-x-4 p-4 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-md transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Out of Scope */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-red-50 to-pink-50 dark:from-gray-800 dark:via-red-900/10 dark:to-pink-900/10 rounded-3xl shadow-lg border border-red-200/50 dark:border-red-800/50 p-10">
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full -translate-x-12 -translate-y-12"></div>
              <div className="relative">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <XCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Out of Scope</h2>
                    <p className="text-red-600 dark:text-red-400 font-medium">What's excluded</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {outOfScope.map((item, index) => (
                    <div key={index} className="group flex items-start space-x-4 p-4 bg-red-50/50 dark:bg-red-900/20 rounded-xl border border-red-200/50 dark:border-red-800/50 hover:shadow-md transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Systems Involved */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50 to-violet-50 dark:from-gray-800 dark:via-purple-900/10 dark:to-violet-900/10 rounded-3xl shadow-lg border border-purple-200/50 dark:border-purple-800/50 p-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-violet-400/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <GitBranch className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Systems Involved</h2>
                  <p className="text-purple-600 dark:text-purple-400 font-medium">Technology landscape and integrations</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemsInvolved.map((system, index) => (
                  <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full -translate-y-6 translate-x-6"></div>
                    <div className="relative flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                      <span className="text-gray-800 dark:text-gray-200 font-semibold leading-relaxed">{system}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* As-Is Business Process */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-orange-50 to-amber-50 dark:from-gray-800 dark:via-orange-900/10 dark:to-amber-900/10 rounded-3xl shadow-lg border border-orange-200/50 dark:border-orange-800/50 p-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-amber-400/10 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="relative">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <GitBranch className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">As-Is Business Process</h2>
                  <p className="text-orange-600 dark:text-orange-400 font-medium">Current state process flow</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200/50 dark:border-orange-800/50 rounded-2xl p-8 backdrop-blur-sm">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-medium">{selectedProject.asIsProcess}</p>
              </div>
            </div>
          </div>

          {/* Stakeholder Identification */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50 to-blue-50 dark:from-gray-800 dark:via-indigo-900/10 dark:to-blue-900/10 rounded-3xl shadow-lg border border-indigo-200/50 dark:border-indigo-800/50 p-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Stakeholder Identification</h2>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium">Key roles and their concerns</p>
                </div>
              </div>
              <div className="space-y-6">
                {stakeholderRoles.map((stakeholder, index) => (
                  <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-indigo-200/50 dark:border-indigo-800/50 hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full -translate-y-8 translate-x-8"></div>
                    <div className="relative flex items-start space-x-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{stakeholder.role}</h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{stakeholder.concern}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Next Steps */}
        <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-3xl p-12 shadow-lg">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-purple-400/10 to-pink-400/10 rounded-full translate-x-24 translate-y-24"></div>
          
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-8 shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Ready to Begin Your Journey?</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-10 text-xl leading-relaxed max-w-4xl mx-auto">
              Now that you have reviewed the comprehensive project brief, you're ready to begin stakeholder engagement. 
              Use this information to prepare targeted questions for each stakeholder group, focusing on their specific 
              concerns and areas of expertise. Remember to validate the information presented here and gather additional 
              details that will inform your requirements analysis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => setCurrentView('stakeholders')}
                className="group flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-5 px-10 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Users className="w-7 h-7 group-hover:scale-110 transition-transform" />
                <span className="text-lg">Meet Stakeholders</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setCurrentView('deliverables')}
                className="group flex items-center justify-center space-x-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-5 px-10 rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <BookOpen className="w-7 h-7 group-hover:scale-110 transition-transform" />
                <span className="text-lg">View Deliverables</span>
              </button>
            </div>
          </div>

          {/* Stakeholder Identification */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
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
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{stakeholder.role}</h4>
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
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Next Steps</h3>
          <p className="text-gray-700 mb-8 text-lg leading-relaxed">
            Now that you have reviewed the comprehensive project brief, you're ready to begin stakeholder engagement. 
            Use this information to prepare targeted questions for each stakeholder group, focusing on their specific 
            concerns and areas of expertise. Remember to validate the information presented here and gather additional 
            details that will inform your requirements analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setCurrentView('stage-selection')}
              className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span>Continue to Stage Selection</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectBrief