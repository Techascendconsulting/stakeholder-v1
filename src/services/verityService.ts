import OpenAI from 'openai';
import { VERITY_SYSTEM_PROMPT } from '../components/Verity/VerityPrompt';

// Check if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ VITE_OPENAI_API_KEY is not set in environment variables');
} else {
  console.log('✅ OpenAI API key loaded:', apiKey.substring(0, 20) + '...');
}

// SECURITY: Client-side OpenAI usage exposes API key in browser
// TODO (Production): Move all OpenAI calls to Supabase Edge Functions
// TODO: Create /supabase/functions/verity-chat/index.ts
// TODO: Client sends user message → Edge Function calls OpenAI → Returns response
// Current setup is acceptable for development/MVP but NOT production-ready
const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // ⚠️ SECURITY: Exposes API key - move to Edge Function for production
});

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
 * 
 * Handles communication with OpenAI for the Verity assistant
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
      // Build the context-aware system message
      const contextualSystemPrompt = `${VERITY_SYSTEM_PROMPT}

The current page is: ${context.pageTitle || 'Unknown Page'} (${context.context}).
User role: ${context.userRole || 'learner'}`;

      // Call OpenAI with optimized settings for faster responses
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: contextualSystemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 300 // Reduced for faster responses
      });

      const reply = completion.choices[0]?.message?.content || 
        "I'm having trouble right now. Let me notify Tech Ascend Consulting so they can help you directly.";

      // Detect if escalation is needed
      const escalate = 
        reply.includes('[ESCALATE_TO_JOY]') ||
        /help|not working|issue|error|bug|broken/i.test(reply);

      // Clean up escalation markers from reply
      const cleanReply = reply.replace(/\[ESCALATE_TO_JOY\]/g, '').trim();

      return { reply: cleanReply, escalate };

    } catch (error) {
      console.error('❌ Verity Service Error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name,
        hasApiKey: !!import.meta.env.VITE_OPENAI_API_KEY
      });
      
      // Don't auto-escalate on service errors - just inform the user
      return {
        reply: "I'm having a bit of trouble connecting right now. Please try asking again, or use the **⚠️ Report Issue** tab if you need immediate help.",
        escalate: false
      };
    }
  }

  /**
   * Check if a message requires immediate escalation
   */
  static requiresEscalation(message: string): boolean {
    const escalationKeywords = [
      'not working',
      'broken',
      'error',
      'bug',
      'crash',
      'can\'t',
      'cannot',
      'won\'t',
      'doesn\'t work',
      'help me',
      'stuck',
      'frustrated'
    ];

    const lowerMessage = message.toLowerCase();
    return escalationKeywords.some(keyword => lowerMessage.includes(keyword));
  }
}

export default VerityService;








