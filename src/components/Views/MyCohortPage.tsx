import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserCohort } from '../../utils/cohortHelpers';
import { formatSessionDateTime } from '../../utils/cohortHelpers';
import type { UserCohortInfo } from '../../types/cohorts';
import { Calendar, Users, ExternalLink, Clock, Video, Sparkles, TrendingUp } from 'lucide-react';

const MyCohortPage: React.FC = () => {
  const { user } = useAuth();
  const [cohortInfo, setCohortInfo] = useState<UserCohortInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCohort = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserCohort(user.id);
        setCohortInfo(data);
      } catch (error) {
        console.error('Error loading cohort:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCohort();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // If user has a cohort, show dashboard
  if (cohortInfo) {
    return (
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        <div className="space-y-8">
          {/* Header with Gradient Background */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-8 text-white shadow-xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Your Cohort
                  </h1>
                  <p className="text-purple-100 mt-1">
                    Attend live sessions and follow the guided learning schedule.
                  </p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>

          {/* Cohort Info Card with Modern Design */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {cohortInfo.cohort.name}
                    </h2>
                  </div>
                  {cohortInfo.cohort.description && (
                    <p className="text-gray-700 dark:text-gray-300 text-base">
                      {cohortInfo.cohort.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="capitalize">{cohortInfo.cohort.status}</span>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Started {new Date(cohortInfo.cohort.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-4 h-4" />
                <span>Active Learning</span>
              </div>
            </div>
          </div>

          {/* Next Session - Hero Card */}
          {cohortInfo.next_session && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Video className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold uppercase tracking-wide">
                        Coming Up
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Next Live Session
                    </h3>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {cohortInfo.next_session.topic && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Topic</div>
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {cohortInfo.next_session.topic}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">When</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatSessionDateTime(cohortInfo.next_session.starts_at)}
                    </div>
                    {cohortInfo.next_session.duration_minutes && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Duration: {cohortInfo.next_session.duration_minutes} minutes
                      </div>
                    )}
                  </div>
                </div>

                {cohortInfo.next_session.meeting_link && (
                  <a
                    href={cohortInfo.next_session.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Video className="w-5 h-5" />
                    <span>Join Live Session</span>
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Sessions - Modern Grid */}
          {cohortInfo.upcoming_sessions && cohortInfo.upcoming_sessions.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Upcoming Sessions
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {cohortInfo.upcoming_sessions.map((session) => (
                  <div
                    key={session.id}
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-600 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {session.topic || 'Session'}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {formatSessionDateTime(session.starts_at)}
                          </div>
                          {session.duration_minutes && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              {session.duration_minutes} minutes
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {session.meeting_link && (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-200 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium transition-all"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Session</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If no cohort, show upsell screen
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      <div className="space-y-6 text-gray-700 dark:text-gray-200 max-w-2xl">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Your Cohort
        </h1>
        
        <p className="text-base text-gray-700 dark:text-gray-300">
          Progress is easier when you're not doing it alone.
        </p>
        
        <p className="text-base text-gray-700 dark:text-gray-300">
          Learn alongside others, stay accountable, and get guidance as you progress.
        </p>

        <a
          href="https://wa.me/447359666711?text=Hi%20team,%20I'd%20like%20to%20join%20the%20cohort.%20Can%20you%20help%20me%20get%20started?"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-700 transition text-white font-medium"
        >
          Request to Join Cohort
        </a>
      </div>
    </div>
  );
};

export default MyCohortPage;

