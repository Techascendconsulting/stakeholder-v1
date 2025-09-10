import { useState } from "react";
import TeachingLayer from "../training/TeachingLayer";
import PracticeAndCoachingLayer from "../training/PracticeAndCoachingLayer";

export default function TrainingUI() {
  const [view, setView] = useState<"teaching" | "practice">("teaching");

  return (
    <div className="w-full h-full px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {view === "teaching" ? "Learn User Stories" : "Practice & Get Feedback"}
        </h1>
        <button
          onClick={() => setView(view === "teaching" ? "practice" : "teaching")}
          className="px-6 py-3 text-sm rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg"
        >
          Switch to {view === "teaching" ? "Practice" : "Teaching"}
        </button>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800 min-h-[500px]">
        {view === "teaching" ? <TeachingLayer /> : <PracticeAndCoachingLayer />}
      </div>
    </div>
  );
}
