import { coachingStateMachine, extractEntities, isProblemQuestion } from '../data/coachingStates';

export interface CoachingSessionData {
  pain_points: Array<{ text: string; who: string; example?: string; frequency?: string; impact?: string }>;
  impact_notes: Record<string, { freq?: number; timePer?: number; risks?: string[] }>;
  chosen_priority?: string;
  session_goals?: string[];
  root_cause_analysis?: string[];
  success_criteria?: string[];
  constraints_list?: string[];
  next_steps_plan?: string[];
  session_summary?: string[];
}

export interface CoachingSession {
  state: string;
  data: CoachingSessionData;
  completedStates: string[];
  progress: number;
}

export type CoachingEvent = 
  | { type: 'USER_SENT_QUESTION'; message: string }
  | { type: 'STAKEHOLDER_ANSWER'; message: string }
  | { type: 'USER_CLICK_NEXT' }
  | { type: 'ADD_PAIN_POINT'; painPoint: { text: string; who: string; example?: string } }
  | { type: 'UPDATE_IMPACT_NOTE'; painPoint: string; impact: { freq?: number; timePer?: number; risks?: string[] } }
  | { type: 'SET_PRIORITY'; priority: string }
  | { type: 'ADD_SESSION_NOTE'; category: string; note: string };

export function coachingReducer(session: CoachingSession, event: CoachingEvent): CoachingSession {
  const currentState = coachingStateMachine.states[session.state];
  if (!currentState) return session;

  // 1. Update data from event
  const updatedData = { ...session.data };
  
  switch (event.type) {
    case 'ADD_PAIN_POINT':
      updatedData.pain_points = [...updatedData.pain_points, event.painPoint];
      break;
    
    case 'UPDATE_IMPACT_NOTE':
      updatedData.impact_notes[event.painPoint] = event.impact;
      break;
    
    case 'SET_PRIORITY':
      updatedData.chosen_priority = event.priority;
      break;
    
    case 'ADD_SESSION_NOTE':
      const category = event.category as keyof CoachingSessionData;
      if (category === 'session_goals' || category === 'root_cause_analysis' || 
          category === 'success_criteria' || category === 'constraints_list' || 
          category === 'next_steps_plan' || category === 'session_summary') {
        if (!updatedData[category]) {
          updatedData[category] = [];
        }
        updatedData[category]!.push(event.note);
      }
      break;
  }

  // 2. Evaluate transitions for current state
  let nextState = session.state;
  let shouldTransition = false;

  for (const transition of currentState.transitions) {
    if (transition.on === event.type) {
      // Check if conditions are met
      if (transition.if) {
        const conditionsMet = transition.if.every(condition => {
          switch (condition) {
            case 'is_problem_question':
              return event.type === 'USER_SENT_QUESTION' && isProblemQuestion(event.message);
            
            case '>=2_pain_points_captured':
              return updatedData.pain_points.length >= 2;
            
            case 'has_prioritisation_signal':
              if (event.type === 'STAKEHOLDER_ANSWER') {
                const entities = extractEntities(event.message);
                return entities.includes('mentions_priority');
              }
              return false;
            
            case 'priority_chosen':
              return !!updatedData.chosen_priority;
            
            case 'root_cause_identified':
              if (event.type === 'STAKEHOLDER_ANSWER') {
                const entities = extractEntities(event.message);
                return entities.includes('mentions_process') || entities.includes('mentions_handoff');
              }
              return false;
            
            case 'success_criteria_defined':
              if (event.type === 'STAKEHOLDER_ANSWER') {
                const entities = extractEntities(event.message);
                return entities.includes('mentions_metrics') || entities.includes('mentions_time');
              }
              return false;
            
            case 'constraints_identified':
              if (event.type === 'STAKEHOLDER_ANSWER') {
                const entities = extractEntities(event.message);
                return entities.includes('mentions_approval') || entities.includes('mentions_deadline');
              }
              return false;
            
            case 'next_steps_agreed':
              if (event.type === 'STAKEHOLDER_ANSWER') {
                const entities = extractEntities(event.message);
                return entities.includes('mentions_people') || event.message.toLowerCase().includes('yes');
              }
              return false;
            
            default:
              return false;
          }
        });
        
        if (conditionsMet) {
          nextState = transition.to;
          shouldTransition = true;
          break;
        }
      } else {
        // No conditions, just transition
        nextState = transition.to;
        shouldTransition = true;
        break;
      }
    }
  }

  // 3. Update completed states and progress
  let completedStates = [...session.completedStates];
  if (shouldTransition && !completedStates.includes(session.state)) {
    completedStates.push(session.state);
  }

  // Calculate progress
  const totalWeight = Object.values(coachingStateMachine.states).reduce((sum, state) => sum + state.progressWeight, 0);
  const completedWeight = completedStates.reduce((sum, stateId) => {
    const state = coachingStateMachine.states[stateId];
    return sum + (state?.progressWeight || 0);
  }, 0);
  const progress = Math.round((completedWeight / totalWeight) * 100);

  return {
    state: nextState,
    data: updatedData,
    completedStates,
    progress
  };
}

export function initializeCoachingSession(): CoachingSession {
  return {
    state: coachingStateMachine.initial,
    data: {
      pain_points: [],
      impact_notes: {}
    },
    completedStates: [],
    progress: 0
  };
}

export function getCurrentState(session: CoachingSession) {
  return coachingStateMachine.states[session.state];
}

export function canTransitionToNext(session: CoachingSession): boolean {
  const currentState = getCurrentState(session);
  if (!currentState) return false;

  // Check if exit conditions are met
  return currentState.exit.conditions.some(condition => {
    switch (condition) {
      case 'min_items_captured':
        return session.data.pain_points.length >= 2;
      case 'captured_frequency_and_cost':
        return Object.keys(session.data.impact_notes).length > 0;
      case 'priority_chosen':
        return !!session.data.chosen_priority;
      case 'root_cause_identified':
        return session.data.root_cause_analysis && session.data.root_cause_analysis.length > 0;
      case 'success_criteria_defined':
        return session.data.success_criteria && session.data.success_criteria.length > 0;
      case 'constraints_identified':
        return session.data.constraints_list && session.data.constraints_list.length > 0;
      case 'next_steps_agreed':
        return session.data.next_steps_plan && session.data.next_steps_plan.length > 0;
      default:
        return true; // For user_clicked_next and other manual transitions
    }
  });
}

export function generateSummary(session: CoachingSession): string {
  const { data } = session;
  
  if (data.pain_points.length === 0) {
    return "We're just getting started. Let me know when you'd like to begin exploring the challenges.";
  }

  const topPains = data.pain_points.slice(0, 2).map(p => p.text).join(', ');
  const frequency = data.pain_points[0]?.frequency || 'regularly';
  const timeLost = data.pain_points[0]?.impact || 'significant time';
  const priority = data.chosen_priority || data.pain_points[0]?.text || 'the main issue';

  return `So far I'm hearing ${topPains} happening ${frequency} causing ~${timeLost} lost. If we solved one first, it sounds like ${priority} would make the biggest difference. Did I capture that correctly?`;
}
