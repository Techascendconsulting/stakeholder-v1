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
  matchedQuestion?: string;
}

class KnowledgeBase {
  private entries: KBEntry[] = [];
  private initialized = false;
  private initializationError: string | null = null;

  async initialize(): Promise<boolean> {
    try {
      // Load KB data dynamically
      const response = await fetch('/data/kb_onboarding.json');
      if (!response.ok) {
        throw new Error(`Failed to load KB data: ${response.status}`);
      }
      
      const kbData = await response.json();
      
      // Extract knowledge_base array from the JSON structure
      const knowledgeBaseArray = kbData.knowledge_base || kbData;
      
      // Validate KB data structure
      if (!knowledgeBaseArray || !Array.isArray(knowledgeBaseArray)) {
        throw new Error('Invalid KB data structure: expected array');
      }

      // Validate each entry
      const validatedEntries: KBEntry[] = [];
      for (const entry of knowledgeBaseArray) {
        if (!this.validateKBEntry(entry)) {
          console.warn(`⚠️ Skipping invalid KB entry: ${entry?.id || 'unknown'}`);
          continue;
        }
        validatedEntries.push(entry as KBEntry);
      }

      if (validatedEntries.length === 0) {
        throw new Error('No valid KB entries found');
      }

      this.entries = validatedEntries;
      this.initialized = true;
      this.initializationError = null;
      
      console.log(`✅ KB initialized successfully with ${this.entries.length} entries`);
      return true;

    } catch (error) {
      this.initializationError = error instanceof Error ? error.message : 'Unknown initialization error';
      console.error('❌ Failed to initialize KB:', this.initializationError);
      
      // Provide fallback entries for critical functionality
      this.entries = this.getFallbackEntries();
      this.initialized = true;
      
      console.log(`⚠️ Using fallback KB with ${this.entries.length} entries`);
      return false;
    }
  }

  private validateKBEntry(entry: any): boolean {
    if (!entry || typeof entry !== 'object') return false;
    
    const requiredFields = ['id', 'category', 'questions', 'short', 'expanded', 'refs'];
    for (const field of requiredFields) {
      if (!(field in entry)) return false;
    }

    if (!Array.isArray(entry.questions) || entry.questions.length === 0) return false;
    if (!Array.isArray(entry.refs)) return false;
    if (typeof entry.short !== 'string' || entry.short.trim() === '') return false;
    if (typeof entry.expanded !== 'string' || entry.expanded.trim() === '') return false;

    return true;
  }

