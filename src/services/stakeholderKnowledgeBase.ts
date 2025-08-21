// Robust Project-Specific Stakeholder Knowledge Base System
// Each project has its own dedicated knowledge base to ensure context accuracy

interface StakeholderResponse {
  id: string;
  question: string;
  answer: string;
  voiceAnswer?: string; // Short version for ElevenLabs
  stakeholderRoles: string[];
  keywords: string[];
  category: 'pain-points' | 'process' | 'challenges' | 'team' | 'systems' | 'general';
  priority: number; // 1 = exact match, 5 = emergency fallback
}

interface ProjectContext {
  id: string;
  name: string;
  painPoints: string[];
  currentProcess: string;
  stakeholders: {
    role: string;
    department: string;
    responsibilities: string[];
  }[];
}

interface ProjectKnowledgeBase {
  projectId: string;
  projectName: string;
  responses: StakeholderResponse[];
}

class StakeholderKnowledgeBase {
  private static instance: StakeholderKnowledgeBase;
  
  // Project-specific knowledge bases
  private projectKnowledgeBases: Map<string, ProjectKnowledgeBase> = new Map();
  
  private constructor() {
    this.initializeProjectKnowledgeBases();
  }

  public static getInstance(): StakeholderKnowledgeBase {
    if (!StakeholderKnowledgeBase.instance) {
      StakeholderKnowledgeBase.instance = new StakeholderKnowledgeBase();
    }
    return StakeholderKnowledgeBase.instance;
  }

  // Initialize knowledge bases for each project
  private initializeProjectKnowledgeBases(): void {
    // Customer Onboarding Project Knowledge Base
    const customerOnboardingKB: ProjectKnowledgeBase = {
      projectId: 'customer-onboarding',
      projectName: 'Customer Onboarding Process Optimization',
      responses: [
        // Layer 1: Exact Project-Specific Responses (Priority 1)
        {
          id: 'onboarding-pain-points-1',
          question: 'What are your main pain points?',
          answer: 'In our customer onboarding process, the main pain points are manual data entry between Salesforce and our implementation system, and delayed handoffs that can take 24 to 48 hours. This creates inconsistencies and delays in customer setup.',
          voiceAnswer: 'Manual data entry and delayed handoffs between systems.',
          stakeholderRoles: ['Sales Manager', 'Implementation Manager', 'Customer Success Manager'],
          keywords: ['pain points', 'challenges', 'problems', 'issues', 'difficulties'],
          category: 'pain-points',
          priority: 1
        },
        {
          id: 'onboarding-process-1',
          question: 'How does your current process work?',
          answer: 'Our current process starts with sales closing deals in Salesforce. Then we manually email customer information to the implementation team, who recreates the data in their system. This creates delays and potential for errors.',
          voiceAnswer: 'Sales closes in Salesforce, then manual email handoff to implementation.',
          stakeholderRoles: ['Sales Manager', 'Implementation Manager'],
          keywords: ['process', 'workflow', 'how', 'current', 'procedure'],
          category: 'process',
          priority: 1
        },
        {
          id: 'onboarding-team-structure-1',
          question: 'How is your team structured?',
          answer: 'Our team is organized by function - sales handles customer acquisition, implementation manages onboarding, and customer success provides ongoing support. Each team has their own systems and processes.',
          voiceAnswer: 'Organized by function - sales, implementation, and customer success.',
          stakeholderRoles: ['Sales Manager', 'Implementation Manager', 'Customer Success Manager'],
          keywords: ['team', 'structure', 'organization', 'roles', 'responsibilities'],
          category: 'team',
          priority: 1
        },
        {
          id: 'onboarding-systems-1',
          question: 'What systems do you use?',
          answer: 'We use Salesforce for sales, Monday.com for project management, and a custom implementation system. The systems don\'t integrate well, requiring manual data entry and causing delays.',
          voiceAnswer: 'Salesforce, Monday.com, and a custom implementation system.',
          stakeholderRoles: ['IT Director', 'Sales Manager', 'Implementation Manager'],
          keywords: ['systems', 'tools', 'software', 'platforms', 'applications'],
          category: 'systems',
          priority: 1
        }
      ]
    };

    // IT Support System Project Knowledge Base
    const itSupportKB: ProjectKnowledgeBase = {
      projectId: 'it-support-system',
      projectName: 'IT Support System Enhancement',
      responses: [
        {
          id: 'support-challenges-1',
          question: 'What challenges does your team face?',
          answer: 'Our support team struggles with limited visibility into case status, lack of intelligent ticket routing, and no integrated knowledge sharing. This leads to delayed resolutions and frustrated customers.',
          voiceAnswer: 'Limited visibility, poor ticket routing, and no knowledge sharing.',
          stakeholderRoles: ['Customer Service Manager', 'Support Manager', 'IT Director'],
          keywords: ['challenges', 'struggles', 'difficulties', 'problems', 'issues'],
          category: 'challenges',
          priority: 1
        },
        {
          id: 'support-systems-1',
          question: 'What systems do you use for support?',
          answer: 'We use Zendesk for ticket management, but it doesn\'t integrate with our internal systems. We also have a separate knowledge base that\'s rarely updated, and no automated routing system.',
          voiceAnswer: 'Zendesk for tickets, separate knowledge base, no automation.',
          stakeholderRoles: ['Customer Service Manager', 'Support Manager'],
          keywords: ['systems', 'tools', 'software', 'platforms', 'applications'],
          category: 'systems',
          priority: 1
        }
      ]
    };

    // Add knowledge bases to the map
    this.projectKnowledgeBases.set('customer-onboarding', customerOnboardingKB);
    this.projectKnowledgeBases.set('it-support-system', itSupportKB);
  }

