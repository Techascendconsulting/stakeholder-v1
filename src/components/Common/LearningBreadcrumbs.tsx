import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface LearningBreadcrumbsProps {
  currentModule: string;
  className?: string;
}

export const LearningBreadcrumbs: React.FC<LearningBreadcrumbsProps> = ({ 
  currentModule, 
  className = '' 
}) => {
  const { setCurrentView } = useApp();
  const [referrer, setReferrer] = useState<'learning-flow' | 'career-journey'>('learning-flow');

  useEffect(() => {
    // Detect where user came from
    const lastView = localStorage.getItem('previousView');
    if (lastView === 'career-journey') {
      setReferrer('career-journey');
    } else {
      setReferrer('learning-flow');
    }
  }, []);

  return (
    <div className={className}>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs opacity-80 mb-2">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="hover:opacity-100 transition-opacity"
        >
          Dashboard
        </button>
        <span>›</span>
        {referrer === 'career-journey' && (
          <>
            <button
              onClick={() => setCurrentView('career-journey')}
              className="hover:opacity-100 transition-opacity"
            >
              Project Journey
            </button>
            <span>›</span>
          </>
        )}
        <button
          onClick={() => setCurrentView('learning-flow')}
          className="hover:opacity-100 transition-opacity"
        >
          Learning Journey
        </button>
        <span>›</span>
        <span className="opacity-100 font-medium">{currentModule}</span>
      </div>
      
      {/* Smart Back Button */}
      <button
        onClick={() => setCurrentView(referrer)}
        className="inline-flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">
                {referrer === 'career-journey' ? 'Back to Project Journey' : 'Back to Learning Journey'}
              </span>
      </button>
    </div>
  );
};

export default LearningBreadcrumbs;

