// Auto-Generated Project-Specific Stakeholder Knowledge Base System
// Generates comprehensive knowledge base from project brief data

interface StakeholderResponse {
  id: string;
  question: string;
  answer: string;
  voiceAnswer?: string; // Short version for ElevenLabs
  stakeholderRoles: string[];
  keywords: string[];
  category: 'as-is' | 'to-be' | 'greeting' | 'farewell' | 'clarification' | 'general';
  priority: number; // 1 = exact match, 5 = emergency fallback
}

interface ProjectContext {
  id: string;
  name: string;
  businessContext?: string;
  problemStatement?: string;
  asIsProcess?: string;
  toBeProcess?: string;
  painPoints?: string[];
  businessGoals?: string[];
  stakeholders?: {
    role: string;
    department: string;
    responsibilities: string[];
  }[];
  teamSize?: number;
  systemsUsed?: string[];
  budget?: string;
  timeline?: string;
  successMetrics?: string[];
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
  
  private constructor() {}

  public static getInstance(): StakeholderKnowledgeBase {
    if (!StakeholderKnowledgeBase.instance) {
      StakeholderKnowledgeBase.instance = new StakeholderKnowledgeBase();
    }
    return StakeholderKnowledgeBase.instance;
  }

  // Generate comprehensive knowledge base from project brief
  public generateKnowledgeBaseFromProject(project: ProjectContext): ProjectKnowledgeBase {
    const responses: StakeholderResponse[] = [];
    
    // AS-IS Responses (Current State)
    if (project.painPoints && project.painPoints.length > 0) {
      responses.push({
        id: `${project.id}-pain-points`,
        question: 'What are your main pain points?',
        answer: `In our ${project.name} project, the main pain points are ${project.painPoints.join(', ')}. These issues impact our efficiency and customer experience.`,
        voiceAnswer: `Our main pain points are ${project.painPoints.join(', ')}.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['pain points', 'challenges', 'problems', 'issues', 'difficulties', 'struggles'],
        category: 'as-is',
        priority: 1
      });
    }

    if (project.asIsProcess) {
      responses.push({
        id: `${project.id}-current-process`,
        question: 'How does your current process work?',
        answer: `Our current process is: ${project.asIsProcess}. This creates inefficiencies and delays in our operations.`,
        voiceAnswer: `Our current process is ${project.asIsProcess}.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['process', 'workflow', 'how', 'current', 'procedure', 'currently'],
        category: 'as-is',
        priority: 1
      });
    }

    if (project.problemStatement) {
      responses.push({
        id: `${project.id}-problem-statement`,
        question: 'What problems are we solving?',
        answer: `We're solving the problem of ${project.problemStatement}. This affects our ability to serve customers effectively.`,
        voiceAnswer: `We're solving ${project.problemStatement}.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['problems', 'solving', 'issues', 'challenges', 'what problems'],
        category: 'as-is',
        priority: 1
      });
    }

    // TO-BE Responses (Future State)
    if (project.toBeProcess) {
      responses.push({
        id: `${project.id}-future-process`,
        question: 'How will this be improved?',
        answer: `The new process will be: ${project.toBeProcess}. This will significantly improve our efficiency and customer experience.`,
        voiceAnswer: `The new process will be ${project.toBeProcess}.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['improved', 'better', 'future', 'new process', 'solution'],
        category: 'to-be',
        priority: 1
      });
    }

    if (project.businessGoals && project.businessGoals.length > 0) {
      responses.push({
        id: `${project.id}-business-goals`,
        question: 'What are you trying to achieve?',
        answer: `Our business goals are: ${project.businessGoals.join(', ')}. This project will help us achieve these objectives.`,
        voiceAnswer: `Our goals are ${project.businessGoals.join(', ')}.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['goals', 'achieve', 'objectives', 'trying to', 'aim'],
        category: 'to-be',
        priority: 1
      });
    }

    // Team Information
    if (project.teamSize) {
      responses.push({
        id: `${project.id}-team-size`,
        question: 'How many people are in your team?',
        answer: `Our team has ${project.teamSize} people working on this project. We work closely together to ensure successful delivery.`,
        voiceAnswer: `Our team has ${project.teamSize} people.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['team', 'people', 'how many', 'size', 'members'],
        category: 'general',
        priority: 2
      });
    }

    // Systems Information
    if (project.systemsUsed && project.systemsUsed.length > 0) {
      responses.push({
        id: `${project.id}-systems`,
        question: 'What systems do you use?',
        answer: `We currently use ${project.systemsUsed.join(', ')}. These systems don't integrate well, which is part of the problem we're solving.`,
        voiceAnswer: `We use ${project.systemsUsed.join(', ')}.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['systems', 'tools', 'software', 'platforms', 'applications'],
        category: 'general',
        priority: 2
      });
    }

    // Role-Specific Responses
    project.stakeholders?.forEach(stakeholder => {
      responses.push({
        id: `${project.id}-role-${stakeholder.role}`,
        question: 'What is your role in this project?',
        answer: `As ${stakeholder.role}, I'm responsible for ${stakeholder.responsibilities.join(', ')}. I work closely with the team to ensure project success.`,
        voiceAnswer: `I'm ${stakeholder.role}, responsible for ${stakeholder.responsibilities.join(', ')}.`,
        stakeholderRoles: [stakeholder.role],
        keywords: ['role', 'responsibility', 'job', 'position', 'function'],
        category: 'general',
        priority: 2
      });
    });

