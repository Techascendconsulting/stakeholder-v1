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
      // Check localStorage for completed modules
      const completedModulesStr = localStorage.getItem(`completedModules_${userId}`) || localStorage.getItem('completedModules');
      const completedModules = completedModulesStr ? JSON.parse(completedModulesStr) : [];
      
      const TOTAL_MODULES = 11; // As per your curriculum
      const MODULE_TITLES = [
        'Core Learning',
        'Project Initiation',
        'Stakeholder Mapping',
        'Elicitation',
        'Process Mapping',
        'Requirements Engineering',
        'Solution Options',
        'Documentation',
        'Design',
        'MVP Builder',
        'Agile & Scrum'
      ];

      const completedCount = Array.isArray(completedModules) ? completedModules.length : 0;
      const currentModuleIndex = completedCount < TOTAL_MODULES ? completedCount : TOTAL_MODULES - 1;

      return {
        modulesCompleted: completedCount,
        totalModules: TOTAL_MODULES,
        progressPercentage: Math.round((completedCount / TOTAL_MODULES) * 100),
        inProgressModules: 0, // TODO: track in-progress
        currentModuleTitle: completedCount < TOTAL_MODULES ? MODULE_TITLES[currentModuleIndex] : null,
        nextModuleTitle: completedCount < TOTAL_MODULES - 1 ? MODULE_TITLES[currentModuleIndex + 1] : null
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
      // Count meetings from meetings table
      const { data: meetings, error } = await supabase
        .from('meetings')
        .select('meeting_type')
        .eq('user_id', userId);

      if (error || !meetings) {
        return {
          scenariosCompleted: 0,
          totalScenarios: 20, // Arbitrary total
          progressPercentage: 0,
          meetingsCount: 0,
          voiceMeetingsCount: 0,
          transcriptMeetingsCount: 0
        };
      }

      const voiceCount = meetings.filter(m => m.meeting_type === 'voice-only').length;
      const transcriptCount = meetings.filter(m => m.meeting_type === 'transcript').length;
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
    // For new users, prioritize learning if they haven't completed module 1
    if (userType === 'new' && learningProgress.modulesCompleted === 0) {
      return {
        title: 'Start Your BA Learning Journey',
        description: 'Begin with Core Learning to understand BA fundamentals',
        action: 'Start Learning',
        actionView: 'learning-flow',
        priority: 'high',
        icon: 'learning'
      };
    }

    // If user has completed learning but no practice, suggest practice scenarios
    if (learningProgress.modulesCompleted > 0 && practiceProgress.meetingsCount === 0) {
      return {
        title: 'Practice What You Learned',
        description: 'Start with quick practice scenarios before tackling full projects',
        action: 'Start Practice',
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
        description: `You're ${careerProgress.progressPercentage}% through your BA Project Journey`,
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

