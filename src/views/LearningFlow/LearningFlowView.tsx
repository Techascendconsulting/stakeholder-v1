import React, { useState } from 'react';
import ModuleList from './ModuleList';
import LessonView from './LessonView';

/**
 * LearningFlowView
 * 
 * Main container for the sequential learning system
 * Manages navigation between module list and individual lessons
 */
const LearningFlowView: React.FC = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModuleId(moduleId);
  };

  const handleBackToModules = () => {
    setSelectedModuleId(null);
  };

  return (
    <>
      {selectedModuleId ? (
        <LessonView 
          moduleId={selectedModuleId} 
          onBack={handleBackToModules} 
        />
      ) : (
        <ModuleList 
          onModuleSelect={handleModuleSelect} 
        />
      )}
    </>
  );
};

export default LearningFlowView;

