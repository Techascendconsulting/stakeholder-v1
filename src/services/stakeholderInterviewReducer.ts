import { stakeholderInterviewBlueprint } from '../data/stakeholderInterviewBlueprint';

export interface StakeholderInterviewSession {
  state: string;
  progress: number;
  completedStates: string[];
  data: {
    pain_points: Array<{ text: string; who: string; example?: string }>;
    session_notes: string[];
    impact_notes: string[];
    priority_choice: string;
    root_causes: string[];
    success_measures: string[];
    success_strategies: string[];
    constraints: string[];
    next_steps: string[];
  };
}

export const createInitialSession = (): StakeholderInterviewSession => {
  const session = {
    state: stakeholderInterviewBlueprint.initial,
    progress: 0,
    completedStates: [],
    data: {
      pain_points: [],
      session_notes: [],
      impact_notes: [],
      priority_choice: '',
      root_causes: [],
      success_measures: [],
      success_strategies: [],
      constraints: [],
      next_steps: []
    }
  };
  
  console.log('🔧 DEBUG - Created initial session:', {
    state: session.state,
    initial: stakeholderInterviewBlueprint.initial,
    data: session.data
  });
  
  return session;
};

export const getCurrentState = (session: StakeholderInterviewSession) => {
  return stakeholderInterviewBlueprint.states[session.state];
};

export const canTransitionToNext = (session: StakeholderInterviewSession): boolean => {
  const currentState = getCurrentState(session);
  if (!currentState) return false;

  // Check if there are any transitions available
  return currentState.transitions.length > 0;
};

export const transitionToNext = (session: StakeholderInterviewSession): StakeholderInterviewSession => {
  const currentState = getCurrentState(session);
  if (!currentState || currentState.transitions.length === 0) {
    return session;
  }

  // For now, just take the first available transition
  // In a more sophisticated implementation, you'd check conditions
  const nextState = currentState.transitions[0].to;
  
  return {
    ...session,
    state: nextState,
    completedStates: [...session.completedStates, session.state],
    progress: calculateProgress(nextState, [...session.completedStates, session.state])
  };
};

export const calculateProgress = (currentState: string, completedStates: string[]): number => {
  const states = stakeholderInterviewBlueprint.states;
  const allStates = Object.keys(states);
  
  let totalWeight = 0;
  let completedWeight = 0;
  
  allStates.forEach(stateId => {
    const state = states[stateId];
    totalWeight += state.progressWeight;
    
    if (completedStates.includes(stateId) || stateId === currentState) {
      completedWeight += state.progressWeight;
    }
  });
  
  return Math.round((completedWeight / totalWeight) * 100);
};

export const addPainPoint = (
  session: StakeholderInterviewSession, 
  painPoint: { text: string; who: string; example?: string }
): StakeholderInterviewSession => {
  return {
    ...session,
    data: {
      ...session.data,
      pain_points: [...session.data.pain_points, painPoint]
    }
  };
};

export const addSessionNote = (
  session: StakeholderInterviewSession,
  category: string,
  note: string
): StakeholderInterviewSession => {
  return {
    ...session,
    data: {
      ...session.data,
      session_notes: [...session.data.session_notes, `${category}: ${note}`]
    }
  };
};

export const setPriorityChoice = (
  session: StakeholderInterviewSession,
  priority: string
): StakeholderInterviewSession => {
  return {
    ...session,
    data: {
      ...session.data,
      priority_choice: priority
    }
  };
};

export const addSuccessMeasure = (
  session: StakeholderInterviewSession,
  measure: string
): StakeholderInterviewSession => {
  return {
    ...session,
    data: {
      ...session.data,
      success_measures: [...session.data.success_measures, measure]
    }
  };
};

export const addSuccessStrategy = (
  session: StakeholderInterviewSession,
  strategy: string
): StakeholderInterviewSession => {
  return {
    ...session,
    data: {
      ...session.data,
      success_strategies: [...session.data.success_strategies, strategy]
    }
  };
};

export const addConstraint = (
  session: StakeholderInterviewSession,
  constraint: string
): StakeholderInterviewSession => {
  return {
    ...session,
    data: {
      ...session.data,
      constraints: [...session.data.constraints, constraint]
    }
  };
};

export const addNextStep = (
  session: StakeholderInterviewSession,
  nextStep: string
): StakeholderInterviewSession => {
  return {
    ...session,
    data: {
      ...session.data,
      next_steps: [...session.data.next_steps, nextStep]
    }
  };
};

export const generateSummary = (session: StakeholderInterviewSession): string => {
  const currentState = getCurrentState(session);
  if (!currentState) return '';

  let summary = currentState.cards.summary_template;
  
  // Replace placeholders with actual data
  if (session.data.pain_points.length >= 2) {
    summary = summary.replace('{{pain_1}}', session.data.pain_points[0]?.text || 'challenge 1');
    summary = summary.replace('{{pain_2}}', session.data.pain_points[1]?.text || 'challenge 2');
  }
  
  if (session.data.priority_choice) {
    summary = summary.replace('{{priority_pain}}', session.data.priority_choice);
  }
  
  // Add more placeholder replacements as needed
  summary = summary.replace('{{freq}}', 'regularly');
  summary = summary.replace('{{time_lost}}', 'significant time');
  summary = summary.replace('{{risk}}', 'various risks');
  summary = summary.replace('{{desired_outcome}}', 'improved outcomes');
  summary = summary.replace('{{metric}}', 'key metrics');
  summary = summary.replace('{{constraint}}', 'identified constraints');
  summary = summary.replace('{{owner}}', 'key stakeholders');
  summary = summary.replace('{{X}}', 'measurable improvements');
  summary = summary.replace('{{Y}}', 'next steps');
  summary = summary.replace('{{stakeholders}}', 'relevant team members');
  
  return summary;
};

export const getSessionSummary = (session: StakeholderInterviewSession): string => {
  const summary = [];
  
  if (session.data.pain_points.length > 0) {
    summary.push(`Pain Points Identified: ${session.data.pain_points.length}`);
    session.data.pain_points.forEach((pain, index) => {
      summary.push(`  ${index + 1}. ${pain.text} (affects: ${pain.who})`);
    });
  }
  
  if (session.data.priority_choice) {
    summary.push(`Priority Focus: ${session.data.priority_choice}`);
  }
  
  if (session.data.success_measures.length > 0) {
    summary.push(`Success Measures: ${session.data.success_measures.join(', ')}`);
  }
  
  if (session.data.constraints.length > 0) {
    summary.push(`Constraints: ${session.data.constraints.join(', ')}`);
  }
  
  if (session.data.next_steps.length > 0) {
    summary.push(`Next Steps: ${session.data.next_steps.join(', ')}`);
  }
  
  return summary.join('\n');
};
