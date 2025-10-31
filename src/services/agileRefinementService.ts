import OpenAI from 'openai';
import { Message } from '../types';

// Only create OpenAI client if API key is available
const createOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ VITE_OPENAI_API_KEY not set - Agile refinement features will be disabled');
    return null;
  }
  try {
    return new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
      // Removed baseURL - call OpenAI directly (backend server not required)
    });
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI client for agile refinement:', error);
    return null;
  }
};

const openai = createOpenAIClient();

export interface AgileTeamMemberContext {
  id: string;
  name: string;
  role: 'Scrum Master' | 'Senior Developer' | 'Developer' | 'QA Tester' | 'Business Analyst';
  voiceId: string;
  personality: string;
  focusAreas: string[];
  responseStyle: string;
  avatarUrl?: string;
}

export interface RefinementContext {
  stories: {
    id: string;
    title: string;
    description: string;
    acceptanceCriteria?: string;
    priority: string;
    ticketNumber: string;
  }[];
  conversationHistory: Message[];
  teamMembers: AgileTeamMemberContext[];
}

// Refinement conversation state
interface RefinementState {
  messageCount: number;
  memberInteractions: Map<string, number>;
  storiesDiscussed: Set<string>;
  lastSpeakers: string[];
  refinementPhase: 'intro' | 'story_review' | 'discussion' | 'estimation' | 'wrap_up';
  currentStoryIndex: number;
  memberStates: Map<string, TeamMemberState>;
}

interface TeamMemberState {
  hasSpoken: boolean;
  questionsAsked: string[];
  concernsRaised: string[];
  suggestionsGiven: string[];
  responseStyle: 'analytical' | 'collaborative' | 'questioning' | 'supportive';
}

class AgileRefinementService {
  private static instance: AgileRefinementService;
  private refinementState: RefinementState;

  private constructor() {
    this.refinementState = {
      messageCount: 0,
      memberInteractions: new Map(),
      storiesDiscussed: new Set(),
      lastSpeakers: [],
      refinementPhase: 'intro',
      currentStoryIndex: 0,
      memberStates: new Map()
    };
  }

  static getInstance(): AgileRefinementService {
    if (!AgileRefinementService.instance) {
      AgileRefinementService.instance = new AgileRefinementService();
    }
    return AgileRefinementService.instance;
  }

      // Get predefined team members
  getTeamMembers(): AgileTeamMemberContext[] {
    console.log('🔊 TEAM MEMBERS DEBUG:', {
      BOLA_VOICE_ID: import.meta.env.VITE_ELEVENLABS_VOICE_ID_BOLA,
      SARAH_VOICE_ID: import.meta.env.VITE_ELEVENLABS_VOICE_ID_SARAH,
      SRIKANTH_VOICE_ID: import.meta.env.VITE_ELEVENLABS_VOICE_ID_SRIKANTH,
      LISA_VOICE_ID: import.meta.env.VITE_ELEVENLABS_VOICE_ID_LISA
    });
    
    return [
      {
        id: 'sarah',
        name: 'Sarah',
        role: 'Scrum Master',
        voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID_SARAH || 'en-GB-LibbyNeural',
        personality: 'Calm, steady, process-focused',
        focusAreas: ['Sprint readiness', 'Story size', 'Team delivery', 'Process adherence'],
        responseStyle: 'Keeps meetings on track, asks about sprint feasibility',
        avatarUrl: '/images/avatars/sarah-avatar.png'
      },
      {
        id: 'bola',
        name: 'Bola',
        role: 'Business Analyst',
        voiceId: 'xeBpkkuzgxa0IwKt7NTP', // Hardcoded to fix caching issue
        personality: 'Detail-oriented, user-focused, collaborative',
        focusAreas: ['Requirements clarity', 'User experience', 'Business value', 'Acceptance criteria'],
        responseStyle: 'Presents requirements clearly and answers stakeholder questions',
        avatarUrl: '/images/avatars/bola-avatar.png'
      },
      {
        id: 'srikanth',
        name: 'Srikanth',
        role: 'Senior Developer',
        voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID_SRIKANTH || 'en-IN-PrabhatNeural',
        personality: 'Experienced, thoughtful, architecture-focused',
        focusAreas: ['Architecture', 'Backend logic', 'Delivery feasibility', 'Technical complexity'],
        responseStyle: 'Raises technical concerns, suggests story breakdown',
        avatarUrl: '/images/avatars/srikanth-avatar.png'
      },
      {
        id: 'lisa',
        name: 'Lisa',
        role: 'Developer',
        voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID_LISA || 'pl-PL-ZofiaNeural',
        personality: 'Fast-paced, technical, implementation-focused',
        focusAreas: ['Implementation clarity', 'Task breakdown', 'Integration points', 'API design'],
        responseStyle: 'Asks about technical details and implementation flow',
        avatarUrl: '/images/avatars/lisa-avatar.png'
      },
      {
        id: 'tom',
        name: 'Tom',
        role: 'QA Tester',
        voiceId: 'qqBeXuJvzxtQfbsW2f40',
        personality: 'Friendly but precise, quality-focused',
        focusAreas: ['Test coverage', 'Negative paths', 'Environment setup', 'Edge cases'],
        responseStyle: 'Questions testability and error scenarios',
        avatarUrl: '/images/avatars/tom-avatar.png'
      }
    ];
  }

