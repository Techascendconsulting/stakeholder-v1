import { supabase } from './supabase';

export interface FoundationProgress {
  id: string;
  userId: string;
  stepCompleted: string;
  completedAt: string;
  quizScore?: number;
  taskData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface FoundationStep {
  id: string;
  title: string;
  type: 'content' | 'quiz' | 'task' | 'reflection';
  cluster: 'cluster-1' | 'cluster-2' | 'cluster-3' | 'final';
  isCompleted: boolean;
  isUnlocked: boolean;
}

export class FoundationProgressService {
  static async getProgress(userId: string): Promise<FoundationProgress[]> {
    try {
      const { data, error } = await supabase
        .from('foundation_progress')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching foundation progress:', error);
      return [];
    }
  }

  static async markStepCompleted(
    userId: string, 
    stepCompleted: string, 
    quizScore?: number, 
    taskData?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('foundation_progress')
        .upsert({
          user_id: userId,
          step_completed: stepCompleted,
          quiz_score: quizScore,
          task_data: taskData,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking step completed:', error);
      throw error;
    }
  }

  static async isStepCompleted(userId: string, stepCompleted: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('foundation_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('step_completed', stepCompleted)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking step completion:', error);
      return false;
    }
  }

  static async getCompletedSteps(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('foundation_progress')
        .select('step_completed')
        .eq('user_id', userId);

      if (error) throw error;
      return data?.map(item => item.step_completed) || [];
    } catch (error) {
      console.error('Error getting completed steps:', error);
      return [];
    }
  }

  static getFoundationSteps(): FoundationStep[] {
    return [
      // Cluster 1: Business Context
      { id: 'business-context', title: 'Business Context', type: 'content', cluster: 'cluster-1', isCompleted: false, isUnlocked: true },
      { id: 'why-bas-exist', title: 'Why BAs Exist', type: 'content', cluster: 'cluster-1', isCompleted: false, isUnlocked: false },
      { id: 'how-projects-run', title: 'How Projects Run', type: 'content', cluster: 'cluster-1', isCompleted: false, isUnlocked: false },
      { id: 'cluster1-quiz', title: 'Business Fundamentals Quiz', type: 'quiz', cluster: 'cluster-1', isCompleted: false, isUnlocked: false },
      
      // Cluster 2: Requirements & Methodology
      { id: 'requirements-engineering', title: 'Requirements Engineering', type: 'content', cluster: 'cluster-2', isCompleted: false, isUnlocked: false },
      { id: 'agile-waterfall', title: 'Agile vs Waterfall', type: 'content', cluster: 'cluster-2', isCompleted: false, isUnlocked: false },
      { id: 'mvp', title: 'MVP Concepts', type: 'content', cluster: 'cluster-2', isCompleted: false, isUnlocked: false },
      { id: 'cluster2-task', title: 'Requirements Classification Task', type: 'task', cluster: 'cluster-2', isCompleted: false, isUnlocked: false },
      
      // Cluster 3: Stakeholders & Expectations
      { id: 'stakeholder-mapping', title: 'Stakeholder Mapping', type: 'content', cluster: 'cluster-3', isCompleted: false, isUnlocked: false },
      { id: 'unwritten-expectations', title: 'Unwritten Expectations', type: 'content', cluster: 'cluster-3', isCompleted: false, isUnlocked: false },
      { id: 'cluster3-reflection', title: 'Stakeholder Scenario Reflection', type: 'reflection', cluster: 'cluster-3', isCompleted: false, isUnlocked: false },
      
      // Final: Project Brief Unlock
      { id: 'project-brief-unlock', title: 'Project Brief Unlocked', type: 'content', cluster: 'final', isCompleted: false, isUnlocked: false },
    ];
  }

  static updateStepUnlockStatus(steps: FoundationStep[], completedSteps: string[]): FoundationStep[] {
    return steps.map((step, index) => {
      let isUnlocked = false;
      
      if (index === 0) {
        // First step is always unlocked
        isUnlocked = true;
      } else {
        // Check if previous step is completed
        const previousStep = steps[index - 1];
        isUnlocked = completedSteps.includes(previousStep.id);
      }
      
      return {
        ...step,
        isCompleted: completedSteps.includes(step.id),
        isUnlocked,
      };
    });
  }

  static getCurrentStep(steps: FoundationStep[]): string | null {
    const unlockedIncompleteStep = steps.find(step => step.isUnlocked && !step.isCompleted);
    return unlockedIncompleteStep?.id || null;
  }

  static isFoundationComplete(completedSteps: string[]): boolean {
    const requiredSteps = [
      'business-context',
      'why-bas-exist', 
      'how-projects-run',
      'cluster1-quiz',
      'requirements-engineering',
      'agile-waterfall',
      'mvp',
      'cluster2-task',
      'stakeholder-mapping',
      'unwritten-expectations',
      'cluster3-reflection'
    ];
    
    return requiredSteps.every(step => completedSteps.includes(step));
  }
}
