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

    // Calculate completed modules based on topics (14 topics = 1 module)
    const completedModules = Math.floor((data.topicsCompletedCount || 0) / 14);

    if (completedModules < 3) {
      return {
        type: 'module',
        title: "Continue Core Learning",
        description: "You're still building your foundation. Continue your BA Learning Journey.",
        navigationId: 'learning-flow',
      };
    }

    if (completedModules >= 3 && completedModules < 10) {
      return {
        type: 'practice',
        title: "Begin Practice Journey",
        description: "You've learned the fundamentals. Now it's time to start applying them with assisted exercises.",
        navigationId: 'practice-flow',
      };
    }

    return {
      type: 'project',
      title: "Begin Project Journey",
      description: "You're ready. Start working like a real BA on a live project.",
      navigationId: 'project-journey',
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
