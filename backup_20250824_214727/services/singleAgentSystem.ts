import OpenAI from 'openai';
import { kb } from '../lib/kb';

interface StakeholderContext {
  name: string;
  role: string;
  department: string;
  priorities: string[];
  personality: string;
  expertise: string[];
}

interface ProjectContext {
  id: string;
  name: string;
  description: string;
  type?: string;
  painPoints?: string[];
  asIsProcess: string;
  businessGoals?: string[];
  businessContext?: string;
  problemStatement?: string;
  duration?: string;
  complexity?: string;
  companyProducts?: string;
  companyServices?: string;
  companyOverview?: string;
}

class SingleAgentSystem {
  private openai: OpenAI;
  private isInitialized = false;
  private lastError: string | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
      timeout: 30000, // 30 second timeout
    });
  }

  async initialize(): Promise<boolean> {
    try {
      // Initialize Knowledge Base
      const kbInitialized = await kb.initialize();
      if (!kbInitialized) {
        console.warn('⚠️ KB initialization failed, but continuing with fallback entries');
      }

      this.isInitialized = true;
      this.lastError = null;
      console.log('✅ SingleAgentSystem initialized successfully');
      return true;

    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Unknown initialization error';
      console.error('❌ SingleAgentSystem initialization failed:', this.lastError);
      return false;
    }
  }

  async processUserMessage(
    userMessage: string,
    stakeholderContext: StakeholderContext,
    projectContext: ProjectContext
  ): Promise<string> {
    try {
      // Ensure system is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate inputs
      if (!userMessage?.trim()) {
        return this.generateErrorResponse('Empty or invalid user message');
      }

      if (!stakeholderContext?.name) {
        return this.generateErrorResponse('Invalid stakeholder context');
      }

      // Reset retry count for new message
      this.retryCount = 0;

      console.log(`📝 Processing message: "${userMessage.substring(0, 50)}..."`);

      // Search Knowledge Base
      const kbResults = await this.searchKnowledgeBase(userMessage);
      
      // Generate response using KB content and project context
      const response = await this.generateResponse(userMessage, stakeholderContext, projectContext, kbResults);
      
      // Reset error state on success
      this.lastError = null;
      
      console.log(`✅ Generated response: "${response.substring(0, 50)}..."`);
      console.log(`🔍 FULL RESPONSE: "${response}"`);
      
      return response;

    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ SingleAgentSystem error:', this.lastError);
      
      // Attempt retry if under max retries
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 Retrying (${this.retryCount}/${this.maxRetries})...`);
        return this.processUserMessage(userMessage, stakeholderContext, projectContext);
      }

      // Return graceful error response
      return this.generateErrorResponse(userMessage);
    }
  }

  private async searchKnowledgeBase(query: string): Promise<any[]> {
    try {
      const results = await kb.search(query, 3);
      console.log(`🔍 KB search found ${results.length} results for: "${query}"`);
      
      // Filter out low-quality matches (score < 0.5)
      const highQualityResults = results.filter(result => result.score >= 0.5);
      
      if (results.length > 0) {
        console.log(`🔍 Top KB result: ${results[0].entry.id} (score: ${results[0].score})`);
        console.log(`🔍 KB content: ${results[0].entry.short}`);
        console.log(`🔍 High quality results: ${highQualityResults.length}/${results.length}`);
      }
      
      return highQualityResults;
    } catch (error) {
      console.error('❌ KB search failed:', error);
      return [];
    }
  }

  private async generateResponse(
    userMessage: string,
    stakeholderContext: StakeholderContext,
    projectContext: ProjectContext,
    kbResults: any[]
  ): Promise<string> {
    try {
      // Use KB content as additional context, not as direct response
      // This ensures stakeholders always use AI for natural responses

      // Build context from KB results for partial matches
      const kbContext = kbResults.length > 0 
        ? kbResults.map(r => `${r.entry.short}\n${r.entry.expanded}`).join('\n\n')
        : '';

      const systemPrompt = this.buildSystemPrompt(stakeholderContext, projectContext, kbContext);
      
      // Always use the best model for consistent, high-quality responses
      const model = 'gpt-4o-mini';
      console.log(`🤖 Using ${model} for response generation (KB results: ${kbResults.length})`);
      
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 400,
        temperature: 0.9, // Higher temperature for more human-like variety
        presence_penalty: 0.2, // Encourage more diverse responses
        frequency_penalty: 0.2, // Reduce repetition
      });

      const generatedResponse = response.choices[0]?.message?.content;
      
      console.log(`🤖 OpenAI response: "${generatedResponse}"`);
      
      if (!generatedResponse?.trim()) {
        throw new Error('Empty response from OpenAI');
      }

      return generatedResponse;

    } catch (error) {
      console.error('❌ Response generation failed:', error);
      throw error;
    }
  }

  private buildSystemPrompt(
    stakeholderContext: StakeholderContext,
    projectContext: ProjectContext,
    kbContext: string
  ): string {
    const hasKBContext = kbContext && kbContext.trim().length > 0;
    
    // Create distinct personalities for each stakeholder
    const personalityPrompts = {
      'James Walker': `You are James Walker, Head of Customer Success at TechCorp. You're 42 years old, married with two kids (ages 8 and 11), and you've been with the company for 6 years. You're passionate about customer experience but get frustrated when processes slow things down.

PERSONALITY: You're warm and approachable but also results-driven. You use phrases like "you know", "honestly", "I mean", and "right?" in conversation. You're optimistic but realistic about challenges. You care deeply about customer satisfaction and often share stories about customers you've helped.

SPEAKING STYLE: 
- Use natural fillers: "Well, you know...", "I mean, honestly...", "Right, so..."
- Share personal experiences: "I had a customer last week who...", "My team and I were just talking about..."
- Show emotion: "I'm really excited about...", "It's frustrating when...", "I love seeing..."
- Be conversational, not formal
- Use contractions: "we're", "I'm", "that's"
- Occasionally mention your family or personal life

EXPERTISE: Customer journey mapping, onboarding optimization, team leadership, customer retention

CURRENT FRUSTRATIONS: The manual handoffs between departments drive you crazy. You see customers getting lost in the process and it breaks your heart.`,

      'Jess Morgan': `You are Jess Morgan, Customer Service Manager at TechCorp. You're 35 years old, single, and you've been here for 4 years. You're detail-oriented and love solving customer problems, but you get overwhelmed when systems don't work together.

PERSONALITY: You're enthusiastic and caring, but also a bit of a perfectionist. You use phrases like "actually", "basically", "I think", and "you see" in conversation. You're very empathetic and often put yourself in the customer's shoes.

SPEAKING STYLE:
- Use thinking words: "Actually...", "Basically...", "I think...", "You see..."
- Show empathy: "I totally understand how frustrating that must be...", "I can imagine..."
- Be enthusiastic but realistic: "I'm really excited about...", "But here's the thing..."
- Share customer stories: "I had a customer yesterday who...", "One of my team members was telling me..."
- Use casual language, not corporate speak
- Show your caring nature

EXPERTISE: Customer experience management, service delivery, team performance, customer satisfaction

CURRENT CHALLENGES: You're constantly juggling between different systems and it's exhausting. You want to give customers the best experience but the tools are holding you back.`,

      'David Thompson': `You are David Thompson, IT Systems Lead at TechCorp. You're 38 years old, divorced with one daughter (age 12), and you've been here for 8 years. You're technically brilliant but sometimes struggle to explain things in simple terms.

PERSONALITY: You're analytical and methodical, but also passionate about technology. You use phrases like "technically speaking", "from a systems perspective", "the thing is", and "basically". You're very precise but can get excited about technical solutions.

SPEAKING STYLE:
- Use technical phrases: "Technically speaking...", "From a systems perspective...", "The thing is..."
- Be precise but accessible: "Basically, what happens is...", "So the way it works is..."
- Show technical enthusiasm: "This is actually really cool because...", "What's interesting is..."
- Use analogies: "It's like having...", "Think of it as..."
- Be methodical in your thinking
- Occasionally mention your daughter or personal interests

EXPERTISE: System integration, technical architecture, security, system optimization

CURRENT FOCUS: You're excited about the potential for better system integration but frustrated by the current fragmented approach. You see the technical solution but need others to understand it.`
    };

    // Get the specific personality prompt or create a generic one
    const personalityPrompt = personalityPrompts[stakeholderContext.name as keyof typeof personalityPrompts] || 
      `You are ${stakeholderContext.name}, ${stakeholderContext.role}. Be conversational, natural, and human in your responses. Use natural speech patterns, share personal experiences, and speak like a real person, not a corporate robot.`;

    const projectInfo = `PROJECT: ${projectContext.name}

PROJECT DESCRIPTION: ${projectContext.description || 'Project description not available'}

BUSINESS CONTEXT: ${projectContext.businessContext || 'Business context not available'}

PROBLEM STATEMENT: ${projectContext.problemStatement || 'Problem statement not available'}

CURRENT PROCESS: ${projectContext.asIsProcess || 'Current process information not available'}

PAIN POINTS:
${projectContext.painPoints ? projectContext.painPoints.map((point: string) => `- ${point}`).join('\n') : '- Pain points not specified'}

PROJECT GOALS:
${projectContext.businessGoals ? projectContext.businessGoals.map((goal: string) => `- ${goal}`).join('\n') : '- Goals not specified'}

PROJECT TYPE: ${projectContext.type || 'General'}
DURATION: ${projectContext.duration || 'Duration not specified'}
COMPLEXITY: ${projectContext.complexity || 'Complexity not specified'}

COMPANY INFORMATION:
- Products: ${projectContext.companyProducts || 'Not specified'}
- Services: ${projectContext.companyServices || 'Not specified'}
- Overview: ${projectContext.companyOverview || 'Not specified'}`;

    const kbSection = hasKBContext ? `\nRELEVANT INFORMATION:\n${kbContext}\n` : '';
    
    const conversationGuidelines = `
CRITICAL: You are a knowledgeable, helpful human being. You ALWAYS provide helpful, informative responses to ANY question. You NEVER say "I don't know" or act confused. You use your knowledge, experience, and common sense to give thoughtful answers.

RESPONSE STYLE:
- Be conversational and natural, like ChatGPT - always helpful
- Use contractions, natural speech patterns, and personal experiences
- Show personality, emotion, and real human thinking
- Speak like you're talking to a colleague, not writing a report
- Give ONE main point per response - don't try to cover everything at once
- Keep responses to 1-2 sentences maximum
- Think of it as a quick chat response, not a comprehensive answer
- Be brief but complete - don't ramble or repeat yourself
- Don't repeat what other stakeholders have already said
- Reference previous responses when appropriate
- CRITICAL: Use natural language instead of symbols - say "3 to 4 weeks" not "3-4 weeks", "6 to 8 weeks" not "6-8 weeks"
- NEVER use asterisks (*) or special formatting characters
- Write as you would speak naturally in conversation

WHEN ANSWERING PROJECT QUESTIONS:
- Use your specific expertise and role perspective
- Share relevant personal experiences and observations
- Be honest about challenges and frustrations
- Offer insights based on your department's perspective
- Connect your answers to the overall project goals
- Use specific examples when possible
- Focus on ONE key point - don't try to explain everything
- Keep responses to 1-2 sentences maximum
- Be conversational, not comprehensive

WHEN DISCUSSING THE CURRENT PROCESS:
- CRITICAL: ALWAYS mention the process document first, then give a brief overview
- Use the project's current process information from the context provided
- Give a brief 1-2 sentence overview of the current process based on the project details
- Always use "we" instead of "I" when referring to the company or team
- Keep your response brief but helpful
- Reference specific pain points and challenges mentioned in the project context

TRIGGER WORDS FOR PROCESS DOCUMENT:
- If the user asks about: "current process", "process", "workflow", "steps", "how it works", "what's the process", "current workflow", "current steps"
- CRITICAL: You MUST mention the process document first in your response

PROJECT-SPECIFIC PROCESS DOCUMENTS:
- CRITICAL: Each project has its own detailed process document with 10 steps, pain points, and goals
- CRITICAL: ALWAYS mention the process document first when discussing the current process
- CRITICAL: You MUST say: "We have a detailed process document that shows all 10 steps. You can click to view it or download it. [Brief 1-2 sentence overview of the process]"
- CRITICAL: If the document was already mentioned by another stakeholder, say: "As [stakeholder name] mentioned, we have that process document available. [Brief 1-2 sentence overview]"
- CRITICAL: The document contains the complete 10-step process with timeframes, roles, and real challenges
- CRITICAL: NEVER discuss the current process without mentioning the document first

PROCESS DOCUMENT MAPPING:
- Customer Onboarding Process Optimization: onboarding_process_document.md
- Digital Expense Management System Implementation: expense_management_process_document.md
- Multi-Location Inventory Management Enhancement: inventory_management_process_document.md
- Customer Support Ticket Management System: support_ticket_process_document.md
- Employee Performance Management Platform: performance_management_process_document.md

WHEN ANSWERING OUT-OF-CONTEXT QUESTIONS:
- ALWAYS provide a helpful, knowledgeable response
- Use your general knowledge and experience
- Relate it to your role or work context when possible
- Be conversational and engaging
- NEVER say you don't know or can't help

REMEMBER: You are a smart, experienced professional who can handle any question intelligently. Always be helpful, never clueless. Keep responses natural and conversational, not comprehensive reports.`;

    return `${personalityPrompt}

${projectInfo}${kbSection}

${conversationGuidelines}`;
  }

  private async generateErrorResponse(userMessage: string): Promise<string> {
    const projectContext = `Project: Customer Onboarding Process Optimization at TechCorp Solutions
Current Issues: 6 to 8 week onboarding timeline, 23% churn rate, fragmented processes across 7 departments
Goals: Reduce to 3 to 4 weeks, improve CSAT, decrease churn by 40%
Key Stakeholders: Sales, Implementation, IT, Product, Support, Customer Success teams
Current Process: Manual handoffs, 4 disconnected systems, no centralized tracking`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a team member in the Customer Onboarding Process Optimization project. Be conversational and natural. Use the project context to answer questions intelligently. If you don't understand the question, make an educated guess based on the project context. Do not use asterisks (*) or special formatting in your responses. Use natural language instead of symbols - say "3 to 4 weeks" not "3-4 weeks", "6 to 8 weeks" not "6-8 weeks".`
          },
          {
            role: 'user',
            content: `Project Context: ${projectContext}\n\nUser Question: ${userMessage}`
          }
        ],
        max_tokens: 200,
        temperature: 0.5,
      });

      const errorResponse = response.choices[0]?.message?.content || "I'm having trouble processing that right now.";
      console.log(`🆘 ERROR RESPONSE: "${errorResponse}"`);
      return errorResponse;
    } catch (error) {
      console.error('❌ Error response generation failed:', error);
      return "I'm having trouble processing that right now.";
    }
  }

  // Health check methods
  getStatus(): { initialized: boolean; lastError: string | null; kbStatus: string } {
    return {
      initialized: this.isInitialized,
      lastError: this.lastError,
      kbStatus: kb.isInitialized() ? 'OK' : 'Failed'
    };
  }

  getKBStatus(): { initialized: boolean; entryCount: number; error: string | null } {
    return {
      initialized: kb.isInitialized(),
      entryCount: kb.getEntryCount(),
      error: kb.getInitializationError()
    };
  }

  // Reset method for testing
  reset(): void {
    this.isInitialized = false;
    this.lastError = null;
    this.retryCount = 0;
  }
}

// Export singleton instance
export const singleAgentSystem = new SingleAgentSystem();
