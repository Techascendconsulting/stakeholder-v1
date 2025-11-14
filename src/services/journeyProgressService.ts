import { supabase } from '../lib/supabase';
import { CAREER_JOURNEY_PHASES } from '../data/careerJourneyData';

export interface JourneyProgress {
  currentPhaseIndex: number;
  phasesCompleted: number;
  totalPhases: number;
  progressPercentage: number;
  currentPhaseTitle: string;
  nextPhaseTitle: string | null;
}

export interface LearningProgress {
  modulesCompleted: number;
  totalModules: number;
  progressPercentage: number;
  inProgressModules: number;
  currentModuleTitle: string | null;
  nextModuleTitle: string | null;
}

export interface PracticeProgress {
  scenariosCompleted: number;
  totalScenarios: number;
  progressPercentage: number;
  meetingsCount: number;
  voiceMeetingsCount: number;
  transcriptMeetingsCount: number;
}

export interface NextStepGuidance {
  title: string;
  description: string;
  action: string;
  actionView: string;
  priority: 'high' | 'medium' | 'low';
  icon: 'career' | 'learning' | 'practice' | 'project';
}

export class JourneyProgressService {
  /**
   * Get BA Career Journey progress for a user
   */
  static async getCareerJourneyProgress(userId: string): Promise<JourneyProgress> {
    try {
      console.log('🔍 [Career Progress] Starting query for user:', userId);
      
      const { data, error } = await supabase
        .from('career_journey_progress')
        .select('*')
        .eq('user_id', userId);

      console.log('🔍 [Career Progress] Query result:', { 
        hasData: !!data, 
        dataLength: data?.length || 0,
        error: error?.message || null,
        rawData: data 
      });

      if (error) {
        console.error('❌ [Career Progress] Database error:', error);
        // Fallback to default
        return {
          currentPhaseIndex: 0,
          phasesCompleted: 0,
          totalPhases: CAREER_JOURNEY_PHASES.length,
          progressPercentage: 0,
          currentPhaseTitle: CAREER_JOURNEY_PHASES[0].title,
          nextPhaseTitle: CAREER_JOURNEY_PHASES[1]?.title || null
        };
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ [Career Progress] No progress records found for user. Table might be empty or user has no records.');
        // Fallback to default
        return {
          currentPhaseIndex: 0,
          phasesCompleted: 0,
          totalPhases: CAREER_JOURNEY_PHASES.length,
          progressPercentage: 0,
          currentPhaseTitle: CAREER_JOURNEY_PHASES[0].title,
          nextPhaseTitle: CAREER_JOURNEY_PHASES[1]?.title || null
        };
      }

      // Find current phase (first in-progress or not-started)
      const progressMap = new Map(data.map(p => [p.phase_id, p]));
      console.log('🔍 [Career Progress] Progress map created:', {
        totalRecords: data.length,
        phaseIds: Array.from(progressMap.keys()),
        statuses: data.map(p => `${p.phase_id}: ${p.status}`)
      });

      let currentIndex = 0;
      let completedCount = 0;

      for (let i = 0; i < CAREER_JOURNEY_PHASES.length; i++) {
        const phaseProgress = progressMap.get(CAREER_JOURNEY_PHASES[i].id);
        if (phaseProgress?.status === 'completed') {
          completedCount++;
          console.log(`✅ [Career Progress] Phase ${i} (${CAREER_JOURNEY_PHASES[i].id}) is COMPLETED`);
        } else if (!phaseProgress || phaseProgress.status === 'not_started' || phaseProgress.status === 'in_progress') {
          if (currentIndex === 0 || phaseProgress?.status === 'in_progress') {
            currentIndex = i;
            console.log(`📍 [Career Progress] Current phase set to ${i} (${CAREER_JOURNEY_PHASES[i].id}), status: ${phaseProgress?.status || 'no record'}`);
          }
          break;
        }
      }

      const result = {
        currentPhaseIndex: currentIndex,
        phasesCompleted: completedCount,
        totalPhases: CAREER_JOURNEY_PHASES.length,
        progressPercentage: Math.round((completedCount / CAREER_JOURNEY_PHASES.length) * 100),
        currentPhaseTitle: CAREER_JOURNEY_PHASES[currentIndex].title,
        nextPhaseTitle: CAREER_JOURNEY_PHASES[currentIndex + 1]?.title || null
      };

      console.log('🎯 [Career Progress] Final result:', result);
      return result;
    } catch (error) {
      console.error('❌ [Career Progress] Unexpected error:', error);
      return {
        currentPhaseIndex: 0,
        phasesCompleted: 0,
        totalPhases: CAREER_JOURNEY_PHASES.length,
        progressPercentage: 0,
        currentPhaseTitle: CAREER_JOURNEY_PHASES[0].title,
        nextPhaseTitle: CAREER_JOURNEY_PHASES[1]?.title || null
      };
    }
  }

