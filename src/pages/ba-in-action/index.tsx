import React from 'react';
import type { AppView } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { BA_IN_ACTION_PAGES } from '../../ba-in-action/config';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';

const BAInActionIndexPage: React.FC = () => {
  const { setCurrentView, currentView } = useApp();

  const handleNavigate = (view: AppView) => {
    void setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-300 to-purple-400 dark:from-purple-900 dark:via-purple-800 dark:to-pink-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Back Button */}
          <button
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Shadow a Business Analyst in a Real Project Workflow
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Follow the real flow of how a BA understands the problem, engages stakeholders, uncovers insights, shapes solutions, and supports delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Journey Container */}
      <div className="py-12 px-6">
        <div className="max-w-full">
          {/* Horizontal Scrollable Container */}
          <div className="overflow-x-auto pb-8 scrollbar-hide">
            {/* Centered Content Wrapper */}
            <div className="flex items-center justify-center min-w-max">
              {BA_IN_ACTION_PAGES.map((page, index) => {
                const isActive = currentView === page.view;
                const showArrow = index < BA_IN_ACTION_PAGES.length - 1;

                return (
                  <React.Fragment key={page.view}>
                    {/* Step Card */}
                    <div className="flex flex-col items-center">
                      {/* Circular Node */}
                      <button
                        onClick={() => handleNavigate(page.view)}
                        className={`
                          w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                          transition-all duration-300 transform hover:scale-110 mb-4
                          ${isActive 
                            ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50 ring-4 ring-pink-300 dark:ring-pink-600' 
                            : 'bg-white dark:bg-gray-800 text-pink-600 dark:text-pink-400 shadow-lg border-4 border-pink-500 hover:border-purple-500 cursor-pointer'}
                        `}
                      >
                        {index + 1}
                      </button>

                      {/* Card - Fixed Height */}
                      <div
                        onClick={() => handleNavigate(page.view)}
                        className={`
                          w-80 h-72 rounded-2xl shadow-xl p-6 border-2 transition-all duration-300 cursor-pointer flex flex-col
                          ${isActive 
                            ? 'bg-gradient-to-br from-pink-500 to-purple-500 dark:bg-gradient-to-br dark:from-pink-600 dark:to-purple-600 border-pink-600 text-white scale-105' 
                            : 'bg-white dark:bg-gray-800 border-pink-500 hover:shadow-2xl hover:scale-105'}
                        `}
                      >
                        {/* Status Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`
                            px-3 py-1 rounded-full text-xs font-semibold
                            ${isActive 
                              ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-200' 
                              : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'}
                          `}>
                            Step {index + 1}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className={`text-lg font-bold mb-2 ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                          {page.title}
                        </h3>

                        {/* Description */}
                        <p className={`text-sm mb-4 flex-grow ${isActive ? 'text-pink-100' : 'text-gray-600 dark:text-gray-400'}`}>
                          See how a BA handles this critical stage
                        </p>

                        {/* Action Button */}
                        <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(page.view);
                            }}
                            className={`
                              flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm
                              transition-all duration-200
                              ${isActive 
                                ? 'bg-white text-pink-600 hover:bg-pink-50' 
                                : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700'}
                            `}
                          >
                            <Play className="w-4 h-4" />
                            <span>Explore</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Arrow - Positioned at Card Middle */}
                    {showArrow && (
                      <div className="flex items-center mx-6 self-center" style={{ marginTop: '80px' }}>
                        <ArrowRight className="w-8 h-8 text-pink-400 dark:text-pink-500" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default BAInActionIndexPage;
