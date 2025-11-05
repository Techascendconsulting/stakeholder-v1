// Groups Service - handles group operations
export type GroupType = 'cohort' | 'graduate' | 'mentor' | 'custom';

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  start_date?: string;
  end_date?: string;
  slack_channel_id?: string | null;
  archived?: boolean;
  created_at: string;
}

export interface GroupWithCount extends Group {
  member_count: number;
}

export interface Member {
  id: string;
  user_id: string;
  full_name?: string;
  email: string;
  added_at: string;
}

// Mock data for development
const mockGroups: GroupWithCount[] = [
  {
    id: '1',
    name: 'Cohort 2024-01',
    type: 'cohort',
    start_date: '2024-01-15',
    end_date: '2024-04-15',
    slack_channel_id: 'C1234567890',
    archived: false,
    created_at: '2024-01-01T00:00:00Z',
    member_count: 12
  },
  {
    id: '2',
    name: 'Graduate Network',
    type: 'graduate',
    start_date: '2024-01-01',
    slack_channel_id: 'C0987654321',
    archived: false,
    created_at: '2024-01-01T00:00:00Z',
    member_count: 8
  }
];

const mockMyGroups: Group[] = [
  {
    id: '1',
    name: 'Cohort 2024-01',
    type: 'cohort',
    start_date: '2024-01-15',
    end_date: '2024-04-15',
    slack_channel_id: 'C1234567890',
    archived: false,
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockMembers: Record<string, Member[]> = {
  '1': [
    {
      id: 'm1',
      user_id: '1',
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      added_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'm2',
      user_id: '2',
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      added_at: '2024-01-01T00:00:00Z'
    }
  ]
};

export const groupsService = {
  async listMyGroups(): Promise<Group[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMyGroups;
  },

  async listAll(): Promise<GroupWithCount[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockGroups;
  },

  async create(payload: {
    name: string;
    type: GroupType;
    start_date?: string;
    end_date?: string;
  }): Promise<Group> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newGroup: Group = {
      id: Date.now().toString(),
      name: payload.name,
      type: payload.type,
      start_date: payload.start_date,
      end_date: payload.end_date,
      slack_channel_id: null,
      archived: false,
      created_at: new Date().toISOString()
    };
    
    return newGroup;
  },

  async update(id: string, patch: Partial<Group>): Promise<Group> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const group = mockGroups.find(g => g.id === id);
    if (!group) throw new Error('Group not found');
    
    return { ...group, ...patch };
  },

  async archive(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock implementation
  },

  async listMembers(groupId: string): Promise<Member[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMembers[groupId] || [];
  },

  async addByEmails(groupId: string, emails: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock implementation - would resolve emails to user IDs and add to group
  },

  async removeMember(groupId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock implementation
  },

  async importCsv(file: File): Promise<{
    added: number;
    skipped: number;
    errors: Array<{ row: number; reason: string }>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock implementation
    return {
      added: 5,
      skipped: 1,
      errors: [{ row: 3, reason: 'Invalid email format' }]
    };
  }
};














