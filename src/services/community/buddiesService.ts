// Buddies Service - handles buddy pair operations
export interface BuddyPair {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_email?: string;
  user2_email?: string;
  status: 'pending' | 'confirmed' | 'archived';
  slack_channel_id?: string | null;
  created_at: string;
}

// Mock data for development
const mockMyBuddy: BuddyPair | null = {
  id: '1',
  user1_id: '1',
  user2_id: '2',
  user1_email: 'john.doe@example.com',
  user2_email: 'jane.smith@example.com',
  status: 'confirmed',
  slack_channel_id: 'C1111111111',
  created_at: '2024-01-01T00:00:00Z'
};

const mockAllBuddies: BuddyPair[] = [
  {
    id: '1',
    user1_id: '1',
    user2_id: '2',
    user1_email: 'john.doe@example.com',
    user2_email: 'jane.smith@example.com',
    status: 'confirmed',
    slack_channel_id: 'C1111111111',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    user1_id: '3',
    user2_id: '4',
    user1_email: 'alice@example.com',
    user2_email: 'bob@example.com',
    status: 'pending',
    slack_channel_id: null,
    created_at: '2024-01-02T00:00:00Z'
  }
];

export const buddiesService = {
  async listMine(): Promise<BuddyPair[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMyBuddy ? [mockMyBuddy] : [];
  },

  async listAll(): Promise<BuddyPair[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAllBuddies;
  },

  async createByEmails(
    email1: string,
    email2: string,
    status: 'pending' | 'confirmed' = 'pending'
  ): Promise<BuddyPair> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPair: BuddyPair = {
      id: Date.now().toString(),
      user1_id: 'temp1',
      user2_id: 'temp2',
      user1_email: email1,
      user2_email: email2,
      status,
      slack_channel_id: status === 'confirmed' ? 'C' + Math.random().toString(36).substr(2, 9) : null,
      created_at: new Date().toISOString()
    };
    
    return newPair;
  },

  async confirm(pairId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock implementation
  },

  async archive(pairId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock implementation
  },

  async repair(pairId: string, newEmail: string): Promise<BuddyPair> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock implementation - would archive old pair and create new one
    return {
      id: Date.now().toString(),
      user1_id: 'temp1',
      user2_id: 'temp2',
      user1_email: 'existing@example.com',
      user2_email: newEmail,
      status: 'pending',
      slack_channel_id: null,
      created_at: new Date().toISOString()
    };
  }
};


















