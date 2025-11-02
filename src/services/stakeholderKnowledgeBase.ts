// Auto-Generated Project-Specific Stakeholder Knowledge Base System
// Generates comprehensive knowledge base from project brief data

interface StakeholderResponse {
  id: string;
  question: string;
  answer: string;
  voiceAnswer?: string; // Short version for ElevenLabs
  stakeholderRoles: string[];
  keywords: string[];
  category: 'as-is' | 'to-be' | 'greeting' | 'farewell' | 'clarification' | 'general' | 'explanation' | 'process' | 'role-specific';
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
    
    // GREETING Responses
    responses.push({
      id: `${project.id}-greeting-hi`,
      question: 'hi',
      answer: `Hi! I'm ready to discuss our ${project.name} project. How can I help you today?`,
      voiceAnswer: `Hi! I'm ready to discuss our ${project.name} project.`,
      stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
      keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon'],
      category: 'greeting',
      priority: 1
    });

    // Note: Removed hardcoded "how are you" response - will use AI generation instead

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

      // Create specific explanations for each pain point
      project.painPoints.forEach((painPoint, index) => {
        const explanation = this.generatePainPointExplanation(painPoint, project);
        responses.push({
          id: `${project.id}-pain-point-${index}`,
          question: `what do we mean by ${painPoint}`,
          answer: explanation,
          voiceAnswer: explanation.substring(0, 150) + (explanation.length > 150 ? '...' : ''),
          stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
          keywords: [painPoint.toLowerCase(), 'what do we mean', 'explain', 'clarify'],
          category: 'explanation',
          priority: 1
        });
      });

