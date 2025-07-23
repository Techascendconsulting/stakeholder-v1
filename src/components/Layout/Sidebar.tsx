import React from 'react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  User, 
  LogOut,
  GraduationCap,
  Plus,
  BookOpen
} from 'lucide-react'
import { AppView } from '../../types'

const Sidebar: React.FC = () => {
  const { currentView, setCurrentView } = useApp()
  const { user, signOut } = useAuth()

  const menuItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'core-concepts' as AppView, label: 'Core Concepts', icon: BookOpen },
    { id: 'projects' as AppView, label: 'Training Projects', icon: FolderOpen },
    { id: 'custom-project' as AppView, label: 'Create Your Own Project', icon: Plus },
    { id: 'notes' as AppView, label: 'Interview Notes', icon: FileText },
    { id: 'profile' as AppView, label: 'Profile', icon: User },
  ]

  return (
    <div className="w-72 bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BA Training Platform</h1>
            <p className="text-sm text-gray-600">Professional Development</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <ul className="space-y-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-left transition-all duration-200 font-medium ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Sign Out */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.email}
            </p>
            <p className="text-xs text-gray-600">Business Analyst Trainee</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar