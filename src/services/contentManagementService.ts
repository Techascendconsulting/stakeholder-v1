import { supabase } from '../lib/supabase';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'active' | 'inactive' | 'draft';
  estimated_hours: number;
  topics: string[];
  learning_outcomes: string[];
  prerequisites: string[];
  content: any;
  created_at: string;
  updated_at: string;
  created_by: string;
  archived: boolean;
}

export interface PracticeScenario {
  id: string;
  stage_id: string;
  title: string;
  description: string;
  objective: string;
  success_criteria: string[];
  must_cover_areas: any;
  example_questions: string[];
  techniques: string[];
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  created_by: string;
  archived: boolean;
}

export interface AssessmentQuestion {
  id: string;
  type: 'case-study' | 'assignment' | 'quiz' | 'essay';
  topic: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: string;
  questions: any;
  correct_answers: any;
  learning_objectives: string[];
  is_unlocked: boolean;
  is_completed: boolean;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  created_by: string;
  archived: boolean;
}

export interface EpicStory {
  id: string;
  epic_id?: string;
  title: string;
  description?: string;
  summary?: string;
  acceptance_criteria: string[];
  moscow_priority?: 'Must' | 'Should' | 'Could' | 'Won\'t';
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  created_by: string;
  archived: boolean;
}

export interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

class ContentManagementService {
  private static instance: ContentManagementService;

  public static getInstance(): ContentManagementService {
    if (!ContentManagementService.instance) {
      ContentManagementService.instance = new ContentManagementService();
    }
    return ContentManagementService.instance;
  }

  // Learning Modules
  async getLearningModules(): Promise<LearningModule[]> {
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching learning modules:', error);
      return [];
    }
  }

  async createLearningModule(module: Omit<LearningModule, 'id' | 'created_at' | 'updated_at'>): Promise<LearningModule | null> {
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .insert(module)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating learning module:', error);
      return null;
    }
  }

  async updateLearningModule(id: string, updates: Partial<LearningModule>): Promise<LearningModule | null> {
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating learning module:', error);
      return null;
    }
  }

  async deleteLearningModule(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('learning_modules')
        .update({ archived: true })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting learning module:', error);
      return false;
    }
  }

  // Practice Scenarios
  async getPracticeScenarios(): Promise<PracticeScenario[]> {
    try {
      const { data, error } = await supabase
        .from('practice_scenarios')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching practice scenarios:', error);
      return [];
    }
  }

  async createPracticeScenario(scenario: Omit<PracticeScenario, 'id' | 'created_at' | 'updated_at'>): Promise<PracticeScenario | null> {
    try {
      const { data, error } = await supabase
        .from('practice_scenarios')
        .insert(scenario)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating practice scenario:', error);
      return null;
    }
  }

  async updatePracticeScenario(id: string, updates: Partial<PracticeScenario>): Promise<PracticeScenario | null> {
    try {
      const { data, error } = await supabase
        .from('practice_scenarios')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating practice scenario:', error);
      return null;
    }
  }

  async deletePracticeScenario(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('practice_scenarios')
        .update({ archived: true })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting practice scenario:', error);
      return false;
    }
  }

  // Assessment Questions
  async getAssessmentQuestions(): Promise<AssessmentQuestion[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching assessment questions:', error);
      return [];
    }
  }

  async createAssessmentQuestion(question: Omit<AssessmentQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<AssessmentQuestion | null> {
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .insert(question)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating assessment question:', error);
      return null;
    }
  }

  async updateAssessmentQuestion(id: string, updates: Partial<AssessmentQuestion>): Promise<AssessmentQuestion | null> {
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating assessment question:', error);
      return null;
    }
  }

  async deleteAssessmentQuestion(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('assessment_questions')
        .update({ archived: true })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting assessment question:', error);
      return false;
    }
  }

  // Epic Stories
  async getEpicStories(): Promise<EpicStory[]> {
    try {
      const { data, error } = await supabase
        .from('epic_stories')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching epic stories:', error);
      return [];
    }
  }

  async createEpicStory(story: Omit<EpicStory, 'id' | 'created_at' | 'updated_at'>): Promise<EpicStory | null> {
    try {
      const { data, error } = await supabase
        .from('epic_stories')
        .insert(story)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating epic story:', error);
      return null;
    }
  }

  async updateEpicStory(id: string, updates: Partial<EpicStory>): Promise<EpicStory | null> {
    try {
      const { data, error } = await supabase
        .from('epic_stories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating epic story:', error);
      return null;
    }
  }

  async deleteEpicStory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('epic_stories')
        .update({ archived: true })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting epic story:', error);
      return false;
    }
  }

  // Content Categories
  async getContentCategories(): Promise<ContentCategory[]> {
    try {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching content categories:', error);
      return [];
    }
  }

  // Bulk operations
  async bulkUpdateStatus(ids: string[], status: 'active' | 'inactive' | 'draft', table: 'learning_modules' | 'practice_scenarios' | 'assessment_questions' | 'epic_stories'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(table)
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error bulk updating ${table}:`, error);
      return false;
    }
  }

  async bulkDelete(ids: string[], table: 'learning_modules' | 'practice_scenarios' | 'assessment_questions' | 'epic_stories'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(table)
        .update({ archived: true, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error bulk deleting ${table}:`, error);
      return false;
    }
  }
}

export default ContentManagementService;
