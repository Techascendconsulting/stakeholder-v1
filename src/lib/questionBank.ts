// questionBank.ts - Dynamic question generation system

export interface QuestionTemplate {
  id: string
  category: 'as-is' | 'to-be' | 'general'
  stakeholderRoles: string[] // Empty array means applies to all roles
  projectTypes: string[] // Empty array means applies to all projects
  question: string
  tags: string[]
  priority: 'high' | 'medium' | 'low'
}

export const questionTemplates: QuestionTemplate[] = [
  // As-Is Questions - Operations Focus
  {
    id: 'ops-current-process',
    category: 'as-is',
    stakeholderRoles: ['Head of Operations', 'Operations Manager'],
    projectTypes: [],
    question: 'Can you walk me through the current {projectName} process from an operational perspective?',
    tags: ['process', 'workflow', 'operations'],
    priority: 'high'
  },
  {
    id: 'ops-bottlenecks',
    category: 'as-is',
    stakeholderRoles: ['Head of Operations', 'Operations Manager'],
    projectTypes: [],
    question: 'Where do you see the biggest operational bottlenecks in the current system?',
    tags: ['bottlenecks', 'efficiency', 'operations'],
    priority: 'high'
  },
  {
    id: 'ops-resource-allocation',
    category: 'as-is',
    stakeholderRoles: ['Head of Operations'],
    projectTypes: [],
    question: 'How are resources currently allocated for this process, and where do you see inefficiencies?',
    tags: ['resources', 'allocation', 'efficiency'],
    priority: 'medium'
  },

  // As-Is Questions - Customer Service Focus
  {
    id: 'cs-customer-impact',
    category: 'as-is',
    stakeholderRoles: ['Customer Service Manager', 'Customer Support'],
    projectTypes: [],
    question: 'How does the current {projectName} process impact customer satisfaction and service delivery?',
    tags: ['customer', 'satisfaction', 'service'],
    priority: 'high'
  },
  {
    id: 'cs-complaint-patterns',
    category: 'as-is',
    stakeholderRoles: ['Customer Service Manager'],
    projectTypes: [],
    question: 'What are the most common customer complaints related to this process?',
    tags: ['complaints', 'customer', 'issues'],
    priority: 'high'
  },
  {
    id: 'cs-response-times',
    category: 'as-is',
    stakeholderRoles: ['Customer Service Manager', 'Customer Support'],
    projectTypes: [],
    question: 'What are the current response times, and how do they compare to customer expectations?',
    tags: ['response-time', 'performance', 'expectations'],
    priority: 'medium'
  },

  // As-Is Questions - IT Focus
  {
    id: 'it-system-limitations',
    category: 'as-is',
    stakeholderRoles: ['IT Systems Lead', 'Technical Lead', 'IT Manager'],
    projectTypes: [],
    question: 'What are the current technical limitations and constraints in the existing system?',
    tags: ['technical', 'limitations', 'constraints'],
    priority: 'high'
  },
  {
    id: 'it-integration-challenges',
    category: 'as-is',
    stakeholderRoles: ['IT Systems Lead', 'Technical Lead'],
    projectTypes: [],
    question: 'What integration challenges do you face with the current {projectName} system?',
    tags: ['integration', 'technical', 'challenges'],
    priority: 'high'
  },
  {
    id: 'it-maintenance-overhead',
    category: 'as-is',
    stakeholderRoles: ['IT Systems Lead', 'IT Manager'],
    projectTypes: [],
    question: 'How much time and resources are spent on maintaining the current system?',
    tags: ['maintenance', 'resources', 'overhead'],
    priority: 'medium'
  },

  // As-Is Questions - HR Focus
  {
    id: 'hr-training-requirements',
    category: 'as-is',
    stakeholderRoles: ['HR Business Partner', 'HR Manager'],
    projectTypes: [],
    question: 'What training is currently required for employees to use this process effectively?',
    tags: ['training', 'employees', 'skills'],
    priority: 'medium'
  },
  {
    id: 'hr-change-resistance',
    category: 'as-is',
    stakeholderRoles: ['HR Business Partner'],
    projectTypes: [],
    question: 'Have you observed any resistance to the current process from employees?',
    tags: ['resistance', 'change', 'employees'],
    priority: 'medium'
  },

  // As-Is Questions - Compliance Focus
  {
    id: 'compliance-regulatory-requirements',
    category: 'as-is',
    stakeholderRoles: ['Compliance and Risk Manager', 'Compliance Officer'],
    projectTypes: [],
    question: 'What regulatory requirements must the current {projectName} process comply with?',
    tags: ['regulatory', 'compliance', 'requirements'],
    priority: 'high'
  },
  {
    id: 'compliance-audit-findings',
    category: 'as-is',
    stakeholderRoles: ['Compliance and Risk Manager'],
    projectTypes: [],
    question: 'Have there been any compliance issues or audit findings related to this process?',
    tags: ['audit', 'compliance', 'issues'],
    priority: 'high'
  },

  // To-Be Questions - Operations Focus
  {
    id: 'ops-ideal-workflow',
    category: 'to-be',
    stakeholderRoles: ['Head of Operations', 'Operations Manager'],
    projectTypes: [],
    question: 'What would an ideal {projectName} workflow look like from an operational standpoint?',
    tags: ['ideal', 'workflow', 'operations'],
    priority: 'high'
  },
  {
    id: 'ops-automation-opportunities',
    category: 'to-be',
    stakeholderRoles: ['Head of Operations'],
    projectTypes: [],
    question: 'Which parts of the process would you like to see automated or streamlined?',
    tags: ['automation', 'streamline', 'efficiency'],
    priority: 'high'
  },
  {
    id: 'ops-performance-metrics',
    category: 'to-be',
    stakeholderRoles: ['Head of Operations', 'Operations Manager'],
    projectTypes: [],
    question: 'What key performance indicators would you use to measure success of the new process?',
    tags: ['kpi', 'metrics', 'success'],
    priority: 'medium'
  },

  // To-Be Questions - Customer Service Focus
  {
    id: 'cs-customer-experience',
    category: 'to-be',
    stakeholderRoles: ['Customer Service Manager', 'Customer Support'],
    projectTypes: [],
    question: 'How should the new {projectName} process improve the customer experience?',
    tags: ['customer-experience', 'improvement', 'service'],
    priority: 'high'
  },
  {
    id: 'cs-self-service',
    category: 'to-be',
    stakeholderRoles: ['Customer Service Manager'],
    projectTypes: [],
    question: 'What self-service capabilities would you like customers to have?',
    tags: ['self-service', 'customer', 'capabilities'],
    priority: 'medium'
  },

  // To-Be Questions - IT Focus
  {
    id: 'it-technical-requirements',
    category: 'to-be',
    stakeholderRoles: ['IT Systems Lead', 'Technical Lead'],
    projectTypes: [],
    question: 'What are your technical requirements and preferences for the new system?',
    tags: ['technical', 'requirements', 'system'],
    priority: 'high'
  },
  {
    id: 'it-integration-needs',
    category: 'to-be',
    stakeholderRoles: ['IT Systems Lead', 'Technical Lead'],
    projectTypes: [],
    question: 'Which systems should the new {projectName} solution integrate with?',
    tags: ['integration', 'systems', 'connectivity'],
    priority: 'high'
  },
  {
    id: 'it-scalability',
    category: 'to-be',
    stakeholderRoles: ['IT Systems Lead', 'IT Manager'],
    projectTypes: [],
    question: 'What scalability and performance requirements do you have for the future system?',
    tags: ['scalability', 'performance', 'future'],
    priority: 'medium'
  },

  // To-Be Questions - HR Focus
  {
    id: 'hr-training-strategy',
    category: 'to-be',
    stakeholderRoles: ['HR Business Partner', 'HR Manager'],
    projectTypes: [],
    question: 'What training and change management approach would work best for this implementation?',
    tags: ['training', 'change-management', 'implementation'],
    priority: 'high'
  },
  {
    id: 'hr-user-adoption',
    category: 'to-be',
    stakeholderRoles: ['HR Business Partner'],
    projectTypes: [],
    question: 'How can we ensure high user adoption and minimize resistance to the new process?',
    tags: ['adoption', 'resistance', 'users'],
    priority: 'medium'
  },

  // To-Be Questions - Compliance Focus
  {
    id: 'compliance-future-requirements',
    category: 'to-be',
    stakeholderRoles: ['Compliance and Risk Manager', 'Compliance Officer'],
    projectTypes: [],
    question: 'How should the new system address current and future compliance requirements?',
    tags: ['compliance', 'future', 'requirements'],
    priority: 'high'
  },
  {
    id: 'compliance-risk-mitigation',
    category: 'to-be',
    stakeholderRoles: ['Compliance and Risk Manager'],
    projectTypes: [],
    question: 'What risk mitigation features should be built into the new {projectName} process?',
    tags: ['risk', 'mitigation', 'features'],
    priority: 'high'
  },

  // General Questions - Apply to all stakeholders
  {
    id: 'general-success-criteria',
    category: 'to-be',
    stakeholderRoles: [],
    projectTypes: [],
    question: 'How would you define success for this {projectName} initiative?',
    tags: ['success', 'criteria', 'goals'],
    priority: 'high'
  },
  {
    id: 'general-timeline',
    category: 'to-be',
    stakeholderRoles: [],
    projectTypes: [],
    question: 'What timeline expectations do you have for implementing the new process?',
    tags: ['timeline', 'expectations', 'implementation'],
    priority: 'medium'
  },
  {
    id: 'general-budget-constraints',
    category: 'as-is',
    stakeholderRoles: [],
    projectTypes: [],
    question: 'Are there any budget or resource constraints we should be aware of?',
    tags: ['budget', 'constraints', 'resources'],
    priority: 'medium'
  }
]

