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
              content: `You are a Business Analyst assistant that converts structured process descriptions into comprehensive process map JSON with swimlanes and role assignments.

REQUIRED OUTPUT FORMAT:
{
  "lanes": [
    {"id": "lane1", "label": "Customer Service", "role": "Customer Service Representative"},
    {"id": "lane2", "label": "Finance", "role": "Finance Team"},
    {"id": "lane3", "label": "Management", "role": "Store Manager"}
  ],
  "nodes": [
    {"id": "1", "type": "start", "label": "Customer submits refund request", "lane": "lane1"},
    {"id": "2", "type": "activity", "label": "Validate purchase details", "lane": "lane2"},
    {"id": "3", "type": "decision", "label": "Purchase within 30 days?", "lane": "lane2"},
    {"id": "4", "type": "activity", "label": "Process refund", "lane": "lane2"},
    {"id": "5", "type": "end", "label": "Refund completed", "lane": "lane1"}
  ],
  "connections": [
    {"from": "1", "to": "2"},
    {"from": "2", "to": "3"},
    {"from": "3", "to": "4", "condition": "Yes"},
    {"from": "4", "to": "5"}
  ]
}

RULES:
1. Create swimlanes for each distinct role/department mentioned
2. Assign each activity to the appropriate lane based on who performs it
3. Use node types: start, activity, decision, end
4. Include lane assignment for each node
5. Add conditions to connections when decisions branch
6. If no specific roles mentioned, create a single "General Process" lane
7. Ensure logical flow and proper handoffs between lanes
8. Output ONLY valid JSON (no commentary)

LANE ASSIGNMENT LOGIC:
- Match activities to roles based on keywords and context
- Create separate lanes for different departments/roles
- Ensure each node has a lane assignment
- Use clear, descriptive lane labels`
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

  // Regenerate process map with clarification
  public async regenerateProcessMapWithClarification(clarificationData: {
    originalStep: string;
    clarification: string;
    currentMap?: any;
  }): Promise<{
    success: boolean;
    map?: any;
    xml?: string;
    error?: string;
  }> {
    try {
      console.log('🤖 AISERVICE: Regenerating process map with clarification:', clarificationData.clarification);

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
              content: `You are a process mapping assistant that clarifies ambiguous steps and updates process diagrams.

REQUIRED OUTPUT FORMAT:
{
  "lanes": [
    {"id": "lane1", "label": "Customer Service", "role": "Customer Service Representative"},
    {"id": "lane2", "label": "Finance", "role": "Finance Team"},
    {"id": "lane3", "label": "Management", "role": "Store Manager"}
  ],
  "nodes": [
    {"id": "1", "type": "start", "label": "Customer submits refund request", "lane": "lane1"},
    {"id": "2", "type": "activity", "label": "Validate purchase details", "lane": "lane2"},
    {"id": "3", "type": "decision", "label": "Purchase within 30 days?", "lane": "lane2"},
    {"id": "4", "type": "activity", "label": "Process refund", "lane": "lane2"},
    {"id": "5", "type": "end", "label": "Refund completed", "lane": "lane1"}
  ],
  "connections": [
    {"from": "1", "to": "2"},
    {"from": "2", "to": "3"},
    {"from": "3", "to": "4", "condition": "Yes"},
    {"from": "4", "to": "5"}
  ]
}

INSTRUCTIONS:
1. Take the user's clarification and integrate it into the process map
2. Break down vague steps into specific, actionable activities
3. Assign each activity to the appropriate role/department lane
4. Maintain logical flow and proper handoffs
5. Output ONLY valid JSON (no commentary)

CLARIFICATION CONTEXT:
- Original vague step: "${clarificationData.originalStep}"
- User clarification: "${clarificationData.clarification}"
- Use this information to create more detailed, specific process steps`
            },
            {
              role: 'user',
              content: `Please regenerate the process map with this clarification:

ORIGINAL STEP: "${clarificationData.originalStep}"
CLARIFICATION: "${clarificationData.clarification}"

Please update the process map to incorporate this clarification and ensure all activities have clear role assignments and specific descriptions.`
            }
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
      
      console.log('✅ AISERVICE: Process map regenerated successfully with clarification');
      return { success: true, map: parsed };

    } catch (error: any) {
      console.error('❌ AISERVICE: Process map regeneration error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to regenerate process map with clarification' 
      };
    }
  }

  // Parse AI response to diagram format
  public parseAIResponseToDiagram(aiResponse: any): {
    xml: string;
    nodes: any[];
    connections: any[];
    lanes: any[];
  } {
    // This method converts the AI response to the format expected by the BPMN viewer
    // For now, we'll return a basic structure - this can be enhanced later
    return {
      xml: '', // Will be generated by generateBPMNXML
      nodes: aiResponse.nodes || [],
      connections: aiResponse.connections || [],
      lanes: aiResponse.lanes || []
    };
  }
}

export default AIService;
