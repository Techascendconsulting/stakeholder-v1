import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { AppView } from '../types';

// Format view name for display
function formatViewName(view: string): string {
  return view
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

const GlobalBreadcrumbs: React.FC = () => {
  const { currentView, setCurrentView } = useApp();
  const [breadcrumbs, setBreadcrumbs] = useState<AppView[]>([]);

  // ✅ On view change, update trail & persist
  useEffect(() => {
    if (!currentView) return;

    setBreadcrumbs((prev) => {
      const last = prev[prev.length - 1];
      
      // Prevent duplicates when same view is visited consecutively
      if (last === currentView) return prev;
      
      // Define root views that should reset the breadcrumb trail
      const rootViews: AppView[] = ['dashboard', 'learning-flow', 'practice-flow', 'project-flow', 'career-journey'];
      
      // If navigating to a root view, start fresh trail
      if (rootViews.includes(currentView)) {
        return [currentView];
      }
      
      // Check if user is going back to a previous view in the trail
      const existingIndex = prev.indexOf(currentView);
      if (existingIndex !== -1) {
        // User clicked a breadcrumb to go back - trim trail to that point
        return prev.slice(0, existingIndex + 1);
      }
      
      // Add new view to trail
      return [...prev, currentView];
    });
  }, [currentView]);

  // ✅ Persist to sessionStorage for refresh
  useEffect(() => {
    if (breadcrumbs.length > 0) {
      sessionStorage.setItem('breadcrumbTrail', JSON.stringify(breadcrumbs));
    }
  }, [breadcrumbs]);

  // ✅ Restore on page reload
  useEffect(() => {
    const saved = sessionStorage.getItem('breadcrumbTrail');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBreadcrumbs(parsed);
        }
      } catch (e) {
        console.error('Failed to restore breadcrumb trail:', e);
      }
    }
  }, []);

  const handleClick = (index: number) => {
    const target = breadcrumbs[index];
    if (target) {
      setCurrentView(target);
      // Trim the trail to this point
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  };

  // Don't show breadcrumbs on certain pages or if only one view
  const hiddenViews: AppView[] = ['login', 'signup', 'welcome'];
  if (hiddenViews.includes(currentView) || breadcrumbs.length <= 1) {
    return null;
  }

  // Collapse breadcrumbs if more than 4 levels
  const shouldCollapse = breadcrumbs.length > 4;
  const displayedBreadcrumbs = shouldCollapse
    ? [breadcrumbs[0], '...', ...breadcrumbs.slice(-2)]
    : breadcrumbs;

  return (
    <nav
      className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 transition-all"
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {displayedBreadcrumbs.map((view, index) => {
          const isEllipsis = view === '...';
          const isLast = index === displayedBreadcrumbs.length - 1;
          const actualIndex = shouldCollapse && index > 1 
            ? breadcrumbs.length - (displayedBreadcrumbs.length - index)
            : index;

          return (
            <li key={isEllipsis ? 'ellipsis' : index} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
              )}
              {isEllipsis ? (
                <span className="text-gray-400 dark:text-gray-600 cursor-default">...</span>
              ) : (
                <button
                  onClick={() => !isLast && handleClick(actualIndex)}
                  disabled={isLast}
                  className={`capitalize transition-colors ${
                    isLast
                      ? 'text-gray-900 dark:text-white font-semibold cursor-default'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {formatViewName(view as string)}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default GlobalBreadcrumbs;

