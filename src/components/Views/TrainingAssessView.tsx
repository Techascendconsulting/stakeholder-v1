import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { TrainingService } from '../../services/trainingService';
import { TrainingSession, TrainingQuestion, TrainingFeedback, StudyPack } from '../../types/training';
import { 
  ArrowLeft, 
  Send, 
  Target, 
  Award, 
  Clock, 
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Users,
  TrendingUp,
  ChevronRight,
  BookOpen,
  Play,
  X
} from 'lucide-react';

const TrainingAssessView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [currentStep, setCurrentStep] = useState<'meeting-prep' | 'live-meeting' | 'feedback'>('meeting-prep');
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [feedback, setFeedback] = useState<TrainingFeedback | null>(null);
  const [studyPack, setStudyPack] = useState<StudyPack | null>(null);
  const [meetingTime, setMeetingTime] = useState(0);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const trainingService = TrainingService.getInstance();

  useEffect(() => {
    // Get session from session storage
    const config = sessionStorage.getItem('trainingConfig');
    if (config) {
      const parsedConfig = JSON.parse(config);
      const sessionData = trainingService.getSession(parsedConfig.sessionId);
      if (sessionData) {
        setSession(sessionData);
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMeetingActive && currentStep === 'live-meeting') {
      interval = setInterval(() => {
        setMeetingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMeetingActive, currentStep]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartMeeting = () => {
    if (session) {
      trainingService.updateSessionStatus(session.id, 'live_meeting');
      setCurrentStep('live-meeting');
      setIsMeetingActive(true);
      
      // Add initial greeting
      const initialMessage = {
        id: 'initial',
        sender: 'system',
        content: `Welcome to your ${session.stage.replace('_', ' ')} assessment! 

This is an independent assessment - no coaching will be provided. Demonstrate your skills and knowledge.

Good luck!`,
        timestamp: new Date(),
        type: 'greeting'
      };
      setMessages([initialMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Simulate AI response (in real implementation, this would use your existing AI service)
      setTimeout(() => {
        const aiResponse = generateAIResponse(inputMessage);
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: aiResponse,
          timestamp: new Date(),
          stakeholder: 'Assessment Guide'
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);

        // Check if session should end (after 10 questions or 12 minutes)
        if (messages.length >= 20 || meetingTime >= 720) {
          handleEndMeeting();
        }
      }, 1500);
    } catch (error) {
      console.error('Error generating response:', error);
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    // This is a simplified response generator
    // In the real implementation, this would use your existing AI service
    const responses = [
      "That's a great question! Let me help you explore that further. Can you tell me more about what specific aspects you'd like to understand?",
      "Excellent point. This is exactly the kind of question that helps uncover important insights. What have you observed about this in your experience?",
      "I appreciate you asking about that. It's crucial to understand the current state before moving forward. How do you think this impacts the overall process?",
      "That's a thoughtful question. Let's dive deeper into this area. What specific challenges have you encountered related to this?",
      "Great observation! This is a key area that often gets overlooked. Can you walk me through how this currently works in your process?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleEndMeeting = () => {
    if (session) {
      setIsMeetingActive(false);
      trainingService.updateSessionStatus(session.id, 'post_brief');
      
      // Generate feedback
      const feedbackData = trainingService.generateFeedback(session.id, messages);
      setFeedback(feedbackData);
      
      // Generate study pack if failed
      if (!feedbackData.passed) {
        const studyPackData = trainingService.generateStudyPack(session.stage, feedbackData.coverageAnalysis.missed);
        setStudyPack(studyPackData);
      }
      
      setCurrentStep('feedback');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    setCurrentView('training-hub');
  };

  const handleRetake = () => {
    if (session) {
      // Create new assessment session
      const newSession = trainingService.createSession(session.projectId, session.stage, 'assess');
      sessionStorage.setItem('trainingConfig', JSON.stringify({
        project: { id: session.projectId },
        stage: session.stage,
        mode: 'assess',
        sessionId: newSession.id
      }));
      
      // Reset state and start over
      setSession(newSession);
      setMessages([]);
      setFeedback(null);
      setStudyPack(null);
      setMeetingTime(0);
      setCurrentStep('meeting-prep');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPreBrief = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-2">
          Assessment: {session?.stage?.replace('_', ' ') || 'Unknown Stage'}
        </h2>
        <p className="text-purple-700 dark:text-purple-300 mb-4">
          This is an independent assessment. No coaching will be provided - demonstrate your skills and knowledge.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assessment Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Stage:</span>
              <span className="font-medium text-gray-900 dark:text-white">{session?.stage?.replace('_', ' ') || 'Unknown Stage'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Project:</span>
              <span className="font-medium text-gray-900 dark:text-white">{session?.projectId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Duration:</span>
              <span className="font-medium text-gray-900 dark:text-white">8-12 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Mode:</span>
              <span className="font-medium text-gray-900 dark:text-white">Assessment (no coaching)</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pass Requirements</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Pass Threshold:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {session?.stage === 'problem_exploration' || session?.stage === 'to_be' ? '65%' : '70%'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Coverage Weight:</span>
              <span className="font-medium text-gray-900 dark:text-white">70%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Technique Weight:</span>
              <span className="font-medium text-gray-900 dark:text-white">20%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Independence Weight:</span>
              <span className="font-medium text-gray-900 dark:text-white">10%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assessment Guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>No coaching or hints will be provided during the assessment</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Focus on covering all 5 must-cover areas for your stage</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Ask open-ended questions and follow up appropriately</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Maintain good conversation balance and avoid early solutioning</span>
          </li>
        </ul>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleStartMeeting}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Start Assessment</span>
        </button>
      </div>
    </div>
  );

  const renderLiveMeeting = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Assessment Meeting</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {session?.stage?.replace('_', ' ') || 'Unknown Stage'} • {formatTime(meetingTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatTime(meetingTime)}</span>
            </div>
            <button
              onClick={handleEndMeeting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              End Assessment
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.sender === 'system'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {message.sender === 'ai' && (
                          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            {message.stakeholder}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  rows={2}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Assessment Info */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Assessment Status */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span>Assessment Status</span>
            </h3>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                <span className="font-medium">Mode:</span> Independent Assessment
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                <span className="font-medium">Coaching:</span> Disabled
              </p>
            </div>
          </div>

          {/* Assessment Info */}
          <div className="flex-1 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span>Assessment Info</span>
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Pass Requirements</h4>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Cover all 5 must-cover areas</li>
                  <li>• Ask open-ended questions</li>
                  <li>• Maintain good conversation flow</li>
                  <li>• Avoid early solutioning</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Scoring Weights</h4>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Coverage: 70%</li>
                  <li>• Technique: 20%</li>
                  <li>• Independence: 10%</li>
                </ul>
              </div>

              <div className="text-center py-8">
                <X className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No coaching available during assessment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPostBrief = () => (
    <div className="space-y-6">
      {feedback?.passed ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
            🎉 Assessment Passed!
          </h2>
          <p className="text-green-700 dark:text-green-300">
            Congratulations! You've successfully demonstrated mastery of the {session?.stage?.replace('_', ' ') || 'Unknown Stage'} stage.
          </p>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
            Assessment Not Yet Passed
          </h2>
          <p className="text-red-700 dark:text-red-300">
            Your study pack is ready. Review the feedback and try again when you're ready.
          </p>
        </div>
      )}

      {feedback && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Assessment Results</h3>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                feedback.passed ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {Math.round(feedback.overallScore)}%
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Coverage (70%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Math.round(feedback.coverageAnalysis.score)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${feedback.coverageAnalysis.score}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Technique (20%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Math.round(feedback.techniqueAnalysis.score)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${feedback.techniqueAnalysis.score}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Independence (10%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Math.round(feedback.independenceAnalysis.score)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${feedback.independenceAnalysis.score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Coverage Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Coverage Analysis</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Covered Areas</h4>
                <ul className="space-y-1">
                  {feedback.coverageAnalysis.covered.map((area, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {feedback.coverageAnalysis.missed.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Missed Areas</h4>
                  <ul className="space-y-1">
                    {feedback.coverageAnalysis.missed.map((area, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Study Pack for Failed Attempts */}
      {studyPack && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Study Pack</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Weak Areas to Focus On</h4>
              <ul className="space-y-1">
                {studyPack.weakAreas.map((area, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {studyPack.miniLessons.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Mini-Lessons</h4>
                <ul className="space-y-1">
                  {studyPack.miniLessons.map((lesson, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                      <BookOpen className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {studyPack.drills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Practice Drills</h4>
                <ul className="space-y-1">
                  {studyPack.drills.map((drill, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                      <Target className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{drill.prompt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Time Scripts */}
      {feedback && feedback.nextTimeScripts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Next Time Scripts</h3>
          <ul className="space-y-2">
            {feedback.nextTimeScripts.map((script, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{script}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Back to Training Hub
        </button>
        {!feedback?.passed && studyPack && (
          <button
            onClick={handleRetake}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Retake Assessment
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {currentStep === 'meeting-prep' && renderPreBrief()}
      {currentStep === 'live-meeting' && renderLiveMeeting()}
              {currentStep === 'feedback' && renderPostBrief()}
    </div>
  );
};

export default TrainingAssessView;
