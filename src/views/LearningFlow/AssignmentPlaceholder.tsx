import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Lock, Send, Sparkles, ThumbsUp, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  submitAssignment, 
  reviewAssignmentWithAI, 
  getLatestAssignment,
  getTimeUntilUnlock,
  formatTimeRemaining,
  AIFeedbackResult 
} from '../../utils/assignments';

interface AssignmentPlaceholderProps {
  moduleId: string;
  moduleTitle: string;
  title: string;
  description: string;
  isCompleted: boolean;
  canAccess: boolean;
  onComplete: () => void;
}

const AssignmentPlaceholder: React.FC<AssignmentPlaceholderProps> = ({
  moduleId,
  moduleTitle,
  title,
  description,
  isCompleted,
  canAccess,
  onComplete
}) => {
  const { user } = useAuth();
  const [submission, setSubmission] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedbackResult | null>(null);
  const [previousSubmission, setPreviousSubmission] = useState<string>('');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  // Load any previous submission on mount
  useEffect(() => {
    if (!user || !canAccess) return;

    const loadPreviousSubmission = async () => {
      try {
        const latest = await getLatestAssignment(user.id, moduleId);
        if (latest) {
          setPreviousSubmission(latest.submission);
          setSubmittedAt(latest.created_at);
          if (latest.feedback && latest.score !== null) {
            // Parse stored feedback back into structure
            const [summary, ...feedbackParts] = latest.feedback.split('\n\n');
            setAiFeedback({
              summary: summary,
              feedback: feedbackParts.join('\n\n'),
              score: latest.score,
              strengths: [],
              improvements: []
            });
          }
        }
      } catch (error) {
        console.error('Failed to load previous submission:', error);
      }
    };

    loadPreviousSubmission();
  }, [user, moduleId, canAccess]);

  const handleSubmit = async () => {
    if (!user || !submission.trim()) return;

    setSubmitting(true);
    try {
      // Just submit assignment - NO instant AI review
      const submitted = await submitAssignment(user.id, moduleId, submission);

      setPreviousSubmission(submission);
      setSubmittedAt(submitted.created_at);
      setSubmission(''); // Clear form
      setAiFeedback(null); // Clear any previous feedback to show waiting state

      // Component will automatically re-render to show the countdown UI
      console.log('✅ Assignment submitted successfully, showing countdown...');
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Locked state
  if (!canAccess) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border-2 border-gray-200 dark:border-gray-700">
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Assignment Locked
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Complete all lessons in this module to unlock the assignment.
        </p>
      </div>
    );
  }

  // Waiting for AI review state (submitted but not yet reviewed)
  if (submittedAt && !aiFeedback) {
    const timeRemaining = getTimeUntilUnlock(submittedAt);
    
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-12 text-center border-2 border-blue-200 dark:border-blue-800">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Assignment Submitted! ✓
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your assignment has been submitted successfully.  
          Verity will review it and provide feedback in:
        </p>
        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6">
          {formatTimeRemaining(timeRemaining)}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What happens next?</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Verity will review your submission</li>
            <li>• You'll receive a score (0-100) and personalized feedback</li>
            <li>• If you score ≥ 70%, the next module will unlock</li>
            <li>• If you score &lt; 70%, you can revise and resubmit</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          Come back in {formatTimeRemaining(timeRemaining).toLowerCase()} to see your results!
        </p>
      </div>
    );
  }

  // Reviewed state - show feedback and either unlock or request revision
  if (aiFeedback && submittedAt) {
    const isPass = aiFeedback.score >= 70;
    
    return (
      <div className={`bg-gradient-to-br ${isPass ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'} rounded-xl p-12 text-center border-2 ${isPass ? 'border-green-200 dark:border-green-800' : 'border-yellow-200 dark:border-yellow-800'}`}>
        <div className={`w-20 h-20 ${isPass ? 'bg-green-100 dark:bg-green-900/40' : 'bg-yellow-100 dark:bg-yellow-900/40'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {isPass ? (
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {isPass ? 'Assignment Passed! 🎉' : 'Revision Needed'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You scored <span className={`font-bold ${isPass ? 'text-green-600' : 'text-yellow-600'}`}>{aiFeedback.score}/100</span>
        </p>

        {/* Show submitted answer (read-only if passed, editable if failed) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-left mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Your Submission:</span>
          </h3>
          <div className={`p-4 rounded-lg ${isPass ? 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600' : 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700'}`}>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{previousSubmission}</p>
          </div>
          {isPass && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Submission locked (passed) - not editable</span>
            </p>
          )}
          {!isPass && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 font-medium">
              ⚠️ Review your submission below and improve it based on the feedback
            </p>
          )}
        </div>

        {/* Show AI feedback (always read-only) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-left mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Verity's Feedback:</span>
          </h3>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">{aiFeedback.summary}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{aiFeedback.feedback}</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>AI feedback is read-only</span>
          </p>
        </div>

        {isPass ? (
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/40 rounded-lg text-green-700 dark:text-green-300 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Module Complete - Next module unlocked!</span>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
              Please revise your submission based on the feedback above and resubmit.
            </p>
            <button
              onClick={() => {
                setAiFeedback(null);
                setSubmittedAt(null);
                setSubmission(previousSubmission); // Pre-fill with previous attempt
              }}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              Revise & Resubmit
            </button>
          </div>
        )}
      </div>
    );
  }

  // Completed state
  if (isCompleted && aiFeedback && aiFeedback.score >= 70) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-12 text-center border-2 border-green-200 dark:border-green-800">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Module Completed! 🎉
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Great work! You scored <span className="font-bold text-green-600">{aiFeedback.score}/100</span>.
          The next module is now unlocked!
        </p>

        {/* Show feedback */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-left mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Verity's Feedback:</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{aiFeedback.summary}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{aiFeedback.feedback}</p>
        </div>

        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/40 rounded-lg text-green-700 dark:text-green-300 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>Module Complete</span>
        </div>
      </div>
    );
  }

  // Submission form
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
          {description}
        </p>

        {/* Previous submission feedback (if exists and score < 70) */}
        {aiFeedback && aiFeedback.score < 70 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded-r-lg mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Previous Score: {aiFeedback.score}/100 - Revision Needed
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  {aiFeedback.summary}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {aiFeedback.feedback}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submission Form */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Submission
          </label>
          <textarea
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            placeholder={previousSubmission ? "Revise your previous submission..." : "Type your assignment response here..."}
            rows={8}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 resize-none"
            disabled={submitting}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Minimum 50 words recommended for meaningful feedback
          </p>
        </div>

        {/* Previous submission reference */}
        {previousSubmission && !aiFeedback && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
              Your previous submission:
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "{previousSubmission.substring(0, 150)}{previousSubmission.length > 150 ? '...' : ''}"
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!submission.trim() || submitting}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verity is reviewing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit for AI Review</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Verity will review and provide feedback instantly
          </p>
        </div>

        {/* AI Feedback Display (after submission) */}
        {aiFeedback && !isCompleted && (
          <div className={`mt-8 rounded-xl p-6 border-2 ${
            aiFeedback.score >= 70 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className="flex items-start space-x-4 mb-4">
              <div className={`w-12 h-12 ${
                aiFeedback.score >= 70 
                  ? 'bg-green-100 dark:bg-green-900/40' 
                  : 'bg-yellow-100 dark:bg-yellow-900/40'
              } rounded-full flex items-center justify-center flex-shrink-0`}>
                {aiFeedback.score >= 70 ? (
                  <ThumbsUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Verity's Feedback
                  </h3>
                  <span className={`text-2xl font-bold ${
                    aiFeedback.score >= 70 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {aiFeedback.score}/100
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <strong>Summary:</strong> {aiFeedback.summary}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Feedback:</strong> {aiFeedback.feedback}
                </p>

                {/* Strengths and Improvements */}
                {aiFeedback.strengths && aiFeedback.strengths.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2">
                        ✅ Strengths:
                      </p>
                      <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                        {aiFeedback.strengths.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    {aiFeedback.improvements && aiFeedback.improvements.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                          💡 Areas to Improve:
                        </p>
                        <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                          {aiFeedback.improvements.map((i, idx) => (
                            <li key={idx}>• {i}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Result message */}
                <div className={`mt-4 p-4 rounded-lg ${
                  aiFeedback.score >= 70 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  {aiFeedback.score >= 70 ? (
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      🎉 Excellent work! Module completed. The next module is now unlocked!
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                      ⚠️ Score below 70%. Please revise your submission based on the feedback above and resubmit.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentPlaceholder;

