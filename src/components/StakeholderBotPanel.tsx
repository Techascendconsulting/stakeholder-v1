import { useStakeholderBot } from '../context/StakeholderBotContext';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export const StakeholderBotPanel = () => {
  const { isOpen, closeBot, currentUserStory, currentStep, currentScenario, currentStakeholder } = useStakeholderBot();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'stakeholder', content: string, timestamp: string}>>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // Initialize bot with context when it opens
  useEffect(() => {
    if (isOpen && !hasInitialized) {
      setHasInitialized(true);
      
      // Add initial stakeholder greeting with context
      const stepName = getStepName(currentStep);
      const scenarioContext = currentScenario ? currentScenario.description || currentScenario.title : null;
      const stakeholder = currentStakeholder;
      
      const stepSpecificFocus = stakeholder ? getStepSpecificFocus(currentStep, stakeholder, currentUserStory, scenarioContext) : '';
      
      const greeting = stakeholder 
        ? currentUserStory 
          ? `Hi! I'm ${stakeholder.name}, ${stakeholder.role}. I can see you're working on acceptance criteria for "${currentUserStory}" and you're currently on ${stepName}. As a ${stakeholder.role.toLowerCase()}, I'm particularly interested in ${stepSpecificFocus}. What questions do you have about this step?`
          : scenarioContext
          ? `Hi! I'm ${stakeholder.name}, ${stakeholder.role}. I can see you're working on acceptance criteria for this scenario: "${scenarioContext}" and you're currently on ${stepName}. As a ${stakeholder.role.toLowerCase()}, I'm particularly interested in ${stepSpecificFocus}. What questions do you have about this step?`
          : `Hi! I'm ${stakeholder.name}, ${stakeholder.role}. I'm here to help you define acceptance criteria. As a ${stakeholder.role.toLowerCase()}, I focus on ${stepSpecificFocus}. What would you like to work on?`
        : `Hi! I'm here to help you define acceptance criteria for your user story. What would you like to work on?`;
      
      const initialMessage = {
        role: 'stakeholder' as const,
        content: greeting,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setChatHistory([initialMessage]);
    }
    
    // Reset initialization when bot closes
    if (!isOpen) {
      setHasInitialized(false);
      setChatHistory([]);
    }
  }, [isOpen, hasInitialized, currentUserStory, currentStep, currentScenario, currentStakeholder]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isLoading]);

  // Get step name for context
  const getStepName = (step: number) => {
    const stepNames = [
      'User Story Structure Check',
      'Match the User Goal',
      'Trigger Definition',
      'Business Rules',
      'Feedback Mechanisms',
      'Error Handling',
      'Non-Functional Constraints',
      'Proof and Audit Trail'
    ];
    return stepNames[step] || `Step ${step + 1}`;
  };

  // Get step description for context
  const getStepDescription = (step: number) => {
    const stepDescriptions = [
      'Ensuring the user story has proper role, action, and benefit structure',
      'Defining the specific user goal and what they want to accomplish',
      'Identifying what triggers the user story to begin',
      'Defining the business rules and validation logic',
      'Determining how the system provides feedback to the user',
      'Planning how to handle errors and edge cases',
      'Considering performance, security, and scalability requirements',
      'Ensuring proper audit trails and proof of completion'
    ];
    return stepDescriptions[step] || `Working on step ${step + 1} of acceptance criteria development`;
  };

  // Get step-specific focus for stakeholder based on context
  const getStepSpecificFocus = (stepIndex: number, stakeholder: StakeholderPersona, userStory?: string, scenario?: string) => {
    const context = userStory || scenario || '';
    const lowerContext = context.toLowerCase();
    
    // Get the current step name for context
    const stepName = getStepName(stepIndex);
    
    // Extract key concepts from the context for intelligent focus
    const isProgressTracker = lowerContext.includes('progress') || lowerContext.includes('tracker') || lowerContext.includes('completed');
    const isPayment = lowerContext.includes('payment') || lowerContext.includes('pay') || lowerContext.includes('billing') || lowerContext.includes('invoice');
    const isAuthentication = lowerContext.includes('login') || lowerContext.includes('sign in') || lowerContext.includes('authentication') || lowerContext.includes('password');
    const isNotification = lowerContext.includes('notification') || lowerContext.includes('alert') || lowerContext.includes('email') || lowerContext.includes('message');
    const isSearch = lowerContext.includes('search') || lowerContext.includes('find') || lowerContext.includes('filter') || lowerContext.includes('query');
    const isUpload = lowerContext.includes('upload') || lowerContext.includes('file') || lowerContext.includes('document') || lowerContext.includes('attachment');
    const isReporting = lowerContext.includes('report') || lowerContext.includes('analytics') || lowerContext.includes('dashboard') || lowerContext.includes('metrics');
    const isInventory = lowerContext.includes('inventory') || lowerContext.includes('stock') || lowerContext.includes('product') || lowerContext.includes('warehouse');
    const isBooking = lowerContext.includes('book') || lowerContext.includes('reservation') || lowerContext.includes('appointment') || lowerContext.includes('schedule');
    const isApproval = lowerContext.includes('approve') || lowerContext.includes('approval') || lowerContext.includes('review') || lowerContext.includes('workflow');
    const isLearning = lowerContext.includes('learner') || lowerContext.includes('course') || lowerContext.includes('lesson') || lowerContext.includes('training');
    const isCustomer = lowerContext.includes('customer') || lowerContext.includes('client') || lowerContext.includes('user') || lowerContext.includes('member');
    
    // Create intelligent, context-aware focus based on scenario, user story, and AC step
    const getContextFocus = (stepType: string, stakeholderType: string) => {
      // Extract the main feature/concept from the context
      let featureContext = '';
      if (isProgressTracker) featureContext = 'progress tracking';
      else if (isPayment) featureContext = 'payment processing';
      else if (isAuthentication) featureContext = 'authentication';
      else if (isNotification) featureContext = 'notifications';
      else if (isSearch) featureContext = 'search functionality';
      else if (isUpload) featureContext = 'file upload';
      else if (isReporting) featureContext = 'reporting and analytics';
      else if (isInventory) featureContext = 'inventory management';
      else if (isBooking) featureContext = 'booking system';
      else if (isApproval) featureContext = 'approval workflow';
      else if (isLearning) featureContext = 'learning management';
      else if (isCustomer) featureContext = 'customer management';
      else {
        // Extract key words from context for generic scenarios
        const words = context.split(' ').filter(word => word.length > 3);
        featureContext = words.slice(0, 2).join(' ') || 'this feature';
      }

      // Create step-specific, context-aware focus
      const stepFoci = {
        'structure': {
          'product-manager': `how this ${featureContext} feature adds business value and meets user needs`,
          'operations-manager': `how this ${featureContext} affects daily operations and workflows`,
          'technical-lead': `how to build this ${featureContext} system and what technology is needed`,
          'business-stakeholder': `the requirements for this ${featureContext} functionality`
        },
        'goal': {
          'product-manager': `how this ${featureContext} aligns with business goals and user objectives`,
          'operations-manager': `how this ${featureContext} improves operational efficiency`,
          'technical-lead': `what this ${featureContext} system needs to accomplish`,
          'business-stakeholder': `the success criteria for this ${featureContext}`
        },
        'trigger': {
          'product-manager': `when this ${featureContext} should be activated in the user journey`,
          'operations-manager': `when this ${featureContext} should be triggered in operations`,
          'technical-lead': `what triggers this ${featureContext} process`,
          'business-stakeholder': `the triggers for this ${featureContext} functionality`
        },
        'rules': {
          'product-manager': `the business rules and policies for this ${featureContext}`,
          'operations-manager': `the operational rules and procedures for this ${featureContext}`,
          'technical-lead': `the technical rules and validation for this ${featureContext}`,
          'business-stakeholder': `the business logic and validation rules for this ${featureContext}`
        },
        'feedback': {
          'product-manager': `how this ${featureContext} provides feedback to improve user experience`,
          'operations-manager': `how this ${featureContext} provides operational feedback and monitoring`,
          'technical-lead': `how the system provides feedback for this ${featureContext}`,
          'business-stakeholder': `the feedback mechanisms for this ${featureContext}`
        },
        'error': {
          'product-manager': `what happens when this ${featureContext} encounters errors`,
          'operations-manager': `how to handle errors in this ${featureContext} process`,
          'technical-lead': `how to handle technical problems with this ${featureContext}`,
          'business-stakeholder': `the error handling requirements for this ${featureContext}`
        },
        'constraints': {
          'product-manager': `the performance and business constraints for this ${featureContext}`,
          'operations-manager': `the operational constraints and limitations for this ${featureContext}`,
          'technical-lead': `the technical limitations and performance requirements for this ${featureContext}`,
          'business-stakeholder': `the business constraints for this ${featureContext}`
        },
        'audit': {
          'product-manager': `the audit and compliance requirements for this ${featureContext}`,
          'operations-manager': `the tracking and monitoring requirements for this ${featureContext}`,
          'technical-lead': `the logging and audit trail requirements for this ${featureContext}`,
          'business-stakeholder': `the validation and audit requirements for this ${featureContext}`
        }
      };

      return stepFoci[stepType]?.[stakeholderType] || `the requirements for this ${featureContext}`;
    };

    const stepTypes = ['structure', 'goal', 'trigger', 'rules', 'feedback', 'error', 'constraints', 'audit'];
    const stepType = stepTypes[stepIndex] || 'structure';
    
    const stepFoci = {
      0: { // User Story Structure Check
        'product-manager': getContextFocus('structure', 'product-manager'),
        'operations-manager': getContextFocus('structure', 'operations-manager'),
        'technical-lead': getContextFocus('structure', 'technical-lead'),
        'business-stakeholder': getContextFocus('structure', 'business-stakeholder')
      },
      1: { // Match the User Goal
        'product-manager': getContextFocus('goal', 'product-manager'),
        'operations-manager': getContextFocus('goal', 'operations-manager'),
        'technical-lead': getContextFocus('goal', 'technical-lead'),
        'business-stakeholder': getContextFocus('goal', 'business-stakeholder')
      },
      2: { // Trigger Definition
        'product-manager': getContextFocus('trigger', 'product-manager'),
        'operations-manager': getContextFocus('trigger', 'operations-manager'),
        'technical-lead': getContextFocus('trigger', 'technical-lead'),
        'business-stakeholder': getContextFocus('trigger', 'business-stakeholder')
      },
      3: { // Business Rules
        'product-manager': getContextFocus('rules', 'product-manager'),
        'operations-manager': getContextFocus('rules', 'operations-manager'),
        'technical-lead': getContextFocus('rules', 'technical-lead'),
        'business-stakeholder': getContextFocus('rules', 'business-stakeholder')
      },
      4: { // Feedback Mechanisms
        'product-manager': getContextFocus('feedback', 'product-manager'),
        'operations-manager': getContextFocus('feedback', 'operations-manager'),
        'technical-lead': getContextFocus('feedback', 'technical-lead'),
        'business-stakeholder': getContextFocus('feedback', 'business-stakeholder')
      },
      5: { // Error Handling
        'product-manager': getContextFocus('error', 'product-manager'),
        'operations-manager': getContextFocus('error', 'operations-manager'),
        'technical-lead': getContextFocus('error', 'technical-lead'),
        'business-stakeholder': getContextFocus('error', 'business-stakeholder')
      },
      6: { // Non-Functional Constraints
        'product-manager': getContextFocus('constraints', 'product-manager'),
        'operations-manager': getContextFocus('constraints', 'operations-manager'),
        'technical-lead': getContextFocus('constraints', 'technical-lead'),
        'business-stakeholder': getContextFocus('constraints', 'business-stakeholder')
      },
      7: { // Proof and Audit Trail
        'product-manager': getContextFocus('audit', 'product-manager'),
        'operations-manager': getContextFocus('audit', 'operations-manager'),
        'technical-lead': getContextFocus('audit', 'technical-lead'),
        'business-stakeholder': getContextFocus('audit', 'business-stakeholder')
      }
    };
    return stepFoci[stepIndex as keyof typeof stepFoci]?.[stakeholder.id as keyof typeof stepFoci[0]] || stakeholder.focus;
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    
    try {
      // Call the stakeholder-reply API
      const response = await fetch('/api/stakeholder-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId: 'advanced-scenario',
          chat: [
            { role: 'user', content: `Hi, I'm working on acceptance criteria for this user story: ${currentUserStory || 'my user story'}` },
            { role: 'user', content: question }
          ],
          scenarioContext: currentUserStory || (currentScenario ? currentScenario.description || currentScenario.title : null),
          currentStep: currentStep,
          stepName: getStepName(currentStep),
          stepDescription: getStepDescription(currentStep),
          stakeholder: currentStakeholder
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get stakeholder response');
      }

      const data = await response.json();
      
      // Add user question to chat history
      const userMessage = {
        role: 'user' as const,
        content: question,
        timestamp: new Date().toLocaleTimeString()
      };
      
      // Add stakeholder response to chat history
      const stakeholderMessage = {
        role: 'stakeholder' as const,
        content: data.content,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setChatHistory(prev => [...prev, userMessage, stakeholderMessage]);
      
    } catch (error) {
      console.error('Error getting stakeholder response:', error);
      
      // Add error message to chat history
      const errorMessage = {
        role: 'stakeholder' as const,
        content: 'Sorry, I had trouble getting a response. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setQuestion('');
    }
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
              {currentStakeholder?.avatar ? (
                <img 
                  src={currentStakeholder.avatar} 
                  alt={currentStakeholder.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-lg">🤖</span>
                </div>
              )}
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {currentStakeholder ? currentStakeholder.name : 'Stakeholder Bot'}
              </h3>
              <p className="text-xs opacity-90">
                {currentStakeholder ? currentStakeholder.role : 'Your AI stakeholder'}
              </p>
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
            <span className="text-sm font-semibold text-blue-800">
              {currentUserStory ? 'Current User Story' : 'Current Scenario'}
            </span>
          </div>
          <div className="text-sm text-gray-700 bg-white/70 p-3 rounded-xl border border-blue-100 max-h-20 overflow-y-auto">
            {currentUserStory || (currentScenario ? currentScenario.description || currentScenario.title : 'Advanced user story practice - ask me about any scenario or user story requirements!')}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-gray-50 rounded-2xl p-3 space-y-3 min-h-0 overflow-y-auto">
          {chatHistory.length === 0 ? (
            <>
              <div className="text-center text-gray-500 text-sm">
                💡 {currentUserStory ? 'Ask questions about your user story to get stakeholder insights' : 'Ask me about user stories, scenarios, or business requirements!'}
              </div>
              
              {/* Context-aware questions */}
              <div className="space-y-2">
                <div className="text-xs text-gray-600 font-medium">
                  {currentUserStory ? `Quick questions for Step ${currentStep + 1}:` : 'Try asking:'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentUserStory ? (
                    getContextualQuestions(currentStep).map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setQuestion(q)}
                        className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        {q}
                      </button>
                    ))
                  ) : (
                    [
                      "What makes a good user story?",
                      "How do I write acceptance criteria?",
                      "What should I consider for user experience?",
                      "What are common user story mistakes?"
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setQuestion(q)}
                        className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        {q}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'stakeholder' && (
                        currentStakeholder?.avatar ? (
                          <img 
                            src={currentStakeholder.avatar} 
                            alt={currentStakeholder.name}
                            className="w-4 h-4 rounded-full object-cover mt-0.5 flex-shrink-0"
                          />
                        ) : (
                          <Bot size={16} className="mt-0.5 flex-shrink-0" />
                        )
                      )}
                      {message.role === 'user' && <User size={16} className="mt-0.5 flex-shrink-0" />}
                      <div>
                        <div dangerouslySetInnerHTML={{ 
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        }} />
                        <div className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl text-sm">
                    <div className="flex items-center space-x-2">
                      {currentStakeholder?.avatar ? (
                        <img 
                          src={currentStakeholder.avatar} 
                          alt={currentStakeholder.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      ) : (
                        <Bot size={16} />
                      )}
                      <div className="flex items-center space-x-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Scroll target for auto-scroll */}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="mt-auto space-y-3">
          <div className="flex gap-2">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (question.trim() && !isLoading) {
                    handleSubmit();
                  }
                }
              }}
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

