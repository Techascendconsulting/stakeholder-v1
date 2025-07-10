// Filename: src/lib/StakeholderAI.ts
//
// FINAL, RELIABLE VERSION: This implements a two-step AI call process.
// 1. A "Director" AI call to choose the speaker.
// 2. An "Actor" AI call for the chosen stakeholder to generate the response.
// This is the most robust way to solve the "one person talking" problem.

import OpenAI from 'openai'
import { Stakeholder, Project, Message } from '../types'

// This can be an interface if you have a types.ts file
interface ConversationContext {
  projectId: string
  stakeholderIds: string[]
  messages: Message[]
  meetingType: 'individual' | 'group'
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

class StakeholderAI {
  /**
   * This is the main function that now orchestrates the two-call process.
   */
  public async generateGroupResponse(
    context: ConversationContext,
    project: Project,
    allStakeholders: Stakeholder[],
    userMessage: string
  ): Promise<Message> {
    try {
      // =================================================================
      // STEP 1: Call the "Director" AI to decide who should speak next.
      // =================================================================
      const speakerId = await this.chooseNextSpeaker(context, allStakeholders, userMessage);
      
      const speakingStakeholder = allStakeholders.find(s => s.id === speakerId);
      if (!speakingStakeholder) {
        // If the director fails, fall back to the first stakeholder to avoid crashing.
        console.error(`Director AI chose an invalid speaker ID: ${speakerId}. Defaulting to the first stakeholder.`);
        const firstStakeholder = allStakeholders[0];
        return this.generateActorResponse(context, firstStakeholder, userMessage);
      }

      // =================================================================
      // STEP 2: Call the "Actor" AI to generate a response for the chosen speaker.
      // =================================================================
      return this.generateActorResponse(context, speakingStakeholder, userMessage);

    } catch (error) {
      console.error('Error in the two-step AI response generation:', error);
      return {
        id: `stakeholder-fallback-${Date.now()}`,
        speaker: 'system',
        content: "I'm sorry, my internal process has failed. Please give me a moment and try again.",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * AI Call 1: The Director.
   * Its only job is to return the ID of the next speaker.
   */
  private async chooseNextSpeaker(
    context: ConversationContext,
    allStakeholders: Stakeholder[],
    userMessage: string
  ): Promise<string> {
    const history = context.messages.slice(-10).map(msg => `${msg.stakeholderName || 'BA'}: ${msg.content}`).join('\n');
    const stakeholderProfiles = allStakeholders.map(s => `- ID: "${s.id}", Name: ${s.name}, Role: ${s.role}`).join('\n');

    const directorSystemPrompt = `You are a silent meeting director. Your only job is to decide which stakeholder should speak next. Analyze the conversation and the user's last message.

STAKEHOLDERS:
${stakeholderProfiles}

CONVERSATION HISTORY:
${history}

BUSINESS ANALYST'S (USER'S) LATEST MESSAGE:
"${userMessage}"

RULES:
1.  Read the user's message. Is it for a specific role (e.g., "marketing")? If so, choose that stakeholder.
2.  If the question is general, choose the most relevant stakeholder based on their role.
3.  **Most Importantly:** If the question is general and multiple people could answer, **pick someone who has not spoken recently.** Look at the history to see who spoke last and pick someone else. Rotate speakers.
4.  Your response MUST be ONLY the ID of the stakeholder you choose. Do not add any other text, explanation, or punctuation.

Example Response: "stk_12345abcde"`;

    const completion = await openai.chat.completions.create({
      // Using a cheaper, faster model is fine for this simple decision.
      model: "gpt-3.5-turbo", 
      messages: [{ role: "system", content: directorSystemPrompt }],
      temperature: 0.2,
      max_tokens: 20,
    });

    const choice = completion.choices[0]?.message?.content?.trim().replace(/"/g, ''); // Clean up the response
    if (!choice || !allStakeholders.some(s => s.id === choice)) {
      console.error("Director AI returned an invalid or empty choice. Defaulting.");
      // Fallback to a simple rotation if the AI fails.
      const lastSpeakerId = context.messages.filter(m => m.speaker !== 'user').pop()?.speaker;
      const lastSpeakerIndex = allStakeholders.findIndex(s => s.id === lastSpeakerId);
      const nextSpeakerIndex = (lastSpeakerIndex + 1) % allStakeholders.length;
      return allStakeholders[nextSpeakerIndex].id;
    }
    
    return choice;
  }

  /**
   * AI Call 2: The Actor.
   * Its only job is to be one person and respond naturally.
   */
  private async generateActorResponse(
    context: ConversationContext,
    stakeholder: Stakeholder,
    userMessage: string
  ): Promise<Message> {
    const history = context.messages.slice(-10);

    const actorSystemPrompt = `You are a business professional in a meeting. You MUST act as this specific person and no one else.

### Your Persona
- **Name:** ${stakeholder.name}
- **Role:** ${stakeholder.role}
- **Department:** ${stakeholder.department}
- **Personality:** ${stakeholder.personality}
- **Your Key Priorities:** ${stakeholder.priorities.join(', ')}

### Meeting Context
- **Project:** "${context.projectId}"
- **Your Task:** You are answering a question from the Business Analyst. Provide a helpful, in-character response. When you state a requirement, you MUST explain the business reason ("the why") behind it.

### Conversation History
${history.map(msg => `${msg.stakeholderName || 'BA'}: ${msg.content}`).join('\n')}

The Business Analyst just said: "${userMessage}"

Respond as ${stakeholder.name}. Do not break character. Do not refer to yourself as an AI.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Use the high-quality model for the actual response
      messages: [
        { role: "system", content: actorSystemPrompt },
        // We can also add the user message here again for clarity
        { role: "user", content: userMessage }
      ],
      temperature: 0.75,
      max_tokens: 250,
    });

    const responseContent = completion.choices[0]?.message?.content || "I need to think on that for a moment.";

    return {
      id: `stakeholder-${Date.now()}`,
      speaker: stakeholder.id,
      content: responseContent,
      timestamp: new Date().toISOString(),
      stakeholderName: stakeholder.name,
      stakeholderRole: stakeholder.role
    };
  }

  public isConfigured(): boolean {
    return !!import.meta.env.VITE_OPENAI_API_KEY;
  }
}

export const stakeholderAI = new StakeholderAI();