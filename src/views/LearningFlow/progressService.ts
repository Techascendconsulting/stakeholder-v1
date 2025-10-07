/**
 * Progress Service
 * 
 * Manages learner progress through modules and lessons
 * Uses localStorage for Phase 1 (will migrate to Supabase in Phase 2)
 */

const PROGRESS_KEY = 'learning_flow_progress';

export interface ModuleProgress {
  moduleId: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  completedLessons: string[];
  assignmentCompleted: boolean;
  lastAccessed?: string;
}

export interface LearningProgress {
  userId: string;
  modules: Record<string, ModuleProgress>;
  lastUpdated: string;
}

export class ProgressService {
  /**
   * Initialize progress for a new user
   * First module is unlocked, rest are locked
   */
  static initialize(userId: string, moduleIds: string[]): LearningProgress {
    const modules: Record<string, ModuleProgress> = {};
    
    moduleIds.forEach((id, index) => {
      modules[id] = {
        moduleId: id,
        status: index === 0 ? 'unlocked' : 'locked',
        completedLessons: [],
        assignmentCompleted: false
      };
    });

    const progress: LearningProgress = {
      userId,
      modules,
      lastUpdated: new Date().toISOString()
    };

    this.save(progress);
    return progress;
  }

  /**
   * Load progress from localStorage
   */
  static load(userId: string): LearningProgress | null {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY);
      if (stored) {
        const progress = JSON.parse(stored);
        if (progress.userId === userId) {
          return progress;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return null;
    }
  }

  /**
   * Save progress to localStorage
   */
  static save(progress: LearningProgress): void {
    try {
      progress.lastUpdated = new Date().toISOString();
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      console.log('✅ Progress saved');
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
    }
  }

  /**
   * Mark a lesson as complete
   */
  static completeLesson(
    progress: LearningProgress,
    moduleId: string,
    lessonId: string
  ): LearningProgress {
    const module = progress.modules[moduleId];
    if (!module) return progress;

    // Add lesson to completed list if not already there
    if (!module.completedLessons.includes(lessonId)) {
      module.completedLessons.push(lessonId);
    }

    // Update module status to in_progress
    if (module.status === 'unlocked') {
      module.status = 'in_progress';
    }

    module.lastAccessed = new Date().toISOString();
    this.save(progress);
    return progress;
  }

  /**
   * Mark assignment as complete and unlock next module
   */
  static completeAssignment(
    progress: LearningProgress,
    moduleId: string,
    nextModuleId?: string
  ): LearningProgress {
    const module = progress.modules[moduleId];
    if (!module) return progress;

    // Mark assignment complete
    module.assignmentCompleted = true;
    module.status = 'completed';

    // Unlock next module
    if (nextModuleId && progress.modules[nextModuleId]) {
      progress.modules[nextModuleId].status = 'unlocked';
      console.log(`✅ Module ${moduleId} completed. Unlocked ${nextModuleId}`);
    }

    this.save(progress);
    return progress;
  }

  /**
   * Check if a lesson is accessible
   */
  static isLessonAccessible(
    progress: LearningProgress,
    moduleId: string,
    lessonId: string,
    lessonIndex: number,
    lessons: any[]
  ): boolean {
    const module = progress.modules[moduleId];
    if (!module || module.status === 'locked') return false;

    // First lesson is always accessible if module is unlocked
    if (lessonIndex === 0) return true;

    // Other lessons require previous lesson to be completed
    const previousLessonId = lessons[lessonIndex - 1]?.id;
    return module.completedLessons.includes(previousLessonId);
  }

  /**
   * Check if assignment is accessible
   */
  static isAssignmentAccessible(
    progress: LearningProgress,
    moduleId: string,
    totalLessons: number
  ): boolean {
    const module = progress.modules[moduleId];
    if (!module || module.status === 'locked') return false;

    // Assignment is accessible when all lessons are complete
    return module.completedLessons.length >= totalLessons;
  }

  /**
   * Get module completion percentage
   */
  static getModuleCompletion(
    progress: LearningProgress,
    moduleId: string,
    totalLessons: number
  ): number {
    const module = progress.modules[moduleId];
    if (!module) return 0;

    const lessonsCompleted = module.completedLessons.length;
    const assignmentWeight = module.assignmentCompleted ? 1 : 0;
    const total = totalLessons + 1; // lessons + assignment

    return Math.round(((lessonsCompleted + assignmentWeight) / total) * 100);
  }

  /**
   * Reset all progress (for testing)
   */
  static reset(): void {
    localStorage.removeItem(PROGRESS_KEY);
    console.log('🔄 Progress reset');
  }
}

export default ProgressService;

