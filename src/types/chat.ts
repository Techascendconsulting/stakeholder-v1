// Advanced Chat Features Types
// Direct Messages, Message Threading, User Profiles, Message Search, Typing Indicators, and Message Pinning

export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  title?: string;
  company?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  skills?: string[];
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DirectMessage {
  id: number;
  sender_id: string;
  recipient_id: string;
  body?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  replied_to_id?: number;
  thread_id?: number;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Computed fields
  sender?: {
    email?: string;
    profile?: UserProfile;
  };
  recipient?: {
    email?: string;
    profile?: UserProfile;
  };
  reactions?: MessageReaction[];
}

export interface DMReaction {
  id: string;
  message_id: number;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface MessageThread {
  id: number;
  parent_message_id: number;
  parent_type: 'channel' | 'dm';
  thread_title?: string;
  created_at: string;
  updated_at: string;
  reply_count: number;
  // Computed fields
  parent_message?: Message | DirectMessage;
  replies?: (Message | DirectMessage)[];
}

export interface PinnedMessage {
  id: string;
  message_id: number;
  message_type: 'channel' | 'dm';
  pinned_by: string;
  pinned_at: string;
  // Computed fields
  message?: Message | DirectMessage;
  pinned_by_user?: {
    email?: string;
    profile?: UserProfile;
  };
}

export interface TypingIndicator {
  id: string;
  user_id: string;
  channel_id?: string;
  dm_recipient_id?: string;
  is_typing: boolean;
  started_at: string;
  // Computed fields
  user?: {
    email?: string;
    profile?: UserProfile;
  };
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query: string;
  search_type: 'messages' | 'users' | 'files';
  created_at: string;
}

export interface UserConnection {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  // Computed fields
  follower?: {
    email?: string;
    profile?: UserProfile;
  };
  following?: {
    email?: string;
    profile?: UserProfile;
  };
}

export interface MessageBookmark {
  id: string;
  user_id: string;
  message_id: number;
  message_type: 'channel' | 'dm';
  bookmark_note?: string;
  created_at: string;
  // Computed fields
  message?: Message | DirectMessage;
}

// Enhanced existing types
export interface Message {
  id: number;
  channel_id: string;
  user_id: string;
  body?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  replied_to_id?: number;
  thread_id?: number; // New field for threading
  is_edited?: boolean; // New field for edit tracking
  edited_at?: string; // New field for edit timestamp
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Computed fields
  user?: {
    email?: string;
    profile?: UserProfile;
  };
  reactions?: MessageReaction[];
  thread?: MessageThread;
  is_pinned?: boolean;
  reply_count?: number;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

// Search result types
export interface SearchResult {
  type: 'message' | 'user' | 'file';
  id: string | number;
  title: string;
  content: string;
  url?: string;
  created_at: string;
  relevance_score?: number;
}

// Conversation types for DMs
export interface Conversation {
  id: string; // Combination of user IDs
  other_user_id: string;
  other_user: {
    email?: string;
    profile?: UserProfile;
  };
  last_message?: DirectMessage;
  unread_count: number;
  updated_at: string;
}

// Enhanced channel types
export interface Channel {
  id: string;
  space_id: string;
  name: string;
  description?: string;
  is_private: boolean;
  is_staff_only: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields
  pinned_messages?: PinnedMessage[];
  member_count?: number;
  unread_count?: number;
}

// API Response types
export interface SearchResponse {
  results: SearchResult[];
  total_count: number;
  has_more: boolean;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total_count: number;
}

export interface UserProfileResponse {
  profile: UserProfile;
  is_following: boolean;
  follower_count: number;
  following_count: number;
}

// Real-time event types
export interface TypingEvent {
  user_id: string;
  channel_id?: string;
  dm_recipient_id?: string;
  is_typing: boolean;
}

export interface DirectMessageEvent {
  message: DirectMessage;
  conversation_id: string;
}

export interface ThreadEvent {
  thread: MessageThread;
  message: Message | DirectMessage;
}

export interface PinEvent {
  message_id: number;
  message_type: 'channel' | 'dm';
  is_pinned: boolean;
  pinned_by: string;
}




























