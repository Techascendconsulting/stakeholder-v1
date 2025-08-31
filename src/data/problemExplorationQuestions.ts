export interface ProblemExplorationQuestions {
  primary: string[];
  dig_deeper: string[];
}

export interface ProjectQuestionBank {
  problem_exploration: ProblemExplorationQuestions;
}

export const questionBank: Record<string, ProjectQuestionBank> = {
  "customer_onboarding": {
    "problem_exploration": {
      "primary": [
        "Where do handoffs between teams usually break down?",
        "Which steps cause the most delays for customers?",
        "How do customers usually find out about their onboarding progress?",
        "Which tasks take the most manual effort from staff?"
      ],
      "dig_deeper": [
        "Could you share a recent example of a delayed onboarding and what caused it?",
        "When delays happen, who gets involved to fix them?",
        "How do these issues affect the customer's perception of TechCorp?"
      ]
    }
  },
  "digital_expense_management": {
    "problem_exploration": {
      "primary": [
        "Which parts of the expense process take the most time for employees?",
        "What makes it hard to enforce policies today?",
        "Where do most errors occur when processing expenses?",
        "How do employees feel about the current turnaround time for reimbursements?"
      ],
      "dig_deeper": [
        "Can you describe a case where an error caused delays or frustration?",
        "Which steps in the approval chain are the slowest?",
        "What do managers find most frustrating when reviewing claims?"
      ]
    }
  },
  "multi_location_inventory": {
    "problem_exploration": {
      "primary": [
        "Which products are most often out of stock or overstocked?",
        "What happens when a location runs out of stock?",
        "How do managers currently forecast demand across locations?",
        "What challenges come up when consolidating weekly inventory reports?"
      ],
      "dig_deeper": [
        "Could you give an example of when poor forecasting caused issues?",
        "Which location has the most frequent stock challenges?",
        "What do store managers do when numbers don't match actual stock?"
      ]
    }
  },
  "customer_support_tickets": {
    "problem_exploration": {
      "primary": [
        "Which types of issues take the longest to resolve?",
        "How are tickets currently assigned to agents?",
        "Where do escalations usually break down?",
        "What frustrates support agents most about the current process?"
      ],
      "dig_deeper": [
        "Can you share an example of a ticket that took longer than expected?",
        "What usually happens when an agent can't resolve an issue?",
        "How do customers follow up when their tickets take too long?"
      ]
    }
  },
  "employee_performance_management": {
    "problem_exploration": {
      "primary": [
        "What are the main frustrations employees have with annual reviews?",
        "What makes evaluations feel subjective today?",
        "How are goals currently tracked during the year?",
        "What challenges do managers face when preparing for reviews?"
      ],
      "dig_deeper": [
        "Could you share an example where feedback came too late to be useful?",
        "What happens when development plans are too generic?",
        "How do employees react when ratings feel inconsistent?"
      ]
    }
  }
};

// Mapping from project names to question bank keys
const projectNameToKey: Record<string, string> = {
  'Customer Onboarding Process Optimization': 'customer_onboarding',
  'Digital Expense Management System Implementation': 'digital_expense_management',
  'Multi-Location Inventory Management Enhancement': 'multi_location_inventory',
  'Customer Support Ticket Management System': 'customer_support_tickets',
  'Employee Performance Management Platform': 'employee_performance_management'
};

export function getProjectQuestions(projectId: string): ProjectQuestionBank | null {
  // First try direct match
  if (questionBank[projectId]) {
    return questionBank[projectId];
  }
  
  // Then try mapping from project name
  const mappedKey = projectNameToKey[projectId];
  if (mappedKey && questionBank[mappedKey]) {
    return questionBank[mappedKey];
  }
  
  return null;
}

export function getCurrentQuestion(projectId: string, questionType: 'primary' | 'dig_deeper', questionIndex: number): string | null {
  const project = getProjectQuestions(projectId);
  if (!project) return null;
  
  const questions = project.problem_exploration[questionType];
  return questions[questionIndex] || null;
}
