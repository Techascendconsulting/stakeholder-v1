import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { BookOpen, Target, ArrowRight, GraduationCap, Briefcase } from 'lucide-react';

const NewWelcomeView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-16">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              BA WorkXP Platform
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Build real Business Analysis experience and create a professional portfolio that gets you hired.
            </p>
          </div>

          {/* Two Paths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Foundation Path */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Foundation Journey
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Start with the fundamentals. Learn business context, requirements engineering, 
                stakeholder mapping, and core BA concepts through guided lessons and quizzes.
              </p>
              <div className="space-y-3 mb-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Business Context & BA Role</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Requirements Engineering</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Stakeholder Mapping</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Interactive Quizzes & Tasks</span>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('foundation-wizard')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Start Foundation Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {/* Practice Path */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Practice & Projects
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Jump straight into hands-on practice. Work on real BA projects, 
                create professional deliverables, and build your portfolio.
              </p>
              <div className="space-y-3 mb-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Real BA Projects</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Professional Deliverables</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Portfolio Building</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Meeting Practice</span>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('guided-practice-hub')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Start Practicing
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Simple Footer */}
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Choose your path and start building your BA career today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewWelcomeView;
