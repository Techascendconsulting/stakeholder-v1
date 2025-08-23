interface QuestionSuggestion {
  id: string;
  text: string;
  category: 'greeting' | 'context' | 'analysis' | 'process' | 'stakeholders' | 'goals' | 'challenges' | 'solutions' | 'next_steps';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  context: string;
}

interface ConversationStage {
  stage: 'introduction' | 'problem_understanding' | 'process_analysis' | 'stakeholder_mapping' | 'solution_brainstorming' | 'implementation_planning';
  progress: number; // 0-100
}

class QuestionSuggestionsService {
  private static instance: QuestionSuggestionsService;
  private currentStage: ConversationStage = {
    stage: 'introduction',
    progress: 0
  };

  private constructor() {}

  public static getInstance(): QuestionSuggestionsService {
    if (!QuestionSuggestionsService.instance) {
      QuestionSuggestionsService.instance = new QuestionSuggestionsService();
    }
    return QuestionSuggestionsService.instance;
  }

  // Get contextual question suggestions based on conversation stage
  public getQuestionSuggestions(
    conversationHistory: Array<{ role: string; content: string }>,
    stakeholderContext?: any
  ): QuestionSuggestion[] {
    // Check if we have a specific stage from stakeholderContext
    const selectedStage = stakeholderContext?.stage;
    
    if (selectedStage) {
      // Use the selected stage directly
      this.currentStage = { stage: selectedStage, progress: 0 };
    } else {
      // Fall back to conversation analysis
      this.updateConversationStage(conversationHistory);
    }
    
    const suggestions: QuestionSuggestion[] = [];
    
    switch (this.currentStage.stage) {
      case 'introduction':
      case 'kickoff':
        suggestions.push(...this.getIntroductionQuestions());
        break;
      case 'problem_understanding':
      case 'discovery':
        suggestions.push(...this.getProblemUnderstandingQuestions());
        break;
      case 'process_analysis':
      case 'as_is':
        suggestions.push(...this.getProcessAnalysisQuestions());
        break;
      case 'stakeholder_mapping':
        suggestions.push(...this.getStakeholderMappingQuestions());
        break;
      case 'solution_brainstorming':
      case 'solution':
        suggestions.push(...this.getSolutionBrainstormingQuestions());
        break;
      case 'implementation_planning':
      case 'closure':
        suggestions.push(...this.getImplementationPlanningQuestions());
        break;
      case 'to_be':
        suggestions.push(...this.getToBeDiscussionQuestions());
        break;
      default:
        // Fallback to introduction questions
        suggestions.push(...this.getIntroductionQuestions());
    }

    // Add stakeholder-specific questions if available
    if (stakeholderContext && !selectedStage) {
      suggestions.push(...this.getStakeholderSpecificQuestions(stakeholderContext));
    }

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  }

  private updateConversationStage(history: Array<{ role: string; content: string }>) {
    const userMessages = history.filter(msg => msg.role === 'user').map(msg => msg.content.toLowerCase());
    
    // Analyze conversation to determine stage
    if (userMessages.length === 0) {
      this.currentStage = { stage: 'introduction', progress: 0 };
      return;
    }

    // Check for problem understanding keywords
    if (userMessages.some(msg => 
      msg.includes('problem') || msg.includes('challenge') || msg.includes('issue') || 
      msg.includes('pain point') || msg.includes('difficulty')
    )) {
      this.currentStage = { stage: 'problem_understanding', progress: 30 };
    }

    // Check for process analysis keywords
    if (userMessages.some(msg => 
      msg.includes('process') || msg.includes('workflow') || msg.includes('step') || 
      msg.includes('how does') || msg.includes('current')
    )) {
      this.currentStage = { stage: 'process_analysis', progress: 50 };
    }

    // Check for stakeholder keywords
    if (userMessages.some(msg => 
      msg.includes('stakeholder') || msg.includes('team') || msg.includes('department') || 
      msg.includes('who') || msg.includes('responsible')
    )) {
      this.currentStage = { stage: 'stakeholder_mapping', progress: 70 };
    }

    // Check for solution keywords
    if (userMessages.some(msg => 
      msg.includes('solution') || msg.includes('improve') || msg.includes('fix') || 
      msg.includes('optimize') || msg.includes('better')
    )) {
      this.currentStage = { stage: 'solution_brainstorming', progress: 85 };
    }

    // Check for implementation keywords
    if (userMessages.some(msg => 
      msg.includes('implement') || msg.includes('plan') || msg.includes('timeline') || 
      msg.includes('next step') || msg.includes('action')
    )) {
      this.currentStage = { stage: 'implementation_planning', progress: 95 };
    }
  }

