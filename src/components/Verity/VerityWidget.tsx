import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useVerity } from './useVerity';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import EmailService from '../../services/emailService';

/**
 * Simple markdown renderer for Verity messages
 * Handles bold (**text**), bullet points, navigation links, and line breaks
 */
function renderMarkdown(text: string, onNavigate?: (pageId: string) => void) {
  // Split by double newlines to create paragraphs
  const paragraphs = text.split('\n\n');
  
  return paragraphs.map((para, paraIndex) => {
    const lines = para.split('\n');
    
    return (
      <div key={paraIndex} className="mb-3 last:mb-0">
        {lines.map((line, lineIndex) => {
          // Handle bullet points
          if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
            const content = line.replace(/^[-•]\s*/, '');
            return (
              <div key={lineIndex} className="flex items-start space-x-2 ml-2 mb-1">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content, onNavigate) }} />
              </div>
            );
          }
          
          // Regular line with bold formatting
          return (
            <div 
              key={lineIndex} 
              className="mb-1 last:mb-0"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line, onNavigate) }}
            />
          );
        })}
      </div>
    );
  });
}

/**
 * Format inline markdown (bold, links, etc.)
 */
function formatInlineMarkdown(text: string, onNavigate?: (pageId: string) => void): string {
  let formatted = text;
  
  // Convert **text** to <strong>text</strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
  // Convert [Link Text](page-id) to clickable links (only when onNavigate is provided)
  if (onNavigate) {
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="#" data-page-id="$2" class="text-purple-600 dark:text-purple-400 hover:underline font-medium inline-flex items-center gap-1">$1 <span class="text-xs">→</span></a>'
    );
  }
  
  return formatted;
}

interface VerityWidgetProps {
  context: string;
  pageTitle?: string;
}

/**
 * Verity Floating Chat Widget with Tabs
 * 
 * Tab 1: Ask Verity (AI chat)
 * Tab 2: Report Issue (technical issue form)
 */
