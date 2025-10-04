// Sessions Service - handles training session operations
export interface Session {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_by?: string;
  slack_channel_id?: string | null;
  created_at: string;
}

// Mock data for development
const mockMySessions: Session[] = [
  {
    id: '1',
    title: 'Stakeholder Interview Techniques',
    description: 'Learn advanced techniques for conducting stakeholder interviews',
    start_time: '2024-02-15T10:00:00Z',
    end_time: '2024-02-15T12:00:00Z',
    created_by: 'admin',
    slack_channel_id: 'C2222222222',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Requirements Gathering Workshop',
    description: 'Hands-on workshop for gathering and documenting requirements',
    start_time: '2024-02-20T14:00:00Z',
    end_time: '2024-02-20T16:00:00Z',
    created_by: 'admin',
    slack_channel_id: 'C3333333333',
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockAllSessions: Session[] = [
  ...mockMySessions,
  {
    id: '3',
    title: 'Advanced BA Techniques',
    description: 'Deep dive into advanced business analysis techniques',
    start_time: '2024-02-25T09:00:00Z',
    end_time: '2024-02-25T11:00:00Z',
    created_by: 'admin',
    slack_channel_id: 'C4444444444',
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const sessionsService = {
  async listMine(): Promise<Session[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMySessions;
  },

  async listAll(): Promise<Session[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAllSessions;
  },

  async create(payload: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
  }): Promise<Session> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newSession: Session = {
      id: Date.now().toString(),
      title: payload.title,
      description: payload.description,
      start_time: payload.start_time,
      end_time: payload.end_time,
      created_by: 'current-user',
      slack_channel_id: null,
      created_at: new Date().toISOString()
    };
    
    return newSession;
  },

  async update(id: string, patch: Partial<Session>): Promise<Session> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const session = mockAllSessions.find(s => s.id === id);
    if (!session) throw new Error('Session not found');
    
    return { ...session, ...patch };
  },

  async remove(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock implementation
  }
};