  /**
   * Get Learning Journey progress (from localStorage for now)
   */
  static async getLearningProgress(userId: string): Promise<LearningProgress> {
    try {
      const MODULE_DEFINITIONS = [
        { id: 'module-1-core-learning', title: 'Core Learning' },
        { id: 'module-2-project-initiation', title: 'Project Initiation' },
        { id: 'module-3-stakeholder-mapping', title: 'Stakeholder Mapping' },
        { id: 'module-4-elicitation', title: 'Elicitation' },
        { id: 'module-5-process-mapper', title: 'Process Mapping' },
        { id: 'module-6-requirements-engineering', title: 'Requirements Engineering' },
        { id: 'module-7-solution-options', title: 'Solution Options' },
        { id: 'module-8-documentation', title: 'Documentation' },
        { id: 'module-9-design', title: 'Design' },
        { id: 'module-10-mvp', title: 'MVP Builder' },
        { id: 'module-11-agile-scrum', title: 'Agile & Scrum' }
      ] as const;

      const TOTAL_MODULES = MODULE_DEFINITIONS.length;
      const moduleIndexMap = MODULE_DEFINITIONS.reduce<Record<string, number>>((acc, module, index) => {
        acc[module.id] = index;
        return acc;
      }, {});

      const completedModuleIds = new Set<string>();
      const inProgressModuleIds = new Set<string>();

      // 1) Legacy localStorage completed modules (string array of module IDs)
      const completedModulesStr = localStorage.getItem(`completedModules_${userId}`) || localStorage.getItem('completedModules');
      const completedModules = completedModulesStr ? JSON.parse(completedModulesStr) : [];
      if (Array.isArray(completedModules)) {
        completedModules.forEach((moduleId: unknown) => {
          if (typeof moduleId === 'string') {
            completedModuleIds.add(moduleId);
          }
        });
      }

      // 2) Local Learning Flow progress (tracks lesson-level completion)
      try {
        const progressStateStr = localStorage.getItem('learning_flow_progress');
        if (progressStateStr) {
          const progressState = JSON.parse(progressStateStr);
          const matchesUser = !progressState?.userId || progressState.userId === userId;
          if (matchesUser && progressState?.modules) {
            const moduleStates = Object.values(progressState.modules) as Array<any>;
            moduleStates.forEach((module: any) => {
              const moduleId = typeof module?.moduleId === 'string' ? module.moduleId : undefined;
              if (!moduleId) return;

              const lessonsCompleted = Array.isArray(module?.completedLessons) ? module.completedLessons.length : 0;
              const status = module?.status;
              const assignmentDone = Boolean(module?.assignmentCompleted);

              if (status === 'completed' || assignmentDone) {
                completedModuleIds.add(moduleId);
                inProgressModuleIds.delete(moduleId);
                return;
              }

              if (lessonsCompleted > 0 || status === 'in_progress') {
                inProgressModuleIds.add(moduleId);
              }
            });
          }
        }
      } catch (progressError) {
        console.warn('⚠️ Unable to parse learning flow progress:', progressError);
      }

      // 3) Supabase authoritative progress (learning_progress table)
      try {
        const { data: learningRows, error: learningError } = await supabase
          .from('learning_progress')
          .select('module_id, status, completed_lessons, assignment_completed')
          .eq('user_id', userId);

        if (learningError) {
          const errorCode = (learningError as any)?.code;
          if (errorCode === '42P01' || learningError.message?.includes('404')) {
            console.warn('⚠️ learning_progress table not found - skipping Supabase sync (non-blocking)');
          } else {
            console.error('❌ Error fetching learning progress from Supabase:', learningError);
          }
        } else if (Array.isArray(learningRows)) {
          learningRows.forEach((row) => {
            const moduleId = typeof row?.module_id === 'string' ? row.module_id : undefined;
            if (!moduleId) return;

            const status = row?.status;
            const lessonsCompleted = Array.isArray(row?.completed_lessons) ? row.completed_lessons.length : 0;
            const assignmentDone = Boolean(row?.assignment_completed);

            if (status === 'completed' || assignmentDone) {
              completedModuleIds.add(moduleId);
              inProgressModuleIds.delete(moduleId);
              return;
            }

            if (status === 'in_progress' || lessonsCompleted > 0) {
              if (!completedModuleIds.has(moduleId)) {
                inProgressModuleIds.add(moduleId);
              }
            }
          });
        }
      } catch (supabaseError) {
        console.error('❌ Unexpected error syncing learning progress from Supabase:', supabaseError);
      }

      // Final counts derived from combined data sources
      const recognizedCompletedIds = Array.from(completedModuleIds).filter((id) => moduleIndexMap[id] !== undefined);
      const recognizedInProgressIds = Array.from(inProgressModuleIds).filter((id) => moduleIndexMap[id] !== undefined && !completedModuleIds.has(id));

      const completedCount = Math.min(TOTAL_MODULES, recognizedCompletedIds.length || completedModuleIds.size);
      const inProgressCount = Math.min(
        TOTAL_MODULES - completedCount,
        Math.max(0, recognizedInProgressIds.length || inProgressModuleIds.size)
      );

      const currentModuleIndex = completedCount < TOTAL_MODULES ? completedCount : TOTAL_MODULES - 1;

      return {
        modulesCompleted: completedCount,
        totalModules: TOTAL_MODULES,
        progressPercentage: Math.round((completedCount / TOTAL_MODULES) * 100),
        inProgressModules: inProgressCount,
        currentModuleTitle: completedCount < TOTAL_MODULES ? MODULE_DEFINITIONS[currentModuleIndex]?.title || null : null,
        nextModuleTitle: completedCount < TOTAL_MODULES - 1 ? MODULE_DEFINITIONS[currentModuleIndex + 1]?.title || null : null
      };
    } catch (error) {
      console.error('Error fetching learning progress:', error);
      return {
        modulesCompleted: 0,
        totalModules: 11,
        progressPercentage: 0,
        inProgressModules: 0,
        currentModuleTitle: 'Core Learning',
        nextModuleTitle: 'Project Initiation'
      };
    }
  }

