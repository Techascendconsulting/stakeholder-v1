import React, { useState } from 'react';
import { MessageCircle, Send, Bot, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Avatar from '../ui/Avatar';

interface Reply {
  id: string;
  post_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
  ai_generated: boolean;
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

interface ReplyListProps {
  replies: Reply[];
  loading: boolean;
  postId: string;
  currentUserId?: string;
}

const ReplyList: React.FC<ReplyListProps> = ({
  replies,
  loading,
  postId,
  currentUserId
}) => {
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReply.trim() || !currentUserId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: newReply.trim()
        });

      if (error) throw error;

      setNewReply('');
      setShowComposer(false);
      
      // Trigger a page reload to show the new reply
      window.location.reload();
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAISuggestion = async () => {
    if (!currentUserId) return;

    setIsSubmitting(true);
    try {
      // Call the AI suggestion endpoint
      const response = await fetch('/api/forum-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: 'Generate a helpful reply to this post'
        })
      });

      if (!response.ok) throw new Error('Failed to get AI suggestion');

      // Reload to show the AI reply
      window.location.reload();
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      alert('Failed to get AI suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
        <span className="ml-3 text-gray-600">Loading replies...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Reply Composer */}
      {showComposer ? (
        <div className="bg-gray-50 rounded-xl p-4">
          <form onSubmit={handleSubmitReply} className="space-y-3">
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write your reply..."
              className="w-full h-20 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-[15px] leading-6"
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleAISuggestion}
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <Bot className="w-3 h-3" />
                  <span>AI Suggestion</span>
                </button>
                <button
                  type="submit"
                  disabled={!newReply.trim() || isSubmitting}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  <Send className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowComposer(true)}
          className="w-full flex items-center justify-center space-x-2 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors border border-dashed border-gray-200"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Add a reply...</span>
        </button>
      )}

      {/* Replies List */}
      <div className="space-y-4">
        {replies.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No replies yet. Be the first to respond!</p>
          </div>
        ) : (
          replies.map((reply) => (
            <div
              key={reply.id}
              className={`flex space-x-3 pl-4 border-l-2 ${
                reply.ai_generated 
                  ? 'border-blue-200 bg-blue-50/50' 
                  : 'border-gray-200'
              }`}
            >
              <Avatar
                userId={reply.user_id || 'ai'}
                email={reply.user?.email}
                size="sm"
                className="flex-shrink-0 mt-1"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">
                    {reply.ai_generated 
                      ? 'AI Assistant' 
                      : reply.user?.user_metadata?.full_name || reply.user?.email?.split('@')[0] || 'Anonymous'
                    }
                  </span>
                  {reply.ai_generated && (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      <Bot className="w-3 h-3" />
                      <span>AI</span>
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(reply.created_at)}
                  </span>
                </div>
                
                <div className={`rounded-lg p-3 ${
                  reply.ai_generated 
                    ? 'bg-blue-100/50 border border-blue-200' 
                    : 'bg-gray-50'
                }`}>
                  <p className="text-[15px] leading-6 text-gray-700 whitespace-pre-wrap">
                    {reply.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReplyList;
