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

  const startModule = async (moduleId: string) => {
    setSelectedModule(moduleId);
    setIsLectureActive(true);
    setCurrentTopic(0);
    setConversationHistory([]);
    
    // Start the interactive lecture
    setIsLoading(true);
    try {
      const lecture = await lectureService.startLecture(moduleId, 0);
      setCurrentLecture(lecture);
      setConversationHistory([{ role: 'ai', content: lecture.content }]);
    } catch (error) {
      console.error('Error starting lecture:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      ],
      learningOutcomes: [
        'Create comprehensive BPMN 2.0 process models',
        'Analyze current state vs future state processes',
        'Identify process gaps and optimization opportunities',
        'Design process automation requirements',
        'Communicate process improvements to stakeholders'
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
      ],
      learningOutcomes: [
        'Identify and analyze all project stakeholders effectively',
        'Create comprehensive RACI matrices for project roles',
        'Develop stakeholder engagement and communication strategies',
        'Map stakeholder influence and interest levels',
        'Manage stakeholder expectations and change adoption'
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
      ],
      learningOutcomes: [
        'Create comprehensive business requirements documents',
        'Develop clear requirements specifications following industry standards',
        'Design effective executive communication and reporting strategies',
        'Create visual models and diagrams for stakeholder understanding',
        'Implement documentation quality assurance processes',
        'Plan stakeholder communication throughout the project lifecycle'
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
      ],
      learningOutcomes: [
        'Evaluate solutions against business requirements and success criteria',
        'Validate and verify requirements throughout the development lifecycle',
        'Plan and execute comprehensive user acceptance testing',
        'Establish quality metrics and performance measurement frameworks',
        'Assess solution performance and identify optimization opportunities',
        'Implement continuous improvement processes for BA practices'
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
      ],
      learningOutcomes: [
        'Master requirements management tools for effective requirement tracking',
        'Utilize process modeling and BPMN tools for business process documentation',
        'Leverage collaboration platforms for stakeholder engagement',
        'Apply data analysis and visualization tools for business insights',
        'Integrate BA tools with project management systems',
        'Evaluate and select appropriate BA tools for different project contexts'
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
      ],
      learningOutcomes: [
        'Define comprehensive cloud migration requirements and strategies',
        'Plan SaaS implementation requirements and multi-tenant considerations',
        'Design multi-tenant architecture requirements for scalable solutions',
        'Establish cloud security requirements and compliance frameworks',
        'Develop cost optimization strategies for cloud-based solutions'
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
      ],
      learningOutcomes: [
        'Define comprehensive mobile application requirements and user experience standards',
        'Plan responsive web design requirements for multi-device compatibility',
        'Specify progressive web app requirements for enhanced user experience',
        'Establish app store requirements and compliance frameworks',
        'Design cross-platform requirements for consistent user experiences'
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
      ],
      learningOutcomes: [
        'Define AI and machine learning project requirements and success criteria',
        'Specify data requirements and quality standards for ML model training',
        'Establish model validation and testing requirements for AI solutions',
        'Address ethical AI considerations and bias mitigation requirements',
        'Plan AI integration requirements with existing systems and workflows'
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
      ],
      learningOutcomes: [
        'Define continuous integration and continuous deployment requirements',
        'Plan release automation requirements for efficient software delivery',
        'Establish environment management requirements for consistent deployments',
        'Design monitoring and observability requirements for system health',
        'Develop deployment strategy requirements for risk mitigation and rollback'
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
      ],
      learningOutcomes: [
        'Align business analysis activities with product strategy and organizational goals',
        'Develop comprehensive product roadmaps and strategic planning frameworks',
        'Create compelling business cases with financial justification and risk analysis',
        'Conduct ROI analysis and value realization assessments for strategic initiatives',
        'Define strategic requirements that support long-term business objectives'
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
      ],
      learningOutcomes: [
        'Lead and manage BA teams effectively with strong leadership principles',
        'Mentor junior business analysts and develop talent within the organization',
        'Implement process improvement initiatives to enhance BA team efficiency',
        'Establish best practices and standards for business analysis excellence',
        'Manage BA team resources, priorities, and performance for optimal outcomes'
      ]
    }
  ];

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

          {/* Search and Filter Controls */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search learning modules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div className="lg:w-48">
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Difficulty Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Phases */}
          {!selectedModule && (
            <>
              {/* Phase 1: Foundation */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mr-4">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Foundation Phase</h2>
                    <p className="text-gray-600 dark:text-gray-400">Months 1-3: Core BA Fundamentals</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredModulesForPhase(0, 1).map((module) => (
                    <div key={module.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => startModule(module.id)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          module.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          module.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {module.difficulty}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          module.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          module.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {module.status === 'completed' ? 'Completed' : module.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {module.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {module.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {module.estimatedHours}h
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {module.topics.length} topics
                        </div>
                      </div>
                      
                      {module.status === 'in-progress' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Progress</span>
                            <span className="font-semibold">{module.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${module.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Start Module</span>
                        </button>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 2: Technical Skills */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-4">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Technical Skills Phase</h2>
                    <p className="text-gray-600 dark:text-gray-400">Months 4-6: Advanced Technical Analysis</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredModulesForPhase(1, 4).map((module) => (
                    <div key={module.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => startModule(module.id)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          module.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          module.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {module.difficulty}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          module.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          module.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {module.status === 'completed' ? 'Completed' : module.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {module.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {module.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {module.estimatedHours}h
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {module.topics.length} topics
                        </div>
                      </div>
                      
                      {module.status === 'in-progress' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Progress</span>
                            <span className="font-semibold">{module.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${module.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Start Module</span>
                        </button>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 3: Advanced Techniques */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-4">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Techniques Phase</h2>
                    <p className="text-gray-600 dark:text-gray-400">Months 7-9: Professional Excellence</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredModulesForPhase(4, 7).map((module) => (
                    <div key={module.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => startModule(module.id)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          module.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          module.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {module.difficulty}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          module.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          module.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {module.status === 'completed' ? 'Completed' : module.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {module.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {module.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {module.estimatedHours}h
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {module.topics.length} topics
                        </div>
                      </div>
                      
                      {module.status === 'in-progress' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Progress</span>
                            <span className="font-semibold">{module.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${module.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Start Module</span>
                        </button>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 4: Specialization */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mr-4">
                    <span className="text-white font-bold text-lg">4</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Specialization Phase</h2>
                    <p className="text-gray-600 dark:text-gray-400">Months 10-12: Domain Expertise</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredModulesForPhase(7, 10).map((module) => (
                    <div key={module.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => startModule(module.id)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          module.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          module.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {module.difficulty}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          module.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          module.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {module.status === 'completed' ? 'Completed' : module.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {module.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {module.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {module.estimatedHours}h
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {module.topics.length} topics
                        </div>
                      </div>
                      
                      {module.status === 'in-progress' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Progress</span>
                            <span className="font-semibold">{module.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${module.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Start Module</span>
                        </button>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 5: Mastery */}
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mr-4">
                    <span className="text-white font-bold text-lg">5</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mastery Phase</h2>
                    <p className="text-gray-600 dark:text-gray-400">Months 13-15: Leadership Excellence</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredModulesForPhase(10, 13).map((module) => (
                    <div key={module.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => startModule(module.id)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          module.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          module.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {module.difficulty}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          module.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          module.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {module.status === 'completed' ? 'Completed' : module.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {module.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {module.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {module.estimatedHours}h
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {module.topics.length} topics
                        </div>
                      </div>
                      
                      {module.status === 'in-progress' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Progress</span>
                            <span className="font-semibold">{module.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${module.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Start Module</span>
                        </button>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Interactive Lecture Interface */}
          {selectedModule && isLectureActive && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setSelectedModule(null);
                        setIsLectureActive(false);
                        setCurrentLecture(null);
                        setConversationHistory([]);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-180" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {learningModules.find(m => m.id === selectedModule)?.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Interactive Learning Session
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Live Session</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Lecture Content */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6">
                      <div className="flex items-center mb-4">
                        <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Learning Assistant</h3>
                      </div>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {conversationHistory.map((message, index) => (
                          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-3xl p-4 rounded-lg ${
                              message.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                            }`}>
                              <div className="flex items-start space-x-2">
                                {message.role === 'ai' && <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />}
                                <div className="whitespace-pre-wrap">{message.content}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <div className="flex items-center space-x-2">
                                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Input */}
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && userInput.trim()) {
                            // Handle user input
                            const userMessage = userInput.trim();
                            setConversationHistory(prev => [...prev, { role: 'user', content: userMessage }]);
                            setUserInput('');
                            
                            // Simulate AI response
                            setIsLoading(true);
                            setTimeout(() => {
                              setConversationHistory(prev => [...prev, { 
                                role: 'ai', 
                                content: `Thank you for your input: "${userMessage}". This is a simulated response. In a real implementation, this would integrate with an AI service to provide personalized learning assistance.` 
                              }]);
                              setIsLoading(false);
                            }, 1000);
                          }
                        }}
                        placeholder="Ask a question or share your thoughts..."
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <button
                        onClick={() => {
                          if (userInput.trim()) {
                            const userMessage = userInput.trim();
                            setConversationHistory(prev => [...prev, { role: 'user', content: userMessage }]);
                            setUserInput('');
                            
                            setIsLoading(true);
                            setTimeout(() => {
                              setConversationHistory(prev => [...prev, { 
                                role: 'ai', 
                                content: `Thank you for your input: "${userMessage}". This is a simulated response. In a real implementation, this would integrate with an AI service to provide personalized learning assistance.` 
                              }]);
                              setIsLoading(false);
                            }, 1000);
                          }
                        }}
                        disabled={!userInput.trim() || isLoading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Learning Progress & Topics */}
                  <div className="space-y-6">
                    {/* Module Progress */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Progress</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Current Topic</span>
                            <span>{currentTopic + 1} of {learningModules.find(m => m.id === selectedModule)?.topics.length}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                              style={{ width: `${((currentTopic + 1) / (learningModules.find(m => m.id === selectedModule)?.topics.length || 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Current Topic:</strong> {learningModules.find(m => m.id === selectedModule)?.topics[currentTopic]}
                        </div>
                      </div>
                    </div>

                    {/* Module Topics */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Module Topics</h3>
                      <div className="space-y-2">
                        {learningModules.find(m => m.id === selectedModule)?.topics.map((topic, index) => (
                          <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                            index === currentTopic 
                              ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                              : index < currentTopic 
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                          }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                              index === currentTopic 
                                ? 'bg-blue-600 text-white' 
                                : index < currentTopic 
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-gray-400 text-white'
                            }`}>
                              {index < currentTopic ? <CheckCircle className="w-4 h-4" /> : index + 1}
                            </div>
                            <span className={`text-sm ${
                              index === currentTopic 
                                ? 'text-blue-900 dark:text-blue-100 font-semibold' 
                                : index < currentTopic 
                                  ? 'text-emerald-900 dark:text-emerald-100'
                                  : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {topic}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Outcomes</h3>
                      <div className="space-y-2">
                        {learningModules.find(m => m.id === selectedModule)?.learningOutcomes?.map((outcome, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
