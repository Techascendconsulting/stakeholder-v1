import { SessionState, TrainingStage, PainPoint } from '../types/training';

export class SessionStateManager {
  private static instance: SessionStateManager;
  private sessionStates: Map<string, SessionState> = new Map();

  static getInstance(): SessionStateManager {
    if (!SessionStateManager.instance) {
      SessionStateManager.instance = new SessionStateManager();
    }
    return SessionStateManager.instance;
  }

  initializeSession(sessionId: string, stage: TrainingStage): SessionState {
    const initialState: SessionState = {
      currentPhase: stage,
      phaseProgress: 0,
      totalPhases: this.getTotalPhases(stage),
      completedPhases: [],
      currentCardId: this.getInitialCardId(stage),
      painPoints: [],
      sessionNotes: []
    };

    this.sessionStates.set(sessionId, initialState);
    return initialState;
  }

  getSessionState(sessionId: string): SessionState | null {
    return this.sessionStates.get(sessionId) || null;
  }

  updateSessionState(sessionId: string, updates: Partial<SessionState>): SessionState | null {
    const currentState = this.sessionStates.get(sessionId);
    if (!currentState) return null;

    const updatedState = { ...currentState, ...updates };
    this.sessionStates.set(sessionId, updatedState);
    return updatedState;
  }

  advanceToNextCard(sessionId: string): SessionState | null {
    const state = this.sessionStates.get(sessionId);
    if (!state) return null;

    const nextCardId = this.getNextCardId(state.currentPhase, state.currentCardId);
    if (nextCardId) {
      return this.updateSessionState(sessionId, {
        currentCardId: nextCardId,
        phaseProgress: state.phaseProgress + 1
      });
    }

    // If no next card, advance to next phase
    return this.advanceToNextPhase(sessionId);
  }

  private advanceToNextPhase(sessionId: string): SessionState | null {
    const state = this.sessionStates.get(sessionId);
    if (!state) return null;

    const nextPhase = this.getNextPhase(state.currentPhase);
    if (nextPhase) {
      return this.updateSessionState(sessionId, {
        currentPhase: nextPhase,
        phaseProgress: 0,
        totalPhases: this.getTotalPhases(nextPhase),
        completedPhases: [...state.completedPhases, state.currentPhase],
        currentCardId: this.getInitialCardId(nextPhase)
      });
    }

    return state; // Session complete
  }

  addPainPoint(sessionId: string, painPoint: Omit<PainPoint, 'id'>): SessionState | null {
    const state = this.sessionStates.get(sessionId);
    if (!state) return null;

    const newPainPoint: PainPoint = {
      ...painPoint,
      id: `pain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    return this.updateSessionState(sessionId, {
      painPoints: [...state.painPoints, newPainPoint]
    });
  }

  updatePainPoint(sessionId: string, painPointId: string, updates: Partial<PainPoint>): SessionState | null {
    const state = this.sessionStates.get(sessionId);
    if (!state) return null;

    const updatedPainPoints = state.painPoints.map(p => 
      p.id === painPointId ? { ...p, ...updates } : p
    );

    return this.updateSessionState(sessionId, { painPoints: updatedPainPoints });
  }

  addSessionNote(sessionId: string, note: string): SessionState | null {
    const state = this.sessionStates.get(sessionId);
    if (!state) return null;

    return this.updateSessionState(sessionId, {
      sessionNotes: [...state.sessionNotes, note]
    });
  }

  private getTotalPhases(stage: TrainingStage): number {
    switch (stage) {
      case 'problem_exploration': return 4;
      case 'as_is': return 2;
      case 'to_be': return 2;
      case 'solution_design': return 2;
      default: return 1;
    }
  }

  private getInitialCardId(stage: TrainingStage): string {
    switch (stage) {
      case 'problem_exploration': return 'warm-up';
      case 'as_is': return 'process-mapping';
      case 'to_be': return 'future-vision';
      case 'solution_design': return 'solution-options';
      default: return 'warm-up';
    }
  }

  private getNextCardId(stage: TrainingStage, currentCardId: string): string | null {
    const cardSequences = {
      problem_exploration: ['warm-up', 'pain-points', 'impact-quantification', 'prioritization'],
      as_is: ['process-mapping', 'inefficiency-identification'],
      to_be: ['future-vision', 'requirements-gathering'],
      solution_design: ['solution-options', 'option-evaluation']
    };

    const sequence = cardSequences[stage] || [];
    const currentIndex = sequence.indexOf(currentCardId);
    
    if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
      return sequence[currentIndex + 1];
    }

    return null; // No next card in this phase
  }

  private getNextPhase(currentPhase: TrainingStage): TrainingStage | null {
    const phaseSequence: TrainingStage[] = ['problem_exploration', 'as_is', 'to_be', 'solution_design'];
    const currentIndex = phaseSequence.indexOf(currentPhase);
    
    if (currentIndex >= 0 && currentIndex < phaseSequence.length - 1) {
      return phaseSequence[currentIndex + 1];
    }

    return null; // No next phase
  }

  analyzeUserMessage(message: string, sessionId: string): {
    detectedSkill: string;
    suggestedNextStep: string;
    confidence: number;
  } {
    const messageLower = message.toLowerCase();
    
    // Analyze the type of question/statement
    if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
      return {
        detectedSkill: 'Meeting Setup',
        suggestedNextStep: 'Move to pain point exploration',
        confidence: 0.9
      };
    }

    if (messageLower.includes('challenge') || messageLower.includes('problem') || messageLower.includes('issue') || messageLower.includes('frustrat')) {
      return {
        detectedSkill: 'Problem Discovery',
        suggestedNextStep: 'Quantify the impact',
        confidence: 0.8
      };
    }

    if (messageLower.includes('time') || messageLower.includes('often') || messageLower.includes('frequency') || messageLower.includes('impact')) {
      return {
        detectedSkill: 'Impact Analysis',
        suggestedNextStep: 'Prioritize the problems',
        confidence: 0.7
      };
    }

    if (messageLower.includes('priority') || messageLower.includes('first') || messageLower.includes('important') || messageLower.includes('urgent')) {
      return {
        detectedSkill: 'Problem Prioritization',
        suggestedNextStep: 'Explore root causes',
        confidence: 0.8
      };
    }

    return {
      detectedSkill: 'General Inquiry',
      suggestedNextStep: 'Continue conversation',
      confidence: 0.5
    };
  }
}




