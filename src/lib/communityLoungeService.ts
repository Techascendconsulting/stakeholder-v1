import { createClient } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Space {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  space_id: string;
  name: string;
  description?: string;
  is_private: boolean;
  is_staff_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  channel_id: string;
  user_id: string;
  body?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  replied_to_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  user?: {
    email: string;
    display_name?: string;
  };
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface UserPresence {
  user_id: string;
  space_id: string;
  last_seen: string;
  is_online: boolean;
}

class CommunityLoungeService {
  private realtimeChannels: Map<string, RealtimeChannel> = new Map();

  // Get user's spaces
  async getSpaces(): Promise<Space[]> {
    console.log('🔍 getSpaces() called');
    
    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔍 Current user:', user);
    console.log('🔍 Auth error:', authError);
    
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('🔍 getSpaces result:', { data, error });

    if (error) {
      console.error('Error fetching spaces:', error);
      throw error;
    }

    console.log('🔍 Returning spaces:', data || []);
    return data || [];
  }

  // Get channels for a space
  async getChannels(spaceId: string): Promise<Channel[]> {
    console.log('🔍 getChannels() called with spaceId:', spaceId);
    
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('space_id', spaceId)
      .order('name', { ascending: true });

    console.log('🔍 getChannels result:', { data, error });

    if (error) {
      console.error('Error fetching channels:', error);
      throw error;
    }

    console.log('🔍 Returning channels:', data || []);
    return data || [];
  }

  // Get messages for a channel with user info and reactions
  async getMessages(channelId: string, limit = 50): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    // Get reactions for each message and add user info
    const messagesWithReactions = await Promise.all(
      (data || []).map(async (message) => {
        const reactions = await this.getMessageReactions(message.id);
        
        return {
          ...message,
          user: {
            email: message.user_id // Just use the user_id as email for now
          },
          reactions
        };
      })
    );

    return messagesWithReactions.reverse(); // Return in chronological order
  }

  // Get reactions for a message
  async getMessageReactions(messageId: number): Promise<MessageReaction[]> {
    const { data, error } = await supabase
      .from('message_reactions')
      .select('emoji, user_id')
      .eq('message_id', messageId);

    if (error) {
      console.error('Error fetching reactions:', error);
      return [];
    }

    // Group reactions by emoji
    const reactionMap = new Map<string, string[]>();
    data?.forEach(reaction => {
      if (!reactionMap.has(reaction.emoji)) {
        reactionMap.set(reaction.emoji, []);
      }
      reactionMap.get(reaction.emoji)!.push(reaction.user_id);
    });

    return Array.from(reactionMap.entries()).map(([emoji, users]) => ({
      emoji,
      count: users.length,
      users
    }));
  }

  // Send a message
  async sendMessage(channelId: string, body: string, fileUrl?: string, fileName?: string, fileSize?: number): Promise<Message> {
    console.log('Sending message:', { channelId, body, fileUrl, fileName, fileSize });
    
    // Get user info first
    const { data: userData } = await supabase.auth.getUser();
    // Use a fallback user ID if not authenticated (for testing)
    const userId = userData?.user?.id || 'c7572fd7-bd9c-4a7b-9a01-ff8278e58abf'; // Use the space creator's ID as fallback
    const userEmail = userData?.user?.email || 'admin@batraining.com';
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        channel_id: channelId,
        user_id: userId, // Add the user_id
        body,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    console.log('Message sent successfully:', data);

    return {
      ...data,
      user: {
        email: userEmail
      },
      reactions: []
    };
  }

  // Create a new channel
  async createChannel(spaceId: string, name: string, description?: string): Promise<Channel> {
    const { data, error } = await supabase
      .from('channels')
      .insert({
        space_id: spaceId,
        name,
        description,
        is_private: false,
        is_staff_only: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating channel:', error);
      throw error;
    }

    return data;
  }

  // Upload file to storage
  async uploadFile(file: File, spaceId: string): Promise<string> {
    try {
      console.log('📁 Starting file upload:', { fileName: file.name, spaceId, fileSize: file.size });
      
      // Check file size (50MB limit)
      if (file.size > 52428800) {
        throw new Error('File size exceeds 50MB limit');
      }
      
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${spaceId}/${fileName}`;
      
      console.log('📁 Uploading to path:', filePath);
      
      const { data, error } = await supabase.storage
        .from('community-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Storage upload error:', error);
        throw error;
      }

      console.log('✅ File uploaded to storage:', data.path);

      const { data: urlData } = supabase.storage
        .from('community-files')
        .getPublicUrl(data.path);

      console.log('🔗 Public URL generated:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw error;
    }
  }

  // Add reaction to message
  async addReaction(messageId: number, emoji: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || 'c7572fd7-bd9c-4a7b-9a01-ff8278e58abf'; // Use fallback user ID
    
    const { error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: userId,
        emoji
      });

    if (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  // Remove reaction from message
  async removeReaction(messageId: number, emoji: string): Promise<void> {
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('emoji', emoji);

    if (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  // Update user presence
  async updatePresence(spaceId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || 'c7572fd7-bd9c-4a7b-9a01-ff8278e58abf'; // Use fallback user ID
    
    // Insert or update presence directly instead of using RPC
    const { error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: userId,
        space_id: spaceId,
        last_seen: new Date().toISOString(),
        is_online: true
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error updating presence:', error);
    }
  }

  // Get online users for a space
  async getOnlineUsers(spaceId: string): Promise<UserPresence[]> {
    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .eq('space_id', spaceId)
      .eq('is_online', true)
      .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

    if (error) {
      console.error('Error fetching online users:', error);
      return [];
    }

    return data || [];
  }

  // Subscribe to real-time messages
  subscribeToMessages(channelId: string, callback: (message: Message) => void): RealtimeChannel {
    const channelKey = `messages:${channelId}`;
    
    // Unsubscribe if already subscribed
    if (this.realtimeChannels.has(channelKey)) {
      this.realtimeChannels.get(channelKey)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          const message = payload.new as Message;
          
          // Get user info and reactions
          const { data: userData } = await supabase
            .from('auth.users')
            .select('email')
            .eq('id', message.user_id)
            .single();

          const reactions = await this.getMessageReactions(message.id);

          const fullMessage: Message = {
            ...message,
            user: userData ? { email: userData.email } : undefined,
            reactions
          };

          callback(fullMessage);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          // Handle message deletion
          console.log('Message deleted:', payload.old);
        }
      )
      .subscribe();

    this.realtimeChannels.set(channelKey, channel);
    return channel;
  }

  // Subscribe to reactions
  subscribeToReactions(channelId: string, callback: (reaction: any) => void): RealtimeChannel {
    const channelKey = `reactions:${channelId}`;
    
    if (this.realtimeChannels.has(channelKey)) {
      this.realtimeChannels.get(channelKey)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions'
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    this.realtimeChannels.set(channelKey, channel);
    return channel;
  }

  // Subscribe to user presence
  subscribeToPresence(spaceId: string, callback: (presence: UserPresence) => void): RealtimeChannel {
    const channelKey = `presence:${spaceId}`;
    
    if (this.realtimeChannels.has(channelKey)) {
      this.realtimeChannels.get(channelKey)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `space_id=eq.${spaceId}`
        },
        (payload) => {
          callback(payload.new as UserPresence);
        }
      )
      .subscribe();

    this.realtimeChannels.set(channelKey, channel);
    return channel;
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.realtimeChannels.forEach(channel => {
      channel.unsubscribe();
    });
    this.realtimeChannels.clear();
  }

  // Search messages
  async searchMessages(query: string, channelId?: string): Promise<Message[]> {
    let queryBuilder = supabase
      .from('messages')
      .select(`
        *,
        user:user_id(email)
      `)
      .textSearch('body', query)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (channelId) {
      queryBuilder = queryBuilder.eq('channel_id', channelId);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error searching messages:', error);
      throw error;
    }

    return data || [];
  }


}

export const communityLoungeService = new CommunityLoungeService();
