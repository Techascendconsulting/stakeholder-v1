import { supabase } from '../lib/supabase';
import {
  ProjectDeliverable,
  ProjectTrainingSession,
  Project,
  ProjectProgressSummary,
  CreateProjectDeliverableRequest,
  UpdateProjectDeliverableRequest,
  CreateProjectTrainingSessionRequest,
  UpdateProjectTrainingSessionRequest,
  ProjectDeliverablesResponse,
  ProjectTrainingSessionResponse,
  ProjectResponse,
  ProjectProgressResponse
} from '../types/projectDeliverables';

export class ProjectDeliverablesService {
  private static instance: ProjectDeliverablesService;

  public static getInstance(): ProjectDeliverablesService {
    if (!ProjectDeliverablesService.instance) {
      ProjectDeliverablesService.instance = new ProjectDeliverablesService();
    }
    return ProjectDeliverablesService.instance;
  }

  // Project Deliverables CRUD Operations
  async getProjectDeliverables(projectId: string): Promise<ProjectDeliverablesResponse> {
    try {
      const { data, error } = await supabase
        .from('project_deliverables')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching project deliverables:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getProjectDeliverable(id: string): Promise<ProjectDeliverablesResponse> {
    try {
      const { data, error } = await supabase
        .from('project_deliverables')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data ? [data] : [], error: null };
    } catch (error) {
      console.error('Error fetching project deliverable:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createProjectDeliverable(request: CreateProjectDeliverableRequest): Promise<ProjectDeliverablesResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const deliverable = {
        ...request,
        user_id: user.id,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('project_deliverables')
        .insert([deliverable])
        .select()
        .single();

      if (error) throw error;

      return { data: [data], error: null };
    } catch (error) {
      console.error('Error creating project deliverable:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateProjectDeliverable(request: UpdateProjectDeliverableRequest): Promise<ProjectDeliverablesResponse> {
    try {
      const updateData = {
        ...request,
        updated_at: new Date().toISOString()
      };
      delete updateData.id;

      const { data, error } = await supabase
        .from('project_deliverables')
        .update(updateData)
        .eq('id', request.id)
        .select()
        .single();

      if (error) throw error;

      return { data: [data], error: null };
    } catch (error) {
      console.error('Error updating project deliverable:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteProjectDeliverable(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('project_deliverables')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error deleting project deliverable:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Project Training Sessions Operations
  async getProjectTrainingSession(projectId: string): Promise<ProjectTrainingSessionResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('project_training_sessions')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error fetching project training session:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createProjectTrainingSession(request: CreateProjectTrainingSessionRequest): Promise<ProjectTrainingSessionResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const session = {
        ...request,
        user_id: user.id,
        progress_data: {},
        training_config: request.training_config,
        is_active: true,
        started_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('project_training_sessions')
        .insert([session])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating project training session:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateProjectTrainingSession(request: UpdateProjectTrainingSessionRequest): Promise<ProjectTrainingSessionResponse> {
    try {
      const updateData = {
        ...request,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      delete updateData.id;

      const { data, error } = await supabase
        .from('project_training_sessions')
        .update(updateData)
        .eq('id', request.id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating project training session:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Project Operations
  async getProject(projectId: string): Promise<ProjectResponse> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching project:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getProjectProgress(projectId: string): Promise<ProjectProgressResponse> {
    try {
      const { data, error } = await supabase
        .from('project_progress_summary')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching project progress:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Utility Methods
  async getDeliverablesByStage(projectId: string, stage: string): Promise<ProjectDeliverablesResponse> {
    try {
      const { data, error } = await supabase
        .from('project_deliverables')
        .select('*')
        .eq('project_id', projectId)
        .eq('stage', stage)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching deliverables by stage:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getDeliverablesByType(projectId: string, type: string): Promise<ProjectDeliverablesResponse> {
    try {
      const { data, error } = await supabase
        .from('project_deliverables')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching deliverables by type:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Mock data fallback for development
  getMockProjectDeliverables(projectId: string): ProjectDeliverable[] {
    return [
      {
        id: '1',
        user_id: 'mock-user',
        project_id: projectId,
        type: 'problem_statement',
        title: 'Problem Statement',
        content: 'The current ID verification process lacks automation, resulting in delays and higher fraud risk. Teams rely on manual review, causing inefficiencies.',
        status: 'in_progress',
        stage: 'problem_exploration',
        tags: ['automation', 'fraud', 'manual-review'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: 'mock-user',
        project_id: projectId,
        type: 'process_map',
        title: 'As-Is Process Map',
        content: '',
        status: 'draft',
        stage: 'as_is_mapping',
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        user_id: 'mock-user',
        project_id: projectId,
        type: 'stakeholder_notes',
        title: 'Notes from Stakeholder Conversations',
        content: 'Operations team mentioned manual handoffs between systems. Compliance team concerned about audit trail gaps. Customer success team reports 3-day delays on average.',
        status: 'in_progress',
        stage: 'as_is',
        tags: ['manual-handoffs', 'audit-trail', 'delays'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  getMockProjectTrainingSession(projectId: string): ProjectTrainingSession {
    return {
      id: '1',
      user_id: 'mock-user',
      project_id: projectId,
      current_stage: 'as_is_mapping',
      progress_data: {
        problem_exploration: { completed: true, questions_asked: 8, score: 'GOOD' },
        as_is: { completed: true, questions_asked: 12, score: 'GOOD' }
      },
      meeting_transcripts: [
        {
          date: new Date().toISOString(),
          participants: ['Operations Manager', 'Compliance Officer', 'Customer Success Lead'],
          summary: 'Discussion about current ID verification bottlenecks and manual processes',
          keyInsights: ['Manual handoffs between 3 systems', 'No automated fraud detection', 'Audit trail gaps in current process']
        }
      ],
      ai_feedback: [
        {
          stage: 'problem_exploration',
          feedback: 'Excellent stakeholder engagement',
          score: 'GOOD'
        }
      ],
      training_config: { maxQuestions: 20, stakeholders: ['operations', 'compliance', 'customer_success'] },
      is_active: true,
      started_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}













