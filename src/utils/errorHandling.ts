export interface ErrorContext {
  component: string;
  action: string;
  userMessage?: string;
  stakeholderName?: string;
  additionalData?: any;
}

export interface ErrorResponse {
  userFriendlyMessage: string;
  shouldRetry: boolean;
  logLevel: 'warn' | 'error' | 'critical';
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCount = 0;
  private lastErrorTime = 0;
  private readonly maxErrorsPerMinute = 10;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error | string, context: ErrorContext): ErrorResponse {
    const errorMessage = error instanceof Error ? error.message : error;
    const now = Date.now();

    // Rate limiting
    if (now - this.lastErrorTime < 60000) {
      this.errorCount++;
      if (this.errorCount > this.maxErrorsPerMinute) {
        return {
          userFriendlyMessage: 'System is experiencing high load. Please try again in a moment.',
          shouldRetry: false,
          logLevel: 'warn'
        };
      }
    } else {
      this.errorCount = 1;
      this.lastErrorTime = now;
    }

    // Log the error with context
    console.error(`❌ [${context.component}] ${context.action}:`, {
      error: errorMessage,
      context,
      timestamp: new Date().toISOString()
    });

    // Categorize errors and provide appropriate responses
    if (errorMessage.includes('stakeholders') || errorMessage.includes('configuration')) {
      return {
        userFriendlyMessage: 'Meeting configuration error. Please restart the meeting.',
        shouldRetry: false,
        logLevel: 'error'
      };
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      return {
        userFriendlyMessage: 'Connection timeout. Please check your internet and try again.',
        shouldRetry: true,
        logLevel: 'warn'
      };
    }

    if (errorMessage.includes('API') || errorMessage.includes('OpenAI')) {
      return {
        userFriendlyMessage: 'AI service temporarily unavailable. Please try again.',
        shouldRetry: true,
        logLevel: 'error'
      };
    }

    if (errorMessage.includes('audio') || errorMessage.includes('TTS')) {
      return {
        userFriendlyMessage: 'Audio service issue. Text responses will still work.',
        shouldRetry: false,
        logLevel: 'warn'
      };
    }

    // Default error response
    return {
      userFriendlyMessage: 'An unexpected error occurred. Please try again.',
      shouldRetry: true,
      logLevel: 'error'
    };
  }

  validateStakeholders(stakeholders: any[]): { isValid: boolean; error?: string } {
    if (!stakeholders || stakeholders.length === 0) {
      return { isValid: false, error: 'No stakeholders selected for meeting' };
    }

    for (const stakeholder of stakeholders) {
      if (!stakeholder?.name || !stakeholder?.role) {
        return { isValid: false, error: 'Invalid stakeholder configuration' };
      }
    }

    return { isValid: true };
  }

  validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message?.trim()) {
      return { isValid: false, error: 'Empty or invalid message' };
    }

    if (message.length > 1000) {
      return { isValid: false, error: 'Message too long' };
    }

    return { isValid: true };
  }

  validateSystemStatus(aiStatus: any, kbStatus: any): { isValid: boolean; error?: string } {
    if (!aiStatus?.initialized) {
      return { isValid: false, error: 'AI system not initialized' };
    }

    if (!kbStatus?.initialized) {
      return { isValid: false, error: 'Knowledge base not initialized' };
    }

    return { isValid: true };
  }

  // Retry logic with exponential backoff
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // Timeout wrapper
  async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number = 30000
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
    });

    return Promise.race([operation, timeoutPromise]);
  }

  // Health check
  getHealthStatus(): { healthy: boolean; errorCount: number; lastErrorTime: number } {
    return {
      healthy: this.errorCount < this.maxErrorsPerMinute,
      errorCount: this.errorCount,
      lastErrorTime: this.lastErrorTime
    };
  }

  // Reset error tracking
  reset(): void {
    this.errorCount = 0;
    this.lastErrorTime = 0;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
