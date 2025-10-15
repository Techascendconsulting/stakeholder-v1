import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, CheckCircle, AlertCircle, Eye, RefreshCw } from 'lucide-react';

interface Assignment {
  id: string;
  user_id: string;
  module_id: string;
  submission: string;
  status: 'submitted' | 'reviewed';
  score: number | null;
  ai_feedback: string | null;
  created_at: string;
  reviewed_at: string | null;
  profiles: {
    email: string;
    full_name: string;
  };
}

const AdminAssignmentReview: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_assignments')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const getTimeUntilReview = (submittedAt: string) => {
    const submitted = new Date(submittedAt).getTime();
    const reviewTime = submitted + (24 * 60 * 60 * 1000); // 24 hours
    const now = Date.now();
    const remaining = reviewTime - now;

    if (remaining <= 0) return 'Ready for review';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.status === 'reviewed') {
      const isPassed = (assignment.score || 0) >= 70;
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          isPassed
            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
        }`}>
          {isPassed ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
          {isPassed ? 'Passed' : 'Revision Needed'} ({assignment.score}/100)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
        <Clock className="w-3 h-3 mr-1" />
        Pending Review
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Assignment Review Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {assignments.length} total submissions
          </p>
        </div>
        <button
          onClick={loadAssignments}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Pending Review</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                {assignments.filter(a => a.status === 'submitted').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Passed</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                {assignments.filter(a => a.status === 'reviewed' && (a.score || 0) >= 70).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Needs Revision</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">
                {assignments.filter(a => a.status === 'reviewed' && (a.score || 0) < 70).length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Review Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {assignment.profiles?.full_name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {assignment.profiles?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {assignment.module_id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(assignment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(assignment.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {assignment.status === 'submitted' 
                      ? getTimeUntilReview(assignment.created_at)
                      : new Date(assignment.reviewed_at!).toLocaleString()
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 inline-flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No assignments submitted yet</p>
          </div>
        )}
      </div>

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Assignment Details
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedAssignment.profiles?.full_name} - {selectedAssignment.module_id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <div className="mt-2">{getStatusBadge(selectedAssignment)}</div>
              </div>

              {/* Submission */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Submission</label>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedAssignment.submission}
                  </p>
                </div>
              </div>

              {/* AI Feedback */}
              {selectedAssignment.status === 'reviewed' && selectedAssignment.ai_feedback && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI Feedback (Score: {selectedAssignment.score}/100)
                  </label>
                  <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {selectedAssignment.ai_feedback}
                    </p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Submitted At</label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {new Date(selectedAssignment.created_at).toLocaleString()}
                  </p>
                </div>
                {selectedAssignment.reviewed_at && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Reviewed At</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {new Date(selectedAssignment.reviewed_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignmentReview;









