/**
 * Step Renderer Component
 * 
 * Renders different step types with appropriate UI.
 * Content is currently placeholder - will be enhanced with real content later.
 */

import React, { useState } from 'react';
import { Step } from '../types/models';
import { CheckCircle2, FileText, Video, Image, Headphones, CheckSquare, MessageCircle, Clipboard } from 'lucide-react';

interface StepRendererProps {
  step: Step;
  isCompleted: boolean;
  onComplete: () => void;
}

export const StepRenderer: React.FC<StepRendererProps> = ({ step, isCompleted, onComplete }) => {
  const [checklistItems, setChecklistItems] = useState<boolean[]>([false, false, false]);

  const handleChecklistChange = (index: number) => {
    const newItems = [...checklistItems];
    newItems[index] = !newItems[index];
    setChecklistItems(newItems);
  };

  const allChecked = checklistItems.every(item => item);

  // Render different step types
  switch (step.stepType) {
    case 'text':
      return (
        <div>
          {/* Icon and title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Placeholder text content. This will be replaced with actual content from the step payload.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Content can include multiple paragraphs, bullet points, and formatting to provide clear information to the learner.
            </p>
          </div>

          {/* Completion hint */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <span className="font-semibold">What to notice:</span> Key points and takeaways will be highlighted here to guide the learner's attention.
            </p>
          </div>

          {/* Completion checkbox */}
          {!isCompleted && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                onChange={onComplete}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">I've read this</span>
            </label>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Completed</span>
            </div>
          )}
        </div>
      );

    case 'video':
      return (
        <div>
          {/* Icon and title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h2>
            </div>
          </div>

          {/* Video player placeholder */}
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-6 flex items-center justify-center shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mb-4 mx-auto">
                <Video className="w-10 h-10 text-white" />
              </div>
              <p className="text-white/70 text-sm">Video placeholder</p>
              <p className="text-white/50 text-xs mt-1">HeyGen video will appear here</p>
            </div>
          </div>

          {/* Context hint */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-900 dark:text-purple-200 mb-2">
              <span className="font-semibold">Listen for:</span>
            </p>
            <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1 ml-4">
              <li>• Key points from the speaker</li>
              <li>• Important context about the project</li>
              <li>• Your next steps</li>
            </ul>
          </div>

          {/* Completion checkbox */}
          {!isCompleted && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                onChange={onComplete}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700 dark:text-gray-300">I've watched this video</span>
            </label>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Completed</span>
            </div>
          )}
        </div>
      );

    case 'checklist':
      return (
        <div>
          {/* Icon and title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h2>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Review the items below and check them off as you complete each one.
          </p>

          {/* Checklist items */}
          <div className="space-y-4 mb-8">
            {checklistItems.map((checked, index) => (
              <label
                key={index}
                className={`
                  flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${checked
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleChecklistChange(index)}
                  className="w-6 h-6 text-green-600 rounded focus:ring-green-500 mt-0.5"
                />
                <span className={`flex-1 ${checked ? 'text-green-900 dark:text-green-200' : 'text-gray-700 dark:text-gray-300'}`}>
                  Checklist item {index + 1} (placeholder content)
                </span>
              </label>
            ))}
          </div>

          {/* Hint */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-900 dark:text-green-200">
              <span className="font-semibold">Tip:</span> Complete all items above before continuing.
            </p>
          </div>

          {/* Mark complete button */}
          {!isCompleted && (
            <button
              onClick={onComplete}
              disabled={!allChecked}
              className={`
                w-full px-6 py-3 rounded-lg font-medium transition-all
                ${allChecked
                  ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {allChecked ? 'Mark as complete' : 'Complete all items first'}
            </button>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">All items completed</span>
            </div>
          )}
        </div>
      );

    case 'task':
      return (
        <div>
          {/* Icon and title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Clipboard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h2>
            </div>
          </div>

          {/* Task description */}
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Complete the task below. This will integrate with the existing Tasks engine later.
          </p>

          {/* Task input area - placeholder */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your response:
            </label>
            <textarea
              className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Type your response here..."
            />
          </div>

          {/* Tip */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-900 dark:text-orange-200">
              <span className="font-semibold">Tip:</span> Take your time and think through your response carefully.
            </p>
          </div>

          {/* Save button */}
          {!isCompleted && (
            <button
              onClick={onComplete}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 hover:shadow-lg transition-all"
            >
              Save and continue
            </button>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Task completed</span>
            </div>
          )}
        </div>
      );

    case 'reflection':
      return (
        <div>
          {/* Icon and title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h2>
            </div>
          </div>

          {/* Reflection prompt */}
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Take a moment to reflect on what you've learned. There are no wrong answers.
          </p>

          {/* Reflection area - placeholder */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <textarea
              className="w-full h-40 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Your reflections..."
            />
          </div>

          {/* Continue button */}
          {!isCompleted && (
            <button
              onClick={onComplete}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 hover:shadow-lg transition-all"
            >
              Save and continue
            </button>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Reflection saved</span>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {step.title}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Placeholder content for step type: {step.stepType}
          </p>
          
          {!isCompleted && (
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              Mark as complete
            </button>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Completed</span>
            </div>
          )}
        </div>
      );
  }
};

export default StepRenderer;



