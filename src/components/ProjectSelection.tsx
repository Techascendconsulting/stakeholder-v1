import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, FolderOpen, Plus, Search, Filter } from 'lucide-react'

const ProjectSelection: React.FC = () => {
  const { user, signOut } = useAuth()

  // Mock projects data
  const projects = [
    {
      id: 1,
      name: 'Web Development Portfolio',
      description: 'Build a responsive personal portfolio website using React and Tailwind CSS',
      difficulty: 'Intermediate',
      duration: '2-3 weeks',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 2,
      name: 'E-commerce Platform',
      description: 'Create a full-stack e-commerce solution with payment integration',
      difficulty: 'Advanced',
      duration: '4-6 weeks',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 3,
      name: 'Task Management App',
      description: 'Develop a collaborative task management application with real-time updates',
      difficulty: 'Intermediate',
      duration: '3-4 weeks',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 4,
      name: 'Weather Dashboard',
      description: 'Build a weather dashboard with data visualization and forecasting',
      difficulty: 'Beginner',
      duration: '1-2 weeks',
      color: 'from-cyan-500 to-blue-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Project Hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Your Project</h2>
          <p className="text-gray-600">Choose from our curated collection of hands-on projects</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className={`h-32 bg-gradient-to-r ${project.color}`}></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    project.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                    project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {project.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">{project.duration}</span>
                </div>
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                  Start Project
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create New Project */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Custom Project</h3>
            <p className="text-gray-600 mb-4">Have a specific project in mind? Create your own custom project</p>
            <button className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200">
              Create Project
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProjectSelection