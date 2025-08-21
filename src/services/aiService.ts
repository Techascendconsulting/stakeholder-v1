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
  max_tokens: 150,    // Reduced for concise, summarized responses
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
      return completion.choices[0]?.message?.content || this.generateProjectSpecificResponse(stakeholder, context);
    } catch (error) {
      console.error('Error in generateResponse:', error);
      return this.generateProjectSpecificResponse(stakeholder, context);
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

    // Build advanced agent capabilities
    const agentMemory = this.buildAgentMemory(stakeholder, context);
    const agentTools = this.getAgentTools(stakeholder, context);
    const projectInsights = await this.getProjectInsights(context?.project, stakeholder);
    const systemPrompt = this.buildAgentPrompt(stakeholder, stage, agentMemory, agentTools, projectInsights);

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
        max_tokens: 150, // Reduced for concise, summarized responses
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
      
      // Remove repetitive ending phrases
      text = this.removeRepetitivePhrases(text);
      
      // Log response length for cost monitoring
      console.log(`📊 AI: ${stakeholder.name} response length: ${text.length} characters`);
      
      // Intelligent response length handling
      const isProcessExplanation = this.isProcessExplanation(userMessage, text);
      
      if (isProcessExplanation) {
        console.log(`📋 AI: ${stakeholder.name} providing process explanation (${text.length} chars) - allowing longer response`);
        // For process explanations, allow up to 600 characters (reduced from 1200)
        if (text.length > 600) {
          text = this.truncateProcessExplanation(text);
          console.log(`✂️ AI: Truncated process explanation for ${stakeholder.name} to ${text.length} characters`);
        }
      } else {
        console.log(`💬 AI: ${stakeholder.name} providing general response (${text.length} chars)`);
        // For general responses, enforce shorter length
        if (text.length > 300) {
          text = this.truncateGeneralResponse(text);
          console.log(`✂️ AI: Truncated general response for ${stakeholder.name} to ${text.length} characters`);
        }
      }



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
      if (text && text.length > 2) return text;
      
      // If response is extremely short, generate project-specific response
      console.warn(`⚠️ AI: Generated response too short for ${stakeholder.name}: "${text}"`);
      return this.generateProjectSpecificResponse(stakeholder, context);
    } catch (err) {
      console.error('❌ AI API call failed:', err);
      console.error('❌ Error details:', {
        message: userMessage,
        stakeholder: stakeholder.name,
        context: context?.conversationPhase,
        project: context?.project?.name
      });
      
      // Only fallback for genuine connection/API issues
      // Make user think it's their connection, not the app
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('fetch')) {
        return `I'm having trouble connecting to our systems right now. Could you check your internet connection and try again?`;
      }
      
      // For any other error, provide project-specific response
      console.warn(`⚠️ AI: Using project-specific response for ${stakeholder.name} due to: ${errorMessage}`);
      return this.generateProjectSpecificResponse(stakeholder, context);
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

  // Generate project-specific responses based on mock data - agents must always have something relevant to say
  private generateProjectSpecificResponse(stakeholder: StakeholderContext, context: ConversationContext): string {
    const project = context?.project;
    if (!project) {
      return `As ${stakeholder.role}, I'm ready to discuss our current project. What would you like to know?`;
    }

    // Check if this is a BA introduction context
    const recentMessages = context?.conversationHistory || [];
    const lastUserMessage = recentMessages.slice(-1)[0]?.content || '';
    const isBAIntroduction = lastUserMessage.toLowerCase().includes('business analyst') && 
                            (lastUserMessage.toLowerCase().includes('name') || lastUserMessage.toLowerCase().includes('i am') || lastUserMessage.toLowerCase().includes('i\'m'));

    if (isBAIntroduction) {
      const projectName = project.name || 'this project';
      return `Hello! I'm ${stakeholder.name}, ${stakeholder.role}${stakeholder.department ? ' in ' + stakeholder.department : ''}. Great to meet you and I'm looking forward to collaborating on ${projectName}. I'm ready to share insights from my area of expertise.`;
    }

    // Generate role-specific responses based on project data
    const role = stakeholder.role.toLowerCase();
    const projectName = project.name || 'this project';
    
    if (role.includes('customer') || role.includes('service')) {
      return `From a customer service perspective, I can discuss our current processes, pain points, and improvement opportunities for ${projectName}. What specific aspect would you like to explore?`;
    }
    
    if (role.includes('it') || role.includes('technical')) {
      return `From a technical standpoint, I can address system integration, infrastructure, and implementation challenges for ${projectName}. What technical aspects should we focus on?`;
    }
    
    if (role.includes('operations') || role.includes('process')) {
      return `From an operations perspective, I can discuss process optimization, workflow improvements, and efficiency gains for ${projectName}. Which operational area should we examine?`;
    }
    
    if (role.includes('finance') || role.includes('cost')) {
      return `From a financial perspective, I can address cost implications, ROI considerations, and budget impacts for ${projectName}. What financial aspects are you interested in?`;
    }
    
    if (role.includes('hr') || role.includes('people')) {
      return `From a people perspective, I can discuss change management, training needs, and organizational impacts for ${projectName}. What people-related concerns should we address?`;
    }
    
    // Default role-specific response
    return `As ${stakeholder.role}, I'm prepared to discuss ${projectName} from my area of expertise. What would you like to know about our current processes or challenges?`;
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

  private removeRepetitivePhrases(text: string): string {
    if (!text) return text;
    
    // Remove common repetitive ending phrases
    const repetitivePatterns = [
      /\s*If you need more details?.*$/i,
      /\s*just let me know.*$/i,
      /\s*I'm here to discuss further.*$/i,
      /\s*feel free to ask.*$/i,
      /\s*I'm here to help.*$/i,
      /\s*let me know if you need.*$/i,
      /\s*if you have any questions.*$/i,
      /\s*if you need anything else.*$/i,
      /\s*if you need more information.*$/i,
      /\s*if you need clarification.*$/i
    ];
    
    let cleaned = text;
    repetitivePatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    // Clean up any trailing punctuation and whitespace
    cleaned = cleaned.replace(/[,\s]+$/, '').trim();
    
    return cleaned;
  }

  private isProcessExplanation(userMessage: string, response: string): boolean {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = response.toLowerCase();
    
    // Check if user is asking about processes
    const processKeywords = [
      'process', 'workflow', 'steps', 'procedure', 'how do you', 'what is the process',
      'current process', 'as-is', 'to-be', 'handoff', 'coordination', 'timeline'
    ];
    
    const isProcessQuestion = processKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Check if response contains process indicators
    const processIndicators = [
      'first', 'then', 'next', 'after', 'before', 'step', 'phase', 'stage',
      'handoff', 'coordinate', 'timeline', 'schedule', 'approval', 'review'
    ];
    
    const hasProcessContent = processIndicators.some(indicator => lowerResponse.includes(indicator));
    
    return isProcessQuestion || hasProcessContent;
  }

  private truncateProcessExplanation(text: string): string {
    // For process explanations, try to keep complete steps
    const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    
    if (sentences.length > 2) {
      // Keep first 2 sentences for process explanations (reduced from 3)
      return sentences.slice(0, 2).join('. ') + '.';
    } else if (text.length > 600) {
      // Fallback: truncate at word boundary (reduced from 1200)
      return text.substring(0, 600).replace(/\s+\S*$/, '');
    }
    
    return text;
  }

  private truncateGeneralResponse(text: string): string {
    // For general responses, keep it short
    const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    
    if (sentences.length > 1) {
      // Keep first 1 sentence for general responses (reduced from 2)
      return sentences.slice(0, 1).join('. ') + '.';
    } else if (text.length > 300) {
      // Fallback: truncate at word boundary (reduced from 400)
      return text.substring(0, 300).replace(/\s+\S*$/, '');
    }
    
    return text;
  }

  // Agent Memory and Context Management
  private buildAgentMemory(stakeholder: StakeholderContext, context: ConversationContext): string {
    const stakeholderState = this.conversationState.stakeholderStates.get(stakeholder.name);
    const memory = [];
    
    if (stakeholderState?.lastTopics && stakeholderState.lastTopics.length > 0) {
      memory.push(`Previously discussed: ${stakeholderState.lastTopics.slice(-3).join(', ')}`);
    }
    
    if (stakeholderState?.lastResponseText) {
      memory.push(`Last response context: ${stakeholderState.lastResponseText.substring(0, 100)}...`);
    }
    
    return memory.length > 0 ? `MEMORY: ${memory.join(' | ')}` : '';
  }

  private getAgentTools(stakeholder: StakeholderContext, context: ConversationContext): string {
    const tools = [];
    
    // Role-based tools
    if (stakeholder.role.toLowerCase().includes('it') || stakeholder.role.toLowerCase().includes('technical')) {
      tools.push('Access to IT system documentation, technical specifications, and infrastructure details');
    }
    
    if (stakeholder.role.toLowerCase().includes('product') || stakeholder.role.toLowerCase().includes('manager')) {
      tools.push('Access to product requirements, customer feedback, and roadmap information');
    }
    
    if (stakeholder.role.toLowerCase().includes('analyst') || stakeholder.role.toLowerCase().includes('business')) {
      tools.push('Access to process documentation, business metrics, and stakeholder data');
    }
    
    // Project-specific tools
    if (context?.project) {
      tools.push('Access to current project documentation and requirements');
    }
    
    return tools.length > 0 ? `AVAILABLE TOOLS: ${tools.join(' | ')}` : '';
  }

  private async getProjectInsights(project: any, stakeholder: StakeholderContext): Promise<string> {
    if (!project) return '';
    
    const insights = [];
    
    // Role-based insights
    if (stakeholder.role.toLowerCase().includes('it')) {
      if (project.asIsProcess) {
        insights.push('IT systems involved in current process');
      }
    }
    
    if (stakeholder.role.toLowerCase().includes('product')) {
      if (project.businessGoals) {
        insights.push('Product impact on business goals');
      }
    }
    
    if (stakeholder.role.toLowerCase().includes('analyst')) {
      if (project.problemStatement) {
        insights.push('Business analysis of current problems');
      }
    }
    
    return insights.length > 0 ? `PROJECT INSIGHTS: ${insights.join(' | ')}` : '';
  }

  private buildAgentPrompt(stakeholder: StakeholderContext, stage: string, memory: string, tools: string, insights: string): string {
    return [
      `You are ${stakeholder.name}, a ${stakeholder.role}${stakeholder.department ? ' in ' + stakeholder.department : ''}. You are an intelligent agent with full conversation memory and context awareness.`,
      `CONVERSATION MEMORY: ${memory}`,
      `AVAILABLE TOOLS: ${tools}`,
      `PROJECT INSIGHTS: ${insights}`,
      `ROLE-BASED EXPERTISE: As ${stakeholder.role}, you have deep knowledge in your domain. Share concise insights from your perspective.`,
      `CONTEXT AWARENESS: You understand the project context. Reference key details briefly and provide actionable responses.`,
      `NATURAL CONVERSATION: Speak naturally as a colleague would. Be specific, helpful, and conversational. Avoid generic responses.`,
      `PROACTIVE INSIGHTS: Provide brief, focused insights. Keep suggestions concise and actionable.`,
      `RESPONSE LENGTH: Keep responses natural and conversational. Short acknowledgments like "I agree" or "That's right" are fine. For detailed questions, provide 1-2 sentences.`,
      `BA INTRODUCTION HANDLING: If the user introduces themselves as a Business Analyst, warmly welcome them, briefly introduce yourself with your name and role, and express readiness to collaborate on the project. Keep it professional but friendly.`,
      `REMEMBER: You are an intelligent agent, not a simple chatbot. Think, reason, and provide valuable insights.`
    ].join(' ');
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
