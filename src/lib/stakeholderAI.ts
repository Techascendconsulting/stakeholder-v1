import OpenAI from 'openai'
import { Stakeholder, Project, Message } from '../types'

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
  public async generateGroupResponse(
    context: ConversationContext,
    project: Project,
    allStakeholders: Stakeholder[],
    userMessage: string
  ): Promise<Message> {
    try {
      // The only change is calling the new, upgraded prompt builder.
      const directorPrompt = this.buildUpgradedDirectorPrompt(project, context, allStakeholders, userMessage);

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: directorPrompt,
        temperature: 0.7,
        max_tokens: 350,
        response_format: { type: "json_object" },
      });

      const rawResponse = completion.choices[0]?.message?.content;
      if (!rawResponse) {
        throw new Error("Received an empty response from OpenAI.");
      }

      const aiResponse: {
        speakerId: string,
        reasoning: string,
        response: string
      } = JSON.parse(rawResponse);

      const speakingStakeholder = allStakeholders.find(s => s.id === aiResponse.speakerId);
      if (!speakingStakeholder) {
        throw new Error(`AI tried to speak as a non-existent stakeholder: ${aiResponse.speakerId}`);
      }

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
      return {
        id: `stakeholder-fallback-${Date.now()}`,
        speaker: 'system',
        content: "I'm sorry, I seem to have encountered a technical issue. Could you please try asking that again?",
        timestamp: new Date().toISOString(),
      };
    }
  }

  // RENAMED and UPGRADED this function for clarity.
  private buildUpgradedDirectorPrompt(
    project: Project,
    context: ConversationContext,
    allStakeholders: Stakeholder[],
    userMessage: string
  ): any[] {
    const history = context.messages.slice(-12);

    const stakeholderProfiles = allStakeholders.map(s =>
      `- ID: "${s.id}", Name: ${s.name}, Role: ${s.role}, Expertise/Priorities: ${s.priorities.join(', ')}`
    ).join('\n');

    // ========================================================================
    // THIS IS THE NEW, MORE DETAILED PROMPT. THIS IS THE CORE OF THE FIX.
    // ========================================================================
    const systemPrompt = `You are a "Meeting Director" AI. Your job is to orchestrate a realistic business meeting simulation by choosing which stakeholder should speak and generating their response.

### PROJECT CONTEXT
- Name: ${project.name}
- Description: ${project.description}

### STAKEHOLDER PROFILES
Here are the participants in the meeting. You must use their expertise to decide who should speak.
${stakeholderProfiles}

### CONVERSATION HISTORY (Most Recent)
${history.map(msg => `${msg.stakeholderName || msg.speaker}: ${msg.content}`).join('\n')}

### BUSINESS ANALYST'S LATEST MESSAGE
"${userMessage}"

### YOUR TASK & DECISION LOGIC
You MUST follow these steps to decide who speaks. This is your primary function.

**Step 1: Analyze the BA's Message**
- **Is it a direct question to a role?** (e.g., "What are the marketing team's thoughts?"). If yes, that role MUST speak.
- **Is it a direct question to a name?** (e.g., "@Jane"). If yes, that person MUST speak.
- **Is it a general question?** (e.g., "What are the requirements?"). If yes, proceed to Step 2.
- **Is it a greeting or pleasantry?** If yes, have the most senior-sounding stakeholder respond briefly.

**Step 2: Choose a Speaker for General Questions**
If the question is general, you MUST choose the most relevant speaker. DO NOT default to the first stakeholder in the list. Use this logic:
1.  **Topical Relevance:** Match keywords in the BA's question to the stakeholder's role and priorities.
    - "data", "metrics", "database" -> Data Scientist
    - "sales", "customers", "revenue" -> Sales Manager
    - "marketing", "campaigns", "user acquisition" -> Marketing Director
2.  **Turn-Taking:** If multiple stakeholders are relevant, or if none are obviously relevant, pick a stakeholder who has NOT spoken recently. Look at the conversation history to determine this. **Actively rotate between speakers.**
3.  **Introduction Flow:** If the last message was an introduction from another stakeholder, the next stakeholder in the list MUST introduce themselves.

**Step 3: Generate the Response**
- Once you have chosen a speaker, generate their response from their perspective.
- The response MUST be natural, in-character, and provide a business reason for any requirement mentioned ("the why").

### RESPONSE FORMAT
Your entire output MUST be a single, valid JSON object, with no text before or after it.
{
  "speakerId": "The ID of the stakeholder you chose based on the logic above",
  "reasoning": "A brief, one-sentence explanation for WHY you chose this speaker, referencing your decision logic (e.g., 'Chose Marketing Director due to keyword 'campaigns'.')",
  "response": "The full response content, written from the chosen stakeholder's perspective."
}`;

    return [{ role: "system", content: systemPrompt }];
  }

  public isConfigured(): boolean {
    return !!import.meta.env.VITE_OPENAI_API_KEY;
  }
}

export const stakeholderAI = new StakeholderAI();