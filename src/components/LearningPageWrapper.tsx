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

        console.log('📄 LearningPageWrapper - User type:', data?.user_type, 'for module:', moduleId);

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

      {/* Assignment section - ONLY for new students, appears at the very bottom after all content */}
      {userType === 'new' && (
        <div className="border-t-4 border-purple-200 dark:border-purple-800 mt-12">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                📝 Module Assignment
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Complete this assignment to unlock the next module
              </p>
            </div>
            <AssignmentPlaceholder
              moduleId={moduleId}
              moduleTitle={moduleTitle}
              title={assignmentTitle}
              description={assignmentDescription}
              isCompleted={moduleProgress?.assignment_completed || false}
              canAccess={true}
              onComplete={handleCompleteAssignment}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPageWrapper;

