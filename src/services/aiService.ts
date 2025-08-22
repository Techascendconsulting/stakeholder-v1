import OpenAI from 'openai';
import SingleAgentSystem from './singleAgentSystem'; // Cost-effective single-agent system

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

// Use GPT-3.5 Turbo for cost-effective, natural responses
const MODEL = "gpt-3.5-turbo";

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
  private singleAgentSystem: SingleAgentSystem; // Cost-effective single-agent system
  
  private constructor() {
    this.conversationState = this.initializeConversationState();
    this.singleAgentSystem = SingleAgentSystem.getInstance(); // Initialize single-agent system
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

  // Add missing detectStakeholderMentions function
  public async detectStakeholderMentions(
    message: string,
    availableStakeholders: any[],
    userId: string,
    lastSpeaker?: string | null,
    conversationContext?: string
  ): Promise<{
    mentionedStakeholders: any[];
    confidence: number;
  }> {
    try {
      const messageLower = message.toLowerCase();
      const mentionedStakeholders = availableStakeholders.filter(stakeholder => {
        const nameLower = stakeholder.name.toLowerCase();
        const roleLower = stakeholder.role.toLowerCase();
        return messageLower.includes(nameLower) || messageLower.includes(roleLower);
      });

      return {
        mentionedStakeholders,
        confidence: mentionedStakeholders.length > 0 ? 0.8 : 0.0
      };
    } catch (error) {
      console.error('Error detecting stakeholder mentions:', error);
      return {
        mentionedStakeholders: [],
        confidence: 0.0
      };
    }
  }

  public static getMentionConfidenceThreshold(): number {
    return 0.7;
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
      return completion.choices[0]?.message?.content || await this.generateProjectSpecificResponse(stakeholder, context);
    } catch (error) {
      console.error('Error in generateResponse:', error);
      return await this.generateProjectSpecificResponse(stakeholder, context);
    }
  }

  // Cost-effective single-agent system stakeholder response
  public async generateStakeholderResponse(
    userMessage: string,
    stakeholder: StakeholderContext,
    context: ConversationContext = {},
    responseType: 'discussion' | 'baton_pass' | 'direct_mention' = 'discussion'
  ): Promise<string> {
    console.log(`🤖 SINGLE-AGENT: Generating response for ${stakeholder.name} (${stakeholder.role})`);
    
    try {
      // Use single-agent system to process the message (1-2 API calls max)
      const response = await this.singleAgentSystem.processUserMessage(
        userMessage,
        stakeholder,
        context.project || {
          id: 'customer-onboarding',
          name: 'Customer Onboarding Process Optimization',
          painPoints: ['manual data entry', 'delayed handoffs'],
          asIsProcess: 'Manual email-based handoffs'
        }
      );

      console.log(`✅ SINGLE-AGENT: ${stakeholder.name} response: "${response}"`);
      return response;
      
    } catch (error) {
      console.error('❌ SINGLE-AGENT ERROR:', error);
      
      // Fallback to project-specific response
      return await this.generateProjectSpecificResponse(stakeholder, context);
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

  // Use single agent system instead of hardcoded responses
  private async generateProjectSpecificResponse(stakeholder: StakeholderContext, context: ConversationContext): Promise<string> {
    const SingleAgentSystem = (await import('./singleAgentSystem')).default;
    const singleAgentSystem = SingleAgentSystem.getInstance();
    
    // Use the last user message as context
    const recentMessages = context?.conversationHistory || [];
    const lastUserMessage = recentMessages.slice(-1)[0]?.content || 'Hello';
    
    return await singleAgentSystem.processUserMessage(
      lastUserMessage,
      stakeholder,
      context?.project
    );
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
    // Let OpenAI generate contextual responses instead of hardcoded ones
    return '';
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

  // CRITICAL: Remove all markdown formatting for clean chat display
  private removeMarkdownFormatting(text: string): string {
    if (!text) return text;
    
    let cleaned = text;
    
    // Remove bold formatting
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
    
    // Remove italic formatting
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
    
    // Remove code formatting
    cleaned = cleaned.replace(/`(.*?)`/g, '$1');
    
    // Remove numbered lists (1. 2. 3. etc.)
    cleaned = cleaned.replace(/^\d+\.\s*/gm, '');
    
    // Remove bullet points (- * •)
    cleaned = cleaned.replace(/^[-*•]\s*/gm, '');
    
    // Remove headers
    cleaned = cleaned.replace(/^#{1,6}\s*/gm, '');
    
    // Remove horizontal rules
    cleaned = cleaned.replace(/^---$/gm, '');
    
    // Remove blockquotes
    cleaned = cleaned.replace(/^>\s*/gm, '');
    
    // Remove any remaining numbered patterns
    cleaned = cleaned.replace(/\d+\.\s*/g, '');
    
    // Clean up extra whitespace and newlines
    cleaned = cleaned.replace(/\n\s*\n/g, '\n').trim();
    
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

  private buildAgentPrompt(stakeholder: StakeholderContext, stage: string, memory: string, tools: string, insights: string, context?: ConversationContext): string {
    const basePrompt = [
      `You are ${stakeholder.name}, ${stakeholder.role}${stakeholder.department ? ' in ' + stakeholder.department : ''}.`,
      `Project: ${insights}`,
      `Recent conversation: ${memory}`,
      `Be conversational and concise. Focus on answering the specific question without going into too much detail. Keep responses practical and actionable, not comprehensive. Talk like you're in a casual business meeting, not writing a report. Start responses naturally without forced greetings like "Hey there!" or "Great!" - just answer the question directly. Avoid over-enthusiastic language and repetitive phrases. Be professional but relaxed, like a colleague in a meeting.`,
      `IMPORTANT: When mentioning time ranges or numbers with dashes, pronounce them naturally. Say "24 to 48 hours" instead of "24-48 hours", "3 to 5 days" instead of "3-5 days", "6 to 8 weeks" instead of "6-8 weeks".`
    ];

    // Add stakeholder-to-stakeholder context if applicable
    if (context?.isStakeholderToStakeholder && context?.askingStakeholder) {
      basePrompt.push(`${context.askingStakeholder} just asked you a question.`);
    }

    return basePrompt.join(' ');
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
    // Let OpenAI generate contextual questions instead of hardcoded responses
    return '';
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
        return "No meeting content available to summarize.";
      }

      if (messages.length < 2) {
        return "Insufficient meeting content to create a meaningful summary.";
      }

      progressCallback?.("Generating comprehensive meeting summary...");

      const systemPrompt = "You are a professional Business Analyst creating concise meeting notes. Create a brief, structured summary with: Meeting Context (date, duration, participants, project), Summary (1-2 sentences max), and Key Points (3-4 bullet points of main topics discussed). Keep it short and focused. If the conversation was brief or only greetings, simply state that no substantive topics were discussed. CRITICAL: Do NOT use markdown formatting, bold text, or any special formatting. Write in plain text only.";

      const conversationText = messages.map((msg: any) => msg.speaker + ": " + msg.content).join("\n\n");
      const meetingDate = startTime ? new Date(startTime).toLocaleDateString() : new Date().toLocaleDateString();
      const userPrompt = "Project: " + (project?.name || "Unknown Project") + " Date: " + meetingDate + " Duration: " + (duration || 0) + " minutes Participants: " + (participants?.map((p: any) => p.name + " (" + p.role + ")").join(", ") || "Unknown") + " Conversation: " + conversationText + " Create a concise summary with: Meeting Context, Summary (1-2 sentences), and Key Points (3-4 bullet points). Keep it brief and focused.";

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 250,
        presence_penalty: 0,
        frequency_penalty: 0
      });

      let summary = response.choices[0]?.message?.content?.trim();
      
      // Remove markdown formatting from summary
      if (summary) {
        summary = this.removeMarkdownFormatting(summary);
      }
      
      progressCallback?.("Summary generation completed.");
      
      return summary || "Unable to generate meeting summary.";
      
    } catch (error) {
      console.error("Error generating interview notes:", error);
      return "Unable to generate meeting summary due to an error.";
    }
  }
}
export { AIService };
export default AIService;
