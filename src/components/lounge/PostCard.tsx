import React, { useState, useEffect } from 'react';
import { MessageCircle, MoreHorizontal, Flag, Bot, Clock, Hash } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Avatar from '../ui/Avatar';
import ReactionBar from './ReactionBar';
import ReplyList from './ReplyList';

interface ForumPost {
  id: string;
  user_id: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  system_generated: boolean;
  is_flagged: boolean;
  view_count: number;
  reply_count: number;
  reaction_count: number;
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  tags?: string[];
  reactions?: Array<{
    emoji: string;
    count: number;
    user_reacted: boolean;
  }>;
}

interface PostCardProps {
  post: ForumPost;
  onReaction: (postId: string, emoji: string) => void;
  onReport: (postId: string, reason: string, description?: string) => void;
  currentUserId?: string;
  onReply: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onReaction,
  onReport,
  currentUserId,
  onReply
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

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

  const loadReplies = async () => {
    if (showReplies && replies.length === 0) {
      setLoadingReplies(true);
      try {
        const { data, error } = await supabase
          .from('forum_replies')
          .select(`
            *,
            user:user_id(
              email,
              user_metadata
            )
          `)
          .eq('post_id', post.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setReplies(data || []);
      } catch (error) {
        console.error('Error loading replies:', error);
      } finally {
        setLoadingReplies(false);
      }
    }
  };

  useEffect(() => {
    loadReplies();
  }, [showReplies]);

  const handleReport = () => {
    if (reportReason) {
      onReport(post.id, reportReason, reportDescription);
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'process-mapping': 'Process Mapping',
      'requirements': 'Requirements',
      'interview-prep': 'Interview Prep',
      'agile': 'Agile & Scrum',
      'stakeholders': 'Stakeholders',
      'general': 'General'
    };
    return labels[category] || category;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      {/* Post Header */}
      <div className="flex items-start space-x-3 mb-4">
        <Avatar
          userId={post.user_id}
          email={post.user?.email}
          size="md"
          className="flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm text-gray-900">
              {post.user?.user_metadata?.full_name || post.user?.email?.split('@')[0] || 'Anonymous'}
            </span>
            {post.system_generated && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <Bot className="w-3 h-3" />
                <span>System</span>
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatTimeAgo(post.created_at)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              {getCategoryLabel(post.category)}
            </span>
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium"
                  >
                    <Hash className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setShowReportModal(true)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-[15px] leading-6 text-gray-700 whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Engagement Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span>{post.view_count} views</span>
          <span>{post.reply_count} replies</span>
          <span>{post.reaction_count} reactions</span>
        </div>
        {post.updated_at !== post.created_at && (
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>edited {formatTimeAgo(post.updated_at)}</span>
          </span>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {showReplies ? 'Hide' : 'Show'} Replies ({post.reply_count})
            </span>
          </button>
          
          <button
            onClick={onReply}
            className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            Reply
          </button>
        </div>

        {/* Reactions */}
        <ReactionBar
          reactions={post.reactions || []}
          onReaction={(emoji) => onReaction(post.id, emoji)}
        />
      </div>

      {/* Replies Section */}
      {showReplies && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <ReplyList
            replies={replies}
            loading={loadingReplies}
            postId={post.id}
            currentUserId={currentUserId}
          />
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Post</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="">Select a reason</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="spam">Spam</option>
                  <option value="offensive">Offensive language</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Please provide additional details..."
                  className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
