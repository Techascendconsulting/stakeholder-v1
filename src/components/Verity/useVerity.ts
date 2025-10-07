import { useState, useEffect } from 'react';
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
const STORAGE_KEY = 'verity_chat_history';
const MAX_STORED_MESSAGES = 30;

// Load chat history from localStorage
const loadChatHistory = (context: string): Message[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Return messages for this context, or all if no context match
      return parsed.filter((msg: any) => !msg.page_context || msg.page_context === context).slice(-MAX_STORED_MESSAGES);
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
  }
  
  // Default welcome message
  return [
    {
      role: 'assistant',
      content: `Hi! I'm Verity 👋 Ask me about BA concepts, learning exercises, or navigating the platform. 

Having technical issues? Use the **⚠️ Report Issue** tab above.`
    }
  ];
};

// Save chat history to localStorage
const saveChatHistory = (messages: Message[], context: string) => {
  try {
    const messagesToSave = messages.slice(-MAX_STORED_MESSAGES).map(msg => ({
      ...msg,
      page_context: context
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
};

export function useVerity(context: string, pageTitle?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => loadChatHistory(context));
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [rateLimitResetTime, setRateLimitResetTime] = useState<number | null>(null);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the welcome message
      saveChatHistory(messages, context);
    }
  }, [messages, context]);

  async function sendMessage(userMessage: string) {
    // Rate limiting: 10 messages per minute
    const now = Date.now();
    const RATE_LIMIT = 10;
    const RATE_WINDOW = 60000; // 1 minute

    if (rateLimitResetTime && now < rateLimitResetTime) {
      const secondsLeft = Math.ceil((rateLimitResetTime - now) / 1000);
      setMessages(prev => [...prev, 
        { role: 'user', content: userMessage },
        { 
          role: 'assistant', 
          content: `⏳ Whoa, slow down! You've reached the message limit. Please wait ${secondsLeft} seconds before asking again. This helps keep the platform running smoothly for everyone.` 
        }
      ]);
      return;
    }

    // Reset counter if window expired
    if (!rateLimitResetTime || now >= rateLimitResetTime) {
      setMessageCount(1);
      setRateLimitResetTime(now + RATE_WINDOW);
    } else {
      const newCount = messageCount + 1;
      setMessageCount(newCount);
      
      if (newCount >= RATE_LIMIT) {
        setRateLimitResetTime(now + RATE_WINDOW);
      }
    }

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

      const aiReply = data.reply || "I'll forward this to Tech Ascend Consulting to help further.";
      const shouldEscalate = data.escalate;

      // Check if user is asking for help or stuck
      const userNeedsHelp = /help|stuck|confused|don't understand|can't|cannot|not working/i.test(userMessage);

      // Add AI response to chat
      let finalReply = aiReply.replace('[ESCALATE_TO_JOY]', '');
      
      // If escalation needed or user clearly needs help
      if (shouldEscalate || userNeedsHelp) {
        await logHelpRequest(userMessage, context, pageTitle, 'learning');
        
        // Add escalation confirmation if not already in response
        if (!finalReply.toLowerCase().includes('tech ascend') && !finalReply.toLowerCase().includes('shared')) {
          finalReply += "\n\nGot it — I've shared this with Tech Ascend Consulting. You'll get a response soon!";
        }
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: finalReply
      }]);

    } catch (error) {
      console.error('Verity error:', error);
      
      // Fallback response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Let me notify Tech Ascend Consulting about this so they can help you directly."
      }]);

      // Log as help request
      await logHelpRequest(userMessage, context, pageTitle, 'learning');
    } finally {
      setLoading(false);
    }
  }

  async function logHelpRequest(question: string, pageContext: string, pageTitle?: string, issueType: 'learning' | 'technical' = 'learning') {
    try {
      await supabase.from('help_requests').insert({
        user_id: user?.id,
        email: user?.email,
        question,
        page_context: pageContext,
        page_title: pageTitle,
        issue_type: issueType,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
      console.log('✅ Help request logged to Supabase');
    } catch (error) {
      console.error('❌ Failed to log help request:', error);
    }
  }

  const clearChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages(loadChatHistory(context));
  };

  return { messages, sendMessage, loading, clearChat };
}

export default useVerity;

