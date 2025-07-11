import OpenAI from 'openai'
import { Stakeholder, Project, Message } from '../types' // Make sure this path is correct

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

class StakeholderAI {
  /**
   * This is the single, powerful function that generates a response.
   * It asks the AI to create a script-like response if multiple people need to talk.
   */
  public async generateResponse(
    project: Project,
    allStakeholders: Stakeholder[],
    messages: Message[],
    userMessage: string
  ): Promise<Message> { // It now returns a single Message object again.
    
    const history = messages.slice(-10).map(msg => `${msg.stakeholderName || 'BA'}: ${msg.content}`).join('\n');
    const stakeholderProfiles = allStakeholders.map(s => `- ${s.name} (${s.role}, ID: ${s.id})`).join('\n');

    // This is the new, simpler, more forceful prompt.
    const systemPrompt = `You are a powerful AI orchestrating a business meeting simulation. Your primary goal is to generate a realistic, in-character response to the Business Analyst's message.

### STAKEHOLDERS IN THIS MEETING:
${stakeholderProfiles}

### RECENT CONVERSATION HISTORY:
${history}

### BUSINESS ANALYST'S LATEST MESSAGE:
"${userMessage}"

### YOUR TASK AND RULES (THESE ARE NOT NEGOTIABLE):

1.  **Analyze the BA's message.** Determine who should speak.
2.  **Multi-Speaker Rule:** If the BA greets or addresses MULTIPLE people (e.g., "hello guys", "hey both", "thanks James and Aisha"), you MUST generate a brief response for EACH person mentioned. Format it like a script, with each person's name on a new line.
3.  **Single-Speaker Rule:** If the BA asks a question to a specific person or about a specific topic, only ONE stakeholder should respond. Choose the most relevant person.
4.  **Rotation Rule:** For general questions, you MUST rotate speakers. Do not let the same person talk every time.
5.  **Persona:** Every response must be 100% in character, based on the stakeholder's role and personality.
6.  **Clarity:** Do NOT use markdown, asterisks, or complex formatting. Just plain text.

### EXAMPLE RESPONSES:

**BA says: "hello guys and welcome to the call"**
Your output should be:
Aisha Ahmed: "Thank you! It's great to be here."
James Walker: "Hello. Ready to begin."

**BA says: "What are the operational challenges?"**
Your output should be:
James Walker: "Our main challenge is the lack of standardized handoffs between departments, which causes significant delays and requires a lot of manual follow-up."

**BA says: "Okay, thanks"**
Your output should be:
(No response required, return a single period ".")

---
Now, generate the appropriate response based on the BA's latest message.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 400,
      });

      let responseContent = completion.choices[0]?.message?.content?.trim() || "I'm sorry, I missed that. Could you repeat it?";

      // If the AI decides not to respond, don't send an empty message.
      if (responseContent === ".") {
        responseContent = "";
      }

      // The response is from the "system" but contains multiple speakers.
      return {
        id: `sys-response-${Date.now()}`,
        speaker: 'system', // The speaker is the system, presenting a script.
        content: responseContent,
        timestamp: new Date().toISOString(),
        stakeholderName: 'Stakeholders', // A generic name for the response block
        stakeholderRole: 'Group Response'
      };

    } catch (error) {
      console.error('Error in single-call AI response generation:', error);
      return {
        id: `fallback-${Date.now()}`,
        speaker: 'system',
        content: "I've encountered a critical error and cannot respond right now. Please try again shortly.",
        timestamp: new Date().toISOString(),
        stakeholderName: 'System Error'
      };
    }
  }
}

export const stakeholderAI = new StakeholderAI();