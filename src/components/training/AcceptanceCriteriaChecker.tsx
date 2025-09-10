import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface ACCheck {
  id: string;
  label: string;
  hint: string;
}

const acChecks: ACCheck[] = [
  {
    id: "trigger-when",
    label: "Trigger (When does this happen?)",
    hint: "Mention what event, screen, or action triggers the feature. E.g., 'After clicking Submit...'"
  },
  {
    id: "rules-constraints",
    label: "Rules & Constraints",
    hint: "Think of file types, required fields, time limits, or business rules. E.g., 'Only JPG, PNG, or JPEG files are allowed.'"
  },
  {
    id: "feedback-success",
    label: "Success Feedback",
    hint: "Think of confirmation messages, visual feedback, changes on screen, or what happens next."
  },
  {
    id: "error-handling",
    label: "Error Handling",
    hint: "Describe failure scenarios (e.g., large file, invalid input) and how the system responds (error messages, etc)."
  },
  {
    id: "performance-limits",
    label: "Performance & Limits",
    hint: "Mention timeouts, loading time, file size limits, mobile constraints, etc."
  },
  {
    id: "proof-confirmation",
    label: "Proof & Confirmation",
    hint: "E.g., 'The email includes the document name, user reference, and date submitted.' Helpful for audit trails or confirmations."
  },
  {
    id: "story-size",
    label: "Story Size Check",
    hint: "Split stories with unrelated outcomes (e.g., email + payment + SMS) into separate ones. Each AC set should support one clear user goal."
  }
];

export default function AcceptanceCriteriaChecker() {
  const [input, setInput] = useState("");
  const [showHints, setShowHints] = useState(false);

  const isPassing = (id: string) => {
    return input.toLowerCase().includes(id.split("-")[0]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Acceptance Criteria Quality Checker</h2>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or write your acceptance criteria here..."
          className="w-full min-h-[120px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {acChecks.map((check) => (
            <div
              key={check.id}
              className={`border rounded-xl p-4 flex items-start gap-3 ${
                isPassing(check.id)
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-red-400 bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <div className="pt-1">
                {isPassing(check.id) ? (
                  <Check className="text-green-600 w-5 h-5" />
                ) : (
                  <X className="text-red-500 w-5 h-5" />
                )}
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900 dark:text-white">{check.label}</div>
                {showHints && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {check.hint}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowHints((prev) => !prev)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium text-sm"
        >
          {showHints ? "Hide Coaching Tips" : "Show Coaching Tips"}
        </button>
      </div>
    </div>
  );
}
