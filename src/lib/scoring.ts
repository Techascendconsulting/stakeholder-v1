// Core scoring engine for training meetings
// Implements dynamic, data-driven scoring based on stage question cards

export type CoverageKey = string; // entries from stage.must_cover
export type StagePack = { 
  id: string; 
  must_cover: CoverageKey[]; 
};
export type QuestionCard = { 
  id: string; 
  stage_id: string; 
  skill: string; 
  text: string; 
};

export interface Turn {
  role: 'learner' | 'stakeholder';
  text: string;
  ts?: string;
}

export interface ScoringInput {
  stage: StagePack;
  cards: QuestionCard[]; // for this stage
  transcript: Turn[];
  hintEvents?: Array<{
    card_id?: string;
    event_type: 'shown' | 'clicked' | 'edited' | 'asked';
    ts?: string;
  }>;
  passThreshold?: number; // stage default if omitted
  useEmbeddings?: boolean; // default true if OPENAI_API_KEY present
}

export interface ScoringOutput {
  coverageScores: Record<CoverageKey, number>; // 0..1 each
  technique: {
    openRatio: number;
    followUp: number;
    talkBalance: number;
    earlySolutioning: boolean;
  };
  independence: Record<CoverageKey, number>; // 0..1 each
  overall: number; // 0..1
  passed: boolean;
  coveredAreas: CoverageKey[];
  missedAreas: CoverageKey[];
  nextTimeScripts: string[]; // 5–8 lines
  evidence: Array<{
    key: CoverageKey;
    turnIdx: number;
    kind: 'direct_q' | 'follow_up' | 'stakeholder_prompted';
  }>;
}

// Constants for tuning
const COSINE_THRESHOLD = 0.32;
const BM25_GATE_MULTIPLIER = 0.6;
const BM25_MAX_MULTIPLIER = 0.4;
const RESPONSE_WORDS_THRESHOLD_FULL = 18;
const RESPONSE_WORDS_THRESHOLD_PARTIAL = 6;
const FOLLOW_UP_SIMILARITY_THRESHOLD = 0.28;
const LEVENSHTEIN_EDIT_THRESHOLD = 0.25;
const HINT_TIMEOUT_SECONDS = 30;

export class ScoringEngine {
  private keyToCards: Record<CoverageKey, QuestionCard[]> = {};
  private keyCentroids: Record<CoverageKey, number[]> = {};
  private keyBm25Index: Record<CoverageKey, BM25Index> = {};

  constructor() {}

  async scoreMeeting(input: ScoringInput): Promise<ScoringOutput> {
    // Build dynamic models from cards
    this.buildKeyModels(input.stage, input.cards);

    // Classify learner turns into coverage evidence
    const evidence = this.classifyLearnerTurns(input.transcript);

    // Compute coverage scores
    const coverageScores = this.computeCoverageScores(input.stage, evidence, input.transcript);

    // Compute technique metrics
    const technique = this.computeTechniqueMetrics(input.transcript);

    // Compute independence scores
    const independence = this.computeIndependenceScores(input.stage, evidence, input.hintEvents || []);

    // Compute overall score
    const overall = this.computeOverallScore(coverageScores, independence, technique, input.passThreshold || 0.65);

    // Generate next-time scripts
    const nextTimeScripts = this.generateNextTimeScripts(input.stage, coverageScores, input.cards, input.hintEvents || []);

    // Determine covered/missed areas
    const coveredAreas = Object.entries(coverageScores)
      .filter(([_, score]) => score >= 0.5)
      .map(([key, _]) => key);
    const missedAreas = Object.entries(coverageScores)
      .filter(([_, score]) => score < 0.5)
      .map(([key, _]) => key);

    return {
      coverageScores,
      technique,
      independence,
      overall,
      passed: overall >= (input.passThreshold || 0.65),
      coveredAreas,
      missedAreas,
      nextTimeScripts,
      evidence
    };
  }

  private buildKeyModels(stage: StagePack, cards: QuestionCard[]) {
    // Assign cards to coverage keys
    this.keyToCards = this.assignCardsToKeys(stage, cards);
    
    // Build centroids and BM25 indices for each key
    Object.entries(this.keyToCards).forEach(([key, keyCards]) => {
      if (keyCards.length > 0) {
        // For now, use BM25 fallback (embeddings can be added later)
        this.keyBm25Index[key] = new BM25Index(keyCards.map(card => card.text));
      }
    });
  }

