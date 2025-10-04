import { singleAgentSystem } from './singleAgentSystem';
import { API_CONFIG } from '../config/openai';

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
    userId: string,
    lastSpeaker?: string | null,
    conversationContext?: string
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
    responseType: 'discussion' | 'baton_pass' | 'direct_mention' = 'discussion'
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
  public async generateResponse(userMessage: string, systemPrompt?: string): Promise<string> {
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
  public async generateInterviewNotes(meetingData: any, progressCallback?: (progress: number) => void): Promise<string> {
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

  public async detectConversationHandoff(response: string, availableStakeholders: any[]): Promise<any> {
    return null;
  }

  public async selectResponderByContext(userMessage: string, availableStakeholders: any[]): Promise<any> {
    return availableStakeholders[0] || null;
  }

  public async generateMentionResponse(stakeholder: any, userMessage: string, context: any): Promise<string> {
    return this.generateStakeholderResponse(userMessage, stakeholder, context);
  }

  // AI Process Map Generation
  public async generateProcessMap(description: string): Promise<{
    success: boolean;
    map?: any;
    error?: string;
  }> {
    try {
      console.log('🤖 AISERVICE: Generating process map for description:', description.substring(0, 100) + '...');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a Business Analyst assistant that converts process descriptions into structured process map JSON.
Use only these element types: start, activity, decision, end.
Each node should include {id, type, label}.
Use sequential order unless conditional language like "if" or "otherwise" appears.
Output ONLY valid JSON (no commentary).
Example:
{
  "nodes": [
    {"id": "1", "type": "start", "label": "Tenant submits complaint"},
    {"id": "2", "type": "activity", "label": "Tenant Services logs complaint"},
    {"id": "3", "type": "decision", "label": "Complaint type?"},
    {"id": "4", "type": "activity", "label": "Send to Finance"},
    {"id": "5", "type": "activity", "label": "Resolve issue"},
    {"id": "6", "type": "end", "label": "Complaint closed"}
  ],
  "connections": [
    {"from": "1", "to": "2"},
    {"from": "2", "to": "3"},
    {"from": "3", "to": "4", "condition": "Billing"},
    {"from": "4", "to": "5"},
    {"from": "5", "to": "6"}
  ]
}`
            },
            { role: 'user', content: description }
          ],
          temperature: 0.2,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API error');
      }

      const content = data?.choices?.[0]?.message?.content;

      if (!content || !content.trim().startsWith('{')) {
        throw new Error('Invalid response format from OpenAI');
      }

      const parsed = JSON.parse(content);
      
      console.log('✅ AISERVICE: Process map generated successfully');
      return { success: true, map: parsed };

    } catch (error: any) {
      console.error('❌ AISERVICE: Process map generation error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to generate process map' 
      };
    }
  }
}

export default AIService;
