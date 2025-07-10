import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { User, Mail, Calendar, Award, BookOpen, Clock } from 'lucide-react'

const ProfileView: React.FC = () => {
  const { user } = useAuth()

  const achievements = [
    { title: 'First Meeting', description: 'Completed your first stakeholder interview', earned: true },
    { title: 'Note Taker', description: 'Created your first meeting transcript', earned: true },
    { title: 'Requirements Gatherer', description: 'Documented 10 requirements', earned: false },
    { title: 'Stakeholder Whisperer', description: 'Interviewed all 5 stakeholders', earned: false },
    { title: 'Deliverable Creator', description: 'Created all deliverable types', earned: false },
    { title: 'BA Expert', description: 'Completed 3 full projects', earned: false }
  ]

  const stats = [
    { label: 'Projects Completed', value: '0', icon: BookOpen },
    { label: 'Meetings Conducted', value: '2', icon: User },
    { label: 'Hours Logged', value: '24', icon: Clock },
    { label: 'Deliverables Created', value: '3', icon: Award }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Track your Business Analyst training progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.email}</h2>
              <p className="text-gray-600">BA Trainee</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  Joined {new Date(user?.created_at || '').toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Stats</h3>
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <stat.icon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{stat.label}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    achievement.earned
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.earned
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Award
                        className={`w-5 h-5 ${
                          achievement.earned ? 'text-green-600' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${
                          achievement.earned ? 'text-green-900' : 'text-gray-700'
                        }`}
                      >
                        {achievement.title}
                      </h4>
                      <p
                        className={`text-sm ${
                          achievement.earned ? 'text-green-700' : 'text-gray-500'
                        }`}
                      >
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.earned && (
                      <div className="text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Overall Progress</span>
                  <span>25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Stakeholder Interviews</span>
                  <span>40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Deliverables</span>
                  <span>15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileView