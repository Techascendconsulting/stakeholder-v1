import React from 'react';
import { Rocket, Target, Zap, CheckCircle } from 'lucide-react';

const MVPHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-cyan-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-cyan-600/5 dark:from-emerald-400/10 dark:to-cyan-400/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl mb-6">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">🚀 MVP Hub</h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Learn how to take your complete design and slice it into the smallest, most valuable release that delivers real business value.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Coming Soon</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              The MVP Hub is currently under development. This section will cover how to prioritize features, 
              define minimum viable products, and create delivery roadmaps that maximize business value.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700">
                <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Feature Prioritization</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Learn how to identify and prioritize the most valuable features for your first release.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-700">
                <Zap className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">MVP Definition</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Define what constitutes a minimum viable product for your specific business context.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-700">
                <CheckCircle className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Delivery Roadmap</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Create roadmaps that balance business value, technical feasibility, and user needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MVPHub;


