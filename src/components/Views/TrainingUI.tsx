import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { ArrowLeft } from "lucide-react";
import TeachingLayer from "../training/TeachingLayer";
import WalkthroughSelector from "../training/WalkthroughSelector";
import PracticeAndCoachingLayer from "../training/PracticeAndCoachingLayer";
import AdvancedLayer from "../training/AdvancedLayer";
import { StakeholderBotProvider } from "../../context/StakeholderBotContext";

export default function TrainingUI() {
  const { setCurrentView } = useApp();
  
  // Initialize view from localStorage or default to teaching
  const [view, setView] = useState<"teaching" | "walkthrough" | "practice" | "advanced">(() => {
    try {
      const savedView = localStorage.getItem('trainingUI_view');
      if (savedView && ['teaching', 'walkthrough', 'practice', 'advanced'].includes(savedView)) {
        return savedView as "teaching" | "walkthrough" | "practice" | "advanced";
      }
    } catch (error) {
      console.log('Error loading training UI view from localStorage:', error);
    }
    return "teaching";
  });

  // Save view to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('trainingUI_view', view);
    } catch (error) {
      console.log('Error saving training UI view to localStorage:', error);
    }
  }, [view]);

  return (
    <StakeholderBotProvider>
      <div className="w-full h-full px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('agile-practice')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {view === "teaching" ? "Learn User Stories" : 
               view === "walkthrough" ? "User Story Walkthrough" :
               view === "practice" ? "Practice & Get Feedback" : 
               "Advanced Practice"}
            </h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setView("teaching")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                view === "teaching"
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Teaching
            </button>
            <button
              onClick={() => setView("walkthrough")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                view === "walkthrough"
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Walkthrough
            </button>
            <button
              onClick={() => setView("practice")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                view === "practice"
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Practice
            </button>
            <button
              onClick={() => setView("advanced")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                view === "advanced"
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Advanced Practice
            </button>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800 min-h-[500px]">
          {view === "teaching" && <TeachingLayer onStartPractice={() => setView("walkthrough")} />}
          {view === "walkthrough" && <WalkthroughSelector onStartPractice={() => setView("practice")} onBack={() => setView("teaching")} />}
          {view === "practice" && <PracticeAndCoachingLayer />}
          {view === "advanced" && <AdvancedLayer />}
        </div>
      </div>
    </StakeholderBotProvider>
  );
}

