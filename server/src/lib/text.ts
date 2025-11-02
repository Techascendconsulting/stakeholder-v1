/**
 * Text utilities for coaching and question analysis
 */

// Constants
const CLOSED_PREFIX_REGEX = /^(is|are|do|does|did|can|could|should|would|will|have|has|may|might)\b/i;
const FOLLOWUP_SIM_THRESHOLD = 0.28;
const STRONG_ANSWER_WORDS = 18;

/**
 * Normalize text for analysis
 */
export function normalize(q: string): string {
  return q.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

/**
 * Check if a question is closed (yes/no answer)
 */
export function isClosedQuestion(q: string): boolean {
  if (!q || typeof q !== 'string') return false;
  
  const normalized = normalize(q);
  return CLOSED_PREFIX_REGEX.test(normalized);
}

/**
 * Rewrite closed questions to open-ended alternatives
 */
export function rewriteToOpen(q: string): string {
  if (!q || typeof q !== 'string') return q;
  
  const normalized = normalize(q);
  
  // Rule 1: Closed auxiliary verbs
  if (CLOSED_PREFIX_REGEX.test(normalized)) {
    const original = q.trim();
    
    // Common patterns
    if (/^is\s+/i.test(original)) {
      return original.replace(/^is\s+(.+?)\s*\?*$/i, 'What makes $1 feel that way?');
    }
    if (/^are\s+/i.test(original)) {
      return original.replace(/^are\s+(.+?)\s*\?*$/i, 'How do $1 typically work?');
    }
    if (/^do\s+/i.test(original)) {
      return original.replace(/^do\s+(.+?)\s*\?*$/i, 'How do $1 usually happen?');
    }
    if (/^does\s+/i.test(original)) {
      return original.replace(/^does\s+(.+?)\s*\?*$/i, 'How does $1 typically work?');
    }
    if (/^can\s+/i.test(original)) {
      return original.replace(/^can\s+(.+?)\s*\?*$/i, 'How do $1 usually work, and what challenges do you face?');
    }
    if (/^will\s+/i.test(original)) {
      return original.replace(/^will\s+(.+?)\s*\?*$/i, 'What would success look like for $1?');
    }
    if (/^should\s+/i.test(original)) {
      return original.replace(/^should\s+(.+?)\s*\?*$/i, 'What options have you considered for $1, and what would success look like?');
    }
    if (/^have\s+/i.test(original)) {
      return original.replace(/^have\s+(.+?)\s*\?*$/i, 'What has been your experience with $1?');
    }
    if (/^has\s+/i.test(original)) {
      return original.replace(/^has\s+(.+?)\s*\?*$/i, 'How has $1 been working for you?');
    }
  }
  
  // Rule 2: Yes/no patterns
  if (/\?\s*$/.test(q) && (q.includes(' or ') || q.includes(' either ') || q.includes(' both '))) {
    return q.replace(/\?\s*$/, '').replace(/^(do|does|are|is)\s+/i, 'How do you feel about ');
  }
  
  // Rule 3: Imperative/leading questions
  if (/should\s+we\s+(build|implement|create|add)/i.test(q)) {
    return 'What options have you considered, and what would success look like?';
  }
  
  // Default: return original if no rules match
  return q;
}

/**
 * Check if a question looks like a follow-up
 */
export function looksLikeFollowUp(q: string, prevStakeholderText?: string): boolean {
  if (!q || typeof q !== 'string') return false;
  
  const normalized = normalize(q);
  
  // Regex-based follow-up detection
  const followupPatterns = [
    /^(you mentioned|earlier you said|can you expand|tell me more)/i,
    /^(what do you mean|how so|in what way)/i,
    /^(that's interesting|that sounds)/i
  ];
  
  for (const pattern of followupPatterns) {
    if (pattern.test(normalized)) {
      return true;
    }
  }
  
  // TODO: Add cosine similarity check when embeddings are available
  // if (prevStakeholderText && embeddingsEnabled) {
  //   const similarity = cosineSimilarity(embed(q), embed(prevStakeholderText));
  //   return similarity >= FOLLOWUP_SIM_THRESHOLD;
  // }
  
  return false;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Check if response is substantial enough
 */
export function isSubstantialResponse(text: string, minWords: number = STRONG_ANSWER_WORDS): boolean {
  return countWords(text) >= minWords;
}

// Unit tests
if (process.env.NODE_ENV === 'test') {
  describe('Text Utilities', () => {
    describe('isClosedQuestion', () => {
      it('should detect closed questions', () => {
        expect(isClosedQuestion('Is onboarding slow?')).toBe(true);
        expect(isClosedQuestion('Do you use CRM?')).toBe(true);
        expect(isClosedQuestion('Can you explain this?')).toBe(true);
        expect(isClosedQuestion('Will this work?')).toBe(true);
        expect(isClosedQuestion('Should we build this?')).toBe(true);
      });
      
      it('should not detect open questions', () => {
        expect(isClosedQuestion('What makes onboarding slow?')).toBe(false);
        expect(isClosedQuestion('How do you handle this?')).toBe(false);
        expect(isClosedQuestion('Tell me about your process')).toBe(false);
        expect(isClosedQuestion('What challenges do you face?')).toBe(false);
      });
    });
    
    describe('rewriteToOpen', () => {
      it('should rewrite closed questions to open', () => {
        expect(rewriteToOpen('Is onboarding slow?')).toContain('What makes');
        expect(rewriteToOpen('Do you use CRM?')).toContain('How do');
        expect(rewriteToOpen('Can you explain blockers?')).toContain('How do');
        expect(rewriteToOpen('Should we build this?')).toContain('What options');
      });
      
      it('should preserve open questions', () => {
        const openQ = 'What makes onboarding slow?';
        expect(rewriteToOpen(openQ)).toBe(openQ);
      });
    });
    
    describe('looksLikeFollowUp', () => {
      it('should detect follow-up patterns', () => {
        expect(looksLikeFollowUp('You mentioned something about delays')).toBe(true);
        expect(looksLikeFollowUp('Earlier you said there were issues')).toBe(true);
        expect(looksLikeFollowUp('Can you expand on that?')).toBe(true);
        expect(looksLikeFollowUp('Tell me more about the process')).toBe(true);
      });
      
      it('should not detect non-follow-ups', () => {
        expect(looksLikeFollowUp('What is your process?')).toBe(false);
        expect(looksLikeFollowUp('How do you handle this?')).toBe(false);
      });
    });
  });
}





















