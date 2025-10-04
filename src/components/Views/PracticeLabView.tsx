import React from 'react';
import { 
  ArrowLeft, 
  Target, 
  Users, 
  Clock, 
  CheckCircle, 
  Play,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Award
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const PracticeLabView: React.FC = () => {
  const { setCurrentView } = useApp();

  const handleBack = () => {
    setCurrentView('training-hub');
  };

  const handleStartPractice = () => {
    setCurrentView('training-practice');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Practice Lab
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Structured questioning and guided learning
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Your Path */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Target className="w-5 h-5 text-purple-600 mr-2" />
              Your Path
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Practice Lab</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Structured questioning and guided learning
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Time Investment</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    3-5 hours to complete this phase
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Outcome</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You'll feel confident in stakeholder interactions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - What You'll Accomplish */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              What You'll Accomplish
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Master stakeholder questioning frameworks</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Practice structured interview techniques</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Complete guided assessment exercises</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Build confidence in your communication skills</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Sessions Overview */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Play className="w-5 h-5 text-blue-600 mr-2" />
            Available Practice Sessions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white text-sm">Requirements Gathering</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Practice asking the right questions to understand stakeholder needs
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>8-12 minutes</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white text-sm">Stakeholder Interviews</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Conduct effective interviews with different stakeholder types
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>10-15 minutes</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white text-sm">Process Analysis</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Analyze current processes and identify improvement opportunities
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>12-18 minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleStartPractice}
            className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <span>Get Started</span>
            <Play className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeLabView;











