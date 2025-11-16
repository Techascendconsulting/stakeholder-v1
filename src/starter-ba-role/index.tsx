/**
 * Start Your BA Role - Main Entry (diagnostic-wrapped)
 * Cinematic UI with defensive logging to locate crashing module.
 */
import React from 'react';
import { phases as seedPhases, sections as seedSections, steps as seedSteps } from './services/mockData';
import type { FeatureState, ProgressStatus, Phase, Step } from './types/models';

// Dynamic, diagnostic imports with top-level await to catch evaluation errors
let JourneyService: any;
let JourneyMap: any;
let PhaseHero: any;
let StepLayout: any;
let PhaseCompleteOverlay: any;
let StepRenderer: any;

try {
  const m = await import('./services/journeyService');
  JourneyService = m.JourneyService || m.default;
  console.log('%cjourneyService loaded', 'color: green', JourneyService);
} catch (err) {
  console.error('%cjourneyService FAILED', 'color: red', err);
}

try {
  const m = await import('./components/JourneyMap');
  JourneyMap = m.JourneyMap || m.default;
  console.log('%cJourneyMap loaded', 'color: green');
} catch (err) {
  console.error('%cJourneyMap FAILED', 'color: red', err);
}

try {
  const m = await import('./components/PhaseHero');
  PhaseHero = m.PhaseHero || m.default;
  console.log('%cPhaseHero loaded', 'color: green');
} catch (err) {
  console.error('%cPhaseHero FAILED', 'color: red', err);
}

try {
  const m = await import('./components/StepLayout');
  StepLayout = m.StepLayout || m.default;
  console.log('%cStepLayout loaded', 'color: green');
} catch (err) {
  console.error('%cStepLayout FAILED', 'color: red', err);
}

try {
  const m = await import('./components/PhaseCompleteOverlay');
  PhaseCompleteOverlay = m.PhaseCompleteOverlay || m.default;
  console.log('%cPhaseCompleteOverlay loaded', 'color: green');
} catch (err) {
  console.error('%cPhaseCompleteOverlay FAILED', 'color: red', err);
}

try {
  const m = await import('./components/StepRenderer');
  StepRenderer = m.StepRenderer || m.default;
  console.log('%cStepRenderer loaded', 'color: green');
} catch (err) {
  console.error('%cStepRenderer FAILED', 'color: red', err);
}

// Feature flag
const isFlagOn = !!import.meta.env.VITE_FEATURE_STARTER_BA_ROLE;

// Seed data and service diagnostics
console.log('seedPhases:', seedPhases);
console.log('seedSections:', seedSections);
console.log('seedSteps:', seedSteps);
console.log('journeyService:', JourneyService);

type ViewMode = 'journey-map' | 'phase-hero' | 'step' | 'phase-complete';
interface ViewState {
  mode: ViewMode;
  phaseSlug?: string;
  stepId?: string;
}