    // Greeting Responses
    responses.push({
      id: `${project.id}-greeting`,
      question: 'hi',
      answer: `Hello! I'm here to discuss our ${project.name} project. How can I help you understand our current situation and improvement plans?`,
      voiceAnswer: `Hello! I'm here to discuss our ${project.name} project.`,
      stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
      keywords: ['hi', 'hello', 'hey', 'greetings'],
      category: 'greeting',
      priority: 3
    });

    responses.push({
      id: `${project.id}-how-are-you`,
      question: 'how are you',
      answer: `I'm doing well, thank you! I'm ready to discuss our ${project.name} project and the improvements we're working on.`,
      voiceAnswer: `I'm doing well, ready to discuss our project.`,
      stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
      keywords: ['how are you', 'how are things', 'how is it going'],
      category: 'greeting',
      priority: 3
    });

    // Farewell Responses
    responses.push({
      id: `${project.id}-farewell`,
      question: 'goodbye',
      answer: `Thank you for the discussion about our ${project.name} project. I'm looking forward to implementing these improvements.`,
      voiceAnswer: `Thank you for the discussion.`,
      stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
      keywords: ['goodbye', 'bye', 'see you', 'thanks', 'thank you'],
      category: 'farewell',
      priority: 3
    });

    // Clarification Responses
    responses.push({
      id: `${project.id}-clarification`,
      question: 'clarification',
      answer: `Let me clarify that in the context of our ${project.name} project. The key issue is ${project.problemStatement || 'improving our current processes'}.`,
      voiceAnswer: `Let me clarify that in the context of our project.`,
      stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
      keywords: ['clarify', 'explain', 'don\'t understand', 'what do you mean'],
      category: 'clarification',
      priority: 4
    });

    // Emergency Fallback Responses
    responses.push({
      id: `${project.id}-emergency`,
      question: 'emergency',
      answer: `I can help you understand our ${project.name} project. We're working on ${project.problemStatement || 'improving our processes'}. What specific aspect would you like to discuss?`,
      voiceAnswer: `I can help you understand our ${project.name} project.`,
      stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
      keywords: ['emergency'],
      category: 'general',
      priority: 5
    });

    return {
      projectId: project.id,
      projectName: project.name,
      responses
    };
  }

  // Set knowledge base for a project
  public setProjectKnowledgeBase(project: ProjectContext): void {
    const knowledgeBase = this.generateKnowledgeBaseFromProject(project);
    this.projectKnowledgeBases.set(project.id, knowledgeBase);
    console.log(`✅ KNOWLEDGE BASE: Generated ${knowledgeBase.responses.length} responses for ${project.name}`);
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

    // Generate knowledge base if it doesn't exist
    if (!this.projectKnowledgeBases.has(projectContext.id)) {
      this.setProjectKnowledgeBase(projectContext);
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
      .replace('{project.painPoints}', project.painPoints?.join(', ') || 'current challenges')
      .replace('{project.currentProcess}', project.asIsProcess || 'current process');

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

