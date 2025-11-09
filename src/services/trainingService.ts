import { mockProjects } from '../data/mockData';
import { TrainingSession, TrainingStage } from '../types/training';

export interface StageData {
  id: string;
  name: string;
  objective: string;
  mustCover: string[];
}

export interface QuestionCard {
  id: string;
  stage_id: string;
  skill: string;
  text: string;
  tone_tags: string[];
}

export interface DebriefResult {
  coverageScores: Record<string, number>;
  technique: {
    openRatio: number;
    followUp: number;
    talkBalance: number;
    earlySolutioning: boolean;
    closedCount?: number;
    totalLearnerQs?: number;
  };
  independence: Record<string, number>;
  overall: number;
  passed: boolean;
  coveredAreas: string[];
  missedAreas: string[];
  nextTimeScripts: string[];
  evidence: Array<{
    key: string;
    turnIdx: number;
    kind: 'direct_q' | 'follow_up' | 'stakeholder_prompted';
  }>;
  coaching?: {
    closedExamples: Array<{
      turnIdx: number;
      original: string;
      rewrite: string;
    }>;
    nextTimeScripts: string[];
    miniLessons: Array<{
      key: string;
      tip: string;
    }>;
  };
}

export interface UserCredits {
  userId: string;
  practiceCredits: number;
  assessCredits: number;
}

export class TrainingService {
  private baseUrl = '/api/training';
  // In-memory session store so the UI can work without a backend
  private sessionsById: Map<string, TrainingSession> = new Map();
  private static instance: TrainingService | null = null;

  static getInstance(): TrainingService {
    if (!TrainingService.instance) {
      TrainingService.instance = new TrainingService();
    }
    return TrainingService.instance;
  }

