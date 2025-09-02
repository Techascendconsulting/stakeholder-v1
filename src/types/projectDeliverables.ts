// Project Deliverables Types
export interface ProjectDeliverable {
  id: string;
  user_id: string;
  project_id: string;
  type: 'problem_statement' | 'process_map' | 'stakeholder_notes' | 'requirements_doc' | 'user_stories';
  title: string;
  content: string;
  status: 'draft' | 'in_progress' | 'completed' | 'submitted' | 'reviewed';
  stage: 'problem_exploration' | 'as_is' | 'as_is_mapping' | 'to_be' | 'solution_design';
  tags: string[];
  attachments?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProjectTrainingSession {
  id: string;
  user_id: string;
  project_id: string;
  current_stage: 'problem_exploration' | 'as_is' | 'as_is_mapping' | 'to_be' | 'solution_design';
  progress_data: Record<string, any>;
  meeting_transcripts?: MeetingTranscript[];
  ai_feedback?: AIFeedback[];
  training_config: Record<string, any>;
  is_active: boolean;
  started_at: string;
  last_activity: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  category: 'training' | 'real_project' | 'custom';
  stages_completed: string[];
  deliverables_count: Record<string, number>;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingTranscript {
  date: string;
  participants: string[];
  summary: string;
  keyInsights: string[];
}

export interface AIFeedback {
  stage: string;
  feedback: string;
  score: 'GOOD' | 'AMBER' | 'OOS';
  suggestions?: string[];
  techniques?: string[];
}

export interface ProjectProgressSummary {
  project_id: string;
  project_name: string;
  project_type: string;
  category: string;
  stages_completed: string[];
  deliverables_count: Record<string, number>;
  current_stage: string;
  progress_data: Record<string, any>;
  training_active: boolean;
  total_deliverables: number;
  completed_deliverables: number;
  created_at: string;
  last_activity: string;
}

// API Response Types
export interface ProjectDeliverablesResponse {
  data: ProjectDeliverable[];
  error: string | null;
}

export interface ProjectTrainingSessionResponse {
  data: ProjectTrainingSession | null;
  error: string | null;
}

export interface ProjectResponse {
  data: Project | null;
  error: string | null;
}

export interface ProjectProgressResponse {
  data: ProjectProgressSummary | null;
  error: string | null;
}

// Create/Update Types
export interface CreateProjectDeliverableRequest {
  project_id: string;
  type: ProjectDeliverable['type'];
  title: string;
  content: string;
  stage: ProjectDeliverable['stage'];
  tags?: string[];
  attachments?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateProjectDeliverableRequest {
  id: string;
  title?: string;
  content?: string;
  status?: ProjectDeliverable['status'];
  tags?: string[];
  attachments?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CreateProjectTrainingSessionRequest {
  project_id: string;
  current_stage: ProjectTrainingSession['current_stage'];
  training_config: Record<string, any>;
}

export interface UpdateProjectTrainingSessionRequest {
  id: string;
  current_stage?: ProjectTrainingSession['current_stage'];
  progress_data?: Record<string, any>;
  meeting_transcripts?: MeetingTranscript[];
  ai_feedback?: AIFeedback[];
  is_active?: boolean;
  completed_at?: string;
}

