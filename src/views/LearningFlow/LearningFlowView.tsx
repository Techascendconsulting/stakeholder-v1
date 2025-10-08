import React, { useState } from 'react';
import ModuleList from './ModuleList';
import { useApp } from '../../contexts/AppContext';

/**
 * LearningFlowView
 * 
 * Shows module cards with lock/unlock status
 * When clicked, navigates to the actual existing page (Core Learning, Project Initiation, etc.)
 * Same content/design as existing students see, just with progress tracking
 */
const LearningFlowView: React.FC = () => {
  const { setCurrentView } = useApp();

  const handleModuleSelect = (moduleId: string) => {
    // Map module IDs to existing page views
    const moduleToViewMap: Record<string, string> = {
      'module-1-core-learning': 'core-learning',
      'module-2-project-initiation': 'project-initiation',
      'module-3-elicitation': 'elicitation',
      'module-4-process-mapping': 'process-mapper',
      'module-5-requirements-engineering': 'requirements-engineering',
      'module-6-solution-options': 'solution-options',
      'module-7-documentation': 'documentation',
      'module-8-agile': 'agile-scrum',
      'module-9-scrum': 'scrum-essentials',
      'module-10-advanced': 'core-learning', // Placeholder for now
    };

    const viewId = moduleToViewMap[moduleId];
    if (viewId) {
      setCurrentView(viewId);
    }
  };

  return <ModuleList onModuleSelect={handleModuleSelect} />;
};

export default LearningFlowView;



