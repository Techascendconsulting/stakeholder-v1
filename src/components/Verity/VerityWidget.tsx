import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, AlertCircle, ExternalLink } from 'lucide-react';
import { useVerity } from './useVerity';
import { useApp } from '../../contexts/AppContext';

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
 * Verity Floating Chat Widget
 * 
 * A persistent assistant that appears on every page
 * Provides context-aware help and escalates issues to Joy when needed
 */
export default function VerityWidget({ context, pageTitle }: VerityWidgetProps) {
  const { setCurrentView } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, loading } = useVerity(context, pageTitle);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close widget when clicking outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      sendMessage(input);
      setInput('');
    }
  };

  // Handle navigation link clicks
  const handleNavigate = (pageId: string) => {
    setCurrentView(pageId as any);
    setOpen(false); // Close Verity after navigation
  };

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50">
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
            <button 
              onClick={() => setOpen(false)} 
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Page Context Indicator */}
          {pageTitle && (
            <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800/50">
              <p className="text-xs text-purple-700 dark:text-purple-300">
                📍 Helping with: <span className="font-medium">{pageTitle}</span>
              </p>
            </div>
          )}

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

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <div className="flex items-center space-x-2">
              <input
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
              💡 Ask about this page, BA concepts, or report issues
            </p>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="group relative p-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
          aria-label="Open Verity Assistant"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-purple-400 opacity-0 group-hover:opacity-20 animate-ping"></span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Ask Verity
            <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45 -mt-1"></div>
          </div>
        </button>
      )}
    </div>
  );
}

