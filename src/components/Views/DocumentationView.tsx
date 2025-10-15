import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ArrowLeft } from 'lucide-react';
import TeachingLayer from '../training/TeachingLayer';
import WalkthroughSelector from '../training/WalkthroughSelector';
import { StakeholderBotProvider } from '../../context/StakeholderBotContext';

interface DocumentationViewProps {
  compact?: boolean;
}

const DocumentationView: React.FC<DocumentationViewProps> = ({ compact = false }) => {
  const { setCurrentView } = useApp();
  const [activeTab, setActiveTab] = useState<'teaching' | 'walkthrough'>('teaching');

  // Save view to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('documentationUI_view', activeTab);
    } catch (error) {
      console.log('Error saving documentation UI view to localStorage:', error);
    }
  }, [activeTab]);

  if (compact) {
    return (
      <StakeholderBotProvider>
        <div className="w-full h-full space-y-3">
          {/* Compact Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("teaching")}
              className={`flex-1 px-3 py-2 text-xs rounded-md transition-all duration-200 font-medium ${
                activeTab === "teaching"
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Teaching
            </button>
            <button
              onClick={() => setActiveTab("walkthrough")}
              className={`flex-1 px-3 py-2 text-xs rounded-md transition-all duration-200 font-medium ${
                activeTab === "walkthrough"
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Walkthrough
            </button>
          </div>

          {/* Compact Content */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm bg-white dark:bg-gray-800">
            {activeTab === "teaching" && <TeachingLayer onStartPractice={() => setActiveTab("walkthrough")} />}
            {activeTab === "walkthrough" && <WalkthroughSelector onStartPractice={() => {}} onBack={() => setActiveTab("teaching")} />}
          </div>
        </div>
      </StakeholderBotProvider>
    );
  }

  return (
    <StakeholderBotProvider>
      <div className="w-full h-full px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === "teaching" ? "Learn Documentation" : 
               activeTab === "walkthrough" ? "Documentation Walkthrough" : ""}
            </h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("teaching")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                activeTab === "teaching"
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Teaching
            </button>
            <button
              onClick={() => setActiveTab("walkthrough")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                activeTab === "walkthrough"
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Walkthrough
            </button>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800 min-h-[500px]">
          {activeTab === "teaching" && <TeachingLayer onStartPractice={() => setActiveTab("walkthrough")} />}
          {activeTab === "walkthrough" && <WalkthroughSelector onStartPractice={() => {}} onBack={() => setActiveTab("teaching")} />}
        </div>
      </div>
    </StakeholderBotProvider>
  );
};

export default DocumentationView;