export class QuestionBankService {
  static getQuestionsForStakeholder(
    stakeholderRole: string,
    projectName: string,
    category: 'as-is' | 'to-be' | 'all' = 'all',
    isCustomProject: boolean = false
  ): QuestionTemplate[] {
    let filteredQuestions = questionTemplates.filter(template => {
      // Check if question applies to this stakeholder role
      const roleMatch = template.stakeholderRoles.length === 0 || 
                       template.stakeholderRoles.includes(stakeholderRole)
      
      // Check category filter
      const categoryMatch = category === 'all' || template.category === category
      
      return roleMatch && categoryMatch
    })

    // Sort by priority (high first) and then by category
    filteredQuestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      return a.category.localeCompare(b.category)
    })

    // Replace placeholders in questions
    return filteredQuestions.map(template => ({
      ...template,
      question: template.question.replace('{projectName}', projectName.toLowerCase())
    }))

    // For custom projects, add dynamic questions based on project context
    if (isCustomProject) {
      const customQuestions = this.generateCustomQuestions(projectName, stakeholderRole, category)
      filteredQuestions = [...filteredQuestions, ...customQuestions]
    }

    return filteredQuestions
  }

  static generateCustomQuestions(
    projectName: string,
    stakeholderRole: string,
    category: 'as-is' | 'to-be' | 'all'
  ): QuestionTemplate[] {
    const customQuestions: QuestionTemplate[] = []

    if (category === 'as-is' || category === 'all') {
      customQuestions.push({
        id: `custom-as-is-${Date.now()}`,
        category: 'as-is',
        stakeholderRoles: [stakeholderRole],
        projectTypes: [],
        question: `From your perspective as ${stakeholderRole}, what are the main challenges with the current ${projectName.toLowerCase()} process?`,
        tags: ['custom', 'challenges', 'current-state'],
        priority: 'high'
      })
    }

    if (category === 'to-be' || category === 'all') {
      customQuestions.push({
        id: `custom-to-be-${Date.now()}`,
        category: 'to-be',
        stakeholderRoles: [stakeholderRole],
        projectTypes: [],
        question: `What would success look like for you in the improved ${projectName.toLowerCase()} process?`,
        tags: ['custom', 'success-criteria', 'future-state'],
        priority: 'high'
      })
    }

    return customQuestions
  }

  static getQuestionsByCategory(
    stakeholderRole: string,
    projectName: string
  ): { asIs: QuestionTemplate[], toBe: QuestionTemplate[] } {
    return {
      asIs: this.getQuestionsForStakeholder(stakeholderRole, projectName, 'as-is'),
      toBe: this.getQuestionsForStakeholder(stakeholderRole, projectName, 'to-be')
    }
  }

  static addCustomQuestion(template: Omit<QuestionTemplate, 'id'>): QuestionTemplate {
    const newQuestion: QuestionTemplate = {
      ...template,
      id: `custom-${Date.now()}`
    }
    questionTemplates.push(newQuestion)
    return newQuestion
  }

  static getQuestionTags(): string[] {
    const allTags = questionTemplates.flatMap(q => q.tags)
    return [...new Set(allTags)].sort()
  }

  static searchQuestions(
    searchTerm: string,
    stakeholderRole?: string,
    category?: 'as-is' | 'to-be'
  ): QuestionTemplate[] {
    const searchLower = searchTerm.toLowerCase()
    
    return questionTemplates.filter(template => {
      const textMatch = template.question.toLowerCase().includes(searchLower) ||
                       template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      
      const roleMatch = !stakeholderRole || 
                       template.stakeholderRoles.length === 0 ||
                       template.stakeholderRoles.includes(stakeholderRole)
      
      const categoryMatch = !category || template.category === category
      
      return textMatch && roleMatch && categoryMatch
    })
  }
}