import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProgress, Module, Topic } from '../types/content';
import { useApp } from '../contexts/AppContext';

interface UnlockRule {
  id: string;
  target_section: string;
  required_modules: string[];
  required_assignments: string[];
  required_practice: string[];
  is_active: boolean;
}

interface Assignment {
  id: string;
  user_id: string;
  module_id: string;
  submission: string;
  feedback: string | null;
  score: number | null;
  status: 'submitted' | 'reviewed' | 'needs_revision';
  created_at: string;
  updated_at: string;
}

interface UserJourneyData {
  currentModule: Module | null;
  currentTopic: Topic | null;
  modulesCompletedCount: number;
  topicsCompletedCount: number;
  assignmentsCompletedCount: number;
  practiceUnlocked: boolean;
  projectUnlocked: boolean;
  overallProgress: number; // 0-100
  loading: boolean;
  error: string | null;
}

interface NextAction {
  type: 'module' | 'topic' | 'assignment' | 'practice' | 'project' | 'complete';
  title: string;
  description: string;
  navigationId?: string;
}

export function useUserJourney(userId: string | null) {
  const { userType } = useApp();
  
  const [data, setData] = useState<UserJourneyData>({
    currentModule: null,
    currentTopic: null,
    modulesCompletedCount: 0,
    topicsCompletedCount: 0,
    assignmentsCompletedCount: 0,
    practiceUnlocked: false,
    projectUnlocked: false,
    overallProgress: 0,
    loading: true,
    error: null,
  });

  const [unlockRules, setUnlockRules] = useState<UnlockRule[]>([]);

  const fetchJourneyData = useCallback(async () => {
    if (!userId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      // Fetch all modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('is_published', true)
        .order('position', { ascending: true });

      if (modulesError) throw modulesError;

      // Fetch all topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('is_published', true)
        .order('position', { ascending: true });

      if (topicsError) throw topicsError;

      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('learning_assignments')
        .select('*')
        .eq('user_id', userId);

      if (assignmentsError) throw assignmentsError;

      // Fetch unlock rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('unlock_rules')
        .select('*')
        .eq('is_active', true);

      if (rulesError) throw rulesError;

      setUnlockRules(rulesData as UnlockRule[] || []);

      // Process progress data
      const progress = (progressData as UserProgress[]) || [];
      const modules = (modulesData as Module[]) || [];
      const topics = (topicsData as Topic[]) || [];
      const assignments = (assignmentsData as Assignment[]) || [];

      // Count completed items
      const completedModules = progress.filter(
        p => p.unit_type === 'module' && p.status === 'completed'
      );
      const completedTopics = progress.filter(
        p => p.unit_type === 'topic' && p.status === 'completed'
      );
      const completedAssignments = assignments.filter(
        a => a.status === 'reviewed' && (a.score || 0) >= 70
      );

      // Find current module (first incomplete or in-progress)
      const inProgressModule = progress.find(
        p => p.unit_type === 'module' && p.status === 'in_progress'
      );
      const currentModuleProgress = inProgressModule || 
        progress.find(p => p.unit_type === 'module' && p.status === 'not_started');
      
      const currentModule = currentModuleProgress
        ? modules.find(m => m.stable_key === currentModuleProgress.stable_key) || null
        : modules[0] || null;

      // Find current topic (first incomplete or in-progress)
      const inProgressTopic = progress.find(
        p => p.unit_type === 'topic' && p.status === 'in_progress'
      );
      const currentTopicProgress = inProgressTopic || 
        progress.find(p => p.unit_type === 'topic' && p.status === 'not_started');
      
      const currentTopic = currentTopicProgress
        ? topics.find(t => t.stable_key === currentTopicProgress.stable_key) || null
        : topics[0] || null;

      // Check unlock rules
      const completedModuleKeys = completedModules.map(m => m.stable_key);
      const completedAssignmentIds = completedAssignments.map(a => a.module_id);

      // Check if practice is unlocked
      let practiceUnlocked = false;
      if (userType === 'existing') {
        practiceUnlocked = true;
      } else {
        // New users: must complete Modules 1–3 assignments
        practiceUnlocked = completedAssignments.length >= 3;
      }

      // Check if project is unlocked
      let projectUnlocked = false;
      if (userType === 'existing') {
        projectUnlocked = practiceUnlocked; // practice must be done before project
      } else {
        projectUnlocked = practiceUnlocked; // new users same rule
      }

      // Calculate overall progress
      const totalModules = modules.length;
      const totalTopics = topics.length;
      const totalAssignments = modules.length; // Assume 1 assignment per module
      const totalItems = totalModules + totalTopics + totalAssignments;
      const completedItems = completedModules.length + completedTopics.length + completedAssignments.length;
      const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      setData({
        currentModule,
        currentTopic,
        modulesCompletedCount: completedModules.length,
        topicsCompletedCount: completedTopics.length,
        assignmentsCompletedCount: completedAssignments.length,
        practiceUnlocked,
        projectUnlocked,
        overallProgress,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('❌ Failed to fetch user journey data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load journey data',
      }));
    }
  }, [userId]);

  useEffect(() => {
    fetchJourneyData();
  }, [fetchJourneyData]);

  const getNextAction = useCallback((): NextAction => {
    if (data.loading) {
      return {
        type: 'module',
        title: 'Loading...',
        description: 'Please wait while we load your progress',
      };
    }

    // If there's a current topic in progress, continue it
    if (data.currentTopic) {
      return {
        type: 'topic',
        title: `Continue: ${data.currentTopic.title}`,
        description: 'Pick up where you left off in your learning',
        navigationId: 'learning-flow',
      };
    }

    // If there's a current module in progress, continue it
    if (data.currentModule) {
      return {
        type: 'module',
        title: `Continue: ${data.currentModule.title}`,
        description: 'Complete this module to unlock more content',
        navigationId: 'learning-flow',
      };
    }

    // Check for pending assignments
    if (data.modulesCompletedCount > data.assignmentsCompletedCount) {
      return {
        type: 'assignment',
        title: 'Complete Assignment',
        description: 'Submit your assignment to unlock the next module',
        navigationId: 'learning-flow',
      };
    }

    // If practice is unlocked but not started, suggest it
    if (data.practiceUnlocked && data.modulesCompletedCount > 0) {
      return {
        type: 'practice',
        title: 'Start Practice Exercises',
        description: 'Apply what you learned in hands-on scenarios',
        navigationId: 'practice-flow',
      };
    }

    // If project is unlocked, suggest it
    if (data.projectUnlocked) {
      return {
        type: 'project',
        title: 'Start Your Project',
        description: 'Begin working on your capstone project',
        navigationId: 'project-journey',
      };
    }

    // Everything complete
    if (data.overallProgress === 100) {
      return {
        type: 'complete',
        title: 'Journey Complete!',
        description: 'Congratulations on completing your learning journey',
        navigationId: 'dashboard',
      };
    }

    // Default: start learning
    return {
      type: 'module',
      title: 'Start Learning',
      description: 'Begin your Business Analyst learning journey',
      navigationId: 'learning-flow',
    };
  }, [data]);

  const refresh = useCallback(() => {
    fetchJourneyData();
  }, [fetchJourneyData]);

  return {
    ...data,
    unlockRules,
    getNextAction,
    refresh,
    userType,
  };
}
