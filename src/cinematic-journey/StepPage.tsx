import React from 'react';
import { getPhaseById, getNextStep, getPreviousStep } from './journeyData';
import { JourneyPhase, JourneyStep } from './types';
import { loadProgress, markStepComplete } from './progressStorage';

interface StepPageProps {
  phaseId: string;
  stepId: string;
  onBackToPhase?: (phaseId: string) => void;
  onGoToStep?: (phaseId: string, stepId: string) => void;
}

const StepPage: React.FC<StepPageProps> = ({ phaseId, stepId, onBackToPhase, onGoToStep }) => {
  const phase: JourneyPhase | undefined = getPhaseById(phaseId);
  const step: JourneyStep | undefined = phase?.steps.find(s => s.id === stepId);
  const progress = loadProgress();

  if (!phase || !step) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] text-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <p>Step not found</p>
          <button
            onClick={() => onBackToPhase && onBackToPhase(phaseId)}
            className="mt-3 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-blue-700 transition-all duration-300"
          >
            Back to Phase
          </button>
        </div>
      </div>
    );
  }

  const done = !!(progress[phase.id]?.[step.id]);

  const handleComplete = () => {
    markStepComplete(phase.id, step.id);
    const next = getNextStep(phase.id, step.id);
    if (next && onGoToStep) onGoToStep(next.phaseId, next.stepId);
  };

  const handlePrev = () => {
    const prev = getPreviousStep(phase.id, step.id);
    if (prev && onGoToStep) onGoToStep(prev.phaseId, prev.stepId);
  };

  const handleNext = () => {
    const next = getNextStep(phase.id, step.id);
    if (next && onGoToStep) onGoToStep(next.phaseId, next.stepId);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#1a1a1a]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button
          onClick={() => onBackToPhase && onBackToPhase(phase.id)}
          className="mb-4 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-blue-700 transition-all duration-300"
        >
          ← Back to {phase.code}
        </button>

        <div className="mb-3">
          <div className="text-2xl font-bold">{phase.code} — {phase.title}</div>
          <div className="opacity-80">{phase.description}</div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 mt-6">
          <div className="font-bold mb-1">
            {step.order}. {step.title} <span className="text-xs opacity-70">({step.type})</span>
          </div>
          <div className="text-sm opacity-80 mb-3">{step.summary}</div>
          <div className="whitespace-pre-wrap">{step.content || 'Content coming soon.'}</div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:bg-gray-300 transition-all duration-300"
            disabled={!getPreviousStep(phase.id, step.id)}
          >
            Previous
          </button>
          <div className="flex-1" />
          {!done && (
            <button
              onClick={handleComplete}
              className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-blue-700 transition-all duration-300"
            >
              Mark Complete
            </button>
          )}
          <button
            onClick={handleNext}
            className="ml-2 px-4 py-2 rounded-lg bg-gray-800 text-white disabled:bg-gray-300 transition-all duration-300"
            disabled={!getNextStep(phase.id, step.id)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepPage;


