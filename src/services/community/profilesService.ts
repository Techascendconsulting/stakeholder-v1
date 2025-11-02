// Profiles Service - handles user profile operations
export type Role = 'student' | 'graduate' | 'mentor' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: Role;
  avatar_url?: string;
  created_at: string;
}

// Mock data for development
const mockProfiles: Profile[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    full_name: 'John Doe',
    role: 'student',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    full_name: 'Jane Smith',
    role: 'student',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'mentor@example.com',
    full_name: 'Sarah Wilson',
    role: 'mentor',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const profilesService = {
  async lookupByEmail(email: string): Promise<Profile | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const profile = mockProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    return profile || null;
  },

  async search(query: string): Promise<Profile[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const lowercaseQuery = query.toLowerCase();
    return mockProfiles.filter(p => 
      p.email.toLowerCase().includes(lowercaseQuery) ||
      p.full_name?.toLowerCase().includes(lowercaseQuery)
    );
  }
};








