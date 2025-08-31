export interface InterviewQuestion {
  id: string;
  type: string;
  question: string;
  why: string;
  how: string;
}

export interface ProjectQuestions {
  [projectKey: string]: InterviewQuestion[];
}

export const completeInterviewQuestions: ProjectQuestions = {
  "customer_onboarding": [
    {
      "id": "warmup_1",
      "type": "warmup",
      "question": "Hello [Name], thanks for taking the time to meet with me today. I'd like to understand your current onboarding process and any challenges you're experiencing.",
      "why": "Sets a professional tone, builds rapport, frames the purpose.",
      "how": "Be polite, appreciative, and clear about your aim."
    },
    {
      "id": "onboarding_p1",
      "type": "problem",
      "question": "Where do handoffs between teams usually break down?",
      "why": "Handoffs are often where onboarding delays happen.",
      "how": "Ask neutrally, avoid blaming; invite examples."
    },
    {
      "id": "onboarding_p2",
      "type": "problem",
      "question": "Which steps cause the most delays for customers?",
      "why": "Identifies bottlenecks that frustrate clients.",
      "how": "Keep it customer-focused, not internal blame."
    },
    {
      "id": "onboarding_d1",
      "type": "dig_deeper",
      "question": "Could you share a recent example of a delayed onboarding and what caused it?",
      "why": "Reveals patterns and real causes through examples.",
      "how": "Invite specific examples without judgment."
    },
    {
      "id": "onboarding_d2",
      "type": "dig_deeper",
      "question": "When delays happen, who gets involved to fix them?",
      "why": "Exposes ownership gaps and escalation practices.",
      "how": "Ask factually, avoid assigning blame."
    },
    {
      "id": "onboarding_d3",
      "type": "dig_deeper",
      "question": "How do these issues affect the customer's perception of TechCorp?",
      "why": "Connects internal problems to customer trust.",
      "how": "Empathetic phrasing, show customer focus."
    },
    {
      "id": "impact_1",
      "type": "impact",
      "question": "How do these issues affect your team or customers?",
      "why": "Links problems to measurable effects on people.",
      "how": "Encourage open reflection, avoid leading language."
    },
    {
      "id": "impact_2",
      "type": "impact",
      "question": "What might happen if these challenges continue for the next 6–12 months?",
      "why": "Surfaces long-term risks like churn or morale issues.",
      "how": "Frame it as future-focused, not accusatory."
    },
    {
      "id": "wrapup_1",
      "type": "wrapup",
      "question": "Thanks, this has been really helpful. Let me quickly recap what I've heard: [summary]. Is there anything I've missed that you feel is important to highlight?",
      "why": "Shows active listening, confirms understanding, and closes professionally.",
      "how": "Be thankful, concise, and check for completeness."
    }
  ],
  "digital_expense_management": [
    {
      "id": "warmup_1",
      "type": "warmup",
      "question": "Hello [Name], thanks for meeting today. I'd like to understand your expense process and where the main challenges are.",
      "why": "Sets a professional tone, builds rapport, frames the purpose.",
      "how": "Be polite and clear about your aim."
    },
    {
      "id": "expenses_p1",
      "type": "problem",
      "question": "Which parts of the expense process take the most time for employees?",
      "why": "Highlights inefficiencies for staff.",
      "how": "Keep tone curious, not critical."
    },
    {
      "id": "expenses_p2",
      "type": "problem",
      "question": "What makes it hard to enforce policies today?",
      "why": "Surfaces compliance weaknesses.",
      "how": "Invite detail without sounding accusatory."
    },
    {
      "id": "expenses_d1",
      "type": "dig_deeper",
      "question": "Can you describe a case where an error caused delays or frustration?",
      "why": "Reveals real impact of mistakes.",
      "how": "Ask for specific situations neutrally."
    },
    {
      "id": "expenses_d2",
      "type": "dig_deeper",
      "question": "Which steps in the approval chain are the slowest?",
      "why": "Highlights bottlenecks in approvals.",
      "how": "Keep tone curious and factual."
    },
    {
      "id": "expenses_d3",
      "type": "dig_deeper",
      "question": "What do managers find most frustrating when reviewing claims?",
      "why": "Surfaces pain points for leadership.",
      "how": "Ask empathetically, avoid blame."
    },
    {
      "id": "impact_1",
      "type": "impact",
      "question": "How do these issues affect your team or customers?",
      "why": "Links problems to measurable effects on people.",
      "how": "Encourage open reflection, avoid leading language."
    },
    {
      "id": "impact_2",
      "type": "impact",
      "question": "What might happen if these challenges continue for the next 6–12 months?",
      "why": "Surfaces long-term risks like churn or morale issues.",
      "how": "Frame it as future-focused, not accusatory."
    },
    {
      "id": "wrapup_1",
      "type": "wrapup",
      "question": "Thanks, this has been really helpful. Let me quickly recap what I've heard: [summary]. Is there anything I've missed that you feel is important to highlight?",
      "why": "Shows active listening, confirms understanding, and closes professionally.",
      "how": "Be thankful, concise, and check for completeness."
    }
  ],
  "multi_location_inventory": [
    {
      "id": "warmup_1",
      "type": "warmup",
      "question": "Hello [Name], thanks for making time today. I'd like to understand your current inventory process and any challenges you're seeing.",
      "why": "Sets a professional tone, builds rapport, frames the purpose.",
      "how": "Be polite and clear about your aim."
    },
    {
      "id": "inventory_p1",
      "type": "problem",
      "question": "Which products are most often out of stock or overstocked?",
      "why": "Pinpoints demand/supply mismatch.",
      "how": "Ask for patterns or categories, not exact numbers."
    },
    {
      "id": "inventory_p2",
      "type": "problem",
      "question": "What happens when a location runs out of stock?",
      "why": "Reveals customer impact and stopgap actions.",
      "how": "Ask for stories, not just data."
    },
    {
      "id": "inventory_d1",
      "type": "dig_deeper",
      "question": "Could you give an example of when poor forecasting caused issues?",
      "why": "Reveals weaknesses in planning accuracy.",
      "how": "Invite concrete examples neutrally."
    },
    {
      "id": "inventory_d2",
      "type": "dig_deeper",
      "question": "Which location has the most frequent stock challenges?",
      "why": "Identifies hotspots of recurring issues.",
      "how": "Ask factually without judgment."
    },
    {
      "id": "inventory_d3",
      "type": "dig_deeper",
      "question": "What do store managers do when numbers don't match actual stock?",
      "why": "Shows how people handle discrepancies.",
      "how": "Encourage open sharing, avoid critique."
    },
    {
      "id": "impact_1",
      "type": "impact",
      "question": "How do these issues affect your team or customers?",
      "why": "Links problems to measurable effects on people.",
      "how": "Encourage open reflection, avoid leading language."
    },
    {
      "id": "impact_2",
      "type": "impact",
      "question": "What might happen if these challenges continue for the next 6–12 months?",
      "why": "Surfaces long-term risks like churn or morale issues.",
      "how": "Frame it as future-focused, not accusatory."
    },
    {
      "id": "wrapup_1",
      "type": "wrapup",
      "question": "Thanks, this has been really helpful. Let me quickly recap what I've heard: [summary]. Is there anything I've missed that you feel is important to highlight?",
      "why": "Shows active listening, confirms understanding, and closes professionally.",
      "how": "Be thankful, concise, and check for completeness."
    }
  ],
  "customer_support_tickets": [
    {
      "id": "warmup_1",
      "type": "warmup",
      "question": "Hello [Name], thanks for meeting today. I'd like to understand how support tickets are managed and the challenges you face.",
      "why": "Sets a professional tone, builds rapport, frames the purpose.",
      "how": "Be polite and clear about your aim."
    },
    {
      "id": "support_p1",
      "type": "problem",
      "question": "Which types of issues take the longest to resolve?",
      "why": "Identifies complex cases and bottlenecks.",
      "how": "Ask openly, let them categorize."
    },
    {
      "id": "support_p2",
      "type": "problem",
      "question": "How are tickets currently assigned to agents?",
      "why": "Surfaces workload balance issues.",
      "how": "Neutral, non-critical tone."
    },
    {
      "id": "support_d1",
      "type": "dig_deeper",
      "question": "Can you share an example of a ticket that took longer than expected?",
      "why": "Provides concrete case for delays.",
      "how": "Ask openly, neutrally."
    },
    {
      "id": "support_d2",
      "type": "dig_deeper",
      "question": "What usually happens when an agent can't resolve an issue?",
      "why": "Reveals escalation process weaknesses.",
      "how": "Neutral, non-critical phrasing."
    },
    {
      "id": "support_d3",
      "type": "dig_deeper",
      "question": "How do customers follow up when their tickets take too long?",
      "why": "Shows customer persistence and dissatisfaction.",
      "how": "Ask empathetically."
    },
    {
      "id": "impact_1",
      "type": "impact",
      "question": "How do these issues affect your team or customers?",
      "why": "Links problems to measurable effects on people.",
      "how": "Encourage open reflection, avoid leading language."
    },
    {
      "id": "impact_2",
      "type": "impact",
      "question": "What might happen if these challenges continue for the next 6–12 months?",
      "why": "Surfaces long-term risks like churn or morale issues.",
      "how": "Frame it as future-focused, not accusatory."
    },
    {
      "id": "wrapup_1",
      "type": "wrapup",
      "question": "Thanks, this has been really helpful. Let me quickly recap what I've heard: [summary]. Is there anything I've missed that you feel is important to highlight?",
      "why": "Shows active listening, confirms understanding, and closes professionally.",
      "how": "Be thankful, concise, and check for completeness."
    }
  ],
  "employee_performance_management": [
    {
      "id": "warmup_1",
      "type": "warmup",
      "question": "Hello [Name], thanks for joining me today. I'd like to understand how performance reviews are currently handled and where the challenges are.",
      "why": "Sets a professional tone, builds rapport, frames the purpose.",
      "how": "Be polite and clear about your aim."
    },
    {
      "id": "performance_p1",
      "type": "problem",
      "question": "What are the main frustrations employees have with annual reviews?",
      "why": "Surfaces employee sentiment directly.",
      "how": "Ask with empathy, no judgment."
    },
    {
      "id": "performance_p2",
      "type": "problem",
      "question": "What makes evaluations feel subjective today?",
      "why": "Identifies fairness concerns.",
      "how": "Neutral tone, avoid defensiveness."
    },
    {
      "id": "performance_d1",
      "type": "dig_deeper",
      "question": "Could you share an example where feedback came too late to be useful?",
      "why": "Reveals timing issues and missed opportunities.",
      "how": "Invite specific stories without judgment."
    },
    {
      "id": "performance_d2",
      "type": "dig_deeper",
      "question": "What happens when development plans are too generic?",
      "why": "Shows how vague plans fail to support growth.",
      "how": "Keep tone curious and non-critical."
    },
    {
      "id": "performance_d3",
      "type": "dig_deeper",
      "question": "How do employees react when ratings feel inconsistent?",
      "why": "Highlights emotional and cultural impact of inconsistency.",
      "how": "Encourage openness, empathetic phrasing."
    },
    {
      "id": "impact_1",
      "type": "impact",
      "question": "How do these issues affect your team or customers?",
      "why": "Links problems to measurable effects on people.",
      "how": "Encourage open reflection, avoid leading language."
    },
    {
      "id": "impact_2",
      "type": "impact",
      "question": "What might happen if these challenges continue for the next 6–12 months?",
      "why": "Surfaces long-term risks like churn or morale issues.",
      "how": "Frame it as future-focused, not accusatory."
    },
    {
      "id": "wrapup_1",
      "type": "wrapup",
      "question": "Thanks, this has been really helpful. Let me quickly recap what I've heard: [summary]. Is there anything I've missed that you feel is important to highlight?",
      "why": "Shows active listening, confirms understanding, and closes professionally.",
      "how": "Be thankful, concise, and check for completeness."
    }
  ]
};

// Mapping from project names to question bank keys
const projectNameToKey: Record<string, string> = {
  'Customer Onboarding Process Optimization': 'customer_onboarding',
  'Digital Expense Management System Implementation': 'digital_expense_management',
  'Multi-Location Inventory Management Enhancement': 'multi_location_inventory',
  'Customer Support Ticket Management System': 'customer_support_tickets',
  'Employee Performance Management Platform': 'employee_performance_management'
};

export function getProjectKey(projectName: string): string | null {
  return projectNameToKey[projectName] || null;
}

export function getProjectQuestions(projectName: string): InterviewQuestion[] {
  const projectKey = getProjectKey(projectName);
  if (!projectKey) return [];
  
  return completeInterviewQuestions[projectKey] || [];
}

export function getCurrentQuestion(
  projectName: string, 
  questionIndex: number
): InterviewQuestion | null {
  const projectQuestions = getProjectQuestions(projectName);
  return projectQuestions[questionIndex] || null;
}

export function getTotalQuestions(projectName: string): number {
  return getProjectQuestions(projectName).length;
}
