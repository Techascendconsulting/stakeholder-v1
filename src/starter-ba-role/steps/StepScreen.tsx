import React from 'react';
import { phases, sections, steps } from '../services/mockData';
import { StepRenderer } from '../components/StepRenderer';

interface StepScreenProps {
  phaseSlug: string;
  stepId: string;
  onNavigate: (to: string) => void;
}

const StepScreen: React.FC<StepScreenProps> = ({ phaseSlug, stepId, onNavigate }) => {
  const step = steps.find(s => s.id === stepId);
  if (!step) return null;
  const section = sections.find(sc => sc.id === step.sectionId);
  const phase = phases.find(p => p.id === (section ? section.phaseId : ''));
  const base = '/start-your-ba-role';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-black px-6 py-10">
      <div className="w-full max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => onNavigate(`${base}/phase/${phaseSlug}`)} className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
            ← Back to Phase
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">{phase?.title}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 md:p-12">
          <StepRenderer step={step} onComplete={() => {
            // For now, simply go back to journey on completion; real sequencing handled in parent design
            onNavigate(`${base}/journey`);
          }} />
        </div>
      </div>
    </div>
  );
};

export default StepScreen;


