/**
 * Coaching generator for training feedback
 */

import { isClosedQuestion, rewriteToOpen, looksLikeFollowUp, isSubstantialResponse } from './text';

// Types
export interface CoverMeta {
  key: string;
  coaching_tip: string;
  sample_questions: string[];
}

export interface Turn {
  role: 'learner' | 'stakeholder';
  text: string;
  ts?: string;
}

export interface StagePack {
  id: string;
  name: string;
  must_cover: string[];
}

export interface QuestionCard {
  id: string;
  stage_id: string;
  skill?: string;
  text: string;
  cover_key?: string;
}

export interface CoachingContext {
  stage: StagePack;
  cards: QuestionCard[];
  metaByKey: Record<string, CoverMeta>;
}

export interface ClosedExample {
  turnIdx: number;
  original: string;
  rewrite: string;
}

export interface CoachingAnalysis {
  closedStats: {
    totalLearnerQs: number;
    closedCount: number;
    closedExamples: ClosedExample[];
  };
  keyEvidence: Array<{
    key: string;
    turnIdx: number;
    type: 'direct_q' | 'follow_up' | 'volunteered_validated';
  }>;
  weakKeys: string[];
}

export interface MiniLesson {
  key: string;
  tip: string;
}

// In-memory coaching metadata (will be replaced with DB later)
const COACHING_METADATA: Record<string, CoverMeta> = {
  // Problem Exploration
  pain_points: {
    key: 'pain_points',
    coaching_tip: 'Understanding pain points helps identify the root causes of issues. This information is crucial for designing effective solutions that address real problems rather than symptoms.',
    sample_questions: [
      'What are the biggest frustrations your team faces daily?',
      'What processes feel broken or inefficient?',
      'What complaints do you hear most often from stakeholders?'
    ]
  },
  blockers: {
    key: 'blockers',
    coaching_tip: 'Identifying blockers reveals what\'s preventing progress. This helps prioritize improvements and understand dependencies that could impact project success.',
    sample_questions: [
      'What typically slows down your work?',
      'What obstacles prevent you from meeting deadlines?',
      'What dependencies cause the most delays?'
    ]
  },
  handoffs: {
    key: 'handoffs',
    coaching_tip: 'Handoffs between teams are common failure points. Understanding these gaps helps design better integration and communication processes.',
    sample_questions: [
      'Where do things fall apart between teams?',
      'What information gets lost during handoffs?',
      'How do you ensure smooth transitions between departments?'
    ]
  },
  constraints: {
    key: 'constraints',
    coaching_tip: 'Constraints (technical, budget, time, people) significantly impact what solutions are feasible. Understanding these early prevents unrealistic expectations.',
    sample_questions: [
      'What limitations should we keep in mind?',
      'What resources or time constraints affect this?',
      'What technical or business constraints exist?'
    ]
  },
  customer_impact: {
    key: 'customer_impact',
    coaching_tip: 'Understanding how problems affect customers helps prioritize improvements and ensures solutions deliver real business value.',
    sample_questions: [
      'How do these issues affect your customers?',
      'What\'s the business impact of these problems?',
      'How do customers experience these challenges?'
    ]
  },
  
  // As-Is Process
  current_process: {
    key: 'current_process',
    coaching_tip: 'Mapping current processes reveals inefficiencies and helps stakeholders see the full picture. This baseline is essential for designing improvements.',
    sample_questions: [
      'Can you walk me through your current process step by step?',
      'What does a typical day look like for your team?',
      'How do you currently handle this workflow?'
    ]
  },
  inefficiencies: {
    key: 'inefficiencies',
    coaching_tip: 'Identifying inefficiencies helps quantify improvement opportunities and build a business case for change.',
    sample_questions: [
      'Where do you spend the most time unnecessarily?',
      'What tasks feel repetitive or manual?',
      'What processes take longer than they should?'
    ]
  },
  stakeholder_roles: {
    key: 'stakeholder_roles',
    coaching_tip: 'Understanding who does what helps identify skill gaps, training needs, and opportunities for role optimization.',
    sample_questions: [
      'Who is responsible for each part of the process?',
      'What are the main responsibilities of each team member?',
      'How do roles and responsibilities overlap?'
    ]
  },
  system_gaps: {
    key: 'system_gaps',
    coaching_tip: 'System gaps reveal where technology isn\'t supporting the business needs. This helps prioritize technical improvements.',
    sample_questions: [
      'What systems don\'t work well together?',
      'Where do you need better tools or automation?',
      'What manual work could be automated?'
    ]
  },
  
  // To-Be Process
  future_state: {
    key: 'future_state',
    coaching_tip: 'Envisioning the future state helps stakeholders think beyond current limitations and identify what success looks like.',
    sample_questions: [
      'What would an ideal process look like?',
      'How would you like things to work in the future?',
      'What would success look like for this project?'
    ]
  },
  improvements: {
    key: 'improvements',
    coaching_tip: 'Identifying specific improvements helps prioritize changes and ensures the solution addresses real needs.',
    sample_questions: [
      'What specific changes would make the biggest difference?',
      'What improvements would have the most impact?',
      'What would you change if you could start over?'
    ]
  },
  requirements: {
    key: 'requirements',
    coaching_tip: 'Clear requirements ensure the solution meets business needs and helps prevent scope creep during implementation.',
    sample_questions: [
      'What must the solution do to be successful?',
      'What are the non-negotiable requirements?',
      'What features are essential vs. nice-to-have?'
    ]
  },
  success_criteria: {
    key: 'success_criteria',
    coaching_tip: 'Defining success criteria helps measure project success and ensures everyone has the same expectations.',
    sample_questions: [
      'How will we know this project is successful?',
      'What metrics would indicate improvement?',
      'What outcomes are you looking for?'
    ]
  },
  implementation_plan: {
    key: 'implementation_plan',
    coaching_tip: 'Understanding implementation considerations helps create realistic timelines and identify potential risks.',
    sample_questions: [
      'What would be the best way to implement this?',
      'What phases or milestones should we consider?',
      'What resources would be needed for implementation?'
    ]
  },
  
  // Solution Design
  technical_requirements: {
    key: 'technical_requirements',
    coaching_tip: 'Technical requirements ensure the solution is feasible and can be properly implemented by the development team.',
    sample_questions: [
      'What technical capabilities are needed?',
      'What systems need to integrate with this solution?',
      'What are the performance requirements?'
    ]
  },
  architecture: {
    key: 'architecture',
    coaching_tip: 'Understanding architectural needs helps design scalable, maintainable solutions that fit the existing technology landscape.',
    sample_questions: [
      'How should this solution fit into your current architecture?',
      'What architectural patterns should we follow?',
      'How will this scale as your business grows?'
    ]
  },
  data_models: {
    key: 'data_models',
    coaching_tip: 'Data modeling ensures the solution can handle the required information and relationships effectively.',
    sample_questions: [
      'What data needs to be captured and stored?',
      'How should data flow between systems?',
      'What data relationships are important?'
    ]
  },
  integration_points: {
    key: 'integration_points',
    coaching_tip: 'Integration points are critical for ensuring the solution works with existing systems and processes.',
    sample_questions: [
      'What systems need to connect to this solution?',
      'How should data flow between different platforms?',
      'What APIs or interfaces are needed?'
    ]
  },
  deployment_plan: {
    key: 'deployment_plan',
    coaching_tip: 'Deployment planning ensures smooth rollout and minimizes disruption to ongoing operations.',
    sample_questions: [
      'How should we roll out this solution?',
      'What deployment strategy would work best?',
      'How can we minimize risk during implementation?'
    ]
  }
};