      // Add impact analysis responses
      responses.push({
        id: `${project.id}-impact-analysis`,
        question: 'how do they impact efficiency and experience',
        answer: `These pain points impact us in several ways: Manual data entry slows down our operations and creates errors that require rework. Delayed handoffs mean customers wait longer for service, and our team has to chase down information. This creates a poor customer experience and reduces our overall efficiency. We're spending more time fixing problems than serving customers.`,
        voiceAnswer: `These pain points slow down our operations and create errors. Delayed handoffs mean customers wait longer, and we spend more time fixing problems than serving customers.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['impact', 'efficiency', 'experience', 'how do they', 'affect', 'consequences'],
        category: 'as-is',
        priority: 1
      });

      responses.push({
        id: `${project.id}-impact-details`,
        question: 'what are the consequences',
        answer: `The consequences are significant: Customer satisfaction drops because they experience delays and errors. Our team gets frustrated with repetitive manual work and constant firefighting. We lose revenue opportunities due to slow response times. And our reputation suffers when customers have poor experiences. It's a cycle that gets worse over time.`,
        voiceAnswer: `Customer satisfaction drops due to delays and errors. Our team gets frustrated with manual work. We lose revenue opportunities and our reputation suffers.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['consequences', 'results', 'outcomes', 'what happens', 'effects'],
        category: 'as-is',
        priority: 2
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

      // Create detailed process explanation
      responses.push({
        id: `${project.id}-process-details`,
        question: 'Can you explain the current process in detail?',
        answer: `Let me break down our current process: ${project.asIsProcess}. This involves multiple steps and handoffs between departments, which is where we're seeing the delays.`,
        voiceAnswer: `Our current process involves ${project.asIsProcess}.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['explain process', 'process details', 'break down', 'steps'],
        category: 'process',
        priority: 2
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
        question: 'What will the new process look like?',
        answer: `Our improved process will be: ${project.toBeProcess}. This should eliminate the current pain points and improve efficiency.`,
        voiceAnswer: `Our improved process will be ${project.toBeProcess}.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['new process', 'future process', 'improved', 'will be', 'to-be'],
        category: 'to-be',
        priority: 1
      });
    }

    if (project.businessGoals && project.businessGoals.length > 0) {
      responses.push({
        id: `${project.id}-business-goals`,
        question: 'What are our business goals?',
        answer: `Our business goals for this project are: ${project.businessGoals.join(', ')}. These align with our overall strategy.`,
        voiceAnswer: `Our business goals are ${project.businessGoals.join(', ')}.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['goals', 'objectives', 'targets', 'aims', 'business goals'],
        category: 'to-be',
        priority: 1
      });
    }

    // ROLE-SPECIFIC Responses
    if (project.stakeholders) {
      project.stakeholders.forEach((stakeholder, index) => {
        responses.push({
          id: `${project.id}-role-${index}`,
          question: `What does the ${stakeholder.role} do?`,
          answer: `As ${stakeholder.role} in ${stakeholder.department}, I'm responsible for ${stakeholder.responsibilities.join(', ')}. In this ${project.name} project, I focus on ensuring our processes align with our department's needs.`,
          voiceAnswer: `As ${stakeholder.role}, I'm responsible for ${stakeholder.responsibilities.join(', ')}.`,
          stakeholderRoles: [stakeholder.role],
          keywords: ['what does', 'role', 'responsibilities', 'do', stakeholder.role.toLowerCase()],
          category: 'role-specific',
          priority: 1
        });
      });
    }

    // GENERAL Project Information
    if (project.teamSize) {
      responses.push({
        id: `${project.id}-team-size`,
        question: 'How big is the team?',
        answer: `Our team for the ${project.name} project consists of ${project.teamSize} people across different departments.`,
        voiceAnswer: `Our team has ${project.teamSize} people.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['team size', 'how many people', 'team members', 'headcount'],
        category: 'general',
        priority: 2
      });
    }

    if (project.systemsUsed && project.systemsUsed.length > 0) {
      responses.push({
        id: `${project.id}-systems`,
        question: 'What systems do we use?',
        answer: `We currently use ${project.systemsUsed.join(', ')} in our operations. These systems are part of what we're looking to improve.`,
        voiceAnswer: `We use ${project.systemsUsed.join(', ')}.`,
        stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
        keywords: ['systems', 'tools', 'software', 'applications', 'platforms'],
        category: 'general',
        priority: 2
      });
    }

    // CLARIFICATION Responses
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

    // FAREWELL Responses
    responses.push({
      id: `${project.id}-farewell`,
      question: 'goodbye',
      answer: `Thanks for the discussion about our ${project.name} project. Let me know if you need anything else!`,
      voiceAnswer: `Thanks for the discussion. Let me know if you need anything else!`,
      stakeholderRoles: project.stakeholders?.map(s => s.role) || [],
      keywords: ['goodbye', 'bye', 'see you', 'thanks', 'thank you'],
      category: 'farewell',
      priority: 3
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

  // Generate specific explanations for pain points
  private generatePainPointExplanation(painPoint: string, project: ProjectContext): string {
    const lowerPainPoint = painPoint.toLowerCase();
    
    // Let OpenAI generate contextual explanations instead of hardcoded responses
    return '';
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
    
    // First, try to find exact question matches
    let response = projectKB.responses.find(response => {
      const lowerResponseQuestion = response.question.toLowerCase();
      return lowerQuestion === lowerResponseQuestion || 
             lowerQuestion.includes(lowerResponseQuestion) ||
             lowerResponseQuestion.includes(lowerQuestion);
    });
    
    if (response) return response;
    
    // If no exact match, look for explanation questions (what do we mean by X)
    if (lowerQuestion.includes('what do we mean by') || lowerQuestion.includes('what does') || lowerQuestion.includes('explain')) {
      // Extract the term being asked about
      const termMatch = lowerQuestion.match(/what do we mean by (.+)/) || 
                       lowerQuestion.match(/what does (.+) mean/) ||
                       lowerQuestion.match(/explain (.+)/);
      
      if (termMatch) {
        const term = termMatch[1].trim();
        // Look for responses that explain this specific term
        response = projectKB.responses.find(response => {
          const lowerResponseQuestion = response.question.toLowerCase();
          return lowerResponseQuestion.includes(term) || 
                 response.keywords.some(keyword => keyword.toLowerCase().includes(term));
        });
        
        if (response) return response;
      }
    }
    
    return null;
  }

  // Layer 2: Role-specific match within project
  private findRoleMatch(
    question: string,
    role: string,
    projectKB: ProjectKnowledgeBase
  ): StakeholderResponse | null {
    const lowerQuestion = question.toLowerCase();
    const lowerRole = role.toLowerCase();
    
    return projectKB.responses.find(response => {
      // Check if response is for this specific role and question matches keywords
      const isRoleMatch = response.stakeholderRoles.some(r => r.toLowerCase().includes(lowerRole));
      const hasKeywordMatch = response.keywords.some(keyword => 
        lowerQuestion.includes(keyword.toLowerCase())
      );
      return isRoleMatch && hasKeywordMatch;
    }) || null;
  }

  // Layer 3: Topic-based match within project
  private findTopicMatch(
    question: string,
    role: string,
    projectKB: ProjectKnowledgeBase
  ): StakeholderResponse | null {
    const lowerQuestion = question.toLowerCase();
    
    return projectKB.responses.find(response => {
      // Check if any keywords match the question
      return response.keywords.some(keyword => 
        lowerQuestion.includes(keyword.toLowerCase())
      );
    }) || null;
  }

  // Layer 4: Generic role response within project
  private findGenericMatch(
    question: string,
    role: string,
    projectKB: ProjectKnowledgeBase
  ): StakeholderResponse | null {
    const lowerRole = role.toLowerCase();
    
    return projectKB.responses.find(response => {
      // Find a general response that includes this role
      return response.stakeholderRoles.some(r => r.toLowerCase().includes(lowerRole)) &&
             response.category === 'general';
    }) || null;
  }

  // Layer 5: Emergency fallback (NEVER FAILS)
  private getEmergencyResponse(
    role: string,
    projectKB: ProjectKnowledgeBase
  ): StakeholderResponse {
    const emergencyResponse = projectKB.responses.find(r => r.question === 'emergency');
    if (emergencyResponse) {
      return emergencyResponse;
    }
    
    // Ultimate fallback
    return {
      id: 'ultimate-fallback',
      question: 'fallback',
      answer: `I can help you with our ${projectKB.projectName} project. What would you like to know?`,
      voiceAnswer: `I can help you with our ${projectKB.projectName} project.`,
      stakeholderRoles: [],
      keywords: [],
      category: 'general',
      priority: 5
    };
  }

  // Inject project context into response
  private injectProjectContext(
    response: StakeholderResponse,
    projectContext: ProjectContext
  ): StakeholderResponse {
    let answer = response.answer;
    let voiceAnswer = response.voiceAnswer;
    
    // Replace placeholders with actual project data
    if (projectContext.name) {
      answer = answer.replace(/\{project\.name\}/g, projectContext.name);
      if (voiceAnswer) {
        voiceAnswer = voiceAnswer.replace(/\{project\.name\}/g, projectContext.name);
      }
    }
    
    if (projectContext.problemStatement) {
      answer = answer.replace(/\{project\.problemStatement\}/g, projectContext.problemStatement);
      if (voiceAnswer) {
        voiceAnswer = voiceAnswer.replace(/\{project\.problemStatement\}/g, projectContext.problemStatement);
      }
    }
    
    if (projectContext.painPoints) {
      const painPointsText = projectContext.painPoints.join(', ');
      answer = answer.replace(/\{project\.painPoints\}/g, painPointsText);
      if (voiceAnswer) {
        voiceAnswer = voiceAnswer.replace(/\{project\.painPoints\}/g, painPointsText);
      }
    }
    
    if (projectContext.asIsProcess) {
      answer = answer.replace(/\{project\.asIsProcess\}/g, projectContext.asIsProcess);
      if (voiceAnswer) {
        voiceAnswer = voiceAnswer.replace(/\{project\.asIsProcess\}/g, projectContext.asIsProcess);
      }
    }
    
    return {
      ...response,
      answer,
      voiceAnswer
    };
  }

  // Get available roles for a project
  public getAvailableRoles(projectId: string): string[] {
    const projectKB = this.projectKnowledgeBases.get(projectId);
    if (!projectKB) return [];
    
    const roles = new Set<string>();
    projectKB.responses.forEach(response => {
      response.stakeholderRoles.forEach(role => roles.add(role));
    });
    
    return Array.from(roles);
  }

  // Get knowledge base stats
  public getStats(projectId: string): { totalResponses: number; categories: Record<string, number> } {
    const projectKB = this.projectKnowledgeBases.get(projectId);
    if (!projectKB) return { totalResponses: 0, categories: {} };
    
    const categories: Record<string, number> = {};
    projectKB.responses.forEach(response => {
      categories[response.category] = (categories[response.category] || 0) + 1;
    });
    
    return {
      totalResponses: projectKB.responses.length,
      categories
    };
  }
}

export default StakeholderKnowledgeBase;
export type { ProjectContext, StakeholderResponse };

