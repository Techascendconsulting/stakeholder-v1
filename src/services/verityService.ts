// Verity AI Service using secure backend API
// SECURITY: No OpenAI API key in frontend

import { VERITY_SYSTEM_PROMPT } from '../components/Verity/VerityPrompt';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface VerityContext {
  context: string;
  pageTitle?: string;
  userRole?: string;
}

/**
 * Verity AI Service
 * Handles communication with backend API for the Verity assistant
 */
export class VerityService {
  /**
   * Get a response from Verity based on user input and page context
   */
  static async getResponse(
    messages: Message[],
    context: VerityContext
  ): Promise<{ reply: string; escalate: boolean }> {
    try {
      // Pre-filter: refuse out-of-scope topics before calling the API
      const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content?.toLowerCase() || '';
      const offScopePatterns = [
        /\binterview\b|\bjob\b|cv|resume|cover letter|salary|recruit(er|ment)/i,
        /news|headlines|today\s*news/i,
        /digital\s*marketing|seo|sem|ppc|facebook ads|google ads/i
      ];
      const isOffScope = offScopePatterns.some(rx => rx.test(lastUser));
      if (isOffScope) {
        const refusal = "Thanks for your message. I focus on practical Business Analysis and Scrum here. What would you like to work on today? If it helps, we could explore a real‑world BA concept, walk through a scenario together, or try a short hands‑on exercise. I'm happy to follow your lead.";
        return { reply: refusal, escalate: false };
      }

      // Build the context-aware system message
      const contextualSystemPrompt = `${VERITY_SYSTEM_PROMPT}

The current page is: ${context.pageTitle || 'Unknown Page'} (${context.context}).
User role: ${context.userRole || 'learner'}`;

      console.log('🔄 Verity: Calling backend API...');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: contextualSystemPrompt },
            ...messages
          ],
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.message || "I'm having trouble right now. Please use the **⚠️ Report Issue** tab to get help.";
      
      // Check if escalation is needed (basic heuristic)
      const escalate = reply.toLowerCase().includes('escalat') || 
                       reply.toLowerCase().includes('report issue') ||
                       reply.toLowerCase().includes('technical support');
      
      console.log('✅ Verity: Response received');

      return { reply, escalate };
      
    } catch (error) {
      console.error('❌ Verity error:', error);
      return {
        reply: "I'm having trouble right now. Please use the **⚠️ Report Issue** tab if you need help.",
        escalate: true
      };
    }
  }

  /**
   * Check if Verity service is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Simple health check - try a minimal API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get Verity capabilities based on context
   */
  static getCapabilities(context: VerityContext): {
    hasApiKey: boolean;
    contextType: string;
    suggestedActions: string[];
  } {
    // Since we're using backend API, always return true for hasApiKey
    return {
      hasApiKey: true,
      contextType: context.context,
      suggestedActions: [
        'Ask questions about Business Analysis',
        'Get help with current page content',
        'Request explanations of concepts',
        'Report technical issues'
      ]
    };
  }
}
