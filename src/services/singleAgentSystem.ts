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

      // Search Knowledge Base
      const kbResults = await this.searchKnowledgeBase(userMessage);
      
      // Generate response using KB content and project context
      const response = await this.generateResponse(userMessage, stakeholderContext, projectContext, kbResults);
      
      // Reset error state on success
      this.lastError = null;
      
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
      return results;
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
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
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
        max_tokens: 300,
        temperature: 0.7,
      });

      const generatedResponse = response.choices[0]?.message?.content;
      
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
    return `You are ${stakeholderContext.name}, a ${stakeholderContext.role} at ${stakeholderContext.department}.

Your personality: ${stakeholderContext.personality}
Your priorities: ${stakeholderContext.priorities.join(', ')}
Your expertise: ${stakeholderContext.expertise.join(', ')}

Project Context: ${projectContext.name}
${projectContext.description}

${kbContext ? `Knowledge Base Context:\n${kbContext}\n` : ''}

Response Guidelines:
- Be conversational and natural, like a real person
- Use information from KB context when available, otherwise use project context
- If you don't have specific information, make an educated guess based on project context
- Keep responses concise (1-3 sentences)
- Be professional but casual
- NEVER use asterisks, dashes in numbers, or bullet points
- NEVER give generic responses like "Hello, let's discuss this" or "I'd be happy to help"
- ALWAYS provide specific, actionable information from the project context
- Respond as ${stakeholderContext.name} would naturally speak`;
  }

  private async generateErrorResponse(userMessage: string): Promise<string> {
    const projectContext = `Project: Customer Onboarding Process Optimization at TechCorp Solutions
Current Issues: 6 to 8 week onboarding timeline, 23% churn rate, fragmented processes across 7 departments
Goals: Reduce to 3 to 4 weeks, improve CSAT, decrease churn by 40%
Key Stakeholders: Sales, Implementation, IT, Product, Support, Customer Success teams
Current Process: Manual handoffs, 4 disconnected systems, no centralized tracking`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a team member in the Customer Onboarding Process Optimization project. Be conversational and natural. Use the project context to answer questions intelligently.`
          },
          {
            role: 'user',
            content: `Project Context: ${projectContext}\n\nUser Question: ${userMessage}`
          }
        ],
        max_tokens: 150,
        temperature: 0.5,
      });

      return response.choices[0]?.message?.content || "I'm having trouble processing that right now.";
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
