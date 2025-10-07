import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Lock, Clock, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getModuleById, getNextModuleId } from './learningData';
import { 
  getModuleProgress, 
  markLessonCompleted, 
  markModuleCompleted,
  isLessonAccessible,
  isAssignmentAccessible,
  LearningProgressRow 
} from '../../utils/learningProgress';
import AssignmentPlaceholder from './AssignmentPlaceholder';
import ReactMarkdown from 'react-markdown';

interface LessonViewProps {
  moduleId: string;
  onBack: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ moduleId, onBack }) => {
  const { user } = useAuth();
  const [moduleProgress, setModuleProgress] = useState<LearningProgressRow | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showAssignment, setShowAssignment] = useState(false);
  const [loading, setLoading] = useState(true);

  const module = getModuleById(moduleId);

  useEffect(() => {
    if (!user) return;
    
    const loadProgress = async () => {
      try {
        const progress = await getModuleProgress(user.id, moduleId);
        setModuleProgress(progress);
      } catch (error) {
        console.error('Failed to load module progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user, moduleId]);

  if (!module || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const currentLesson = module.lessons[currentLessonIndex];
  const isLessonCompleted = moduleProgress?.completed_lessons.includes(currentLesson?.id);
  const isLastLesson = currentLessonIndex === module.lessons.length - 1;
  const canAccessAssignmentNow = isAssignmentAccessible(moduleProgress, module.lessons.length);
  const isAssignmentCompleted = moduleProgress?.assignment_completed;

  const handleMarkComplete = async () => {
    if (!user || !currentLesson) return;

    try {
      await markLessonCompleted(user.id, moduleId, currentLesson.id);
      // Reload progress
      const updated = await getModuleProgress(user.id, moduleId);
      setModuleProgress(updated);
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  };

  const handleNext = () => {
    if (showAssignment) {
      // After assignment, go back to module list
      onBack();
    } else if (isLastLesson) {
      // Last lesson completed, show assignment
      setShowAssignment(true);
    } else {
      // Move to next lesson
      setCurrentLessonIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (showAssignment) {
      setShowAssignment(false);
    } else if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
  };

  const handleCompleteAssignment = async () => {
    if (!user) return;

    try {
      const nextModuleId = getNextModuleId(moduleId);
      await markModuleCompleted(user.id, moduleId, nextModuleId);
      // Reload progress
      const updated = await getModuleProgress(user.id, moduleId);
      setModuleProgress(updated);
    } catch (error) {
      console.error('Failed to complete assignment:', error);
    }
  };

  const canAccessLesson = isLessonAccessible(
    moduleProgress,
    currentLessonIndex,
    module.lessons
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Modules</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {showAssignment ? (
                  <span>Assignment</span>
                ) : (
                  <span>Lesson {currentLessonIndex + 1} of {module.lessons.length}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {showAssignment ? (
          // Assignment View
          <AssignmentPlaceholder
            moduleId={moduleId}
            moduleTitle={module.title}
            title={module.assignmentTitle}
            description={module.assignmentDescription}
            isCompleted={isAssignmentCompleted}
            onComplete={handleCompleteAssignment}
            canAccess={canAccessAssignmentNow}
          />
        ) : !canAccessLesson ? (
          // Locked Lesson
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border-2 border-gray-200 dark:border-gray-700">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Lesson Locked
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete the previous lesson to unlock this one.
            </p>
            <button
              onClick={handlePrevious}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Previous Lesson
            </button>
          </div>
        ) : (
          // Lesson Content
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Lesson Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-purple-100">
                    {module.title}
                  </p>
                  <h1 className="text-2xl font-bold">
                    {currentLesson.title}
                  </h1>
                </div>
              </div>
              {currentLesson.duration && (
                <div className="flex items-center space-x-2 text-sm text-purple-100">
                  <Clock className="w-4 h-4" />
                  <span>{currentLesson.duration}</span>
                </div>
              )}
            </div>

            {/* Lesson Content */}
            <div className="p-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
              </div>
            </div>

            {/* Lesson Footer */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentLessonIndex === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-3">
                  {!isLessonCompleted && (
                    <button
                      onClick={handleMarkComplete}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Complete</span>
                    </button>
                  )}
                  
                  {isLessonCompleted && (
                    <button
                      onClick={handleNext}
                      className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      <span>{isLastLesson ? 'Go to Assignment' : 'Next Lesson'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Dots */}
        {!showAssignment && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            {module.lessons.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const canAccess = isLessonAccessible(moduleProgress, index, module.lessons);
                  if (canAccess) {
                    setCurrentLessonIndex(index);
                  }
                }}
                className={`
                  w-3 h-3 rounded-full transition-all
                  ${index === currentLessonIndex 
                    ? 'bg-purple-600 w-8' 
                    : moduleProgress?.completed_lessons.includes(module.lessons[index].id)
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
                title={`Lesson ${index + 1}: ${module.lessons[index].title}`}
              />
            ))}
            {/* Assignment dot */}
            <button
              onClick={() => canAccessAssignmentNow && setShowAssignment(true)}
              className={`
                w-3 h-3 rounded-full transition-all
                ${showAssignment 
                  ? 'bg-purple-600 w-8' 
                  : isAssignmentCompleted
                    ? 'bg-green-500'
                    : canAccessAssignmentNow
                      ? 'bg-orange-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
              title="Assignment"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonView;

