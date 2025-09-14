import React from 'react';
import { 
  Target, 
  Zap, 
  FileText, 
  BarChart3,
  ArrowRight,
  Play,
  BookOpen,
  Users,
  TrendingUp,
  Users2
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface PracticeCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
  actionText: string;
  viewId: string;
}

const PracticeLandingView: React.FC = () => {
  const { setCurrentView } = useApp();

  const practiceCategories: PracticeCategory[] = [
    {
      id: 'project-practice',
      title: 'Project Practice',
      description: 'Practice stakeholder conversations with realistic AI agents in guided training sessions',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      features: [
        'Realistic Stakeholder Conversations',
        'Guided Training Sessions',
        'Live Coaching & Feedback',
        'Skill Assessments'
      ],
      actionText: 'Start Practicing',
      viewId: 'training-hub'
    },
    {
      id: 'scrum-practice',
      title: 'Scrum Practice',
      description: 'Master Agile methodologies and Scrum ceremonies',
      icon: Users2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      features: [
        'Sprint Planning',
        'Daily Standups',
        'Retrospectives',
        'Agile Refinement'
      ],
      actionText: 'Explore Scrum',
      viewId: 'agile-practice'
    },
    {
      id: 'practice-deliverables',
      title: 'Practice Deliverables',
      description: 'Create and refine your BA deliverables with guided templates',
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      features: [
        'Requirements Documents',
        'Process Maps',
        'User Stories',
        'Acceptance Criteria'
      ],
      actionText: 'View Templates',
      viewId: 'training-deliverables'
    },
    {
      id: 'progress-tracking',
      title: 'Progress Tracking',
      description: 'Monitor your learning journey and skill development',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      features: [
        'Skill Assessments',
        'Learning Analytics',
        'Achievement Badges',
        'Progress Reports'
      ],
      actionText: 'View Progress',
      viewId: 'progress-tracking'
    }
  ];

  const handleCategoryClick = (viewId: string) => {
    setCurrentView(viewId as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Modern Header */}
      <div className="relative bg-white dark:bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Practice Hub
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose your learning path and start building real-world Business Analysis skills
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Practice Categories - Long Horizontal Cards */}
        <div className="space-y-6">
          {practiceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => handleCategoryClick(category.viewId)}
              >
                {/* Arrow in top right corner */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <ArrowRight className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>

                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex gap-6">
                  {/* Thumbnail */}
                  <div className={`relative w-48 h-32 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
                    category.id === 'project-practice' ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500' :
                    category.id === 'scrum-practice' ? 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500' :
                    category.id === 'practice-deliverables' ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' :
                    'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500'
                  }`}>
                    {/* Floating Elements */}
                    <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-6 right-6 w-6 h-6 bg-white/15 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute top-1/2 left-8 w-4 h-4 bg-white/10 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                    
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/95 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">Practice Hub</span>
                    </div>
                    <div className="relative z-10">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed text-lg">
                      {category.description}
                    </p>
                    
                    {/* Features List */}
                    <div className="mb-6">
                      <ul className="space-y-2">
                        {category.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <div className={`w-2 h-2 rounded-full mr-3 ${
                              category.id === 'project-practice' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                              category.id === 'scrum-practice' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              category.id === 'practice-deliverables' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                              'bg-gradient-to-r from-emerald-500 to-green-500'
                            }`}></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className={`text-sm font-semibold ${
                      category.id === 'project-practice' ? 'text-purple-600 dark:text-purple-400' :
                      category.id === 'scrum-practice' ? 'text-blue-600 dark:text-blue-400' :
                      category.id === 'practice-deliverables' ? 'text-indigo-600 dark:text-indigo-400' :
                      'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {category.actionText} • Interactive • Guided learning
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who are already mastering Business Analysis skills with our interactive practice platform.
            </p>
            <button
              onClick={() => handleCategoryClick('training-hub')}
              className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeLandingView;

