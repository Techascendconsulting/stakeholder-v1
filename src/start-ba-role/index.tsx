import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JourneyMap from './components/JourneyMap';
import PhasePage from './components/PhasePage';
import StepPage from './components/StepPage';
import { journeyData, Phase, Step } from './data/journeyData';

const StartBaRoleEntry: React.FC = () => {
  const navigate = useNavigate();
  const { phaseId, stepId } = useParams();

  // Helper: find phase by code (we treat phaseId as the phase code, e.g. "P0")
  const phase: Phase | undefined = phaseId
    ? journeyData.find((p) => p.code.toLowerCase() === phaseId.toLowerCase())
    : undefined;

  const step: Step | undefined =
    phase && stepId
      ? phase.steps.find((s) => String(s.number) === String(stepId))
      : undefined;

  const handlePhaseClick = (p: Phase) => {
    navigate(`/start-ba-role/phase/${encodeURIComponent(p.code)}`);
  };

  const handleBackToJourney = () => {
    navigate('/start-ba-role');
  };

  const handleStepClick = (s: Step) => {
    if (!phase) return;
    navigate(`/start-ba-role/phase/${encodeURIComponent(phase.code)}/step/${s.number}`);
  };

  const handleStepBackToPhase = () => {
    if (!phase) {
      navigate('/start-ba-role');
    } else {
      navigate(`/start-ba-role/phase/${encodeURIComponent(phase.code)}`);
    }
  };

  const handleStepNext = () => {
    if (!phase || !step) return;
    const next = phase.steps.find((s) => s.number === step.number + 1);
    if (next) {
      navigate(`/start-ba-role/phase/${encodeURIComponent(phase.code)}/step/${next.number}`);
    }
  };

  const handleStepPrevious = () => {
    if (!phase || !step) return;
    const prev = phase.steps.find((s) => s.number === step.number - 1);
    if (prev) {
      navigate(`/start-ba-role/phase/${encodeURIComponent(phase.code)}/step/${prev.number}`);
    }
  };

  const handleStepComplete = () => {
    // Placeholder: completion logic can later be wired to progress storage
    // For now we simply log and keep navigation behavior unchanged
    console.log('Start Your BA Role: step completed', { phase: phase?.code, step: step?.number });
  };

  // Routing logic inside Start Your BA Role
  if (!phaseId && !stepId) {
    // Journey map view
    return <JourneyMap onPhaseClick={handlePhaseClick} />;
  }

  if (phaseId && !stepId) {
    // Phase page view
    if (!phase) {
      // Unknown phase -> go back to journey
      handleBackToJourney();
      return null;
    }
    return (
      <PhasePage
        phase={phase}
        onBack={handleBackToJourney}
        onStepClick={handleStepClick}
      />
    );
  }

  // Step page view
  if (!phase || !step) {
    // If either is missing, return to phase or journey as fallback
    if (phase) {
      handleStepBackToPhase();
    } else {
      handleBackToJourney();
    }
    return null;
  }

  const hasPrevious = step.number > 1;
  const hasNext = step.number < phase.steps.length;

  return (
    <StepPage
      step={step}
      onBack={handleStepBackToPhase}
      onComplete={handleStepComplete}
      onNext={handleStepNext}
      onPrevious={handleStepPrevious}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
    />
  );
};

export default StartBaRoleEntry;


