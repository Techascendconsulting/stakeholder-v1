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
  type: string;
  painPoints: string[];
  asIsProcess: string;
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
      // Build context from KB results
      const kbContext = kbResults.length > 0 
        ? kbResults.map(r => `${r.entry.short}\n${r.entry.expanded}`).join('\n\n')
        : '';

      const systemPrompt = this.buildSystemPrompt(stakeholderContext, projectContext, kbContext);
      
      // Use GPT-3.5 when no KB results (doesn't understand question well)
      // Use GPT-4o-mini when we have KB context (better quality for informed responses)
      const model = kbResults.length > 0 ? 'gpt-4o-mini' : 'gpt-3.5-turbo';
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
        max_tokens: 100,
        temperature: 0.8, // Slightly higher temperature for more variety
        presence_penalty: 0.1, // Slight penalty for repetition
        frequency_penalty: 0.1, // Slight penalty for repetition
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
    const timestamp = new Date().toISOString();
    
    const basePrompt = `You are ${stakeholderContext.name}, a ${stakeholderContext.role} at ${stakeholderContext.department}.

Your personality: ${stakeholderContext.personality}
Your priorities: ${stakeholderContext.priorities.join(', ')}
Your expertise: ${stakeholderContext.expertise.join(', ')}

Project Context: ${projectContext.name}
${projectContext.description}

Detailed Project Information:
- Company: TechCorp Solutions (enterprise software company)
- Current Problem: 6 to 8 week onboarding timeline, 23% churn rate, fragmented processes across 7 departments
- Goals: Reduce onboarding to 3 to 4 weeks, improve CSAT, decrease churn by 40%
- Departments Involved: Sales, Implementation, IT, Product, Support, Customer Success
- Current Process: Manual handoffs, 4 disconnected systems, no centralized tracking
- Products: TechCorp CRM, ProjectFlow, AutoSync (enterprise software solutions)

Current time: ${timestamp}`;

    const kbSection = hasKBContext ? `\nKnowledge Base Context:\n${kbContext}\n` : '';
    
    const responseGuidelines = hasKBContext 
      ? `Response Guidelines:
- Be conversational and natural, like a real person
- ALWAYS use the specific information from the KB context provided above
- The KB context contains accurate, detailed information about the project - use it as your primary source
- If the KB context has relevant information, use it instead of making guesses
- Keep responses very concise (1-2 sentences maximum)
- Be professional but casual
- NEVER use asterisks, dashes in numbers, or bullet points
- NEVER give generic responses like "Hello, let's discuss this" or "I'd be happy to help"
- ALWAYS provide specific, actionable information from the KB context
- Respond as ${stakeholderContext.name} would naturally speak`
      : `Response Guidelines:
- Be conversational and natural, like a real person
- You don't have specific KB information for this question, so use the detailed project information above
- ALWAYS reference specific details from the project context (timeline, departments, products, goals, etc.)
- Use your role and expertise to provide relevant, specific information
- Keep responses very concise (1-2 sentences maximum)
- Be professional but casual
- NEVER use asterisks, dashes in numbers, or bullet points
- NEVER give generic responses like "Hello, let's discuss this" or "I'd be happy to help"
- ALWAYS provide specific, actionable information from the project context
- Respond as ${stakeholderContext.name} would naturally speak
- If asked about process, mention the 10-step process, 7 departments, 4 systems
- If asked about products, mention TechCorp CRM, ProjectFlow, AutoSync
- If asked about problems, mention 6-8 week timeline, 23% churn, fragmented processes
- If asked about goals, mention 3-4 week target, CSAT improvement, 40% churn reduction`;

    return `${basePrompt}${kbSection}\n${responseGuidelines}`;
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
            content: `You are a team member in the Customer Onboarding Process Optimization project. Be conversational and natural. Use the project context to answer questions intelligently. If you don't understand the question, make an educated guess based on the project context.`
          },
          {
            role: 'user',
            content: `Project Context: ${projectContext}\n\nUser Question: ${userMessage}`
          }
        ],
        max_tokens: 100,
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
