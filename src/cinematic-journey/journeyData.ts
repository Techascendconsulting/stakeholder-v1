import { JourneyPhases, JourneyPhase, JourneyStep } from './types';

export const JOURNEY_PHASES: JourneyPhases = [
  makePhase(0, 'P0', 'Start Your BA Journey', 'Orientation, expectations and getting started.'),
  makePhase(1, 'P1', 'Meet the Team & Tools', 'Understand who you work with and the tools you will use.'),
  makePhase(2, 'P2', 'Discover the Project', 'Learn about goals, constraints, and context.'),
  makePhase(3, 'P3', 'Stakeholder Landscape', 'Identify stakeholders and their interests.'),
  makePhase(4, 'P4', 'Stakeholder Conversations', 'Practice stakeholder communication basics.'),
  makePhase(5, 'P5', 'Spot Issues & Analyse Gaps', 'Find problems and areas for improvement.'),
  makePhase(6, 'P6', 'Requirements & User Stories', 'Capture needs and write user stories.'),
  makePhase(7, 'P7', 'Working with Dev & QA', 'Collaborate with engineers and testers.'),
  makePhase(8, 'P8', 'Sprint Cycle & Delivery', 'Understand sprint ceremonies and delivery flow.'),
  makePhase(9, 'P9', 'Wrap-Up & Portfolio', 'Summarize outcomes and build your portfolio.'),
];

function makePhase(order: number, code: string, title: string, description: string): JourneyPhase {
  const id = `p${order}`;
  const steps: JourneyStep[] = [
    {
      id: 's1',
      order: 1,
      title: stepTitle(code, 1),
      type: 'text',
      summary: 'Overview and context to begin.',
      content: 'Content coming soon.',
    },
    {
      id: 's2',
      order: 2,
      title: stepTitle(code, 2),
      type: 'email',
      summary: 'Read an email related to this phase.',
      content: 'Content coming soon.',
    },
    {
      id: 's3',
      order: 3,
      title: stepTitle(code, 3),
      type: 'video',
      summary: 'Watch a short video explanation.',
      content: 'Content coming soon.',
    },
    {
      id: 's4',
      order: 4,
      title: stepTitle(code, 4),
      type: 'text',
      summary: 'Read a brief note or guidance.',
      content: 'Content coming soon.',
    },
    {
      id: 's5',
      order: 5,
      title: stepTitle(code, 5),
      type: 'task',
      summary: 'Complete a simple task.',
      content: 'Content coming soon.',
    },
  ];
  return { id, order, code, title, description, steps };
}

function stepTitle(code: string, n: number): string {
  const map: Record<string, string[]> = {
    P0: [
      'Welcome to your role',
      'Your first email from Ben',
      'Orientation video',
      'How we’ll work',
      'Confirm your setup',
    ],
    P1: [
      'Meet your team',
      'Set up your tools',
      'Tooling overview video',
      'Team expectations',
      'Introduce yourself',
    ],
    P2: [
      'Project overview',
      'Read the brief',
      'Brief walkthrough video',
      'Clarify objectives',
      'Acknowledge receipt',
    ],
    P3: [
      'Identify stakeholders',
      'Stakeholder map',
      'Landscape video',
      'Who to talk to',
      'Plan initial outreach',
    ],
    P4: [
      'Conversation basics',
      'First email to a stakeholder',
      'Active listening video',
      'Schedule a chat',
      'Note-taking template',
    ],
    P5: [
      'Spot pain points',
      'Capture issues',
      'Gap analysis video',
      'Prioritize areas',
      'Share initial findings',
    ],
    P6: [
      'Define requirements',
      'Draft a user story',
      'Stories vs tasks video',
      'Get feedback',
      'Refine acceptance criteria',
    ],
    P7: [
      'Dev/QA handoffs',
      'Write a ticket',
      'Handover video',
      'Review a test plan',
      'Clarify a question',
    ],
    P8: [
      'Sprint ceremonies',
      'Attend a planning',
      'Daily standup video',
      'Demo prep',
      'Retrospective notes',
    ],
    P9: [
      'Summarize outcomes',
      'Select artifacts',
      'Portfolio video',
      'Draft your portfolio entry',
      'Submit for review',
    ],
  };
  return (map[code] && map[code][n - 1]) || `Step ${n}`;
}

export function getPhaseById(id: string): JourneyPhase | undefined {
  return JOURNEY_PHASES.find(p => p.id === id);
}

export function getStep(phaseId: string, stepId: string): { phase: JourneyPhase; step: JourneyStep } | undefined {
  const phase = getPhaseById(phaseId);
  if (!phase) return undefined;
  const step = phase.steps.find(s => s.id === stepId);
  if (!step) return undefined;
  return { phase, step };
}

export function getNextStep(phaseId: string, stepId: string): { phaseId: string; stepId: string } | null {
  const phase = getPhaseById(phaseId);
  if (!phase) return null;
  const step = phase.steps.find(s => s.id === stepId);
  if (!step) return null;
  const next = phase.steps.find(s => s.order === step.order + 1);
  if (!next) return null; // stop at phase end (phase complete handling later)
  return { phaseId: phase.id, stepId: next.id };
}

export function getPreviousStep(phaseId: string, stepId: string): { phaseId: string; stepId: string } | null {
  const phase = getPhaseById(phaseId);
  if (!phase) return null;
  const step = phase.steps.find(s => s.id === stepId);
  if (!step) return null;
  const prev = phase.steps.find(s => s.order === step.order - 1);
  if (!prev) return null;
  return { phaseId: phase.id, stepId: prev.id };
}


