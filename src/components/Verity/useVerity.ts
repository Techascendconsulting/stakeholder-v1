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

  // Detect page changes and notify user (but keep history)
  useEffect(() => {
    const storedContext = localStorage.getItem('verity_current_context');
    if (storedContext && storedContext !== context && messages.length > 1) {
      console.log('🔄 Page changed from', storedContext, 'to', context);
      // Add a system message to inform user of page change
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `📍 You've navigated to a new page. I'm now helping with: **${pageTitle || context}**. How can I assist you here?`
      }]);
    }
    localStorage.setItem('verity_current_context', context);
  }, [context, pageTitle]);

  async function sendMessage(userMessage: string) {
    // Rate limiting: 10 messages per minute
    const now = Date.now();
    const RATE_LIMIT = 10;
    const RATE_WINDOW = 60000; // 1 minute

    // Reset counter if window expired
    if (!rateLimitResetTime || now >= rateLimitResetTime) {
      setMessageCount(1);
      setRateLimitResetTime(now + RATE_WINDOW);
    } else {
      const newCount = messageCount + 1;
      
      // Check if we've exceeded the limit
      if (newCount > RATE_LIMIT) {
        const secondsLeft = Math.ceil((rateLimitResetTime - now) / 1000);
        setMessages(prev => [...prev, 
          { role: 'user', content: userMessage },
          { 
            role: 'assistant', 
            content: `⏳ Whoa, slow down! You've reached the message limit (${RATE_LIMIT} per minute). Please wait ${secondsLeft} seconds before asking again. This helps keep the platform running smoothly for everyone.` 
          }
        ]);
        return;
      }
      
      setMessageCount(newCount);
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

      // Only escalate if AI explicitly requests it (not on keywords)
      // Users can use the Report Issue tab if they need help
      let finalReply = aiReply.replace('[ESCALATE_TO_JOY]', '');
      
      // Only log escalation if AI explicitly requested it
      if (shouldEscalate && finalReply.toLowerCase().includes('tech ascend')) {
        await logHelpRequest(userMessage, context, pageTitle, 'learning');
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

