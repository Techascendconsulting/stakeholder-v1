// Filename: src/lib/StakeholderAI.ts
// FINAL VERSION WITH AUDIO LOGIC: This version reliably generates script-style text
// and includes a new function to identify the primary speaker for audio playback.

import OpenAI from 'openai'
import { Stakeholder, Project, Message } from '../types'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

class StakeholderAI {
  /**
   * The main function. It now returns a single message object that includes
   * the ID of the primary speaker for audio playback.
   */
  public async generateResponse(
    project: Project,
    allStakeholders: Stakeholder[],
    messages: Message[],
    userMessage: string
  ): Promise<Message> {
    const history = messages.slice(-10).map(msg => `${msg.stakeholderName || 'BA'}: ${msg.content}`).join('\n');
    const stakeholderProfiles = allStakeholders.map(s => `- ${s.name} (${s.role}, ID: ${s.id})`).join('\n');

    const systemPrompt = `You are an AI orchestrating a business meeting. Your goal is to generate a realistic, in-character response to the Business Analyst's message.

### STAKEHOLDERS IN THIS MEETING:
${stakeholderProfiles}

### RECENT CONVERSATION HISTORY:
${history}

### BUSINESS ANALYST'S LATEST MESSAGE:
"${userMessage}"

### YOUR TASK AND RULES:
1.  **Multi-Speaker Rule:** If the BA greets or addresses MULTIPLE people (e.g., "hello guys", "hey both"), you MUST generate a brief response for EACH person mentioned. Format it like a script.
2.  **Single-Speaker Rule:** If the BA asks a question, only ONE stakeholder should respond. Choose the most relevant person based on their role and the conversation history.
3.  **Rotation Rule:** For general questions, you MUST rotate speakers.
4.  **Persona:** Every response must be 100% in character.
5.  **Clarity:** Do NOT use markdown or asterisks. Just plain text.

### EXAMPLE RESPONSES:
BA says: "hello guys" -> James Walker: "Hello."\nAisha Ahmed: "Hi there!"
BA says: "What are the operational challenges?" -> James Walker: "Our main challenge is the lack of standardized handoffs, which causes delays."
BA says: "Okay, thanks" -> (return a single period: ".")`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 400,
      });

      let responseContent = completion.choices[0]?.message?.content?.trim() || "I'm sorry, I missed that.";
      if (responseContent === ".") {
        responseContent = "";
      }

      // NEW STEP: Identify the primary speaker for the generated text.
      const primarySpeakerId = await this.identifyPrimarySpeaker(responseContent, allStakeholders);

      return {
        id: `sys-response-${Date.now()}`,
        speaker: primarySpeakerId || 'system', // Use the identified speaker ID
        content: responseContent,
        timestamp: new Date().toISOString(),
        stakeholderName: primarySpeakerId ? allStakeholders.find(s => s.id === primarySpeakerId)?.name : 'Stakeholders',
        stakeholderRole: primarySpeakerId ? allStakeholders.find(s => s.id === primarySpeakerId)?.role : 'Group Response'
      };

    } catch (error) {
      console.error('Error in AI response generation:', error);
      return {
        id: `fallback-${Date.now()}`,
        speaker: 'system',
        content: "I've encountered a critical error. Please try again.",
        timestamp: new Date().toISOString(),
        stakeholderName: 'System Error'
      };
    }
  }

  /**
   * A new, fast AI call to identify the main speaker from a block of text.
   */
  private async identifyPrimarySpeaker(
    responseText: string,
    allStakeholders: Stakeholder[]
  ): Promise<string | null> {
    if (!responseText) return null;

    const stakeholderList = allStakeholders.map(s => `- ${s.name} (ID: ${s.id})`).join('\n');

    const prompt = `From the following text, identify the primary speaker. The primary speaker is usually the first person mentioned or the only person who speaks.

STAKEHOLDER LIST:
${stakeholderList}

TEXT:
"${responseText}"

Respond with ONLY the ID of the primary speaker. If you cannot determine a speaker, respond with "N/A".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
      temperature: 0,
      max_tokens: 20,
    });

    const speakerId = completion.choices[0]?.message?.content?.trim();
    return allStakeholders.some(s => s.id === speakerId) ? speakerId : null;
  }
}

export const stakeholderAI = new StakeholderAI();
