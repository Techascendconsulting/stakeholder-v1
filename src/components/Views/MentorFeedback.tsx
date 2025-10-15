import React from "react";
import { MessageSquare, Star, Clock, User } from "lucide-react";

const MentorFeedback: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Mentor Feedback
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review feedback from your mentors
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Recent Feedback */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Feedback
            </h2>
            
            {/* Feedback Cards */}
            <div className="space-y-4">
              {[
                {
                  mentor: "Sarah Johnson",
                  session: "Career Clarity Call",
                  date: "2 days ago",
                  rating: 5,
                  feedback: "Great progress on your project management skills. Focus on stakeholder communication next session.",
                  type: "positive"
                },
                {
                  mentor: "Mike Chen",
                  session: "CV Review",
                  date: "1 week ago", 
                  rating: 4,
                  feedback: "Your CV structure is good. Consider adding more quantifiable achievements in your BA experience section.",
                  type: "constructive"
                }
              ].map((feedback, idx) => (
                <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{feedback.mentor}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{feedback.session}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{feedback.date}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{feedback.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Summary */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Feedback Summary
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">4.5</div>
                <div className="text-sm text-green-600 dark:text-green-400">Average Rating</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Sessions</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">8</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Feedback Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorFeedback;