/**
 * Build coaching context from stage and cards
 */
export function buildCoachingContext(
  stage: StagePack, 
  cards: QuestionCard[], 
  metaByKey: Record<string, CoverMeta> = COACHING_METADATA
): CoachingContext {
  return {
    stage,
    cards,
    metaByKey
  };
}

/**
 * Analyze turns for coaching insights
 */
export function analyzeTurnsForCoaching(input: {
  transcript: Turn[];
  stage: StagePack;
  keyAssignmentFn: (learnerTurn: string) => string | null;
  metaByKey?: Record<string, CoverMeta>;
  minWordsStrongAnswer?: number;
}): CoachingAnalysis {
  const { transcript, stage, keyAssignmentFn, metaByKey = COACHING_METADATA, minWordsStrongAnswer = 18 } = input;
  
  const closedStats = {
    totalLearnerQs: 0,
    closedCount: 0,
    closedExamples: [] as ClosedExample[]
  };
  
  const keyEvidence: Array<{ key: string; turnIdx: number; type: 'direct_q' | 'follow_up' | 'volunteered_validated' }> = [];
  const keyCoverage: Record<string, number> = {};
  
  // Initialize coverage tracking
  stage.must_cover.forEach(key => {
    keyCoverage[key] = 0;
  });
  
  // Analyze each learner turn
  for (let i = 0; i < transcript.length; i++) {
    const turn = transcript[i];
    
    if (turn.role === 'learner') {
      closedStats.totalLearnerQs++;
      
      // Check if closed question
      const isClosed = isClosedQuestion(turn.text);
      if (isClosed) {
        closedStats.closedCount++;
        
        // Add to examples (limit to 3)
        if (closedStats.closedExamples.length < 3) {
          closedStats.closedExamples.push({
            turnIdx: i,
            original: turn.text,
            rewrite: rewriteToOpen(turn.text)
          });
        }
      }
      
      // Check if follow-up
      const prevStakeholderTurn = i > 0 ? transcript[i - 1] : null;
      const isFollowUp = prevStakeholderTurn && prevStakeholderTurn.role === 'stakeholder' && 
                        looksLikeFollowUp(turn.text, prevStakeholderTurn.text);
      
      // Assign to coverage key
      const assignedKey = keyAssignmentFn(turn.text);
      if (assignedKey && stage.must_cover.includes(assignedKey)) {
        const evidenceType = isFollowUp ? 'follow_up' : 'direct_q';
        keyEvidence.push({
          key: assignedKey,
          turnIdx: i,
          type: evidenceType
        });
        
        // Check if stakeholder response is substantial
        const nextTurn = i + 1 < transcript.length ? transcript[i + 1] : null;
        if (nextTurn && nextTurn.role === 'stakeholder' && isSubstantialResponse(nextTurn.text, minWordsStrongAnswer)) {
          keyCoverage[assignedKey]++;
        }
      }
    }
  }
  
  // Determine weak keys (coverage < 0.5 or no evidence)
  const weakKeys = stage.must_cover.filter(key => {
    const coverage = keyCoverage[key];
    return coverage < 0.5 || !keyEvidence.some(evidence => evidence.key === key);
  });
  
  return {
    closedStats,
    keyEvidence,
    weakKeys
  };
}

