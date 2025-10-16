/**
 * Enhanced scoring engine with coaching capabilities
 */

import { isClosedQuestion, rewriteToOpen, looksLikeFollowUp, isSubstantialResponse } from './text';
import { 
  analyzeTurnsForCoaching, 
  generateNextTimeScripts, 
  collectMiniLessons,
  type Turn,
  type StagePack,
  type QuestionCard,
  type CoverMeta
} from './coaching';

// Types
export type CoverageKey = string;

export interface ScoringInput {
  stage: StagePack;
  cards: QuestionCard[];
  transcript: Turn[];
  hintEvents?: Array<{
    card_id?: string;
    event_type: 'shown' | 'clicked' | 'edited' | 'asked';
    ts?: string;
  }>;
  passThreshold?: number;
  useEmbeddings?: boolean;
  metaByKey?: Record<string, CoverMeta>;
}

export interface ScoringOutput {
  coverageScores: Record<CoverageKey, number>;
  technique: {
    openRatio: number;
    followUp: number;
    talkBalance: number;
    earlySolutioning: boolean;
    closedCount: number;
    totalLearnerQs: number;
  };
  independence: Record<CoverageKey, number>;
  overall: number;
  passed: boolean;
  coveredAreas: CoverageKey[];
  missedAreas: CoverageKey[];
  nextTimeScripts: string[];
  evidence: Array<{
    key: CoverageKey;
    turnIdx: number;
    kind: 'direct_q' | 'follow_up' | 'stakeholder_prompted';
  }>;
  coaching?: {
    closedExamples: Array<{
      turnIdx: number;
      original: string;
      rewrite: string;
    }>;
    nextTimeScripts: string[];
    miniLessons: Array<{
      key: string;
      tip: string;
    }>;
  };
}

// Constants
const COSINE_THRESHOLD = 0.32;
const BM25_GATE = 0.0; // Dynamic gate
const STRONG_ANSWER_WORDS = 18;
const PRACTICE_WEIGHTS = { coverage: 0.6, independence: 0.2, technique: 0.2 };
const ASSESS_WEIGHTS = { coverage: 0.7, independence: 0.1, technique: 0.2 };

/**
 * Simple BM25 implementation for keyword matching
 */
class BM25Index {
  private docs: string[];
  private avgDocLength: number;
  private docFreq: Map<string, number>;
  private idf: Map<string, number>;

  constructor(docs: string[]) {
    this.docs = docs;
    this.avgDocLength = docs.reduce((sum, doc) => sum + this.tokenize(doc).length, 0) / docs.length;
    this.docFreq = new Map();
    this.idf = new Map();
    this.buildIndex();
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  private buildIndex() {
    const totalDocs = this.docs.length;
    
    // Calculate document frequency
    this.docs.forEach(doc => {
      const tokens = new Set(this.tokenize(doc));
      tokens.forEach(token => {
        this.docFreq.set(token, (this.docFreq.get(token) || 0) + 1);
      });
    });

    // Calculate IDF
    this.docFreq.forEach((freq, token) => {
      this.idf.set(token, Math.log((totalDocs - freq + 0.5) / (freq + 0.5)));
    });
  }

  score(query: string): number[] {
    const queryTokens = this.tokenize(query);
    const k1 = 1.2;
    const b = 0.75;

    return this.docs.map(doc => {
      const docTokens = this.tokenize(doc);
      const docLength = docTokens.length;
      
      let score = 0;
      queryTokens.forEach(token => {
        const tf = docTokens.filter(t => t === token).length;
        const idf = this.idf.get(token) || 0;
        
        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (docLength / this.avgDocLength));
        
        score += idf * (numerator / denominator);
      });
      
      return score;
    });
  }
}

/**
 * Assign question cards to coverage keys
 */
function assignCardsToKeys(stage: StagePack, cards: QuestionCard[]): Record<CoverageKey, QuestionCard[]> {
  const assigned: Record<CoverageKey, QuestionCard[]> = {};
  
  // Initialize
  stage.must_cover.forEach(key => {
    assigned[key] = [];
  });

  // Use explicit cover_key if available
  cards.forEach(card => {
    if (card.cover_key && stage.must_cover.includes(card.cover_key)) {
      assigned[card.cover_key].push(card);
    }
  });

  // For cards without explicit mapping, use BM25 to infer
  const unmappedCards = cards.filter(card => !card.cover_key);
  if (unmappedCards.length > 0) {
    const cardTexts = unmappedCards.map(card => card.text);
    const bm25Index = new BM25Index(cardTexts);
    
    unmappedCards.forEach((card, index) => {
      const scores = bm25Index.score(card.text);
      const maxScore = Math.max(...scores);
      
      // Find best matching key
      let bestKey = '';
      let bestScore = 0;
      
      stage.must_cover.forEach(key => {
        const keyScores = bm25Index.score(key);
        const avgScore = keyScores.reduce((sum, score) => sum + score, 0) / keyScores.length;
        if (avgScore > bestScore) {
          bestScore = avgScore;
          bestKey = key;
        }
      });
      
      if (bestKey && bestScore > 0.1) { // Threshold to avoid poor matches
        assigned[bestKey].push(card);
      }
    });
  }

  return assigned;
}

