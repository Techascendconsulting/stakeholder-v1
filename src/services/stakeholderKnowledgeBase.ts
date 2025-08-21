// Robust Stakeholder Knowledge Base System
// Provides project-specific responses with multiple fallback layers

interface StakeholderResponse {
  id: string;
  question: string;
  answer: string;
  voiceAnswer?: string; // Short version for ElevenLabs
  stakeholderRoles: string[];
  projectContexts: string[];
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

class StakeholderKnowledgeBase {
  private static instance: StakeholderKnowledgeBase;
  
  // Comprehensive knowledge base with multiple fallback layers
  private knowledgeBase: StakeholderResponse[] = [
    // Layer 1: Exact Project-Specific Responses (Priority 1)
    {
      id: 'onboarding-pain-points-1',
      question: 'What are your main pain points?',
      answer: 'In our customer onboarding process, the main pain points are manual data entry between Salesforce and our implementation system, and delayed handoffs that can take 24 to 48 hours. This creates inconsistencies and delays in customer setup.',
      voiceAnswer: 'Manual data entry and delayed handoffs between systems.',
      stakeholderRoles: ['Sales Manager', 'Implementation Manager', 'Customer Success Manager'],
      projectContexts: ['customer-onboarding', 'process-optimization'],
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
      projectContexts: ['customer-onboarding'],
      keywords: ['process', 'workflow', 'how', 'current', 'procedure'],
      category: 'process',
      priority: 1
    },
    {
      id: 'support-challenges-1',
      question: 'What challenges does your team face?',
      answer: 'Our support team struggles with limited visibility into case status, lack of intelligent ticket routing, and no integrated knowledge sharing. This leads to delayed resolutions and frustrated customers.',
      voiceAnswer: 'Limited visibility, poor ticket routing, and no knowledge sharing.',
      stakeholderRoles: ['Customer Service Manager', 'Support Manager', 'IT Director'],
      projectContexts: ['it-support-system', 'customer-service'],
      keywords: ['challenges', 'struggles', 'difficulties', 'problems', 'issues'],
      category: 'challenges',
      priority: 1
    },
    {
      id: 'team-structure-1',
      question: 'How is your team structured?',
      answer: 'Our team is organized by function - sales handles customer acquisition, implementation manages onboarding, and customer success provides ongoing support. Each team has their own systems and processes.',
      voiceAnswer: 'Organized by function - sales, implementation, and customer success.',
      stakeholderRoles: ['Sales Manager', 'Implementation Manager', 'Customer Success Manager'],
      projectContexts: ['customer-onboarding', 'organizational-structure'],
      keywords: ['team', 'structure', 'organization', 'roles', 'responsibilities'],
      category: 'team',
      priority: 1
    },
    {
      id: 'systems-integration-1',
      question: 'What systems do you use?',
      answer: 'We use Salesforce for sales, Monday.com for project management, and a custom implementation system. The systems don\'t integrate well, requiring manual data entry and causing delays.',
      voiceAnswer: 'Salesforce, Monday.com, and a custom implementation system.',
      stakeholderRoles: ['IT Director', 'Sales Manager', 'Implementation Manager'],
      projectContexts: ['customer-onboarding', 'system-integration'],
      keywords: ['systems', 'tools', 'software', 'platforms', 'applications'],
      category: 'systems',
      priority: 1
    },

    // Layer 2: Role-Specific Responses (Priority 2)
    {
      id: 'sales-role-1',
      question: 'What is your role in this project?',
      answer: 'As Sales Manager, I\'m responsible for customer acquisition, deal closure, and ensuring smooth handoff to implementation. I work closely with marketing for lead generation and with implementation to ensure customer requirements are clear.',
      voiceAnswer: 'I handle customer acquisition and ensure smooth handoff to implementation.',
      stakeholderRoles: ['Sales Manager'],
      projectContexts: ['customer-onboarding', 'sales-process'],
      keywords: ['role', 'responsibility', 'job', 'position', 'function'],
      category: 'general',
      priority: 2
    },
    {
      id: 'it-role-1',
      question: 'What is your role in this project?',
      answer: 'As IT Director, I oversee our technology infrastructure, system integrations, and ensure our tools support business processes effectively. I work with all departments to identify technical needs and implement solutions.',
      voiceAnswer: 'I oversee technology infrastructure and system integrations.',
      stakeholderRoles: ['IT Director'],
      projectContexts: ['system-integration', 'technology'],
      keywords: ['role', 'responsibility', 'job', 'position', 'function'],
      category: 'general',
      priority: 2
    },
    {
      id: 'customer-service-role-1',
      question: 'What is your role in this project?',
      answer: 'As Customer Service Manager, I lead our support team and ensure customers receive timely, effective assistance. I work to improve our support processes and coordinate with other departments to resolve customer issues.',
      voiceAnswer: 'I lead the support team and ensure effective customer assistance.',
      stakeholderRoles: ['Customer Service Manager'],
      projectContexts: ['customer-service', 'support'],
      keywords: ['role', 'responsibility', 'job', 'position', 'function'],
      category: 'general',
      priority: 2
    },

    // Layer 3: Topic-Based Responses (Priority 3)
    {
      id: 'efficiency-1',
      question: 'How can we improve efficiency?',
      answer: 'We can improve efficiency by automating data handoffs between systems, creating standardized processes, and implementing better communication protocols. This would reduce manual work and eliminate delays.',
      voiceAnswer: 'Automate data handoffs and standardize processes.',
      stakeholderRoles: ['Sales Manager', 'Implementation Manager', 'IT Director'],
      projectContexts: ['process-optimization', 'efficiency'],
      keywords: ['efficiency', 'improve', 'optimize', 'better', 'faster'],
      category: 'process',
      priority: 3
    },
    {
      id: 'communication-1',
      question: 'How do teams communicate?',
      answer: 'Teams currently communicate through email and occasional meetings. There\'s no centralized system for sharing updates, which leads to missed information and coordination challenges.',
      voiceAnswer: 'Email and meetings, but no centralized system.',
      stakeholderRoles: ['Sales Manager', 'Implementation Manager', 'Customer Success Manager'],
      projectContexts: ['communication', 'collaboration'],
      keywords: ['communication', 'collaboration', 'coordination', 'sharing', 'updates'],
      category: 'process',
      priority: 3
    },

    // Layer 4: Generic Role Responses (Priority 4)
    {
      id: 'generic-sales-1',
      question: 'What are your priorities?',
      answer: 'My priorities are meeting sales targets, ensuring customer satisfaction, and maintaining strong relationships with prospects and customers. I focus on closing deals and setting up customers for success.',
      voiceAnswer: 'Meeting sales targets and ensuring customer satisfaction.',
      stakeholderRoles: ['Sales Manager'],
      projectContexts: ['general'],
      keywords: ['priorities', 'goals', 'focus', 'objectives', 'targets'],
      category: 'general',
      priority: 4
    },
    {
      id: 'generic-it-1',
      question: 'What are your priorities?',
      answer: 'My priorities are maintaining system stability, ensuring data security, and supporting business processes with appropriate technology solutions. I focus on reliability and efficiency.',
      voiceAnswer: 'System stability, data security, and supporting business processes.',
      stakeholderRoles: ['IT Director'],
      projectContexts: ['general'],
      keywords: ['priorities', 'goals', 'focus', 'objectives', 'targets'],
      category: 'general',
      priority: 4
    },

    // Layer 5: Emergency Fallback Responses (Priority 5) - NEVER FAILS
    {
      id: 'emergency-sales-1',
      question: 'emergency',
      answer: 'I can help with sales processes, customer acquisition, and ensuring smooth handoffs to other teams. What specific aspect would you like to discuss?',
      voiceAnswer: 'I can help with sales processes and customer acquisition.',
      stakeholderRoles: ['Sales Manager'],
      projectContexts: ['emergency'],
      keywords: ['emergency'],
      category: 'general',
      priority: 5
    },
    {
      id: 'emergency-it-1',
      question: 'emergency',
      answer: 'I can discuss technical requirements, system integration, and technology infrastructure. What specific technical aspect would you like to explore?',
      voiceAnswer: 'I can discuss technical requirements and system integration.',
      stakeholderRoles: ['IT Director'],
      projectContexts: ['emergency'],
      keywords: ['emergency'],
      category: 'general',
      priority: 5
    },
    {
      id: 'emergency-customer-service-1',
      question: 'emergency',
      answer: 'I can help with customer support processes, service delivery, and improving customer experience. What specific support aspect would you like to discuss?',
      voiceAnswer: 'I can help with customer support and service delivery.',
      stakeholderRoles: ['Customer Service Manager'],
      projectContexts: ['emergency'],
      keywords: ['emergency'],
      category: 'general',
      priority: 5
    }
  ];

