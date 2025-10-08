import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AssignmentPlaceholder from '../views/LearningFlow/AssignmentPlaceholder';
import { getModuleProgress, markModuleCompleted } from '../utils/learningProgress';
import { getNextModuleId } from '../views/LearningFlow/learningData';

interface LearningPageWrapperProps {
  children: React.ReactNode;
  moduleId: string;
  moduleTitle: string;
  assignmentTitle: string;
  assignmentDescription: string;
}

/**
 * Wraps existing learning pages to add assignment tracking for 'new' students
 * Existing students see the page as-is, new students see it with assignment at the bottom
 */
const LearningPageWrapper: React.FC<LearningPageWrapperProps> = ({
  children,
  moduleId,
  moduleTitle,
  assignmentTitle,
  assignmentDescription
}) => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [moduleProgress, setModuleProgress] = useState<any>(null);

  useEffect(() => {
    const loadUserType = async () => {
      if (!user?.id) return;

      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setUserType(data.user_type || 'existing');
        }
      } catch (error) {
        console.error('Failed to load user type:', error);
      }
    };

    const loadProgress = async () => {
      if (!user?.id) return;
      const progress = await getModuleProgress(user.id, moduleId);
      setModuleProgress(progress);
    };

    loadUserType();
    loadProgress();
  }, [user?.id, moduleId]);

  const handleCompleteAssignment = async () => {
    if (!user) return;

    try {
      const nextModuleId = getNextModuleId(moduleId);
      await markModuleCompleted(user.id, moduleId, nextModuleId);
      const updated = await getModuleProgress(user.id, moduleId);
      setModuleProgress(updated);
    } catch (error) {
      console.error('Failed to complete assignment:', error);
    }
  };

  return (
    <div>
      {/* Original page content */}
      {children}

      {/* Assignment section - ONLY for new students */}
      {userType === 'new' && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <AssignmentPlaceholder
            moduleId={moduleId}
            moduleTitle={moduleTitle}
            title={assignmentTitle}
            description={assignmentDescription}
            isCompleted={moduleProgress?.assignment_completed || false}
            canAccess={true} // They accessed the page, so they can do the assignment
            onComplete={handleCompleteAssignment}
          />
        </div>
      )}
    </div>
  );
};

export default LearningPageWrapper;

