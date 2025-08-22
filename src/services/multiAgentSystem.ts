import OpenAI from 'openai';
import HybridKnowledgeBase, { SearchResult } from '../../server/kb';

interface AgentResponse {
  content: string;
  confidence: number;
  agentType: string;
  metadata?: any;
}

interface ConversationContext {
  history: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  currentTopic: string;
  stakeholderContext: any;
  projectContext: any;
}

class MultiAgentSystem {
  private static instance: MultiAgentSystem;
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
      currentTopic: '',
      stakeholderContext: null,
      projectContext: null
    };
  }

  public static getInstance(): MultiAgentSystem {
    if (!MultiAgentSystem.instance) {
      MultiAgentSystem.instance = new MultiAgentSystem();
    }
    return MultiAgentSystem.instance;
  }

  // Main orchestration method - coordinates all agents
  public async processUserMessage(
    userMessage: string,
    stakeholderContext: any,
    projectContext: any
  ): Promise<string> {
    try {
      console.log('🤖 MULTI-AGENT: Processing message for', stakeholderContext?.name, '(', stakeholderContext?.role, ')');
      console.log('🤖 MULTI-AGENT: User message:', userMessage);
      
      // Update context
      this.conversationContext.stakeholderContext = stakeholderContext;
      this.conversationContext.projectContext = projectContext;
      this.conversationContext.history.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Step 1: Query Understanding Agent
      const queryAnalysis = await this.queryUnderstandingAgent(userMessage);
      console.log('🔍 Query Understanding:', queryAnalysis);

      // Step 2: Knowledge Retrieval Agent
      const kbResults = await this.knowledgeRetrievalAgent(userMessage, queryAnalysis);
      console.log('📚 Knowledge Retrieved:', kbResults.length, 'entries');

      // Step 3: Context Management Agent
      const contextInfo = await this.contextManagementAgent(userMessage, queryAnalysis);
      console.log('🧠 Context Analysis:', contextInfo);

      // Step 4: Response Generation Agent
      const response = await this.responseGenerationAgent(
        userMessage,
        queryAnalysis,
        kbResults,
        contextInfo
      );
      console.log('💬 Response Generated:', response.confidence);

      // Step 5: Safety/Validation Agent
      const finalResponse = await this.safetyValidationAgent(response);
      console.log('✅ Safety Check Passed');
      console.log('🤖 MULTI-AGENT: Final response for', stakeholderContext?.name, ':', finalResponse.content.substring(0, 100) + '...');

      // Update conversation history
      this.conversationContext.history.push({
        role: 'assistant',
        content: finalResponse.content,
        timestamp: new Date()
      });

      return finalResponse.content;

    } catch (error) {
      console.error('❌ Multi-agent system error:', error);
      console.log('🆘 FALLBACK TRIGGERED due to error');
      return await this.fallbackAgent(userMessage);
    }
  }

  // Agent 1: Query Understanding Agent
  private async queryUnderstandingAgent(userMessage: string): Promise<any> {
    const systemPrompt = `You are a Query Understanding Agent. Analyze the user's message and extract:
1. Intent (what they want to know/do)
2. Topic (what subject they're asking about)
3. Question type (factual, clarification, opinion, etc.)
4. Key entities mentioned
5. Context clues from the message

Respond with a JSON object containing these fields.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 200,
      temperature: 0.1
    });

    try {
      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch {
      return {
        intent: 'general_inquiry',
        topic: 'project',
        questionType: 'factual',
        entities: [],
        contextClues: []
      };
    }
  }

  // Agent 2: Knowledge Retrieval Agent
  private async knowledgeRetrievalAgent(userMessage: string, queryAnalysis: any): Promise<SearchResult[]> {
    try {
      console.log('📚 Knowledge Retrieval Agent - Searching for:', userMessage);
      
      // Search KB with hybrid approach
      const results = await this.kb.searchKB(userMessage);
      console.log('📚 Raw KB results:', results.length, 'entries');
      
      // Filter and rank based on query analysis
      const relevantResults = results.filter(result => {
        const entry = result.entry;
        const topicMatch = entry.category.toLowerCase().includes(queryAnalysis.topic.toLowerCase());
        const intentMatch = this.matchesIntent(entry, queryAnalysis.intent);
        return topicMatch || intentMatch || result.score > 0.5;
      });

      console.log('📚 Filtered relevant results:', relevantResults.length, 'entries');
      if (relevantResults.length > 0) {
        console.log('📚 Top result:', relevantResults[0].entry.short);
      }

      return relevantResults.slice(0, 5); // Top 5 most relevant
    } catch (error) {
      console.error('❌ Knowledge retrieval failed:', error);
      return [];
    }
  }

  // Agent 3: Context Management Agent
  private async contextManagementAgent(userMessage: string, queryAnalysis: any): Promise<any> {
    const recentHistory = this.conversationContext.history.slice(-6); // Last 3 exchanges
    const conversationSummary = recentHistory.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const systemPrompt = `You are a Context Management Agent. Analyze the conversation context and provide:
1. Current conversation topic
2. Previous relevant information
3. User's current state/needs
4. Conversation flow direction

Current conversation:
${conversationSummary}

User's latest message: ${userMessage}

Provide insights about the conversation context.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.1
    });

    return {
      currentTopic: queryAnalysis.topic,
      conversationFlow: response.choices[0]?.message?.content || '',
      recentContext: recentHistory
    };
  }

  // Agent 4: Response Generation Agent
  private async responseGenerationAgent(
    userMessage: string,
    queryAnalysis: any,
    kbResults: SearchResult[],
    contextInfo: any
  ): Promise<AgentResponse> {
    
    // Prepare KB context
    const kbContext = kbResults.map(result => {
      const entry = result.entry;
      return `KB Entry ${entry.id} (${entry.category}):
Questions: ${entry.questions.join(', ')}
Answer: ${entry.short}
Expanded: ${entry.expanded}`;
    }).join('\n\n');

    // Prepare conversation context
    const conversationContext = this.conversationContext.history.slice(-4)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `You are a Response Generation Agent for the Customer Onboarding Process Optimization project at TechCorp Solutions.

You are ${this.conversationContext.stakeholderContext?.name || 'a team member'} (${this.conversationContext.stakeholderContext?.role || 'stakeholder'}).

CRITICAL RESPONSE RULES:
1. Use ONLY information from the provided KB context
2. Be conversational and natural, like a colleague in a meeting - NOT formal or robotic
3. NEVER use asterisks (*) in responses - write naturally
4. NEVER use dashes in numbers - say "6 to 8 weeks" not "6-8 weeks", "3 to 4 weeks" not "3-4 weeks"
5. AVOID repetitive phrases like "feel free to ask", "let me know", "if you have questions"
6. Be direct and specific - don't be overly helpful or formal
7. If information isn't in the KB, simply say "I don't have that information" without offering alternatives
8. Keep responses concise but informative
9. Maintain the conversation flow naturally
10. Speak like a real person, not a customer service representative

KB Context:
${kbContext}

Recent Conversation:
${conversationContext}

Query Analysis: ${JSON.stringify(queryAnalysis)}

Generate a natural, human-like response that addresses the user's question using the KB information.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content || '';
    const confidence = kbResults.length > 0 ? Math.min(kbResults[0].score + 0.2, 1.0) : 0.3;

    return {
      content,
      confidence,
      agentType: 'response_generation',
      metadata: {
        kbEntriesUsed: kbResults.map(r => r.entry.id),
        queryAnalysis,
        contextInfo
      }
    };
  }

  // Agent 5: Safety/Validation Agent
  private async safetyValidationAgent(response: AgentResponse): Promise<AgentResponse> {
    // Basic validation - ensure response is appropriate and grounded
    if (response.content.length < 10) {
      return {
        content: "I need to gather more information to answer that properly. Could you clarify what you'd like to know about our onboarding process?",
        confidence: 0.5,
        agentType: 'safety_validation'
      };
    }

    // Check for inappropriate content (basic filter)
    const inappropriateWords = ['inappropriate', 'offensive', 'unprofessional'];
    const hasInappropriate = inappropriateWords.some(word => 
      response.content.toLowerCase().includes(word)
    );

    if (hasInappropriate) {
      return {
        content: "Let me focus on the project-related information. What would you like to know about our Customer Onboarding Process Optimization project?",
        confidence: 0.8,
        agentType: 'safety_validation'
      };
    }

    return response;
  }

  // Agent 6: Fallback Agent
  private async fallbackAgent(userMessage: string): Promise<string> {
    console.log('🆘 FALLBACK AGENT TRIGGERED for:', userMessage);
    
    const systemPrompt = `You are a Fallback Agent for the Customer Onboarding Process Optimization project. 
The user asked: "${userMessage}"

Provide a helpful response that:
1. Acknowledges their question
2. Offers to help with project-related topics
3. Suggests specific areas you can assist with

Be professional and helpful.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.5
    });

    const fallbackResponse = response.choices[0]?.message?.content || 
      "I'd be happy to help you with our Customer Onboarding Process Optimization project. What would you like to know about our current process, goals, or challenges?";
    
    console.log('🆘 FALLBACK RESPONSE:', fallbackResponse);
    return fallbackResponse;
  }

  // Helper method to match KB entries with user intent
  private matchesIntent(entry: any, intent: string): boolean {
    const intentKeywords = {
      'factual_inquiry': ['what', 'how', 'when', 'where', 'who', 'why'],
      'clarification': ['clarify', 'explain', 'what do you mean', 'define'],
      'opinion': ['think', 'opinion', 'feel', 'believe'],
      'comparison': ['compare', 'difference', 'versus', 'vs'],
      'process': ['process', 'steps', 'workflow', 'procedure']
    };

    const keywords = intentKeywords[intent as keyof typeof intentKeywords] || [];
    const entryText = `${entry.questions.join(' ')} ${entry.short} ${entry.expanded}`.toLowerCase();
    
    return keywords.some(keyword => entryText.includes(keyword));
  }

  // Get conversation statistics
  public getConversationStats() {
    return {
      totalMessages: this.conversationContext.history.length,
      currentTopic: this.conversationContext.currentTopic,
      stakeholder: this.conversationContext.stakeholderContext?.name,
      project: this.conversationContext.projectContext?.name
    };
  }

  // Reset conversation context
  public resetConversation() {
    this.conversationContext = {
      history: [],
      currentTopic: '',
      stakeholderContext: null,
      projectContext: null
    };
  }
}

export default MultiAgentSystem;
export type { AgentResponse, ConversationContext };