export default function VerityWidget({ context, pageTitle }: VerityWidgetProps) {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'report'>('chat');

  // Log user authentication status
  useEffect(() => {
    if (user) {
      console.log('👤 Verity: User authenticated:', user.email, 'ID:', user.id);
    } else {
      console.log('❌ Verity: User NOT authenticated - help requests may not work');
    }
  }, [user]);
  const [input, setInput] = useState('');
  const [issueText, setIssueText] = useState('');
  const [issueSubject, setIssueSubject] = useState('');
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [issueSubmitted, setIssueSubmitted] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const { messages, sendMessage, loading, clearChat, dailyCount, dailyLimit } = useVerity(context, pageTitle);
  const [currentDailyCount, setCurrentDailyCount] = useState(dailyCount);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref for auto-focus
  
  // Update daily count when messages change
  useEffect(() => {
    setCurrentDailyCount(dailyCount);
  }, [messages.length, dailyCount]);

  // Auto-focus input when widget opens, when switching to chat tab, or after messages update
  useEffect(() => {
    if (open && activeTab === 'chat' && !loading) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, activeTab, messages.length, loading]); // Re-focus after new messages

  // Check if greeting was dismissed recently
  useEffect(() => {
    const dismissedTime = localStorage.getItem('verity_greeting_dismissed');
    console.log('Verity greeting check:', { dismissedTime, showGreeting });
    if (dismissedTime) {
      const twoHoursInMs = 2 * 60 * 60 * 1000;
      const timeSinceDismissed = Date.now() - parseInt(dismissedTime);
      console.log('Time since dismissed:', timeSinceDismissed, 'ms');
      if (timeSinceDismissed < twoHoursInMs) {
        console.log('Hiding greeting - dismissed less than 2 hours ago');
        setShowGreeting(false);
      } else {
        // More than 2 hours passed, remove the timestamp
        console.log('Showing greeting - more than 2 hours passed');
        localStorage.removeItem('verity_greeting_dismissed');
      }
    } else {
      console.log('No dismissal found - showing greeting');
    }
  }, []);

  const handleCloseGreeting = () => {
    setShowGreeting(false);
    localStorage.setItem('verity_greeting_dismissed', Date.now().toString());
  };

  // Hide greeting when widget opens
  useEffect(() => {
    if (open && showGreeting) {
      setShowGreeting(false);
    }
  }, [open]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Instant scroll to bottom when widget opens (no animation)
  useEffect(() => {
    if (open) {
      // Use instant scroll when opening
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
    }
  }, [open]);

  // Close widget when clicking outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (widgetRef.current && !widgetRef.current.contains(target)) {
        setOpen(false);
      }
    }

    // Add delay to avoid closing immediately after opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueSubject.trim() || !issueText.trim()) return;

    setSubmittingIssue(true);

    try {
      console.log('📤 Submitting issue:', {
        user_id: user?.id,
        email: user?.email,
        subject: issueSubject,
        question: issueText,
        page_context: context,
        page_title: pageTitle,
        issue_type: 'technical'
      });

      const { data, error} = await supabase.from('help_requests').insert({
        user_id: user?.id ?? null,
        email: user?.email ?? null,
        question: `[${issueSubject}] ${issueText}`,
        page_context: context,
        page_title: pageTitle,
        issue_type: 'technical',
        status: 'pending',
        created_at: new Date().toISOString()
      }).select();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Issue submitted successfully:', data);
      
      // Send email notification to BA WorkXP team
      const emailSent = await EmailService.sendHelpRequestEmail({
        userEmail: user?.email || 'anonymous',
        userName: user?.full_name || user?.email,
        pageTitle: issueSubject, // Use subject as the page title
        pageContext: context,
        issueType: 'technical',
        question: issueText,
        timestamp: new Date().toLocaleString()
      });
      
      if (emailSent) {
        console.log('✅ Email notification sent to BA WorkXP team');
      } else {
        console.log('⚠️ Email not sent (EmailJS not configured - check console)');
      }
      
      setIssueSubmitted(true);
      
      // Reset after 4 seconds to give user time to read
      setTimeout(() => {
        setIssueText('');
        setIssueSubject('');
        setIssueSubmitted(false);
        setActiveTab('chat');
      }, 4000);

    } catch (error) {
      console.error('❌ Failed to submit issue:', error);
      alert(`Failed to submit issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmittingIssue(false);
    }
  };

  // Handle navigation link clicks
  const handleNavigate = (pageId: string) => {
    setCurrentView(pageId as any);
    setOpen(false); // Close Verity after navigation
  };

  return (
    <div ref={widgetRef} className="relative">
      {/* Floating Greeting Prompt - Shows when widget is closed */}
      {!open && showGreeting && (
        <div className="absolute bottom-16 right-0 mb-2 mr-2 animate-in slide-in-from-bottom-5 fade-in duration-500">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 pr-8 max-w-xs">
            <button
              onClick={handleCloseGreeting}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Close (will reappear in 2 hours)"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-lg">👋</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Hi there!</strong> Would you like help?
              </p>
            </div>
          </div>
        </div>
      )}
      
      {open ? (
        <div className="w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-[500px] sm:h-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Verity</h2>
                <p className="text-xs text-purple-100">Your BA WorkXP Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Reset Chat Button */}
              {messages.length > 1 && (
                <div className="relative group">
                  <button 
                    onClick={clearChat}
                    className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10">
                    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                      Reset chat
                    </div>
                  </div>
                </div>
              )}
              {/* Close Button */}
              <div className="relative group">
                <button 
                  onClick={() => setOpen(false)} 
                  className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10">
                  <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                    Close chat
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 pt-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 px-4 py-3 text-sm font-bold transition-all rounded-t-lg overflow-hidden ${
                activeTab === 'chat'
                  ? 'text-white bg-gradient-to-r from-purple-600 to-purple-500 shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              💬 Ask Verity
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 px-4 py-3 text-sm font-bold transition-all rounded-t-lg overflow-hidden ${
                activeTab === 'report'
                  ? 'text-white bg-gradient-to-r from-orange-600 to-red-500 shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              ⚠️ Report Issue
            </button>
          </div>

          {/* Page Context and Daily Limit Indicator */}
          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800/50">
            <div className="flex items-center justify-between">
              {pageTitle && (
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  📍 <span className="font-medium">{pageTitle}</span>
                </p>
              )}
              <p className={`text-xs font-semibold ${
                currentDailyCount >= dailyLimit 
                  ? 'text-red-600 dark:text-red-400'
                  : currentDailyCount >= dailyLimit * 0.8
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-purple-600 dark:text-purple-400'
              }`}>
                {currentDailyCount}/{dailyLimit} questions today
              </p>
            </div>
          </div>

          {/* Chat Tab Content */}
          {activeTab === 'chat' && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                {messages.map((m, i) => (
                  <div 
                    key={i} 
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        m.role === 'user'
                          ? 'bg-purple-600 text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                      }`}
                    >
                      <div 
                        className="text-sm leading-relaxed"
                        onClick={(e) => {
                          // Handle navigation link clicks
                          const target = e.target as HTMLElement;
                          if (target.tagName === 'A' && target.hasAttribute('data-page-id')) {
                            e.preventDefault();
                            const pageId = target.getAttribute('data-page-id');
                            if (pageId) handleNavigate(pageId);
                          }
                        }}
                      >
                        {m.role === 'user' ? (
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        ) : (
                          renderMarkdown(m.content, handleNavigate)
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-2xl rounded-bl-sm max-w-[85%]">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">Verity is thinking...</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Form */}
              <form
                onSubmit={handleChatSubmit}
                className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              >
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Verity anything..."
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 rounded-xl text-white disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  💡 Ask about this page, BA concepts, or get help
                </p>
              </form>
            </>
          )}

          {/* Report Issue Tab Content */}
          {activeTab === 'report' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {issueSubmitted ? (
                // Success State
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Thanks for letting us know!</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Our team will review this shortly.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Issue Form */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={issueSubject}
                        onChange={(e) => setIssueSubject(e.target.value)}
                        placeholder="Brief summary (e.g., 'Save button not working')"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 text-sm"
                        disabled={submittingIssue}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        What went wrong?
                      </label>
                      <textarea
                        value={issueText}
                        onChange={(e) => setIssueText(e.target.value)}
                        placeholder="Describe the issue in detail: what were you doing, what happened, what did you expect..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 resize-none text-sm"
                        disabled={submittingIssue}
                      />
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-lg p-3">
                      <p className="text-xs text-orange-700 dark:text-orange-300 flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>This will be sent to our team. Include as much detail as possible.</span>
                      </p>
                    </div>
                  </div>

                  {/* Issue Submit Button */}
                  <form onSubmit={handleIssueSubmit} className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <button
                      type="submit"
                      disabled={!issueSubject.trim() || !issueText.trim() || submittingIssue}
                      className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                    >
                      {submittingIssue ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>Submit Issue</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="group relative px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2.5"
          aria-label="Open Verity Assistant"
        >
          <MessageCircle className="w-5 h-5 text-white flex-shrink-0" />
          <span className="text-white font-bold text-base whitespace-nowrap">Ask Verity</span>
          
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-purple-400 opacity-0 group-hover:opacity-20 animate-ping"></span>
        </button>
      )}
    </div>
  );
}




















