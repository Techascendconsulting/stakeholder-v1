import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BookOpen, FileText, CheckCircle, Lock, Star, Target, Users, Brain } from 'lucide-react';
import CaseStudyView from './CaseStudyView';
import AssignmentView from './AssignmentView';

interface Assessment {
  id: string;
  title: string;
  type: 'case-study' | 'assignment';
  topic: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  score?: number;
}

const AssessmentsView: React.FC = () => {
  const { currentView, setCurrentView } = useApp();
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [activeTab, setActiveTab] = useState<'case-studies' | 'assignments'>('case-studies');
  const [currentAssessmentView, setCurrentAssessmentView] = useState<'list' | 'case-study' | 'assignment'>('list');
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string>('');
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  // Load completion status from localStorage
  useEffect(() => {
    const savedCompletedModules = localStorage.getItem('completedModules');
    if (savedCompletedModules) {
      setCompletedModules(new Set(JSON.parse(savedCompletedModules)));
    }
  }, []);

  const isModuleCompleted = (moduleId: string): boolean => {
    return completedModules.has(moduleId);
  };

  // Mock assessments data - in real implementation, this would come from the lecture service
  const assessments: Assessment[] = [
    // Case Studies
    {
      id: 'cs-ba-definition',
      title: 'TechCorp Process Improvement',
      type: 'case-study',
      topic: 'Business Analysis Definition',
      description: 'Analyze a software company\'s development process issues and apply BA principles to identify solutions.',
      difficulty: 'intermediate',
      estimatedTime: '30-45 minutes',
      isUnlocked: true,
      isCompleted: false
    },
    {
      id: 'cs-requirements',
      title: 'EcoTech Energy Management',
      type: 'case-study',
      topic: 'Requirements Engineering',
      description: 'Gather requirements for a smart energy management platform with multiple stakeholder groups.',
      difficulty: 'advanced',
      estimatedTime: '45-60 minutes',
      isUnlocked: false,
      isCompleted: false
    },
    {
      id: 'cs-stakeholders',
      title: 'CityConnect Transportation',
      type: 'case-study',
      topic: 'Stakeholder Management',
      description: 'Manage diverse stakeholder interests in a public transportation modernization project.',
      difficulty: 'advanced',
      estimatedTime: '40-50 minutes',
      isUnlocked: false,
      isCompleted: false
    },
    // Assignments
    {
      id: 'as-ba-concepts',
      title: 'Core Concepts Application',
      type: 'assignment',
      topic: 'Business Analysis Core Concepts',
      description: 'Apply BA core concepts to analyze current state vs future state scenarios.',
      difficulty: 'beginner',
      estimatedTime: '20-30 minutes',
      isUnlocked: true,
      isCompleted: false
    },
    {
      id: 'as-deliverables',
      title: 'Deliverables Creation',
      type: 'assignment',
      topic: 'Business Analysis Deliverables',
      description: 'Create appropriate deliverables for a digital banking onboarding project.',
      difficulty: 'intermediate',
      estimatedTime: '25-35 minutes',
      isUnlocked: false,
      isCompleted: false
    },
    {
      id: 'as-skills',
      title: 'Skills Assessment',
      type: 'assignment',
      topic: 'Business Analysis Skills and Competencies',
      description: 'Demonstrate BA skills in a complex multi-stakeholder ERP implementation scenario.',
      difficulty: 'advanced',
      estimatedTime: '35-45 minutes',
      isUnlocked: false,
      isCompleted: false
    }
  ];

  const caseStudies = assessments.filter(a => a.type === 'case-study');
  const assignments = assessments.filter(a => a.type === 'assignment');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'case-study' ? <Users className="w-5 h-5" /> : <FileText className="w-5 h-5" />;
  };

  const handleAssessmentClick = (assessment: Assessment) => {
    if (assessment.isUnlocked) {
      setSelectedAssessment(assessment);
    }
  };

  const handleStartAssessment = () => {
    if (selectedAssessment) {
      setCurrentAssessmentId(selectedAssessment.id);
      if (selectedAssessment.type === 'case-study') {
        setCurrentAssessmentView('case-study');
      } else {
        setCurrentAssessmentView('assignment');
      }
    }
  };

  const handleBackToList = () => {
    setCurrentAssessmentView('list');
    setSelectedAssessment(null);
    setCurrentAssessmentId('');
  };

  // Render assessment views
  if (currentAssessmentView === 'case-study') {
    return (
      <CaseStudyView 
        caseStudyId={currentAssessmentId} 
        onBack={handleBackToList} 
      />
    );
  }

  if (currentAssessmentView === 'assignment') {
    return (
      <AssignmentView 
        assignmentId={currentAssessmentId} 
        onBack={handleBackToList} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assessments</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Apply your BA knowledge through case studies and assignments
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Progress:</span> 2/6 completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('case-studies')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'case-studies'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Case Studies ({caseStudies.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignments'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Assignments ({assignments.length})
            </button>
          </nav>
        </div>

        {/* Assessment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'case-studies' ? caseStudies : assignments).map((assessment) => (
            <div
              key={assessment.id}
              onClick={() => handleAssessmentClick(assessment)}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                assessment.isUnlocked
                  ? 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                  : 'border-gray-300 dark:border-gray-600 opacity-60'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(assessment.type)}
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {assessment.type === 'case-study' ? 'Case Study' : 'Assignment'}
                    </span>
                  </div>
                  {assessment.isUnlocked ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {assessment.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {assessment.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(assessment.difficulty)}`}>
                    {assessment.difficulty}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {assessment.estimatedTime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Topic: {assessment.topic}
                  </span>
                  {assessment.isCompleted && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {assessment.score}/100
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Assessment Detail Modal */}
        {selectedAssessment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedAssessment.title}
                </h2>
                <button
                  onClick={() => setSelectedAssessment(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedAssessment.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Topic</span>
                    <p className="text-gray-900 dark:text-white">{selectedAssessment.topic}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Difficulty</span>
                    <p className="text-gray-900 dark:text-white capitalize">{selectedAssessment.difficulty}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Time</span>
                    <p className="text-gray-900 dark:text-white">{selectedAssessment.estimatedTime}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</span>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {selectedAssessment.type === 'case-study' ? 'Case Study' : 'Assignment'}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedAssessment(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartAssessment}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Start Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentsView;
