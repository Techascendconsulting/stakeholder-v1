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
  private openai: OpenAI | null;
  private isInitialized = false;
  private lastError: string | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  constructor() {
    // Initialize with null - will create client lazily when needed
    this.openai = null;
    
    // Try to initialize client, but don't throw if it fails
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const hasValidApiKey = apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0;
      if (!hasValidApiKey) {
        console.warn('⚠️ VITE_OPENAI_API_KEY not set - Single agent system features will be disabled');
        this.openai = null;
        return; // Early return to prevent any further execution
      }
      
      // Double-check before creating client
      const trimmedKey = apiKey.trim();
      if (!trimmedKey || trimmedKey.length === 0) {
        console.warn('⚠️ VITE_OPENAI_API_KEY is empty after trim - Single agent system features will be disabled');
        this.openai = null;
        return;
      }
      
      // Only create client if we have a valid key
      this.openai = new OpenAI({
        apiKey: trimmedKey,
        dangerouslyAllowBrowser: true,
        timeout: 30000 // 30 second timeout
        // Removed baseURL - call OpenAI directly (backend server not required)
      });
    } catch (error) {
      // Silently fail - don't throw errors during construction
      console.error('❌ Failed to initialize OpenAI client for single agent system:', error);
      this.openai = null;
    }
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
    projectContext: ProjectContext,
    conversationHistory: any[] = [],
    totalStakeholders: number = 1
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
      console.log(`🧠 Conversation memory: ${conversationHistory.length} messages in history`);

      // Search Knowledge Base
      const kbResults = await this.searchKnowledgeBase(userMessage);
      
      // Generate response using KB content, project context, and conversation history
      const response = await this.generateResponse(
        userMessage, 
        stakeholderContext, 
        projectContext, 
        kbResults, 
        conversationHistory, 
        totalStakeholders
      );
      
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
        return this.processUserMessage(userMessage, stakeholderContext, projectContext, conversationHistory, totalStakeholders);
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
    kbResults: any[],
    conversationHistory: any[] = [],
    totalStakeholders: number = 1
  ): Promise<string> {
    try {
      // Always use AI for dynamic responses, but use KB context to inform the AI
      const kbContext = kbResults.length > 0 
        ? kbResults.map(r => `${r.entry.short}\n${r.entry.expanded}`).join('\n\n')
        : '';

      const systemPrompt = this.buildSystemPrompt(stakeholderContext, projectContext, kbContext, conversationHistory);
      
      // Use GPT-4o-mini for better quality responses
      const model = 'gpt-4o-mini';
      console.log(`🤖 Using ${model} for dynamic AI response generation`);
      
      // Dynamic context window: Scale based on number of stakeholders
      // Formula: More stakeholders = need more context to track who said what
      // 1 stakeholder: 8 messages (4 exchanges), 2 stakeholders: 16 messages, 3+: 24 messages
      const baseContextSize = 8;
      const contextWindowSize = Math.min(baseContextSize * Math.min(totalStakeholders, 3), 24);
      
      console.log(`🧠 MEMORY: Using context window of ${contextWindowSize} messages for ${totalStakeholders} stakeholder(s)`);
      
      // Build conversation history for context awareness
      // Convert to OpenAI message format
      const historyMessages = conversationHistory.slice(-contextWindowSize).map((msg: any) => {
        // Identify if message is from user or stakeholder
        // Check if speaker is 'user' string or if it's not a stakeholder (no stakeholderName)
        const isUserMessage = msg.speaker === 'user' || !msg.stakeholderName;
        
        if (isUserMessage) {
          return { role: 'user' as const, content: msg.content };
        } else {
          // Include stakeholder name for multi-stakeholder context
          const stakeholderName = msg.stakeholderName || 'Stakeholder';
          return { 
            role: 'assistant' as const, 
            content: totalStakeholders > 1 ? `[${stakeholderName}]: ${msg.content}` : msg.content 
          };
        }
      });
      
      console.log(`📚 Including ${historyMessages.length} messages from conversation history`);
      
      if (!this.openai) {
        throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY to enable AI features.');
      }
      
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...historyMessages,  // Include conversation history for memory and context
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 150, // Short, natural responses
        temperature: 0.7, // Balanced creativity
        presence_penalty: 0.2, // Encourage diverse responses
        frequency_penalty: 0.2, // Reduce repetition
      });

      const generatedResponse = response.choices[0]?.message?.content;
      
      console.log(`🤖 AI Generated Response: "${generatedResponse}"`);
      
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
    kbContext: string,
    conversationHistory: any[] = []
  ): string {
    const hasKBContext = kbContext && kbContext.trim().length > 0;
    const hasConversationHistory = conversationHistory.length > 0;
    const timestamp = new Date().toISOString();
    
    const basePrompt = `You are ${stakeholderContext.name}, a ${stakeholderContext.role} at ${stakeholderContext.department}.

Your personality: ${stakeholderContext.personality}
Your priorities: ${stakeholderContext.priorities.join(', ')}
Your expertise: ${stakeholderContext.expertise.join(', ')}

PROJECT CONTEXT:
Project Name: ${projectContext.name}
Project Description: ${projectContext.description}

${projectContext.asIsProcess ? `Current Process: ${projectContext.asIsProcess}` : ''}

IMPORTANT: You must respond based on the specific project context above. Each project has different companies, problems, and goals. Do NOT reference companies, systems, or processes that are not mentioned in the project context provided.

Current time: ${timestamp}`;

    const kbSection = hasKBContext ? `\nKnowledge Base Context:\n${kbContext}\n` : '';
    
    // Add conversation memory awareness
    const memorySection = hasConversationHistory 
      ? `\n🧠 CONVERSATION MEMORY: You can reference earlier parts of this conversation. If the user asks about something you discussed before, acknowledge it and build upon that context. You remember everything from this meeting.`
      : '';
    
    const responseGuidelines = `\nRESPONSE STYLE:
- Keep responses SHORT and CONVERSATIONAL (1-2 sentences max)
- Be natural, not formal - speak like a real person in a meeting
- Don't dump information - give brief, human-like responses
- ${hasConversationHistory ? 'Reference previous conversation points when relevant' : 'Respond directly to the question'}
- ${hasKBContext ? 'Use the KB context for accuracy but keep it casual' : 'Use your role expertise naturally'}
- Show personality - react naturally to the conversation flow`;

    return `${basePrompt}${kbSection}${memorySection}${responseGuidelines}`;
  }

  private async generateErrorResponse(userMessage: string): Promise<string> {
    const projectContext = `Project: Unable to determine specific project context
Please provide more details about the project you're working on.`;

    if (!this.openai) {
      return "I'm having trouble connecting right now. Please configure the OpenAI API key to enable AI features.";
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a team member in a business analysis project. Be conversational and natural. If you don't understand the question, ask for clarification about the specific project context. Do not use asterisks (*) or special formatting in your responses.`
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
