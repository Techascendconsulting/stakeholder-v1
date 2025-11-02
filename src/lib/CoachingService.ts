// Mock CoachingService for testing
export interface CoachingResponse {
  verdict: 'GOOD' | 'AMBER' | 'OOS';
  feedback: string;
  matchedSuggestedQuestion?: boolean;
  suggestion?: string;
}

export interface FollowUpResponse {
  nextQuestion: string;
  why: string;
  how: string;
}

export const evaluateMessage = async (message: string, phase: string): Promise<CoachingResponse> => {
  // Mock implementation - in real app this would call AI service
  return {
    verdict: 'GOOD',
    feedback: 'That was a great question to explore the problem.',
    matchedSuggestedQuestion: true,
  };
};

export const generateNextQuestion = async (stakeholderResponse: string): Promise<FollowUpResponse> => {
  // Mock implementation - in real app this would call AI service
  return {
    nextQuestion: 'What impact is the slow onboarding process having on customer retention?',
    why: 'Stakeholders mentioned a delay. This probes impact.',
    how: 'Use impact-based questioning to uncover measurable consequences.',
  };
};

















