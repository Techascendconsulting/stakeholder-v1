import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getBreadcrumbs, getParentView } from '../../utils/breadcrumbMapping';
import { AppView } from '../../types';

interface UniversalBreadcrumbsProps {
  currentView: AppView;
  currentLabel?: string; // Override label if needed
  className?: string;
  showBackButton?: boolean; // Default true
  textColorClass?: string; // e.g., "text-purple-100" for colored headers
}

export const UniversalBreadcrumbs: React.FC<UniversalBreadcrumbsProps> = ({ 
  currentView,
  currentLabel,
  className = '',
  showBackButton = true,
  textColorClass = 'text-gray-600 dark:text-gray-400'
}) => {
  const { setCurrentView } = useApp();
  const [previousView, setPreviousView] = useState<string | null>(null);

  useEffect(() => {
    // Detect where user came from
    const lastView = localStorage.getItem('previousView');
    setPreviousView(lastView);
  }, []);

  // Get breadcrumbs with context awareness
  const breadcrumbs = getBreadcrumbs(currentView, previousView || undefined);
  
  // Override last breadcrumb label if provided
  if (currentLabel && breadcrumbs.length > 0) {
    breadcrumbs[breadcrumbs.length - 1].label = currentLabel;
  }

  // Determine smart back destination
  const backView = previousView && 
                   (previousView === 'career-journey' || previousView === 'learning-flow' || previousView === 'practice-flow' || previousView === 'project-flow')
                   ? previousView
                   : getParentView(currentView);

  return (
    <div className={className}>
      {/* Breadcrumb Trail */}
      <div className={`flex items-center space-x-2 text-xs ${textColorClass} opacity-80 mb-2 flex-wrap`}>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index < breadcrumbs.length - 1 ? (
              <>
                <button
                  onClick={() => setCurrentView(crumb.view)}
                  className="hover:opacity-100 transition-opacity"
                >
                  {crumb.label}
                </button>
                <ChevronRight className="w-3 h-3" />
              </>
            ) : (
              <span className="opacity-100 font-semibold">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Smart Back Button */}
      {showBackButton && backView && (
        <button
          onClick={() => setCurrentView(backView as AppView)}
          className={`inline-flex items-center space-x-2 ${textColorClass} opacity-80 hover:opacity-100 transition-opacity`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">
            Back to {breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2].label : 'Dashboard'}
          </span>
        </button>
      )}
    </div>
  );
};

export default UniversalBreadcrumbs;


