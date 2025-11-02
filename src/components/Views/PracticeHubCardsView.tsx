import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Target, 
  ArrowRight, 
  Users2,
  FileText,
  BarChart3,
  ArrowLeft
} from 'lucide-react';

const PracticeHubCardsView: React.FC = () => {
  const { setCurrentView } = useApp();

  const handleCardClick = (viewId: string) => {
    setCurrentView(viewId as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="relative bg-white dark:bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Back Button */}
          <div className="absolute top-6 left-6">
            <button
              onClick={() => setCurrentView('training-hub')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white/30 transition-all duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Step Into Practice
            </button>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Practice Path
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Select the area you'd like to focus on and start your hands-on learning journey.
            </p>
          </div>
        </div>
      </div>

      {/* Practice Hub Cards */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="space-y-6">
          {/* Project Practice Card */}
          <div 
            className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
            onClick={() => handleCardClick('project-workspace')}
          >
            {/* Arrow in top right corner */}
            <div className="absolute top-4 right-4 z-20">
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            
            <div className="relative z-10 flex gap-6">
              {/* Thumbnail */}
              <div className="relative w-48 h-32 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">Practice Hub</span>
                </div>
                <div className="relative z-10">
                  <Target className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-500/20"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Project Practice</h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-4">
                  Practice stakeholder conversations with realistic AI agents in guided training sessions
                </p>
                
                <div className="space-y-2 mb-4">
                  {['Realistic Stakeholder Conversations', 'Guided Training Sessions', 'Live Coaching & Feedback', 'Skill Assessments'].map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full mr-3 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  Start Practicing • Interactive • Guided learning
                </div>
              </div>
            </div>
          </div>

          {/* Scrum Practice Card */}
          <div 
            className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
            onClick={() => handleCardClick('agile-practice')}
          >
            {/* Arrow in top right corner */}
            <div className="absolute top-4 right-4 z-20">
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            
            <div className="relative z-10 flex gap-6">
              {/* Thumbnail */}
              <div className="relative w-48 h-32 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500">
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">Practice Hub</span>
                </div>
                <div className="relative z-10">
                  <Users2 className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-500/20"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Scrum Practice</h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-4">
                  Master Agile methodologies and Scrum ceremonies
                </p>
                
                <div className="space-y-2 mb-4">
                  {['Sprint Planning', 'Daily Standups', 'Retrospectives', 'Agile Refinement'].map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full mr-3 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Explore Scrum • Interactive • Guided learning
                </div>
              </div>
            </div>
          </div>

          {/* Practice Deliverables Card */}
          <div 
            className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
            onClick={() => handleCardClick('training-deliverables')}
          >
            {/* Arrow in top right corner */}
            <div className="absolute top-4 right-4 z-20">
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            
            <div className="relative z-10 flex gap-6">
              {/* Thumbnail */}
              <div className="relative w-48 h-32 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">Practice Hub</span>
                </div>
                <div className="relative z-10">
                  <FileText className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-500/20"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Practice Deliverables</h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-4">
                  Create and refine your BA deliverables with guided templates
                </p>
                
                <div className="space-y-2 mb-4">
                  {['Requirements Documents', 'Process Maps', 'User Stories', 'Acceptance Criteria'].map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full mr-3 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  View Templates • Interactive • Guided learning
                </div>
              </div>
            </div>
          </div>

          {/* Progress Tracking Card */}
          <div 
            className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
            onClick={() => handleCardClick('progress-tracking')}
          >
            {/* Arrow in top right corner */}
            <div className="absolute top-4 right-4 z-20">
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            
            <div className="relative z-10 flex gap-6">
              {/* Thumbnail */}
              <div className="relative w-48 h-32 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500">
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">Practice Hub</span>
                </div>
                <div className="relative z-10">
                  <BarChart3 className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-green-500/20"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Progress Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-4">
                  Monitor your learning journey and skill development
                </p>
                
                <div className="space-y-2 mb-4">
                  {['Skill Assessments', 'Learning Analytics', 'Achievement Badges', 'Progress Reports'].map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full mr-3 bg-gradient-to-r from-emerald-500 to-green-500"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  View Progress • Interactive • Guided learning
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeHubCardsView;