/**
 * Classify learner turn to coverage key
 */
function classifyTurn(turn: string, assignedCards: Record<CoverageKey, QuestionCard[]>): CoverageKey | null {
  const allCards = Object.values(assignedCards).flat();
  if (allCards.length === 0) return null;

  const cardTexts = allCards.map(card => card.text);
  const bm25Index = new BM25Index(cardTexts);
  const scores = bm25Index.score(turn);
  
  const maxScore = Math.max(...scores);
  const meanScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const dynamicGate = BM25_GATE === 0 ? 
    0.6 * meanScore + 0.4 * maxScore : 
    BM25_GATE;

  if (maxScore < dynamicGate) return null;

  // Find which key the best matching card belongs to
  const bestCardIndex = scores.indexOf(maxScore);
  const bestCard = allCards[bestCardIndex];
  
  for (const [key, cards] of Object.entries(assignedCards)) {
    if (cards.includes(bestCard)) {
      return key;
    }
  }

  return null;
}

/**
 * Score meeting with coaching integration
 */
export function scoreMeeting(input: ScoringInput): ScoringOutput {
  const { 
    stage, 
    cards, 
    transcript, 
    hintEvents = [], 
    passThreshold = 0.65,
    useEmbeddings = false,
    metaByKey
  } = input;

  // Assign cards to keys
  const assignedCards = assignCardsToKeys(stage, cards);
  
  // Initialize coverage tracking
  const coverageScores: Record<CoverageKey, number> = {};
  const independence: Record<CoverageKey, number> = {};
  stage.must_cover.forEach(key => {
    coverageScores[key] = 0;
    independence[key] = 1.0; // Default to full independence
  });

  // Technique tracking
  let totalLearnerQs = 0;
  let openQuestions = 0;
  let followUps = 0;
  let learnerWords = 0;
  let stakeholderWords = 0;
  let earlySolutioning = false;
  let closedCount = 0;

  // Evidence tracking
  const evidence: Array<{ key: CoverageKey; turnIdx: number; kind: 'direct_q' | 'follow_up' | 'stakeholder_prompted' }> = [];
  const keyEvidence: Record<CoverageKey, Array<{ turnIdx: number; type: 'direct_q' | 'follow_up' }>> = {};

  // Initialize key evidence tracking
  stage.must_cover.forEach(key => {
    keyEvidence[key] = [];
  });

  // Analyze each turn
  for (let i = 0; i < transcript.length; i++) {
    const turn = transcript[i];
    
    if (turn.role === 'learner') {
      totalLearnerQs++;
      learnerWords += turn.text.split(/\s+/).length;
      
      // Check if closed question
      const isClosed = isClosedQuestion(turn.text);
      if (isClosed) {
        closedCount++;
      } else {
        openQuestions++;
      }
      
      // Check if follow-up
      const prevStakeholderTurn = i > 0 ? transcript[i - 1] : null;
      const isFollowUp = prevStakeholderTurn && prevStakeholderTurn.role === 'stakeholder' && 
                        looksLikeFollowUp(turn.text, prevStakeholderTurn.text);
      
      if (isFollowUp) {
        followUps++;
      }
      
      // Classify to coverage key
      const assignedKey = classifyTurn(turn.text, assignedCards);
      if (assignedKey && stage.must_cover.includes(assignedKey)) {
        const evidenceType = isFollowUp ? 'follow_up' : 'direct_q';
        evidence.push({
          key: assignedKey,
          turnIdx: i,
          kind: evidenceType
        });
        
        keyEvidence[assignedKey].push({
          turnIdx: i,
          type: evidenceType
        });
        
        // Check if stakeholder response is substantial
        const nextTurn = i + 1 < transcript.length ? transcript[i + 1] : null;
        if (nextTurn && nextTurn.role === 'stakeholder' && isSubstantialResponse(nextTurn.text, STRONG_ANSWER_WORDS)) {
          coverageScores[assignedKey] = Math.max(coverageScores[assignedKey], 1.0);
        } else if (keyEvidence[assignedKey].length >= 2) {
          coverageScores[assignedKey] = Math.max(coverageScores[assignedKey], 0.5);
        } else {
          coverageScores[assignedKey] = Math.max(coverageScores[assignedKey], 0.0);
        }
      }
      
      // Check for early solutioning (Problem/As-Is stages only)
      if (['problem_exploration', 'as_is'].includes(stage.id) && 
          Object.values(coverageScores).filter(score => score >= 0.5).length < 2) {
        if (/we should build|let'?s (build|implement|create)|i will (create|build)|add a feature|the api should|we can automate/i.test(turn.text)) {
          earlySolutioning = true;
        }
      }
      
    } else if (turn.role === 'stakeholder') {
      stakeholderWords += turn.text.split(/\s+/).length;
    }
  }

  // Calculate technique metrics
  const openRatio = totalLearnerQs > 0 ? openQuestions / totalLearnerQs : 0;
  const followUpRatio = totalLearnerQs > 0 ? followUps / totalLearnerQs : 0;
  const totalWords = learnerWords + stakeholderWords;
  const talkBalance = totalWords > 0 ? stakeholderWords / totalWords : 0.5;
  const talkBalanceScore = 1 - Math.abs(talkBalance - 0.5) / 0.5;
  
  const techniqueComposite = 0.4 * openRatio + 0.3 * followUpRatio + 0.3 * talkBalanceScore;
  const finalTechnique = earlySolutioning ? Math.max(0, techniqueComposite - 0.2) : techniqueComposite;

  // Determine covered/missed areas
  const coveredAreas = stage.must_cover.filter(key => coverageScores[key] >= 0.5);
  const missedAreas = stage.must_cover.filter(key => coverageScores[key] < 0.5);

  // Calculate overall score
  const avgCoverage = Object.values(coverageScores).reduce((sum, score) => sum + score, 0) / stage.must_cover.length;
  const avgIndependence = Object.values(independence).reduce((sum, score) => sum + score, 0) / stage.must_cover.length;
  
  const weights = stage.id.includes('practice') ? PRACTICE_WEIGHTS : ASSESS_WEIGHTS;
  const overall = weights.coverage * avgCoverage + 
                  weights.independence * avgIndependence + 
                  weights.technique * finalTechnique;

  // Generate next-time scripts
  const nextTimeScripts = generateNextTimeScripts({
    weakKeys: missedAreas,
    metaByKey,
    maxScripts: 5
  });

  // Coaching analysis
  const coachingAnalysis = analyzeTurnsForCoaching({
    transcript,
    stage,
    keyAssignmentFn: (text) => classifyTurn(text, assignedCards),
    metaByKey,
    minWordsStrongAnswer: STRONG_ANSWER_WORDS
  });

  const coaching = {
    closedExamples: coachingAnalysis.closedStats.closedExamples,
    nextTimeScripts: generateNextTimeScripts({
      weakKeys: coachingAnalysis.weakKeys,
      metaByKey,
      maxScripts: 5
    }),
    miniLessons: collectMiniLessons({
      weakKeys: coachingAnalysis.weakKeys,
      metaByKey,
      max: 3
    })
  };

  return {
    coverageScores,
    technique: {
      openRatio,
      followUp: followUpRatio,
      talkBalance: talkBalanceScore,
      earlySolutioning,
      closedCount,
      totalLearnerQs
    },
    independence,
    overall,
    passed: overall >= passThreshold,
    coveredAreas,
    missedAreas,
    nextTimeScripts,
    evidence,
    coaching
  };
}

