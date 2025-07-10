// Filename: src/lib/StakeholderAI.ts
//
// You can copy this entire block of code and paste it into the file.
// This file contains all the logic for making the AI stakeholders talk.

import OpenAI from 'openai'
// Make sure you have defined these types somewhere in your project, likely in a 'types.ts' file.
import { Stakeholder, Project, Message } from '../types'

// This defines the information the AI needs about the current meeting state.
interface ConversationContext {
  projectId: string
  stakeholderIds: string[]
  messages: Message[] // This is the single, unified history of the meeting
  meetingType: 'individual' | 'group'
}

// Initialize the OpenAI client with your API key.
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

/**
 * This class is the "brain" for your AI stakeholders.
 * It decides who should talk in a group and what they should say.
 */
class StakeholderAI {

  /**
   * Generates a response for a GROUP meeting.
   * This is the main function you will use for meetings with more than one stakeholder.
   * It uses a "Director AI" to intelligently choose which stakeholder should speak.
   * @param context - The current state of the meeting.
   * @param project - The details of the project being discussed.
   * @param allStakeholders - A list of all stakeholder objects in the meeting.
   * @param userMessage - The latest message typed by the Business Analyst.
   * @returns A Message object from the stakeholder who is responding.
   */
  public async generateGroupResponse(
    context: ConversationContext,
    project: Project,
    allStakeholders: Stakeholder[],
    userMessage: string
  ): Promise<Message> {
    try {
      // 1. Build the special "Director Prompt" that tells the AI how to behave.
      const directorPrompt = this.buildDirectorPrompt(project, context, allStakeholders, userMessage);

      // 2. Call the OpenAI API with the prompt.
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo", // Using a powerful model is key for the director logic
        messages: directorPrompt,
        temperature: 0.7,
        max_tokens: 350,
        // We ask the AI to respond in a structured JSON format. This is crucial.
        response_format: { type: "json_object" },
      });

      const rawResponse = completion.choices[0]?.message?.content;
      if (!rawResponse) {
        throw new Error("Received an empty response from OpenAI.");
      }

      // 3. Parse the structured JSON response we get back from the AI.
      const aiResponse: {
        speakerId: string,
        reasoning: string,
        response: string
      } = JSON.parse(rawResponse);

      // 4. Find the stakeholder who the AI decided should speak.
      const speakingStakeholder = allStakeholders.find(s => s.id === aiResponse.speakerId);
      if (!speakingStakeholder) {
        throw new Error(`AI tried to speak as a non-existent stakeholder: ${aiResponse.speakerId}`);
      }

      // 5. Create the final Message object to be sent back to your app's interface.
      const stakeholderMsg: Message = {
        id: `stakeholder-${Date.now()}`,
        speaker: speakingStakeholder.id,
        content: aiResponse.response,
        timestamp: new Date().toISOString(),
        stakeholderName: speakingStakeholder.name,
        stakeholderRole: speakingStakeholder.role
      };

      return stakeholderMsg;

    } catch (error) {
      console.error('OpenAI API Error in Group Response:', error);
      // If anything goes wrong, return a safe fallback message.
      return {
        id: `stakeholder-fallback-${Date.now()}`,
        speaker: 'system', // The speaker is 'system' to indicate an error.
        content: "I'm sorry, I seem to have encountered a technical issue. Could you please try asking that again?",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * This method constructs the detailed instructions for our "Director AI".
   * It tells the AI its purpose, who the stakeholders are, what has been said,
   * and how it needs to format its response.
   */
  private buildDirectorPrompt(
    project: Project,
    context: ConversationContext,
    allStakeholders: Stakeholder[],
    userMessage: string
  ): any[] {
    // We only look at the last 12 messages to keep the prompt from getting too long.
    // The real "memory" comes from the summary we will generate.
    const history = context.messages.slice(-12);

    // Create a list of stakeholder profiles for the AI to understand who is in the room.
    const stakeholderProfiles = allStakeholders.map(s =>
      `- ID: "${s.id}", Name: ${s.name}, Role: ${s.role}, Expertise/Priorities: ${s.priorities.join(', ')}`
    ).join('\n');

    // This is the main set of instructions for the AI.
    const systemPrompt = `You are a "Meeting Director" AI. Your job is to orchestrate a realistic business meeting simulation.

PROJECT CONTEXT:
- Name: ${project.name}
- Description: ${project.description}

STAKEHOLDER PROFILES IN THIS MEETING:
${stakeholderProfiles}

YOUR TASK:
You must perform a two-step process:
1.  **DECIDE WHO SPEAKS:** Analyze the Business Analyst's latest message and the conversation history. Decide which stakeholder is the *most appropriate* to respond based on their role and expertise.
2.  **GENERATE THE RESPONSE:** After choosing a speaker, generate a natural, in-character response from *their perspective*. The response must always include the business reason ("the why") for any requirement mentioned.

CONVERSATION HISTORY (Most Recent Messages):
${history.map(msg => `${msg.stakeholderName || msg.speaker}: ${msg.content}`).join('\n')}

BUSINESS ANALYST'S LATEST MESSAGE:
"${userMessage}"

RESPONSE FORMAT:
Your entire output MUST be a single, valid JSON object. Do not add any text before or after the JSON structure.
The JSON object must look exactly like this:
{
  "speakerId": "The ID of the stakeholder who should speak",
  "reasoning": "A brief, one-sentence explanation for why you chose this speaker. This is for debugging.",
  "response": "The full response content, written from the chosen stakeholder's perspective."
}`;

    // The final prompt is just the system instruction. The user message is inside it.
    return [{ role: "system", content: systemPrompt }];
  }

  /**
   * This is a helper method to check if your OpenAI API key is set up.
   */
  public isConfigured(): boolean {
    return !!import.meta.env.VITE_OPENAI_API_KEY;
  }
}

// We create a single instance of the AI brain that the rest of our app can use.
export const stakeholderAI = new StakeholderAI();