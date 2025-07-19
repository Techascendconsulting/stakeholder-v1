import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { 
  FolderOpen, 
  Users, 
  FileText, 
  Clock,
  TrendingUp,
  CheckCircle,
  Target,
  Award
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const { projects, meetings, deliverables, setCurrentView, userProgress, isLoading, user } = useApp()

  // Use real data from userProgress if available, otherwise fall back to calculated values
  const completedMeetings = userProgress?.total_meetings_conducted || 0
  const totalDeliverables = userProgress?.total_deliverables_created || 0
  const activeProjects = userProgress?.total_projects_started || 0
  const achievements = userProgress?.achievements || []

  const stats = [
    {
      title: 'Available Projects',
      value: projects.length.toString(),
      icon: FolderOpen,
      color: 'from-blue-500 to-blue-600',
      change: '5 comprehensive scenarios',
      description: 'Real-world BA projects'
    },
    {
      title: 'Stakeholder Interviews',
      value: completedMeetings.toString(),
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      change: 'Professional development',
      description: 'Completed sessions'
    },
    {
      title: 'Deliverables Created',
      value: totalDeliverables.toString(),
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      change: 'Industry-standard formats',
      description: 'Professional documents'
    },
    {
      title: 'Training Hours',
      value: (completedMeetings * 2 + totalDeliverables * 3).toString(),
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      change: 'Continuous learning',
      description: 'Skill development time'
    }
  ]

  // Generate dynamic recent activity based on user progress
  const generateRecentActivity = () => {
    const activities = []
    
    if (completedMeetings > 0) {
      activities.push({
        action: 'Completed stakeholder interviews',
        target: `${completedMeetings} session${completedMeetings > 1 ? 's' : ''} total`,
        time: 'Recent activity',
        type: 'meeting'
      })
    }
    
    if (totalDeliverables > 0) {
      activities.push({
        action: 'Created deliverables',
        target: `${totalDeliverables} document${totalDeliverables > 1 ? 's' : ''} generated`,
        time: 'Professional output',
        type: 'deliverable'
      })
    }
    
    if (activeProjects > 0) {
      activities.push({
        action: 'Engaged with projects',
        target: `${activeProjects} training scenario${activeProjects > 1 ? 's' : ''}`,
        time: 'Learning progress',
        type: 'project'
      })
    }
    
    // Add achievements
    achievements.forEach(achievement => {
      activities.push({
        action: 'Earned achievement',
        target: achievement,
        time: 'Well done!',
        type: 'achievement'
      })
    })
    
    // If no real activity, show getting started messages
    if (activities.length === 0) {
      activities.push(
        { action: 'Welcome to', target: 'Business Analyst Training Platform', time: 'Getting started', type: 'welcome' },
        { action: 'Ready to explore', target: 'Professional training scenarios', time: 'Begin your journey', type: 'project' },
        { action: 'Build skills with', target: 'Realistic stakeholder interactions', time: 'Start learning', type: 'meeting' }
      )
    }
    
    return activities.slice(0, 4) // Limit to 4 activities
  }
  
  const recentActivity = generateRecentActivity()

  // Dynamic learning path based on actual progress
  const learningPath = [
    { 
      title: 'Project Analysis', 
      description: 'Review business context and requirements', 
      completed: activeProjects > 0 
    },
    { 
      title: 'Stakeholder Engagement', 
      description: 'Conduct professional interviews', 
      completed: completedMeetings > 0 
    },
    { 
      title: 'Requirements Documentation', 
      description: 'Create comprehensive deliverables', 
      completed: totalDeliverables > 0 
    },
    { 
      title: 'Advanced Practice', 
      description: 'Multiple projects and complex scenarios', 
      completed: completedMeetings >= 3 && totalDeliverables >= 2 
    }
  ]

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Business Analyst Training Dashboard</h1>
          <p className="text-lg text-gray-600">
            Welcome to your professional development platform. Track your progress and continue building essential BA skills.
          </p>
          {user?.email && (
            <p className="text-sm text-gray-500 mt-2">
              Logged in as: {user.email}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading your progress data...</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{stat.title}</p>
                <p className="text-xs text-gray-500 mb-2">{stat.description}</p>
                <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Recent Training Activity</h3>
              <p className="text-sm text-gray-600 mt-1">Your latest learning progress and achievements</p>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'meeting' ? 'bg-blue-100' :
                      activity.type === 'deliverable' ? 'bg-purple-100' :
                      activity.type === 'achievement' ? 'bg-yellow-100' :
                      activity.type === 'welcome' ? 'bg-indigo-100' :
                      'bg-emerald-100'
                    }`}>
                      {activity.type === 'meeting' ? <Users className="w-5 h-5 text-blue-600" /> :
                       activity.type === 'deliverable' ? <FileText className="w-5 h-5 text-purple-600" /> :
                       activity.type === 'achievement' ? <Award className="w-5 h-5 text-yellow-600" /> :
                       activity.type === 'welcome' ? <Target className="w-5 h-5 text-indigo-600" /> :
                       <FolderOpen className="w-5 h-5 text-emerald-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action} <span className="text-blue-600">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Path & Quick Actions */}
          <div className="space-y-6">
            {/* Learning Path */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Learning Path</h3>
                <p className="text-sm text-gray-600 mt-1">Your structured BA development journey</p>
              </div>
              <div className="p-6 space-y-4">
                {learningPath.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                      step.completed ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${step.completed ? 'text-emerald-900' : 'text-gray-900'}`}>
                        {step.title}
                      </p>
                      <p className={`text-xs ${step.completed ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600 mt-1">Continue your professional development</p>
              </div>
              <div className="p-6 space-y-3">
                <button 
                  onClick={() => setCurrentView('projects')}
                  className="w-full text-left p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-200 border border-blue-100"
                >
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Browse Projects</span>
                      <span className="text-xs text-gray-600">Select training scenarios</span>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => setCurrentView('notes')}
                  className="w-full text-left p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 border border-emerald-100"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Review Notes</span>
                      <span className="text-xs text-gray-600">Meeting transcripts</span>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all duration-200 border border-orange-100">
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-orange-600" />
                    <div>
                      <span className="font-semibold text-gray-900 block">View Progress</span>
                      <span className="text-xs text-gray-600">Track achievements</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard