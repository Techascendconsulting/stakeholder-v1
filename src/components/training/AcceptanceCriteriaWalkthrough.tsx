import React from "react";
import BAThinkingWalkthrough from "./BAThinkingWalkthrough";

interface AcceptanceCriteriaWalkthroughProps {
  onStartPractice: () => void;
  onBack: () => void;
  scenarioId?: string;
}

export default function AcceptanceCriteriaWalkthrough({ 
  onStartPractice, 
  onBack 
}: AcceptanceCriteriaWalkthroughProps) {
  console.log('🎯 ACCEPTANCE CRITERIA WALKTHROUGH: Rendering component');
  console.log('🎯 ACCEPTANCE CRITERIA WALKTHROUGH: Props', { onStartPractice, onBack });
  
  return (
    <BAThinkingWalkthrough 
      onComplete={onStartPractice} 
      onBack={onBack} 
    />
  );
}