  async getStages(): Promise<StageData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/stages`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch stages');
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
      // Fallback to mock data
      return [
        {
          id: 'problem_exploration',
          name: 'Problem Exploration',
          objective: 'Uncover pain points and root causes',
          mustCover: ['pain_points', 'blockers', 'handoffs', 'constraints', 'customer_impact']
        },
        {
          id: 'as_is',
          name: 'As-Is Process/Analysis',
          objective: 'Understand current processes and systems',
          mustCover: ['current_process', 'pain_points', 'inefficiencies', 'stakeholder_roles', 'system_gaps']
        },
        {
          id: 'as_is_mapping',
          name: 'As-Is Process Map',
          objective: 'Document current end-to-end flow to feed the backlog',
          mustCover: ['process_boundaries', 'actors_systems', 'flow_handoffs', 'data_rules', 'pain_points']
        },
        {
          id: 'to_be',
          name: 'To-Be Process',
          objective: 'Design future state solutions',
          mustCover: ['future_state', 'improvements', 'requirements', 'success_criteria', 'implementation_plan']
        },
        {
          id: 'solution_design',
          name: 'Solution Design',
          objective: 'Define technical requirements and implementation',
          mustCover: ['technical_requirements', 'architecture', 'data_models', 'integration_points', 'deployment_plan']
        }
      ];
    }
  }

  async getStageData(stageId: string): Promise<{ stage: StageData; cards: QuestionCard[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/stages/${stageId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch stage data');
      }
    } catch (error) {
      console.error('Error fetching stage data:', error);
      // Fallback to mock data
      return this.getMockStageData(stageId);
    }
  }

  async startSession(stageId: string, projectId: string, mode: 'practice' | 'assess', selectedStakeholders: string[]): Promise<TrainingSession> {
    try {
      // For now, use mock data since backend isn't set up yet
      const mockSession: TrainingSession = {
        id: `session-${stageId}-${projectId}-${mode}-${Date.now()}`,
        stage: stageId as TrainingStage,
        projectId,
        mode,
        status: 'pre_brief',
        startTime: new Date(),
        endTime: undefined,
        currentQuestionIndex: 0,
        questions: [],
        messages: [],
        coverage: {},
        hintEvents: []
      };
      // store in memory for later retrieval by getSession
      this.sessionsById.set(mockSession.id, mockSession);
      
      console.log('Created mock session:', mockSession);
      console.log('Sessions in memory:', Array.from(this.sessionsById.keys()));
      return mockSession;
      
      // TODO: Uncomment when backend is ready
      /*
      const response = await fetch(`${this.baseUrl}/sessions/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stageId,
          projectId,
          mode,
          selectedStakeholders
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to start session');
      }
      */
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<TrainingSession> {
    try {
      console.log('🔍 getSession called for:', sessionId);
      console.log('🔍 Available sessions:', Array.from(this.sessionsById.keys()));
      
      // Try local in-memory session first
      const local = this.sessionsById.get(sessionId);
      if (local) {
        console.log('✅ Found session in memory:', local.id);
        return local;
      }

      // Fallback: construct a minimal mock from sessionStorage if present
      const cfgRaw = typeof window !== 'undefined' ? sessionStorage.getItem('trainingConfig') : null;
      if (cfgRaw) {
        try {
          const cfg = JSON.parse(cfgRaw);
          console.log('🔍 SessionStorage config:', cfg);
          if (cfg.sessionId === sessionId) {
            console.log('✅ Creating session from sessionStorage config');
            const mock: TrainingSession = {
              id: sessionId,
              stage: cfg.stage as TrainingStage,
              projectId: cfg.projectId,
              mode: 'practice',
              status: 'pre_brief',
              startTime: new Date(),
              endTime: undefined,
              currentQuestionIndex: 0,
              questions: [],
              messages: [],
              coverage: {},
              hintEvents: []
            };
            this.sessionsById.set(sessionId, mock);
            return mock;
          } else {
            console.log('❌ Session ID mismatch:', { requested: sessionId, stored: cfg.sessionId });
          }
        } catch (error) {
          console.error('❌ Error parsing sessionStorage config:', error);
        }
      } else {
        console.log('❌ No trainingConfig found in sessionStorage');
      }

      // Backend call (will 404 until server exists)
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`);
      const result = await response.json();
      if (result.success) return result.data;
      throw new Error(result.error || 'Failed to fetch session');
    } catch (error) {
      console.error('Error fetching session:', error);
      // Final fallback
      return {
        id: sessionId,
        stage: 'problem_exploration' as TrainingStage,
        projectId: mockProjects[0]?.id || 'proj-1',
        mode: 'practice',
        status: 'pre_brief',
        startTime: new Date(),
        endTime: undefined,
        currentQuestionIndex: 0,
        questions: [],
        messages: [],
        coverage: {},
        hintEvents: []
      };
    }
  }

  async sendMessage(sessionId: string, message: string, stakeholderId?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          stakeholderId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data.message;
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // return a mock stakeholder response so UI can continue
      return {
        role: 'stakeholder',
        text: 'Thanks for the question — could you tell us more about the current pain points you are seeing?',
        ts: new Date().toISOString(),
        stakeholderId
      };
    }
  }

  async endSession(sessionId: string): Promise<void> {
    try {
      // Mark local session as completed
      const s = this.sessionsById.get(sessionId);
      if (s) this.sessionsById.set(sessionId, { ...s, status: 'completed' });

      // Backend route (no-op for now)
      /*
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/end`, {
        method: 'POST'
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to end session');
      */
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Mock methods for compatibility
  async updateSessionStatus(sessionId: string, status: string): Promise<void> {
    try {
      const s = this.sessionsById.get(sessionId);
      if (s) {
        this.sessionsById.set(sessionId, { ...s, status: status as any });
      }
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  }

  async updateSessionMessages(sessionId: string, messages: any[]): Promise<void> {
    try {
      const s = this.sessionsById.get(sessionId);
      if (s) {
        this.sessionsById.set(sessionId, { ...s, messages });
        console.log('✅ Session messages updated:', { sessionId, messageCount: messages.length });
      } else {
        console.warn('❌ Session not found for message update:', sessionId);
      }
    } catch (error) {
      console.error('Error updating session messages:', error);
    }
  }

  async generateFeedback(sessionId: string): Promise<any> {
    try {
      // Get the actual session and messages to analyze
      const session = this.sessionsById.get(sessionId);
      
      // Analyze the actual conversation content
      const analysis = await this.analyzeConversation(sessionId);
      
      // Return the structure expected by the new TrainingFeedbackView
      return {
        overall: analysis.overallScore,
        coverageScores: analysis.coverageScores || {
          'pain_points': analysis.coverageScore || 0.5,
          'blockers': analysis.coverageScore || 0.5,
          'handoffs': analysis.coverageScore || 0.5,
          'constraints': analysis.coverageScore || 0.5,
          'customer_impact': analysis.coverageScore || 0.5
        },
        technique: {
          openRatio: analysis.openQuestions || 0.5,
          followUp: analysis.followUps || 0.5,
          talkBalance: analysis.talkBalance || 0.5,
          earlySolutioning: analysis.earlySolutioning || false
        },
        independence: analysis.independenceScores || {
          'pain_points': analysis.independenceScore || 0.5,
          'blockers': analysis.independenceScore || 0.5,
          'handoffs': analysis.independenceScore || 0.5,
          'constraints': analysis.independenceScore || 0.5,
          'customer_impact': analysis.independenceScore || 0.5
        },
        passed: (analysis.overallScore || 0.5) >= 0.65,
        coveredAreas: analysis.coveredAreas || ['Basic conversation detected'],
        missedAreas: analysis.missedAreas || ['Detailed analysis unavailable'],
        nextTimeScripts: analysis.nextTimeScripts || [
          'Try asking more open-ended questions',
          'Focus on understanding the stakeholder\'s perspective',
          'Practice active listening and follow-up questions'
        ]
      };
    } catch (error) {
      console.error('❌ CRITICAL: generateFeedback failed completely:', error);
      console.log('🛡️ Using emergency fallback analysis');
      
      // FINAL FALLBACK: Return a safe default that won't break the UI
      return {
        overall: 0.5,
        coverageScores: {
          'pain_points': 0.5,
          'blockers': 0.5,
          'handoffs': 0.5,
          'constraints': 0.5,
          'customer_impact': 0.5
        },
        technique: {
          openRatio: 0.5,
          followUp: 0.5,
          talkBalance: 0.5,
          earlySolutioning: false
        },
        independence: {
          'pain_points': 0.5,
          'blockers': 0.5,
          'handoffs': 0.5,
          'constraints': 0.5,
          'customer_impact': 0.5
        },
        passed: false,
        coveredAreas: ['Basic conversation detected'],
        missedAreas: ['Detailed analysis unavailable'],
        nextTimeScripts: [
          'Try asking more open-ended questions',
          'Focus on understanding the stakeholder\'s perspective',
          'Practice active listening and follow-up questions'
        ]
      };
    }
  }

  private async analyzeConversation(sessionId: string): Promise<any> {
    console.log('🔍 Starting conversation analysis for session:', sessionId);
    
    // Get session data
    const session = this.sessionsById.get(sessionId);
    if (!session) {
      console.warn('❌ No session found, using default analysis');
      return this.getDefaultAnalysis();
    }

    console.log('📊 Session data:', {
      stage: session.stage,
      messageCount: session.messages?.length || 0,
      status: session.status
    });

    // Get stage data to understand what should be covered
    const stageData = this.getMockStageData(session.stage);
    const requiredAreas = stageData.stage.mustCover;

    console.log('🎯 Required areas:', requiredAreas);

    // Get actual conversation messages from session
    const userMessages: any[] = session.messages?.filter(msg => msg.sender === 'user') || [];
    const stakeholderMessages: any[] = session.messages?.filter(msg => msg.sender === 'ai' || msg.sender === 'stakeholder') || [];

    console.log('💬 Message counts:', {
      user: userMessages.length,
      stakeholder: stakeholderMessages.length
    });

    // Use AI to analyze the conversation
    try {
      console.log('🤖 Attempting AI analysis...');
      const analysis = await this.analyzeWithAI(userMessages, stakeholderMessages, requiredAreas);
      console.log('✅ AI analysis completed successfully');
      return analysis;
    } catch (error) {
      console.error('❌ AI analysis failed, falling back to basic analysis:', error);
      const basicResult = this.basicAnalysis(userMessages, stakeholderMessages, requiredAreas);
      console.log('📋 Basic analysis result:', basicResult);
      return basicResult;
    }
  }

  private async analyzeWithAI(userMessages: any[], stakeholderMessages: any[], requiredAreas: string[]): Promise<any> {
    console.log('🤖 AI Analysis: Starting with', userMessages.length, 'user messages');
    
    // FALLBACK 1: Check if we have enough data to analyze
    if (!userMessages || userMessages.length === 0) {
      console.warn('❌ No user messages to analyze, using default analysis');
      return this.getDefaultAnalysis();
    }

    // FALLBACK 2: Check if conversation is too short
    if (userMessages.length < 3) {
      console.warn('❌ Conversation too short for meaningful analysis, using default');
      return this.getDefaultAnalysis();
    }

    // Create conversation transcript with safety checks
    const safeTranscript = userMessages
      .filter(msg => msg && msg.content && typeof msg.content === 'string')
      .map(msg => `User: ${msg.content.substring(0, 1000)}`) // Limit length
      .join('\n') + 
      stakeholderMessages
        .filter(msg => msg && msg.content && typeof msg.content === 'string')
        .map(msg => `Stakeholder: ${msg.content.substring(0, 1000)}`) // Limit length
        .join('\n');

    // FALLBACK 3: Check if transcript is empty after filtering
    if (!safeTranscript.trim()) {
      console.warn('Empty transcript after filtering, using default analysis');
      return this.getDefaultAnalysis();
    }

    const analysisPrompt = `
You are an expert Business Analyst trainer evaluating a practice session. Analyze this conversation and provide detailed scoring.

CONVERSATION TRANSCRIPT:
${safeTranscript}

REQUIRED COVERAGE AREAS: ${requiredAreas.join(', ')}

Please analyze:
1. Coverage: Which required areas were covered? (0-100 score)
2. Technique: Quality of questions, follow-ups, professional conduct (0-100 score)
3. Independence: Did the BA ask questions without prompting? (0-100 score)
4. Specific areas covered and missed
5. Number of open questions, follow-ups
6. Professional introduction and etiquette

Respond in JSON format:
{
  "overallScore": number,
  "coverageScore": number,
  "techniqueScore": number,
  "independenceScore": number,
  "coveredAreas": [string],
  "missedAreas": [string],
  "openQuestions": number,
  "followUps": number,
  "talkBalance": number,
  "earlySolutioning": boolean,
  "unaidedQuestions": number,
  "editedQuestions": [string],
  "verbatimQuestions": [string],
  "volunteeredInfo": [string],
  "nextTimeScripts": [string]
}
`;

    try {
      // Use secure backend API
      console.log('🌐 Making API call...');

      // FALLBACK: Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        // Make secure backend API call
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert Business Analyst trainer. Analyze the conversation and provide detailed scoring in the exact JSON format requested. If you cannot analyze properly, return a valid JSON with default values.'
              },
              {
                role: 'user',
                content: analysisPrompt
              }
            ],
            temperature: 0.1, // Low temperature for consistent scoring
            max_tokens: 2000
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.message;
        
        // Log usage information
        if (data.usage) {
          const tokensUsed = data.usage.total_tokens || 0;
          const estimatedCost = (tokensUsed / 1000) * 0.00015; // GPT-4o-mini pricing
          console.log(`💰 AI Analysis Cost: ~$${estimatedCost.toFixed(4)} (${tokensUsed} tokens)`);
        }
        
        if (!aiResponse) {
          throw new Error('No response content from API');
        }

        // FALLBACK 6: Parse JSON with multiple attempts
        let analysis;
        try {
          analysis = JSON.parse(aiResponse);
        } catch (parseError) {
          console.error('Failed to parse AI response as JSON:', parseError);
          console.log('Raw AI Response:', aiResponse);
          
          // Try to extract JSON from the response if it's wrapped in markdown
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              analysis = JSON.parse(jsonMatch[0]);
            } catch (secondParseError) {
              console.error('Failed to parse extracted JSON:', secondParseError);
              throw new Error('Cannot parse AI response as JSON');
            }
          } else {
            throw new Error('No JSON found in AI response');
          }
        }

        // FALLBACK 7: Validate and sanitize the response
        const sanitizedAnalysis = this.sanitizeAnalysisResponse(analysis);
        
        console.log('✅ AI Analysis completed successfully');
        return sanitizedAnalysis;

      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

    } catch (error) {
      console.error('AI analysis failed:', error);
      console.log('Falling back to basic analysis');
      return this.basicAnalysis(userMessages, stakeholderMessages, requiredAreas);
    }
  }

  // FALLBACK 8: Sanitize AI response to ensure it has all required fields
  private sanitizeAnalysisResponse(analysis: any): any {
    const defaultAnalysis = this.getDefaultAnalysis();
    
    return {
      overallScore: this.sanitizeNumber(analysis.overallScore, defaultAnalysis.overallScore),
      coverageScore: this.sanitizeNumber(analysis.coverageScore, defaultAnalysis.coverageScore),
      techniqueScore: this.sanitizeNumber(analysis.techniqueScore, defaultAnalysis.techniqueScore),
      independenceScore: this.sanitizeNumber(analysis.independenceScore, defaultAnalysis.independenceScore),
      coveredAreas: Array.isArray(analysis.coveredAreas) ? analysis.coveredAreas : defaultAnalysis.coveredAreas,
      missedAreas: Array.isArray(analysis.missedAreas) ? analysis.missedAreas : defaultAnalysis.missedAreas,
      openQuestions: this.sanitizeNumber(analysis.openQuestions, defaultAnalysis.openQuestions),
      followUps: this.sanitizeNumber(analysis.followUps, defaultAnalysis.followUps),
      talkBalance: this.sanitizeNumber(analysis.talkBalance, defaultAnalysis.talkBalance),
      earlySolutioning: typeof analysis.earlySolutioning === 'boolean' ? analysis.earlySolutioning : defaultAnalysis.earlySolutioning,
      unaidedQuestions: this.sanitizeNumber(analysis.unaidedQuestions, defaultAnalysis.unaidedQuestions),
      editedQuestions: Array.isArray(analysis.editedQuestions) ? analysis.editedQuestions : defaultAnalysis.editedQuestions,
      verbatimQuestions: Array.isArray(analysis.verbatimQuestions) ? analysis.verbatimQuestions : defaultAnalysis.verbatimQuestions,
      volunteeredInfo: Array.isArray(analysis.volunteeredInfo) ? analysis.volunteeredInfo : defaultAnalysis.volunteeredInfo,
      nextTimeScripts: Array.isArray(analysis.nextTimeScripts) ? analysis.nextTimeScripts : defaultAnalysis.nextTimeScripts
    };
  }

  // FALLBACK 9: Sanitize numbers to ensure they're valid
  private sanitizeNumber(value: any, defaultValue: number): number {
    if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
      return Math.max(0, Math.min(100, value)); // Clamp between 0-100
    }
    return defaultValue;
  }

  private basicAnalysis(userMessages: any[], stakeholderMessages: any[], requiredAreas: string[]): any {
    // Basic analysis based on message count and content
    const totalMessages = userMessages.length + stakeholderMessages.length;
    console.log('📝 Analyzing messages:', userMessages.map(m => m.content?.substring(0, 50)));
    
    const userQuestionCount = userMessages.filter(msg => {
      const content = msg.content?.toLowerCase() || '';
      const isQuestion = content.includes('?') || 
        content.includes('what') ||
        content.includes('how') ||
        content.includes('why') ||
        content.includes('when') ||
        content.includes('where') ||
        content.includes('can you') ||
        content.includes('could you') ||
        content.includes('tell me');
      
      console.log('🔍 Message analysis:', { content: content.substring(0, 30), isQuestion });
      return isQuestion;
    }).length;
    
    console.log('❓ Detected questions:', userQuestionCount);

    const hasGreeting = userMessages.some(msg => 
      msg.content.toLowerCase().includes('hello') ||
      msg.content.toLowerCase().includes('hi') ||
      msg.content.toLowerCase().includes('greetings') ||
      msg.content.toLowerCase().includes('introduce') ||
      msg.content.toLowerCase().includes('name is')
    );

    const hasProfessionalIntro = userMessages.some(msg => 
      msg.content.toLowerCase().includes('business analyst') ||
      msg.content.toLowerCase().includes('ba') ||
      msg.content.toLowerCase().includes('analyst')
    );

    // Calculate scores based on actual conversation
    let coverageScore = 0;
    let techniqueScore = 0;
    let independenceScore = 0;

    // Coverage: Did they ask about the required areas?
    if (userQuestionCount > 0) {
      coverageScore = Math.min(userQuestionCount * 25, 100); // 25 points per question, max 100
    }

    // Technique: Did they ask open questions, follow up, etc.?
    if (userQuestionCount > 0) {
      techniqueScore = Math.min(userQuestionCount * 20 + (hasProfessionalIntro ? 30 : 0) + (hasGreeting ? 20 : 0), 100);
    }

    // Independence: Did they ask questions without prompting?
    if (userQuestionCount > 0) {
      independenceScore = Math.min(userQuestionCount * 30, 100);
    }

    // Overall score - more generous scoring
    const overallScore = Math.max(30, (coverageScore + techniqueScore + independenceScore) / 3); // Minimum 30% for participation

    // Create coverage scores for each required area
    const coverageScores: Record<string, number> = {};
    requiredAreas.forEach(area => {
      const areaKey = area.toLowerCase().replace(' ', '_');
      const hasCoverage = userMessages.some(msg => 
        msg.content?.toLowerCase().includes(area.toLowerCase().replace('_', ' '))
      );
      coverageScores[areaKey] = hasCoverage ? 0.8 : 0.2; // 80% if covered, 20% if not
    });

    // Create independence scores for each required area
    const independenceScores: Record<string, number> = {};
    requiredAreas.forEach(area => {
      const areaKey = area.toLowerCase().replace(' ', '_');
      independenceScores[areaKey] = userQuestionCount > 0 ? 0.7 : 0.3; // 70% if they asked questions, 30% if not
    });

    return {
      overallScore: Math.round(overallScore),
      coverageScores: coverageScores,
      techniqueScore: Math.round(techniqueScore),
      independenceScores: independenceScores,
      coveredAreas: userQuestionCount > 0 ? ['Basic Questioning', 'Professional Introduction'] : [],
      missedAreas: requiredAreas.filter(area => !userMessages.some(msg => 
        msg.content?.toLowerCase().includes(area.toLowerCase().replace('_', ' '))
      )).map(area => area.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
      openQuestions: userQuestionCount,
      followUps: 0, // TODO: Detect follow-up questions
      talkBalance: 0.4, // TODO: Calculate actual talk balance
      earlySolutioning: false,
      unaidedQuestions: userQuestionCount,
      editedQuestions: [],
      verbatimQuestions: [],
      volunteeredInfo: [],
      nextTimeScripts: [
        'Ask specific questions about pain points: "What are the biggest challenges in your current process?"',
        'Explore root causes: "What do you think is causing these issues?"',
        'Investigate impact: "How does this affect your team and customers?"',
        'Look for constraints: "What\'s preventing you from improving this already?"',
        'Focus on handoffs: "Where do things typically fall apart between teams?"'
      ]
    };
  }

  private getDefaultAnalysis(): any {
    return {
      overallScore: 0,
      coverageScores: {
        'pain_points': 0.2,
        'blockers': 0.2,
        'handoffs': 0.2,
        'constraints': 0.2,
        'customer_impact': 0.2
      },
      techniqueScore: 0,
      independenceScores: {
        'pain_points': 0.3,
        'blockers': 0.3,
        'handoffs': 0.3,
        'constraints': 0.3,
        'customer_impact': 0.3
      },
      coveredAreas: [],
      missedAreas: ['Pain Points', 'Blockers', 'Handoffs', 'Constraints', 'Customer Impact'],
      openQuestions: 0,
      followUps: 0,
      talkBalance: 0.3,
      earlySolutioning: false,
      unaidedQuestions: 0,
      editedQuestions: [],
      verbatimQuestions: [],
      volunteeredInfo: [],
      nextTimeScripts: [
        'Start by introducing yourself professionally',
        'Ask about current pain points',
        'Explore the root causes of issues',
        'Investigate how problems affect customers',
        'Look for constraints and limitations'
      ]
    };
  }

  async recordHintEvent(sessionId: string, stageId: string, cardId: string, eventType: 'shown' | 'clicked' | 'edited' | 'asked', payload?: any): Promise<void> {
    try {
      // No-op mock for now
      return;
    } catch (error) {
      console.error('Error recording hint event:', error);
    }
  }

  async getDebrief(sessionId: string): Promise<DebriefResult> {
    try {
      const response = await fetch(`/api/debrief/${sessionId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch debrief');
      }
    } catch (error) {
      console.error('Error fetching debrief:', error);
      // Minimal mock debrief so UI renders
      return {
        coverageScores: {
          pain_points: 0.5,
          blockers: 0.3,
          handoffs: 0,
          constraints: 0.2,
          customer_impact: 0.6
        },
        technique: { 
          openRatio: 0.6, 
          followUp: 0.4, 
          talkBalance: 0.5, 
          earlySolutioning: false,
          closedCount: 2,
          totalLearnerQs: 8
        },
        independence: {
          pain_points: 1,
          blockers: 1,
          handoffs: 1,
          constraints: 1,
          customer_impact: 1
        },
        overall: 0.55,
        passed: false,
        coveredAreas: ['pain_points', 'customer_impact'],
        missedAreas: ['handoffs', 'constraints'],
        nextTimeScripts: [
          'For handoffs: "Where do things typically fall apart between teams?"',
          'For constraints: "What limitations should we keep in mind?"'
        ],
        evidence: [],
        coaching: {
          closedExamples: [
            {
              turnIdx: 3,
              original: 'Is the onboarding process really that slow?',
              rewrite: 'What makes the onboarding process feel slow for customers?'
            },
            {
              turnIdx: 7,
              original: 'Do you think this will work?',
              rewrite: 'What would success look like for this solution?'
            }
          ],
          nextTimeScripts: [
            'Where do things typically fall apart between teams?',
            'What limitations should we keep in mind?',
            'Ask open-ended questions that start with What, How, Why, or Tell me about...',
            'Use follow-up questions to dig deeper into stakeholder responses'
          ],
          miniLessons: [
            {
              key: 'handoffs',
              tip: 'Handoffs between teams are common failure points. Understanding these gaps helps design better integration and communication processes.'
            },
            {
              key: 'constraints',
              tip: 'Constraints (technical, budget, time, people) significantly impact what solutions are feasible. Understanding these early prevents unrealistic expectations.'
            }
          ]
        }
      };
    }
  }

  async generateDebrief(sessionId: string, mode: 'practice' | 'assess' = 'practice'): Promise<DebriefResult> {
    try {
      const response = await fetch('/api/debrief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          mode
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to generate debrief');
      }
    } catch (error) {
      console.error('Error generating debrief:', error);
      // reuse getDebrief mock
      return this.getDebrief(sessionId);
    }
  }

  async getUserCredits(userId: string): Promise<UserCredits> {
    try {
      // For now, return mock credits since backend isn't set up yet
      return {
        userId,
        practiceCredits: 10,
        assessCredits: 5
      };
      
      // TODO: Uncomment when backend is ready
      /*
      const response = await fetch(`${this.baseUrl}/credits/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch credits');
      }
      */
    } catch (error) {
      console.error('Error fetching credits:', error);
      // Return default credits
      return {
        userId,
        practiceCredits: 10,
        assessCredits: 5
      };
    }
  }

  async useCredits(userId: string, type: 'practice' | 'assess'): Promise<UserCredits> {
    try {
      // Mock deduction
      const current = await this.getUserCredits(userId);
      if (type === 'practice' && current.practiceCredits > 0) current.practiceCredits -= 1;
      if (type === 'assess' && current.assessCredits > 0) current.assessCredits -= 1;
      return current;
    } catch (error) {
      console.error('Error using credits:', error);
      throw error;
    }
  }

  getLearnContent(stageId: string) {
    // Mock learning content for each stage
    const content = {
      problem_exploration: {
        stageId: 'problem_exploration',
        objective: 'Learn how to conduct a Problem Exploration meeting to uncover pain points and root causes',
        mustCovers: [
          { area: 'pain_points', keywords: ['Frustration', 'Problem', 'Issue', 'Pain'] },
          { area: 'blockers', keywords: ['Slow', 'Delay', 'Block', 'Stuck'] },
          { area: 'handoffs', keywords: ['Handoff', 'Transfer', 'Team', 'Department'] },
          { area: 'constraints', keywords: ['Limit', 'Constraint', 'Budget', 'Time'] },
          { area: 'customer_impact', keywords: ['Customer', 'User', 'Impact', 'Experience'] }
        ],
        modelQAs: [
          { question: 'What are the biggest pain points in your current process?', answer: 'This helps identify specific areas of frustration and inefficiency.' },
          { question: 'Where do things typically get stuck?', answer: 'This reveals bottlenecks and blockers in the workflow.' }
        ],
        microDrills: [
          { 
            type: 'best_followup',
            prompt: 'A stakeholder says: "The process is too slow." What\'s the best follow-up question?', 
            choices: ['How long does it currently take?', 'What makes it slow?', 'Can you give me an example?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Multiple follow-up questions help you understand the problem from different angles.' 
          },
          { 
            type: 'pain_point_exploration',
            prompt: 'A stakeholder says: "Our customers are frustrated." What\'s the best follow-up question?', 
            choices: ['Why are they frustrated?', 'How do you know?', 'What specific issues do they mention?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Dig deeper to understand the root causes and specific manifestations of customer frustration.' 
          },
          { 
            type: 'constraint_identification',
            prompt: 'A stakeholder says: "We can\'t change the system." What\'s the best follow-up question?', 
            choices: ['Why not?', 'What\'s preventing changes?', 'What alternatives have you considered?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Understanding constraints helps identify realistic solutions and workarounds.' 
          }
        ],
        cheatCards: [
          { title: 'Pain Point Questions', content: 'Ask about frustrations, inefficiencies, and what\'s not working well.' },
          { title: 'Blocker Questions', content: 'Focus on what slows things down or causes delays.' }
        ]
      },
      as_is: {
        stageId: 'as_is',
        objective: 'Learn how to conduct an As-Is Process/Analysis meeting to understand current processes and systems',
        mustCovers: [
          { area: 'current_process', keywords: ['Process', 'Workflow', 'Steps', 'Procedure'] },
          { area: 'pain_points', keywords: ['Frustration', 'Problem', 'Issue', 'Pain'] },
          { area: 'inefficiencies', keywords: ['Slow', 'Waste', 'Redundant', 'Manual'] },
          { area: 'stakeholder_roles', keywords: ['Role', 'Responsibility', 'Team', 'Department'] },
          { area: 'system_gaps', keywords: ['System', 'Tool', 'Gap', 'Missing'] }
        ],
        modelQAs: [
          { question: 'Can you walk me through the current process step by step?', answer: 'This helps map out the existing workflow and identify areas for improvement.' },
          { question: 'What systems do you currently use?', answer: 'This reveals the technology landscape and potential integration points.' }
        ],
        microDrills: [
          { 
            type: 'system_analysis',
            prompt: 'A stakeholder says: "We use Excel for everything." What\'s the best follow-up question?', 
            choices: ['What kind of data?', 'How many people use it?', 'What problems does that create?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Understanding the limitations and pain points of current systems is crucial.' 
          },
          { 
            type: 'process_mapping',
            prompt: 'A stakeholder says: "The process is complicated." What\'s the best follow-up question?', 
            choices: ['Can you walk me through it?', 'What makes it complicated?', 'Where do people get confused?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Process mapping helps identify complexity points and areas for simplification.' 
          },
          { 
            type: 'stakeholder_identification',
            prompt: 'A stakeholder says: "Multiple teams are involved." What\'s the best follow-up question?', 
            choices: ['Which teams?', 'What does each team do?', 'How do they hand off work?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Understanding stakeholder roles and handoffs is essential for process improvement.' 
          }
        ],
        cheatCards: [
          { title: 'Process Mapping', content: 'Ask for step-by-step walkthroughs of current workflows.' },
          { title: 'System Inventory', content: 'Identify all tools and systems currently in use.' }
        ]
      },
      to_be: {
        stageId: 'to_be',
        objective: 'Learn how to conduct a To-Be Process meeting to design future state solutions',
        mustCovers: [
          { area: 'future_state', keywords: ['Future', 'Ideal', 'Vision', 'Goal'] },
          { area: 'improvements', keywords: ['Better', 'Improve', 'Enhance', 'Optimize'] },
          { area: 'requirements', keywords: ['Need', 'Requirement', 'Must', 'Should'] },
          { area: 'success_criteria', keywords: ['Success', 'Measure', 'Metric', 'Outcome'] },
          { area: 'implementation_plan', keywords: ['Implement', 'Plan', 'Timeline', 'Rollout'] }
        ],
        modelQAs: [
          { question: 'What would an ideal process look like to you?', answer: 'This helps envision the future state and desired outcomes.' },
          { question: 'How would you measure success for this improvement?', answer: 'This defines clear success criteria and metrics.' }
        ],
        microDrills: [
          { 
            type: 'requirement_clarification',
            prompt: 'A stakeholder says: "I want it to be faster." What\'s the best follow-up question?', 
            choices: ['How fast?', 'What\'s the current speed?', 'What would make it faster?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Specific, measurable requirements are essential for success.' 
          },
          { 
            type: 'success_metrics',
            prompt: 'A stakeholder says: "We need better results." What\'s the best follow-up question?', 
            choices: ['What does "better" mean?', 'How do you measure results now?', 'What would success look like?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Defining clear, measurable success criteria is crucial for project success.' 
          },
          { 
            type: 'future_vision',
            prompt: 'A stakeholder says: "I want it to be like the competition." What\'s the best follow-up question?', 
            choices: ['What specifically do you like about them?', 'What would be different for you?', 'What\'s your unique advantage?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Understanding competitive advantages and unique value propositions is key.' 
          }
        ],
        cheatCards: [
          { title: 'Future Vision', content: 'Help stakeholders envision their ideal future state.' },
          { title: 'Success Metrics', content: 'Define clear, measurable success criteria.' }
        ]
      },
      as_is_mapping: {
        stageId: 'as_is_mapping',
        objective: 'Learn how to create As-Is Process Maps to document current end-to-end flows and feed the backlog',
        mustCovers: [
          { area: 'process_boundaries', keywords: ['Start', 'Trigger', 'End', 'Complete', 'Boundary'] },
          { area: 'actors_systems', keywords: ['Actor', 'Role', 'System', 'Tool', 'Responsibility'] },
          { area: 'flow_handoffs', keywords: ['Flow', 'Handoff', 'Transfer', 'Sequence', 'Path'] },
          { area: 'data_rules', keywords: ['Data', 'Document', 'Rule', 'Policy', 'Input', 'Output'] },
          { area: 'pain_points', keywords: ['Pain', 'Problem', 'Slow', 'Fail', 'Bottleneck'] }
        ],
        modelQAs: [
          { question: 'What triggers this process to start? What proves it\'s done?', answer: 'This defines clear process boundaries and success criteria.' },
          { question: 'Who does what, using which tools?', answer: 'This maps out actors, roles, and systems involved in the process.' }
        ],
        microDrills: [
          { 
            type: 'process_boundaries',
            prompt: 'A stakeholder says: "The process starts when we get a request." What\'s the best follow-up question?', 
            choices: ['What kind of request?', 'How do you receive it?', 'What proves it\'s complete?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Understanding process boundaries helps define scope and success criteria.' 
          },
          { 
            type: 'actor_mapping',
            prompt: 'A stakeholder says: "Multiple people are involved." What\'s the best follow-up question?', 
            choices: ['Who are they?', 'What does each person do?', 'How do they hand off work?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Mapping actors and their responsibilities is essential for process documentation.' 
          },
          { 
            type: 'system_integration',
            prompt: 'A stakeholder says: "We use different systems." What\'s the best follow-up question?', 
            choices: ['Which systems?', 'How do they connect?', 'What data flows between them?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Understanding system integration points reveals data flow and handoff complexity.' 
          }
        ],
        cheatCards: [
          { title: 'Process Boundaries', content: 'Define clear start and end points for each process.' },
          { title: 'Actor Mapping', content: 'Identify who does what and how work flows between roles.' }
        ]
      },
      solution_design: {
        stageId: 'solution_design',
        objective: 'Learn how to conduct a Solution Design meeting to define technical requirements and implementation',
        mustCovers: [
          { area: 'technical_requirements', keywords: ['Technical', 'Requirement', 'Specification', 'Feature'] },
          { area: 'architecture', keywords: ['Architecture', 'Design', 'Structure', 'Framework'] },
          { area: 'data_models', keywords: ['Data', 'Model', 'Database', 'Schema'] },
          { area: 'integration_points', keywords: ['Integration', 'API', 'Interface', 'Connect'] },
          { area: 'deployment_plan', keywords: ['Deploy', 'Rollout', 'Migration', 'Timeline'] }
        ],
        modelQAs: [
          { question: 'What technical capabilities do you need?', answer: 'This defines the specific technical requirements and features.' },
          { question: 'How should this integrate with your existing systems?', answer: 'This identifies integration points and architectural considerations.' }
        ],
        microDrills: [
          { 
            type: 'integration_planning',
            prompt: 'A stakeholder says: "It needs to work with our CRM." What\'s the best follow-up question?', 
            choices: ['Which CRM?', 'What data needs to sync?', 'How often?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Understanding integration requirements is crucial for technical design.' 
          },
          { 
            type: 'technical_requirements',
            prompt: 'A stakeholder says: "It needs to be secure." What\'s the best follow-up question?', 
            choices: ['What security standards?', 'What data needs protection?', 'What compliance requirements?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Security requirements must be specific and aligned with compliance needs.' 
          },
          { 
            type: 'user_experience',
            prompt: 'A stakeholder says: "Users find it confusing." What\'s the best follow-up question?', 
            choices: ['What specifically confuses them?', 'How do they currently work around it?', 'What would make it clearer?', 'All of the above'], 
            answer: 'All of the above', 
            explanation: 'Understanding user pain points and workarounds helps design better experiences.' 
          }
        ],
        cheatCards: [
          { title: 'Technical Requirements', content: 'Define specific technical capabilities and features needed.' },
          { title: 'Integration Planning', content: 'Identify how the solution will work with existing systems.' }
        ]
      }
    };
    
    return content[stageId as keyof typeof content] || content.problem_exploration;
  }

  // Mock data fallbacks
  private getMockStageData(stageId: string): { stage: StageData; cards: QuestionCard[] } {
    const stages = {
      problem_exploration: {
        stage: {
          id: 'problem_exploration',
          name: 'Problem Exploration',
          objective: 'Uncover pain points and root causes',
          mustCover: ['pain_points', 'blockers', 'handoffs', 'constraints', 'customer_impact']
        },
        cards: [
          { id: 'pe_001', stage_id: 'problem_exploration', skill: 'open_questioning', text: 'What are the biggest pain points in your current process?', tone_tags: ['professional', 'curious'] },
          { id: 'pe_002', stage_id: 'problem_exploration', skill: 'follow_up', text: 'Can you tell me more about that specific issue?', tone_tags: ['empathetic', 'focused'] },
          { id: 'pe_003', stage_id: 'problem_exploration', skill: 'root_cause', text: 'What do you think is causing this problem?', tone_tags: ['analytical', 'collaborative'] },
          { id: 'pe_004', stage_id: 'problem_exploration', skill: 'impact_assessment', text: 'How does this affect your team and customers?', tone_tags: ['concerned', 'thorough'] },
          { id: 'pe_005', stage_id: 'problem_exploration', skill: 'constraint_exploration', text: 'What\'s preventing you from fixing this already?', tone_tags: ['understanding', 'supportive'] }
        ]
      },
      as_is: {
        stage: {
          id: 'as_is',
          name: 'As-Is Process/Analysis',
          objective: 'Understand current processes and systems',
          mustCover: ['current_process', 'pain_points', 'inefficiencies', 'stakeholder_roles', 'system_gaps']
        },
        cards: [
          { id: 'as_001', stage_id: 'as_is', skill: 'process_mapping', text: 'Can you walk me through the current process step by step?', tone_tags: ['methodical', 'patient'] },
          { id: 'as_002', stage_id: 'as_is', skill: 'stakeholder_identification', text: 'Who else is involved in this process?', tone_tags: ['inclusive', 'thorough'] },
          { id: 'as_003', stage_id: 'as_is', skill: 'system_investigation', text: 'What systems do you currently use?', tone_tags: ['technical', 'curious'] },
          { id: 'as_004', stage_id: 'as_is', skill: 'gap_analysis', text: 'Where do things typically break down?', tone_tags: ['analytical', 'focused'] },
          { id: 'as_005', stage_id: 'as_is', skill: 'data_understanding', text: 'What data do you track or wish you could track?', tone_tags: ['data_driven', 'forward_thinking'] }
        ]
      },
      as_is_mapping: {
        stage: {
          id: 'as_is_mapping',
          name: 'As-Is Process Map',
          objective: 'Document current end-to-end flow to feed the backlog',
          mustCover: ['process_boundaries', 'actors_systems', 'flow_handoffs', 'data_rules', 'pain_points']
        },
        cards: [
          { id: 'aim_001', stage_id: 'as_is_mapping', skill: 'process_boundaries', text: 'What triggers this process to start? What proves it\'s done?', tone_tags: ['methodical', 'clear'] },
          { id: 'aim_002', stage_id: 'as_is_mapping', skill: 'actors_systems', text: 'Who does what, using which tools?', tone_tags: ['systematic', 'detailed'] },
          { id: 'aim_003', stage_id: 'as_is_mapping', skill: 'flow_handoffs', text: 'What\'s the normal path? Where do variations occur?', tone_tags: ['analytical', 'thorough'] },
          { id: 'aim_004', stage_id: 'as_is_mapping', skill: 'data_rules', text: 'What documents/data flow through? What rules apply?', tone_tags: ['data_focused', 'precise'] },
          { id: 'aim_005', stage_id: 'as_is_mapping', skill: 'pain_points', text: 'Where does it slow down or fail? What are the current metrics?', tone_tags: ['empathetic', 'analytical'] }
        ]
      },
      to_be: {
        stage: {
          id: 'to_be',
          name: 'To-Be Process',
          objective: 'Design future state solutions',
          mustCover: ['future_state', 'improvements', 'requirements', 'success_criteria', 'implementation_plan']
        },
        cards: [
          { id: 'tb_001', stage_id: 'to_be', skill: 'future_vision', text: 'What would an ideal process look like to you?', tone_tags: ['visionary', 'collaborative'] },
          { id: 'tb_002', stage_id: 'to_be', skill: 'requirement_gathering', text: 'What specific improvements would make the biggest difference?', tone_tags: ['prioritizing', 'focused'] },
          { id: 'tb_003', stage_id: 'to_be', skill: 'success_definition', text: 'How would you measure success for this improvement?', tone_tags: ['measurable', 'clear'] },
          { id: 'tb_004', stage_id: 'to_be', skill: 'constraint_consideration', text: 'What limitations should we keep in mind?', tone_tags: ['realistic', 'practical'] },
          { id: 'tb_005', stage_id: 'to_be', skill: 'implementation_planning', text: 'What would be the best way to implement these changes?', tone_tags: ['strategic', 'practical'] }
        ]
      },
      solution_design: {
        stage: {
          id: 'solution_design',
          name: 'Solution Design',
          objective: 'Define technical requirements and implementation',
          mustCover: ['technical_requirements', 'architecture', 'data_models', 'integration_points', 'deployment_plan']
        },
        cards: [
          { id: 'sd_001', stage_id: 'solution_design', skill: 'technical_requirements', text: 'What technical capabilities do you need?', tone_tags: ['technical', 'specific'] },
          { id: 'sd_002', stage_id: 'solution_design', skill: 'integration_needs', text: 'How should this integrate with your existing systems?', tone_tags: ['architectural', 'holistic'] },
          { id: 'sd_003', stage_id: 'solution_design', skill: 'data_requirements', text: 'What data will this solution need to handle?', tone_tags: ['data_focused', 'detailed'] },
          { id: 'sd_004', stage_id: 'solution_design', skill: 'user_experience', text: 'How should users interact with this solution?', tone_tags: ['user_centered', 'empathic'] },
          { id: 'sd_005', stage_id: 'solution_design', skill: 'deployment_strategy', text: 'How should we roll this out to minimize disruption?', tone_tags: ['strategic', 'careful'] }
        ]
      }
    };

    return stages[stageId as keyof typeof stages] || stages.problem_exploration;
  }

  getProjects() {
    return mockProjects;
  }

  getProjectById(projectId: string) {
    return mockProjects.find(project => project.id === projectId);
  }

  // Get current question for a session
  getCurrentQuestion(sessionId: string): any {
    try {
      // Get session to determine stage
      const session = this.sessionsById.get(sessionId);
      if (!session) {
        console.log('No session found for:', sessionId);
        return null;
      }

      // Get stage data to find questions
      const stageData = this.getMockStageData(session.stage);
      if (stageData.cards && stageData.cards.length > 0) {
        // Return the first question for now
        return {
          id: stageData.cards[0].id,
          stage_id: stageData.cards[0].stage_id,
          skill: stageData.cards[0].skill,
          text: stageData.cards[0].text,
          tone_tags: stageData.cards[0].tone_tags
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting current question:', error);
      return null;
    }
  }

  nextQuestion(sessionId: string): any {
    // For now, return the same question
    return this.getCurrentQuestion(sessionId);
  }
}

export const trainingService = new TrainingService();
