import React from 'react';
import { JOURNEY_PHASES, getPhaseById } from './journeyData';
import { JourneyPhase } from './types';
import { loadProgress, isPhaseLocked } from './progressStorage';

interface PhasePageProps {
  phaseId: string;
  onBack?: () => void;
  onOpenStep?: (phaseId: string, stepId: string) => void;
}

const PhasePage: React.FC<PhasePageProps> = ({ phaseId, onBack, onOpenStep }) => {
  const phase: JourneyPhase | undefined = getPhaseById(phaseId);
  const progress = loadProgress();

  if (!phase) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] text-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <p className="mb-3">Phase not found</p>
          <button className="px-4 py-2 rounded-lg bg-black text-white hover:bg-blue-700 transition-all duration-300" onClick={onBack}>Back</button>
        </div>
      </div>
    );
  }

  const locked = isPhaseLocked(phase, progress, JOURNEY_PHASES);

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#1a1a1a]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 rounded-lg bg-black text-white hover:bg-blue-700 transition-all duration-300"
        >
          ← Back
        </button>

        <h2 className="text-3xl font-bold mb-2">{phase.code} — {phase.title}</h2>
        <p className="opacity-80 mb-6">{phase.description}</p>
        {locked && (
          <div className="text-red-600 mb-4">This phase is locked until the previous phase is completed.</div>
        )}

        <ul className="relative">
          {phase.steps.map(step => {
            const done = !!(progress[phase.id]?.[step.id]);
            return (
              <li
                key={step.id}
                className={[
                  "bg-white rounded-xl shadow p-5 my-4 transition-all duration-300 hover:shadow-md",
                  done ? "border-l-4 border-green-500" : "border-l-4 border-gray-300"
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <div className="font-semibold">{step.order}. {step.title}</div>
                    <div className="text-sm opacity-70">{step.summary}</div>
                  </div>
                  <button
                    className="px-4 py-2 rounded-lg bg-black text-white hover:bg-blue-700 transition-all duration-300"
                    onClick={() => onOpenStep && onOpenStep(phase.id, step.id)}
                    disabled={locked}
                  >
                    {done ? 'Review' : 'Open'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PhasePage;


