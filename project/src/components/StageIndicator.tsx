import React from 'react';

interface StageIndicatorProps {
  currentStage: { id: string; name: string; objective: string };
  stageIndex: number;
  totalStages: number;
  onNextStage: () => void;
  canAdvance: boolean;
}

export default function StageIndicator({ 
  currentStage, 
  stageIndex, 
  totalStages, 
  onNextStage, 
  canAdvance 
}: StageIndicatorProps) {
  return (
    <div className="bg-gray-50 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        {/* Stage Progress */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Stage {stageIndex + 1} of {totalStages}</span>
          <div className="flex space-x-1">
            {Array.from({ length: totalStages }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= stageIndex ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Next Stage Button */}
        {canAdvance && (
          <button
            onClick={onNextStage}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <span>Next Stage</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Current Stage Card */}
      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">{stageIndex + 1}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{currentStage.name}</h3>
            <p className="text-sm text-gray-600">{currentStage.objective}</p>
          </div>
        </div>
      </div>
    </div>
  );
}