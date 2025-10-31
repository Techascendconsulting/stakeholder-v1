import OpenAI from 'openai';
import HybridKnowledgeBase, { SearchResult } from './kb';

interface AnswerResponse {
  answer: string;
  sources: string[];
  matchType: 'exact' | 'composed' | 'fallback';
  confidence: number;
}

class AnsweringPipeline {
  private static instance: AnsweringPipeline;
  private openai: OpenAI | null;
  private kb: HybridKnowledgeBase;

  private constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const hasValidApiKey = apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0;
    
    if (!hasValidApiKey) {
      console.warn('⚠️ OPENAI_API_KEY not set - AnsweringPipeline features will be disabled');
      this.openai = null;
    } else {
      try {
        this.openai = new OpenAI({
          apiKey: apiKey.trim(),
        });
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI client for AnsweringPipeline:', error);
        this.openai = null;
      }
    }
    this.kb = HybridKnowledgeBase.getInstance();
  }

  public static getInstance(): AnsweringPipeline {
    if (!AnsweringPipeline.instance) {
      AnsweringPipeline.instance = new AnsweringPipeline();
    }
    return AnsweringPipeline.instance;
  }

  // Main answering function - KB-first, LLM-second
  public async answer(userQuery: string): Promise<AnswerResponse> {
    try {
      // Normalize query
      const normalizedQuery = this.normalizeQuery(userQuery);

      // Step 1: Check for exact/near matches in KB
      const exactMatch = await this.findExactMatch(normalizedQuery);
      if (exactMatch) {
        return {
          answer: exactMatch.entry.short,
          sources: [exactMatch.entry.id],
          matchType: 'exact',
          confidence: exactMatch.score
        };
      }

      // Step 2: Search KB for relevant entries
      const searchResults = await this.kb.searchKB(normalizedQuery);
      const topResults = searchResults.filter(result => result.score >= 0.3).slice(0, 3);

      // Step 3: If no good matches, return fallback
      if (topResults.length === 0) {
        return this.getFallbackResponse();
      }

      // Step 4: Use LLM to compose answer from KB snippets
      const composedAnswer = await this.composeAnswer(userQuery, topResults);

      return {
        answer: composedAnswer,
        sources: topResults.map(result => result.entry.id),
        matchType: 'composed',
        confidence: topResults[0].score
      };

    } catch (error) {
      console.error('❌ Answering pipeline error:', error);
      return this.getFallbackResponse();
    }
  }

  // Normalize query for better matching
  private normalizeQuery(query: string): string {
    return query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Find exact or near-exact matches
  private async findExactMatch(query: string): Promise<SearchResult | null> {
    const results = await this.kb.searchKB(query);
    const exactMatch = results.find(result => 
      result.matchType === 'exact' && result.score >= 0.9
    );
    return exactMatch || null;
  }

  // Compose answer using LLM from KB snippets
  private async composeAnswer(userQuery: string, searchResults: SearchResult[]): Promise<string> {
    if (!this.openai) {
      console.warn('⚠️ OpenAI not configured, using fallback answer');
      const bestResult = searchResults[0];
      return bestResult ? bestResult.entry.short : this.getFallbackResponse().answer;
    }

    try {
      // Prepare context from top KB entries
      const context = searchResults.map(result => {
        const entry = result.entry;
        return `KB Entry ${entry.id} (${entry.category}):
Questions: ${entry.questions.join(', ')}
Short Answer: ${entry.short}
Expanded Answer: ${entry.expanded}
References: ${entry.refs.join(', ')}`;
      }).join('\n\n');

      const systemPrompt = `You are a Business Analyst assistant for the Customer Onboarding Process Optimization project at TechCorp Solutions.

IMPORTANT RULES:
1. Answer ONLY using information from the provided KB snippets
2. If a fact is not in the KB, say "I don't have that information in our project materials"
3. Keep answers concise (≤120 words)
4. Be professional but conversational
5. Reference specific facts from the KB when possible
6. Do not invent or assume any information not provided

KB Context:
${context}

User Query: ${userQuery}

Provide a clear, accurate answer based only on the KB information above.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery }
        ],
        max_tokens: 150,
        temperature: 0.3
      });

      const answer = response.choices[0]?.message?.content?.trim();
      return answer || this.getFallbackResponse().answer;

    } catch (error) {
      console.error('❌ LLM composition failed:', error);
      // Fallback to best KB entry
      const bestResult = searchResults[0];
      return bestResult ? bestResult.entry.short : this.getFallbackResponse().answer;
    }
  }

  // Get fallback response when no good matches found
  private getFallbackResponse(): AnswerResponse {
    return {
      answer: "I couldn't find that specific information in our onboarding project materials. I can help you with: project overview, current process, pain points, business goals, timeline, stakeholders, or specific process steps. What would you like to know about?",
      sources: [],
      matchType: 'fallback',
      confidence: 0
    };
  }

  // Get detailed answer with expanded information
  public async getDetailedAnswer(userQuery: string): Promise<AnswerResponse & { expanded?: string }> {
    const basicAnswer = await this.answer(userQuery);
    
    if (basicAnswer.sources.length > 0) {
      const firstSource = this.kb.getEntryById(basicAnswer.sources[0]);
      if (firstSource) {
        return {
          ...basicAnswer,
          expanded: firstSource.expanded
        };
      }
    }
    
    return basicAnswer;
  }

  // Get multiple relevant answers for complex queries
  public async getMultipleAnswers(userQuery: string): Promise<AnswerResponse[]> {
    const searchResults = await this.kb.searchKB(userQuery);
    const topResults = searchResults.filter(result => result.score >= 0.3).slice(0, 3);
    
    return topResults.map(result => ({
      answer: result.entry.short,
      sources: [result.entry.id],
      matchType: result.matchType === 'exact' ? 'exact' : 'composed',
      confidence: result.score
    }));
  }

  // Search KB entries by category
  public async searchByCategory(category: string): Promise<SearchResult[]> {
    const entries = this.kb.getEntriesByCategory(category);
    return entries.map(entry => ({
      entry,
      score: 1.0,
      matchType: 'exact' as const
    }));
  }

  // Get KB statistics
  public getKBStats() {
    return this.kb.getStats();
  }
}

export default AnsweringPipeline;
export type { AnswerResponse };
