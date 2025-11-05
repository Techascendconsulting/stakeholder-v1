import React, { useState, useEffect } from 'react';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { markModuleCompleted } from '../utils/learningProgress';
import { getNextModuleId } from '../views/LearningFlow/learningData';

interface MarkCompleteButtonProps {
  moduleId: string;
  moduleTitle: string;
}

/**
 * Mark as Complete/Incomplete Button
 * 
 * For EXISTING users only - allows manual control of module completion status
 * New users complete modules via assignments only (this button is hidden for them)
 */
const MarkCompleteButton: React.FC<MarkCompleteButtonProps> = ({ moduleId, moduleTitle }) => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user type and completion status
  useEffect(() => {
    const loadStatus = async () => {
      if (!user?.id) return;

      try {
        // Get user type
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setUserType(profile.user_type || 'existing');
        }

        // Get module completion status
        const { data: progress } = await supabase
          .from('learning_progress')
          .select('status')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .single();

        if (progress) {
          setIsCompleted(progress.status === 'completed');
        }
      } catch (error) {
        console.error('Failed to load status:', error);
      }
    };

    loadStatus();
  }, [user?.id, moduleId]);

  const handleToggleComplete = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      if (isCompleted) {
        // Mark as incomplete
        const { error } = await supabase
          .from('learning_progress')
          .update({ status: 'in_progress' })
          .eq('user_id', user.id)
          .eq('module_id', moduleId);

        if (!error) {
          setIsCompleted(false);
        }
      } else {
        // Mark as complete
        const nextModuleId = getNextModuleId(moduleId);
        await markModuleCompleted(user.id, moduleId, nextModuleId);
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only show for existing users
  if (userType === 'new') {
    return null;
  }

  return (
    <div className="flex justify-center mt-6 pt-4">
      <button
        onClick={handleToggleComplete}
        disabled={loading}
        className={`
          group flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
          ${isCompleted
            ? 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-md hover:shadow-lg'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isCompleted ? 'Click to mark as incomplete' : 'Mark this topic as complete'}
      >
        {isCompleted ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Completed</span>
            <RotateCcw className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Mark Complete</span>
          </>
        )}
      </button>
    </div>
  );
};

export default MarkCompleteButton;





