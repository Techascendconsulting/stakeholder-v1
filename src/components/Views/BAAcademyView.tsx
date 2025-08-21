import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BookOpen, GraduationCap, Zap, CheckCircle, Play, Pause, ArrowRight, Send, MessageCircle } from 'lucide-react';
import LectureService, { type LectureResponse } from '../../services/lectureService';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  topics: string[];
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

  const learningModules: LearningModule[] = [
    // Phase 1: Foundation (Months 1-3)
    {
      id: 'organizational-context',
      title: 'Organizational Context & Business Operations',
      description: 'Understand how organizations operate, how departments work together, and the business context where BAs work.',
      difficulty: 'Beginner',
      status: 'not-started',
      progress: 0,
      topics: [
        'Understanding Organizational Structure',
        'Department Functions and Interactions',
        'Customer Journey Across Departments',
        'IT Team Roles and Responsibilities',
        'Products/Services Impact on Structure',
        'Common Departmental Inefficiencies'
      ]
    },
    {
      id: 'project-lifecycle',
      title: 'Project Lifecycle & IT Team Structure',
      description: 'Learn how projects emerge from business needs, IT team structure, and the problem vs delivery phases.',
      difficulty: 'Beginner',
      status: 'not-started',
      progress: 0,
      topics: [
        'Project Emergence from Business Needs',
        'IT Team Structure and Roles',
        'Hardware and Software Implementation',
        'Problem Phase: Stakeholder Engagement',
        'Delivery Phase: Development Team Collaboration',
        'Cross-functional Team Dynamics'
      ]
    },
    {
      id: 'ba-fundamentals',
      title: 'Software BA Fundamentals',
      description: 'Learn the core concepts and role of a Software Business Analyst in modern development teams.',
      difficulty: 'Beginner',
      status: 'not-started',
      progress: 0,
      topics: [
        'Software BA Role and Responsibilities',
        'BA vs Product Manager vs Product Owner',
        'Software Development Lifecycle',
        'Agile vs Waterfall Overview',
        'Essential BA Tools'
      ]
    },
    {
      id: 'requirements-gathering',
      title: 'Requirements Gathering',
      description: 'Master the art of gathering, documenting, and managing software requirements effectively.',
      difficulty: 'Beginner',
      status: 'not-started',
      progress: 0,
      topics: [
        'User Story Writing and Development',
        'Stakeholder Interview Techniques',
        'Workshop Facilitation Skills',
        'Requirements Documentation Standards',
        'Acceptance Criteria Development'
      ]
    },
    {
      id: 'agile-techniques',
      title: 'Agile BA Techniques',
      description: 'Master agile methodologies and ceremonies for effective software development collaboration.',
      difficulty: 'Beginner',
      status: 'not-started',
      progress: 0,
      topics: [
        'Sprint Planning and Backlog Management',
        'Agile Ceremonies for BAs',
        'User Acceptance Testing (UAT)',
        'Story Point Estimation',
        'Velocity Tracking and Forecasting'
      ]
    },

    // Phase 2: Technical Skills (Months 4-6)
    {
      id: 'technical-analysis',
      title: 'Technical Analysis',
      description: 'Develop technical analysis skills for software projects and system integration.',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      topics: [
        'System Analysis Techniques',
        'API and Integration Requirements',
        'Database Requirements Analysis',
        'Technical Documentation Standards',
        'Technical Feasibility Assessment'
      ]
    },
    {
      id: 'process-modeling',
      title: 'Process Modeling',
      description: 'Learn to model and optimize business processes for software implementation.',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      topics: [
        'BPMN Notation',
        'Swimlane Diagrams',
        'Current vs Future State Mapping',
        'Gap Analysis',
        'Process Optimization'
      ]
    },
    {
      id: 'stakeholder-management',
      title: 'Stakeholder Management',
      description: 'Master stakeholder analysis, communication, and relationship management.',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      topics: [
        'Stakeholder Analysis (RACI Matrix)',
        'Power/Interest Grid',
        'Communication Planning',
        'Requirements Prioritization',
        'Change Management'
      ]
    },

    // Phase 3: Advanced Techniques (Months 7-9)
    {
      id: 'documentation-communication',
      title: 'Documentation & Communication',
      description: 'Master BA documentation standards and effective communication techniques.',
      duration: '6 weeks',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      topics: [
        'Requirements Documentation',
        'Presentation Skills',
        'Report Writing',
        'Executive Communication',
        'Visual Aids and Diagrams'
      ]
    },
    {
      id: 'quality-assurance',
      title: 'Quality Assurance',
      description: 'Learn to coordinate testing, ensure quality, and manage software delivery.',
      duration: '5 weeks',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      topics: [
        'Test Strategy Development',
        'UAT Planning and Coordination',
        'Defect Management',
        'Quality Metrics and KPIs',
        'Release Management'
      ]
    },
    {
      id: 'software-tools',
      title: 'Software BA Tools',
      description: 'Master essential tools and technologies for modern software BA work.',
      duration: '4 weeks',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      topics: [
        'Jira and Confluence',
        'Requirements Management Tools',
        'Process Modeling Tools',
        'Data Analysis Tools',
        'Collaboration Platforms'
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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Play className="w-5 h-5 text-blue-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
      const module = learningModules.find(m => m.id === moduleId);
      const topic = module?.topics[0] || 'Introduction';
      const lecture = await lectureService.startLecture(moduleId, topic);
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
    <div key={module.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(module.status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{module.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(module.difficulty)}`}>
          {module.difficulty}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{module.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${module.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Topics Covered:</h4>
        <ul className="space-y-1">
          {module.topics.slice(0, 3).map((topic, index) => (
            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
              {topic}
            </li>
          ))}
          {module.topics.length > 3 && (
            <li className="text-sm text-gray-500 dark:text-gray-500">
              +{module.topics.length - 3} more topics
            </li>
          )}
        </ul>
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={() => startModule(module.id)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Start Learning</span>
        </button>
      </div>
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
                         <p className="text-sm">{message.content}</p>
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
               <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
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
                onClick={() => setCurrentTopic(index)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  index === currentTopic
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BA Academy</h1>
              <p className="text-gray-600 dark:text-gray-400">Master Software Business Analysis</p>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Your Learning Journey</h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Follow our structured learning path designed specifically for Software Business Analysts. 
              Each module builds on the previous one, ensuring you develop comprehensive BA skills.
            </p>
          </div>
        </div>

        {/* Content */}
        {isLectureActive ? (
          renderLectureView()
        ) : (
          <div className="space-y-8">
            {/* Phase 1: Foundation */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 dark:text-green-400 font-bold">1</span>
                </div>
                Foundation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningModules.slice(0, 5).map(renderModuleCard)}
              </div>
            </div>

            {/* Phase 2: Technical Skills */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                </div>
                Technical Skills
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningModules.slice(5, 8).map(renderModuleCard)}
              </div>
            </div>

            {/* Phase 3: Advanced Techniques */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">3</span>
                </div>
                Advanced Techniques
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningModules.slice(8, 11).map(renderModuleCard)}
              </div>
            </div>

            {/* Phase 4: Specialization */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">4</span>
                </div>
                Specialization
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningModules.slice(11, 14).map(renderModuleCard)}
              </div>
            </div>

            {/* Phase 5: Mastery */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-red-600 dark:text-red-400 font-bold">5</span>
                </div>
                Mastery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningModules.slice(14, 17).map(renderModuleCard)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BAAcademyView;
