import React from "react";
import { Target, TrendingUp, Briefcase, Award } from "lucide-react";

const CareerCoaching: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Career Coaching
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Professional development and career guidance
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Career Goals */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Career Goals
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { goal: "Senior Business Analyst", progress: 75, status: "In Progress" },
                { goal: "Lead BA Certification", progress: 40, status: "Started" },
                { goal: "Agile Methodology Mastery", progress: 90, status: "Almost Complete" },
                { goal: "Team Leadership Skills", progress: 25, status: "Planning" }
              ].map((goal, idx) => (
                <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{goal.goal}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {goal.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{goal.progress}% Complete</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coaching Sessions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Available Coaching Sessions
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { 
                  title: "Career Path Planning", 
                  description: "Define your career trajectory and create a roadmap",
                  duration: "60 mins",
                  focus: "Strategic Planning"
                },
                { 
                  title: "Skill Gap Analysis", 
                  description: "Identify areas for improvement and development",
                  duration: "45 mins",
                  focus: "Assessment"
                },
                { 
                  title: "Leadership Development", 
                  description: "Build leadership skills for senior BA roles",
                  duration: "90 mins",
                  focus: "Leadership"
                },
                { 
                  title: "Industry Networking", 
                  description: "Learn networking strategies and relationship building",
                  duration: "30 mins",
                  focus: "Networking"
                }
              ].map((session, idx) => (
                <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{session.title}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                      {session.focus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{session.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{session.duration}</span>
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition">
                      Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Career Development Progress
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">85%</div>
                <div className="text-sm text-green-600 dark:text-green-400">Overall Progress</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Goals Achieved</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Active Goals</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Award className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">5</div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Certifications</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerCoaching;