  /**
   * Get Practice Journey progress
   */
  static async getPracticeProgress(userId: string): Promise<PracticeProgress> {
    try {
      // Count meetings from user_meetings table
      // Try to get meeting_type, but handle gracefully if column doesn't exist
      const { data: meetings, error } = await supabase
        .from('user_meetings')
        .select('id, meeting_type')
        .eq('user_id', userId);

      if (error) {
        // If error is due to missing column, just count all meetings
        const errorCode = (error as any)?.code;
        if (errorCode === '42703' || error.message?.includes('column') || error.message?.includes('meeting_type')) {
          // Column doesn't exist, just count total meetings
          const { count } = await supabase
            .from('user_meetings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
          
          return {
            scenariosCompleted: count || 0,
            totalScenarios: 20,
            progressPercentage: Math.min(Math.round(((count || 0) / 20) * 100), 100),
            meetingsCount: count || 0,
            voiceMeetingsCount: 0,
            transcriptMeetingsCount: count || 0
          };
        }
        
        return {
          scenariosCompleted: 0,
          totalScenarios: 20,
          progressPercentage: 0,
          meetingsCount: 0,
          voiceMeetingsCount: 0,
          transcriptMeetingsCount: 0
        };
      }

      if (!meetings || meetings.length === 0) {
        return {
          scenariosCompleted: 0,
          totalScenarios: 20,
          progressPercentage: 0,
          meetingsCount: 0,
          voiceMeetingsCount: 0,
          transcriptMeetingsCount: 0
        };
      }

      // Handle both old schema (individual/group) and new schema (voice-only/transcript)
      const voiceCount = meetings.filter(m => 
        m.meeting_type === 'voice-only' || m.meeting_type === 'individual'
      ).length;
      const transcriptCount = meetings.filter(m => 
        m.meeting_type === 'transcript' || m.meeting_type === 'group' || !m.meeting_type
      ).length;
      const totalMeetings = meetings.length;

      return {
        scenariosCompleted: totalMeetings,
        totalScenarios: 20,
        progressPercentage: Math.min(Math.round((totalMeetings / 20) * 100), 100),
        meetingsCount: totalMeetings,
        voiceMeetingsCount: voiceCount,
        transcriptMeetingsCount: transcriptCount
      };
    } catch (error) {
      console.error('Error fetching practice progress:', error);
      return {
        scenariosCompleted: 0,
        totalScenarios: 20,
        progressPercentage: 0,
        meetingsCount: 0,
        voiceMeetingsCount: 0,
        transcriptMeetingsCount: 0
      };
    }
  }

  /**
   * Calculate next recommended step for the user
   */
  static async getNextStepGuidance(
    userId: string, 
    userType: 'new' | 'existing' | 'admin',
    careerProgress: JourneyProgress,
    learningProgress: LearningProgress,
    practiceProgress: PracticeProgress
  ): Promise<NextStepGuidance> {
    // For users who haven't completed all learning modules
    if (learningProgress.progressPercentage < 100) {
      const hasStarted = learningProgress.modulesCompleted > 0 || learningProgress.inProgressModules > 0;
      return {
        title: hasStarted ? 'Continue Your BA Learning Journey' : 'Start Your BA Learning Journey',
        description: hasStarted ? 'Keep building your BA fundamentals' : 'Begin with Core Learning to understand BA fundamentals',
        action: hasStarted ? 'Continue Learning' : 'Start Learning',
        actionView: 'learning-flow',
        priority: 'high',
        icon: 'learning'
      };
    }

    // If user has completed learning but no practice, suggest practice scenarios
    if (learningProgress.modulesCompleted > 0 && practiceProgress.meetingsCount === 0) {
      const hasStartedPractice = practiceProgress.scenariosCompleted > 0;
      return {
        title: hasStartedPractice ? 'Continue Practicing' : 'Practice What You Learned',
        description: hasStartedPractice ? 'Keep practicing with more scenarios' : 'Start with quick practice scenarios before tackling full projects',
        action: hasStartedPractice ? 'Continue Practice' : 'Start Practice',
        actionView: 'practice-flow',
        priority: 'high',
        icon: 'practice'
      };
    }

    // If user has practiced but hasn't started career journey, suggest that
    if (practiceProgress.meetingsCount > 0 && careerProgress.progressPercentage === 0) {
      return {
        title: 'Ready for the Full BA Journey',
        description: 'You\'ve practiced - now apply it to the complete BA project lifecycle',
        action: 'Start BA Journey',
        actionView: 'career-journey',
        priority: 'high',
        icon: 'career'
      };
    }

    // If user is progressing in career journey, continue there
    if (careerProgress.progressPercentage > 0 && careerProgress.progressPercentage < 100) {
      return {
        title: `Continue: ${careerProgress.currentPhaseTitle}`,
        description: `You're ${careerProgress.progressPercentage}% through your Project Lifecycle`,
        action: 'Continue Journey',
        actionView: 'career-journey',
        priority: 'high',
        icon: 'career'
      };
    }

    // If learning is in progress, continue learning
    if (learningProgress.modulesCompleted > 0 && learningProgress.modulesCompleted < learningProgress.totalModules) {
      return {
        title: 'Continue Learning',
        description: `${learningProgress.modulesCompleted}/${learningProgress.totalModules} modules completed`,
        action: 'Continue Learning',
        actionView: 'learning-flow',
        priority: 'medium',
        icon: 'learning'
      };
    }

    // If user has completed everything but wants hands-on projects
    if (careerProgress.progressPercentage === 100 && learningProgress.progressPercentage === 100) {
      return {
        title: 'Build Your Own Project',
        description: 'Apply all your skills to a custom hands-on BA project',
        action: 'Start Project',
        actionView: 'project-flow',
        priority: 'medium',
        icon: 'project'
      };
    }

    // Default: more practice
    return {
      title: 'Keep Practicing',
      description: 'More practice scenarios help reinforce your BA skills',
      action: 'Practice More',
      actionView: 'practice-flow',
      priority: 'medium',
      icon: 'practice'
    };
  }

  /**
   * Get user type from user_profiles
   */
  static async getUserType(userId: string): Promise<'new' | 'existing' | 'admin'> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return 'existing'; // Default to existing for safety
      }

      return data.user_type || 'existing';
    } catch (error) {
      console.error('Error fetching user type:', error);
      return 'existing';
    }
  }
}

