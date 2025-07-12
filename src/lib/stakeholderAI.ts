import OpenAI from 'openai'
import { Stakeholder, Project, Message, Student } from '../../types'
import { DatabaseService } from '../../database'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

class StakeholderAI {
  public async generateResponse(
    project: Project,
    allStakeholders: Stakeholder[],
    messages: Message[],
    userMessage: string,
    baId: Student['id'], // Changed type to Student['id']
    firstInteractionStatus: Record<string, boolean> // New parameter
  ): Promise<Message> {
    const history = messages.slice(-10).map(msg => `${msg.stakeholderName || 'BA'}: ${msg.content}`).join('\n');
    const stakeholderProfiles = allStakeholders.map(s => `- ${s.name} (${s.role}, ID: ${s.id}, Voice: ${s.azure_voice_id || 'default'})`).join('\n');

    // Construct dynamic introduction rules based on firstInteractionStatus
    let introductionRules = '';
    allStakeholders.forEach(s => {
      if (firstInteractionStatus[s.id]) {
        introductionRules += `\n- If the BA addresses ${s.name} (ID: ${s.id}) for the first time, ${s.name} MUST introduce themselves briefly (name, role, and a concise statement about their area of expertise relevant to the project) after a pleasantry. Example: "Hello, I'm ${s.name}, the ${s.role}. I oversee [brief area of expertise]."`;
      } else {
        introductionRules += `\n- If the BA addresses ${s.name} (ID: ${s.id}) and it's NOT their first interaction, ${s.name} should only offer pleasantries or directly respond without a full re-introduction.`;
      }
    });

    const systemPrompt = `You are an AI orchestrating a business meeting. Your goal is to generate a realistic, in-character response to the Business Analyst's message. You are part of a simulation designed to teach aspiring Business Analysts how to effectively gather requirements from Subject Matter Experts (SMEs).

### MEETING CONTEXT:
Project: ${project.name} - ${project.description || 'No description provided.'}

### STAKEHOLDERS IN THIS MEETING:
${stakeholderProfiles}

### RECENT CONVERSATION HISTORY:
${history}

### BUSINESS ANALYST'S LATEST MESSAGE:
"${userMessage}"

### YOUR TASK AND RULES:
1.  **Initial Interaction & Pleasantries:**
    ${introductionRules}
2.  **Multi-Speaker Rule:** If the BA greets or addresses MULTIPLE people (e.g., "hello guys", "hey both"), you MUST generate a brief response for EACH person mentioned. Format it like a script, with each speaker's response on a new line, prefixed by their name and a colon. If multiple speakers respond, separate their individual responses with the exact string "[NEXT_SPEAKER]". Example: "James Walker: Hello.\n[NEXT_SPEAKER]Aisha Ahmed: Hi there!"
3.  **Targeted Question Rule:** If the BA asks a question to a *specific* stakeholder by name (e.g., "James, what are your thoughts on...?"), that named stakeholder *must* be the one to answer, overriding general rotation rules.
4.  **Single-Speaker Rule:** If the BA asks a question not specifically targeted, only ONE stakeholder should respond. Choose the most relevant person based on their role, the project context, and the conversation history.
5.  **Rotation Rule:** For general questions or when multiple stakeholders could reasonably answer, you MUST rotate speakers to ensure all active stakeholders participate over time.
6.  **Persona & SME Role:** Every response must be 100% in character for the assigned role. When asked for requirements, act as a Subject Matter Expert (SME) for the ${project.name} project. Your responses should be grounded in your specific domain (e.g., Marketing, Engineering, Finance, Legal, Operations). Provide specific, actionable requirements relevant to your area of expertise. Crucially, for every requirement or significant piece of information you provide, ALWAYS include a clear *justification* or *reasoning*. Explain *why* this requirement is important, what problem it solves, what benefit it provides, or what risk it mitigates. Use phrases like "This is important because...", "The reason we need this is...", or "Without this, we risk...". Be prepared to elaborate on your justifications if the BA asks follow-up questions. Your goal is to teach the BA to think critically about the *why* behind each requirement, not just the *what*.
7.  **Natural Conversation:** Maintain a natural, conversational tone. Avoid overly formal or robotic language. Respond directly to the BA's questions and comments, and don't introduce new topics unless prompted or it's a natural progression of the discussion.
8.  **Clarity:** Do NOT use markdown (like `**bold**` or `*italics*`) or asterisks. Just plain text.

### EXAMPLE RESPONSES:
BA says: "hello guys" -> James Walker: "Hello, I'm James Walker, the Marketing Manager. I oversee our customer acquisition strategies."\n[NEXT_SPEAKER]Aisha Ahmed: "Hi there!"
BA says: "What are the operational challenges?" -> James Walker: "Our main challenge is the lack of standardized handoffs, which causes delays. This is critical because it directly impacts our delivery timelines and customer satisfaction."
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
      // This will now be used to identify the speaker for the first segment of a multi-speaker response
      const primarySpeakerId = await this.identifyPrimarySpeaker(responseContent, allStakeholders);
      const primarySpeaker = allStakeholders.find(s => s.id === primarySpeakerId);

      // Record interaction for the primary speaker
      if (primarySpeakerId && baId && project.id) {
        await DatabaseService.recordInteraction(baId, primarySpeakerId, project.id);
      }

      return {
        id: `sys-response-${Date.now()}`,
        speaker: primarySpeakerId || 'system',
        content: responseContent,
        timestamp: new Date().toISOString(),
        stakeholderName: primarySpeaker ? primarySpeaker.name : 'Stakeholders',
        stakeholderRole: primarySpeaker ? primarySpeaker.role : 'Group Response'
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

  private async identifyPrimarySpeaker(
    responseText: string,
    allStakeholders: Stakeholder[]
  ): Promise<string | null> {
    if (!responseText) return null;

    const stakeholderList = allStakeholders.map(s => `- ${s.name} (ID: ${s.id})`).join('\n');

    const prompt = `From the following text, identify the primary speaker. The primary speaker is usually the first person mentioned or the only person who speaks. If there are multiple speakers separated by '[NEXT_SPEAKER]', identify the speaker of the first segment.\n\nSTAKEHOLDER LIST:\n${stakeholderList}\n\nTEXT:\n"${responseText}"\n\nRespond with ONLY the ID of the primary speaker. If you cannot determine a speaker, respond with "N/A".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using a faster model for this simple task
      messages: [{ role: "system", content: prompt }],
      temperature: 0,
      max_tokens: 20,
    });

    const speakerId = completion.choices[0]?.message?.content?.trim();
    return allStakeholders.some(s => s.id === speakerId) ? speakerId : null;
  }
}

export const stakeholderAI = new StakeholderAI();
