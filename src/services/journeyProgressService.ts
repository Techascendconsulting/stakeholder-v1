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
      const { data, error } = await supabase
        .from('career_journey_progress')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) {
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
      let currentIndex = 0;
      let completedCount = 0;

      for (let i = 0; i < CAREER_JOURNEY_PHASES.length; i++) {
        const phaseProgress = progressMap.get(CAREER_JOURNEY_PHASES[i].id);
        if (phaseProgress?.status === 'completed') {
          completedCount++;
        } else if (!phaseProgress || phaseProgress.status === 'not_started' || phaseProgress.status === 'in_progress') {
          if (currentIndex === 0 || phaseProgress?.status === 'in_progress') {
            currentIndex = i;
          }
          break;
        }
      }

      return {
        currentPhaseIndex: currentIndex,
        phasesCompleted: completedCount,
        totalPhases: CAREER_JOURNEY_PHASES.length,
        progressPercentage: Math.round((completedCount / CAREER_JOURNEY_PHASES.length) * 100),
        currentPhaseTitle: CAREER_JOURNEY_PHASES[currentIndex].title,
        nextPhaseTitle: CAREER_JOURNEY_PHASES[currentIndex + 1]?.title || null
      };
    } catch (error) {
      console.error('Error fetching career journey progress:', error);
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
      const completedModulesStr = localStorage.getItem('completedModules');
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

    // If user has completed learning but no practice, suggest practice
    if (learningProgress.modulesCompleted > 0 && practiceProgress.meetingsCount === 0) {
      return {
        title: 'Practice What You Learned',
        description: 'Conduct your first stakeholder meeting to apply your knowledge',
        action: 'Start Practice',
        actionView: 'practice-flow',
        priority: 'high',
        icon: 'practice'
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

    // Default: explore projects
    return {
      title: 'Start a New Project',
      description: 'Apply your skills to a hands-on BA project',
      action: 'Browse Projects',
      actionView: 'project-flow',
      priority: 'medium',
      icon: 'project'
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