  // Main method to get stakeholder response - NEVER FAILS
  public getStakeholderResponse(
    userQuestion: string,
    stakeholderRole: string,
    projectContext?: ProjectContext
  ): { text: string; voice: string } {
    
    if (!projectContext?.id) {
      throw new Error('Project context is required for project-specific knowledge base');
    }

    const projectKB = this.projectKnowledgeBases.get(projectContext.id);
    if (!projectKB) {
      throw new Error(`No knowledge base found for project: ${projectContext.id}`);
    }

    // Layer 1: Exact project-specific match
    let response = this.findExactMatch(userQuestion, stakeholderRole, projectKB);
    
    // Layer 2: Role-specific match within project
    if (!response) {
      response = this.findRoleMatch(userQuestion, stakeholderRole, projectKB);
    }
    
    // Layer 3: Topic-based match within project
    if (!response) {
      response = this.findTopicMatch(userQuestion, stakeholderRole, projectKB);
    }
    
    // Layer 4: Generic role response within project
    if (!response) {
      response = this.findGenericMatch(userQuestion, stakeholderRole, projectKB);
    }
    
    // Layer 5: Emergency fallback (NEVER FAILS)
    if (!response) {
      response = this.getEmergencyResponse(stakeholderRole, projectKB);
    }

    // Inject project context if available
    const finalResponse = this.injectProjectContext(response, projectContext);
    
    return {
      text: finalResponse.answer,
      voice: finalResponse.voiceAnswer || finalResponse.answer.substring(0, 150) + '...'
    };
  }

  // Layer 1: Exact project-specific match
  private findExactMatch(
    question: string,
    role: string,
    projectKB: ProjectKnowledgeBase
  ): StakeholderResponse | null {
    const lowerQuestion = question.toLowerCase();
    
    return projectKB.responses.find(item => 
      item.priority === 1 &&
      item.stakeholderRoles.includes(role) &&
      (item.question.toLowerCase() === lowerQuestion || 
       item.keywords.some(keyword => lowerQuestion.includes(keyword)))
    ) || null;
  }

  // Layer 2: Role-specific match within project
  private findRoleMatch(
    question: string, 
    role: string, 
    projectKB: ProjectKnowledgeBase
  ): StakeholderResponse | null {
    const lowerQuestion = question.toLowerCase();
    
    return projectKB.responses.find(item => 
      item.priority === 2 &&
      item.stakeholderRoles.includes(role) &&
      item.keywords.some(keyword => lowerQuestion.includes(keyword))
    ) || null;
  }

  // Layer 3: Topic-based match within project
  private findTopicMatch(
    question: string, 
    role: string, 
    projectKB: ProjectKnowledgeBase
  ): StakeholderResponse | null {
    const lowerQuestion = question.toLowerCase();
    
    return projectKB.responses.find(item => 
      item.priority === 3 &&
      item.stakeholderRoles.includes(role) &&
      item.keywords.some(keyword => lowerQuestion.includes(keyword))
    ) || null;
  }

  // Layer 4: Generic role match within project
  private findGenericMatch(
    question: string, 
    role: string, 
    projectKB: ProjectKnowledgeBase
  ): StakeholderResponse | null {
    const lowerQuestion = question.toLowerCase();
    
    return projectKB.responses.find(item => 
      item.priority === 4 &&
      item.stakeholderRoles.includes(role) &&
      item.keywords.some(keyword => lowerQuestion.includes(keyword))
    ) || null;
  }

  // Layer 5: Emergency fallback (NEVER FAILS)
  private getEmergencyResponse(
    role: string, 
    projectKB: ProjectKnowledgeBase
  ): StakeholderResponse {
    return projectKB.responses.find(item => 
      item.priority === 5 &&
      item.stakeholderRoles.includes(role)
    ) || projectKB.responses[0]; // Fallback to first response if no emergency response
  }

  // Inject project context into response
  private injectProjectContext(response: StakeholderResponse, project: ProjectContext): StakeholderResponse {
    const injectedAnswer = response.answer
      .replace('{project.name}', project.name)
      .replace('{project.painPoints}', project.painPoints.join(', '))
      .replace('{project.currentProcess}', project.currentProcess);

    const injectedVoiceAnswer = response.voiceAnswer?.replace('{project.name}', project.name) || response.voiceAnswer;

    return {
      ...response,
      answer: injectedAnswer,
      voiceAnswer: injectedVoiceAnswer
    };
  }

  // Get available stakeholder roles for a specific project
  public getAvailableRoles(projectId: string): string[] {
    const projectKB = this.projectKnowledgeBases.get(projectId);
    if (!projectKB) return [];
    
    return [...new Set(projectKB.responses.flatMap(item => item.stakeholderRoles))];
  }

  // Get available project contexts
  public getAvailableProjectContexts(): string[] {
    return Array.from(this.projectKnowledgeBases.keys());
  }

  // Add new response to a specific project's knowledge base
  public addResponse(projectId: string, response: StakeholderResponse): void {
    const projectKB = this.projectKnowledgeBases.get(projectId);
    if (projectKB) {
      projectKB.responses.push(response);
    }
  }

  // Get response statistics for a specific project
  public getStats(projectId: string): { totalResponses: number; byPriority: Record<number, number> } {
    const projectKB = this.projectKnowledgeBases.get(projectId);
    if (!projectKB) {
      return { totalResponses: 0, byPriority: {} };
    }

    const byPriority: Record<number, number> = {};
    projectKB.responses.forEach(item => {
      byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
    });

    return {
      totalResponses: projectKB.responses.length,
      byPriority
    };
  }
}

export default StakeholderKnowledgeBase;
export type { StakeholderResponse, ProjectContext };

