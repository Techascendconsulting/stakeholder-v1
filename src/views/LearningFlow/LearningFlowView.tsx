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
    console.log('🎯 Module clicked:', moduleId);
    
    // Map module IDs to existing page views
    const moduleToViewMap: Record<string, string> = {
      'module-1-core-learning': 'core-learning',
      'module-2-project-initiation': 'project-initiation',
      'module-3-elicitation': 'elicitation',
      'module-4-process-mapping': 'process-mapper',
      'module-5-requirements-engineering': 'requirements-engineering',
      'module-6-solution-options': 'solution-options',
      'module-7-documentation': 'documentation',
      'module-8-design': 'design-hub',
      'module-9-mvp': 'mvp-hub',
      'module-10-agile-scrum': 'scrum-essentials',
    };

    const viewId = moduleToViewMap[moduleId];
    console.log('🔀 Navigating to view:', viewId);
    
    if (viewId) {
      setCurrentView(viewId);
      console.log('✅ Navigation triggered to:', viewId);
    } else {
      console.error('❌ No view mapping found for module:', moduleId);
    }
  };

  return <ModuleList onModuleSelect={handleModuleSelect} />;
};

export default LearningFlowView;



