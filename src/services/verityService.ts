import OpenAI from 'openai';
import { VERITY_SYSTEM_PROMPT } from '../components/Verity/VerityPrompt';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, move this to a backend endpoint
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

      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: contextualSystemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const reply = completion.choices[0]?.message?.content || 
        "I'm having trouble right now. Let me notify Joy so she can help you directly.";

      // Detect if escalation is needed
      const escalate = 
        reply.includes('[ESCALATE_TO_JOY]') ||
        /help|not working|issue|error|bug|broken/i.test(reply);

      // Clean up escalation markers from reply
      const cleanReply = reply.replace(/\[ESCALATE_TO_JOY\]/g, '').trim();

      return { reply: cleanReply, escalate };

    } catch (error) {
      console.error('❌ Verity Service Error:', error);
      
      return {
        reply: "I'm experiencing technical difficulties right now. I'll notify Joy so she can assist you directly.",
        escalate: true
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