/**
 * Generate next-time scripts for weak areas
 */
export function generateNextTimeScripts(params: {
  weakKeys: string[];
  metaByKey?: Record<string, CoverMeta>;
  usedCardIds?: string[];
  maxScripts?: number;
}): string[] {
  const { weakKeys, metaByKey = COACHING_METADATA, usedCardIds = [], maxScripts = 5 } = params;
  
  const scripts: string[] = [];
  
  // Prioritize weakest keys first
  for (const key of weakKeys) {
    const meta = metaByKey[key];
    if (meta && meta.sample_questions.length > 0) {
      // Add sample questions for this key
      for (const question of meta.sample_questions) {
        if (scripts.length >= maxScripts) break;
        scripts.push(question);
      }
    }
    
    if (scripts.length >= maxScripts) break;
  }
  
  // Add generic improvement tips if we have room
  if (scripts.length < maxScripts) {
    const genericTips = [
      'Ask open-ended questions that start with What, How, Why, or Tell me about...',
      'Use follow-up questions to dig deeper into stakeholder responses',
      'Focus on understanding the "why" behind problems, not just the "what"',
      'Ask about specific examples and experiences rather than general opinions',
      'Explore the impact of issues on different stakeholders and processes'
    ];
    
    for (const tip of genericTips) {
      if (scripts.length >= maxScripts) break;
      scripts.push(tip);
    }
  }
  
  return scripts.slice(0, maxScripts);
}

