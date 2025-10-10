import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ArrowLeft, FileText, Sparkles, Zap, Award, Target } from 'lucide-react';
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

        {/* Instructions Banner */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className={`${
            activeTab === 'practice'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
          } rounded-xl border-2 p-6`}>
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                  activeTab === 'practice'
                    ? 'bg-blue-600'
                    : 'bg-purple-600'
                }`}>
                  {activeTab === 'practice' ? (
                    <FileText className="w-6 h-6 text-white" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  {activeTab === 'practice' ? (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        🎯 How to Practice
                      </h3>
                      <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                            <p className="font-bold mb-1 text-gray-900 dark:text-white flex items-center">
                              <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs mr-2 text-white">1</span>
                              Read Scenario
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 ml-8">Understand the business need</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                            <p className="font-bold mb-1 text-gray-900 dark:text-white flex items-center">
                              <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs mr-2 text-white">2</span>
                              Write User Story
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 ml-8">As a... I want... so that...</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                            <p className="font-bold mb-1 text-gray-900 dark:text-white flex items-center">
                              <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs mr-2 text-white">3</span>
                              Add Criteria
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 ml-8">WHEN, RULES, FEEDBACK</p>
                          </div>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg px-4 py-3 border-l-4 border-blue-600 mt-3">
                          <p className="font-semibold text-blue-900 dark:text-blue-200">
                            💡 Get instant AI coaching on each acceptance criterion to improve your documentation skills
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        ⚡ Advanced Practice Challenge
                      </h3>
                      <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                        <p className="text-base font-medium">
                          Ready to level up? Advanced scenarios include:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                            <p className="font-bold mb-1 text-gray-900 dark:text-white">✨ Complex Business Rules</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Multi-step processes, edge cases, exceptions</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                            <p className="font-bold mb-1 text-gray-900 dark:text-white">🎯 Real-World Scenarios</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Enterprise-level requirements from actual projects</p>
                          </div>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg px-4 py-3 border-l-4 border-purple-600 mt-3">
                          <p className="font-semibold text-purple-900 dark:text-purple-200">
                            💡 Challenge yourself with scenarios that real BAs face in the field
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
          </div>
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


