import React, { useState, useEffect } from 'react';
import { Quote, TrendingUp, Users, Clock, MessageCircle, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Avatar from '../ui/Avatar';

interface RecentPost {
  id: string;
  content: string;
  created_at: string;
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

const Sidebar: React.FC = () => {
  const [quoteOfTheDay, setQuoteOfTheDay] = useState<string>('');
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSidebarData();
  }, []);

  const loadSidebarData = async () => {
    try {
      setLoading(true);

      // Load quote of the day (latest system-generated post)
      const { data: quoteData } = await supabase
        .from('forum_posts')
        .select('content')
        .eq('system_generated', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (quoteData) {
        setQuoteOfTheDay(quoteData.content);
      } else {
        // Fallback quote
        setQuoteOfTheDay("The best way to predict the future is to create it. Start your BA journey today!");
      }

      // Load recent activity (last 5 posts)
      const { data: recentData } = await supabase
        .from('forum_posts')
        .select(`
          id,
          content,
          created_at,
          user:user_id(
            email,
            user_metadata
          )
        `)
        .eq('system_generated', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentPosts(recentData || []);
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quote of the Day */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Quote className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Quote of the Day</h3>
        </div>
        
        <blockquote className="text-[15px] leading-6 text-gray-700 italic mb-4">
          "{quoteOfTheDay}"
        </blockquote>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Daily inspiration for BAs</span>
          <Sparkles className="w-4 h-4 text-violet-500" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        
        <div className="space-y-4">
          {recentPosts.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No recent posts</p>
              <p className="text-xs text-gray-400">Be the first to start a conversation!</p>
            </div>
          ) : (
            recentPosts.map((post) => (
              <div key={post.id} className="flex space-x-3 group">
                <Avatar
                  userId={post.user?.email || 'anonymous'}
                  email={post.user?.email}
                  size="sm"
                  className="flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {post.user?.user_metadata?.full_name || post.user?.email?.split('@')[0] || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(post.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-5 group-hover:text-gray-900 transition-colors">
                    {truncateText(post.content, 80)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {recentPosts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="w-full text-center text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">
              View all posts
            </button>
          </div>
        )}
      </div>

      {/* Community Stats */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Community Stats</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-600">24</div>
            <div className="text-xs text-gray-500">Active Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">156</div>
            <div className="text-xs text-gray-500">Total Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">89</div>
            <div className="text-xs text-gray-500">Replies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">342</div>
            <div className="text-xs text-gray-500">Reactions</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="space-y-3">
          <button className="w-full flex items-center space-x-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors text-left">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">Start Discussion</div>
              <div className="text-xs text-gray-500">Share your thoughts</div>
            </div>
          </button>
          
          <button className="w-full flex items-center space-x-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors text-left">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">Browse Topics</div>
              <div className="text-xs text-gray-500">Find interesting posts</div>
            </div>
          </button>
          
          <button className="w-full flex items-center space-x-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors text-left">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">Connect</div>
              <div className="text-xs text-gray-500">Meet fellow BAs</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
