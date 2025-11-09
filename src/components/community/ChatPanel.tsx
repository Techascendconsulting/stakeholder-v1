import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageSquare, AlertCircle } from 'lucide-react';
import { slackService } from '../../services/slackService';

interface Message {
  id: string;
  user_display: string;
  text: string;
  ts: string;
}

interface ChatPanelProps {
  channelId: string | null;
  canPost: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ channelId, canPost }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (channelId) {
      loadMessages();
      startPolling();
    } else {
      setLoading(false);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [channelId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!channelId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await slackService.fetchMessages(channelId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    pollRef.current = window.setInterval(() => {
      loadMessages();
    }, 8000); // Poll every 8 seconds
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !channelId || !canPost) return;

    try {
      setSending(true);
      await slackService.postMessage(channelId, inputText.trim());
      setInputText('');
      // Reload messages to show the new one
      setTimeout(loadMessages, 500);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // No channel ID
  if (!channelId) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No chat channel yet</p>
        </div>
      </div>
    );
  }

  // Missing token or configuration
  const hasToken = import.meta.env.VITE_SLACK_BOT_TOKEN;
  if (!hasToken) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Chat unavailable</p>
          <p className="text-sm text-gray-500">Slack not configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMessages}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.user_display}`} />
                <AvatarFallback>
                  {message.user_display.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm">{message.user_display}</span>
                  <span className="text-xs text-gray-500">{formatTime(message.ts)}</span>
                </div>
                <p className="text-gray-900">{message.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {canPost && (
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || sending}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;


