  private extractKeyTerms(query: string): string[] {
    // Common words to ignore
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'his', 'hers', 'ours', 'theirs',
      'what', 'when', 'where', 'why', 'how', 'who', 'which', 'whom', 'whose',
      'ok', 'okay', 'yes', 'no', 'not', 'so', 'very', 'just', 'now', 'then', 'here', 'there',
      'go', 'going', 'went', 'gone', 'want', 'wants', 'wanted', 'tell', 'tells', 'told',
      'know', 'knows', 'knew', 'understand', 'understands', 'understood', 'like', 'likes', 'liked',
      'please', 'thanks', 'thank', 'hello', 'hi', 'hey', 'good', 'morning', 'afternoon', 'evening'
    ]);

    // Extract meaningful terms
    const words = query.split(/\s+/).filter(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      return cleanWord.length > 2 && !stopWords.has(cleanWord);
    });

    // Add semantic variations for common terms
    const semanticTerms = new Set(words);
    
    // Process-specific terms
    if (words.some(w => ['process', 'workflow', 'steps', 'stages'].includes(w))) {
      semanticTerms.add('process');
      semanticTerms.add('workflow');
      semanticTerms.add('steps');
    }
    
    if (words.some(w => ['current', 'now', 'present', 'existing'].includes(w))) {
      semanticTerms.add('current');
      semanticTerms.add('as-is');
    }
    
    if (words.some(w => ['break', 'breakdown', 'explain', 'describe', 'detail'].includes(w))) {
      semanticTerms.add('explain');
      semanticTerms.add('describe');
      semanticTerms.add('detail');
    }
    
    if (words.some(w => ['understand', 'know', 'learn', 'find'].includes(w))) {
      semanticTerms.add('understand');
      semanticTerms.add('know');
    }

    return Array.from(semanticTerms);
  }

  private getFallbackEntries(): KBEntry[] {
    return [
      {
        id: 'KB-FALLBACK-001',
        category: 'general',
        questions: ['what is this project', 'tell me about the project', 'project overview'],
        short: 'This is a Customer Onboarding Process Optimization project at TechCorp Solutions.',
        expanded: 'We are working on optimizing the customer onboarding process at TechCorp Solutions. The current process takes 6 to 8 weeks and has a 23% churn rate. Our goal is to reduce onboarding time to 3 to 4 weeks and decrease churn by 40%.',
        refs: ['project_overview', 'goals']
      },
      {
        id: 'KB-FALLBACK-002',
        category: 'problem',
        questions: ['what are the problems', 'current issues', 'pain points'],
        short: 'Current issues include lengthy onboarding timeline, high churn rate, and fragmented processes across departments.',
        expanded: 'The main problems are: 1) Onboarding takes 6 to 8 weeks, 2) 23% churn rate within 90 days, 3) Fragmented processes across 7 departments, 4) Manual handoffs causing delays, 5) No centralized tracking system.',
        refs: ['problems', 'pain_points']
      }
    ];
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getInitializationError(): string | null {
    return this.initializationError;
  }

  getEntryCount(): number {
    return this.entries.length;
  }

  async search(query: string, maxResults: number = 3): Promise<SearchResult[]> {
    if (!this.initialized) {
      console.warn('⚠️ KB not initialized, attempting to initialize...');
      await this.initialize();
    }

    if (this.entries.length === 0) {
      console.warn('⚠️ No KB entries available for search');
      return [];
    }

    try {
      // First, try AI-powered intent matching
      const aiResults = await this.aiPoweredSearch(query, maxResults);
      if (aiResults.length > 0) {
        console.log(`🤖 AI-powered search found ${aiResults.length} results`);
        return aiResults;
      }

      // Fallback to keyword search if AI search fails
      console.log(`🔄 AI search failed, falling back to keyword search`);
      return await this.keywordSearch(query, maxResults);

    } catch (error) {
      console.error('❌ Error during KB search:', error);
      return await this.keywordSearch(query, maxResults);
    }
  }

  private async aiPoweredSearch(query: string, maxResults: number): Promise<SearchResult[]> {
    try {
      // Get all available KB entries for context
      const allEntries = this.entries.map(entry => ({
        id: entry.id,
        category: entry.category,
        questions: entry.questions,
        short: entry.short,
        expanded: entry.expanded
      }));

      // Use OpenAI to find the most relevant entries
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a knowledge base search assistant. Given a user query and a list of knowledge base entries, find the most relevant entries.

Available KB entries:
${allEntries.map(entry => `
ID: ${entry.id}
Category: ${entry.category}
Questions: ${entry.questions.join(', ')}
Short: ${entry.short}
`).join('\n')}

User query: "${query}"

Return ONLY a JSON array of the most relevant entry IDs, ordered by relevance. Maximum ${maxResults} entries.
Format: ["KB-001", "KB-002", "KB-003"]`
          }
        ],
        max_tokens: 100,
        temperature: 0.1
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) return [];

      // Parse AI response to get relevant entry IDs
      const relevantIds = JSON.parse(aiResponse);
      console.log(`🤖 AI identified relevant entries: ${relevantIds.join(', ')}`);

      // Return the actual KB entries
      const results: SearchResult[] = [];
      for (const id of relevantIds) {
        const entry = this.entries.find(e => e.id === id);
        if (entry) {
          results.push({
            entry,
            score: 3.0, // High score for AI-selected entries
            matchedQuestion: 'AI-powered match'
          });
        }
      }

      return results.slice(0, maxResults);

    } catch (error) {
      console.error('❌ AI-powered search failed:', error);
      return [];
    }
  }

  private async keywordSearch(query: string, maxResults: number): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    // Extract key terms from query
    const keyTerms = this.extractKeyTerms(queryLower);
    console.log(`🔍 KEYWORD SEARCH: Query: "${query}", Key terms: [${keyTerms.join(', ')}]`);

    // Keyword-based search
    for (const entry of this.entries) {
      let score = 0;
      let matchedQuestion = '';

      // Check questions with key terms
      for (const question of entry.questions) {
        const questionLower = question.toLowerCase();
        for (const term of keyTerms) {
          if (questionLower.includes(term)) {
            score += 2;
            matchedQuestion = question;
            break; // Only count once per question
          }
        }
      }

      // Check short and expanded content with key terms
      const shortLower = entry.short.toLowerCase();
      const expandedLower = entry.expanded.toLowerCase();
      for (const term of keyTerms) {
        if (shortLower.includes(term)) {
          score += 1;
        }
        if (expandedLower.includes(term)) {
          score += 0.5;
        }
      }

      // Check references
      for (const ref of entry.refs) {
        const refLower = ref.toLowerCase();
        for (const term of keyTerms) {
          if (refLower.includes(term)) {
            score += 0.5;
          }
        }
      }

      if (score > 0) {
        results.push({
          entry,
          score,
          matchedQuestion: matchedQuestion || undefined
        });
        console.log(`🔍 KB Match: ${entry.id} (score: ${score}) for query: "${query}"`);
      }
    }

    // Sort by score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  async semanticSearch(query: string, maxResults: number = 3): Promise<SearchResult[]> {
    if (!this.initialized) {
      console.warn('⚠️ KB not initialized, attempting to initialize...');
      await this.initialize();
    }

    try {
      // For now, fall back to keyword search
      // TODO: Implement proper semantic search with embeddings
      return await this.search(query, maxResults);
    } catch (error) {
      console.error('❌ Error during semantic search:', error);
      return await this.search(query, maxResults);
    }
  }

  getEntryById(id: string): KBEntry | null {
    if (!this.initialized) {
      console.warn('⚠️ KB not initialized');
      return null;
    }

    return this.entries.find(entry => entry.id === id) || null;
  }

  getAllCategories(): string[] {
    if (!this.initialized) return [];
    
    const categories = new Set(this.entries.map(entry => entry.category));
    return Array.from(categories).sort();
  }

  getEntriesByCategory(category: string): KBEntry[] {
    if (!this.initialized) return [];
    
    return this.entries.filter(entry => entry.category === category);
  }
}

// Export singleton instance
export const kb = new KnowledgeBase();
