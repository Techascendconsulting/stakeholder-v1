import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import slackService, { updateMessage as svcUpdateMessage, deleteMessage as svcDeleteMessage, addReaction as svcAddReaction, removeReaction as svcRemoveReaction } from '@/services/slackService';

export interface ChatMessage {
  ts: string;
  text: string;
  userName: string;
  userAvatar: string;
  time: string;
  reactions?: { name: string; count: number; users?: string[] }[];
  userId?: string;
  userEmail?: string;
  isOwn?: boolean;
}

export function useSlackChat(channelId: string | null, currentUserSlackId?: string | null, currentUserEmail?: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const computeIsOwn = useCallback((msgUserId?: string, msgEmail?: string) => {
    if (currentUserSlackId && msgUserId) return msgUserId === currentUserSlackId;
    if (currentUserEmail && msgEmail) return msgEmail.toLowerCase() === currentUserEmail.toLowerCase();
    return false;
  }, [currentUserSlackId, currentUserEmail]);

  const loadMessages = useCallback(async () => {
    if (!channelId) {
      setLoading(false);
      return;
    }
    try {
      // Debug: start fetch
      console.log('[useSlackChat] loadMessages:start', { channelId });
      if (!hasLoadedRef.current) {
        setLoading(true);
      }
      const raw = await slackService.fetchMessages(channelId);
      const msgs: ChatMessage[] = (raw || []).map((m: any) => {
        const userId = m.user || m.user_id || undefined;
        const userEmail = m.user_profile?.email || m.user_email || undefined;
        return {
          ts: m.ts,
          text: m.text,
          userName: m.user_profile?.real_name || m.user || 'Unknown',
          userAvatar: m.user_profile?.image_48 || 'https://placehold.co/40x40',
          time: new Date(parseFloat(m.ts) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: (m.reactions || []).map((r: any) => ({ name: r.name, count: r.count, users: r.users })),
          userId,
          userEmail,
          isOwn: computeIsOwn(userId, userEmail),
        } as ChatMessage;
      });
      setMessages(msgs.reverse());
      console.log('[useSlackChat] loadMessages:done', { count: msgs.length });
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      if (!hasLoadedRef.current) {
        setLoading(false);
        hasLoadedRef.current = true;
      }
    }
  }, [channelId, computeIsOwn]);

  async function sendMessage(text: string) {
    if (!channelId || !text.trim()) return;
    try {
      console.log('[useSlackChat] sendMessage', { channelId, text });
      await slackService.postMessage(channelId, text);
      await loadMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }

  const editMessage = useCallback(async (ts: string, newText: string) => {
    if (!channelId) return;
    await svcUpdateMessage(channelId, ts, newText);
    await loadMessages();
  }, [channelId, loadMessages]);

  const deleteMessage = useCallback(async (ts: string) => {
    if (!channelId) return;
    await svcDeleteMessage(channelId, ts);
    await loadMessages();
  }, [channelId, loadMessages]);

  const addReaction = useCallback(async (ts: string, emoji: string) => {
    if (!channelId) return;
    await svcAddReaction(channelId, ts, emoji);
    await loadMessages();
  }, [channelId, loadMessages]);

  const removeReaction = useCallback(async (ts: string, emoji: string) => {
    if (!channelId) return;
    await svcRemoveReaction(channelId, ts, emoji);
    await loadMessages();
  }, [channelId, loadMessages]);

  useEffect(() => {
    if (!channelId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, loadMessages]);

  return { messages, loading, sendMessage, editMessage, deleteMessage, addReaction, removeReaction };
}


