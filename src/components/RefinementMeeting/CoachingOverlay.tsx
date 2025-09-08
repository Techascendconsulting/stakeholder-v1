import React from 'react';
import { X } from 'lucide-react';
import { CoachingPoint } from '../../services/refinementCoachingService';

interface CoachingOverlayProps {
  coaching: CoachingPoint;
  onClose: () => void;
  isVisible: boolean;
}

export const CoachingOverlay: React.FC<CoachingOverlayProps> = ({
  coaching,
  onClose,
  isVisible
}) => {
  if (!isVisible) return null;

  const getPlacementClasses = (placement: string) => {
    // Always use bottom-right for consistency - no cognitive disturbance
    return 'bottom-20 right-4';
  };

  const getAccentClasses = (accent: string) => {
    switch (accent) {
      case 'primary':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100';
      case 'accent':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100';
      case 'slate':
        return 'border-gray-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100';
      default:
        return 'border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
    }
  };

  return (
    <div className={`fixed z-50 max-w-sm ${getPlacementClasses(coaching.placement)}`}>
      <div className={`
        relative p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm
        ${getAccentClasses(coaching.accent)}
        animate-in slide-in-from-bottom-2 duration-300
      `}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Close coaching"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Coaching content */}
        <div className="pr-6">
          <h4 className="font-semibold text-sm mb-2 leading-tight">
            {coaching.title}
          </h4>
          <p className="text-sm leading-relaxed opacity-90">
            {coaching.body}
          </p>
        </div>

        {/* Coaching indicator */}
        <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-current opacity-60 animate-pulse"></div>
      </div>
    </div>
  );
};

export default CoachingOverlay;

