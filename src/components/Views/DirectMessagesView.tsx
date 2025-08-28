import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { advancedChatService } from '../../lib/advancedChatService';
import type { Conversation, DirectMessage, UserProfile, TypingIndicator } from '../../types/chat';
import { 
  MessageSquare, 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreHorizontal,
  User,
  Clock,
  Pin,
  Bookmark,
  Reply,
  Edit,
  Copy,
  Trash2,
  X,
  ChevronDown,
  Users,
  Hash
} from 'lucide-react';

const DirectMessagesView: React.FC = () => {
  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState<DirectMessage | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.other_user_id);
      subscribeToMessages(selectedConversation.other_user_id);
      subscribeToTyping(selectedConversation.other_user_id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const conversations = await advancedChatService.getConversations();
      setConversations(conversations);
      if (conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(conversations[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    try {
      const messages = await advancedChatService.getDirectMessages(otherUserId);
      setMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = (otherUserId: string) => {
    return advancedChatService.subscribeToDirectMessages(otherUserId, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });
  };

  const subscribeToTyping = (otherUserId: string) => {
    return advancedChatService.subscribeToTypingIndicators(undefined, otherUserId, (typing) => {
      setTypingIndicators(typing);
    });
  };

  const sendMessage = async () => {
    if (!selectedConversation || (!newMessage.trim() && !selectedFile)) return;

    try {
      // Stop typing indicator
      await advancedChatService.setTypingIndicator(undefined, selectedConversation.other_user_id, false);

      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;

      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const uploadFileName = `${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('chat-files')
          .upload(uploadFileName, selectedFile);

        if (error) throw error;
        fileUrl = data.path;
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
      }

      // Send message
      const message = await advancedChatService.sendDirectMessage(
        selectedConversation.other_user_id,
        newMessage.trim(),
        fileUrl,
        fileName,
        fileSize
      );

      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = async () => {
    if (!selectedConversation) return;
    
    // Set typing indicator
    await advancedChatService.setTypingIndicator(undefined, selectedConversation.other_user_id, true);
    
    // Clear typing indicator after 3 seconds
    setTimeout(async () => {
      await advancedChatService.setTypingIndicator(undefined, selectedConversation.other_user_id, false);
    }, 3000);
  };

  const handleReply = (message: DirectMessage) => {
    setReplyingToMessage(message);
    setNewMessage(`@${message.sender?.profile?.display_name || message.sender?.email?.split('@')[0] || 'User'} `);
    setHoveredMessageId(null);
    inputRef.current?.focus();
  };

  const handleEditMessage = (message: DirectMessage) => {
    setEditingMessageId(message.id);
    setEditMessageText(message.body || '');
    setShowMoreMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editMessageText.trim()) return;

    try {
      // Update message in database
      const { error } = await supabase
        .from('direct_messages')
        .update({
          body: editMessageText,
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', editingMessageId);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === editingMessageId 
          ? { ...msg, body: editMessageText, is_edited: true, edited_at: new Date().toISOString() }
          : msg
      ));

      setEditingMessageId(null);
      setEditMessageText('');
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setShowMoreMenu(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleCopyMessage = async (message: DirectMessage) => {
    const textToCopy = `${message.body || ''}${message.file_url ? `\n\nFile: ${message.file_name || ''}` : ''}`;
    await navigator.clipboard.writeText(textToCopy);
    setShowMoreMenu(null);
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await advancedChatService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const startNewConversation = async (user: UserProfile) => {
    // Create a new conversation
    const newConversation: Conversation = {
      id: `new-${user.user_id}`,
      other_user_id: user.user_id,
      other_user: { profile: user },
      last_message: undefined,
      unread_count: 0,
      updated_at: new Date().toISOString()
    };

    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
    setShowUserSearch(false);
    setSearchQuery('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Direct Messages</h2>
            <button
              onClick={() => setShowUserSearch(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <User size={20} />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet. Start a new chat!
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedConversation?.id === conversation.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' 
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {conversation.other_user?.profile?.display_name?.[0] || 
                     conversation.other_user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {conversation.other_user?.profile?.display_name || 
                         conversation.other_user?.email?.split('@')[0] || 'Unknown User'}
                      </h3>
                      {conversation.last_message && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    {conversation.last_message && (
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.last_message.body || 'File shared'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {selectedConversation.other_user?.profile?.display_name?.[0] || 
                     selectedConversation.other_user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {selectedConversation.other_user?.profile?.display_name || 
                       selectedConversation.other_user?.email?.split('@')[0] || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.other_user?.profile?.title || 'User'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <Search size={16} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`group p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors relative rounded-lg ${
                    message.sender_id === selectedConversation.other_user_id ? 'ml-0' : 'ml-auto'
                  }`}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  {/* Message Content */}
                  <div className={`max-w-xs lg:max-w-md ${message.sender_id === selectedConversation.other_user_id ? 'ml-0' : 'ml-auto'}`}>
                    {/* Reply indicator */}
                    {message.replied_to_id && (
                      <div className="text-xs text-gray-500 mb-1 border-l-2 border-blue-500 pl-2">
                        Replying to a message
                      </div>
                    )}
                    
                    {/* Message body */}
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {message.body}
                      </p>
                      {message.is_edited && (
                        <p className="text-xs text-gray-500 mt-1">(edited)</p>
                      )}
                    </div>

                    {/* File attachment */}
                    {message.file_url && (
                      <div className="mt-2 bg-gray-50 dark:bg-gray-600 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Paperclip size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {message.file_name}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Message timestamp */}
                    <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                      <span>{formatTime(message.created_at)}</span>
                      {message.is_edited && <span>(edited)</span>}
                    </div>
                  </div>

                  {/* Hover Actions */}
                  {hoveredMessageId === message.id && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-1 flex items-center space-x-1">
                      <button
                        onClick={() => handleReply(message)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Reply"
                      >
                        <Reply size={14} />
                      </button>
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="React"
                      >
                        <Smile size={14} />
                      </button>
                      <button
                        onClick={() => setShowMoreMenu(showMoreMenu === message.id ? null : message.id)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="More"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  )}

                  {/* More Options Menu */}
                  {showMoreMenu === message.id && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-10">
                      <button
                        onClick={() => handleEditMessage(message)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleCopyMessage(message)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Copy size={14} />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicators */}
              {typingIndicators.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>
                    {typingIndicators.map(t => t.user?.profile?.display_name || t.user?.email?.split('@')[0]).join(', ')} typing...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {/* Reply indicator */}
              {replyingToMessage && (
                <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Replying to <span className="font-medium">{replyingToMessage.sender?.profile?.display_name || replyingToMessage.sender?.email?.split('@')[0]}</span>
                    </div>
                    <button
                      onClick={() => setReplyingToMessage(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{replyingToMessage.body}</p>
                </div>
              )}

              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                
                <div className="flex items-center space-x-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Paperclip size={20} />
                  </button>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Smile size={20} />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() && !selectedFile}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>

              {/* File preview */}
              {selectedFile && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Paperclip size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedFile.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Start New Conversation</h3>
              <button
                onClick={() => setShowUserSearch(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
              />
            </div>

            <div className="overflow-y-auto max-h-64">
              {searchResults.map((user) => (
                <div
                  key={user.user_id}
                  onClick={() => startNewConversation(user)}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.display_name?.[0] || user.user_id[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {user.display_name || 'Unknown User'}
                      </h4>
                      <p className="text-sm text-gray-500">{user.title || 'User'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectMessagesView;

