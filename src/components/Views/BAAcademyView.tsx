import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BookOpen, GraduationCap, Zap, CheckCircle, Play, Pause, ArrowRight } from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
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

  const learningModules: LearningModule[] = [
    {
      id: 'ba-fundamentals',
      title: 'Software BA Fundamentals',
      description: 'Learn the core concepts and role of a Software Business Analyst in modern development teams.',
      duration: '4 weeks',
      difficulty: 'Beginner',
      status: 'not-started',
      progress: 0,
      topics: [
        'What is a Software BA?',
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
      duration: '6 weeks',
      difficulty: 'Beginner',
      status: 'not-started',
      progress: 0,
      topics: [
        'User Story Mastery',
        'Stakeholder Interviews',
        'Agile Ceremonies',
        'Requirements Documentation',
        'Acceptance Criteria'
      ]
    },
    {
      id: 'technical-analysis',
      title: 'Technical Analysis',
      description: 'Develop technical analysis skills for software projects and system integration.',
      duration: '6 weeks',
      difficulty: 'Intermediate',
      status: 'not-started',
      progress: 0,
      topics: [
        'System Analysis',
        'API and Integration Requirements',
        'Database Requirements',
        'Technical Documentation',
        'Technical Feasibility'
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

  const startModule = (moduleId: string) => {
    setSelectedModule(moduleId);
    setIsLectureActive(true);
    setCurrentTopic(0);
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

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">{module.duration}</span>
        <button
          onClick={() => startModule(module.id)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">AI Mentor</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ready to guide you</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <p className="text-gray-700 dark:text-gray-300">
                Welcome to {module.topics[currentTopic]}! Let's start learning together. 
                I'll guide you through this topic with interactive examples and practice exercises.
              </p>
            </div>

            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Play className="w-4 h-4" />
                <span>Start Lecture</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningModules.map(renderModuleCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BAAcademyView;
