import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import { 
  getAllCohorts, 
  createCohort, 
  updateCohort, 
  deleteCohort,
  getCohortStudents, 
  assignStudentToCohort, 
  removeStudentFromCohort,
  getCohortSessions, 
  scheduleCohortSession, 
  updateCohortSession, 
  deleteCohortSession
} from '../../utils/cohortHelpers';
import type { Cohort, CohortStudent, CohortSession } from '../../types/cohorts';
import { Users, Calendar, Plus, Edit2, Trash2, X, Search, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type TabType = 'cohorts' | 'students' | 'sessions';

const AdminCohortsPage: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState<TabType>('cohorts');
  const [loading, setLoading] = useState(false);

  // Cohorts state
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [showCohortModal, setShowCohortModal] = useState(false);
  const [cohortForm, setCohortForm] = useState({
    name: '',
    description: '',
    coach_user_id: '',
    status: 'active' as 'draft' | 'active' | 'archived'
  });

  // Students state
  const [cohortStudents, setCohortStudents] = useState<CohortStudent[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Sessions state
  const [sessions, setSessions] = useState<CohortSession[]>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    cohort_id: '',
    starts_at: '',
    duration_minutes: 60,
    meeting_link: '',
    topic: ''
  });

  useEffect(() => {
    loadCohorts();
  }, []);

  useEffect(() => {
    if (activeTab === 'students' && selectedCohort) {
      loadCohortStudents();
      loadAvailableUsers();
    } else if (activeTab === 'sessions' && selectedCohort) {
      loadSessions();
    }
  }, [activeTab, selectedCohort]);

  const loadCohorts = async () => {
    setLoading(true);
    const data = await getAllCohorts();
    setCohorts(data);
    if (data.length > 0 && !selectedCohort) {
      setSelectedCohort(data[0]);
    }
    setLoading(false);
  };

  const loadCohortStudents = async () => {
    if (!selectedCohort) return;
    const data = await getCohortStudents(selectedCohort.id);
    
    // Enrich with emails from auth.users
    try {
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      if (authUsers) {
        const enriched = data.map(student => {
          const authUser = authUsers.users.find(u => u.id === student.user_id);
          return {
            ...student,
            email: authUser?.email || 'No email'
          };
        });
        setCohortStudents(enriched as any);
        return;
      }
    } catch (error) {
      console.error('Error enriching students with emails:', error);
    }
    
    setCohortStudents(data);
  };

  const loadAvailableUsers = async () => {
    try {
      // Get users with their emails from auth.users
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, display_name');
      
      if (profileError) {
        console.error('Error loading profiles:', profileError);
        return;
      }

      // Get emails from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error loading auth users:', authError);
        // Fall back to profiles without emails
        setAvailableUsers(profiles || []);
        return;
      }

      // Merge profiles with emails
      const usersWithEmails = (profiles || []).map(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.user_id);
        return {
          user_id: profile.user_id,
          display_name: profile.display_name || 'Unknown User',
          email: authUser?.email || 'No email'
        };
      }).filter(u => u.email !== 'No email'); // Only show users with emails

      setAvailableUsers(usersWithEmails);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadSessions = async () => {
    if (!selectedCohort) return;
    const data = await getCohortSessions(selectedCohort.id);
    setSessions(data);
  };

  const handleCreateCohort = async () => {
    if (!user?.id) return;
    if (!cohortForm.name.trim()) {
      alert('Please enter a cohort name');
      return;
    }
    
    const newCohort = await createCohort(cohortForm, user.id);
    if (newCohort) {
      loadCohorts();
      setShowCohortModal(false);
      resetCohortForm();
    }
  };

  const handleUpdateCohort = async () => {
    if (!selectedCohort) return;
    if (!cohortForm.name.trim()) {
      alert('Please enter a cohort name');
      return;
    }
    
    const updated = await updateCohort(selectedCohort.id, cohortForm);
    if (updated) {
      loadCohorts();
      setShowCohortModal(false);
      resetCohortForm();
    }
  };

  const handleDeleteCohort = async (cohortId: string) => {
    if (!confirm('Are you sure you want to delete this cohort?')) return;
    
    const success = await deleteCohort(cohortId);
    if (success) {
      loadCohorts();
      setSelectedCohort(null);
    }
  };

  const handleAssignStudent = async (userId: string) => {
    if (!selectedCohort) return;
    
    const result = await assignStudentToCohort({
      cohort_id: selectedCohort.id,
      user_id: userId,
      role: 'student'
    });
    
    if (result) {
      loadCohortStudents();
      setShowAddStudentModal(false);
      setSearchTerm('');
    }
  };

  const handleRemoveStudent = async (userId: string) => {
    if (!selectedCohort) return;
    if (!confirm('Remove this student from the cohort?')) return;
    
    const success = await removeStudentFromCohort(selectedCohort.id, userId);
    if (success) {
      loadCohortStudents();
    }
  };

  const handleCreateSession = async () => {
    if (!user?.id || !selectedCohort) return;
    if (!sessionForm.starts_at) {
      alert('Please select a date and time for the session');
      return;
    }
    
    // Convert datetime-local to ISO timestamp
    const startsAtISO = new Date(sessionForm.starts_at).toISOString();
    
    const newSession = await scheduleCohortSession({
      ...sessionForm,
      starts_at: startsAtISO,
      cohort_id: selectedCohort.id
    }, user.id);
    
    if (newSession) {
      loadSessions();
      setShowSessionModal(false);
      resetSessionForm();
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Delete this session?')) return;
    
    const success = await deleteCohortSession(sessionId);
    if (success) {
      loadSessions();
    }
  };

  const resetCohortForm = () => {
    setCohortForm({
      name: '',
      description: '',
      coach_user_id: '',
      status: 'active'
    });
  };

  const resetSessionForm = () => {
    setSessionForm({
      cohort_id: '',
      starts_at: '',
      duration_minutes: 60,
      meeting_link: '',
      topic: ''
    });
  };

  const openEditCohortModal = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setCohortForm({
      name: cohort.name,
      description: cohort.description || '',
      coach_user_id: cohort.coach_user_id || '',
      status: cohort.status
    });
    setShowCohortModal(true);
  };

  const filteredUsers = availableUsers.filter(u => {
    const matchesSearch = 
      u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const notAlreadyInCohort = !cohortStudents.some(cs => cs.user_id === u.user_id);
    return matchesSearch && notAlreadyInCohort;
  });

  // Check admin access
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You do not have permission to access the Cohort Manager. This area is restricted to administrators only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cohort Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage cohorts, assign students, and schedule live sessions
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('cohorts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cohorts'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Cohorts
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'students'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            disabled={!selectedCohort}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Students
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sessions'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            disabled={!selectedCohort}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Live Sessions
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'cohorts' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Cohorts</h2>
            <button
              onClick={() => {
                setSelectedCohort(null);
                resetCohortForm();
                setShowCohortModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Cohort</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading cohorts...</div>
          ) : cohorts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No cohorts yet. Create one to get started.</div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {cohorts.map((cohort) => (
                    <tr
                      key={cohort.id}
                      onClick={() => setSelectedCohort(cohort)}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedCohort?.id === cohort.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{cohort.name}</div>
                        {cohort.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{cohort.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cohort.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : cohort.status === 'draft'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cohort.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(cohort.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditCohortModal(cohort);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCohort(cohort.id);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && selectedCohort && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Students in {selectedCohort.name}
            </h2>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>

          {cohortStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No students assigned yet.</div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {cohortStudents.map((student) => (
                    <tr key={student.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {(student as any).email || student.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.role === 'coach' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {student.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(student.joined_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveStudent(student.user_id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sessions' && selectedCohort && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sessions for {selectedCohort.name}
            </h2>
            <button
              onClick={() => {
                resetSessionForm();
                setShowSessionModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Session</span>
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No sessions scheduled yet.</div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date/Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.topic || 'Untitled Session'}
                        </div>
                        {session.meeting_link && (
                          <a
                            href={session.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Meeting Link
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(session.starts_at).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {session.duration_minutes} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Cohort Modal */}
      {showCohortModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedCohort ? 'Edit Cohort' : 'Create Cohort'}
              </h3>
              <button
                onClick={() => setShowCohortModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={cohortForm.name}
                  onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={cohortForm.description}
                  onChange={(e) => setCohortForm({ ...cohortForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={cohortForm.status}
                  onChange={(e) => setCohortForm({ ...cohortForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCohortModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={selectedCohort ? handleUpdateCohort : handleCreateCohort}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                >
                  {selectedCohort ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Student
              </h3>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setSearchTerm('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {searchTerm ? 'No users found matching your search' : 'No available users to add'}
                </p>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.user_id}
                    onClick={() => handleAssignStudent(u.user_id)}
                    className="w-full text-left px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {u.display_name || 'Unknown User'}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">{u.email}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Schedule Session
              </h3>
              <button
                onClick={() => setShowSessionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={sessionForm.topic}
                  onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={sessionForm.starts_at}
                  onChange={(e) => setSessionForm({ ...sessionForm, starts_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={sessionForm.duration_minutes}
                  onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={sessionForm.meeting_link}
                  onChange={(e) => setSessionForm({ ...sessionForm, meeting_link: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCohortsPage;

