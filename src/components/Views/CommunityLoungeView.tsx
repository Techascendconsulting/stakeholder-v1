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

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto">
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

        {/* Add Channel Modal */}
        {showAddChannel && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80">
              <h3 className="text-lg font-semibold mb-4">Create Channel</h3>
              <input
                type="text"
                placeholder="Channel name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddChannel(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // createChannel(newChannelName);
                    setNewChannelName('');
                    setShowAddChannel(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
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
                    // searchMessages(e.target.value);
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
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-white dark:bg-gray-900">
          {/* Motivational Quote */}
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

          {/* Messages */}
          <div className="space-y-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`group relative p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  hoveredMessageId === message.id ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                }`}
                onMouseEnter={() => setHoveredMessageId(message.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                {/* Hover Bar */}
                {hoveredMessageId === message.id && (
                  <div className="absolute -top-2 left-0 right-0 flex items-center justify-center space-x-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1 z-10">
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      ✅
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      👀
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      ✋
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      React
                    </button>
                    <button 
                      onClick={() => {
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
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                      {message.sender?.profile?.display_name?.charAt(0) || message.sender?.email?.charAt(0) || 'U'}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {message.sender?.profile?.display_name || message.sender?.email?.split('@')[0] || 'User'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {message.content}
                    </div>

                    {/* Reply Count */}
                    {messageReplyCounts[message.id] > 0 && (
                      <button
                        onClick={() => {
                          // openThread(message);
                        }}
                        className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {messageReplyCounts[message.id]} {messageReplyCounts[message.id] === 1 ? 'reply' : 'replies'} • View thread
                      </button>
                    )}

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.reactions.map((reaction, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                          >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* More Options Menu */}
                {showMoreMenu === message.id && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1 z-20">
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
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

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {replyingToMessage && (
            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Replying to</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {replyingToMessage.content}
                  </div>
                </div>
                <button
                  onClick={() => setReplyingToMessage(null)}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <RichTextEditor
                value={newMessage}
                onChange={setNewMessage}
                placeholder="Message #general"
                onSend={() => {
                  // sendMessage();
                }}
              />
            </div>
            
            <div className="flex items-center space-x-1">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Smile className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thread Panel */}
      {replyingToMessage && (
        <div className="fixed top-0 right-0 w-96 h-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-30 flex flex-col">
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
                  {replyingToMessage.sender?.profile?.display_name?.charAt(0) || replyingToMessage.sender?.email?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {replyingToMessage.sender?.profile?.display_name || replyingToMessage.sender?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(replyingToMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {replyingToMessage.content}
                </div>
              </div>
            </div>
          </div>

          {/* Thread Replies */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {threadReplies.map((reply) => (
              <div key={reply.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                    {reply.sender?.profile?.display_name?.charAt(0) || reply.sender?.email?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {reply.sender?.profile?.display_name || reply.sender?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {reply.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Thread Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <RichTextEditor
                  value={newMessage}
                  onChange={setNewMessage}
                  placeholder="Reply to thread..."
                  onSend={() => {
                    // sendThreadReply();
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
    </div>
  );
};

export default CommunityLoungeView;
