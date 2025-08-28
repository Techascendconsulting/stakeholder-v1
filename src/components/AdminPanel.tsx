import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Users, BookOpen, BarChart3, Settings, TrendingUp, ArrowLeft, FolderOpen } from 'lucide-react'
import { dailyQuoteService, DailyQuoteStats, DailyQuote } from '../services/dailyQuoteService';

const AdminPanel: React.FC = () => {
  const { user, signOut } = useAuth()

  const stats = [
    {
      title: 'Total Students',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Projects',
      value: '89',
      change: '+8%',
      changeType: 'positive',
      icon: BookOpen,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Completion Rate',
      value: '78%',
      change: '+5%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Average Score',
      value: '85',
      change: '+3%',
      changeType: 'positive',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const recentActivity = [
    { student: 'John Smith', action: 'Completed', project: 'Web Development Portfolio', time: '2 hours ago' },
    { student: 'Sarah Johnson', action: 'Started', project: 'E-commerce Platform', time: '4 hours ago' },
    { student: 'Mike Chen', action: 'Submitted', project: 'Task Management App', time: '6 hours ago' },
    { student: 'Emily Davis', action: 'Completed', project: 'Weather Dashboard', time: '1 day ago' }
  ]

  const [quoteStats, setQuoteStats] = useState<DailyQuoteStats | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<DailyQuote[]>([]);
  const [isTriggeringQuote, setIsTriggeringQuote] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState('');

  // Load quote statistics
  const loadQuoteStats = async () => {
    const stats = await dailyQuoteService.getQuoteStats();
    setQuoteStats(stats);
  };

  // Load recent quotes
  const loadRecentQuotes = async () => {
    const quotes = await dailyQuoteService.getRecentQuotes(5);
    setRecentQuotes(quotes);
  };

  // Trigger daily quote manually
  const handleTriggerDailyQuote = async () => {
    setIsTriggeringQuote(true);
    setQuoteMessage('');
    
    try {
      const result = await dailyQuoteService.triggerDailyQuote();
      setQuoteMessage(result.message);
      
      if (result.success) {
        // Reload stats and recent quotes
        await loadQuoteStats();
        await loadRecentQuotes();
      }
    } catch (error) {
      setQuoteMessage('Failed to trigger daily quote');
    } finally {
      setIsTriggeringQuote(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadQuoteStats();
    loadRecentQuotes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Admin: {user?.email}</span>
              </div>
              <button
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h2>
            <p className="text-gray-600 dark:text-gray-400">Monitor student progress and system performance</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400"> from last month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.student}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.action} <span className="font-medium">{activity.project}</span>
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Manage Students</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Create Project</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-gray-900 dark:text-white">View Reports</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">System Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Daily Quotes Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-2">💬</span>
              Daily Motivational Quotes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quote Statistics */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Statistics (Last 30 Days)</h4>
                {quoteStats ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Quotes:</span>
                      <span className="font-medium">{quoteStats.total_quotes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate:</span>
                      <span className="font-medium text-green-600">{quoteStats.avg_success_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Quotes Today:</span>
                      <span className="font-medium">{quoteStats.quotes_today}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Loading statistics...</p>
                )}
              </div>

              {/* Manual Trigger */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Manual Trigger</h4>
                <div className="space-y-3">
                  <button
                    onClick={handleTriggerDailyQuote}
                    disabled={isTriggeringQuote}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    {isTriggeringQuote ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Posting Quote...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🚀</span>
                        Post Daily Quote Now
                      </>
                    )}
                  </button>
                  
                  {quoteMessage && (
                    <div className={`p-3 rounded-lg text-sm ${
                      quoteMessage.includes('successfully') 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {quoteMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule Information</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>Time:</strong> 9:30 AM UTC (Daily)</p>
                <p><strong>Target:</strong> All cohort channels + general forum</p>
                <p><strong>Content:</strong> Motivational quotes for Business Analysts</p>
              </div>
            </div>

            {/* Recent Quotes */}
            {recentQuotes.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Quotes</h4>
                <div className="space-y-3">
                  {recentQuotes.map((quote) => (
                    <div key={quote.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">"{quote.quote_text}"</p>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(quote.posted_at).toLocaleDateString()}</span>
                        <span>{quote.success_count} channels • {quote.error_count} errors</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminPanel