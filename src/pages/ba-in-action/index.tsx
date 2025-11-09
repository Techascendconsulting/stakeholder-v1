import React from 'react';
import type { AppView } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';

const journey: Array<{ id: number; label: string; view: AppView }> = [
  { id: 1, label: 'Join & Orientation (Day 1)', view: 'ba_in_action_join_orientation' },
  { id: 2, label: 'Understand the Business Problem', view: 'ba_in_action_understand_problem' },
  { id: 3, label: "Who's Involved & Why It Matters", view: 'ba_in_action_whos_involved' },
  { id: 4, label: 'Stakeholder Communication', view: 'ba_in_action_stakeholder_communication' },
  { id: 5, label: 'As-Is → Gap → To-Be', view: 'ba_in_action_as_is_to_be' },
  { id: 6, label: 'Requirements & Documentation', view: 'ba_in_action_requirements' },
  { id: 7, label: 'Agile Delivery', view: 'ba_in_action_agile_delivery' },
  { id: 8, label: 'Handover & Value Tracking', view: 'ba_in_action_handover_value' },
];

const BAInActionIndexPage: React.FC = () => {
  const { setCurrentView, currentView } = useApp();

  const handleNavigate = (view: AppView) => {
    void setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff09aa] via-[#ff56c9] to-[#c94bff] dark:from-[#7a0057] dark:via-[#6b008a] dark:to-[#4b0082]">
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
      <div className="px-6 py-12">
        <div className="max-w-full">
          <div className="min-h-[calc(100vh-220px)] flex flex-col items-center justify-center">
            {/* Horizontal Scrollable Container */}
            <div className="w-full overflow-x-auto pb-8">
              {/* Centered Content Wrapper */}
              <div className="flex items-center justify-center min-w-max">
              {journey.map((step, index) => {
                const view = step.view;
                const isActive = currentView === view;
                const showArrow = index < journey.length - 1;

                return (
                  <React.Fragment key={step.id}>
                    {/* Step Card */}
                    <div className="flex flex-col items-center">
                      {/* Circular Node */}
                      <button
                        onClick={() => handleNavigate(view)}
                        className={`
                          w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                          transition-all duration-300 transform hover:scale-110 mb-4
                          ${isActive 
                            ? 'bg-gradient-to-br from-[#ff09aa] to-[#d238ff] text-white shadow-lg shadow-[#ff09aa]/50 ring-4 ring-[#ff73d3] dark:ring-[#ff73d3]' 
                            : 'bg-white dark:bg-gray-800 text-[#ff09aa] dark:text-[#ff73d3] shadow-lg border-4 border-[#ff09aa] hover:border-[#d238ff] cursor-pointer'}
                        `}
                      >
                        {step.id}
                      </button>

                      {/* Card - Fixed Height */}
                      <div
                        onClick={() => handleNavigate(view)}
                        className={`
                          w-80 h-72 rounded-2xl shadow-xl p-6 border-[1.5px] transition-all duration-300 cursor-pointer flex flex-col
                          ${isActive 
                            ? 'bg-gradient-to-br from-[#ff09aa] via-[#ff3cbf] to-[#d238ff] border-transparent text-white scale-105 shadow-[0_18px_45px_-12px_rgba(255,9,170,0.55)]' 
                            : 'bg-white/95 dark:bg-gray-800 border-[#ff09aa]/80 hover:shadow-2xl hover:scale-105'}
                        `}
                      >
                        {/* Status Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`
                            px-3 py-1 rounded-full text-xs font-semibold
                            ${isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-[#ffebf7] text-[#d60081] dark:bg-[#5b0050] dark:text-[#ff8cd9]'}
                          `}>
                            Step {index + 1}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className={`text-lg font-bold mb-2 ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                          {step.label}
                        </h3>

                        {/* Description */}
                        <p className={`text-sm mb-4 flex-grow ${isActive ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                          See how a BA handles this critical stage
                        </p>

                        {/* Action Button */}
                        <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(view);
                            }}
                            className={`
                              flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm
                              transition-all duration-200
                              ${isActive 
                                ? 'bg-white text-[#ff09aa] hover:bg-[#ffe6f5]' 
                                : 'bg-gradient-to-r from-[#ff09aa] via-[#ff3cbf] to-[#d238ff] text-white hover:from-[#ff21b1] hover:to-[#b52fff]'}
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-white/80 to-white/30 text-[#ff09aa] shadow-lg shadow-[#ff09aa]/40 dark:from-white/15 dark:to-white/5">
                          <ArrowRight className="w-6 h-6" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="mt-8 flex items-center justify-center gap-3 text-white/90 dark:text-white/80">
              <span className="text-sm uppercase tracking-[0.2em]">Scroll</span>
              <div className="relative h-1 w-40 overflow-hidden rounded-full bg-white/30 dark:bg-white/20">
                <div className="absolute inset-y-0 left-0 w-1/3 animate-[scrollPulse_2.4s_infinite] rounded-full bg-gradient-to-r from-[#ff09aa] via-[#ff3cbf] to-[#d238ff]" />
              </div>
              <span className="text-sm uppercase tracking-[0.2em]">Explore</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes scrollPulse {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(150%);
          }
          100% {
            transform: translateX(150%);
          }
        }
      `}</style>
    </div>
  );
};

export default BAInActionIndexPage;
