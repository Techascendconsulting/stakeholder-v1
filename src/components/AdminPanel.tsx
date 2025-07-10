import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Users, BookOpen, BarChart3, Settings, TrendingUp } from 'lucide-react'

const AdminPanel: React.FC = () => {
  const { user, signOut } = useAuth()

  const stats = [
    {
      title: 'Total Students',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Projects',
      value: '89',
      change: '+8%',
      icon: BookOpen,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Completion Rate',
      value: '78%',
      change: '+5%',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Average Score',
      value: '85',
      change: '+3%',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const recentActivity = [
    { student: 'John Smith', action: 'Completed', project: 'Web Development Portfolio', time: '2 hours ago' },
    { student: 'Sarah Johnson', action: 'Started', project: 'E-commerce Platform', time: '4 hours ago' },
    { student: 'Mike Chen', action: 'Submitted', project: 'Task Management App', time: '6 hours ago' },
    { student: 'Emily Davis', action: 'Completed', project: 'Weather Dashboard', time: '1 day ago' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin: {user?.email}</span>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor student progress and system performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-emerald-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500"> from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.student}</p>
                      <p className="text-sm text-gray-600">
                        {activity.action} <span className="font-medium">{activity.project}</span>
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full text-left p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Manage Students</span>
                </div>
              </button>
              <button className="w-full text-left p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg hover:from-emerald-100 hover:to-teal-100 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium text-gray-900">Create Project</span>
                </div>
              </button>
              <button className="w-full text-left p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-900">View Reports</span>
                </div>
              </button>
              <button className="w-full text-left p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">System Settings</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminPanel