import React, { useState, useEffect, useRef } from 'react';
import { UserAvatar } from '../Common/UserAvatar';
import { communityLoungeService } from '../../lib/communityLoungeService';
import { advancedChatService } from '../../lib/advancedChatService';
import RichTextEditor from './RichTextEditor';
import { 
  Hash, 
  Plus, 
  Users, 
  Bell, 
  Paperclip,
  Image as ImageIcon, 
  Send, 
  Download, 
  FileText, 
  Smile, 
  MessageSquare, 
  MoreHorizontal,
  Loader2,
  AlertCircle,
  Settings,
  Search,
  X,
  Lock,
  ChevronDown,
  Pin,
  Reply,
  Bold,
  Italic,
  Type,
  Link,
  List,
  ListOrdered,
  Code,
  AtSign,
  Edit,
  Copy,
  Trash2,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  type Message, 
  type Channel, 
  type Space,
  type UserPresence 
} from '../../lib/communityLoungeService';
import { supabase } from '../../lib/communityLoungeService';
const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'chat-attachments';
import type { PinnedMessage, TypingIndicator, SearchResult } from '../../types/chat';
import { seedCommunityLounge } from '../../lib/communityLoungeSeed';
import { setupTestUser } from '../../lib/setupTestUser';
import { ensureTestUserAuthenticated, ensureTestUser2Authenticated, ensureAdminAuthenticated } from '../../lib/testAuth';
import LoginForm from './LoginForm';

const CommunityLoungeView: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPeople, setShowPeople] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThreadFile, setSelectedThreadFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [emojiPickerMessageId, setEmojiPickerMessageId] = useState<number | null>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [threadReplies, setThreadReplies] = useState<Message[]>([]);
  const [messageReplyCounts, setMessageReplyCounts] = useState<Record<number, number>>({});
  const [reactionPickerForId, setReactionPickerForId] = useState<number | null>(null);
  const addReaction = (messageId: number, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const existing = (m.reactions || []).find(r => r.emoji === emoji);
      if (existing) {
        return {
          ...m,
          reactions: (m.reactions || []).map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r)
        };
      }
      return { ...m, reactions: [ ...(m.reactions || []), { emoji, count: 1, users: [user?.id || 'me'] } ] };
    }));
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupStatus, setSetupStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [showQuoteActions, setShowQuoteActions] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [editMessageContent, setEditMessageContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [showThreadScrollButton, setShowThreadScrollButton] = useState(false);
  const [threadPanelHeight, setThreadPanelHeight] = useState('h-96'); // Start with short height
  const [showDMSection, setShowDMSection] = useState(true);
  const [dmChannels, setDmChannels] = useState<Channel[]>([]);
  const [showNewDM, setShowNewDM] = useState(false);
  const [dmSearchQuery, setDmSearchQuery] = useState('');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const threadFileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const threadPanelRef = useRef<HTMLDivElement>(null);
  const threadRepliesEndRef = useRef<HTMLDivElement>(null);

  // Emojis for reactions
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🙏', '🔥', '💯', '✨', '🎉', '🤔', '👀', '💪', '🚀', '💡', '🎯', '⭐', '💎'];

  // Motivational quotes
  const motivationalQuotes = [
    {
      text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
      author: "Steve Jobs",
      emoji: "💪"
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      emoji: "🚀"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      emoji: "✨"
    },
    {
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
      emoji: "⏰"
    },
    {
      text: "The only limit to our realization of tomorrow is our doubts of today.",
      author: "Franklin D. Roosevelt",
      emoji: "🌟"
    }
  ];

  // Cohort data
  const cohortData = {
    'admin@batraining.com': { type: 'Pro', color: 'from-purple-500 to-pink-600', badge: '👑' },
    'user1@example.com': { type: 'Premium', color: 'from-blue-500 to-indigo-600', badge: '⭐' },
    'user2@example.com': { type: 'Free', color: 'from-gray-400 to-gray-600', badge: '📚' }
  };

  // Date grouping helper
  const getDateGroup = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const diffTime = Math.abs(today.getTime() - messageDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        return messageDate.toLocaleDateString('en-US', { weekday: 'long' });
      } else {
        return messageDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric',
          year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom of thread replies
  const scrollToThreadBottom = () => {
    threadRepliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Render helpers
  const startDirectMessage = (handle: string) => {
    // Switch to Direct Messages view and pass recipient info
    // This will be handled by the AppContext to switch views
    console.log('🚀 Starting DM with:', handle);
    // For now, we'll use a simple approach - in a real app this would use AppContext
    alert(`Starting DM with @${handle} - this would switch to Direct Messages view`);
  };

  const renderWithMentions = (text?: string) => {
    if (!text) return null;
    const parts: Array<string | JSX.Element> = [];
    const mentionRegex = /@([A-Za-z0-9_.-]+)/g; // simple handle-style mention
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = mentionRegex.exec(text)) !== null) {
      const [full, handle] = match;
      const start = match.index;
      if (start > lastIndex) parts.push(text.slice(lastIndex, start));
      parts.push(
        <button
          key={`${handle}-${start}`}
          className="text-blue-600 hover:underline cursor-pointer"
          onClick={() => startDirectMessage(handle)}
          aria-label={`View ${handle}`}
        >
          @{handle}
        </button>
      );
      lastIndex = start + full.length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return <>{parts}</>;
  };

  // Edit, Copy, Delete functions
  const handleEditMessage = (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessageId(messageId);
      setEditMessageContent(message.body || '');
      setShowMoreMenu(null);
    }
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editMessageContent.trim()) {
      setMessages(prev => prev.map(m => 
        m.id === editingMessageId 
          ? { ...m, body: editMessageContent.trim(), updated_at: new Date().toISOString() }
          : m
      ));
      setEditingMessageId(null);
      setEditMessageContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditMessageContent('');
  };

  const handleCopyMessage = (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message?.body) {
      navigator.clipboard.writeText(message.body);
      setShowMoreMenu(null);
      // Show a brief success indicator
      console.log('✅ Message copied to clipboard');
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setShowMoreMenu(null);
      console.log('🗑️ Message deleted');
    }
  };

  // Upload helper
  const uploadFileToStorage = async (file: File, prefix: string): Promise<{ file_url?: string; file_name?: string; file_size?: number; error?: string }> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
        upsert: false,
        contentType: file.type || undefined,
      });
      if (error) return { error: error.message };
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
      return { file_url: urlData.publicUrl, file_name: file.name, file_size: file.size };
    } catch (err: any) {
      return { error: err?.message || 'Upload failed' };
    }
  };

  // Sample data for testing - only load if no messages exist
  useEffect(() => {
    // Check if we already have messages (persisted in localStorage)
    const savedMessages = localStorage.getItem('communityLoungeMessages');
    const savedChannels = localStorage.getItem('communityLoungeChannels');
    
    if (savedMessages && savedChannels) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        const parsedChannels = JSON.parse(savedChannels);
        
        setMessages(parsedMessages);
        setChannels(parsedChannels);
        setSelectedChannel(parsedChannels[0]);
        
        // Calculate reply counts from saved messages
        const replyCounts: Record<number, number> = {};
        parsedMessages.forEach((message: Message) => {
          const replies = parsedMessages.filter((msg: Message) => msg.replied_to_id === message.id);
          if (replies.length > 0) {
            replyCounts[message.id] = replies.length;
          }
        });
        setMessageReplyCounts(replyCounts);
        
        console.log('📱 Loaded saved messages from localStorage');
      } catch (error) {
        console.error('❌ Error loading saved messages:', error);
        // Fall back to sample data if loading fails
        loadSampleData();
      }
    } else {
      // Only load sample data if no saved data exists
      loadSampleData();
    }
    
    setIsLoading(false);
  }, []);

  const loadSampleData = () => {
    const sampleChannels: Channel[] = [
      {
        id: '1',
        space_id: '1',
        name: 'general',
        description: 'General discussion',
        is_private: false,
        is_staff_only: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        space_id: '1',
        name: 'random',
        description: 'Random chat',
        is_private: false,
        is_staff_only: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const sampleMessages: Message[] = [
      {
        id: 1,
        channel_id: '1',
        user_id: '1',
        body: 'Hello everyone! Welcome to the BA Community! 👋',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          email: 'admin@batraining.com',
          display_name: 'Admin'
        },
        reactions: [
          { emoji: '👋', count: 3, users: ['1', '2', '3'] },
          { emoji: '🎉', count: 1, users: ['2'] }
        ]
      },
      {
        id: 2,
        channel_id: '1',
        user_id: '2',
        body: 'Thanks for having us! Looking forward to learning together.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          email: 'user1@example.com',
          display_name: 'Sarah'
        }
      }
    ];

    setChannels(sampleChannels);
    setMessages(sampleMessages);
    setSelectedChannel(sampleChannels[0]);
    
    // Calculate actual reply counts from messages
    const replyCounts: Record<number, number> = {};
    sampleMessages.forEach(message => {
      const replies = sampleMessages.filter(msg => msg.replied_to_id === message.id);
      if (replies.length > 0) {
        replyCounts[message.id] = replies.length;
      }
    });
    setMessageReplyCounts(replyCounts);
    
    // Save sample data to localStorage
    localStorage.setItem('communityLoungeMessages', JSON.stringify(sampleMessages));
    localStorage.setItem('communityLoungeChannels', JSON.stringify(sampleChannels));
    
    console.log('📱 Loaded sample data and saved to localStorage');
  };

  // Quote rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 30000); // Rotate every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Reset sending state when component mounts or user changes
  useEffect(() => {
    setIsSendingMessage(false);
  }, [user?.id]);

  // Emergency reset - if sending state is stuck for more than 5 seconds, reset it
  useEffect(() => {
    if (isSendingMessage) {
      const emergencyTimeout = setTimeout(() => {
        console.log('🚨 Emergency reset of sending state');
        setIsSendingMessage(false);
      }, 5000);
      
      return () => clearTimeout(emergencyTimeout);
    }
  }, [isSendingMessage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll to bottom when thread replies change
  useEffect(() => {
    if (threadReplies.length > 0) {
      scrollToThreadBottom();
    }
  }, [threadReplies]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('communityLoungeMessages', JSON.stringify(messages));
      console.log('💾 Messages saved to localStorage');
    }
  }, [messages]);

  // Persist channels to localStorage whenever they change
  useEffect(() => {
    if (channels.length > 0) {
      localStorage.setItem('communityLoungeChannels', JSON.stringify(channels));
      console.log('💾 Channels saved to localStorage');
    }
  }, [channels]);

  // Load thread replies when replyingToMessage changes
  useEffect(() => {
    if (replyingToMessage) {
      const threadMessages = messages.filter(msg => msg.replied_to_id === replyingToMessage.id);
      setThreadReplies(threadMessages);
      
      // Calculate dynamic height based on number of replies
      const replyCount = threadMessages.length;
      let newHeight = 'h-96'; // Default short height
      
      if (replyCount === 0) {
        newHeight = 'h-96'; // Short height for no replies
      } else if (replyCount <= 3) {
        newHeight = 'h-[500px]'; // Medium height for 1-3 replies
      } else if (replyCount <= 8) {
        newHeight = 'h-[600px]'; // Larger height for 4-8 replies
      } else {
        newHeight = 'h-screen'; // Full height for many replies
      }
      
      setThreadPanelHeight(newHeight);
      console.log('🧵 Loaded thread replies for message:', replyingToMessage.id, 'Count:', replyCount, 'Height:', newHeight);
    } else {
      setThreadReplies([]);
      setThreadPanelHeight('h-96');
    }
  }, [replyingToMessage, messages]);

  // Update thread panel height when thread replies change
  useEffect(() => {
    if (replyingToMessage && threadReplies.length > 0) {
      const replyCount = threadReplies.length;
      
      // Check if any replies have images
      const hasImages = threadReplies.some(reply => 
        reply.file_url && /(png|jpe?g|gif|webp|bmp|svg)$/i.test(reply.file_name || '')
      );
      
      let newHeight = 'h-96';
      
      if (hasImages) {
        // If there are images, use larger height to accommodate them
        if (replyCount <= 2) {
          newHeight = 'h-[600px]';
        } else if (replyCount <= 5) {
          newHeight = 'h-[700px]';
        } else {
          newHeight = 'h-screen';
        }
      } else {
        // Text-only replies can use smaller height
        if (replyCount <= 3) {
          newHeight = 'h-[500px]';
        } else if (replyCount <= 8) {
          newHeight = 'h-[600px]';
        } else {
          newHeight = 'h-screen';
        }
      }
      
      if (newHeight !== threadPanelHeight) {
        setThreadPanelHeight(newHeight);
        console.log('📏 Updated thread panel height to:', newHeight, 'for', replyCount, 'replies', hasImages ? 'with images' : 'text only');
      }
    }
  }, [threadReplies.length, replyingToMessage, threadPanelHeight]);

  // Close thread panel on outside click and ESC key
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (replyingToMessage && !threadPanelRef.current?.contains(e.target as Node)) {
        setReplyingToMessage(null);
      }
      if (showMoreMenu && !(e.target as Element)?.closest('.message-container')) {
        setShowMoreMenu(null);
      }
      if (reactionPickerForId && !(e.target as Element)?.closest('.reaction-picker')) {
        setReactionPickerForId(null);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHoveredMessageId(null);
        setShowMoreMenu(null);
        setReactionPickerForId(null);
        setReplyingToMessage(null);
        setSelectedImage(null);
        if (hoverTimeout) clearTimeout(hoverTimeout);
      }
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [replyingToMessage, showMoreMenu, reactionPickerForId, hoverTimeout]);

  const handleSendMessage = async (content: string, html: string, overrideFile?: File) => {
    console.log('🚀 handleSendMessage called with:', { content, html, selectedChannel });
    
    // Prevent duplicate sends
    if (isSendingMessage) {
      console.log('⚠️ Message already being sent, ignoring duplicate call');
      return;
    }
    
    const fileToSend = overrideFile ?? selectedFile ?? null;
    // Allow sending if there is either text content or an attachment queued
    if (!selectedChannel || (!content.trim() && !fileToSend)) {
      console.log('❌ Message not sent - missing content or channel');
      return;
    }
    
    setIsSendingMessage(true);
    
    // Safety timeout to reset sending state if it gets stuck
    const timeoutId = setTimeout(() => {
      console.log('⚠️ Sending timeout reached, resetting state');
      setIsSendingMessage(false);
    }, 10000); // 10 second timeout
    let attachment: { file_url?: string; file_name?: string; file_size?: number } | undefined;
    try {
      if (fileToSend) {
        const uploaded = await uploadFileToStorage(fileToSend, `channels/${selectedChannel.id}`);
        if (uploaded.error) {
          console.error('Attachment upload failed:', uploaded.error);
          // If only an attachment was being sent, abort instead of sending empty message
          if (!content.trim()) {
            setIsSendingMessage(false);
            return;
          }
        } else {
          attachment = uploaded;
        }
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error processing attachment:', error);
      setIsSendingMessage(false);
      return;
    }

    const newMessage: Message = {
          id: Date.now() + Math.random(),
      channel_id: selectedChannel.id,
          user_id: user?.id || '1',
      body: content,
      file_url: attachment?.file_url,
      file_name: attachment?.file_name,
      file_size: attachment?.file_size,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: {
        email: user?.email || 'user@example.com',
        display_name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'
      }
    };

    console.log('📝 New message created:', newMessage);
    setMessages(prevMessages => {
      // Check for duplicate messages (same content, same user, within 5 seconds)
      const recentMessage = prevMessages.find(msg => 
        msg.body === newMessage.body && 
        msg.user_id === newMessage.user_id &&
        Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 5000
      );
      
      if (recentMessage) {
        console.log('⚠️ Duplicate message detected, not adding:', newMessage);
        clearTimeout(timeoutId);
        setIsSendingMessage(false);
        return prevMessages;
      }
      
      const updatedMessages = [...prevMessages, newMessage];
      console.log('📊 Updated messages array:', updatedMessages);
      clearTimeout(timeoutId);
      setIsSendingMessage(false);
      // Scroll to bottom after message is added
      setTimeout(() => scrollToBottom(), 100);
      return updatedMessages;
    });
    setNewMessage('');
    console.log('✅ Message sent successfully');
  };

  const handleSendThreadReply = async (content: string, html: string, overrideFile?: File) => {
    console.log('🧵 handleSendThreadReply called with:', { content, html, replyingToMessage });
    
    const fileToSend = overrideFile ?? selectedThreadFile ?? null;
    // Allow sending if there is either text content or a thread attachment queued
    if (!replyingToMessage || (!content.trim() && !fileToSend)) {
      console.log('❌ Thread reply not sent - missing content or reply message');
      return;
    }

    let attachment: { file_url?: string; file_name?: string; file_size?: number } | undefined;
    if (fileToSend) {
      const uploaded = await uploadFileToStorage(fileToSend, `threads/${replyingToMessage.id}`);
      if (uploaded.error) {
        console.error('Thread attachment upload failed:', uploaded.error);
      } else {
        attachment = uploaded;
      }
      setSelectedThreadFile(null);
    }

    const newReply: Message = {
      id: Date.now(),
      channel_id: replyingToMessage.channel_id,
      user_id: user?.id || '1',
      body: content,
      replied_to_id: replyingToMessage.id,
      file_url: attachment?.file_url,
      file_name: attachment?.file_name,
      file_size: attachment?.file_size,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        email: user?.email || 'user@example.com',
        display_name: user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'
      }
    };

    console.log('📝 New thread reply created:', newReply);
    setThreadReplies(prevReplies => {
      const updatedReplies = [...prevReplies, newReply];
      console.log('📊 Updated thread replies array:', updatedReplies);
      return updatedReplies;
    });
    
    // Update reply count for the original message
    setMessageReplyCounts(prevCounts => ({
      ...prevCounts,
      [replyingToMessage.id]: (prevCounts[replyingToMessage.id] || 0) + 1
    }));
    
    setNewMessage('');
    console.log('✅ Thread reply sent successfully');
  };

  const handleCreateChannel = (name: string) => {
    if (!name.trim()) return;

    const newChannel: Channel = {
      id: Date.now().toString(),
      space_id: selectedSpace?.id || '1',
      name: name.trim(),
      description: '',
          is_private: false,
          is_staff_only: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
    setChannels([...channels, newChannel]);
        setNewChannelName('');
        setShowAddChannel(false);
  };

    return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex relative">
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">BA Community</h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Channel Inline - At Top */}
        {showAddChannel && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Channel name"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newChannelName.trim()) {
                    handleCreateChannel(newChannelName);
                  }
                }}
                autoFocus
              />
            <button
                onClick={() => {
                  if (newChannelName.trim()) {
                    handleCreateChannel(newChannelName);
                  }
                }}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
            </button>
            <button 
                onClick={() => {
                  setShowAddChannel(false);
                  setNewChannelName('');
                }}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
            </button>
          </div>
        </div>
        )}

        {/* Channel Search */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search channels..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"
              value={channelSearchQuery}
              onChange={(e) => setChannelSearchQuery(e.target.value)}
            />
            {channelSearchQuery && (
              <button
                onClick={() => setChannelSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Channels List - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channels</h3>
                <button 
                  onClick={() => setShowAddChannel(!showAddChannel)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full flex items-center space-x-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                    selectedChannel?.id === channel.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                    <Hash className="w-4 h-4" />
                    <span className="truncate">{channel.name}</span>
                </button>
              ))}
              </div>
            </div>
          </div>

                    {/* Direct Messages Section - Fixed at Bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Direct Messages</h3>
                <button 
                  onClick={() => setShowNewDM(!showNewDM)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* New DM Input */}
              {showNewDM && (
                <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      value={dmSearchQuery}
                      onChange={(e) => setDmSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {dmSearchQuery && (
                    <div className="mt-2 space-y-1">
                      {['admin@batraining.com', 'user1@example.com', 'user2@example.com'].filter(email => 
                        email.toLowerCase().includes(dmSearchQuery.toLowerCase())
                      ).map((email) => (
                        <button
                          key={email}
                          onClick={() => {
                            // Create or open DM with this user
                            const dmChannel = dmChannels.find(dm => dm.name === email) || {
                              id: `dm-${email}`,
                              space_id: '1',
                              name: email,
                              description: `Direct message with ${email}`,
                              is_private: true,
                              is_staff_only: false,
                              created_at: new Date().toISOString(),
                              updated_at: new Date().toISOString()
                            };
                            setDmChannels(prev => prev.find(dm => dm.id === dmChannel.id) ? prev : [...prev, dmChannel]);
                            setSelectedChannel(dmChannel);
                            setShowNewDM(false);
                            setDmSearchQuery('');
                          }}
                          className="w-full flex items-center space-x-2 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                        >
                          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {email.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate">{email.split('@')[0]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DM Channels List */}
              <div className="space-y-1">
                {dmChannels.map((dm) => (
                  <button
                    key={dm.id}
                    onClick={() => setSelectedChannel(dm)}
                    className={`w-full flex items-center space-x-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                      selectedChannel?.id === dm.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold relative">
                      {dm.name.charAt(0).toUpperCase()}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
                    </div>
                    <span className="truncate">{dm.name.split('@')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3 flex-shrink-0">
              {selectedChannel?.id?.startsWith('dm-') ? (
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {selectedChannel.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <Hash className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedChannel?.name || 'Select a channel'}
            </h2>
          </div>
          
            <div className="flex items-center space-x-4 flex-1 ml-6">
              {/* Enhanced Search */}
              <div className="relative group flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  placeholder="Search messages, files, and more..."
                  className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim()) {
                      const filtered = messages.filter(message => 
                        message.body?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                        message.user?.display_name?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                        message.user?.email?.toLowerCase().includes(e.target.value.toLowerCase())
                      );
                      setSearchResults(filtered.map(msg => ({
                        id: msg.id,
                        type: 'message' as const,
                        title: msg.user?.display_name || msg.user?.email || 'User',
                        content: msg.body || '',
                        user: msg.user?.display_name || msg.user?.email || 'User',
                        timestamp: msg.created_at,
                        channel: selectedChannel?.name || '',
                        created_at: msg.created_at
                      })));
                      setShowSearchResults(true);
                    } else {
                      setShowSearchResults(false);
                      setSearchResults([]);
                    }
                  }}
                />
                {searchQuery && (
            <button 
                    onClick={() => {
                      setSearchQuery('');
                      // searchMessages('');
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <X size={16} />
            </button>
                )}
              </div>

              {/* Date Jump Dropdown */}
              <div className="relative">
            <button 
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span>{selectedDate ? selectedDate.toLocaleDateString() : 'Today'}</span>
                  <ChevronDown className="w-4 h-4" />
            </button>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>1</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          <div className="flex-1 overflow-y-auto">
          {/* Sticky Motivational Banner */}
          <div className="sticky top-0 z-10 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200 dark:border-green-700 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">{motivationalQuotes[currentQuoteIndex].emoji}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Today's Motivation
                  </div>
                  <div className="flex items-center space-x-2">
                <button 
                      onClick={() => setShowQuoteActions(!showQuoteActions)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                      <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
                <div className="text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed transition-all duration-500">
                  "{motivationalQuotes[currentQuoteIndex].text}" - {motivationalQuotes[currentQuoteIndex].author}
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Keep pushing forward, you've got this! 🚀
            </div>
          </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="p-3 space-y-1">

        {/* Messages */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500 mb-2">
              Total messages: {messages.filter(m => m.channel_id === selectedChannel?.id).length}
              {isSendingMessage && (
                <button 
                  onClick={() => {
                    console.log('🔄 Manual reset of sending state');
                    setIsSendingMessage(false);
                  }}
                  className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Reset Sending State
                </button>
              )}
            </div>
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
                  S
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sarah</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">is typing...</span>
                  </div>
                </div>
              </div>
            )}
            {messages.filter(message => message.channel_id === selectedChannel?.id).map((message) => (
              <div
                key={message.id}
                className={`group relative p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 message-container mb-3 ${
                  hoveredMessageId === message.id ? 'ring-2 ring-blue-500/20' : ''
                }`}
                onMouseEnter={() => {
                  const timeout = setTimeout(() => setHoveredMessageId(message.id), 150);
                  setHoverTimeout(timeout);
                }}
                onMouseLeave={() => {
                  if (hoverTimeout) clearTimeout(hoverTimeout);
                  setHoveredMessageId(null);
                  setHoverTimeout(null);
                }}
              >
                {/* Hover Bar */}
                {hoveredMessageId === message.id && (
                  <div className="absolute -top-8 right-0 flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1 z-10">
                    <button onClick={() => addReaction(message.id, '✅')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✅</button>
                    <button onClick={() => addReaction(message.id, '👀')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">👀</button>
                    <button onClick={() => addReaction(message.id, '✋')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✋</button>
                    <button onClick={() => setReactionPickerForId(prev => prev === message.id ? null : message.id)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">React</button>
                    <button 
                      onClick={() => {
                        console.log('🧵 Opening thread for reply to message:', message);
                        setReplyingToMessage(message);
                        setHoveredMessageId(null);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      Reply
                    </button>
                    <button 
                      onClick={() => setShowMoreMenu(message.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      More Options
                    </button>
                  </div>
                )}

                {/* Message Content */}
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md relative">
                      {message.user?.display_name?.charAt(0) || message.user?.email?.charAt(0) || 'U'}
                      {/* Online Status Indicator on Avatar */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></div>
                    </div>
                  </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-3">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {message.user?.display_name || message.user?.email?.split('@')[0] || 'User'}
                    </span>
                      {/* Cohort Badge */}
                      {message.user?.email && cohortData[message.user.email as keyof typeof cohortData] && (
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium bg-gradient-to-r ${cohortData[message.user.email as keyof typeof cohortData].color} text-white rounded-full shadow-sm`}>
                          <span>{cohortData[message.user.email as keyof typeof cohortData].badge}</span>
                          <span>{cohortData[message.user.email as keyof typeof cohortData].type}</span>
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                                         {editingMessageId === message.id ? (
                       <div className="mt-2">
                         <textarea
                           value={editMessageContent}
                           onChange={(e) => setEditMessageContent(e.target.value)}
                           className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                           rows={3}
                           autoFocus
                         />
                         <div className="mt-2 flex space-x-2">
                           <button
                             onClick={handleSaveEdit}
                             className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                           >
                             Save
                           </button>
                           <button
                             onClick={handleCancelEdit}
                             className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                           >
                             Cancel
                           </button>
                         </div>
                       </div>
                     ) : (
                                            <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                       {renderWithMentions(message.body)}
                     </div>
                     )}

                    {/* Attachment Preview */}
                  {message.file_url && (
                    <div className="mt-2">
                        {/(png|jpe?g|gif|webp|bmp|svg)$/i.test(message.file_name || '') ? (
                          <div className="relative">
                            {imageLoading[message.file_url] && (
                              <div className="max-h-56 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse flex items-center justify-center">
                                <div className="text-gray-500 text-sm">Loading image...</div>
                              </div>
                            )}
                            {imageError[message.file_url] ? (
                              <div className="max-h-56 w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center justify-center">
                                <div className="text-red-500 text-sm">Failed to load image</div>
                              </div>
                            ) : (
                              <img
                                src={message.file_url}
                                alt={message.file_name || 'attachment'}
                                className={`max-h-56 max-w-full rounded-md border border-gray-200 dark:border-gray-700 object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                                  imageLoading[message.file_url] ? 'hidden' : ''
                                }`}
                                onClick={() => setSelectedImage(message.file_url || null)}
                                onLoad={() => setImageLoading(prev => ({ ...prev, [message.file_url!]: false }))}
                                onError={() => {
                                  setImageLoading(prev => ({ ...prev, [message.file_url!]: false }));
                                  setImageError(prev => ({ ...prev, [message.file_url!]: true }));
                                }}
                              />
                            )}
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {message.file_name} {message.file_size && `• ${Math.ceil(message.file_size / 1024)} KB`}
                            </div>
                          </div>
                        ) : (
                      <a 
                        href={message.file_url} 
                        target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center space-x-2 px-3 py-1.5 text-xs rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <FileText className="w-4 h-4" />
                            <span className="truncate max-w-[220px]">{message.file_name || 'attachment'}</span>
                            {message.file_size ? (
                              <span className="text-gray-400">{Math.ceil(message.file_size / 1024)} KB</span>
                            ) : null}
                          </a>
                        )}
                    </div>
                  )}

                    {/* Reply Count */}
                    {messageReplyCounts[message.id] > 0 && (
                      <button
                        onClick={() => {
                          console.log('🧵 Opening thread for message:', message);
                          setReplyingToMessage(message);
                        }}
                        className="mt-2 inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{messageReplyCounts[message.id]} {messageReplyCounts[message.id] === 1 ? 'reply' : 'replies'}</span>
                        <span>•</span>
                        <span>View thread</span>
                      </button>
                    )}
                  
                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                      {message.reactions.map((reaction, index) => (
                          <span
                          key={index}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer shadow-sm"
                          >
                                                      <span className="text-sm">{reaction.emoji}</span>
                          <span className="font-medium">{reaction.count}</span>
                          </span>
                      ))}
                    </div>
                  )}
                </div>
                </div>
                {/* Reaction Picker */}
                {reactionPickerForId === message.id && (
                  <div className="absolute -top-8 right-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-3 z-20 reaction-picker">
                    <div className="grid grid-cols-10 gap-1 max-w-[320px] max-h-40 overflow-auto">
                      {['👍','❤️','😂','🤣','😊','😍','😘','😎','😉','😇','🤔','🤨','😐','😴','😮','😢','😭','😡','🤯','👏','🙌','🙏','🔥','✨','🎉','💯','👀','💪','🫶','🙈','✅','❌','🎯','🎪','🎨','🎭','🎬','🎤','🎧','🎵','🎶','🎹','🎸','🎺','🎻','🥁','🎮','🎲','🎯','🎳','🎰','🎪','🎨','🎭','🎬','🎤','🎧','🎵','🎶','🎹','🎸','🎺','🎻','🥁','🎮','🎲','🎯','🎳','🎰'].map(e => (
                  <button 
                          key={e}
                          onClick={() => { addReaction(message.id, e); setReactionPickerForId(null); }}
                          className="px-1 py-1 text-base hover:scale-110 transition"
                        >{e}</button>
                      ))}
                </div>
              </div>
                )}

                {/* More Options Menu */}
                {showMoreMenu === message.id && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1 z-20">
                    <button 
                      onClick={() => handleEditMessage(message.id)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleCopyMessage(message.id)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteMessage(message.id)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>

                    <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

        {/* Message Input */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">

          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <RichTextEditor
                onSend={handleSendMessage}
                onFileSelect={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                placeholder="Message #general"
              />
              
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Auto-send with the selected file (do not require text)
                    console.log('File selected (main):', file.name);
                    void handleSendMessage('', '', file);
                    // Reset input value so selecting the same file again re-triggers change
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Thread Panel */}
      {replyingToMessage && (
        <div ref={threadPanelRef} className={`fixed top-0 right-0 w-96 ${threadPanelHeight} bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-30 flex flex-col transition-all duration-300 ease-in-out`}>
          {/* Thread Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Thread</h3>
            </div>
              <button
              onClick={() => setReplyingToMessage(null)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
              <X className="w-4 h-4" />
              </button>
            </div>

          {/* Original Message */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                  {replyingToMessage.user?.display_name?.charAt(0) || replyingToMessage.user?.email?.charAt(0) || 'U'}
              </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {replyingToMessage.user?.display_name || replyingToMessage.user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(replyingToMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
            </div>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {replyingToMessage.body}
                </div>
              </div>
            </div>
          </div>

          {/* Thread Replies */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            <div ref={threadRepliesEndRef} />
            {threadReplies.map((reply) => (
              <div key={reply.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                  {reply.user?.display_name?.charAt(0) || reply.user?.email?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-2">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {reply.user?.display_name || reply.user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {renderWithMentions(reply.body)}
                </div>
                {reply.file_url && (
                  <div className="mt-2">
                    {/(png|jpe?g|gif|webp|bmp|svg)$/i.test(reply.file_name || '') ? (
                      <div className="relative">
                        {imageLoading[reply.file_url] && (
                          <div className="max-h-48 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse flex items-center justify-center">
                            <div className="text-gray-500 text-xs">Loading...</div>
                          </div>
                        )}
                        {imageError[reply.file_url] ? (
                          <div className="max-h-48 w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center justify-center">
                            <div className="text-red-500 text-xs">Failed to load image</div>
                          </div>
                        ) : (
                          <img
                            src={reply.file_url}
                            alt={reply.file_name || 'attachment'}
                            className={`max-h-48 max-w-full rounded-md border border-gray-200 dark:border-gray-700 object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                              imageLoading[reply.file_url] ? 'hidden' : ''
                            }`}
                            onClick={() => setSelectedImage(reply.file_url || null)}
                            onLoad={() => setImageLoading(prev => ({ ...prev, [reply.file_url!]: false }))}
                            onError={() => {
                              setImageLoading(prev => ({ ...prev, [reply.file_url!]: false }));
                              setImageError(prev => ({ ...prev, [reply.file_url!]: true }));
                            }}
                          />
                        )}
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {reply.file_name} {reply.file_size && `• ${Math.ceil(reply.file_size / 1024)} KB`}
                        </div>
                      </div>
                    ) : (
                      <a
                        href={reply.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-2 px-3 py-1.5 text-xs rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{reply.file_name || 'attachment'}</span>
                        {reply.file_size ? (
                          <span className="text-gray-400">{Math.ceil(reply.file_size / 1024)} KB</span>
                        ) : null}
                      </a>
                    )}
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>

          {/* Thread Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                              <RichTextEditor
                onSend={handleSendThreadReply}
                onFileSelect={() => {
                  if (threadFileInputRef.current) {
                    threadFileInputRef.current.click();
                  }
                }}
                placeholder="Reply to thread..."
              />
              
              <input
                ref={threadFileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('Thread file selected:', file.name);
                    void handleSendThreadReply('', '', file);
                    e.currentTarget.value = '';
                  }
                }}
              />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold z-10"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityLoungeView;
