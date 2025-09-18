import { useEffect, useState } from 'react';
import slackService from '@/services/slackService';

export interface ChatMessage {
  ts: string;
  text: string;
  userName: string;
  userAvatar: string;
  time: string;
  reactions?: { name: string; count: number }[];
}

export function useSlackChat(channelId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMessages() {
    if (!channelId) return;
    try {
      setLoading(true);
      const raw = await slackService.fetchMessages(channelId);
      const msgs: ChatMessage[] = (raw || []).map((m: any) => ({
        ts: m.ts,
        text: m.text,
        userName: m.user_profile?.real_name || m.user || 'Unknown',
        userAvatar: m.user_profile?.image_48 || 'https://placehold.co/40x40',
        time: new Date(parseFloat(m.ts) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: (m.reactions || []).map((r: any) => ({ name: r.name, count: r.count })),
      }));
      setMessages(msgs.reverse());
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(text: string) {
    if (!channelId || !text.trim()) return;
    try {
      await slackService.postMessage(channelId, text);
      await loadMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }

  useEffect(() => {
    if (!channelId) return;
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  return { messages, loading, sendMessage };
}


