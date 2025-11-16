import { ArrowLeft, Circle, CheckCircle2 } from 'lucide-react';
import type { Phase, Step } from '../data/journeyData';

export default function PhasePage({
  phase,
  onBack,
  onStepClick,
}: {
  phase: Phase;
  onBack: () => void;
  onStepClick: (step: Step) => void;
}) {
  const steps = phase.steps;
  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with back button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <button
            onClick={onBack}
            className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Journey</span>
          </button>
        </div>
      </div>

      {/* Hero Section for Phase */}
      <div className="relative pt-20 pb-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-black opacity-50" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
          <div className="mb-3 opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]">
            <span className="text-blue-400 font-bold tracking-[0.3em] text-xs">
              {phase.code}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight opacity-0 animate-[fadeIn_0.8s_ease-out_0.4s_forwards]">
            {phase.title}
          </h1>
          <p className="text-lg text-gray-400 mb-6 font-light max-w-3xl mx-auto opacity-0 animate-[fadeIn_0.8s_ease-out_0.6s_forwards]">
            {phase.description}
          </p>

          {/* Progress */}
          <div className="max-w-md mx-auto opacity-0 animate-[fadeIn_0.8s_ease-out_0.8s_forwards]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">PROGRESS</span>
              <span className="text-xs text-gray-400 font-medium">
                {completedCount}/{steps.length} STEPS
              </span>
            </div>
            <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section - Vertical Scroll */}
      <div className="relative py-12">
        <div className="max-w-6xl mx-auto px-8">
          {/* Section Title */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Steps to Complete</h2>
            <p className="text-sm text-gray-500">Click any step to begin</p>
          </div>

          {/* Steps Grid */}
          <div className="grid gap-4">
            {steps.map((step) => (
              <button
                key={step.number}
                onClick={() => onStepClick(step)}
                className="group relative text-left"
              >
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-500 overflow-hidden">
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-center gap-4">
                    {/* Step Number/Status */}
                    <div className="flex-shrink-0">
                      {step.completed ? (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-7 h-7 text-white" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 flex items-center justify-center">
                          <span className="text-xl font-black text-gray-500">{step.number}</span>
                        </div>
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                          {step.title}
                        </h3>
                        {step.completed && (
                          <span className="text-xs font-bold tracking-wider uppercase text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                            Complete
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                        {step.summary}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-blue-600 flex items-center justify-center transition-colors duration-300">
                        <Circle className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
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
      `}</style>
    </div>
  );
}