const StartYourBARole: React.FC = () => {
  console.log("CINEMATIC ENTRY MOUNTED");
  if (!isFlagOn) return null;

  const [state, setState] = React.useState<FeatureState>(() => {
    const progress: Record<string, ProgressStatus> = {};
    for (const s of seedSteps) progress[s.id] = 'locked';
    // Unlock first step
    try {
      const firstPhase = [...seedPhases].sort((a, b) => a.order - b.order)[0];
      const firstSections = seedSections.filter(x => x.phaseId === firstPhase.id).sort((a, b) => a.order - b.order);
      const firstSection = firstSections[0];
      const firstSteps = seedSteps.filter(x => x.sectionId === firstSection.id).sort((a, b) => a.order - b.order);
      if (firstSteps[0]) progress[firstSteps[0].id] = 'unlocked';
    } catch (e) {
      console.error('Initial unlock failed:', e);
    }
    return { phases: seedPhases, sections: seedSections, steps: seedSteps, progress };
  });

  const [viewState, setViewState] = React.useState<ViewState>({ mode: 'journey-map' });

  const handleCompleteStep = (stepId: string) => {
    try {
      setState(prev => {
        const draft: FeatureState = { ...prev, progress: { ...prev.progress } };
        const step = prev.steps.find(s => s.id === stepId);
        if (!step || !JourneyService) return prev;
        draft.progress[step.id] = 'completed';

        const section = prev.sections.find(sc => sc.id === step.sectionId);
        if (!section) return draft;
        const phase = prev.phases.find(p => p.id === section.phaseId);
        if (!phase) return draft;

        const nextStep = JourneyService.findNextStepInSection(draft, section.id, step.order);
        if (nextStep) {
          draft.progress[nextStep.id] = draft.progress[nextStep.id] === 'completed' ? 'completed' : 'unlocked';
        } else {
          const nextSection = JourneyService.findNextSectionInPhase(draft, phase.id, section.order);
          if (nextSection) {
            const firstNext = JourneyService.getStepsForSection(draft, nextSection.id)[0];
            if (firstNext) draft.progress[firstNext.id] = 'unlocked';
          } else {
            const nextPhase = JourneyService.findNextPhase(draft, phase.order);
            if (nextPhase) {
              const nextPhaseSections = JourneyService.getSectionsForPhase(draft, nextPhase.id);
              if (nextPhaseSections[0]) {
                const firstNextPhase = JourneyService.getStepsForSection(draft, nextPhaseSections[0].id)[0];
                if (firstNextPhase) draft.progress[firstNextPhase.id] = 'unlocked';
              }
            }
          }
        }
        return draft;
      });
    } catch (err) {
      console.error('handleCompleteStep error:', err);
    }
  };

  const handleBeginJourney = () => {
    try {
      if (!JourneyService) return;
      const nextStep: Step | null = JourneyService.getNextUnlockedStep(state);
      if (nextStep) setViewState({ mode: 'step', stepId: nextStep.id });
    } catch (err) {
      console.error('handleBeginJourney error:', err);
    }
  };

  const handleClickPhase = (phase: Phase) => {
    try {
      if (!JourneyService) return;
      const status = JourneyService.getPhaseStatus(state, phase.id);
      if (status !== 'locked') setViewState({ mode: 'phase-hero', phaseSlug: phase.slug });
    } catch (err) {
      console.error('handleClickPhase error:', err);
    }
  };

  const handleBeginPhase = (phaseSlug: string) => {
    try {
      if (!JourneyService) return;
      const phase = JourneyService.getPhaseBySlug(state, phaseSlug);
      if (!phase) return;
      const sections = JourneyService.getSectionsForPhase(state, phase.id);
      for (const section of sections) {
        const steps = JourneyService.getStepsForSection(state, section.id);
        const unlocked = steps.find(s => state.progress[s.id] === 'unlocked');
        if (unlocked) { setViewState({ mode: 'step', stepId: unlocked.id }); return; }
      }
      if (sections[0]) {
        const firstSteps = JourneyService.getStepsForSection(state, sections[0].id);
        if (firstSteps[0]) setViewState({ mode: 'step', stepId: firstSteps[0].id });
      }
    } catch (err) {
      console.error('handleBeginPhase error:', err);
    }
  };

  const handleBackToJourney = () => setViewState({ mode: 'journey-map' });

  const handleBackToPhase = (stepId: string) => {
    try {
      if (!JourneyService) return;
      const phase = JourneyService.getPhaseForStep(state, stepId);
      if (phase) setViewState({ mode: 'phase-hero', phaseSlug: phase.slug });
      else handleBackToJourney();
    } catch (err) {
      console.error('handleBackToPhase error:', err);
    }
  };

  const handleNextStep = (currentStepId: string) => {
    try {
      if (!JourneyService) return;
      const nextStep = JourneyService.getNextStep(state, currentStepId);
      if (nextStep) setViewState({ mode: 'step', stepId: nextStep.id });
      else {
        const currentPhase = JourneyService.getPhaseForStep(state, currentStepId);
        if (currentPhase) {
          const phaseStatus = JourneyService.getPhaseStatus(state, currentPhase.id);
          if (phaseStatus === 'completed') setViewState({ mode: 'phase-complete', phaseSlug: currentPhase.slug });
          else handleBackToPhase(currentStepId);
        }
      }
    } catch (err) {
      console.error('handleNextStep error:', err);
    }
  };

  const handlePreviousStep = (currentStepId: string) => {
    try {
      if (!JourneyService) return;
      const previousStep = JourneyService.getPreviousStep(state, currentStepId);
      if (previousStep) setViewState({ mode: 'step', stepId: previousStep.id });
    } catch (err) {
      console.error('handlePreviousStep error:', err);
    }
  };

  const handleContinueToNextPhase = (currentPhaseSlug: string) => {
    try {
      if (!JourneyService) return;
      const currentPhase = JourneyService.getPhaseBySlug(state, currentPhaseSlug);
      if (currentPhase) {
        const nextPhase = JourneyService.findNextPhase(state, currentPhase.order);
        if (nextPhase) setViewState({ mode: 'phase-hero', phaseSlug: nextPhase.slug });
      }
    } catch (err) {
      console.error('handleContinueToNextPhase error:', err);
    }
  };

  try {
    switch (viewState.mode) {
      case 'journey-map': {
        if (!state.phases.length) {
          console.log("⚠️ No phases, showing Journey Map fallback");
        }
        return JourneyMap ? (
          <JourneyMap
            state={state}
            onBeginJourney={handleBeginJourney}
            onClickPhase={handleClickPhase}
          />
        ) : <div style={{ padding: 40 }}>JourneyMap failed to load</div>;
      }

      case 'phase-hero': {
        const phase = viewState.phaseSlug && JourneyService
          ? JourneyService.getPhaseBySlug(state, viewState.phaseSlug)
          : null;
        if (!phase) {
          console.log("⚠️ No current phase, showing Journey Map fallback");
          return JourneyMap ? (
            <JourneyMap
              state={state}
              onBeginJourney={handleBeginJourney}
              onClickPhase={handleClickPhase}
            />
          ) : <div style={{ padding: 40 }}>JourneyMap failed to load</div>;
        }
        return PhaseHero ? (
          <PhaseHero
            phase={phase}
            state={state}
            onBack={handleBackToJourney}
            onBeginPhase={() => handleBeginPhase(phase.slug)}
          />
        ) : <div style={{ padding: 40 }}>PhaseHero failed to load</div>;
      }

      case 'step': {
        const step = viewState.stepId ? state.steps.find(s => s.id === viewState.stepId) : null;
        if (!step) {
          console.log("⚠️ No step, showing Journey Map fallback");
          return JourneyMap ? (
            <JourneyMap
              state={state}
              onBeginJourney={handleBeginJourney}
              onClickPhase={handleClickPhase}
            />
          ) : <div style={{ padding: 40 }}>JourneyMap failed to load</div>;
        }
        return StepLayout ? (
          <StepLayout
            step={step}
            state={state}
            onBackToPhase={() => handleBackToPhase(step.id)}
            onPreviousStep={() => handlePreviousStep(step.id)}
            onNextStep={() => handleNextStep(step.id)}
            onCompleteStep={() => handleCompleteStep(step.id)}
          />
        ) : <div style={{ padding: 40 }}>StepLayout failed to load</div>;
      }

      case 'phase-complete': {
        const completedPhase = viewState.phaseSlug && JourneyService
          ? JourneyService.getPhaseBySlug(state, viewState.phaseSlug)
          : null;
        const nextPhase = completedPhase && JourneyService
          ? JourneyService.findNextPhase(state, completedPhase.order)
          : null;
        return PhaseCompleteOverlay ? (
          <PhaseCompleteOverlay
            completedPhase={completedPhase}
            nextPhase={nextPhase}
            onBackToJourney={handleBackToJourney}
            onContinueToNextPhase={
              nextPhase ? () => handleContinueToNextPhase(completedPhase.slug) : undefined
            }
          />
        ) : <div style={{ padding: 40 }}>PhaseCompleteOverlay failed to load</div>;
      }

      default:
        return <div style={{ padding: 40 }}>Unknown view</div>;
    }
  } catch (err) {
    console.error('ROOT RENDER FAILED:', err);
    return <div style={{ padding: 40 }}>Render failed</div>;
  }
};

export default StartYourBARole;

 


