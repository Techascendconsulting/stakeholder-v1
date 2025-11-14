import React from 'react';
import type { AppView } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { ArrowRight, Target, CheckCircle, Zap, TrendingUp } from 'lucide-react';

const PracticeIntro: React.FC = () => {
  const { setCurrentView } = useApp();

  const handleContinue = () => {
    void setCurrentView('practice-flow');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 dark:from-purple-900 dark:via-purple-800 dark:to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Main Content Card */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: Image Section */}
            <div className="relative h-full min-h-[500px] md:min-h-[600px]">
              <img 
                src="/images/blue.jpg" 
                alt="Hands-on practice and skill building"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-800/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-4">
                  <Target className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-semibold">Hands-On Practice</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Practice What You Learn</h3>
                <p className="text-white/90 text-sm">Apply BA skills in realistic scenarios and build your confidence</p>
              </div>
            </div>

            {/* Right: Content Section */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full border border-purple-200 dark:border-purple-700">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Skill Building</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  Practice Your BA Skills in Real Scenarios
                </h1>

                {/* Description */}
                <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  <p>
                    Learning theory is just the start. Practice modules let you apply what you've learned through interactive exercises, role-playing scenarios, and real-world challenges.
                  </p>
                  <p>
                    Work through stakeholder interviews, document requirements, create process maps, and practice Agile ceremonies—all in a safe environment where you can make mistakes and learn.
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mt-0.5">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Interactive exercises</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Practice real BA tasks with guided feedback</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Real-world scenarios</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tackle challenges you'll face as a BA</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mt-0.5">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Build confidence</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gain experience before your first BA role</p>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="pt-6">
                  <button
                    onClick={handleContinue}
                    className="group w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all transform hover:-translate-y-0.5 hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    <span>Start Practicing</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeIntro;

