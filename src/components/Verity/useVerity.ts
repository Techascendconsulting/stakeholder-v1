import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import VerityService from '../../services/verityService';

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
 * Custom hook for Verity AI assistant
 * Handles OpenAI communication and Supabase escalation
 */
export function useVerity(context: string, pageTitle?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm Verity, your BA WorkXP assistant. I can help you with anything on this page. What would you like to know?`
    }
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(userMessage: string) {
    // Add user message to chat
    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      // Call Verity Service directly (OpenAI)
      const data = await VerityService.getResponse(
        [...messages, newUserMessage],
        {
          context,
          pageTitle,
          userRole: 'learner'
        }
      );

      const aiReply = data.reply || "I'll forward this to Joy to help further.";
      const shouldEscalate = data.escalate;

      // Add AI response to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiReply.replace('[ESCALATE_TO_JOY]', '') 
      }]);

      // If escalation needed, log to Supabase
      if (shouldEscalate) {
        await logHelpRequest(userMessage, context, pageTitle);
      }

    } catch (error) {
      console.error('Verity error:', error);
      
      // Fallback response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Let me notify Joy about this so she can help you directly."
      }]);

      // Log as help request
      await logHelpRequest(userMessage, context, pageTitle);
    } finally {
      setLoading(false);
    }
  }

  async function logHelpRequest(question: string, pageContext: string, pageTitle?: string) {
    try {
      await supabase.from('help_requests').insert({
        user_id: user?.id,
        user_email: user?.email,
        question,
        page_context: pageContext,
        page_title: pageTitle,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
      console.log('✅ Help request logged to Supabase');
    } catch (error) {
      console.error('❌ Failed to log help request:', error);
    }
  }

  return { messages, sendMessage, loading };
}

export default useVerity;

