import { singleAgentSystem } from '../services/singleAgentSystem';
import { kb } from '../lib/kb';
import { errorHandler } from './errorHandling';

export interface ValidationResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: ValidationResult[];
  timestamp: string;
  recommendations: string[];
}

export class SystemValidator {
  private static instance: SystemValidator;

  static getInstance(): SystemValidator {
    if (!SystemValidator.instance) {
      SystemValidator.instance = new SystemValidator();
    }
    return SystemValidator.instance;
  }

  async validateSystem(): Promise<SystemHealth> {
    const results: ValidationResult[] = [];
    const recommendations: string[] = [];

    console.log('🔍 Starting comprehensive system validation...');

    // 1. Validate Knowledge Base
    const kbResult = await this.validateKnowledgeBase();
    results.push(kbResult);
    if (kbResult.status === 'fail') {
      recommendations.push('Restart the application to reinitialize the Knowledge Base');
    }

    // 2. Validate AI System
    const aiResult = await this.validateAISystem();
    results.push(aiResult);
    if (aiResult.status === 'fail') {
      recommendations.push('Check your internet connection and OpenAI API key');
    }

    // 3. Validate Error Handler
    const errorResult = this.validateErrorHandler();
    results.push(errorResult);

    // 4. Validate Environment
    const envResult = this.validateEnvironment();
    results.push(envResult);
    if (envResult.status === 'fail') {
      recommendations.push('Check your environment configuration');
    }

    // 5. Validate Audio Services
    const audioResult = await this.validateAudioServices();
    results.push(audioResult);
    if (audioResult.status === 'fail') {
      recommendations.push('Audio features may not work properly');
    }

    // Determine overall health
    const failedComponents = results.filter(r => r.status === 'fail').length;
    const warningComponents = results.filter(r => r.status === 'warning').length;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (failedComponents === 0 && warningComponents === 0) {
      overall = 'healthy';
    } else if (failedComponents === 0) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    const health: SystemHealth = {
      overall,
      components: results,
      timestamp: new Date().toISOString(),
      recommendations
    };

    console.log('✅ System validation complete:', health);
    return health;
  }

