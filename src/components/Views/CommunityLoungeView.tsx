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
  const [emojiPickerMessageId, setEmojiPickerMessageId] = useState<number | null>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [threadReplies, setThreadReplies] = useState<Message[]>([]);
  const [messageReplyCounts, setMessageReplyCounts] = useState<Record<number, number>>({});
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
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const threadFileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Emojis for reactions
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🙏', '🔥', '💯', '✨', '🎉', '🤔', '👀', '💪', '🚀', '💡', '🎯', '⭐', '💎'];

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
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3 flex-shrink-0">
              <Hash className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedChannel?.name || 'Select a channel'}
              </h2>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-white dark:bg-gray-900">
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">💪</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Today's Motivation
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle." - Steve Jobs
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Keep pushing forward, you've got this! 🚀
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLoungeView;
