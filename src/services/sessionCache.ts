/**
 * Session Cache Service
 * Manages user-scoped conversation context and detection caching
 */

interface StakeholderContext {
  name: string;
  role: string;
  department: string;
  priorities: string[];
  personality: string;
  expertise: string[];
}

interface CachedDetection {
  lastStakeholder: string | null;
  lastPhase: string | null;
  lastTopic: string | null;
  lastConfidence: number;
  timestamp: number;
  conversationContext: string[];
}

interface UserSession {
  userId: string;
  detection: CachedDetection;
  conversationHistory: Array<{
    speaker: string;
    content: string;
    timestamp: number;
    stakeholderName?: string;
  }>;
  createdAt: number;
  lastAccessed: number;
}

class SessionCacheService {
  private static instance: SessionCacheService;
  private sessions: Map<string, UserSession> = new Map();
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

  private constructor() {
    // Start cleanup timer
    setInterval(() => this.cleanupExpiredSessions(), this.CLEANUP_INTERVAL);
  }

  public static getInstance(): SessionCacheService {
    if (!SessionCacheService.instance) {
      SessionCacheService.instance = new SessionCacheService();
    }
    return SessionCacheService.instance;
  }

  /**
   * Get or create user session
   */
  public getSession(userId: string): UserSession {
    let session = this.sessions.get(userId);
    
    if (!session) {
      session = {
        userId,
        detection: {
          lastStakeholder: null,
          lastPhase: null,
          lastTopic: null,
          lastConfidence: 0,
          timestamp: 0,
          conversationContext: []
        },
        conversationHistory: [],
        createdAt: Date.now(),
        lastAccessed: Date.now()
      };
      this.sessions.set(userId, session);
      console.log(`🆕 Created new session for user: ${userId}`);
    } else {
      session.lastAccessed = Date.now();
    }
    
    return session;
  }

  /**
   * Update detection cache for user
   */
  public updateDetectionCache(
    userId: string, 
    stakeholder: string | null, 
    phase: string | null, 
    topic: string | null,
    confidence: number
  ): void {
    const session = this.getSession(userId);
    
    session.detection = {
      lastStakeholder: stakeholder,
      lastPhase: phase,
      lastTopic: topic,
      lastConfidence: confidence,
      timestamp: Date.now(),
      conversationContext: [...session.detection.conversationContext.slice(-5), topic || ''].filter(Boolean)
    };
    
    console.log(`💾 Updated detection cache for ${userId}:`, {
      stakeholder,
      phase,
      topic,
      confidence
    });
  }

  /**
   * Get cached detection for user
   */
  public getCachedDetection(userId: string): CachedDetection | null {
    const session = this.sessions.get(userId);
    if (!session) return null;
    
    // Return cache if it's recent (within 5 minutes)
    const isRecent = Date.now() - session.detection.timestamp < 5 * 60 * 1000;
    
    if (isRecent && session.detection.lastStakeholder) {
      console.log(`🔄 Using cached detection for ${userId}:`, session.detection);
      return session.detection;
    }
    
    return null;
  }

  /**
   * Add message to conversation history
   */
  public addMessage(
    userId: string, 
    speaker: string, 
    content: string, 
    stakeholderName?: string
  ): void {
    const session = this.getSession(userId);
    
    session.conversationHistory.push({
      speaker,
      content,
      timestamp: Date.now(),
      stakeholderName
    });
    
    // Keep only last 20 messages for memory efficiency
    if (session.conversationHistory.length > 20) {
      session.conversationHistory = session.conversationHistory.slice(-20);
    }
  }

  /**
   * Get conversation context for user
   */
  public getConversationContext(userId: string): string {
    const session = this.sessions.get(userId);
    if (!session || session.conversationHistory.length === 0) {
      return '';
    }
    
    // Get last 5 messages for context
    const recentMessages = session.conversationHistory.slice(-5);
    const context = recentMessages
      .map(msg => `${msg.stakeholderName || msg.speaker}: ${msg.content.substring(0, 100)}`)
      .join(' | ');
    
    return context;
  }

  /**
   * Get last speaker for user
   */
  public getLastSpeaker(userId: string): string | null {
    const session = this.sessions.get(userId);
    if (!session || session.conversationHistory.length === 0) {
      return null;
    }
    
    const lastMessage = session.conversationHistory[session.conversationHistory.length - 1];
    return lastMessage.stakeholderName || lastMessage.speaker;
  }

  /**
   * Should use cached result based on confidence and context similarity
   */
  public shouldUseCachedResult(
    userId: string, 
    currentMessage: string, 
    currentConfidence: number
  ): boolean {
    const cached = this.getCachedDetection(userId);
    if (!cached) return false;
    
    // Use cache if:
    // 1. Current confidence is low (< 0.6)
    // 2. Cached confidence was good (> 0.7)
    // 3. Message seems related to cached topic
    // 4. Cache is recent (within 5 minutes)
    
    const isLowConfidence = currentConfidence < 0.6;
    const hadGoodCachedConfidence = cached.lastConfidence > 0.7;
    const isRecent = Date.now() - cached.timestamp < 5 * 60 * 1000;
    
    if (isLowConfidence && hadGoodCachedConfidence && isRecent) {
      // Check topic similarity (simple keyword matching)
      const currentWords = currentMessage.toLowerCase().split(/\s+/);
      const cachedContext = cached.conversationContext.join(' ').toLowerCase();
      const commonWords = currentWords.filter(word => 
        word.length > 3 && cachedContext.includes(word)
      );
      
      const topicSimilarity = commonWords.length / Math.max(currentWords.length, 1);
      
      if (topicSimilarity > 0.2) { // 20% word overlap
        console.log(`🎯 Using cached result for ${userId} due to low confidence but topic similarity`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Clear session for user
   */
  public clearSession(userId: string): void {
    this.sessions.delete(userId);
    console.log(`🗑️ Cleared session for user: ${userId}`);
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [userId, session] of this.sessions.entries()) {
      if (now - session.lastAccessed > this.SESSION_TIMEOUT) {
        this.sessions.delete(userId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  /**
   * Get session stats (for debugging)
   */
  public getStats(): { totalSessions: number; oldestSession: number; newestSession: number } {
    const sessions = Array.from(this.sessions.values());
    return {
      totalSessions: sessions.length,
      oldestSession: sessions.length > 0 ? Math.min(...sessions.map(s => s.createdAt)) : 0,
      newestSession: sessions.length > 0 ? Math.max(...sessions.map(s => s.createdAt)) : 0
    };
  }
}

export default SessionCacheService;