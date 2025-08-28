import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BookOpen, GraduationCap, Zap, CheckCircle, Play, Pause, ArrowRight, Send, MessageCircle, Clock, Users, Award, Star, TrendingUp, Target, Brain } from 'lucide-react';
import LectureService, { type LectureResponse } from '../../services/lectureService';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  topics: string[];
  estimatedHours: number;
  learningOutcomes: string[];
  prerequisites?: string[];
}

const BAAcademyView: React.FC = () => {
  const { currentView } = useApp();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isLectureActive, setIsLectureActive] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(0);
  const [lectureService] = useState(() => LectureService.getInstance());
  const [currentLecture, setCurrentLecture] = useState<LectureResponse | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  // Calculate overall progress
  const calculateOverallProgress = () => {
    const totalModules = learningModules.length;
    const completedModules = learningModules.filter(m => m.status === 'completed').length;
    const inProgressModules = learningModules.filter(m => m.status === 'in-progress').length;
    
    // Count in-progress as 50% complete
    const progressScore = (completedModules + (inProgressModules * 0.5)) / totalModules * 100;
    return Math.round(progressScore);
  };

  // Find recommended next module
  const getRecommendedNextModule = () => {
    // Find first not-started module
    return learningModules.find(m => m.status === 'not-started') || null;
  };

  // Filter modules based on search and difficulty
  const getFilteredModules = () => {
    return learningModules.filter(module => {
      const matchesSearch = searchTerm === '' || 
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDifficulty = difficultyFilter === 'all' || module.difficulty === difficultyFilter;
      
      return matchesSearch && matchesDifficulty;
    });
  };

  // Get filtered modules for a specific phase
  const getFilteredModulesForPhase = (startIndex: number, endIndex: number) => {
    const filteredModules = getFilteredModules();
    return learningModules.slice(startIndex, endIndex).filter(module => 
      filteredModules.includes(module)
    );
  };

  const learningModules: LearningModule[] = [
    // Phase 1: Foundation (Months 1-3)
    {
      id: 'ba-fundamentals',
      title: 'Business Analysis Fundamentals',
      description: 'Master core business analysis concepts and practices. Learn the practice of enabling change by defining needs and recommending solutions that deliver value to stakeholders.',
      difficulty: 'Beginner',
      status: 'not-started',
      progress: 0,
      estimatedHours: 8,
      topics: [
        'Business Analysis Definition',
        'Requirements Elicitation Techniques',
        'Organizational Structure Analysis'
      ],
      learningOutcomes: [
        'Define business analysis and its role in organizations',
        'Identify key stakeholders and their needs',
        'Apply basic requirements elicitation techniques',
        'Understand organizational structures and impact on BA work'
      ]
    },

    // Phase 2: Technical Skills (Months 4-6)
    {
      id: 'technical-analysis',
      title: 'Technical Analysis',
      description: 'Develop technical analysis competencies as outlined in BCS and IIBA frameworks. Learn to analyze system requirements, integration needs, and technical feasibility for software solutions.',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      estimatedHours: 12,
      prerequisites: ['ba-fundamentals'],
      topics: [
        'System Requirements Analysis (BCS)',
        'API and Integration Requirements',
        'Technical Feasibility Assessment',
        'System Architecture Understanding',
        'Technical Documentation Standards',
        'Technology Stack Evaluation'
      ],
      learningOutcomes: [
        'Analyze system requirements for software projects',
        'Evaluate technical feasibility of proposed solutions',
        'Document API and integration requirements',
        'Communicate effectively with development teams',
        'Assess technology stack options and trade-offs'
      ]
    },
    {
      id: 'process-modeling',
      title: 'Process Modeling',
      description: 'Master business process modeling techniques using BPMN and other industry standards. Learn to analyze, design, and optimize business processes for software implementation.',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      topics: [
        'BPMN 2.0 Notation Standards',
        'Process Analysis and Design',
        'Current State vs Future State Modeling',
        'Process Gap Analysis',
        'Process Optimization Techniques',
        'Process Automation Requirements'
      ]
    },
    {
      id: 'stakeholder-management',
      title: 'Stakeholder Management',
      description: 'Master stakeholder analysis and management practices based on IIBA BABOK standards. Learn to identify, analyze, and engage stakeholders effectively throughout the business analysis lifecycle.',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      topics: [
        'Stakeholder Identification and Analysis (BABOK)',
        'RACI Matrix and Responsibility Assignment',
        'Stakeholder Engagement Planning',
        'Communication Strategy Development',
        'Stakeholder Influence and Interest Mapping',
        'Change Management and Stakeholder Adoption'
      ]
    },

    // Phase 3: Advanced Techniques (Months 7-9)
    {
      id: 'documentation-communication',
      title: 'Documentation & Communication',
      description: 'Master business analysis documentation standards and communication techniques as defined by BCS and IIBA. Learn to create clear, comprehensive, and professional BA deliverables.',
      duration: '6 weeks',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      topics: [
        'Business Requirements Documentation (BABOK)',
        'Requirements Specification Standards',
        'Executive Communication and Reporting',
        'Visual Modeling and Diagrams',
        'Documentation Quality Assurance',
        'Stakeholder Communication Planning'
      ]
    },
    {
      id: 'quality-assurance',
      title: 'Quality Assurance',
      description: 'Master solution evaluation and quality assurance practices based on BABOK standards. Learn to assess solution performance, validate requirements, and ensure quality delivery.',
      duration: '5 weeks',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      topics: [
        'Solution Evaluation (BABOK)',
        'Requirements Validation and Verification',
        'User Acceptance Testing (UAT)',
        'Quality Metrics and Performance Measurement',
        'Solution Performance Assessment',
        'Continuous Improvement and Optimization'
      ]
    },
    {
      id: 'software-tools',
      title: 'Business Analysis Tools',
      description: 'Master essential business analysis tools and technologies as recommended by BCS and IIBA. Learn to leverage technology for effective requirements management and stakeholder collaboration.',
      duration: '4 weeks',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      topics: [
        'Requirements Management Tools',
        'Process Modeling and BPMN Tools',
        'Collaboration and Communication Platforms',
        'Data Analysis and Visualization Tools',
        'Project Management Integration',
        'Business Analysis Tool Selection'
      ]
    },

    // Phase 4: Specialization (Months 10-12)
    {
      id: 'cloud-saas',
      title: 'Cloud & SaaS',
      description: 'Specialize in cloud migration and SaaS implementation requirements.',
      duration: '5 weeks',
      difficulty: 'Advanced',
      status: 'not-started',
      progress: 0,
      topics: [
        'Cloud Migration Requirements',
        'SaaS Implementation',
        'Multi-tenant Architecture',
        'Cloud Security Requirements',
        'Cost Optimization'
      ]
    },
    {
      id: 'mobile-web',
      title: 'Mobile & Web Applications',
      description: 'Master requirements gathering for mobile and web application development.',
      duration: '5 weeks',
      difficulty: 'Advanced',
      status: 'not-started',
      progress: 0,
      topics: [
        'Mobile App Requirements',
        'Responsive Web Design',
        'Progressive Web Apps',
        'App Store Requirements',
        'Cross-platform Considerations'
      ]
    },
    {
      id: 'ai-ml',
      title: 'AI & Machine Learning',
      description: 'Learn to gather requirements for AI and machine learning projects.',
      duration: '6 weeks',
      difficulty: 'Advanced',
      status: 'not-started',
      progress: 0,
      topics: [
        'AI/ML Requirements Gathering',
        'Data Requirements for ML',
        'Model Validation Requirements',
        'Ethical AI Considerations',
        'AI Integration Requirements'
      ]
    },

    // Phase 5: Mastery (Months 13-15)
    {
      id: 'devops-cicd',
      title: 'DevOps & CI/CD',
      description: 'Master requirements for DevOps and continuous integration/continuous deployment.',
      duration: '5 weeks',
      difficulty: 'Advanced',
      status: 'not-started',
      progress: 0,
      topics: [
        'CI/CD Requirements',
        'Release Automation',
        'Environment Management',
        'Monitoring and Observability',
        'Deployment Strategies'
      ]
    },
    {
      id: 'strategic-planning',
      title: 'Strategic Planning',
      description: 'Develop strategic BA skills for product planning and business alignment.',
      duration: '6 weeks',
      difficulty: 'Advanced',
      status: 'not-started',
      progress: 0,
      topics: [
        'Product Strategy Alignment',
        'Roadmap Planning',
        'Business Case Development',
        'ROI Analysis',
        'Strategic Requirements'
      ]
    },
    {
      id: 'team-leadership',
      title: 'Team Leadership',
      description: 'Master BA team leadership and process improvement skills.',
      duration: '5 weeks',
      difficulty: 'Advanced',
      status: 'not-started',
      progress: 0,
      topics: [
        'Leading BA Teams',
        'Mentoring Junior BAs',
        'Process Improvement',
        'Best Practices Establishment',
        'BA Team Management'
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-white" />;
      case 'in-progress':
        return <Play className="w-4 h-4 text-white" />;
      default:
        return <BookOpen className="w-4 h-4 text-white" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800';
      case 'Intermediate':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200 dark:border-amber-800';
      case 'Advanced':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border border-rose-200 dark:border-rose-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200 border border-gray-200 dark:border-gray-800';
    }
  };

  const startModule = async (moduleId: string) => {
    setSelectedModule(moduleId);
    setIsLectureActive(true);
    setCurrentTopic(0);
    setConversationHistory([]);
    
    // Start the interactive lecture
    setIsLoading(true);
    try {
      const lecture = await lectureService.startLecture(moduleId, 0); // Pass topicIndex as 0
      setCurrentLecture(lecture);
      setConversationHistory([{ role: 'ai', content: lecture.content }]);
    } catch (error) {
      console.error('Error starting lecture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserInput = async () => {
    if (!userInput.trim() || !selectedModule || isLoading) return;

    const userMessage = userInput.trim();
    setUserInput('');
    setConversationHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await lectureService.continueLecture(selectedModule, userMessage);
      setCurrentLecture(response);
      setConversationHistory(prev => [...prev, { role: 'ai', content: response.content }]);
    } catch (error) {
      console.error('Error continuing lecture:', error);
      setConversationHistory(prev => [...prev, { role: 'ai', content: 'I apologize, but I\'m having trouble responding right now. Let\'s continue with the lesson.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  };

  const renderModuleCard = (module: LearningModule) => (
    <div 
      key={module.id} 
      className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
    >
      {/* Status Indicator */}
      <div className="absolute -top-2 -right-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
          module.status === 'completed' ? 'bg-emerald-500' : 
          module.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
        }`}>
          {getStatusIcon(module.status)}
        </div>
      </div>

      {/* Difficulty Badge */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              module.difficulty === 'Beginner' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
              module.difficulty === 'Intermediate' ? 'bg-amber-100 dark:bg-amber-900/30' :
              'bg-rose-100 dark:bg-rose-900/30'
            }`}>
              {module.difficulty === 'Beginner' ? <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> :
               module.difficulty === 'Intermediate' ? <Brain className="w-6 h-6 text-amber-600 dark:text-amber-400" /> :
               <Star className="w-6 h-6 text-rose-600 dark:text-rose-400" />}
            </div>
            <div>
              <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(module.difficulty)}`}>
                {module.difficulty}
              </span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {module.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
            {module.description}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <span className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Progress
          </span>
          <span className="text-blue-600 dark:text-blue-400">{module.progress}%</span>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden" 
              style={{ width: `${module.progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Outcomes */}
      {module.learningOutcomes && (
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Target className="w-4 h-4 mr-2 text-gray-500" />
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              What You'll Learn
            </h4>
          </div>
          <div className="space-y-2">
            {module.learningOutcomes.slice(0, 3).map((outcome, index) => (
              <div key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{outcome}</span>
              </div>
            ))}
            {module.learningOutcomes.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-500 ml-5 font-medium">
                +{module.learningOutcomes.length - 3} more outcomes
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {module.prerequisites && module.prerequisites.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <ArrowRight className="w-3 h-3 mr-2 text-amber-500" />
            <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Prerequisites Required
            </h4>
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400">
            Complete {module.prerequisites.map(prereq => 
              learningModules.find(m => m.id === prereq)?.title || prereq
            ).join(', ')} first
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3 mr-1" />
          <span>{module.estimatedHours || Math.ceil(module.topics.length * 2)}h</span>
        </div>
        <button
          onClick={() => startModule(module.id)}
          className="group/btn relative inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span>Start Learning</span>
          <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
        </button>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );

  const renderLectureView = () => {
    const module = learningModules.find(m => m.id === selectedModule);
    if (!module) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{module.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">Interactive Learning Session</p>
          </div>
          <button
            onClick={() => setIsLectureActive(false)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            ← Back to Modules
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {module.topics[currentTopic]}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Topic {currentTopic + 1} of {module.topics.length}
              </p>
            </div>
          </div>

                     <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
             <div className="flex items-center space-x-4 mb-4">
               <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                 <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
               </div>
               <div>
                 <h4 className="font-medium text-gray-900 dark:text-white">Interactive Learning</h4>
                 <p className="text-sm text-gray-600 dark:text-gray-400">
                   {currentLecture?.phase === 'teach' ? 'Teaching Mode' : 
                    currentLecture?.phase === 'practice' ? 'Practice Mode' : 'Assessment Mode'}
                 </p>
               </div>
             </div>

             {/* Conversation History */}
             <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
               {conversationHistory.length === 0 ? (
                 <p className="text-gray-700 dark:text-gray-300">
                   Welcome to {module.topics[currentTopic]}! Let's start learning together. 
                   I'll guide you through this topic with interactive examples and practice exercises.
                 </p>
               ) : (
                 <div className="space-y-4">
                   {conversationHistory.map((message, index) => (
                     <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                         message.role === 'user' 
                           ? 'bg-blue-600 text-white' 
                           : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                       }`}>
                         <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                           __html: message.content
                             .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                             .replace(/\n/g, '<br>')
                         }} />
                       </div>
                     </div>
                   ))}
                   {isLoading && (
                     <div className="flex justify-start">
                       <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg">
                         <div className="flex space-x-1">
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               )}
             </div>

             {/* User Input */}
             <div className="flex space-x-3">
               <div className="flex-1">
                 <input
                   type="text"
                   value={userInput}
                   onChange={(e) => setUserInput(e.target.value)}
                   onKeyPress={handleKeyPress}
                   placeholder="Ask a question or respond to the lesson..."
                   className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                   disabled={isLoading}
                 />
               </div>
               <button
                 onClick={handleUserInput}
                 disabled={!userInput.trim() || isLoading}
                 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
               >
                 <Send className="w-4 h-4" />
                 <span>Send</span>
               </button>
             </div>

             {/* Quick Actions */}
             <div className="flex space-x-3 mt-4">
               <button 
                 onClick={() => {
                   const module = learningModules.find(m => m.id === selectedModule);
                   const topic = module?.topics[currentTopic] || 'Introduction';
                   lectureService.startPractice(selectedModule, topic).then(response => {
                     setCurrentLecture(response);
                     setConversationHistory(prev => [...prev, { role: 'ai', content: response.content }]);
                   });
                 }}
                 className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
               >
                 <Play className="w-4 h-4" />
                 <span>Start Practice</span>
               </button>
               <button 
                 onClick={async () => {
                   const nextTopicIndex = currentTopic + 1;
                   if (nextTopicIndex < module.topics.length) {
                     setCurrentTopic(nextTopicIndex);
                     setConversationHistory([]);
                     setIsLoading(true);
                     try {
                       const lecture = await lectureService.startLecture(selectedModule, nextTopicIndex);
                       setCurrentLecture(lecture);
                       setConversationHistory([{ role: 'ai', content: lecture.content }]);
                     } catch (error) {
                       console.error('Error switching to next topic:', error);
                       setConversationHistory([{ role: 'ai', content: `Welcome to ${module.topics[nextTopicIndex]}! Let's start learning about this topic.` }]);
                     } finally {
                       setIsLoading(false);
                     }
                   }
                 }}
                 disabled={currentTopic >= module.topics.length - 1}
                 className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
               >
                 <ArrowRight className="w-4 h-4" />
                 <span>Next Topic</span>
               </button>
             </div>
           </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {module.topics.map((topic, index) => (
              <button
                key={index}
                onClick={async () => {
                  setCurrentTopic(index);
                  setConversationHistory([]);
                  setIsLoading(true);
                  try {
                    const lecture = await lectureService.startLecture(selectedModule, index);
                    setCurrentLecture(lecture);
                    setConversationHistory([{ role: 'ai', content: lecture.content }]);
                  } catch (error) {
                    console.error('Error switching topic:', error);
                    setConversationHistory([{ role: 'ai', content: `Welcome to ${topic}! Let's start learning about this topic.` }]);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  index === currentTopic
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                title={`Topic ${index + 1}: ${topic}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Topic {currentTopic + 1} of {module.topics.length}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Modern Header */}
          <div className="mb-12">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-6 relative">
                <GraduationCap className="w-10 h-10 text-white" />
                <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
                BA Academy
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Master Software Business Analysis with our comprehensive, hands-on learning platform
              </p>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl mb-4 mx-auto">
                    <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">15+</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Learning Modules</p>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4 mx-auto">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">100+</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hours of Content</p>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-4 mx-auto">
                    <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">5</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Learning Phases</p>
                </div>
              </div>
            </div>
            
            {/* Journey Overview */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mr-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Your Learning Journey</h3>
                  <p className="text-gray-600 dark:text-gray-400">Structured progression from fundamentals to mastery</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What You'll Master</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span>Requirements Elicitation & Analysis</span>
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span>Stakeholder Management & Communication</span>
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span>Process Modeling & Documentation</span>
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span>Technical Analysis & Solution Design</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Approach</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <Brain className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span>Interactive AI-powered lessons</span>
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <Target className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                      <span>Hands-on practice scenarios</span>
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <Award className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
                      <span>Progress tracking & assessments</span>
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      <Users className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span>Industry-standard frameworks</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Progress Section */}
          <div className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Progress Info */}
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Your Learning Progress</h3>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Overall Completion</span>
                      <span className="font-semibold">{calculateOverallProgress()}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                        style={{ width: `${calculateOverallProgress()}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {learningModules.filter(m => m.status === 'completed').length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {learningModules.filter(m => m.status === 'in-progress').length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {learningModules.filter(m => m.status === 'not-started').length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
                    </div>
                  </div>
                </div>

                {/* Recommended Next Module */}
                {getRecommendedNextModule() && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800/50 lg:max-w-md">
                    <div className="flex items-center mb-3">
                      <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Recommended Next</h4>
                    </div>
                    <h5 className="font-bold text-gray-900 dark:text-white mb-2">
                      {getRecommendedNextModule()?.title}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {getRecommendedNextModule()?.description}
                    </p>
                    <button
                      onClick={() => getRecommendedNextModule() && startModule(getRecommendedNextModule()!.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Continue Learning</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search modules, topics, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div className="md:w-48">
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>{getFilteredModules().length} of {learningModules.length} modules</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLectureActive ? (
            renderLectureView()
          ) : (
            <div className="space-y-16">
              {/* Phase 1: Foundation */}
              {getFilteredModulesForPhase(0, 5).length > 0 && (
                <div className="relative">
                  <div className="flex items-center mb-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl mr-6">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Foundation</h2>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">Build your core BA knowledge and skills</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {getFilteredModulesForPhase(0, 5).map(renderModuleCard)}
                  </div>
                </div>
              )}

              {/* Phase 2: Technical Skills */}
              {getFilteredModulesForPhase(5, 8).length > 0 && (
                <div className="relative">
                  <div className="flex items-center mb-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl mr-6">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Technical Skills</h2>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">Develop technical analysis capabilities</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {getFilteredModulesForPhase(5, 8).map(renderModuleCard)}
                  </div>
                </div>
              )}

              {/* Phase 3: Advanced Techniques */}
              {getFilteredModulesForPhase(8, 11).length > 0 && (
                <div className="relative">
                  <div className="flex items-center mb-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl mr-6">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Advanced Techniques</h2>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">Master sophisticated BA methodologies</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {getFilteredModulesForPhase(8, 11).map(renderModuleCard)}
                  </div>
                </div>
              )}

              {/* Phase 4: Specialization */}
              {getFilteredModulesForPhase(11, 14).length > 0 && (
                <div className="relative">
                  <div className="flex items-center mb-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl mr-6">
                      <span className="text-2xl font-bold text-white">4</span>
                    </div>
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Specialization</h2>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">Focus on cutting-edge technologies</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {getFilteredModulesForPhase(11, 14).map(renderModuleCard)}
                  </div>
                </div>
              )}

              {/* Phase 5: Mastery */}
              {getFilteredModulesForPhase(14, 17).length > 0 && (
                <div className="relative">
                  <div className="flex items-center mb-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-xl mr-6">
                      <span className="text-2xl font-bold text-white">5</span>
                    </div>
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Mastery</h2>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">Achieve leadership and strategic expertise</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {getFilteredModulesForPhase(14, 17).map(renderModuleCard)}
                  </div>
                </div>
              )}

              {/* Call to Action */}
              <div className="text-center py-16">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
                  <h3 className="text-3xl font-bold mb-4">Ready to Transform Your BA Career?</h3>
                  <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                    Join thousands of professionals who have mastered business analysis through our comprehensive program
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                      Start Your Journey
                    </button>
                    <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                      View Curriculum
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BAAcademyView;
