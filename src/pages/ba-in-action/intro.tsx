import React from 'react';
import type { AppView } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const BAInActionIntroPage: React.FC = () => {
  const { setCurrentView } = useApp();

  const handleContinue = () => {
    void setCurrentView('ba-in-action-index');
  };

  const handleBack = () => {
    void setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff09aa] via-[#ff56c9] to-[#c94bff] dark:from-[#7a0057] dark:via-[#6b008a] dark:to-[#4b0082] flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 text-white/90 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        {/* Main Content Card */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: Image Section */}
            <div className="relative h-full min-h-[500px] md:min-h-[600px]">
              <img 
                src="/images/collaborate1.jpg" 
                alt="Business Analyst working with stakeholders"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-4">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  <span className="text-white text-sm font-semibold">Real Project Experience</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">See a BA in Action</h3>
                <p className="text-white/90 text-sm">Watch how a real Business Analyst navigates a complete project workflow</p>
              </div>
            </div>

            {/* Right: Content Section */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full border border-purple-200 dark:border-purple-700">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Interactive Learning</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  Shadow a Business Analyst in a Real Project Workflow
                </h1>

                {/* Description */}
                <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  <p>
                    Most BA training teaches you theory. This experience shows you what a Business Analyst actually does day-to-day on a real project.
                  </p>
                  <p>
                    You'll see how they handle stakeholder meetings, document requirements, navigate challenges, and deliver value—step by step, from project start to finish.
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Real project scenarios</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Based on actual business problems and solutions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Step-by-step workflow</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Follow the complete journey from orientation to delivery</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Practical techniques</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Learn methods you'll use in your first BA role</p>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="pt-6">
                  <button
                    onClick={handleContinue}
                    className="group w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#ff09aa] via-[#ff3cbf] to-[#d238ff] text-white rounded-xl font-semibold text-lg shadow-lg shadow-[#ff09aa]/50 hover:shadow-xl hover:shadow-[#ff09aa]/60 transition-all transform hover:-translate-y-0.5 hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    <span>Continue to Project Selection</span>
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

export default BAInActionIntroPage;

