import { singleAgentSystem } from './singleAgentSystem';
import { API_CONFIG } from '../config/openai';
import { buildBPMN, type MapSpec } from '../utils/bpmnBuilder';

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

  // AI Process Map Generation with strengthened prompt control and role-based lanes
  public async generateProcessMap(description: string, forcedRoles?: string[]): Promise<{
    success: boolean;
    spec?: MapSpec;
    xml?: string;
    error?: string;
    clarificationNeeded?: boolean;
  }> {
    try {
      console.log('🤖 AISERVICE: Generating process map for description:', description.substring(0, 100) + '...');

      const SYSTEM_PROMPT = `
You convert the user's process description into a STRICT JSON map (lanes, nodes, connections).
You MUST stay inside the user's domain; do not reinterpret (e.g., do not turn "tenant services" into "refunds").
If any actor/decision is unclear, ask a clarification instead of guessing.
Output JSON only.

REQUIRED OUTPUT FORMAT:
{
  "lanes": ["Role/Department Name", "Another Role/Department"],
  "nodes": [
    {"id": "1", "type": "startEvent", "label": "Exact process step description", "lane": "Role/Department Name"},
    {"id": "2", "type": "task", "label": "Specific activity description", "lane": "Another Role/Department"},
    {"id": "3", "type": "exclusiveGateway", "label": "Decision point with exact wording", "lane": "Another Role/Department"},
    {"id": "4", "type": "endEvent", "label": "Process completion step", "lane": "Role/Department Name"}
  ],
  "connections": [
    {"from": "1", "to": "2"},
    {"from": "2", "to": "3"},
    {"from": "3", "to": "4", "label": "Yes/No condition"}
  ]
}

NODE TYPES: startEvent, task, exclusiveGateway, endEvent
Use exact terminology from the user's description.
Maintain the specific business domain context.
Each node must have a "lane" property matching one of the lane names exactly.
`;

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
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: `Generate a process map JSON for: ${description}`
            }
          ],
          temperature: 0.1,
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

      let spec = JSON.parse(content) as MapSpec;
      
      // Normalize the spec using the BPMN builder utilities
      spec = this.normalizeMap(spec, forcedRoles);
      
      // Build BPMN XML from the normalized spec
      const xml = buildBPMN(spec);
      
      console.log('✅ AISERVICE: Process map generated successfully with BPMN XML');
      return { success: true, spec, xml };

    } catch (error: any) {
      console.error('❌ AISERVICE: Process map generation error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to generate process map' 
      };
    }
  }

  // Normalize map specification with forced roles
  private normalizeMap(spec: MapSpec, forcedRoles?: string[]): MapSpec {
    // Lock to roles if user provided
    if (forcedRoles?.length) {
      const lanes = forcedRoles.map((r, i) => ({ id: `lane_${i+1}`, name: r }));
      spec.lanes = lanes;
    }
    // Enforce branches + lane assignment happens inside buildBPMN via helpers
    return spec;
  }

  // Regenerate process map with clarification
  public async regenerateProcessMapWithClarification(clarificationData: {
    originalStep: string;
    clarification: string;
    currentMap?: any;
  }): Promise<{
    success: boolean;
    spec?: MapSpec;
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
    {"id": "lane1", "name": "Customer Service"},
    {"id": "lane2", "name": "Finance"},
    {"id": "lane3", "name": "Management"}
  ],
  "nodes": [
    {"id": "1", "type": "start", "label": "Customer submits refund request", "laneId": "lane1"},
    {"id": "2", "type": "task", "label": "Validate purchase details", "laneId": "lane2"},
    {"id": "3", "type": "decision", "label": "Purchase within 30 days?", "laneId": "lane2"},
    {"id": "4", "type": "task", "label": "Process refund", "laneId": "lane2"},
    {"id": "5", "type": "end", "label": "Refund completed", "laneId": "lane1"}
  ],
  "connections": [
    {"from": "1", "to": "2"},
    {"from": "2", "to": "3"},
    {"from": "3", "to": "4", "label": "Yes"},
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

      let spec = JSON.parse(content) as MapSpec;
      
      // Normalize the spec
      spec = this.normalizeMap(spec);
      
      // Build BPMN XML from the normalized spec
      const xml = buildBPMN(spec);
      
      console.log('✅ AISERVICE: Process map regenerated successfully with clarification');
      return { success: true, spec, xml };

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

  // Extract context keywords from user description
  private extractContextKeywords(description: string): string[] {
    const text = description.toLowerCase();
    const keywords: string[] = [];
    
    // Define domain-specific keyword patterns
    const domainPatterns = {
      tenant: ['tenant', 'rent', 'lease', 'property', 'landlord', 'maintenance', 'repair', 'apartment', 'building'],
      retail: ['customer', 'purchase', 'refund', 'order', 'payment', 'shopping', 'store', 'product'],
      healthcare: ['patient', 'doctor', 'medical', 'treatment', 'hospital', 'clinic', 'health'],
      finance: ['account', 'bank', 'loan', 'credit', 'investment', 'transaction', 'money'],
      service: ['service', 'support', 'complaint', 'issue', 'ticket', 'resolution'],
      manufacturing: ['production', 'factory', 'assembly', 'quality', 'inventory', 'supply'],
      education: ['student', 'teacher', 'course', 'grade', 'school', 'education', 'learning']
    };
    
    // Check for domain-specific keywords
    for (const [domain, patterns] of Object.entries(domainPatterns)) {
      if (patterns.some(pattern => text.includes(pattern))) {
        keywords.push(domain);
      }
    }
    
    // Extract business entities (capitalized words that might be proper nouns)
    const capitalizedWords = description.match(/\b[A-Z][a-z]+\b/g) || [];
    keywords.push(...capitalizedWords.map(word => word.toLowerCase()));
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  // Validate context consistency between input and generated map
  private validateContextConsistency(originalDescription: string, generatedMap: any, contextKeywords: string[]): {
    isValid: boolean;
    reason?: string;
  } {
    if (!generatedMap || !generatedMap.nodes) {
      return { isValid: false, reason: 'Generated map is missing nodes' };
    }
    
    const originalText = originalDescription.toLowerCase();
    const generatedText = JSON.stringify(generatedMap).toLowerCase();
    
    // Check for domain mismatch
    const domainMismatches = [
      { original: ['tenant', 'rent', 'maintenance'], forbidden: ['customer', 'refund', 'purchase'] },
      { original: ['customer', 'refund', 'purchase'], forbidden: ['tenant', 'rent', 'maintenance'] },
      { original: ['patient', 'medical', 'doctor'], forbidden: ['customer', 'tenant', 'student'] },
      { original: ['student', 'teacher', 'course'], forbidden: ['patient', 'customer', 'tenant'] }
    ];
    
    for (const mismatch of domainMismatches) {
      const hasOriginalContext = mismatch.original.some(term => originalText.includes(term));
      const hasForbiddenContext = mismatch.forbidden.some(term => generatedText.includes(term));
      
      if (hasOriginalContext && hasForbiddenContext) {
        const detectedOriginal = mismatch.original.find(term => originalText.includes(term));
        const detectedForbidden = mismatch.forbidden.find(term => generatedText.includes(term));
        return { 
          isValid: false, 
          reason: `Domain mismatch detected: Original context "${detectedOriginal}" but generated map contains "${detectedForbidden}" terms` 
        };
      }
    }
    
    // Check if key business entities are preserved
    const keyEntities = contextKeywords.filter(keyword => keyword.length > 3);
    const preservedEntities = keyEntities.filter(entity => generatedText.includes(entity));
    
    if (keyEntities.length > 0 && preservedEntities.length < keyEntities.length * 0.5) {
      return { 
        isValid: false, 
        reason: `Key business entities from original description are missing in generated map` 
      };
    }
    
    return { isValid: true };
  }

  // Extract roles and departments from user description
  private async extractRoles(description: string): Promise<string[]> {
    try {
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
              content: `You are an assistant that extracts all unique roles, teams, or departments mentioned in a process description. 

Return ONLY a JSON array of strings representing the roles/departments, no explanation.

Examples:
- "Customer Service Representative, Finance Team, Store Manager" → ["Customer Service", "Finance Team", "Store Manager"]
- "Tenant Services logs complaint, sends to Maintenance or Finance" → ["Tenant Services", "Maintenance", "Finance"]
- "Doctor examines patient, nurse administers medication" → ["Doctor", "Nurse"]`
            },
            {
              role: 'user',
              content: description
            }
          ],
          temperature: 0,
        }),
      });

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || '[]';
      
      if (!content.trim().startsWith('[')) {
        console.warn('⚠️ Invalid role extraction response, using fallback');
        return this.extractRolesFallback(description);
      }

      const roles = JSON.parse(content);
      console.log('👥 Extracted roles:', roles);
      return roles.filter((role: any) => role && typeof role === 'string' && role.trim().length > 0);

    } catch (error) {
      console.error('❌ Role extraction error:', error);
      return this.extractRolesFallback(description);
    }
  }

  // Fallback role extraction using keyword patterns
  private extractRolesFallback(description: string): string[] {
    const text = description.toLowerCase();
    const rolePatterns = [
      'customer service', 'cs rep', 'customer rep',
      'maintenance', 'maintenance team', 'maintenance worker',
      'finance', 'finance team', 'accounting', 'billing',
      'manager', 'supervisor', 'lead',
      'tenant services', 'tenant service',
      'property manager', 'landlord',
      'doctor', 'physician', 'nurse', 'medical staff',
      'teacher', 'instructor', 'professor',
      'support', 'help desk', 'technical support',
      'sales', 'sales rep', 'sales team',
      'admin', 'administrator', 'administration'
    ];

    const foundRoles: string[] = [];
    
    for (const pattern of rolePatterns) {
      if (text.includes(pattern)) {
        // Capitalize first letter of each word
        const capitalizedRole = pattern.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        if (!foundRoles.includes(capitalizedRole)) {
          foundRoles.push(capitalizedRole);
        }
      }
    }

    // If no roles found, add a default "General Process" role
    if (foundRoles.length === 0) {
      foundRoles.push('General Process');
    }

    console.log('👥 Fallback role extraction:', foundRoles);
    return foundRoles;
  }

  // Assign nodes to appropriate lanes based on role matching
  private assignLanesToNodes(processMap: any, roles: string[]): any {
    if (!processMap.nodes || !processMap.lanes) {
      return processMap;
    }

    // Create lane lookup map
    const laneMap = new Map<string, string>();
    for (const lane of processMap.lanes) {
      laneMap.set(lane.label.toLowerCase(), lane.id);
    }

    // Enhanced nodes with better lane assignment
    const enhancedNodes = processMap.nodes.map((node: any) => {
      const nodeLabel = node.label.toLowerCase();
      
      // Try to match node to lane based on role keywords
      let bestMatch = null;
      let bestScore = 0;

      for (const role of roles) {
        const roleLower = role.toLowerCase();
        const roleWords = roleLower.split(' ');
        
        let score = 0;
        for (const word of roleWords) {
          if (nodeLabel.includes(word)) {
            score += word.length; // Longer matches get higher scores
          }
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = roleLower;
        }
      }

      // Assign to best matching lane or default to first lane
      const assignedLaneId = bestMatch && laneMap.has(bestMatch) 
        ? laneMap.get(bestMatch) 
        : processMap.lanes[0]?.id || 'lane1';

      return {
        ...node,
        lane: assignedLaneId
      };
    });

    return {
      ...processMap,
      nodes: enhancedNodes
    };
  }

  // Validate lane assignment and decision branching
  private validateLaneAssignment(processMap: any): {
    isValid: boolean;
    reason?: string;
  } {
    if (!processMap.nodes || !processMap.lanes) {
      return { isValid: false, reason: 'Process map is missing nodes or lanes' };
    }

    // Check that every lane has at least one node
    const laneIds = new Set(processMap.lanes.map((lane: any) => lane.id));
    const usedLanes = new Set(processMap.nodes.map((node: any) => node.lane));
    
    for (const laneId of laneIds) {
      if (!usedLanes.has(laneId)) {
        return { 
          isValid: false, 
          reason: `Lane "${laneId}" has no assigned nodes. Please clarify which steps belong to this role.` 
        };
      }
    }

    // Check that every decision node has multiple outgoing connections
    const decisionNodes = processMap.nodes.filter((node: any) => node.type === 'decision');
    const connections = processMap.connections || [];
    
    for (const decisionNode of decisionNodes) {
      const outgoingConnections = connections.filter((conn: any) => conn.from === decisionNode.id);
      
      if (outgoingConnections.length < 2) {
        return { 
          isValid: false, 
          reason: `Decision node "${decisionNode.label}" needs multiple outcome paths. Please clarify what happens in each case (Yes/No, Approved/Rejected, etc.).` 
        };
      }
    }

    return { isValid: true };
  }
}

export default AIService;
