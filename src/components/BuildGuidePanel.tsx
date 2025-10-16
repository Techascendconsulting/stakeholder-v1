import React from 'react';
import { X, Play, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';

interface BuildGuidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  guide: string[];
  lanes: string[];
  onRegenerate: () => void;
  onApplyStep: (stepIndex: number) => void;
  onHighlightElement: (elementId: string) => void;
  isLoading: boolean;
}

const BuildGuidePanel: React.FC<BuildGuidePanelProps> = ({
  isOpen,
  onClose,
  guide,
  lanes,
  onRegenerate,
  onApplyStep,
  onHighlightElement,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Build Guide
        </h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto h-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Generating guide...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Lanes Section */}
            {lanes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                  Process Actors ({lanes.length})
                </h3>
                <div className="space-y-2">
                  {lanes.map((lane, index) => (
                    <div
                      key={index}
                      className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <span className="text-sm font-medium text-blue-900">
                        {lane}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guide Steps */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Play className="w-4 h-4 text-green-500" />
                  Build Steps ({guide.length})
                </h3>
                <button
                  onClick={onRegenerate}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Regenerate guide"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {guide.map((step, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onApplyStep(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{step}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Extract element ID from step if possible
                          const elementMatch = step.match(/element[:\s]+([^\s]+)/i);
                          if (elementMatch) {
                            onHighlightElement(elementMatch[1]);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Highlight element"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                How to use this guide:
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Click any step to apply it to your diagram</li>
                <li>• Use the arrow button to highlight elements</li>
                <li>• Click the refresh button to regenerate the guide</li>
                <li>• Follow the steps in order for best results</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildGuidePanel;



