/**
 * Collect mini-lessons for weak areas
 */
export function collectMiniLessons(params: {
  weakKeys: string[];
  metaByKey?: Record<string, CoverMeta>;
  max?: number;
}): MiniLesson[] {
  const { weakKeys, metaByKey = COACHING_METADATA, max = 3 } = params;
  
  const lessons: MiniLesson[] = [];
  
  for (const key of weakKeys) {
    if (lessons.length >= max) break;
    
    const meta = metaByKey[key];
    if (meta && meta.coaching_tip) {
      lessons.push({
        key,
        tip: meta.coaching_tip
      });
    }
  }
  
  return lessons;
}

/**
 * Get coaching metadata for a key
 */
export function getCoachingMeta(key: string): CoverMeta | null {
  return COACHING_METADATA[key] || null;
}

/**
 * Get all available coaching metadata
 */
export function getAllCoachingMeta(): Record<string, CoverMeta> {
  return { ...COACHING_METADATA };
}

// Unit tests
if (process.env.NODE_ENV === 'test') {
  describe('Coaching Generator', () => {
    const mockStage: StagePack = {
      id: 'problem_exploration',
      name: 'Problem Exploration',
      must_cover: ['pain_points', 'blockers', 'handoffs']
    };
    
    const mockTranscript: Turn[] = [
      { role: 'learner', text: 'What are your biggest pain points?' },
      { role: 'stakeholder', text: 'The onboarding process is too slow and confusing for customers.' },
      { role: 'learner', text: 'Is it really that bad?' },
      { role: 'stakeholder', text: 'Yes, customers often complain about delays and lack of clarity.' }
    ];
    
    const mockKeyAssignmentFn = (text: string): string | null => {
      if (text.includes('pain points')) return 'pain_points';
      if (text.includes('slow')) return 'blockers';
      return null;
    };
    
    describe('analyzeTurnsForCoaching', () => {
      it('should detect closed questions', () => {
        const result = analyzeTurnsForCoaching({
          transcript: mockTranscript,
          stage: mockStage,
          keyAssignmentFn: mockKeyAssignmentFn
        });
        
        expect(result.closedStats.closedCount).toBe(1);
        expect(result.closedStats.closedExamples).toHaveLength(1);
        expect(result.closedStats.closedExamples[0].original).toBe('Is it really that bad?');
      });
      
      it('should identify weak keys', () => {
        const result = analyzeTurnsForCoaching({
          transcript: mockTranscript,
          stage: mockStage,
          keyAssignmentFn: mockKeyAssignmentFn
        });
        
        expect(result.weakKeys).toContain('handoffs');
      });
    });
    
    describe('generateNextTimeScripts', () => {
      it('should generate scripts for weak keys', () => {
        const scripts = generateNextTimeScripts({
          weakKeys: ['handoffs', 'constraints'],
          maxScripts: 3
        });
        
        expect(scripts.length).toBeGreaterThan(0);
        expect(scripts.length).toBeLessThanOrEqual(3);
      });
    });
    
    describe('collectMiniLessons', () => {
      it('should collect lessons for weak keys', () => {
        const lessons = collectMiniLessons({
          weakKeys: ['handoffs'],
          max: 2
        });
        
        expect(lessons.length).toBe(1);
        expect(lessons[0].key).toBe('handoffs');
        expect(lessons[0].tip).toContain('handoffs');
      });
    });
  });
}













