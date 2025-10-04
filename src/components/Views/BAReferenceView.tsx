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

const BAReferenceView: React.FC = () => {
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
                BA Reference Library
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Comprehensive reference materials for Business Analysis learning and development
              </p>
            </div>
          </div>

          {/* Reference Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reference Materials</h2>
              <p className="text-gray-600 dark:text-gray-400">
                This page contains the full BA Academy curriculum for reference purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BAReferenceView;


