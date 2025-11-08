import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserCohort } from '../../utils/cohortHelpers';
import { formatSessionDateTime } from '../../utils/cohortHelpers';
import type { UserCohortInfo } from '../../types/cohorts';
import { Calendar, Users, ExternalLink } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Cohort
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with fellow learners and join live sessions
            </p>
          </div>

          {/* Cohort Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {cohortInfo.cohort.name}
                </h2>
                {cohortInfo.cohort.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {cohortInfo.cohort.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span className="capitalize">{cohortInfo.cohort.status}</span>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              <Calendar className="w-4 h-4 inline mr-2" />
              Created {new Date(cohortInfo.cohort.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Next Session Card */}
          {cohortInfo.next_session && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Next Live Session
              </h3>
              
              <div className="space-y-3">
                {cohortInfo.next_session.topic && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Topic</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {cohortInfo.next_session.topic}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Date & Time</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatSessionDateTime(cohortInfo.next_session.starts_at)}
                  </div>
                </div>

                {cohortInfo.next_session.meeting_link && (
                  <a
                    href={cohortInfo.next_session.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-700 transition text-white font-medium"
                  >
                    <span>Join Live Session</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Sessions */}
          {cohortInfo.upcoming_sessions && cohortInfo.upcoming_sessions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upcoming Sessions
              </h3>
              
              <div className="space-y-3">
                {cohortInfo.upcoming_sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {session.topic || 'Session'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatSessionDateTime(session.starts_at)}
                        {session.duration_minutes && ` (${session.duration_minutes} min)`}
                      </div>
                    </div>
                    {session.meeting_link && (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition text-gray-700 dark:text-gray-200 text-sm font-medium"
                      >
                        Join
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

