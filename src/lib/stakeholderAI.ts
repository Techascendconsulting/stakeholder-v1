
import OpenAI from 'openai'
import { Stakeholder, Project, Message } from '../types' // Make sure this path is correct

interface ConversationContext {
  projectId: string
  messages: Message[]
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

class StakeholderAI {
  /**
   * The main orchestrator function. It determines who needs to speak and then
   * generates a response for each of them, sending them back one by one via a callback.
   */
  public async generateGroupResponse(
    context: ConversationContext,
    project: Project,
    allStakeholders: Stakeholder[],
    userMessage: string,
    onMessageGenerated: (message: Message) => void // This function sends messages to the UI
  ): Promise<void> {
    try {
      // STEP 1: Call the Director AI to get a LIST of who should speak.
      const speakerIds = await this.chooseNextSpeakers(context, allStakeholders, userMessage);
      
      if (speakerIds.length === 0) {
        console.log("Director decided no one should speak for this message.");
        return;
      }

      // STEP 2: Loop through the list and generate a response for EACH speaker.
      for (const speakerId of speakerIds) {
        const speakingStakeholder = allStakeholders.find(s => s.id === speakerId);
        if (speakingStakeholder) {
          // Add a short, realistic delay between speakers.
          await new Promise(resolve => setTimeout(resolve, Math.random() * 1200 + 800));

          const actorResponse = await this.generateActorResponse(context, speakingStakeholder, project, userMessage);
          
          // Use the callback to send the new message back to the MeetingView to be displayed.
          onMessageGenerated(actorResponse);
        }
      }

    } catch (error) {
      console.error('Error in multi-response generation:', error);
      const fallbackMessage: Message = {
        id: `stakeholder-fallback-${Date.now()}`,
        speaker: 'system',
        content: "I'm sorry, a critical error occurred in my decision-making process. Please try again.",
        timestamp: new Date().toISOString(),
      };
      onMessageGenerated(fallbackMessage);
    }
  }

  /**
   * AI Call 1: The Multi-Response Director.
   * Its only job is to return a JSON array of stakeholder IDs in the order they should speak.
   */
  private async chooseNextSpeakers(
    context: ConversationContext,
    allStakeholders: Stakeholder[],
    userMessage: string
  ): Promise<string[]> {
    const history = context.messages.slice(-10).map(msg => `${msg.stakeholderName || 'BA'}: ${msg.content}`).join('\n');
    const stakeholderProfiles = allStakeholders.map(s => `- ID: "${s.id}", Name: ${s.name}, Role: ${s.role}`).join('\n');

    const directorSystemPrompt = `You are a meeting director. Your job is to decide who should speak next. Your output MUST be a JSON array of stakeholder IDs.

STAKEHOLDERS:
${stakeholderProfiles}

CONVERSATION HISTORY:
${history}

USER'S LATEST MESSAGE:
"${userMessage}"

RULES:
1.  **Multi-Person Detection:** Analyze the user's message. If they address multiple people by name (e.g., "Hi James and Aisha" or "Thanks, John and Sarah"), your output array MUST contain the IDs for all people mentioned, in order.
2.  **Single Speaker:** If the message is a question for a specific role or a general topic, the array should contain only one ID for the most relevant speaker.
3.  **Rotation:** For general questions, you MUST rotate speakers. Do not pick the same person who spoke last.
4.  **Empty Array:** If the user's message doesn't require a response (e.g., "Okay, thanks"), return an empty array: [].

**Your response MUST be a valid JSON object containing a single key "speaker_ids" with an array of strings.**

EXAMPLES:
- User says: "Hi James and Aisha" -> {"speaker_ids": ["stake-1", "stake-2"]}
- User says: "What are the marketing needs?" -> {"speaker_ids": ["stake-4"]}
- User says: "Okay, I understand." -> {"speaker_ids": []}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: directorSystemPrompt }],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) return [];

    try {
      const parsedJson = JSON.parse(rawResponse);
      const speakerArray = parsedJson.speaker_ids;
      if (Array.isArray(speakerArray)) {
        return speakerArray;
      }
      return [];
    } catch (e) {
      console.error("Failed to parse director's JSON response:", e);
      return [];
    }
  }

  /**
   * AI Call 2: The Actor. Generates the response for one specific stakeholder.
   */
  private async generateActorResponse(
    context: ConversationContext,
    stakeholder: Stakeholder,
    project: Project,
    userMessage: string
  ): Promise<Message> {
    const actorSystemPrompt = `You are an actor playing a role in a business meeting simulation. You must fully embody the persona assigned to you and never break character.

### Your Character Sheet
- **Your Name:** ${stakeholder.name}
- **Your Role:** ${stakeholder.role}
- **Your Personality:** You are ${stakeholder.personality}.
- **Your Goal:** Your main goal in this meeting is to advance your key priorities: ${stakeholder.priorities.join(', ')}.
- **Project Context:** The meeting is about the "${project.name}" project.

### Your Task
The Business Analyst has just said: "${userMessage}"

Respond to them as your character would.
- If the BA greeted you by name, give a brief, polite reply.
- If they asked a question, answer it from your perspective.
- Keep your response concise (1-3 sentences).
- **Do not use markdown.** Just provide clean, plain text. Do not use asterisks or lists.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: actorSystemPrompt }],
      temperature: 0.75,
      max_tokens: 150,
    });

    const responseContent = completion.choices[0]?.message?.content || "I see.";

    return {
      id: `stakeholder-${Date.now()}`,
      speaker: stakeholder.id,
      content: responseContent.trim(),
      timestamp: new Date().toISOString(),
      stakeholderName: stakeholder.name,
      stakeholderRole: stakeholder.role
    };
  }
}

export const stakeholderAI = new StakeholderAI();