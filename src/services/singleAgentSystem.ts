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

      // Fast fallback for common questions (no API call)
      const fastResponse = this.getFastResponse(userMessage);
      if (fastResponse) {
        console.log('⚡ FAST RESPONSE:', fastResponse);
        return fastResponse;
      }

      // Step 1: Search KB for relevant information (cheap - just embeddings)
      const kbResults = await this.kb.searchKB(userMessage);
      const topResults = kbResults.filter(result => result.score >= 0.2).slice(0, 2); // Faster: fewer results, lower threshold
      
      console.log('📚 KB Results:', topResults.length, 'entries found');

      // If no relevant KB results found, return a clear "no information" response
      if (topResults.length === 0) {
        const noInfoResponse = `I don't have specific information about that. Could you ask about our onboarding process, current challenges, business goals, or stakeholder roles?`;
        this.conversationContext.history.push({
          role: 'assistant',
          content: noInfoResponse,
          timestamp: new Date()
        });
        return noInfoResponse;
      }

      // Step 2: Single API call with all context
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
      return this.getSimpleFallback(userMessage);
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

    const systemPrompt = `You are ${this.conversationContext.stakeholderContext?.name || 'a team member'} (${this.conversationContext.stakeholderContext?.role || 'stakeholder'}) in the Customer Onboarding Process Optimization project at TechCorp Solutions.

CRITICAL RULES:
1. Use ONLY information from the provided KB context - do NOT invent or assume anything
2. Be conversational and natural - NOT formal or robotic
3. NEVER use asterisks (*) - write naturally
4. NEVER use dashes in numbers - say "6 to 8 weeks" not "6-8 weeks"
5. AVOID repetitive phrases like "feel free to ask", "let me know", "if you have questions"
6. Be direct and specific - don't be overly helpful or formal
7. If the KB context doesn't contain the specific information needed, say "I don't have that specific information" and suggest related topics
8. Speak like a real person, not a customer service representative
9. Keep responses concise but informative
10. NEVER give generic responses - always be specific to the question asked

KB Context:
${kbContext}

Recent Conversation:
${recentHistory}

Respond naturally to: ${userMessage}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 150, // Reduced for faster responses
      temperature: 0.5, // Lower temperature for more consistent responses
      timeout: 10000 // 10 second timeout
    });

    return response.choices[0]?.message?.content || this.getSimpleFallback(userMessage);
  }

  // Simple fallback without API call
  private getSimpleFallback(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hi! How can I help you with our onboarding project?";
    }
    
    if (lowerMessage.includes('how are you')) {
      return "I'm doing well, thanks! Ready to discuss our onboarding optimization work.";
    }
    
    if (lowerMessage.includes('challenge') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      return "Our main challenges are the 6 to 8 week onboarding timeline, 23% churn rate, and fragmented processes across 7 departments.";
    }
    
    if (lowerMessage.includes('process') || lowerMessage.includes('workflow')) {
      return "Our current process involves manual handoffs between departments, no centralized tracking, and 4 disconnected systems.";
    }
    
    return "I'd be happy to help with our Customer Onboarding Process Optimization project. What would you like to know about our current process, goals, or challenges?";
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
