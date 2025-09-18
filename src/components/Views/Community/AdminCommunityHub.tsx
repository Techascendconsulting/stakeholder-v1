import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Users, UserCheck, Calendar, Settings, X } from 'lucide-react';
import { groupService, Group } from '../../../services/groupService';
import { buddyService, BuddyPair } from '../../../services/buddyService';
import { sessionService, TrainingSession } from '../../../services/sessionService';

interface AdminCommunityHubProps {
  onBack: () => void;
}

const AdminCommunityHub: React.FC<AdminCommunityHubProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'buddies' | 'sessions'>('groups');
  const [groups, setGroups] = useState<Group[]>([]);
  const [buddies, setBuddies] = useState<BuddyPair[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [createGroupData, setCreateGroupData] = useState({
    name: '',
    type: 'cohort' as 'cohort' | 'graduate' | 'mentor' | 'custom',
    startDate: '',
    endDate: ''
  });
  const [creating, setCreating] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<Array<{ id: string; email: string; name?: string }>>([]);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<Group | null>(null);
  const [addingMember, setAddingMember] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupsData, sessionsData] = await Promise.all([
        groupService.getAllGroups(),
        sessionService.getAllSessions()
      ]);
      
      setGroups(groupsData);
      setSessions(sessionsData);
      // Note: Buddy pairs would need a separate admin service method
      setBuddies([]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!createGroupData.name.trim()) {
      alert('Please enter a group name');
      return;
    }

    setCreating(true);
    try {
      const newGroup = await groupService.createGroup(
        createGroupData.name,
        createGroupData.type,
        createGroupData.startDate || undefined,
        createGroupData.endDate || undefined
      );

      if (newGroup) {
        setGroups(prev => [newGroup, ...prev]);
        setShowCreateGroup(false);
        setCreateGroupData({
          name: '',
          type: 'cohort',
          startDate: '',
          endDate: ''
        });
        alert('Group created successfully!');
      } else {
        alert('Failed to create group. Please try again.');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Error creating group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const tabs = [
    { id: 'groups' as const, label: 'Groups Management', icon: Users },
    { id: 'buddies' as const, label: 'Buddy Pairs', icon: UserCheck },
    { id: 'sessions' as const, label: 'Training Sessions', icon: Calendar },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Community Hub Admin
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage groups, buddy pairs, and training sessions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'groups' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Groups Management</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage community groups, cohorts, and member assignments</p>
              </div>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <Users className="w-4 h-4 mr-2" />
                  Import CSV
                </button>
                <button 
                  onClick={() => setShowCreateGroup(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </button>
              </div>
            </div>
            
            {groups.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No groups created yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create your first group to get started.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slack</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {groups.map((group) => (
                        <tr key={group.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{group.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {group.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {group.slack_channel_id ? (
                              <span className="text-green-600">Created</span>
                            ) : (
                              <button
                                onClick={async () => {
                                  const id = await groupService.ensureSlackChannelForGroup(group.id, group.name, group.type);
                                  if (id) {
                                    setGroups((prev) => prev.map(g => g.id === group.id ? { ...g, slack_channel_id: id } : g));
                                    alert('Slack channel created');
                                  } else {
                                    alert('Failed to create Slack channel. Check token.');
                                  }
                                }}
                                className="text-purple-600 hover:underline"
                              >
                                Create Slack
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{new Date(group.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{group.start_date ? new Date(group.start_date).toLocaleDateString() : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                className="inline-flex items-center px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                                title="Manage Members"
                                onClick={() => {
                                  setSelectedGroupForMembers(group);
                                  setShowManageMembers(true);
                                }}
                              >
                                <Users className="w-4 h-4 mr-1" /> Manage
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Edit Group">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600" title="Archive Group">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'buddies' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Buddy Pairs Management</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage student buddy pairings and relationships</p>
              </div>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Auto-Pair
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Pair
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No buddy pairs created yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create buddy pairs to help students connect and collaborate.
              </p>
              <div className="flex justify-center space-x-3">
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Pair
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Auto-Generate Pairs
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Training Sessions</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Schedule and manage live training sessions for the community</p>
              </div>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar View
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </button>
              </div>
            </div>
            
            {sessions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No training sessions created yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create your first training session to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {session.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(session.start_time).toLocaleString()}
                          </p>
                          {session.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {session.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Group</h3>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={createGroupData.name}
                  onChange={(e) => setCreateGroupData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Type
                </label>
                <select
                  value={createGroupData.type}
                  onChange={(e) => setCreateGroupData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="cohort">Cohort</option>
                  <option value="graduate">Graduate</option>
                  <option value="mentor">Mentor</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={createGroupData.startDate}
                    onChange={(e) => setCreateGroupData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={createGroupData.endDate}
                    onChange={(e) => setCreateGroupData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={creating || !createGroupData.name.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Dialog */}
      {showManageMembers && selectedGroupForMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage Members — {selectedGroupForMembers.name}</h3>
              <button
                onClick={() => {
                  setShowManageMembers(false);
                  setMemberSearch('');
                  setMemberSearchResults([]);
                  setSelectedGroupForMembers(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add student by email or name</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={async (e) => {
                    const q = e.target.value;
                    setMemberSearch(q);
                    if (q.trim().length >= 2) {
                      const results = await groupService.searchUsers(q.trim());
                      setMemberSearchResults(results);
                    } else {
                      setMemberSearchResults([]);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Search students..."
                />
              </div>

              {memberSearchResults.length > 0 && (
                <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                  {memberSearchResults.map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name || u.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                      </div>
                      <button
                        disabled={!!addingMember}
                        onClick={async () => {
                          if (!selectedGroupForMembers) return;
                          setAddingMember(u.id);
                          const ok = await groupService.addMemberToGroup(selectedGroupForMembers.id, u.id, 'member');
                          setAddingMember(null);
                          if (ok) {
                            alert('Student added to group');
                          } else {
                            alert('Failed to add student. Check permissions and RLS.');
                          }
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                      >
                        {addingMember === u.id ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommunityHub;
