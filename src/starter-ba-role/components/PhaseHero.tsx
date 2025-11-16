import React from 'react';
import { Phase, FeatureState } from '../types/models';
import { JourneyService } from '../services/journeyService';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface PhaseHeroProps {
  phase: Phase;
  state: FeatureState;
  onBack: () => void;
  onBeginPhase: () => void;
}

// Phase descriptions - can be moved to mockData later
const PHASE_DESCRIPTIONS: Record<string, string> = {
  'phase-0': 'Get oriented with the platform and complete your HR onboarding. Learn what to expect and how to succeed in your BA journey.',
  'phase-1': 'Experience your first 24 hours as a Business Analyst. Meet your manager, review the project brief, and complete your first tasks.',
  'phase-2': 'Coming soon: Understanding the organization and the business problem.',
  'phase-3': 'Coming soon: Meeting stakeholders and mapping the landscape.',
  'phase-4': 'Coming soon: Analyzing the current state and identifying issues.',
  'phase-5': 'Coming soon: Designing the future state and solution options.',
  'phase-6': 'Coming soon: Writing requirements and user stories.',
  'phase-7': 'Coming soon: Agile delivery and collaboration with developers.',
  'phase-8': 'Coming soon: Testing, handover, and continuous improvement.'
};

export const PhaseHero: React.FC<PhaseHeroProps> = ({ phase, state, onBack, onBeginPhase }) => {
  const progress = JourneyService.getPhaseProgress(state, phase.id);
  const status = JourneyService.getPhaseStatus(state, phase.id);
  const isCompleted = status === 'completed';
  const hasProgress = progress.completed > 0;

  // Get phase color scheme
  const getPhaseColors = () => {
    switch (phase.order) {
      case 0:
        return {
          bg: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
          accent: 'from-purple-600 to-indigo-600',
          text: 'text-purple-600 dark:text-purple-400'
        };
      case 1:
        return {
          bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
          accent: 'from-blue-600 to-cyan-600',
          text: 'text-blue-600 dark:text-blue-400'
        };
      case 2:
      case 3:
        return {
          bg: 'from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20',
          accent: 'from-teal-600 to-green-600',
          text: 'text-teal-600 dark:text-teal-400'
        };
      default:
        return {
          bg: 'from-slate-50 to-gray-50 dark:from-gray-900/20 dark:to-gray-800/20',
          accent: 'from-gray-600 to-gray-700',
          text: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const colors = getPhaseColors();
  const description = PHASE_DESCRIPTIONS[phase.slug] || 'Begin this phase of your BA journey.';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg} flex items-center justify-center p-8`}>
      <div className="max-w-4xl w-full">
        {/* Back button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to journey</span>
        </button>

        {/* Hero card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12">
          {/* Phase number */}
          <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${colors.accent} text-white text-sm font-semibold mb-6`}>
            Phase {phase.order}
          </div>

          {/* Phase title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {phase.title.replace(`Phase ${phase.order} — `, '')}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {description}
          </p>

          {/* Progress section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your progress
              </span>
              <span className={`text-sm font-semibold ${colors.text}`}>
                {progress.completed} of {progress.total} steps
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colors.accent} transition-all duration-500 ease-out`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            {isCompleted && (
              <div className="flex items-center gap-2 mt-4 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Phase complete</span>
              </div>
            )}
          </div>

          {/* CTA button */}
          <button
            onClick={onBeginPhase}
            className={`
              w-full md:w-auto
              inline-flex items-center justify-center
              px-10 py-4 text-lg font-semibold
              bg-gradient-to-r ${colors.accent}
              text-white rounded-xl
              shadow-lg hover:shadow-2xl
              transform hover:scale-105
              transition-all duration-300
            `}
          >
            {isCompleted 
              ? 'Review this phase' 
              : hasProgress 
              ? 'Continue this phase' 
              : 'Begin this phase'
            }
            <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Optional: Phase outline (if sections exist) */}
        {progress.total > 0 && (
          <div className="mt-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              What you'll do in this phase
            </h3>
            <div className="space-y-3">
              {JourneyService.getSectionsForPhase(state, phase.id).map(section => {
                const sectionSteps = JourneyService.getStepsForSection(state, section.id);
                const completedSteps = sectionSteps.filter(s => state.progress[s.id] === 'completed').length;
                
                return (
                  <div key={section.id} className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                      ${completedSteps === sectionSteps.length
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }
                    `}>
                      {completedSteps === sectionSteps.length ? '✓' : completedSteps}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {section.title.replace(/Section \d+\.\d+ — /, '')}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {sectionSteps.length} {sectionSteps.length === 1 ? 'step' : 'steps'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhaseHero;

