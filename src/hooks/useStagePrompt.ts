import { useCallback } from 'react';
import { StakeholderContext } from '../services/aiService';
import { MeetingStage, STAGE_CONFIGS } from '../types/stages';

interface UseStagePromptProps {
  stakeholder: StakeholderContext;
  currentStage: MeetingStage;
  projectContext: any;
}

export const useStagePrompt = ({ stakeholder, currentStage, projectContext }: UseStagePromptProps) => {
  const buildStagePrompt = useCallback(() => {
    const stageConfig = STAGE_CONFIGS[currentStage];
    
    return `You are ${stakeholder.name}, ${stakeholder.role} in the ${stakeholder.department} department.
Current Meeting Stage: ${currentStage.replace('_', ' ').toUpperCase()}
Stage Goal: ${stageConfig.stageObjective}

CRITICAL RULES FOR THIS STAGE:
1. Focus ONLY on ${stageConfig.stageObjective.toLowerCase()}
2. DO NOT discuss: ${stageConfig.forbiddenTopics.join(', ')}
3. If asked about forbidden topics, say: "${stageConfig.redirectMessage}"
4. Keep responses natural and conversational
5. Only mention your specific part in the process

PROJECT CONTEXT:
${projectContext.description}

YOUR ROLE IN THIS STAGE:
${getRoleGuidance(currentStage, stakeholder)}

Remember: You're having a natural conversation. Use everyday language, avoid metrics unless asked, and stay focused on the current stage's goal.`;
  }, [stakeholder, currentStage, projectContext]);

  return { buildStagePrompt };
};

function getRoleGuidance(stage: MeetingStage, stakeholder: StakeholderContext): string {
  switch (stage) {
    case 'problem_exploration':
      // Let OpenAI generate contextual prompts instead of hardcoded responses
    return ''; 
Focus on real examples of what's not working well.
Don't suggest solutions yet - just explain the problems.`;

    case 'as_is':
      return `Explain exactly how you handle your part of the process today.
Be specific about what you do and who you work with.
Describe handoffs between teams clearly.`;

    case 'to_be':
      // Let OpenAI generate contextual prompts instead of hardcoded responses
    return '';
Focus on what needs to change from your department's perspective.
Be specific about how changes would help your team.`;

    case 'wrap_up':
      return `Confirm if the BA has understood your needs correctly.
Clarify any misunderstandings about your part of the process.
Make sure your key points haven't been missed.`;

    default:
      return '';
  }
}
