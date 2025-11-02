import React from "react";
import { Calendar, User, BookOpen, Clock, MessageSquare, Target, TrendingUp } from "lucide-react";

const MyMentorship: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              My Mentorship
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your mentorship hub for professional development
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What You'll Get
            </h2>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <User className="w-4 h-4 mt-0.5 text-blue-500" />
                <span>One-to-one mentorship with industry professionals</span>
              </li>
              <li className="flex items-start space-x-2">
                <BookOpen className="w-4 h-4 mt-0.5 text-blue-500" />
                <span>Guidance on real BA challenges, CV reviews, and interview prep</span>
              </li>
              <li className="flex items-start space-x-2">
                <Clock className="w-4 h-4 mt-0.5 text-blue-500" />
                <span>Flexible 30-60 minute sessions you can book at your convenience</span>
              </li>
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <MessageSquare className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">4.5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Goals Achieved</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">85%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyMentorship;
