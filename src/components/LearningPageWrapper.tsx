import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import AssignmentPlaceholder from '../views/LearningFlow/AssignmentPlaceholder';
import MarkCompleteButton from './MarkCompleteButton';
import { getModuleProgress, markModuleCompleted } from '../utils/learningProgress';
import { getNextModuleId } from '../views/LearningFlow/learningData';
import { ArrowLeft } from 'lucide-react';

interface LearningPageWrapperProps {
  children: React.ReactNode;
  moduleId: string;
  moduleTitle: string;
  assignmentTitle: string;
  assignmentDescription: string;
  hideBackButton?: boolean;
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
  assignmentDescription,
  hideBackButton = false
}) => {
  const { user } = useAuth();
  const { setCurrentView } = useApp();
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

  console.log('🎯 LearningPageWrapper rendering:', { moduleId, moduleTitle, hideBackButton, userType });

  return (
    <div>
      {/* Original page content */}
      {children}

      {/* For NEW students: Assignment (required to complete module) */}
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

      {/* For EXISTING students: Manual Mark as Complete button */}
      {userType === 'existing' && (
        <div className="max-w-4xl mx-auto px-6 pb-12">
          <MarkCompleteButton moduleId={moduleId} moduleTitle={moduleTitle} />
          
          {/* Optional assignment section for existing users */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                📝 Optional: Test Your Knowledge
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Want to validate your learning? Submit an assignment for feedback!
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

