import { Lock, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Phase, journeyData } from '../data/journeyData';

export default function JourneyMap({ onPhaseClick }: { onPhaseClick: (phase: Phase) => void }) {
  const phases = journeyData;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Hero Section */}
      <div className="relative py-12 border-b border-gray-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 text-center">
          <div className="mb-3 opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-blue-400">
              Start Your BA Role
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-3 tracking-tighter opacity-0 animate-[fadeIn_0.8s_ease-out_0.4s_forwards]">
            BA Journey Map
          </h1>
          <p className="text-lg text-gray-400 mb-2 font-light opacity-0 animate-[fadeIn_0.8s_ease-out_0.6s_forwards]">
            Your path from Phase P0 to P9
          </p>
          <p className="text-sm text-gray-500 opacity-0 animate-[fadeIn_0.8s_ease-out_0.8s_forwards]">
            Scroll horizontally to explore your journey →
          </p>
        </div>
      </div>

      {/* Horizontal Journey Timeline */}
      <div className="relative">
        <div className="overflow-x-auto overflow-y-hidden">
          <div className="inline-flex min-w-full py-12">
            {/* Connecting Line */}
            <div
              className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-gray-800 opacity-30"
              style={{ transform: 'translateY(-50%)', width: `${phases.length * 320}px` }}
            />

            {phases.map((phase, index) => (
              <div
                key={phase.code}
                className="relative flex-shrink-0 px-6 first:pl-12 last:pr-12"
                style={{ width: '320px' }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <button
                  onClick={() => phase.status !== 'locked' && onPhaseClick(phase)}
                  disabled={phase.status === 'locked'}
                  className={`relative w-full group ${
                    phase.status === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {/* Phase Node/Circle */}
                  <div className="flex flex-col items-center mb-6">
                    <div
                      className={`relative z-10 transition-all duration-500 ${
                        hoveredIndex === index ? 'scale-110' : 'scale-100'
                      }`}
                    >
                      {phase.status === 'locked' ? (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-3 border-gray-700 flex items-center justify-center">
                          <Lock className="w-7 h-7 text-gray-600" />
                        </div>
                      ) : phase.status === 'completed' ? (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border-3 border-green-400 flex items-center justify-center shadow-xl shadow-green-500/50">
                          <div className="text-2xl font-black text-white">{index}</div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-3 border-blue-400 flex items-center justify-center shadow-xl shadow-blue-500/50 animate-pulse">
                          <div className="text-2xl font-black text-white">{index}</div>
                        </div>
                      )}
                    </div>

                    {/* Arrow connector (except for last item) */}
                    {index < phases.length - 1 && (
                      <div className="absolute left-1/2 top-8 w-48 flex items-center justify-center pointer-events-none">
                        <ArrowRight className="w-5 h-5 text-gray-700 ml-24" />
                      </div>
                    )}
                  </div>

                  {/* Phase Card */}
                  <div
                    className={`relative bg-gradient-to-br from-gray-900 to-black border-2 rounded-xl p-4 transition-all duration-500 overflow-hidden ${
                      phase.status === 'locked'
                        ? 'border-gray-800 opacity-60'
                        : hoveredIndex === index
                        ? 'border-blue-500 shadow-2xl shadow-blue-500/30 -translate-y-2'
                        : 'border-gray-800'
                    }`}
                  >
                    {/* Hover glow effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 transition-opacity duration-500 ${
                        hoveredIndex === index && phase.status !== 'locked' ? 'opacity-100' : ''
                      }`}
                    />

                    <div className="relative">
                      {/* Phase Code */}
                      <div className="mb-2">
                        <span
                          className={`text-xs font-bold tracking-[0.2em] ${
                            phase.status === 'locked' ? 'text-gray-600' : 'text-blue-400'
                          }`}
                        >
                          {phase.code}
                        </span>
                      </div>

                      {/* Phase Title */}
                      <h3
                        className={`text-lg font-black mb-2 leading-tight transition-colors ${
                          phase.status === 'locked'
                            ? 'text-gray-600'
                            : hoveredIndex === index
                            ? 'text-white'
                            : 'text-gray-300'
                        }`}
                      >
                        {phase.title}
                      </h3>

                      {/* Phase Description */}
                      <p
                        className={`text-xs mb-3 leading-relaxed ${
                          phase.status === 'locked' ? 'text-gray-700' : 'text-gray-500'
                        }`}
                      >
                        {phase.description}
                      </p>

                      {/* Progress Bar */}
                      {phase.status !== 'locked' && (
                        <div className="space-y-1.5">
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ${
                                phase.status === 'completed'
                                  ? 'w-full bg-gradient-to-r from-green-400 to-emerald-500'
                                  : 'w-1/3 bg-gradient-to-r from-blue-400 to-blue-600'
                              }`}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium uppercase tracking-wider">
                              {phase.status === 'completed' ? 'Completed' : 'In Progress'}
                            </span>
                            <span className="text-gray-700">
                              {phase.steps.filter((s) => s.completed).length}/{phase.steps.length}{' '}
                              steps
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Locked State Text */}
                      {phase.status === 'locked' && (
                        <div className="text-xs text-gray-700 font-medium uppercase tracking-wider">
                          Locked
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <span>Scroll to explore your journey</span>
            <ArrowRight className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Hide scrollbar but keep functionality */
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 4px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 4px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}


