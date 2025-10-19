import React from "react";
import { TrendingUp, Calendar, MessageSquare, Target, Award } from "lucide-react";

const MyProgressWithMentor: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              My Progress with Mentor
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your mentorship journey and achievements
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Mentorship Progress Overview
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Sessions Completed</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">85%</div>
                <div className="text-sm text-green-600 dark:text-green-400">Overall Progress</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">8</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Goals Achieved</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Award className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">3</div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Certifications</div>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Sessions
            </h2>
            <div className="space-y-4">
              {[
                {
                  date: "2024-01-15",
                  mentor: "Sarah Johnson",
                  session: "Career Path Planning",
                  duration: "60 mins",
                  status: "Completed",
                  feedback: "Excellent progress on stakeholder management skills"
                },
                {
                  date: "2024-01-08",
                  mentor: "Mike Chen", 
                  session: "Technical Skills Review",
                  duration: "45 mins",
                  status: "Completed",
                  feedback: "Strong analytical thinking, focus on presentation skills"
                },
                {
                  date: "2024-01-22",
                  mentor: "Sarah Johnson",
                  session: "Leadership Development",
                  duration: "90 mins",
                  status: "Scheduled",
                  feedback: "Upcoming session"
                }
              ].map((session, idx) => (
                <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{session.session}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">with {session.mentor}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${
                        session.status === 'Completed' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {session.status}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{session.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{session.duration}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{session.feedback}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals & Milestones */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Goals & Milestones
            </h2>
            <div className="space-y-4">
              {[
                { goal: "Complete BA Certification", progress: 90, deadline: "2024-03-15", status: "On Track" },
                { goal: "Lead First Project", progress: 60, deadline: "2024-04-30", status: "In Progress" },
                { goal: "Improve Presentation Skills", progress: 75, deadline: "2024-02-28", status: "On Track" },
                { goal: "Build Network of 50+ Professionals", progress: 40, deadline: "2024-06-30", status: "Started" }
              ].map((goal, idx) => (
                <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">{goal.goal}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      goal.status === 'On Track' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : goal.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{goal.progress}% Complete</span>
                    <span>Due: {goal.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mentor Feedback Summary */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Mentor Feedback Summary
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Strengths</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Excellent analytical thinking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Strong stakeholder communication</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Proactive problem-solving approach</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Areas for Development</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Presentation and public speaking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Advanced technical documentation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Team leadership and mentoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProgressWithMentor;








