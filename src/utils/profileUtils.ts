export interface UserProfile {
  displayName?: string;
  bio?: string;
  role?: string;
  company?: string;
  theme?: string;
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  meetingReminders?: boolean;
  weeklyDigest?: boolean;
  profilePhoto?: string | null;
  updatedAt?: string;
}

export const getUserProfile = (userId: string): UserProfile => {
  try {
    const savedProfile = localStorage.getItem(`profile-${userId}`);
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
  return {};
};

export const getUserProfilePhoto = (userId: string): string | null => {
  const profile = getUserProfile(userId);
  return profile.profilePhoto || null;
};

export const getUserDisplayName = (userId: string, email?: string): string => {
  const profile = getUserProfile(userId);
  return profile.displayName || email?.split('@')[0] || 'User';
};

export const updateUserProfile = (userId: string, updates: Partial<UserProfile>): void => {
  try {
    const currentProfile = getUserProfile(userId);
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`profile-${userId}`, JSON.stringify(updatedProfile));
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
};