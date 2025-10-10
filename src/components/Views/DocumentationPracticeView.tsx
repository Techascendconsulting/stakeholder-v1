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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
        {/* Modern Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Back Button */}
            <button
              onClick={() => setCurrentView('practice-flow')}
              className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Practice Journey</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Title Section */}
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${
                  activeTab === 'practice' 
                    ? 'from-purple-600 to-pink-600' 
                    : 'from-blue-600 to-purple-600'
                }`}>
                  {activeTab === 'practice' ? (
                    <FileText className="w-7 h-7 text-white" />
                  ) : (
                    <Sparkles className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <h1 className={`text-3xl font-bold bg-gradient-to-r ${
                    activeTab === 'practice'
                      ? 'from-purple-600 to-pink-600'
                      : 'from-blue-600 to-purple-600'
                  } bg-clip-text text-transparent`}>
                    {activeTab === "practice" ? "Documentation Practice" : "Advanced Documentation Practice"}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activeTab === "practice" 
                      ? "Write user stories and acceptance criteria with AI feedback" 
                      : "Master complex scenarios with advanced coaching"}
                  </p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl">
                <button
                  onClick={() => setActiveTab("practice")}
                  className={`px-5 py-2.5 text-sm rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 ${
                    activeTab === "practice"
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Practice</span>
                </button>
                <button
                  onClick={() => setActiveTab("advanced")}
                  className={`px-5 py-2.5 text-sm rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 ${
                    activeTab === "advanced"
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Advanced</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Banner */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className={`bg-gradient-to-r ${
            activeTab === 'practice'
              ? 'from-purple-500 via-pink-500 to-purple-600'
              : 'from-blue-500 via-indigo-500 to-purple-600'
          } rounded-2xl shadow-xl overflow-hidden`}>
            <div className="bg-white/10 backdrop-blur-sm p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  {activeTab === 'practice' ? (
                    <FileText className="w-7 h-7 text-white" />
                  ) : (
                    <Award className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="flex-1 text-white">
                  {activeTab === 'practice' ? (
                    <>
                      <h3 className="text-xl font-bold mb-3">
                        🎯 Practice: Write User Stories & Acceptance Criteria
                      </h3>
                      <div className="space-y-3 text-sm text-white/95">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <p className="font-bold mb-1 flex items-center">
                              <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                              Read Scenario
                            </p>
                            <p className="text-xs ml-8">Understand the business need from the scenario</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <p className="font-bold mb-1 flex items-center">
                              <span className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                              Write User Story
                            </p>
                            <p className="text-xs ml-8">Use "As a... I want... so that..." format</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <p className="font-bold mb-1 flex items-center">
                              <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                              Add Criteria
                            </p>
                            <p className="text-xs ml-8">Define WHEN, RULES, FEEDBACK for each criterion</p>
                          </div>
                        </div>
                        <div className="bg-yellow-400/20 backdrop-blur-sm rounded-lg px-4 py-3 border-l-4 border-yellow-300 mt-3">
                          <p className="font-bold">
                            💡 Get instant AI coaching on each step to improve your documentation skills
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold mb-3">
                        ⚡ Advanced Practice: Master Complex Scenarios
                      </h3>
                      <div className="space-y-3 text-sm text-white/95">
                        <p className="text-base">
                          Ready for a challenge? Advanced practice includes:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <p className="font-bold mb-1">✨ Complex Business Rules</p>
                            <p className="text-xs">Multi-step processes, edge cases, and exceptions</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <p className="font-bold mb-1">🎯 Real-World Scenarios</p>
                            <p className="text-xs">Enterprise-level requirements from actual projects</p>
                          </div>
                        </div>
                        <div className="bg-yellow-400/20 backdrop-blur-sm rounded-lg px-4 py-3 border-l-4 border-yellow-300 mt-3">
                          <p className="font-bold">
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
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl bg-white dark:bg-gray-800 overflow-hidden min-h-[500px]">
            {activeTab === "practice" && <PracticeAndCoachingLayer onSwitchToAdvanced={switchToAdvancedTab} />}
            {activeTab === "advanced" && <AdvancedLayer />}
          </div>
        </div>
      </div>
    </StakeholderBotProvider>
  );
};

export default DocumentationPracticeView;

