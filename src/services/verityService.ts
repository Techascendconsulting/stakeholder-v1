// Verity AI Service using secure backend API
// SECURITY: No OpenAI API key in frontend

import { VERITY_SYSTEM_PROMPT } from '../components/Verity/VerityPrompt';
import { supabase } from '../lib/supabase';

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

      // Get Supabase session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.error('❌ Verity: No authentication token available');
        return {
          reply: "I'm having trouble authenticating. Please refresh the page and try again.",
          escalate: true
        };
      }

      console.log('🔄 Verity: Calling backend API...');
      
      // Call the correct endpoint with proper request format
      const response = await fetch('/api/verity-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: contextualSystemPrompt },
            ...messages
          ],
          context: {
            context: context.context,
            pageTitle: context.pageTitle,
            userRole: context.userRole
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Verity API error (${response.status}):`, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      // Backend returns { reply, escalate }, not { message }
      const reply = data.reply || "I'm having trouble right now. Please use the **⚠️ Report Issue** tab to get help.";
      const escalate = data.escalate || false;
      
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
      // Get Supabase session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        return false;
      }

      // Simple health check - try a minimal API call to the correct endpoint
      const response = await fetch('/api/verity-chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'ping' }],
          context: {}
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
