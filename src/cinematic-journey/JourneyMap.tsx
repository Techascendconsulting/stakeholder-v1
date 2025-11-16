import React from 'react';
import { JOURNEY_PHASES } from './journeyData';
import { JourneyPhase } from './types';
import { loadProgress, isPhaseCompleted, isPhaseLocked } from './progressStorage';

interface JourneyMapProps {
  onOpenPhase?: (phaseId: string) => void;
}

const JourneyMap: React.FC<JourneyMapProps> = ({ onOpenPhase }) => {
  const progress = loadProgress();

  const handleOpen = (phase: JourneyPhase) => {
    if (onOpenPhase) onOpenPhase(phase.id);
  };

  return (
    <section className="w-full min-h-screen bg-[#f8f9fb] text-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-center text-3xl font-bold mb-3">Your BA Journey</h1>
        <p className="text-center text-sm opacity-70 mb-10">A simple map of phases P0–P9. Click a phase to view its steps.</p>

        <div className="relative -mx-6">
          <div className="px-6 overflow-x-auto">
            <div className="flex gap-6 md:gap-8 py-2 w-max md:w-auto md:flex-nowrap">
              {JOURNEY_PHASES.map((phase) => {
                const completed = isPhaseCompleted(phase, progress);
                const locked = isPhaseLocked(phase, progress, JOURNEY_PHASES);
                return (
                  <div
                    key={phase.id}
                    className={[
                      "relative bg-white rounded-2xl shadow-md p-6 w-64 shrink-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                      locked ? "cursor-not-allowed" : "cursor-pointer",
                      completed ? "ring-1 ring-green-200" : "ring-1 ring-gray-100"
                    ].join(" ")}
                    onClick={() => !locked && handleOpen(phase)}
                    title={locked ? "Locked until previous phase complete" : ""}
                  >
                    <div className="text-2xl font-extrabold">{phase.code}</div>
                    <div className="mt-1 font-semibold">{phase.title}</div>
                    <div className="mt-2 text-sm opacity-70 line-clamp-3">{phase.description}</div>
                    <div className="mt-4 text-xs opacity-70">
                      {completed ? 'Completed' : locked ? 'Locked' : 'Available'}
                    </div>
                    {locked && (
                      <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">Locked</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneyMap;


