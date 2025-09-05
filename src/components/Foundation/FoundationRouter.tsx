import React from 'react';
import { useParams } from 'react-router-dom';
import { FoundationWizardView } from '../Views/FoundationWizardView';

export const FoundationRouter: React.FC = () => {
  const { step } = useParams<{ step?: string }>();

  // For now, we'll use the existing FoundationWizardView
  // Later we can create individual step components if needed
  return <FoundationWizardView initialStep={step} />;
};
