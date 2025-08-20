import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  timeout: 5000,     // tighter timeout for snappier UX
  maxRetries: 1,     // Only retry once
  defaultHeaders: {  // Optimize headers
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Use GPT-3.5-turbo for faster responses
const MODEL = "gpt-3.5-turbo";

// Default API parameters for faster responses
const DEFAULT_API_PARAMS = {
  model: MODEL,
  temperature: 0.3,
  max_tokens: 130,    // Keep responses concise but meaningful
  presence_penalty: 0,
  frequency_penalty: 0,
  stream: false       // Disable streaming for faster responses
};

// Helper for creating API parameters
const createApiParams = (messages: any[], overrides = {}) => ({
  ...DEFAULT_API_PARAMS,
  messages,
  ...overrides  // This will override any duplicate keys from DEFAULT_API_PARAMS
});

interface ConversationState {
  messageCount: number;
  participantInteractions: Map<string, number>;
  topicsDiscussed: Set<string>;
  conversationPhase: 'as_is' | 'pain_points' | 'solutioning' | 'deep_dive';
  stakeholderStates: Map<string, {
    hasSpoken: boolean;
    lastTopics: string[];
    emotionalState: string;
    conversationStyle: string;
  }>;
}

// Lightweight shared types for other modules
export interface StakeholderContext {
  name: string;
  role: string;
  department?: string;
  personality?: string;
  priorities?: string[];
  expertise?: string[];
}

export interface ConversationContext {
  project?: any;
  conversationHistory?: any[];
  conversationPhase?: 'problem_exploration' | 'as_is' | 'to_be' | 'wrap_up' | string;
}

class AIService {
  private static instance: AIService;
  private conversationState: ConversationState;
  
  private constructor() {
    this.conversationState = this.initializeConversationState();
  }

  private initializeConversationState(): ConversationState {
    return {
      messageCount: 0,
      participantInteractions: new Map(),
      topicsDiscussed: new Set(),
      conversationPhase: 'as_is',
      stakeholderStates: new Map()
    };
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public resetConversationState(): void {
    this.conversationState = this.initializeConversationState();
  }

  public async generateResponse(userMessage: string, systemPrompt?: string): Promise<string> {
    try {
      const messages = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userMessage }
      ];

      const response = await openai.chat.completions.create(createApiParams(messages));
      const completion = response as any; // Type assertion to handle OpenAI API type issues
      return completion.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";
    } catch (error) {
      console.error('Error in generateResponse:', error);
      return "I apologize, there was an error processing your request.";
    }
  }

  // Always-answer, stage- and brief-aware stakeholder response (fast path)
  public async generateStakeholderResponse(
    userMessage: string,
    stakeholder: StakeholderContext,
    context: ConversationContext = {},
    responseType: 'discussion' | 'baton_pass' | 'direct_mention' = 'discussion'
  ): Promise<string> {
    const stage = (context.conversationPhase || 'as_is').toString().replace(/_/g, ' ');

    const lowerMsg = (userMessage || '').toLowerCase().trim();

    // Ultra-fast local responses for common intents
    const historyLen = Array.isArray(context?.conversationHistory) ? context.conversationHistory.length : 0;
    if (historyLen <= 2 && this.isGreetingSmallTalk(lowerMsg)) {
      return this.buildSmallTalkResponse(stakeholder, context);
    }

    if (this.isCurrentProcessQuestion(lowerMsg)) {
      const asIs = this.summarizeAsIs(context?.project?.asIsProcess);
      if (asIs) {
        return `Sure — in our team, we start by ${asIs.replace(/\s*->\s*/g, ', then we ')}. That’s the usual flow from our side.`;
      }
    }

    // Build a compact, reusable system prompt
    const systemPrompt = [
      `You are ${stakeholder.name}, a ${stakeholder.role}${stakeholder.department ? ' in ' + stakeholder.department : ''}.`,
      `Always answer the question asked. Keep it natural, concise (2-4 sentences), and human-like.`,
      `If the question is outside the current focus (${stage}), still answer briefly, then (optionally) nudge back to ${stage}.`,
      `Prefer concrete details from the project context when relevant. Avoid generic filler or meta commentary.`,
      `Do NOT invent metrics, percentages, timelines, or implementation statuses. Only mention numbers or outcomes if explicitly present in the provided context or recent messages. If unknown, omit metrics.`,
      `For greetings/small talk, keep it to one short sentence and do not claim outcomes or status updates.`,
      `For "current process" questions, summarize the As-Is steps and handoffs in plain language; avoid proposing solutions unless asked.`
    ].join(' ');

    const projectBits = this.buildProjectBits(context?.project);
    const recent = this.buildRecentHistory(context?.conversationHistory || []);
    const userContent = [
      projectBits ? `Project context: ${projectBits}` : '',
      recent ? `Recent messages: ${recent}` : '',
      `User: ${userMessage}`
    ].filter(Boolean).join('\n');

    try {
      const response = await openai.chat.completions.create(createApiParams([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ], {
        // Favor speed and determinism
        temperature: 0.3,
        max_tokens: Math.min(DEFAULT_API_PARAMS.max_tokens, 120),
        presence_penalty: 0,
        frequency_penalty: 0
      }));

      const completion = response as any;
      const text = completion.choices?.[0]?.message?.content?.trim();
      if (text) return text;
      return this.fastFallback(userMessage, stakeholder, context);
    } catch (err) {
      console.warn('generateStakeholderResponse fast-path error:', err);
      return this.fastFallback(userMessage, stakeholder, context);
    }
  }

  private buildProjectBits(project: any): string {
    if (!project) return '';
    const bits: string[] = [];
    if (project.businessContext) bits.push(`businessContext: ${this.trimLine(project.businessContext, 160)}`);
    if (project.problemStatement) bits.push(`problem: ${this.trimLine(project.problemStatement, 160)}`);
    if (project.asIsProcess) bits.push(`asIs: ${this.summarizeAsIs(project.asIsProcess)}`);
    const offering = this.deriveOfferingFromProject(project);
    if (offering) bits.push(`offering: ${offering}`);
    if (project.businessGoals) bits.push(`goals: ${this.trimLine(Array.isArray(project.businessGoals) ? project.businessGoals.join('; ') : project.businessGoals, 160)}`);
    return bits.join(' | ');
  }

  private buildRecentHistory(history: any[]): string {
    if (!Array.isArray(history) || history.length === 0) return '';
    const tail = history.slice(-3).map((m: any) => {
      const speaker = m.stakeholderName || m.speaker || m.sender || 'User';
      const content = typeof m.content === 'string' ? m.content : (m.text || '');
      return `${speaker}: ${this.trimLine(content, 100)}`;
    });
    return tail.join(' | ');
  }

  private summarizeAsIs(asIs: any): string {
    const steps = this.extractAsIsSteps(asIs);
    return steps.join(' -> ');
  }

  private extractAsIsSteps(asIs: any): string[] {
    if (!asIs) return [];
    let lines: string[] = [];
    if (Array.isArray(asIs)) {
      lines = asIs.map((s: any) => (typeof s === 'string' ? s : (s?.step || s?.text || '')));
    } else if (typeof asIs === 'string') {
      lines = asIs.split(/\n+/);
    } else {
      return [];
    }

    const steps: string[] = [];
    for (const raw of lines) {
      const line = (raw || '').trim();
      if (!line) continue;
      // Stop at Pain Points or other non-step sections
      if (/^pain\s*points\s*:/i.test(line)) break;
      // Skip section headings
      if (/^.*:\s*$/.test(line)) continue;
      // Extract numbered/bulleted steps
      const step = line.replace(/^\s*(\d+[).\-]?\s*|[-•]\s*)/, '').trim();
      if (step) steps.push(step);
    }
    // Limit to reasonable number of steps without ellipsis mid-word
    return steps.slice(0, 12);
  }

  private trimLine(s: string, max: number): string {
    if (!s) return '';
    return s.length <= max ? s : s.slice(0, max - 1) + '…';
  }

  private fastFallback(userMessage: string, stakeholder: StakeholderContext, context: ConversationContext): string {
    const lower = (userMessage || '').toLowerCase();
    const asIs = this.summarizeAsIs(context?.project?.asIsProcess);

    // Quick, human-like current-process fallback
    if (/(current\s+process|how\s+do\s+you\s+do\s+it|what's\s+the\s+process|whats\s+the\s+process)/i.test(lower)) {
      const steps = this.extractAsIsSteps(context?.project?.asIsProcess);
      if (steps.length > 0) {
        const concise = steps.slice(0, 8).join('; ');
        return `Sure, the flow is: ${concise}. That’s the usual sequence on our side.`;
      }
    }

    // "What do they buy from us" style fallback
    if (/(what do .*buy from us|what.*buy from us|what.*buy)/i.test(lower)) {
      const offering = this.deriveOfferingFromProject(context?.project) || 'our core platform and services';
      return `Primarily ${offering}. If you’re asking about pre‑sale vs post‑sale, this relates to ${context?.conversationPhase === 'as_is' ? 'post‑sale onboarding' : 'our overall offering'}—happy to clarify.`;
    }

    // Generic concise fallback grounded in role
    return `From my ${stakeholder.role}${stakeholder.department ? ' (' + stakeholder.department + ')' : ''} perspective, I’d say: ${this.trimLine(userMessage || 'Let me clarify the key points for you.', 60)} — and if helpful, we can tie this back to the current focus as we go.`;
  }

  private isGreetingSmallTalk(lower: string): boolean {
    if (!lower) return false;
    return /^(hi|hello|hey)\b/.test(lower) || /how (are|is) (you|everyone)/.test(lower);
  }

  private buildSmallTalkResponse(stakeholder: StakeholderContext, context: ConversationContext): string {
    // Keep it neutral, human, no fabricated outcomes
    return `Doing well, thanks. Ready to dive in—how would you like to start?`;
  }

  private isCurrentProcessQuestion(lower: string): boolean {
    if (!lower) return false;
    return /(current\s+process|what's\s+the\s+process|whats\s+the\s+process|how do you do it|how is it done)/i.test(lower);
  }

  private deriveOfferingFromProject(project: any): string | '' {
    if (!project) return '';
    const name = `${project.name || ''}`.toLowerCase();
    const desc = `${project.description || ''}`.toLowerCase();
    if (name.includes('onboarding') || desc.includes('onboarding')) return 'our onboarding optimization solution';
    if (name.includes('support') || desc.includes('support ticket')) return 'our customer support management solution';
    if (name.includes('inventory') || desc.includes('inventory')) return 'our inventory management enhancements';
    if (name.includes('expense') || desc.includes('expense')) return 'our digital expense management system';
    if (name.includes('performance') || desc.includes('performance')) return 'our performance management platform';
    return '';
  }
}

export { AIService };
export default AIService;