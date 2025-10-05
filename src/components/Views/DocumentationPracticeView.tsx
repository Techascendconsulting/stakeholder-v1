import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ArrowLeft } from 'lucide-react';
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
      <div className="w-full h-full px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeTab === "practice" ? "Documentation Practice" : "Advanced Documentation Practice"}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("practice")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                activeTab === "practice"
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Practice
            </button>
            <button
              onClick={() => setActiveTab("advanced")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                activeTab === "advanced"
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Advanced Practice
            </button>
          </div>
        </div>

        {/* Introduction Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Ready to Practice What You've Learned?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Now that you've learned how to write user stories and acceptance criteria in the <strong>Teaching</strong> and <strong>Walkthrough</strong> sections, 
              this is where you put that knowledge into practice. Work through real scenarios, get feedback on your user stories, 
              and refine your documentation skills with hands-on exercises.
            </p>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800 min-h-[500px]">
          {activeTab === "practice" && <PracticeAndCoachingLayer onSwitchToAdvanced={switchToAdvancedTab} />}
          {activeTab === "advanced" && <AdvancedLayer />}
        </div>
      </div>
    </StakeholderBotProvider>
  );
};

export default DocumentationPracticeView;
