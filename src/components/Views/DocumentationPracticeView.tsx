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

        {/* Instructions - Open and Flowing */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'practice' ? (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How to Practice:
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                  <span>Read the scenario</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                  <span>Write user story</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
                  <span>Add acceptance criteria</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                💡 Get instant AI coaching on each criterion to improve your skills
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Advanced Challenge:
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Test yourself with complex business rules, multi-step processes, and real-world enterprise scenarios.
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


