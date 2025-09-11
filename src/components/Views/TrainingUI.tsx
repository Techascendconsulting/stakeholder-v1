import { useState, useEffect } from "react";
import TeachingLayer from "../training/TeachingLayer";
import PracticeAndCoachingLayer from "../training/PracticeAndCoachingLayer";
import AdvancedLayer from "../training/AdvancedLayer";
import StoryAndCriteriaChecker from "../training/StoryAndCriteriaChecker";

export default function TrainingUI() {
  // Initialize view from localStorage or default to teaching
  const [view, setView] = useState<"teaching" | "practice" | "advanced" | "checker">(() => {
    try {
      const savedView = localStorage.getItem('trainingUI_view');
      if (savedView && ['teaching', 'practice', 'advanced', 'checker'].includes(savedView)) {
        return savedView as "teaching" | "practice" | "advanced" | "checker";
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
    <div className="w-full h-full px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {view === "teaching" ? "Learn User Stories" : 
           view === "practice" ? "Practice & Get Feedback" : 
           view === "advanced" ? "Advanced User Stories" : 
           "Story & Criteria Checker"}
        </h1>
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
            🚀 Advanced
          </button>
          <button
            onClick={() => setView("checker")}
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
              view === "checker"
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Checker
          </button>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800 min-h-[500px]">
        {view === "teaching" && <TeachingLayer onStartPractice={() => setView("practice")} />}
        {view === "practice" && <PracticeAndCoachingLayer />}
        {view === "advanced" && <AdvancedLayer />}
        {view === "checker" && <StoryAndCriteriaChecker />}
      </div>
    </div>
  );
}
