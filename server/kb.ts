import OpenAI from 'openai';

interface KBEntry {
  id: string;
  category: string;
  questions: string[];
  short: string;
  expanded: string;
  refs: string[];
}

interface SearchResult {
  entry: KBEntry;
  score: number;
  matchType: 'exact' | 'keyword' | 'semantic';
}

interface KnowledgeBase {
  project: string;
  company: string;
  knowledge_base: KBEntry[];
}

class HybridKnowledgeBase {
  private static instance: HybridKnowledgeBase;
  private openai: OpenAI;
  private kbData: KnowledgeBase | null = null;
  private embeddings: Map<string, number[]> = new Map();
  private isInitialized = false;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  public static getInstance(): HybridKnowledgeBase {
    if (!HybridKnowledgeBase.instance) {
      HybridKnowledgeBase.instance = new HybridKnowledgeBase();
    }
    return HybridKnowledgeBase.instance;
  }

  // Initialize the knowledge base
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load knowledge base data
      const response = await fetch('/data/kb_onboarding.json');
      this.kbData = await response.json();
      
      // Generate embeddings for all entries
      await this.generateEmbeddings();
      
      this.isInitialized = true;
      console.log(`✅ KB initialized with ${this.kbData.knowledge_base.length} entries`);
    } catch (error) {
      console.error('❌ Failed to initialize KB:', error);
      throw error;
    }
  }

  // Generate embeddings for all KB entries
  private async generateEmbeddings(): Promise<void> {
    if (!this.kbData) return;

    const entries = this.kbData.knowledge_base;
    const batchSize = 10; // Process in batches to avoid rate limits

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      const texts = batch.map(entry => 
        `${entry.questions.join(' ')} ${entry.short} ${entry.expanded}`
      );

      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: texts,
          encoding_format: 'float'
        });

        batch.forEach((entry, index) => {
          this.embeddings.set(entry.id, response.data[index].embedding);
        });

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('❌ Failed to generate embeddings for batch:', error);
      }
    }
  }

  // Hybrid search combining keyword and semantic matching
  public async searchKB(query: string): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.kbData) {
      return [];
    }

    const normalizedQuery = this.normalizeQuery(query);
    const results: SearchResult[] = [];

    // 1. Exact match search
    const exactMatches = this.findExactMatches(normalizedQuery);
    results.push(...exactMatches.map(entry => ({
      entry,
      score: 1.0,
      matchType: 'exact' as const
    })));

    // 2. Keyword-based search (BM25-like scoring)
    const keywordMatches = this.findKeywordMatches(normalizedQuery);
    results.push(...keywordMatches);

    // 3. Semantic search using embeddings
    const semanticMatches = await this.findSemanticMatches(normalizedQuery);
    results.push(...semanticMatches);

    // 4. Deduplicate and sort by score
    const uniqueResults = this.deduplicateResults(results);
    return uniqueResults.sort((a, b) => b.score - a.score);
  }

  // Normalize query for better matching
  private normalizeQuery(query: string): string {
    return query.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Find exact matches in questions
  private findExactMatches(query: string): KBEntry[] {
    if (!this.kbData) return [];

    return this.kbData.knowledge_base.filter(entry =>
      entry.questions.some(question =>
        this.normalizeQuery(question) === query ||
        this.normalizeQuery(question).includes(query) ||
        query.includes(this.normalizeQuery(question))
      )
    );
  }

  // Find keyword matches with BM25-like scoring
  private findKeywordMatches(query: string): SearchResult[] {
    if (!this.kbData) return [];

    const queryWords = query.split(' ').filter(word => word.length > 2);
    const results: SearchResult[] = [];

    this.kbData.knowledge_base.forEach(entry => {
      const allText = `${entry.questions.join(' ')} ${entry.short} ${entry.expanded}`.toLowerCase();
      let score = 0;

      queryWords.forEach(word => {
        const wordCount = (allText.match(new RegExp(word, 'g')) || []).length;
        if (wordCount > 0) {
          score += wordCount * 0.1; // Weight by frequency
        }
      });

      if (score > 0) {
        results.push({
          entry,
          score: Math.min(score, 0.8), // Cap at 0.8 for keyword matches
          matchType: 'keyword'
        });
      }
    });

    return results;
  }

  // Find semantic matches using embeddings
  private async findSemanticMatches(query: string): Promise<SearchResult[]> {
    if (!this.kbData || this.embeddings.size === 0) return [];

    try {
      // Generate embedding for query
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float'
      });

      const queryEmbedding = response.data[0].embedding;
      const results: SearchResult[] = [];

      // Calculate cosine similarity with all KB entries
      this.kbData.knowledge_base.forEach(entry => {
        const entryEmbedding = this.embeddings.get(entry.id);
        if (entryEmbedding) {
          const similarity = this.cosineSimilarity(queryEmbedding, entryEmbedding);
          if (similarity > 0.3) { // Threshold for semantic matches
            results.push({
              entry,
              score: similarity * 0.6, // Scale semantic scores
              matchType: 'semantic'
            });
          }
        }
      });

      return results;
    } catch (error) {
      console.error('❌ Semantic search failed:', error);
      return [];
    }
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Deduplicate results and combine scores
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const uniqueMap = new Map<string, SearchResult>();

    results.forEach(result => {
      const existing = uniqueMap.get(result.entry.id);
      if (!existing || result.score > existing.score) {
        uniqueMap.set(result.entry.id, result);
      }
    });

    return Array.from(uniqueMap.values());
  }

  // Get entry by ID
  public getEntryById(id: string): KBEntry | null {
    if (!this.kbData) return null;
    return this.kbData.knowledge_base.find(entry => entry.id === id) || null;
  }

  // Get all entries
  public getAllEntries(): KBEntry[] {
    if (!this.kbData) return [];
    return this.kbData.knowledge_base;
  }

  // Get entries by category
  public getEntriesByCategory(category: string): KBEntry[] {
    if (!this.kbData) return [];
    return this.kbData.knowledge_base.filter(entry => entry.category === category);
  }

  // Get statistics
  public getStats(): { totalEntries: number; categories: Record<string, number> } {
    if (!this.kbData) return { totalEntries: 0, categories: {} };

    const categories: Record<string, number> = {};
    this.kbData.knowledge_base.forEach(entry => {
      categories[entry.category] = (categories[entry.category] || 0) + 1;
    });

    return {
      totalEntries: this.kbData.knowledge_base.length,
      categories
    };
  }
}

export default HybridKnowledgeBase;
export type { KBEntry, SearchResult, KnowledgeBase };
