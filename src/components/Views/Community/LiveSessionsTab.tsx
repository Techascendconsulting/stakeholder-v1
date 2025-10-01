import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ExternalLink, Video } from 'lucide-react';
import { sessionService, TrainingSession } from '../../../services/sessionService';

const LiveSessionsTab: React.FC = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const upcomingSessions = await sessionService.getUpcomingSessions();
      setSessions(upcomingSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  const isSessionStartingSoon = (startTime: string) => {
    const now = new Date();
    const sessionTime = new Date(startTime);
    const diffInMinutes = (sessionTime.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes <= 60 && diffInMinutes > 0; // Starting within the next hour
  };

  const getSessionStatus = (startTime: string) => {
    const now = new Date();
    const sessionTime = new Date(startTime);
    
    if (sessionTime < now) {
      return { status: 'past', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' };
    } else if (isSessionStartingSoon(startTime)) {
      return { status: 'starting-soon', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20' };
    } else {
      return { status: 'upcoming', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // No sessions
  if (sessions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No sessions scheduled yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please check back later for upcoming training sessions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        {sessions.map((session) => {
          const { date, time } = formatDateTime(session.start_time);
          const sessionStatus = getSessionStatus(session.start_time);
          
          return (
            <div
              key={session.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 ${sessionStatus.bg}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {session.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {session.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {session.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${sessionStatus.color} ${sessionStatus.bg}`}>
                      {sessionStatus.status === 'past' && 'Past Session'}
                      {sessionStatus.status === 'starting-soon' && 'Starting Soon'}
                      {sessionStatus.status === 'upcoming' && 'Upcoming'}
                    </span>
                    
                    {sessionStatus.status !== 'past' && (
                      <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join Session
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Slack Reminder Banner */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Slack Reminders
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Reminders are automatically posted to your group channels 1 hour before each session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionsTab;