  private getIntroductionQuestions(): QuestionSuggestion[] {
    return [
      {
        id: 'intro-1',
        text: "What is the main business problem we're trying to solve?",
        category: 'context',
        difficulty: 'beginner',
        context: 'Start by understanding the core business challenge'
      },
      {
        id: 'intro-2',
        text: "Who are the key stakeholders involved in this project?",
        category: 'stakeholders',
        difficulty: 'beginner',
        context: 'Identify the people and teams affected'
      },
      {
        id: 'intro-3',
        text: "What are the current pain points customers are experiencing?",
        category: 'challenges',
        difficulty: 'beginner',
        context: 'Understand customer perspective and frustrations'
      },
      {
        id: 'intro-4',
        text: "What are our business goals for this project?",
        category: 'goals',
        difficulty: 'beginner',
        context: 'Define success criteria and objectives'
      },
      {
        id: 'intro-5',
        text: "How long does the current process take?",
        category: 'process',
        difficulty: 'beginner',
        context: 'Establish baseline metrics'
      },
      {
        id: 'intro-6',
        text: "What systems and tools are currently being used?",
        category: 'context',
        difficulty: 'beginner',
        context: 'Understand the technical landscape'
      },
      {
        id: 'intro-7',
        text: "What specific products and services do we offer?",
        category: 'context',
        difficulty: 'beginner',
        context: 'Understand our product portfolio'
      }
    ];
  }

  private getProblemUnderstandingQuestions(): QuestionSuggestion[] {
    return [
      {
        id: 'problem-1',
        text: "What is causing the 23% customer churn rate?",
        category: 'analysis',
        difficulty: 'intermediate',
        context: 'Deep dive into customer retention issues'
      },
      {
        id: 'problem-2',
        text: "How do manual handoffs impact the customer experience?",
        category: 'process',
        difficulty: 'intermediate',
        context: 'Analyze process inefficiencies'
      },
      {
        id: 'problem-3',
        text: "What is the financial impact of the current inefficiencies?",
        category: 'analysis',
        difficulty: 'intermediate',
        context: 'Quantify the business impact'
      },
      {
        id: 'problem-4',
        text: "Why is our onboarding taking 6-8 weeks vs competitors' 3-4 weeks?",
        category: 'analysis',
        difficulty: 'intermediate',
        context: 'Benchmark against industry standards'
      },
      {
        id: 'problem-5',
        text: "How do the 4 disconnected systems create bottlenecks?",
        category: 'process',
        difficulty: 'intermediate',
        context: 'Identify technical integration issues'
      },
      {
        id: 'problem-6',
        text: "What customer feedback indicates the biggest pain points?",
        category: 'challenges',
        difficulty: 'intermediate',
        context: 'Gather customer insights'
      },
      {
        id: 'problem-7',
        text: "What challenges do teams currently face?",
        category: 'challenges',
        difficulty: 'beginner',
        context: 'Understand team-level pain points'
      },
      {
        id: 'problem-8',
        text: "Where are the most bottlenecks in the process?",
        category: 'analysis',
        difficulty: 'intermediate',
        context: 'Identify specific bottleneck points'
      },
      {
        id: 'problem-9',
        text: "How many stages do we have in the process?",
        category: 'process',
        difficulty: 'beginner',
        context: 'Understand process complexity'
      },
      {
        id: 'problem-10',
        text: "Do we have any central system where all teams communicate about customers?",
        category: 'process',
        difficulty: 'intermediate',
        context: 'Assess system integration gaps'
      },
      {
        id: 'problem-11',
        text: "Where do our customers find us?",
        category: 'context',
        difficulty: 'beginner',
        context: 'Understand customer acquisition channels'
      }
    ];
  }