// Unit tests
if (process.env.NODE_ENV === 'test') {
  describe('Scoring Engine', () => {
    const mockStage: StagePack = {
      id: 'problem_exploration',
      name: 'Problem Exploration',
      must_cover: ['pain_points', 'blockers', 'handoffs']
    };

    const mockCards: QuestionCard[] = [
      {
        id: '1',
        stage_id: 'problem_exploration',
        text: 'What are your biggest pain points?',
        cover_key: 'pain_points'
      },
      {
        id: '2',
        stage_id: 'problem_exploration',
        text: 'What slows down your process?',
        cover_key: 'blockers'
      }
    ];

    const mockTranscript: Turn[] = [
      { role: 'learner', text: 'What are your biggest pain points?' },
      { role: 'stakeholder', text: 'The onboarding process is too slow and confusing for customers.' },
      { role: 'learner', text: 'Is it really that bad?' },
      { role: 'stakeholder', text: 'Yes, customers often complain about delays and lack of clarity.' }
    ];

    it('should score meeting with coaching', () => {
      const result = scoreMeeting({
        stage: mockStage,
        cards: mockCards,
        transcript: mockTranscript
      });

      expect(result.coverageScores).toBeDefined();
      expect(result.technique.closedCount).toBe(1);
      expect(result.coaching).toBeDefined();
      expect(result.coaching?.closedExamples).toHaveLength(1);
    });
  });
}



















