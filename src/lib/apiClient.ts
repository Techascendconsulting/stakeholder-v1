/**
 * API Client for Backend Serverless Functions
 * Replaces direct OpenAI calls in frontend
 * 
 * SECURITY: All OpenAI API calls go through secure backend endpoints
 */

const API_BASE_URL = '/api';

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface ChatResponse {
  success: boolean;
  message: string;
  usage?: any;
  error?: string;
}

interface AssignmentReviewRequest {
  moduleTitle: string;
  assignmentDescription: string;
  submission: string;
}

interface AssignmentReviewResponse {
  success: boolean;
  score: number;
  feedback: string;
  strengths: string;
  improvements: string;
  error?: string;
}

interface TranscribeRequest {
  audioData: string; // base64
  language?: string;
}

interface TranscribeResponse {
  success: boolean;
  text: string;
  error?: string;
}

interface CoachingRequest {
  userMessage: string;
  context?: string;
  coachingType?: 'general' | 'greeting' | 'questioning' | 'problem-exploration';
}

interface CoachingResponse {
  success: boolean;
  feedback: string;
  error?: string;
}

interface UserStoryValidationRequest {
  userStory: string;
}

interface UserStoryValidationResponse {
  success: boolean;
  isValid: boolean;
  score: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
  error?: string;
}

interface StakeholderResponseRequest {
  stakeholderProfile: {
    name: string;
    role: string;
    company?: string;
    personality?: string;
    communicationStyle?: string;
    goals?: string;
    concerns?: string;
  };
  conversationHistory?: Array<{ role: string; content: string }>;
  userQuestion: string;
  context?: string;
}

interface StakeholderResponseResponse {
  success: boolean;
  response: string;
  error?: string;
}

/**
 * Generic API call handler
 */
async function apiCall<T>(endpoint: string, body: any): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * General chat completion
 */
export async function chatCompletion(request: ChatRequest): Promise<ChatResponse> {
  return apiCall<ChatResponse>(`${API_BASE_URL}/chat`, request);
}

/**
 * Assignment review
 */
export async function reviewAssignment(request: AssignmentReviewRequest): Promise<AssignmentReviewResponse> {
  return apiCall<AssignmentReviewResponse>(`${API_BASE_URL}/assignments/review`, request);
}

/**
 * Audio transcription
 */
export async function transcribeAudio(request: TranscribeRequest): Promise<TranscribeResponse> {
  return apiCall<TranscribeResponse>(`${API_BASE_URL}/transcribe`, request);
}

/**
 * Coaching analysis
 */
export async function getCoachingFeedback(request: CoachingRequest): Promise<CoachingResponse> {
  return apiCall<CoachingResponse>(`${API_BASE_URL}/coaching/analyze`, request);
}

/**
 * User story validation
 */
export async function validateUserStory(request: UserStoryValidationRequest): Promise<UserStoryValidationResponse> {
  return apiCall<UserStoryValidationResponse>(`${API_BASE_URL}/validation/user-story`, request);
}

/**
 * Generate stakeholder response
 */
export async function generateStakeholderResponse(request: StakeholderResponseRequest): Promise<StakeholderResponseResponse> {
  return apiCall<StakeholderResponseResponse>(`${API_BASE_URL}/stakeholder/generate-response`, request);
}

/**
 * Legacy compatibility: createChatCompletion (for older code)
 * @deprecated Use chatCompletion instead
 */
export async function createChatCompletion(params: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
}): Promise<{ choices: Array<{ message: { content: string } }> }> {
  const result = await chatCompletion(params);
  
  // Return in OpenAI SDK format for backward compatibility
  return {
    choices: [
      {
        message: {
          content: result.message,
        },
      },
    ],
  };
}