  private assignCardsToKeys(stage: StagePack, cards: QuestionCard[]): Record<CoverageKey, QuestionCard[]> {
    const keyToCards: Record<CoverageKey, QuestionCard[]> = {};
    
    // Initialize empty arrays for each key
    stage.must_cover.forEach(key => {
      keyToCards[key] = [];
    });

    // Assign cards to keys using BM25 similarity
    cards.forEach(card => {
      let bestKey = '';
      let bestScore = 0;

      stage.must_cover.forEach(key => {
        const score = this.computeBM25Score(card.text, key);
        if (score > bestScore) {
          bestScore = score;
          bestKey = key;
        }
      });

      if (bestKey && bestScore > 0.1) { // Minimum threshold
        keyToCards[bestKey].push(card);
      }
    });

    return keyToCards;
  }

  private computeBM25Score(text: string, query: string): number {
    // Simple BM25 implementation
    const textTokens = this.tokenize(text);
    const queryTokens = this.tokenize(query);
    
    let score = 0;
    queryTokens.forEach(token => {
      const tf = textTokens.filter(t => t === token).length;
      if (tf > 0) {
        score += tf / (tf + 1.5); // k1 = 1.5
      }
    });
    
    return score;
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  private classifyLearnerTurns(transcript: Turn[]): Array<{
    key: CoverageKey;
    turnIdx: number;
    kind: 'direct_q' | 'follow_up' | 'stakeholder_prompted';
  }> {
    const evidence: Array<{
      key: CoverageKey;
      turnIdx: number;
      kind: 'direct_q' | 'follow_up' | 'stakeholder_prompted';
    }> = [];

    transcript.forEach((turn, idx) => {
      if (turn.role === 'learner') {
        const isOpen = this.isOpenQuestion(turn.text);
        const isFollowUp = this.isFollowUpQuestion(turn.text, transcript, idx);
        
        // Classify the turn to a coverage key
        const bestKey = this.classifyTurnToKey(turn.text);
        
        if (bestKey) {
          evidence.push({
            key: bestKey,
            turnIdx: idx,
            kind: isFollowUp ? 'follow_up' : 'direct_q'
          });
        }
      }
    });

    return evidence;
  }

  private isOpenQuestion(text: string): boolean {
    return !/^(is|are|do|does|did|can|will|have|has|should|could)\b/i.test(text);
  }

  private isFollowUpQuestion(text: string, transcript: Turn[], turnIdx: number): boolean {
    // Check for follow-up phrases
    if (/(you mentioned|earlier you said|can you expand|tell me more)/i.test(text)) {
      return true;
    }

    // Check similarity with previous stakeholder turn
    if (turnIdx > 0 && transcript[turnIdx - 1].role === 'stakeholder') {
      const similarity = this.computeSimilarity(text, transcript[turnIdx - 1].text);
      return similarity > FOLLOW_UP_SIMILARITY_THRESHOLD;
    }

    return false;
  }

  private computeSimilarity(text1: string, text2: string): number {
    // Simple cosine similarity using word overlap
    const tokens1 = new Set(this.tokenize(text1));
    const tokens2 = new Set(this.tokenize(text2));
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    return intersection.size / union.size;
  }

  private classifyTurnToKey(turnText: string): CoverageKey | null {
    let bestKey = '';
    let bestScore = 0;

    Object.entries(this.keyBm25Index).forEach(([key, index]) => {
      const scores = index.search(turnText);
      const maxScore = Math.max(...scores);
      
      if (maxScore > bestScore) {
        bestScore = maxScore;
        bestKey = key;
      }
    });

    // Apply dynamic threshold
    const allScores = Object.values(this.keyBm25Index).flatMap(index => index.search(turnText));
    const meanScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const maxScore = Math.max(...allScores);
    const threshold = BM25_GATE_MULTIPLIER * meanScore + BM25_MAX_MULTIPLIER * maxScore;

    return bestScore >= threshold ? bestKey : null;
  }

  private computeCoverageScores(
    stage: StagePack, 
    evidence: Array<{key: CoverageKey; turnIdx: number; kind: string}>, 
    transcript: Turn[]
  ): Record<CoverageKey, number> {
    const coverageScores: Record<CoverageKey, number> = {};
    
    stage.must_cover.forEach(key => {
      const keyEvidence = evidence.filter(e => e.key === key);
      
      if (keyEvidence.length === 0) {
        coverageScores[key] = 0;
        return;
      }

      // Check if there's strong evidence
      const hasDirectQ = keyEvidence.some(e => e.kind === 'direct_q');
      const hasMultipleFollowUps = keyEvidence.filter(e => e.kind === 'follow_up').length >= 2;
      
      // Check stakeholder response length
      const firstEvidence = keyEvidence[0];
      const nextTurn = transcript[firstEvidence.turnIdx + 1];
      const responseWords = nextTurn && nextTurn.role === 'stakeholder' 
        ? this.tokenize(nextTurn.text).length 
        : 0;

      if ((hasDirectQ || hasMultipleFollowUps) && responseWords >= RESPONSE_WORDS_THRESHOLD_FULL) {
        coverageScores[key] = 1.0;
      } else if (responseWords >= RESPONSE_WORDS_THRESHOLD_PARTIAL) {
        coverageScores[key] = 0.5;
      } else {
        coverageScores[key] = 0.0;
      }
    });

    return coverageScores;
  }

  private computeTechniqueMetrics(transcript: Turn[]) {
    const learnerTurns = transcript.filter(t => t.role === 'learner');
    const stakeholderTurns = transcript.filter(t => t.role === 'stakeholder');
    
    const openQuestions = learnerTurns.filter(t => this.isOpenQuestion(t.text)).length;
    const followUps = learnerTurns.filter((t, idx) => this.isFollowUpQuestion(t.text, transcript, idx)).length;
    
    const openRatio = learnerTurns.length > 0 ? openQuestions / learnerTurns.length : 0;
    const followUpRatio = learnerTurns.length > 0 ? followUps / learnerTurns.length : 0;
    
    // Compute talk balance
    const learnerWords = learnerTurns.reduce((sum, t) => sum + this.tokenize(t.text).length, 0);
    const stakeholderWords = stakeholderTurns.reduce((sum, t) => sum + this.tokenize(t.text).length, 0);
    const totalWords = learnerWords + stakeholderWords;
    const talkBalance = totalWords > 0 ? stakeholderWords / totalWords : 0.5;
    const talkBalanceScore = 1 - Math.abs(talkBalance - 0.5) / 0.5;
    
    // Check for early solutioning
    const earlySolutioning = this.detectEarlySolutioning(transcript);
    
    return {
      openRatio,
      followUp: followUpRatio,
      talkBalance: talkBalanceScore,
      earlySolutioning
    };
  }

  private detectEarlySolutioning(transcript: Turn[]): boolean {
    const solutioningPattern = /(we should build|let'?s (build|implement|create)|i will (create|build)|add a feature|the api should|we can automate)/i;
    
    // Check first few learner turns for solutioning
    const earlyTurns = transcript
      .filter(t => t.role === 'learner')
      .slice(0, 3);
    
    return earlyTurns.some(turn => solutioningPattern.test(turn.text));
  }

  private computeIndependenceScores(
    stage: StagePack,
    evidence: Array<{key: CoverageKey; turnIdx: number; kind: string}>,
    hintEvents: Array<{card_id?: string; event_type: string; ts?: string}>
  ): Record<CoverageKey, number> {
    const independence: Record<CoverageKey, number> = {};
    
    stage.must_cover.forEach(key => {
      const keyEvidence = evidence.filter(e => e.key === key);
      
      if (keyEvidence.length === 0) {
        independence[key] = 0;
        return;
      }

      const firstEvidence = keyEvidence[0];
      
      // Check for hint events in the 30 seconds before this evidence
      const hasRecentHint = hintEvents.some(event => {
        if (!event.ts || !firstEvidence.turnIdx) return false;
        
        const eventTime = new Date(event.ts).getTime();
        const evidenceTime = new Date().getTime(); // Approximate
        const timeDiff = (evidenceTime - eventTime) / 1000;
        
        return timeDiff <= HINT_TIMEOUT_SECONDS;
      });

      if (hasRecentHint) {
        independence[key] = 0.5; // Hint used
      } else {
        independence[key] = 1.0; // No hint used
      }
    });

    return independence;
  }

  private computeOverallScore(
    coverageScores: Record<CoverageKey, number>,
    independence: Record<CoverageKey, number>,
    technique: {openRatio: number; followUp: number; talkBalance: number; earlySolutioning: boolean},
    passThreshold: number
  ): number {
    const avgCoverage = Object.values(coverageScores).reduce((a, b) => a + b, 0) / Object.keys(coverageScores).length;
    const avgIndependence = Object.values(independence).reduce((a, b) => a + b, 0) / Object.keys(independence).length;
    
    const techniqueComposite = 0.4 * technique.openRatio + 
                              0.3 * technique.followUp + 
                              0.3 * technique.talkBalance;
    
    // Apply early solutioning penalty
    const finalTechnique = technique.earlySolutioning 
      ? Math.max(0, techniqueComposite - 0.2) 
      : techniqueComposite;
    
    // Use practice weights (can be made configurable)
    const overall = 0.6 * avgCoverage + 0.2 * avgIndependence + 0.2 * finalTechnique;
    
    return Math.min(1, Math.max(0, overall));
  }

  private generateNextTimeScripts(
    stage: StagePack,
    coverageScores: Record<CoverageKey, number>,
    cards: QuestionCard[],
    hintEvents: Array<{card_id?: string; event_type: string; ts?: string}>
  ): string[] {
    // Sort keys by coverage score ascending
    const sortedKeys = Object.entries(coverageScores)
      .sort(([,a], [,b]) => a - b)
      .map(([key, _]) => key);
    
    // Get the 2-3 lowest scoring keys
    const lowScoreKeys = sortedKeys.slice(0, Math.min(3, sortedKeys.length));
    
    const scripts: string[] = [];
    
    lowScoreKeys.forEach(key => {
      const keyCards = this.keyToCards[key] || [];
      const unusedCards = keyCards.filter(card => 
        !hintEvents.some(event => event.card_id === card.id)
      );
      
      if (unusedCards.length > 0) {
        scripts.push(`For ${key.replace(/_/g, ' ')}: "${unusedCards[0].text}"`);
      } else if (keyCards.length > 0) {
        scripts.push(`For ${key.replace(/_/g, ' ')}: "${keyCards[0].text}"`);
      }
    });
    
    return scripts.slice(0, 5); // Limit to 5 scripts
  }
}

// Simple BM25 implementation
class BM25Index {
  private documents: string[];
  private avgDocLength: number;
  private idf: Map<string, number>;

  constructor(documents: string[]) {
    this.documents = documents;
    this.avgDocLength = this.computeAvgDocLength();
    this.idf = this.computeIDF();
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  private computeAvgDocLength(): number {
    const totalLength = this.documents.reduce((sum, doc) => 
      sum + this.tokenize(doc).length, 0);
    return totalLength / this.documents.length;
  }

  private computeIDF(): Map<string, number> {
    const idf = new Map<string, number>();
    const N = this.documents.length;
    
    const allTokens = new Set<string>();
    this.documents.forEach(doc => {
      this.tokenize(doc).forEach(token => allTokens.add(token));
    });
    
    allTokens.forEach(token => {
      const docFreq = this.documents.filter(doc => 
        this.tokenize(doc).includes(token)
      ).length;
      idf.set(token, Math.log((N - docFreq + 0.5) / (docFreq + 0.5)));
    });
    
    return idf;
  }

  search(query: string): number[] {
    const queryTokens = this.tokenize(query);
    const k1 = 1.5;
    const b = 0.75;
    
    return this.documents.map(doc => {
      const docTokens = this.tokenize(doc);
      const docLength = docTokens.length;
      
      let score = 0;
      queryTokens.forEach(token => {
        const tf = docTokens.filter(t => t === token).length;
        const idfValue = this.idf.get(token) || 0;
        
        if (tf > 0) {
          score += idfValue * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * docLength / this.avgDocLength));
        }
      });
      
      return score;
    });
  }
}





























