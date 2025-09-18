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

        {/* Welcome Section - show only on Teaching */}
        {view === "teaching" && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-700">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Documentation Practice
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto">
              You've seen how user stories and acceptance criteria turn stakeholder needs into something teams can actually build. Now it's time to put that into action. This section gives you three ways to practise:
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Walkthrough</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">guided examples that show you how strong user stories and acceptance criteria are written.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Practice</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">your chance to try it yourself, with prompts and feedback.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Advanced</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">more complex scenarios where you'll test your ability to think like a real BA in the workplace.</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-6 text-sm">
              Everything here is designed to help you move beyond theory and build confidence in writing documentation that gets used.
            </p>
          </div>
        </div>
        )}

        {/* Documentation Teaching Insert removed per revert request */}

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






