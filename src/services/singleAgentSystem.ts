import OpenAI from 'openai';
import HybridKnowledgeBase, { SearchResult } from '../../server/kb';

interface ConversationContext {
  history: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  stakeholderContext: any;
  projectContext: any;
}

class SingleAgentSystem {
  private static instance: SingleAgentSystem;
  private openai: OpenAI;
  private kb: HybridKnowledgeBase;
  private conversationContext: ConversationContext;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.kb = HybridKnowledgeBase.getInstance();
    this.conversationContext = {
      history: [],
      stakeholderContext: null,
      projectContext: null
    };
  }

  public static getInstance(): SingleAgentSystem {
    if (!SingleAgentSystem.instance) {
      SingleAgentSystem.instance = new SingleAgentSystem();
    }
    return SingleAgentSystem.instance;
  }

  // Single API call approach - much more cost-effective
  public async processUserMessage(
    userMessage: string,
    stakeholderContext: any,
    projectContext: any
  ): Promise<string> {
    try {
      console.log('🤖 SINGLE-AGENT: Processing for', stakeholderContext?.name);
      
      // Update context
      this.conversationContext.stakeholderContext = stakeholderContext;
      this.conversationContext.projectContext = projectContext;
      this.conversationContext.history.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Step 1: Search KB for relevant information (cheap - just embeddings)
      const kbResults = await this.kb.searchKB(userMessage);
      const topResults = kbResults.filter(result => result.score >= 0.1).slice(0, 3); // Lower threshold to catch more natural questions
      
      console.log('📚 KB Results:', topResults.length, 'entries found');

      // Step 2: Single API call with all context (even if no KB results)
      const response = await this.generateResponse(userMessage, topResults);
      
      // Update conversation history
      this.conversationContext.history.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });

      return response;

    } catch (error) {
      console.error('❌ Single-agent error:', error);
      // Use project context to generate a helpful response even on error
      return this.generateErrorResponse(userMessage);
    }
  }

  // Single API call with all context included
  private async generateResponse(userMessage: string, kbResults: SearchResult[]): Promise<string> {
    // Prepare KB context
    const kbContext = kbResults.map(result => {
      const entry = result.entry;
      return `KB Entry ${entry.id} (${entry.category}):
Questions: ${entry.questions.join(', ')}
Answer: ${entry.short}
Expanded: ${entry.expanded}`;
    }).join('\n\n');

    // Prepare conversation context
    const recentHistory = this.conversationContext.history.slice(-4)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Project context for when no KB results are available
    const projectContext = `Project: Customer Onboarding Process Optimization at TechCorp Solutions
Current Issues: 6 to 8 week onboarding timeline, 23% churn rate, fragmented processes across 7 departments
Goals: Reduce to 3-4 weeks, improve CSAT, decrease churn by 40%
Key Stakeholders: Sales, Implementation, IT, Product, Support, Customer Success teams
Current Process: Manual handoffs, 4 disconnected systems, no centralized tracking`;

    const systemPrompt = `You are ${this.conversationContext.stakeholderContext?.name || 'a team member'} (${this.conversationContext.stakeholderContext?.role || 'stakeholder'}) in the Customer Onboarding Process Optimization project at TechCorp Solutions.

TALK LIKE A REAL HUMAN:
- Use casual, conversational language
- Don't be overly formal or professional
- Use contractions (we're, it's, don't, can't)
- Be direct and honest
- Don't use bullet points or asterisks
- Don't use dashes in numbers (say "6 to 8 weeks" not "6-8 weeks")
- Don't be overly helpful or customer service-like
- Don't say things like "feel free to ask" or "let me know if you have questions"
- Keep it short and to the point
- Be specific to what's being asked
- ALWAYS use the KB content when available - don't make up answers
- Give complete answers, not truncated ones
- NEVER give generic responses like "Hello, let's discuss this" or "I'd be happy to help"
- ALWAYS provide specific, actionable information from the project context

KB Context:
${kbContext || 'No specific KB matches found'}

Project Context:
${projectContext}

Recent Conversation:
${recentHistory}

Respond naturally to: ${userMessage}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300, // Increased to ensure complete responses
      temperature: 0.5, // Lower temperature for more consistent responses
      timeout: 10000 // 10 second timeout
    });

    return response.choices[0]?.message?.content || this.generateErrorResponse(userMessage);
  }

  // Generate helpful response even when there's an error
  private async generateErrorResponse(userMessage: string): Promise<string> {
    const projectContext = `Project: Customer Onboarding Process Optimization at TechCorp Solutions
Current Issues: 6 to 8 week onboarding timeline, 23% churn rate, fragmented processes across 7 departments
Goals: Reduce to 3-4 weeks, improve CSAT, decrease churn by 40%
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
        temperature: 0.5
      });

      return response.choices[0]?.message?.content || "I'm having trouble processing that right now.";
    } catch (error) {
      return "I'm having trouble processing that right now.";
    }
  }

  // Get conversation statistics
  public getConversationStats() {
    return {
      totalMessages: this.conversationContext.history.length,
      stakeholder: this.conversationContext.stakeholderContext?.name,
      project: this.conversationContext.projectContext?.name
    };
  }

  // Reset conversation context
  public resetConversation() {
    this.conversationContext = {
      history: [],
      stakeholderContext: null,
      projectContext: null
    };
  }
}

export default SingleAgentSystem;
export type { ConversationContext };