  private constructor() {}

  public static getInstance(): StakeholderKnowledgeBase {
    if (!StakeholderKnowledgeBase.instance) {
      StakeholderKnowledgeBase.instance = new StakeholderKnowledgeBase();
    }
    return StakeholderKnowledgeBase.instance;
  }

  // Main method to get stakeholder response - NEVER FAILS
  public getStakeholderResponse(
    userQuestion: string,
    stakeholderRole: string,
    projectContext?: ProjectContext
  ): { text: string; voice: string } {
    
    // Layer 1: Exact project-specific match
    let response = this.findExactMatch(userQuestion, stakeholderRole, projectContext);
    
    // Layer 2: Role-specific match
    if (!response) {
      response = this.findRoleMatch(userQuestion, stakeholderRole);
    }
    
    // Layer 3: Topic-based match
    if (!response) {
      response = this.findTopicMatch(userQuestion, stakeholderRole);
    }
    
    // Layer 4: Generic role response
    if (!response) {
      response = this.findGenericMatch(userQuestion, stakeholderRole);
    }
    
    // Layer 5: Emergency fallback (NEVER FAILS)
    if (!response) {
      response = this.getEmergencyResponse(stakeholderRole);
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
    project?: ProjectContext
  ): StakeholderResponse | null {
    const lowerQuestion = question.toLowerCase();
    
    return this.knowledgeBase.find(item => 
      item.priority === 1 &&
      item.stakeholderRoles.includes(role) &&
      (item.projectContexts.includes(project?.id || 'general') || item.projectContexts.includes('general')) &&
      (item.question.toLowerCase() === lowerQuestion || 
       item.keywords.some(keyword => lowerQuestion.includes(keyword)))
    ) || null;
  }

  // Layer 2: Role-specific match
  private findRoleMatch(question: string, role: string): StakeholderResponse | null {
    const lowerQuestion = question.toLowerCase();
    
    return this.knowledgeBase.find(item => 
      item.priority === 2 &&
      item.stakeholderRoles.includes(role) &&
      item.keywords.some(keyword => lowerQuestion.includes(keyword))
    ) || null;
  }

  // Layer 3: Topic-based match
  private findTopicMatch(question: string, role: string): StakeholderResponse | null {
    const lowerQuestion = question.toLowerCase();
    
    return this.knowledgeBase.find(item => 
      item.priority === 3 &&
      item.stakeholderRoles.includes(role) &&
      item.keywords.some(keyword => lowerQuestion.includes(keyword))
    ) || null;
  }

  // Layer 4: Generic role match
  private findGenericMatch(question: string, role: string): StakeholderResponse | null {
    const lowerQuestion = question.toLowerCase();
    
    return this.knowledgeBase.find(item => 
      item.priority === 4 &&
      item.stakeholderRoles.includes(role) &&
      item.keywords.some(keyword => lowerQuestion.includes(keyword))
    ) || null;
  }

  // Layer 5: Emergency fallback (NEVER FAILS)
  private getEmergencyResponse(role: string): StakeholderResponse {
    return this.knowledgeBase.find(item => 
      item.priority === 5 &&
      item.stakeholderRoles.includes(role)
    ) || this.knowledgeBase.find(item => item.priority === 5)!;
  }

  // Inject project context into response
  private injectProjectContext(response: StakeholderResponse, project?: ProjectContext): StakeholderResponse {
    if (!project) return response;

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

  // Get available stakeholder roles
  public getAvailableRoles(): string[] {
    return [...new Set(this.knowledgeBase.flatMap(item => item.stakeholderRoles))];
  }

  // Get available project contexts
  public getAvailableProjectContexts(): string[] {
    return [...new Set(this.knowledgeBase.flatMap(item => item.projectContexts))];
  }

  // Add new response to knowledge base
  public addResponse(response: StakeholderResponse): void {
    this.knowledgeBase.push(response);
  }

  // Get response statistics
  public getStats(): { totalResponses: number; byPriority: Record<number, number> } {
    const byPriority: Record<number, number> = {};
    this.knowledgeBase.forEach(item => {
      byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
    });

    return {
      totalResponses: this.knowledgeBase.length,
      byPriority
    };
  }
}

export default StakeholderKnowledgeBase;
export type { StakeholderResponse, ProjectContext };
