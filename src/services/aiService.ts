import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  timeout: 12000,     // allow deeper reasoning
  maxRetries: 2,      // retry once on transient errors
  defaultHeaders: {  // Optimize headers
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Use GPT-4 Turbo for higher-quality responses
const MODEL = "gpt-4-turbo";

// Default API parameters for faster responses
const DEFAULT_API_PARAMS = {
  model: MODEL,
  temperature: 0.4,
  max_tokens: 350,    // Allow more detailed, natural responses
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
    lastResponseText?: string;
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

    // Let all responses go through the main AI generation for natural conversation

    // Build a comprehensive, context-aware system prompt
    const systemPrompt = [
      `You are ${stakeholder.name}, a ${stakeholder.role}${stakeholder.department ? ' in ' + stakeholder.department : ''}.`,
      `You work for this company - speak as if you're part of it. Use "we", "our", "us" instead of constantly referring to the company by name.`,
      `Always answer the question asked with specific, realistic details. Keep responses concise - 2-3 sentences maximum.`,
      `If the question requires a longer explanation, provide a brief summary and offer to elaborate on specific aspects.`,
      `If the question is outside the current focus (${stage}), still answer with specific details, then (optionally) nudge back to ${stage}.`,
      `When asked about specific details not in the project context, provide reasonable, realistic estimates based on your role and typical business scenarios.`,
      `Prefer concrete details from the project context when relevant, but feel free to add realistic business details when needed.`,
      `For greetings/small talk, be polite and human-like. Respond naturally as a colleague would - friendly but professional. Avoid colons, bullet points, or robotic language. Keep it conversational.`,
      `For "current process" questions, summarize the As-Is steps and handoffs in plain language; avoid proposing solutions unless asked.`,
      `Never say "Hello, let's discuss this" or similar generic responses. Always provide specific, helpful information. Avoid using colons (:) in responses - write naturally as if speaking to a colleague. Be polite and conversational, not robotic.`,
      `If you need to provide more detail, say "I can elaborate on [specific aspect] if that would be helpful."`,
      `IMPORTANT: You may occasionally realize you forgot details or made assumptions. This is realistic - acknowledge it naturally like "Actually, let me think about that... I might have missed something" or "Wait, that reminds me of another issue we've been seeing."`,
      `As the conversation progresses and requirements are discussed, become more specific and firm in your answers. Early in the conversation you might be vague, but later you should provide concrete, actionable requirements.`
    ].join(' ');

    const projectBits = this.buildProjectBits(context?.project);
    const recent = this.buildRecentHistory(context?.conversationHistory || []);
    const userContent = [
      projectBits ? `Project context: ${projectBits}` : '',
      recent ? `Recent messages: ${recent}` : '',
      `User: ${userMessage}`
    ].filter(Boolean).join('\n');

    try {
      console.log('🚀 Making AI API call with:', {
        model: MODEL,
        messageLength: userContent.length,
        hasApiKey: !!import.meta.env.VITE_OPENAI_API_KEY
      });
      
      const response = await openai.chat.completions.create(createApiParams([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ], {
        // Favor speed and determinism
        temperature: 0.3,
        max_tokens: Math.min(DEFAULT_API_PARAMS.max_tokens, 200),
        presence_penalty: 0,
        frequency_penalty: 0
      }));

      const completion = response as any;
      let text = completion.choices?.[0]?.message?.content?.trim() || '';
      // Strip solution language when in As-Is phase
      if ((context?.conversationPhase || '').toString().startsWith('as')) {
        text = this.filterSolutionsInAsIs(text);
      }
      // Avoid generic/looping phrases and make it concrete
      text = this.avoidGenericResponses(text, context?.project, lowerMsg);



      // Prevent repetition from same stakeholder
      const last = this.conversationState.stakeholderStates.get(stakeholder.name)?.lastResponseText || '';
      if (last && this.isTooSimilar(text, last)) {
        const alt = this.generateSpecificsFollowUp(context?.project);
        if (alt) text = alt;
      }
      // Save last response
      const st = this.conversationState.stakeholderStates.get(stakeholder.name) || { hasSpoken: true, lastTopics: [], emotionalState: 'neutral', conversationStyle: 'concise' } as any;
      st.lastResponseText = text;
      this.conversationState.stakeholderStates.set(stakeholder.name, st);
      if (text && text.length > 10) return text;
      
      // Only use fallback if OpenAI API completely fails, not for empty responses
      console.warn(`⚠️ AI: Generated response too short for ${stakeholder.name}: "${text}"`);
      return this.fastFallback(userMessage, stakeholder, context);
    } catch (err) {
      console.error('❌ AI API call failed:', err);
      console.error('❌ Error details:', {
        message: userMessage,
        stakeholder: stakeholder.name,
        context: context?.conversationPhase,
        project: context?.project?.name
      });
      // Only use fallback when API actually fails - let AI retry
      throw new Error('AI generation failed, retrying...');
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
    return (
      /^(hi|hello|hey)\b/.test(lower) ||
      /\b(what's up|whats up|sup)\b/.test(lower) ||
      /how('s| is) (it going|it|things)/.test(lower) ||
      /how (are|is) (you|everyone)/.test(lower)
    );
  }

  private buildSmallTalkResponse(stakeholder: StakeholderContext, context: ConversationContext): string {
    // Let the AI generate natural greetings instead of hardcoded responses
    return '';
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

  private sanitizeStepForSpeech(text: string): string {
    if (!text) return '';
    // Remove parenthetical/bracketed asides
    let cleaned = text.replace(/\s*\([^)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '');
    // Collapse multiple spaces
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    // Remove trailing commas
    cleaned = cleaned.replace(/[,;]\s*$/g, '');
    return cleaned;
  }

  private isSubmissionChannelQuestion(lower: string): boolean {
    if (!lower) return false;
    return (
      /submission.*email/i.test(lower) ||
      /email.*submission/i.test(lower) ||
      /via.*email/i.test(lower) ||
      /submitted.*email/i.test(lower) ||
      /email.*submitted/i.test(lower)
    );
  }

  private answerSubmissionChannel(project: any): string | '' {
    if (!project?.asIsProcess) return '';
    const asIs = project.asIsProcess.toLowerCase();
    if (/email/.test(asIs)) return 'Yes, submissions are done via email.';
    if (/form|portal|system/.test(asIs)) return 'No, we use a digital form/portal for submissions.';
    return '';
  }

  private connectStepsForSpeech(steps: string[]): string {
    if (steps.length === 0) return '';
    if (steps.length === 1) return steps[0];
    let connected = steps[0];
    for (let i = 1; i < steps.length; i++) {
      connected += (i === steps.length - 1 ? ', and then we ' : ', then we ') + steps[i];
    }
    return connected;
  }

  private filterSolutionsInAsIs(text: string): string {
    if (!text) return text;
    // Remove solution-oriented language when in As-Is phase
    const solutionPatterns = [
      /by implementing/i,
      /we aim to/i,
      /we will/i,
      /we can/i,
      /this will/i,
      /this should/i
    ];
    let filtered = text;
    solutionPatterns.forEach(pattern => {
      filtered = filtered.replace(pattern, '');
    });
    return filtered.trim();
  }

  private isProductsServicesQuestion(lower: string): boolean {
    if (!lower) return false;
    return (
      /what\s+(products|services).*\b(offer|offers)\b/i.test(lower) ||
      /what\s+do\s+(you|we)\s+offer\b/i.test(lower) ||
      /what\s+does\s+(your\s+company|the\s+company)\s+offer\b/i.test(lower) ||
      /what\s+(are|is)\s+(your|the)\s+(products|services|offerings)\b/i.test(lower) ||
      /what\s+do\s+(you|we)\s+provide\b/i.test(lower) ||
      /what\s+do\s+(you|we)\s+sell\b/i.test(lower) ||
      /offerings\b/i.test(lower)
    );
  }

  private buildOfferingAnswer(project: any): string | '' {
    if (!project) return '';
    const products = (project.companyProducts || '').trim();
    const services = (project.companyServices || '').trim();
    const overview = (project.companyOverview || '').trim();
    if (products && services) {
      // TTS-friendly, no bullets; concise sentences
      return `Products: ${products} Services: ${services}${overview ? ` For context: ${overview}` : ''}`;
    }
    // Fallback to derived offering if explicit fields absent
    const derived = this.deriveOfferingFromProject(project);
    return derived ? `We primarily offer ${derived}.` : '';
  }

  private avoidGenericResponses(text: string, project: any, lowerMsg: string): string {
    if (!text) return text;
    const genericPatterns = [
      /let's discuss/i,
      /we need to dive deeper into the specifics/i,
      /let's dive deeper/i,
      /that's interesting/i
    ];
    if (genericPatterns.some(p => p.test(text))) {
      const specific = this.generateSpecificsFollowUp(project);
      if (specific) return specific;
    }
    return text;
  }

  private generateSpecificsFollowUp(project: any): string | '' {
    if (!project) return '';
    const sources = [project.problemStatement || '', project.asIsProcess || '', project.businessContext || '']
      .join('\n').toLowerCase();
    const picks: string[] = [];
    const pushIf = (cond: boolean, phrase: string) => { if (cond && !picks.includes(phrase) && picks.length < 3) picks.push(phrase); };
    pushIf(/manual/.test(sources), 'manual data entry causing errors');
    pushIf(/email/.test(sources), 'email-based handoffs creating delays');
    pushIf(/approval|manager/.test(sources), 'slow manager approvals');
    pushIf(/excel/.test(sources), 'Excel-based tracking with poor visibility');
    pushIf(/compliance|sox|policy/.test(sources), 'policy/compliance checks that are hard to enforce');
    pushIf(/visibility/.test(sources), 'limited real-time visibility for stakeholders');
    pushIf(/handoff|handoffs/.test(sources), 'multiple handoffs that drop context');
    if (picks.length === 0) return '';
    if (picks.length === 1) return `A concrete example is ${picks[0]}. Where would you like to start?`;
    if (picks.length === 2) return `Specific issues include ${picks[0]} and ${picks[1]}. Which should we explore first?`;
    return `Specific issues include ${picks[0]}, ${picks[1]}, and ${picks[2]}. Which should we explore first?`;
  }

  private isTooSimilar(a: string, b: string): boolean {
    const na = a.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const nb = b.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    if (na === nb) return true;
    // very short replies repeating
    if (na.length < 40 && nb.includes(na)) return true;
    return false;
  }

  public getConversationAnalytics() {
    return {
      messageCount: this.conversationState.messageCount,
      participantInteractions: Object.fromEntries(this.conversationState.participantInteractions),
      topicsDiscussed: Array.from(this.conversationState.topicsDiscussed),
      conversationPhase: this.conversationState.conversationPhase,
      stakeholderStates: Object.fromEntries(
        Array.from(this.conversationState.stakeholderStates.entries()).map(([name, state]) => [
          name,
          {
            hasSpoken: state.hasSpoken,
            lastTopics: state.lastTopics,
            emotionalState: state.emotionalState,
            conversationStyle: state.conversationStyle
          }
        ])
      )
    };
  }
  public async generateInterviewNotes(meetingData: any, progressCallback?: (progress: string) => void): Promise<string> {
    try {
      progressCallback?.("Analyzing conversation content...");
      const { messages, project, participants, duration, startTime, endTime } = meetingData;
      
      if (!messages || messages.length === 0) {
        return "Meeting discussion not sufficient to create a summary.";
      }

      if (messages.length < 2) {
        return "Meeting discussion not sufficient to create a summary.";
      }

      progressCallback?.("Generating comprehensive meeting summary...");

      const systemPrompt = "You are a professional Business Analyst creating meeting notes from a stakeholder interview. Create a well-structured meeting summary with these sections: Meeting Context (date, duration, participants, project), Summary (main discussion points in 2-3 sentences), Topics Discussed (clean bullet points of specific topics discussed), and Key Insights (analyze impacts: Process Breakdown Insight, Customer Impact Insight, Team Impact Insight, Business Impact Insight). If the conversation was brief or only greetings, simply state that no substantive topics were discussed. Focus on actual discussion content and real impacts.";

      const conversationText = messages.map((msg: any) => msg.speaker + ": " + msg.content).join("\n\n");
      const meetingDate = startTime ? new Date(startTime).toLocaleDateString() : new Date().toLocaleDateString();
      const userPrompt = "Project: " + (project?.name || "Unknown Project") + " Date: " + meetingDate + " Duration: " + (duration || 0) + " minutes Participants: " + (participants?.map((p: any) => p.name + " (" + p.role + ")").join(", ") || "Unknown") + " Conversation: " + conversationText + " Please create a structured summary with: Meeting Context, Summary (main points), Topics Discussed (clean bullet points of specific topics), and Key Insights (Process Breakdown, Customer Impact, Team Impact, Business Impact insights). Be factual and focus on actual impacts discussed.";

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 400,
        presence_penalty: 0,
        frequency_penalty: 0
      });

      const summary = response.choices[0]?.message?.content?.trim();
      
      progressCallback?.("Summary generation completed.");
      
      return summary || "Meeting discussion not sufficient to create a summary.";
      
    } catch (error) {
      console.error("Error generating interview notes:", error);
      return "Meeting discussion not sufficient to create a summary.";
    }
  }
}
export { AIService };
export default AIService;
