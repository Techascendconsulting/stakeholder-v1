import React, { useState, useEffect } from 'react';
import { Users, Calendar, User } from 'lucide-react';
import ChatPanel from '@/components/community/ChatPanel';
import { useAuth } from '../../../contexts/AuthContext';
import { groupService, Group, GroupMember } from '../../../services/groupService';

const GroupsTab: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, [user?.id]);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupMembers(selectedGroup.id);
    }
  }, [selectedGroup]);

  const loadGroups = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const userGroups = await groupService.getUserGroups(user.id);
      setGroups(userGroups);
      if (userGroups.length > 0) {
        setSelectedGroup(userGroups[0]);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      const members = await groupService.getGroupMembers(groupId);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error loading group members:', error);
    }
  };

  const getGroupTypeLabel = (type: string) => {
    switch (type) {
      case 'cohort': return 'Cohort';
      case 'graduate': return 'Graduate';
      case 'mentor': return 'Mentor';
      case 'custom': return 'Custom';
      default: return type;
    }
  };

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'cohort': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'graduate': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'mentor': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'custom': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // No groups
  if (groups.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            You are not part of any group yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Once your admin assigns you, your group will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Single group - show CohortCard with Open Chat
  if (groups.length === 1) {
    const group = groups[0];
    
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Group</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slack</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{group.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGroupTypeColor(group.type)}`}>
                      {getGroupTypeLabel(group.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{group.slack_channel_id ? 'Created' : 'Not created'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{group.start_date ? new Date(group.start_date).toLocaleDateString() : '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Open Chat (Slack-powered) */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cohort Chat</h3>
            <span className="text-sm text-gray-500">Channel: {group.slack_channel_id || 'Not created yet'}</span>
          </div>
          <div className="h-96">
            <ChatPanel channelId={group.slack_channel_id} canPost={true} />
          </div>
        </div>

        {/* Members list */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Group Members</h3>
          <div className="space-y-3">
            {groupMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {member.user?.name || member.user?.email}
                  </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.role || 'member'}
                      </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Multiple cohorts — show vertical cards each with Open Chat
  return (
    <div className="max-w-6xl mx-auto">
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{g.name}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGroupTypeColor(g.type)}`}>{getGroupTypeLabel(g.type)}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">{g.start_date ? `${new Date(g.start_date).toLocaleDateString()}${g.end_date ? ` → ${new Date(g.end_date).toLocaleDateString()}` : ''}` : ''}</div>
            </div>
            <div className="h-80">
              <ChatPanel channelId={g.slack_channel_id} canPost={true} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupsTab;
