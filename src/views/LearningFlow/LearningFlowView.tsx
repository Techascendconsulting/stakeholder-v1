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
      'module-3-stakeholder-mapping': 'stakeholder-mapping',
      'module-4-elicitation': 'elicitation',
      'module-5-process-mapping': 'process-mapper',
      'module-6-requirements-engineering': 'requirements-engineering',
      'module-7-solution-options': 'solution-options',
      'module-8-documentation': 'documentation',
      'module-9-design': 'design-hub',
      'module-10-mvp': 'mvp-hub',
      'module-11-agile-scrum': 'scrum-essentials',
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



