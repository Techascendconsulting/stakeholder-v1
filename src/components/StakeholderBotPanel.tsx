import { useStakeholderBot } from '../context/StakeholderBotContext';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export const StakeholderBotPanel = () => {
  const { isOpen, closeBot, currentUserStory, currentStep } = useStakeholderBot();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Context-aware questions based on current coaching step
  const getContextualQuestions = (step: number) => {
    const stepQuestions = {
      0: [ // User Story Structure Check
        "Is the role specific enough?",
        "Does the action match the user's actual need?",
        "Is the benefit measurable or observable?",
        "Are there any assumptions in the story?"
      ],
      1: [ // Match the User Goal
        "What's the exact sequence of steps?",
        "Are there alternative paths to consider?",
        "What's the minimum viable action?",
        "How do we know the goal is achieved?"
      ],
      2: [ // Trigger
        "What are the exact preconditions?",
        "Are there multiple trigger points?",
        "What happens if conditions aren't met?",
        "Is the trigger timing critical?"
      ],
      3: [ // Rules
        "What are the edge case rules?",
        "Are there conflicting business rules?",
        "What validation is most critical?",
        "Are there industry-specific constraints?"
      ],
      4: [ // Feedback
        "What's the most important feedback?",
        "How do we prevent user confusion?",
        "What's the next logical step?",
        "Are there different feedback for different outcomes?"
      ],
      5: [ // Error Handling
        "What are the most likely failure points?",
        "How do we guide users to success?",
        "What's the recovery strategy?",
        "Are there cascading error scenarios?"
      ],
      6: [ // Non-Functional Constraints
        "What's the performance bottleneck?",
        "Are there accessibility requirements?",
        "What are the scalability limits?",
        "Are there security constraints?"
      ],
      7: [ // Proof Sent
        "What's the audit trail requirement?",
        "What data is legally required?",
        "How do we ensure delivery confirmation?",
        "What's the retention policy?"
      ]
    };
    
    return stepQuestions[step as keyof typeof stepQuestions] || [
      "What are the hidden requirements?",
      "What could be misunderstood?",
      "Are there any dependencies?"
    ];
  };

  // Handle clicking outside to close
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

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    
    // Simulate AI response for now
    setTimeout(() => {
      setIsLoading(false);
      setQuestion('');
    }, 2000);
  };

  return (
    <div 
      ref={panelRef}
      className="fixed bottom-0 right-0 w-96 max-w-sm h-[600px] bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 z-50 rounded-t-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-6 h-6" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Stakeholder Bot</h3>
              <p className="text-xs opacity-90">Your AI stakeholder</p>
            </div>
          </div>
          <button 
            onClick={closeBot}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
        {/* User Story Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-2xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Current User Story</span>
          </div>
          <div className="text-sm text-gray-700 bg-white/70 p-3 rounded-xl border border-blue-100 max-h-20 overflow-y-auto">
            {currentUserStory || 'No user story selected.'}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-gray-50 rounded-2xl p-3 space-y-3 min-h-0">
          <div className="text-center text-gray-500 text-sm">
            💡 Ask questions about your user story to get stakeholder insights
          </div>
          
          {/* Context-aware questions */}
          <div className="space-y-2">
            <div className="text-xs text-gray-600 font-medium">
              Quick questions for Step {currentStep + 1}:
            </div>
            <div className="flex flex-wrap gap-2">
              {getContextualQuestions(currentStep).map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestion(q)}
                  className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="mt-auto space-y-3">
          <div className="flex gap-2">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your stakeholder a question..."
              className="flex-1 p-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              rows={3}
            />
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || isLoading}
              className="self-end p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Powered by AI • Responses are contextual to your scenario
          </div>
        </div>
      </div>
    </div>
  );
};