  private async validateKnowledgeBase(): Promise<ValidationResult> {
    try {
      const status = singleAgentSystem.getKBStatus();
      
      if (!status.initialized) {
        return {
          component: 'Knowledge Base',
          status: 'fail',
          message: 'Knowledge Base failed to initialize',
          details: { error: status.error }
        };
      }

      if (status.entryCount === 0) {
        return {
          component: 'Knowledge Base',
          status: 'warning',
          message: 'Knowledge Base is empty',
          details: { entryCount: status.entryCount }
        };
      }

      // Test KB search functionality
      const searchResults = await kb.search('test', 1);
      
      return {
        component: 'Knowledge Base',
        status: 'pass',
        message: `Knowledge Base initialized successfully with ${status.entryCount} entries`,
        details: { entryCount: status.entryCount, searchTest: searchResults.length > 0 }
      };

    } catch (error) {
      return {
        component: 'Knowledge Base',
        status: 'fail',
        message: 'Knowledge Base validation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async validateAISystem(): Promise<ValidationResult> {
    try {
      const status = singleAgentSystem.getStatus();
      
      if (!status.initialized) {
        return {
          component: 'AI System',
          status: 'fail',
          message: 'AI System not initialized',
          details: { error: status.lastError }
        };
      }

      // Test AI response generation with a simple query
      const testResponse = await singleAgentSystem.processUserMessage(
        'Hello',
        {
          name: 'Test User',
          role: 'Tester',
          department: 'Testing',
          priorities: ['Testing'],
          personality: 'Professional',
          expertise: ['Testing']
        },
        {
          id: 'test',
          name: 'Test Project',
          description: 'Test project for validation',
          type: 'Test',
          painPoints: ['Testing'],
          asIsProcess: 'Test process'
        }
      );

      if (!testResponse || testResponse.trim() === '') {
        return {
          component: 'AI System',
          status: 'warning',
          message: 'AI System responding with empty responses',
          details: { response: testResponse }
        };
      }

      return {
        component: 'AI System',
        status: 'pass',
        message: 'AI System working correctly',
        details: { responseLength: testResponse.length }
      };

    } catch (error) {
      return {
        component: 'AI System',
        status: 'fail',
        message: 'AI System validation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private validateErrorHandler(): ValidationResult {
    try {
      const health = errorHandler.getHealthStatus();
      
      if (!health.healthy) {
        return {
          component: 'Error Handler',
          status: 'warning',
          message: 'Error handler reporting high error rate',
          details: { errorCount: health.errorCount }
        };
      }

      // Test error handling
      const testError = new Error('Test error for validation');
      const response = errorHandler.handleError(testError, {
        component: 'SystemValidator',
        action: 'test'
      });

      return {
        component: 'Error Handler',
        status: 'pass',
        message: 'Error handler working correctly',
        details: { responseType: response.logLevel }
      };

    } catch (error) {
      return {
        component: 'Error Handler',
        status: 'fail',
        message: 'Error handler validation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private validateEnvironment(): ValidationResult {
    const requiredEnvVars = [
      'VITE_OPENAI_API_KEY',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

    if (missingVars.length > 0) {
      return {
        component: 'Environment',
        status: 'fail',
        message: 'Missing required environment variables',
        details: { missing: missingVars }
      };
    }

    return {
      component: 'Environment',
      status: 'pass',
      message: 'Environment configuration valid',
      details: { envVars: requiredEnvVars.length }
    };
  }

  private async validateAudioServices(): Promise<ValidationResult> {
    try {
      // Check if browser supports audio
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        return {
          component: 'Audio Services',
          status: 'fail',
          message: 'Browser does not support audio',
          details: { supported: false }
        };
      }

      // Check if microphone access is available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          return {
            component: 'Audio Services',
            status: 'pass',
            message: 'Audio services available',
            details: { microphone: true, audioContext: true }
          };
        } catch (error) {
          return {
            component: 'Audio Services',
            status: 'warning',
            message: 'Microphone access denied',
            details: { microphone: false, audioContext: true }
          };
        }
      }

      return {
        component: 'Audio Services',
        status: 'warning',
        message: 'Limited audio support',
        details: { microphone: false, audioContext: false }
      };

    } catch (error) {
      return {
        component: 'Audio Services',
        status: 'fail',
        message: 'Audio services validation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // Quick health check for critical components
  async quickHealthCheck(): Promise<boolean> {
    try {
      const health = await this.validateSystem();
      return health.overall !== 'unhealthy';
    } catch (error) {
      console.error('❌ Quick health check failed:', error);
      return false;
    }
  }

  // Validate stakeholder configuration
  validateStakeholderConfig(stakeholders: any[]): ValidationResult {
    const validation = errorHandler.validateStakeholders(stakeholders);
    
    if (!validation.isValid) {
      return {
        component: 'Stakeholder Configuration',
        status: 'fail',
        message: validation.error || 'Invalid stakeholder configuration',
        details: { stakeholderCount: stakeholders?.length || 0 }
      };
    }

    return {
      component: 'Stakeholder Configuration',
      status: 'pass',
      message: `Valid stakeholder configuration with ${stakeholders.length} stakeholders`,
      details: { stakeholderCount: stakeholders.length }
    };
  }

  // Get system status summary
  getStatusSummary(): { healthy: boolean; issues: string[]; timestamp: string } {
    const health = errorHandler.getHealthStatus();
    const issues: string[] = [];

    if (!health.healthy) {
      issues.push(`High error rate: ${health.errorCount} errors in the last minute`);
    }

    return {
      healthy: health.healthy,
      issues,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const systemValidator = SystemValidator.getInstance();
