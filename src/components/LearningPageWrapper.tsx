import React from 'react';

interface LearningPageWrapperProps {
  children: React.ReactNode;
  moduleId?: string;
  moduleTitle?: string;
  assignmentTitle?: string;
  assignmentDescription?: string;
  hideBackButton?: boolean;
}

/**
 * Simple wrapper for learning pages
 * NOTE: Assignments are now handled by LessonView.tsx after ALL lessons in a module are complete
 * This wrapper only passes through the page content without adding assignments
 */
const LearningPageWrapper: React.FC<LearningPageWrapperProps> = ({
  children
}) => {
  return (
    <div>
      {/* Original page content only - NO assignments here */}
      {/* Assignments are handled by LessonView.tsx after ALL lessons in a module are complete */}
      {children}
    </div>
  );
};

export default LearningPageWrapper;

