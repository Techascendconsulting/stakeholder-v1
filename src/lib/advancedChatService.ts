import { supabase } from './supabase';
import type {
  DirectMessage,
  UserProfile,
  MessageThread,
  PinnedMessage,
  TypingIndicator,
  SearchResult,
  Conversation,
  SearchResponse,
  ConversationListResponse,
  UserProfileResponse,
  MessageBookmark,
  UserConnection
} from '../types/chat';
import type { Message } from './communityLoungeService';

export class AdvancedChatService {
  private static instance: AdvancedChatService;
  private realtimeChannels: Map<string, any> = new Map();

  public static getInstance(): AdvancedChatService {
    if (!AdvancedChatService.instance) {
      AdvancedChatService.instance = new AdvancedChatService();
    }
    return AdvancedChatService.instance;
  }

  // ===== USER PROFILES =====
  
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .textSearch('display_name', query)
      .eq('is_public', true)
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data || [];
  }

  // ===== DIRECT MESSAGES =====

  async getConversations(): Promise<Conversation[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    // Get all direct messages grouped by conversation
    const { data, error } = await supabase
      .from('direct_messages')
      .select(`
        *,
        sender:user_profiles!direct_messages_sender_id_fkey(*),
        recipient:user_profiles!direct_messages_recipient_id_fkey(*)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Group messages into conversations
    const conversations = new Map<string, Conversation>();
    
    data?.forEach((message) => {
      const otherUserId = message.sender_id === userId ? message.recipient_id : message.sender_id;
      const conversationId = [userId, otherUserId].sort().join('-');
      
      if (!conversations.has(conversationId)) {
        conversations.set(conversationId, {
          id: conversationId,
          other_user_id: otherUserId,
          other_user: message.sender_id === userId ? message.recipient : message.sender,
          last_message: message,
          unread_count: 0, // TODO: Implement unread count
          updated_at: message.created_at
        });
      }
    });

    return Array.from(conversations.values());
  }

  async getDirectMessages(otherUserId: string, limit = 50): Promise<DirectMessage[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('direct_messages')
      .select(`
        *,
        sender:user_profiles!direct_messages_sender_id_fkey(*),
        recipient:user_profiles!direct_messages_recipient_id_fkey(*)
      `)
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching direct messages:', error);
      return [];
    }

    return (data || []).reverse();
  }

  async sendDirectMessage(recipientId: string, body: string, fileUrl?: string, fileName?: string, fileSize?: number): Promise<DirectMessage | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: userId,
        recipient_id: recipientId,
        body,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize
      })
      .select(`
        *,
        sender:user_profiles!direct_messages_sender_id_fkey(*),
        recipient:user_profiles!direct_messages_recipient_id_fkey(*)
      `)
      .single();

    if (error) {
      console.error('Error sending direct message:', error);
      return null;
    }

    return data;
  }

  // ===== MESSAGE THREADING =====

  async getThreadReplyCount(messageId: number): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('message_threads')
        .select('reply_count')
        .eq('parent_message_id', messageId)
        .eq('parent_type', 'channel')
        .single();

      if (error) {
        // If table doesn't exist or no rows found, return 0
        if (error.code === 'PGRST116' || error.code === '406') {
          return 0;
        }
        console.error('Error getting thread reply count:', error);
        return 0;
      }

      return data?.reply_count || 0;
    } catch (error) {
      console.error('Exception getting thread reply count:', error);
      return 0;
    }
  }

  async updateThreadReplyCount(messageId: number, increment: boolean = true): Promise<void> {
    // First, try to get existing thread record
    const { data: existingThread } = await supabase
      .from('message_threads')
      .select('id, reply_count')
      .eq('parent_message_id', messageId)
      .eq('parent_type', 'channel')
      .single();

    if (existingThread) {
      // Update existing thread
      const newCount = increment ? existingThread.reply_count + 1 : Math.max(0, existingThread.reply_count - 1);
      await supabase
        .from('message_threads')
        .update({ 
          reply_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingThread.id);
    } else if (increment) {
      // Create new thread record
      await supabase
        .from('message_threads')
        .insert({
          parent_message_id: messageId,
          parent_type: 'channel',
          reply_count: 1,
          thread_title: `Thread for message ${messageId}`
        });
    }
  }

  async getThreadReplies(messageId: number): Promise<Message[]> {
    // This would need to be implemented based on your message structure
    // For now, we'll return an empty array as the actual implementation
    // would depend on how you store thread replies
    return [];
  }

  // ===== MESSAGE PINNING =====

  async pinMessage(messageId: number, messageType: 'channel' | 'dm'): Promise<PinnedMessage | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('pinned_messages')
      .insert({
        message_id: messageId,
        message_type: messageType,
        pinned_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error pinning message:', error);
      return null;
    }

    return data;
  }

  async unpinMessage(messageId: number, messageType: 'channel' | 'dm'): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('pinned_messages')
      .delete()
      .eq('message_id', messageId)
      .eq('message_type', messageType)
      .eq('pinned_by', userId);

    if (error) {
      console.error('Error unpinning message:', error);
      return false;
    }

    return true;
  }

  async getPinnedMessages(channelId?: string): Promise<PinnedMessage[]> {
    const { data, error } = await supabase
      .from('pinned_messages')
      .select(`
        *,
        message:direct_messages(*),
        pinned_by_user:user_profiles!pinned_messages_pinned_by_fkey(*)
      `)
      .eq('message_type', channelId ? 'channel' : 'dm')
      .order('pinned_at', { ascending: false });

    if (error) {
      console.error('Error fetching pinned messages:', error);
      return [];
    }

    return data || [];
  }

  // ===== TYPING INDICATORS =====

  async setTypingIndicator(channelId?: string, dmRecipientId?: string, isTyping: boolean = true): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    if (isTyping) {
      // Insert or update typing indicator
      await supabase
        .from('typing_indicators')
        .upsert({
          user_id: userId,
          channel_id: channelId,
          dm_recipient_id: dmRecipientId,
          is_typing: true,
          started_at: new Date().toISOString()
        });
    } else {
      // Remove typing indicator
      await supabase
        .from('typing_indicators')
        .delete()
        .eq('user_id', userId)
        .eq('channel_id', channelId || null)
        .eq('dm_recipient_id', dmRecipientId || null);
    }
  }

  async getTypingIndicators(channelId?: string, dmRecipientId?: string): Promise<TypingIndicator[]> {
    const { data, error } = await supabase
      .from('typing_indicators')
      .select(`
        *,
        user:user_profiles!typing_indicators_user_id_fkey(*)
      `)
      .eq('is_typing', true)
      .eq('channel_id', channelId || null)
      .eq('dm_recipient_id', dmRecipientId || null)
      .gte('started_at', new Date(Date.now() - 30 * 1000).toISOString()); // Last 30 seconds

    if (error) {
      console.error('Error fetching typing indicators:', error);
      return [];
    }

    return data || [];
  }

  // ===== MESSAGE SEARCH =====

  async searchMessages(query: string, channelId?: string, limit = 20): Promise<SearchResult[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    console.log('🔍 Starting search with query:', query, 'channelId:', channelId, 'userId:', userId);

    // Search in channel messages
    let channelResults: any[] = [];
    if (channelId) {
      try {
        console.log('🔍 Searching channel messages with ILIKE...');
        // Use ILIKE search for reliable partial text matching
        const { data: channelData, error: ilikeError } = await supabase
          .from('messages')
          .select(`
            id,
            body,
            created_at,
            user_id
          `)
          .eq('channel_id', channelId)
          .filter('body', 'ilike', `%${query}%`)
          .limit(limit);

        console.log('🔍 Channel search result:', { data: channelData, error: ilikeError });

        if (ilikeError) {
          console.error('Error searching channel messages:', ilikeError);
        } else {
                         channelResults = (channelData || []).map((msg: any) => ({
                 type: 'message' as const,
                 id: msg.id,
                 title: `User ${msg.user_id?.slice(0, 8)}...`,
                 content: msg.body || '',
                 created_at: msg.created_at,
                 url: `/community-lounge?channel=${channelId}&message=${msg.id}`,
                 relevance_score: 0.8
               }));
        }
      } catch (error) {
        console.error('Error searching channel messages:', error);
      }
    }

    console.log('🔍 Channel results:', channelResults);

    // Search in direct messages
    let dmResults: any[] = [];
    try {
      console.log('🔍 Searching direct messages with ILIKE...');
              const { data: dmData, error: dmIlikeError } = await supabase
          .from('direct_messages')
          .select(`
            id,
            body,
            created_at,
            sender_id,
            recipient_id
          `)
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .filter('body', 'ilike', `%${query}%`)
          .limit(limit);

      console.log('🔍 DM search result:', { data: dmData, error: dmIlikeError });

      if (dmIlikeError) {
        console.error('Error searching direct messages:', dmIlikeError);
      } else {
                       dmResults = (dmData || []).map((msg: any) => ({
                 type: 'message' as const,
                 id: msg.id,
                 title: msg.sender_id === userId ? `User ${msg.recipient_id?.slice(0, 8)}...` : `User ${msg.sender_id?.slice(0, 8)}...`,
                 content: msg.body || '',
                 created_at: msg.created_at,
                 url: `/direct-messages?message=${msg.id}`,
                 relevance_score: 0.8
               }));
      }
    } catch (error) {
      console.error('Error searching direct messages:', error);
    }

    console.log('🔍 DM results:', dmResults);

    // Combine and sort results
    const allResults = [...channelResults, ...dmResults];
    console.log('🔍 Final combined results:', allResults);
    
    return allResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // ===== USER CONNECTIONS =====

  async followUser(userIdToFollow: string): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_connections')
      .insert({
        follower_id: userId,
        following_id: userIdToFollow
      });

    if (error) {
      console.error('Error following user:', error);
      return false;
    }

    return true;
  }

  async unfollowUser(userIdToUnfollow: string): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_connections')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', userIdToUnfollow);

    if (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }

    return true;
  }

  // ===== MESSAGE BOOKMARKS =====

  async bookmarkMessage(messageId: number, messageType: 'channel' | 'dm', note?: string): Promise<MessageBookmark | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('message_bookmarks')
      .insert({
        user_id: userId,
        message_id: messageId,
        message_type: messageType,
        bookmark_note: note
      })
      .select()
      .single();

    if (error) {
      console.error('Error bookmarking message:', error);
      return null;
    }

    return data;
  }

  async getBookmarks(): Promise<MessageBookmark[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('message_bookmarks')
      .select(`
        *,
        message:direct_messages(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }

    return data || [];
  }

  // ===== REAL-TIME SUBSCRIPTIONS =====

  subscribeToDirectMessages(recipientId: string, callback: (message: DirectMessage) => void): any {
    const { data: userData } = supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) throw new Error('User not authenticated');

    const channelKey = `dm:${userId}:${recipientId}`;
    
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
          table: 'direct_messages',
          filter: `sender_id=eq.${recipientId} AND recipient_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as DirectMessage);
        }
      )
      .subscribe();

    this.realtimeChannels.set(channelKey, channel);
    return channel;
  }

  subscribeToTypingIndicators(channelId?: string, dmRecipientId?: string, callback: (typing: TypingIndicator[]) => void): any {
    const channelKey = `typing:${channelId || dmRecipientId}`;
    
    // Unsubscribe if already subscribed
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
          table: 'typing_indicators',
          filter: `channel_id=eq.${channelId || null} AND dm_recipient_id=eq.${dmRecipientId || null}`
        },
        async () => {
          // Fetch current typing indicators
          const typing = await this.getTypingIndicators(channelId, dmRecipientId);
          callback(typing);
        }
      )
      .subscribe();

    this.realtimeChannels.set(channelKey, channel);
    return channel;
  }

  unsubscribeAll(): void {
    this.realtimeChannels.forEach(channel => channel.unsubscribe());
    this.realtimeChannels.clear();
  }
}

export const advancedChatService = AdvancedChatService.getInstance();