  private getProcessAnalysisQuestions(): QuestionSuggestion[] {
    return [
      {
        id: 'process-1',
        text: "What's the current process?",
        category: 'process',
        difficulty: 'beginner',
        context: 'Get an overview of the current onboarding workflow'
      },
      {
        id: 'process-2',
        text: "Can you walk me through the current 10-step onboarding process?",
        category: 'process',
        difficulty: 'intermediate',
        context: 'Map out the complete current workflow'
      },
      {
        id: 'process-3',
        text: "Where do the biggest delays occur in the process?",
        category: 'analysis',
        difficulty: 'intermediate',
        context: 'Identify bottleneck points'
      },
      {
        id: 'process-4',
        text: "How do teams communicate during handoffs?",
        category: 'process',
        difficulty: 'intermediate',
        context: 'Understand communication gaps'
      },
      {
        id: 'process-5',
        text: "What happens when UAT testing fails?",
        category: 'process',
        difficulty: 'advanced',
        context: 'Analyze failure scenarios'
      },
      {
        id: 'process-6',
        text: "How is progress tracked throughout the process?",
        category: 'process',
        difficulty: 'intermediate',
        context: 'Identify tracking mechanisms'
      },
      {
        id: 'process-7',
        text: "What are the escalation procedures when issues arise?",
        category: 'process',
        difficulty: 'advanced',
        context: 'Understand issue resolution'
      }
    ];
  }

  private getStakeholderMappingQuestions(): QuestionSuggestion[] {
    return [
      {
        id: 'stakeholder-1',
        text: "What is each department's role in the onboarding process?",
        category: 'stakeholders',
        difficulty: 'intermediate',
        context: 'Map department responsibilities'
      },
      {
        id: 'stakeholder-2',
        text: "Who owns the overall customer experience?",
        category: 'stakeholders',
        difficulty: 'intermediate',
        context: 'Identify accountability'
      },
      {
        id: 'stakeholder-3',
        text: "How do Sales and Implementation teams coordinate?",
        category: 'stakeholders',
        difficulty: 'intermediate',
        context: 'Understand team collaboration'
      },
      {
        id: 'stakeholder-4',
        text: "What are the IT team's technical requirements?",
        category: 'stakeholders',
        difficulty: 'advanced',
        context: 'Gather technical constraints'
      },
      {
        id: 'stakeholder-5',
        text: "How does Customer Success get involved?",
        category: 'stakeholders',
        difficulty: 'intermediate',
        context: 'Define handoff responsibilities'
      },
      {
        id: 'stakeholder-6',
        text: "What are the customer's expectations from each team?",
        category: 'stakeholders',
        difficulty: 'advanced',
        context: 'Align customer expectations'
      }
    ];
  }

  private getSolutionBrainstormingQuestions(): QuestionSuggestion[] {
    return [
      {
        id: 'solution-1',
        text: "How can we reduce onboarding time from 6-8 to 3-4 weeks?",
        category: 'solutions',
        difficulty: 'advanced',
        context: 'Focus on timeline optimization'
      },
      {
        id: 'solution-2',
        text: "What would a centralized onboarding platform look like?",
        category: 'solutions',
        difficulty: 'advanced',
        context: 'Design system architecture'
      },
      {
        id: 'solution-3',
        text: "How can we automate manual handoffs?",
        category: 'solutions',
        difficulty: 'advanced',
        context: 'Identify automation opportunities'
      },
      {
        id: 'solution-4',
        text: "What customer-facing dashboard features would be most valuable?",
        category: 'solutions',
        difficulty: 'intermediate',
        context: 'Design customer experience'
      },
      {
        id: 'solution-5',
        text: "How can we standardize communication across teams?",
        category: 'solutions',
        difficulty: 'intermediate',
        context: 'Improve coordination'
      },
      {
        id: 'solution-6',
        text: "What metrics should we track to measure success?",
        category: 'solutions',
        difficulty: 'intermediate',
        context: 'Define KPIs'
      }
    ];
  }

