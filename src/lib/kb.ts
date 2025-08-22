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
      
      // Validate KB data structure
      if (!kbData || !Array.isArray(kbData)) {
        throw new Error('Invalid KB data structure: expected array');
      }

      // Validate each entry
      const validatedEntries: KBEntry[] = [];
      for (const entry of kbData) {
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
      const results: SearchResult[] = [];
      const queryLower = query.toLowerCase();

      // Keyword-based search
      for (const entry of this.entries) {
        let score = 0;
        let matchedQuestion = '';

        // Check questions
        for (const question of entry.questions) {
          if (question.toLowerCase().includes(queryLower)) {
            score += 2;
            matchedQuestion = question;
          }
        }

        // Check short and expanded content
        if (entry.short.toLowerCase().includes(queryLower)) {
          score += 1;
        }
        if (entry.expanded.toLowerCase().includes(queryLower)) {
          score += 0.5;
        }

        // Check references
        for (const ref of entry.refs) {
          if (ref.toLowerCase().includes(queryLower)) {
            score += 0.5;
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

    } catch (error) {
      console.error('❌ Error during KB search:', error);
      return [];
    }
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
