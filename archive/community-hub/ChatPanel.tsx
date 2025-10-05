import React, { useEffect, useState, useRef } from 'react';
import { fetchMessages, postMessage } from '../../../services/slackService';

interface ChatPanelProps {
  channelId: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ channelId }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const pollRef = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    if (!channelId) return;
    setLoading(true);
    try {
      const data = await fetchMessages(channelId);
      if (!data?.ok) {
        setError(data?.error || 'Failed to load messages');
        setMessages([]);
      } else {
        setError(null);
        setMessages(data.messages || []);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
      // Scroll to bottom after load
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      });
    }
  };

  useEffect(() => {
    load();
    // Poll every 8 seconds for now
    pollRef.current = window.setInterval(load, 8000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setSending(true);
    try {
      const res = await postMessage(channelId, text);
      if (res?.ok) {
        setInputText('');
        await load();
      } else {
        alert(res?.error || 'Failed to send');
      }
    } catch (e) {
      alert('Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[420px]">
      <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3" ref={listRef}>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading…</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">No messages yet</div>
        ) : (
          <div className="space-y-2">
            {messages
              .slice()
              .reverse()
              .map((m: any) => (
                <div key={m.ts} className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">{m.user || 'Unknown'}</span>{' '}
                      <span className="text-xs text-gray-500 ml-2">
                        {m.ts ? new Date(parseFloat(m.ts) * 1000).toLocaleString() : ''}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{m.text}</div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={handleSend}
          disabled={sending || !inputText.trim()}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;





