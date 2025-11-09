import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { VerityService } from '../../services/verityService';
import EmailService from '../../services/emailService';

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
const STORAGE_TIMESTAMP_KEY = 'verity_chat_timestamp';
const MAX_STORED_MESSAGES = 30;
const CHAT_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

// Load chat history from localStorage (expires after 1 hour)
const loadChatHistory = (context: string): Message[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    
    if (stored && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      
      // Check if chat history has expired (older than 1 hour)
      if (age > CHAT_EXPIRY_MS) {
        console.log('🕐 Chat history expired (> 1 hour) - clearing');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
      } else {
        const parsed = JSON.parse(stored);
        // Return messages for this context, or all if no context match
        return parsed.filter((msg: any) => !msg.page_context || msg.page_context === context).slice(-MAX_STORED_MESSAGES);
      }
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

// Save chat history to localStorage with timestamp
const saveChatHistory = (messages: Message[], context: string) => {
  try {
    const messagesToSave = messages.slice(-MAX_STORED_MESSAGES).map(msg => ({
      ...msg,
      page_context: context
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToSave));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
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

  // Track page changes (silent - no chat message needed since we have header indicator)
  useEffect(() => {
    const storedContext = localStorage.getItem('verity_current_context');
    if (storedContext && storedContext !== context && messages.length > 1) {
      console.log('🔄 Verity: Page changed from', storedContext, 'to', context);
      // Don't add a chat message - the header shows "📍 Helping with: [page]"
    }
    localStorage.setItem('verity_current_context', context);
  }, [context, pageTitle]);

  async function sendMessage(userMessage: string) {
    // Rate limiting: 20 questions per day
    const now = Date.now();
    const DAILY_LIMIT = 20;
    const dailyKey = `verity_daily_count_${new Date().toDateString()}`;
    const dailyResetKey = `verity_daily_reset`;

    // Get today's count from localStorage
    let todayCount = 0;
    let resetTime = 0;
    
    try {
      const storedCount = localStorage.getItem(dailyKey);
      const storedReset = localStorage.getItem(dailyResetKey);
      
      if (storedCount) todayCount = parseInt(storedCount);
      if (storedReset) resetTime = parseInt(storedReset);
    } catch (error) {
      console.error('Error reading daily limit:', error);
    }

    // Calculate time until midnight (reset time)
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now;
    const hoursUntilReset = Math.floor(msUntilMidnight / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));

    // Check if we've exceeded the daily limit
    if (todayCount >= DAILY_LIMIT) {
      setMessages(prev => [...prev, 
        { role: 'user', content: userMessage },
        { 
          role: 'assistant', 
          content: `⏳ You've reached your daily limit of ${DAILY_LIMIT} questions. Your limit resets in ${hoursUntilReset}h ${minutesUntilReset}m (at midnight). 

This helps us keep Verity available for everyone. See you tomorrow! 🌟` 
        }
      ]);
      return;
    }
    
    // Increment count
    const newCount = todayCount + 1;
    try {
      localStorage.setItem(dailyKey, newCount.toString());
      localStorage.setItem(dailyResetKey, midnight.getTime().toString());
      setMessageCount(newCount);
      console.log(`📊 Verity usage: ${newCount}/${DAILY_LIMIT} questions today`);
    } catch (error) {
      console.error('Error updating daily limit:', error);
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

      const aiReply = data.reply || "I'll forward this to our team to help further.";
      const shouldEscalate = data.escalate;

      // Only escalate if AI explicitly requests it (not on keywords)
      // Users can use the Report Issue tab if they need help
      let finalReply = aiReply.replace('[ESCALATE_TO_JOY]', '');
      
      // Only log escalation if AI explicitly requested it
      if (shouldEscalate && (finalReply.toLowerCase().includes('our team') || finalReply.toLowerCase().includes('support'))) {
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
        content: "I'm having trouble connecting right now. Please use the **⚠️ Report Issue** tab to get help from our team."
      }]);

      // Log as help request
      await logHelpRequest(userMessage, context, pageTitle, 'learning');
    } finally {
      setLoading(false);
    }
  }

  async function logHelpRequest(question: string, pageContext: string, pageTitle?: string, issueType: 'learning' | 'technical' = 'learning') {
    try {
      // Log to Supabase
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

      // Send email notification to BA WorkXP team
      const emailSent = await EmailService.sendHelpRequestEmail({
        userEmail: user?.email || 'anonymous',
        userName: user?.full_name || user?.email,
        pageTitle: pageTitle || 'Unknown Page',
        pageContext: pageContext,
        issueType: issueType,
        question: question,
        timestamp: new Date().toLocaleString()
      });

      if (emailSent) {
        console.log('✅ Email notification sent to BA WorkXP team');
      } else {
        console.warn('⚠️ Email notification failed');
      }
    } catch (error) {
      console.error('❌ Failed to log help request:', error);
    }
  }

  const clearChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages(loadChatHistory(context));
  };

  // Get today's count for display
  const getTodayCount = () => {
    try {
      const dailyKey = `verity_daily_count_${new Date().toDateString()}`;
      const stored = localStorage.getItem(dailyKey);
      return stored ? parseInt(stored) : 0;
    } catch {
      return 0;
    }
  };

  return { 
    messages, 
    sendMessage, 
    loading, 
    clearChat,
    dailyCount: getTodayCount(),
    dailyLimit: 20
  };
}

export default useVerity;






















