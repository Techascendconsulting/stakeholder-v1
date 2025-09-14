import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Sparkles, MessageCircle } from 'lucide-react';

interface AdvancedStakeholderBotProps {
  currentScenario?: {
    id: string;
    title: string;
    description: string;
    category: string;
  };
  currentStep?: {
    title: string;
    question: string;
    tip: string;
  };
  userStory?: string;
  acInputs?: string[];
  stepIndex?: number;
}

export const AdvancedStakeholderBot: React.FC<AdvancedStakeholderBotProps> = ({
  currentScenario,
  currentStep,
  userStory,
  acInputs,
  stepIndex
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Debug logging
  console.log('AdvancedStakeholderBot rendered with props:', {
    currentScenario,
    currentStep,
    userStory,
    acInputs,
    stepIndex
  });
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<Array<{role: 'user' | 'stakeholder', content: string, timestamp: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleBot = () => setIsOpen(!isOpen);
  const closeBot = () => setIsOpen(false);

  // Close bot when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        closeBot();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeBot]);

  // Get context-aware quick questions based on current step
  const getContextualQuestions = () => {
    if (!currentStep || !currentScenario) return [];

    const baseQuestions = [
      "What are the business rules for this feature?",
      "Are there any edge cases I should consider?",
      "What happens if the user makes an error?",
      "How should the system handle validation failures?"
    ];

    switch (stepIndex) {
      case 0: // User Story Structure
        return [
          "What's the main goal for this user story?",
          "Who is the primary user for this scenario?",
          "What's the business value of this feature?"
        ];
      case 1: // Match the User Goal
        return [
          "What specific action should the user be able to perform?",
          "Are there any constraints on this action?",
          "What's the expected outcome for the user?"
        ];
      case 2: // Trigger
        return [
          "When exactly should this action be available?",
          "Are there any prerequisites before this can happen?",
          "What initiates this user action?"
        ];
      case 3: // Rules
        return [
          "What validation rules apply here?",
          "Are there any business logic constraints?",
          "What should be prevented or restricted?"
        ];
      case 4: // Feedback
        return [
          "What confirmation should the user see?",
          "How will they know the action succeeded?",
          "What happens next after this action?"
        ];
      default:
        return baseQuestions;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChat(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response with context awareness
    setTimeout(() => {
      const contextInfo = currentScenario ? 
        ` (Context: ${currentScenario.category} - ${currentScenario.title})` : '';
      
      const stepInfo = currentStep ? 
        ` (Current Step: ${currentStep.title})` : '';

      const responses = [
        `Based on the ${currentScenario?.category || 'scenario'} context, I'd suggest considering the user's primary goal here.${contextInfo}${stepInfo}`,
        `For this ${currentScenario?.title || 'feature'}, think about what the user really needs to accomplish.${contextInfo}${stepInfo}`,
        `In this ${currentScenario?.category || 'domain'}, users typically expect certain behaviors. Let me help you think through this.${contextInfo}${stepInfo}`,
        `Given the ${currentScenario?.title || 'scenario'}, consider the business rules and user expectations.${contextInfo}${stepInfo}`
      ];

      const aiResponse = {
        role: 'stakeholder' as const,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString()
      };
      
      setChat(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleBot}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 z-50 group"
        style={{ zIndex: 9999 }} // Ensure it's on top
      >
        <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
          🚀
        </span>
        {/* Debug indicator */}
        <span className="absolute -bottom-1 -left-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          ✓
        </span>
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col backdrop-blur-sm bg-opacity-95"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h3 className="font-semibold">Advanced Stakeholder</h3>
        </div>
        <button
          onClick={closeBot}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Context Info */}
      {currentScenario && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            🚀 {currentScenario.category}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            {currentScenario.title}
          </div>
          {currentStep && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Step {stepIndex! + 1}: {currentStep.title}
            </div>
          )}
        </div>
      )}

      {/* Quick Questions */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Quick Questions:</div>
        <div className="flex flex-wrap gap-1">
          {getContextualQuestions().slice(0, 2).map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Sparkles size={32} className="mx-auto mb-2 text-blue-500" />
            <p className="text-sm">Ask me about this advanced scenario!</p>
            <p className="text-xs mt-1">I understand the context and can help with your user story.</p>
          </div>
        ) : (
          chat.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === 'stakeholder' && <Bot size={16} className="mt-0.5 flex-shrink-0" />}
                  {message.role === 'user' && <User size={16} className="mt-0.5 flex-shrink-0" />}
                  <div>
                    <div>{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm">
              <div className="flex items-center space-x-2">
                <Bot size={16} />
                <div className="flex items-center space-x-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this advanced scenario..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};