  private getToBeDiscussionQuestions(): QuestionSuggestion[] {
    return [
      {
        id: 'tobe-1',
        text: "What would an ideal future state look like for this process?",
        category: 'goals',
        difficulty: 'intermediate',
        context: 'Explore future vision'
      },
      {
        id: 'tobe-2',
        text: "What improvements would make the biggest impact?",
        category: 'goals',
        difficulty: 'intermediate',
        context: 'Identify high-impact changes'
      },
      {
        id: 'tobe-3',
        text: "What are the key outcomes you want to achieve?",
        category: 'goals',
        difficulty: 'intermediate',
        context: 'Define success criteria'
      },
      {
        id: 'tobe-4',
        text: "How would you measure success in the future state?",
        category: 'goals',
        difficulty: 'intermediate',
        context: 'Define metrics'
      },
      {
        id: 'tobe-5',
        text: "What capabilities do you need that you don't have now?",
        category: 'goals',
        difficulty: 'advanced',
        context: 'Identify gaps'
      },
      {
        id: 'tobe-6',
        text: "What would be different in an optimized process?",
        category: 'goals',
        difficulty: 'intermediate',
        context: 'Envision improvements'
      }
    ];
  }

  private getImplementationPlanningQuestions(): QuestionSuggestion[] {
    return [
      {
        id: 'implementation-1',
        text: "What is the implementation timeline and milestones?",
        category: 'next_steps',
        difficulty: 'advanced',
        context: 'Create project roadmap'
      },
      {
        id: 'implementation-2',
        text: "What resources and budget are needed?",
        category: 'next_steps',
        difficulty: 'advanced',
        context: 'Plan resource allocation'
      },
      {
        id: 'implementation-3',
        text: "How will we manage the transition from old to new process?",
        category: 'next_steps',
        difficulty: 'advanced',
        context: 'Plan change management'
      },
      {
        id: 'implementation-4',
        text: "What training will teams need?",
        category: 'next_steps',
        difficulty: 'intermediate',
        context: 'Plan team readiness'
      },
      {
        id: 'implementation-5',
        text: "How will we measure and track progress?",
        category: 'next_steps',
        difficulty: 'intermediate',
        context: 'Set up monitoring'
      },
      {
        id: 'implementation-6',
        text: "What are the risks and mitigation strategies?",
        category: 'next_steps',
        difficulty: 'advanced',
        context: 'Risk assessment'
      }
    ];
  }

  private getStakeholderSpecificQuestions(stakeholderContext: any): QuestionSuggestion[] {
    const role = stakeholderContext.role?.toLowerCase() || '';
    const name = stakeholderContext.name || '';

    const stakeholderQuestions: QuestionSuggestion[] = [];

    if (role.includes('sales')) {
      stakeholderQuestions.push({
        id: 'sales-1',
        text: `What information does ${name} need to pass to Implementation?`,
        category: 'stakeholders',
        difficulty: 'intermediate',
        context: 'Improve handoff quality'
      });
    }

    if (role.includes('implementation') || role.includes('project')) {
      stakeholderQuestions.push({
        id: 'impl-1',
        text: `How can ${name} better coordinate with IT and Product teams?`,
        category: 'stakeholders',
        difficulty: 'intermediate',
        context: 'Improve cross-team coordination'
      });
    }

    if (role.includes('customer success')) {
      stakeholderQuestions.push({
        id: 'cs-1',
        text: `What does ${name} need from the onboarding process to succeed?`,
        category: 'stakeholders',
        difficulty: 'intermediate',
        context: 'Optimize handoff to CS'
      });
    }

    return stakeholderQuestions;
  }

  // Get current conversation stage
  public getCurrentStage(): ConversationStage {
    return { ...this.currentStage };
  }

  // Reset conversation stage
  public resetStage(): void {
    this.currentStage = { stage: 'introduction', progress: 0 };
  }
}

export default QuestionSuggestionsService;
export type { QuestionSuggestion, ConversationStage };
