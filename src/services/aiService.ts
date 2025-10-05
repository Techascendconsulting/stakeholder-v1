import { singleAgentSystem } from './singleAgentSystem';
// import { API_CONFIG } from '../config/openai'; // Not used in current implementation

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
  
  private constructor() {
    // Initialize single-agent system
    singleAgentSystem.initialize();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Simple wrapper around singleAgentSystem for stakeholder mention detection
  public async detectStakeholderMentions(
    message: string,
    availableStakeholders: any[],
    _userId: string,
    _lastSpeaker?: string | null,
    _conversationContext?: string
  ): Promise<{
    mentionedStakeholders: any[];
    confidence: number;
    mentionType: string;
  }> {
    // Simple keyword-based detection
    const messageLower = message.toLowerCase();
    const mentionedStakeholders: any[] = [];
    
    for (const stakeholder of availableStakeholders) {
      const nameLower = stakeholder.name.toLowerCase();
      const firstName = stakeholder.name.split(' ')[0].toLowerCase();
      const lastName = stakeholder.name.split(' ')[1]?.toLowerCase() || '';
      
      if (messageLower.includes(nameLower) || 
          messageLower.includes(firstName) || 
          (lastName && messageLower.includes(lastName))) {
        mentionedStakeholders.push(stakeholder);
      }
    }
    
    return {
      mentionedStakeholders,
      confidence: mentionedStakeholders.length > 0 ? 0.8 : 0.0,
      mentionType: mentionedStakeholders.length > 0 ? 'direct' : 'none'
    };
  }

  // Simple wrapper around singleAgentSystem for stakeholder responses
  public async generateStakeholderResponse(
    userMessage: string,
    stakeholder: StakeholderContext,
    context: ConversationContext = {},
    _responseType: 'discussion' | 'baton_pass' | 'direct_mention' = 'discussion'
  ): Promise<string> {
    console.log(`🤖 AISERVICE: Generating response for ${stakeholder.name} (${stakeholder.role})`);
    
    try {
      const response = await singleAgentSystem.processUserMessage(
        userMessage,
        {
          ...stakeholder,
          department: stakeholder.department || 'General',
          priorities: stakeholder.priorities || [],
          expertise: stakeholder.expertise || [],
          personality: stakeholder.personality || 'Professional'
        },
        context.project || {
          id: 'default',
          name: 'Default Project',
          description: 'No specific project context provided',
          type: 'General',
          painPoints: [],
          asIsProcess: 'No specific process defined'
        }
      );

      console.log(`✅ AISERVICE: ${stakeholder.name} response: "${response}"`);
      return response;
      
    } catch (error) {
      console.error('❌ AISERVICE ERROR:', error);
      return "I'm here to help. What would you like to know?";
    }
  }

  // Simple wrapper for general response generation
  public async generateResponse(userMessage: string, _systemPrompt?: string): Promise<string> {
    try {
      const response = await singleAgentSystem.processUserMessage(
        userMessage,
        {
          name: 'Assistant',
          role: 'AI Assistant',
          department: 'AI',
          personality: 'Helpful and professional',
          priorities: ['Provide accurate information', 'Be helpful'],
          expertise: ['General knowledge', 'Problem solving']
        },
        {
          id: 'general',
          name: 'General Assistance',
          description: 'General assistance and information',
          type: 'General',
          painPoints: [],
          asIsProcess: 'General assistance'
        }
      );
      
      return response;
    } catch (error) {
      console.error('❌ AISERVICE generateResponse ERROR:', error);
      return "I'm here to help. What would you like to know?";
    }
  }

  // Simple wrapper for interview notes generation
  public async generateInterviewNotes(_meetingData: any, _progressCallback?: (progress: number) => void): Promise<string> {
    try {
      // Use singleAgentSystem for interview notes generation
      const response = await singleAgentSystem.processUserMessage(
        'Generate comprehensive interview notes and meeting summary',
        {
          name: 'Meeting Analyst',
          role: 'Business Analyst',
          department: 'Analysis',
          personality: 'Analytical and thorough',
          priorities: ['Comprehensive analysis', 'Clear documentation'],
          expertise: ['Meeting analysis', 'Documentation']
        },
        {
          id: 'meeting-analysis',
          name: 'Meeting Analysis',
          description: 'Meeting analysis and documentation',
          type: 'Analysis',
          painPoints: [],
          asIsProcess: 'Meeting analysis'
        }
      );
      
      return response;
    } catch (error) {
      console.error('❌ AISERVICE generateInterviewNotes ERROR:', error);
      return "Meeting summary generation failed. Please try again.";
    }
  }

  // Static methods for compatibility
  public static getMentionConfidenceThreshold(): number {
    return 0.7;
  }

  public static getMentionPauseConfig(): any {
    return {
      beforeMention: 500,
      afterMention: 300
    };
  }

  // Simple methods for compatibility
  public resetConversationState(): void {
    // No-op for compatibility
  }

  public getConversationAnalytics(): any {
    return {
      messageCount: 0,
      topicsDiscussed: [],
      stakeholderInteractions: {}
    };
  }

  public async detectConversationHandoff(_response: string, _availableStakeholders: any[]): Promise<any> {
    return null;
  }

  public async selectResponderByContext(_userMessage: string, availableStakeholders: any[]): Promise<any> {
    return availableStakeholders[0] || null;
  }

  public async generateMentionResponse(stakeholder: any, userMessage: string, context: any): Promise<string> {
    return this.generateStakeholderResponse(userMessage, stakeholder, context);
  }

  // ===== ARCHIVED: AI Process Map Generation Functions =====
  // All process mapping functionality has been moved to feature/ai-process-mapper-archive branch
  // The following functions were removed to maintain aiService.ts for other AI features:
  // - generateProcessMap()
  // - regenerateProcessMapWithClarification()
  // - normalizeMap()
  // - parseAIResponseToDiagram()
  // - extractContextKeywords()
  // - validateContextConsistency()
  // - extractRoles()
  // - extractRolesFallback()
  // - assignLanesToNodes()
  // - validateLaneAssignment()
}

export default AIService;