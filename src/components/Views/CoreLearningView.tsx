import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  BookOpen, 
  GraduationCap, 
  PlayCircle, 
  FileText, 
  Layers, 
  PenTool, 
  Rocket, 
  Target,
  ArrowRight,
  Clock,
  Users,
  Award,
  Star,
  TrendingUp,
  Brain,
  Zap
} from 'lucide-react';

const CoreLearningView: React.FC = () => {
  const { setCurrentView } = useApp();

  const learningModules = [
    {
      id: 'ba-fundamentals',
      title: 'BA Fundamentals',
      description: 'Master core business analysis concepts and practices. Learn the practice of enabling change by defining needs and recommending solutions that deliver value to stakeholders.',
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      estimatedHours: 8,
      difficulty: 'Beginner',
      topics: ['Business Analysis Definition', 'Requirements Elicitation Techniques', 'Organizational Structure Analysis']
    },
    {
      id: 'project-initiation',
      title: 'Project Initiation',
      description: 'Learn how to properly initiate and set up business analysis projects. Understand stakeholder identification, scope definition, and project planning.',
      icon: PlayCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      estimatedHours: 6,
      difficulty: 'Beginner',
      topics: ['Stakeholder Analysis', 'Scope Definition', 'Project Charter', 'Initial Requirements']
    },
    {
      id: 'elicitation',
      title: 'Requirements Elicitation',
      description: 'Master the art of gathering requirements from stakeholders. Learn various elicitation techniques and how to conduct effective interviews and workshops.',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      estimatedHours: 10,
      difficulty: 'Intermediate',
      topics: ['Interview Techniques', 'Workshop Facilitation', 'Document Analysis', 'Observation Methods']
    },
    {
      id: 'requirements-engineering',
      title: 'Requirements Engineering',
      description: 'Learn to analyze, document, and manage requirements throughout the project lifecycle. Understand requirements validation and traceability.',
      icon: FileText,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      estimatedHours: 12,
      difficulty: 'Intermediate',
      topics: ['Requirements Analysis', 'Requirements Documentation', 'Requirements Validation', 'Requirements Management']
    },
    {
      id: 'solution-options',
      title: 'Solution Options',
      description: 'Learn to identify, evaluate, and recommend solution options. Understand how to assess feasibility and create business cases.',
      icon: Layers,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      estimatedHours: 8,
      difficulty: 'Intermediate',
      topics: ['Solution Identification', 'Feasibility Analysis', 'Business Case Development', 'Solution Evaluation']
    },
    {
      id: 'documentation',
      title: 'Documentation',
      description: 'Master the art of creating clear, comprehensive documentation. Learn user stories, acceptance criteria, and requirements specifications.',
      icon: FileText,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      estimatedHours: 10,
      difficulty: 'Intermediate',
      topics: ['User Stories', 'Acceptance Criteria', 'Requirements Specifications', 'Documentation Standards']
    },
    {
      id: 'design-hub',
      title: 'Design',
      description: 'Learn to design solutions that meet business needs. Understand user experience design, system design, and solution architecture.',
      icon: PenTool,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      estimatedHours: 14,
      difficulty: 'Advanced',
      topics: ['User Experience Design', 'System Design', 'Solution Architecture', 'Design Patterns']
    },
    {
      id: 'mvp-hub',
      title: 'MVP',
      description: 'Learn to build Minimum Viable Products and manage product backlogs. Understand agile development and iterative delivery.',
      icon: Rocket,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      estimatedHours: 12,
      difficulty: 'Advanced',
      topics: ['MVP Planning', 'Product Backlog', 'Agile Development', 'Iterative Delivery']
    },
    {
      id: 'ba-reference',
      title: 'BA Reference Library',
      description: 'Comprehensive collection of business analysis resources, books, standards, and tools to support your BA journey.',
      icon: BookOpen,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      estimatedHours: 'Ongoing',
      difficulty: 'All Levels',
      topics: ['Books & Standards', 'Templates & Tools', 'Best Practices', 'Industry Resources']
    }
  ];

  const handleModuleClick = (moduleId: string) => {
    setCurrentView(moduleId as any);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-6 relative">
                <GraduationCap className="w-10 h-10 text-white" />
                <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
                Core Learning
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Master the essential business analysis skills through our comprehensive learning modules
              </p>
            </div>
          </div>

          {/* Learning Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {learningModules.map((module) => {
              const Icon = module.icon;
              return (
                <div 
                  key={module.id}
                  className="group cursor-pointer"
                  onClick={() => handleModuleClick(module.id)}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 group-hover:scale-105 h-full">
                    {/* Module Icon */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${module.color} rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Module Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        module.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        module.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        module.difficulty === 'Advanced' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {module.difficulty}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        {module.estimatedHours}h
                      </div>
                    </div>

                    {/* Module Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {module.title}
                    </h3>

                    {/* Module Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                      {module.description}
                    </p>

                    {/* Topics */}
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <Brain className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Topics</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {module.topics.slice(0, 3).map((topic, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-lg"
                          >
                            {topic}
                          </span>
                        ))}
                        {module.topics.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-lg">
                            +{module.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 group-hover:shadow-lg">
                        <span>Start Learning</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {module.topics.length} topics
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Learning Path Information */}
          <div className="mt-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Learning Journey</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Progress through these modules in order to build a solid foundation in business analysis. 
                  Each module builds upon the previous ones, ensuring you develop comprehensive skills.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Beginner Friendly</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start with fundamentals and build your skills progressively
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Practical Focus</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Learn through real-world scenarios and hands-on exercises
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Industry Standard</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on BABOK, BCS, and industry best practices
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreLearningView;
