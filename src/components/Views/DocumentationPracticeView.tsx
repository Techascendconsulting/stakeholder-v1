import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ArrowLeft, ArrowRight, FileText, Sparkles, Zap, Award, Target } from 'lucide-react';
import PracticeAndCoachingLayer from '../training/PracticeAndCoachingLayer';
import AdvancedLayer from '../training/AdvancedLayer';
import { StakeholderBotProvider } from '../../context/StakeholderBotContext';

const DocumentationPracticeView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [activeTab, setActiveTab] = useState<'practice' | 'advanced'>('practice');
  
  // Function to switch to advanced tab (can be called from child components)
  const switchToAdvancedTab = () => {
    setActiveTab('advanced');
  };

  // Ensure currentView is set to documentation-practice when this component loads
  useEffect(() => {
    setCurrentView('documentation-practice');
  }, [setCurrentView]);

  // Save view to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('documentationPractice_view', activeTab);
    } catch (error) {
      console.log('Error saving documentation practice view to localStorage:', error);
    }
  }, [activeTab]);

  return (
    <StakeholderBotProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Clean Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Back Button */}
            <button
              onClick={() => setCurrentView('practice-flow')}
              className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Practice Journey</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Title Section */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {activeTab === "practice" ? "Documentation Practice" : "Advanced Documentation Practice"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeTab === "practice" 
                    ? "Write user stories and acceptance criteria with instant AI feedback" 
                    : "Master complex scenarios with advanced coaching"}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveTab("practice")}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium flex items-center space-x-2 ${
                    activeTab === "practice"
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Practice</span>
                </button>
                <button
                  onClick={() => setActiveTab("advanced")}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium flex items-center space-x-2 ${
                    activeTab === "advanced"
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Advanced</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions with Visual Interest */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {activeTab === 'practice' ? (
            <div className="border-l-4 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 pl-6 py-4 rounded-r-lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                How to Practice
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-300 mb-3">
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                  <span className="font-medium">Read scenario</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                  <span className="font-medium">Write user story</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
                  <span className="font-medium">Add criteria</span>
                </div>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                💡 AI coaching guides you through each acceptance criterion
              </p>
            </div>
          ) : (
            <div className="border-l-4 border-purple-600 bg-purple-50/50 dark:bg-purple-900/10 pl-6 py-4 rounded-r-lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                Advanced Challenge
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Master complex business rules, multi-step processes, and real-world enterprise scenarios that professional BAs encounter.
              </p>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
            {activeTab === "practice" && <PracticeAndCoachingLayer onSwitchToAdvanced={switchToAdvancedTab} />}
            {activeTab === "advanced" && <AdvancedLayer />}
          </div>
        </div>
      </div>
    </StakeholderBotProvider>
  );
};

export default DocumentationPracticeView;



