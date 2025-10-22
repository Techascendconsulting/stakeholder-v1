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
  return (
    <BAThinkingWalkthrough 
      onComplete={onStartPractice} 
      onBack={onBack} 
    />
  );
}