  // Generate dynamic team member response using OpenAI
  async generateTeamMemberResponse(
    member: AgileTeamMemberContext,
    userInput: string,
    context: RefinementContext,
    currentStory: any
  ): Promise<string> {
    try {
      const storyData = `
Title: ${currentStory.title}
Description: ${currentStory.description}
Acceptance Criteria: ${currentStory.acceptanceCriteria || 'Not specified'}
Priority: ${currentStory.priority}
Ticket: ${currentStory.ticketNumber}
      `.trim();

      const rolePrompt = this.getRolePrompt(member.role);
      
      const prompt = `You are part of a realistic Agile refinement meeting. The user is a Business Analyst who just presented a user story.

You are playing the role of: ${member.name} (${member.role})

Your job is to review the story and ask realistic, helpful questions from your perspective.

Here is the user story being discussed:
---
${storyData}
---

The user's last comment was:
"${userInput}"

Respond as ${member.name} (${member.role}) only. Stay in character. Keep your message short, natural, and realistic — just like someone speaking in a meeting.

${rolePrompt}

🧠 HOW TO RESPOND:
- Ask **one** clear, useful question or make one comment.
- Do **not** summarize the user's input.
- Do **not** switch roles.
- Do **not** speak for the whole team.
- Do **not** explain concepts.
- Wait for the user's reply before continuing the conversation.

Be sharp, collaborative, and focused on refining the story for sprint delivery.`;

      if (!openai) {
        return this.getFallbackResponse(member.role);
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      });

      const content = response.choices[0]?.message?.content?.trim() || 
        this.getFallbackResponse(member.role);

      // Update conversation state
      this.updateMemberState(member.name, content);
      
      return content;
    } catch (error) {
      console.error('Error generating team member response:', error);
      return this.getFallbackResponse(member.role);
    }
  }

  private getRolePrompt(role: string): string {
    switch (role) {
      case 'Scrum Master':
        return `• 👩 Sarah – Scrum Master  
Tone: Calm, steady  
Focus: Sprint readiness, story size, team delivery  
Examples:  
- "This feels a bit large for one sprint — can we break it up?"  
- "Are the devs confident we can estimate this?"`;

      case 'Business Analyst':
        return `• 👩‍💼 Bola – Business Analyst  
Tone: Professional, detail-oriented  
Focus: Requirements clarity, user experience, business value  
Examples:  
- "Let me clarify the acceptance criteria for this story"  
- "What's the business impact if we don't support this feature?"  
- "How does this align with our user journey?"`;

      case 'Senior Developer':
        return `• 👨‍💻 Srikanth – Senior Developer  
Tone: Experienced, thoughtful  
Focus: Architecture, backend logic, delivery feasibility  
Also covers what Lisa would say (task clarity, flow, etc.)  
Examples:  
- "What happens if the validation API fails?"  
- "Can this be split into two smaller stories?"`;

      case 'Developer':
        return `• 👩‍💻 Lisa – Developer  
Tone: Fast-paced, technical  
Focus: Implementation clarity, task breakdown, integration  
Examples:  
- "Are we reusing the existing upload endpoint?"  
- "What's the timeout behavior if the document hangs?"`;

      case 'QA Tester':
        return `• 👨 Tom – QA Tester  
Tone: Friendly but precise  
Focus: Test coverage, negative paths, environment setup  
Examples:  
- "How do we test if the user uploads the wrong file type?"  
- "What error message should appear if the upload fails?"`;

      default:
        return '';
    }
  }

  private getFallbackResponse(role: string): string {
    // Generate contextual response based on role without hardcoded templates
    const roleContext = {
      'Scrum Master': 'process and sprint planning',
      'Senior Developer': 'technical architecture and implementation',
      'Developer': 'development and integration',
      'QA Tester': 'testing and quality assurance'
    };
    
    const context = roleContext[role as keyof typeof roleContext] || 'this story';
    // Let OpenAI generate contextual questions instead of hardcoded responses
    return '';
  }

  private updateMemberState(memberName: string, response: string): void {
    this.refinementState.messageCount++;
    
    const currentCount = this.refinementState.memberInteractions.get(memberName) || 0;
    this.refinementState.memberInteractions.set(memberName, currentCount + 1);
    
    // Keep track of last speakers for turn-taking
    this.refinementState.lastSpeakers.unshift(memberName);
    if (this.refinementState.lastSpeakers.length > 3) {
      this.refinementState.lastSpeakers.pop();
    }
  }

  // Determine next speaker using same logic as original voice meeting
  selectNextSpeaker(availableMembers: AgileTeamMemberContext[], userInput: string): AgileTeamMemberContext | null {
    if (availableMembers.length === 0) return null;

    // Filter out recent speakers to encourage participation variety
    const recentSpeakers = this.refinementState.lastSpeakers;
    const nonRecentSpeakers = availableMembers.filter(member => 
      !recentSpeakers.includes(member.name)
    );

    // Prefer non-recent speakers
    const candidatePool = nonRecentSpeakers.length > 0 ? nonRecentSpeakers : availableMembers;

    // Simple random selection from candidate pool
    const randomIndex = Math.floor(Math.random() * candidatePool.length);
    return candidatePool[randomIndex];
  }

  // Reset conversation state (like original AIService)
  resetConversationState(): void {
    this.refinementState = {
      messageCount: 0,
      memberInteractions: new Map(),
      storiesDiscussed: new Set(),
      lastSpeakers: [],
      refinementPhase: 'intro',
      currentStoryIndex: 0,
      memberStates: new Map()
    };
  }

  // Generate meeting summary (reuse existing summary logic structure)
  async generateRefinementSummary(
    messages: Message[],
    stories: any[],
    progressCallback?: (progress: number) => void
  ): Promise<any> {
    try {
      const transcript = messages.map(m => `${m.user_id}: ${m.body || ''}`).join('\n');
      
      const summaryPrompt = `Generate a professional refinement meeting summary.

Stories Discussed:
${stories.map(s => `- ${s.ticketNumber}: ${s.title}`).join('\n')}

Meeting Transcript:
${transcript}

Generate a summary with:
1. Stories refined and key decisions
2. Technical concerns raised
3. Action items and next steps
4. Team feedback and recommendations

Keep it professional and actionable.`;

      if (!openai) {
        progressCallback?.(100);
        return {
          summary: 'AI summary generation unavailable. OpenAI API key is not configured.',
          stories: stories.length,
          participants: this.getTeamMembers().length + 1,
          duration: Math.round(messages.length * 1.5),
          keyDecisions: [],
        };
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: summaryPrompt }],
        max_tokens: 800,
        temperature: 0.3
      });

      progressCallback?.(100);

      return {
        summary: response.choices[0]?.message?.content || 'Summary generation failed',
        stories: stories.length,
        participants: this.getTeamMembers().length + 1, // +1 for BA
        duration: Math.round(messages.length * 1.5), // Estimate
        keyDecisions: [],
        actionItems: [],
        nextSteps: []
      };
    } catch (error) {
      console.error('Error generating refinement summary:', error);
      return {
        summary: 'Unable to generate summary at this time.',
        stories: stories.length,
        participants: this.getTeamMembers().length + 1,
        duration: 0,
        keyDecisions: [],
        actionItems: [],
        nextSteps: []
      };
    }
  }
}

export default AgileRefinementService;