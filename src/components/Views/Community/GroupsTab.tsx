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

  // Slack-like layout: sidebar with cohorts, main chat panel
  return (
    <div className="h-[calc(100vh-200px)] flex rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">My Cohorts</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setSelectedGroup(g);
                loadGroupMembers(g.id);
              }}
              className={`w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${selectedGroup?.id === g.id ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
            >
              <div className="font-medium text-sm text-gray-900 dark:text-white">{g.name}</div>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGroupTypeColor(g.type)}`}>{getGroupTypeLabel(g.type)}</span>
                <span className="text-xs text-gray-500">
                  {g.start_date ? new Date(g.start_date).toLocaleDateString() : ''}
                  {g.end_date ? ` → ${new Date(g.end_date).toLocaleDateString()}` : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {selectedGroup ? (
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{selectedGroup.name}</div>
              <div className="text-xs text-gray-500">
                {selectedGroup.start_date ? new Date(selectedGroup.start_date).toLocaleDateString() : ''}
                {selectedGroup.end_date ? ` → ${new Date(selectedGroup.end_date).toLocaleDateString()}` : ''}
                {` • ${groupMembers.length} member${groupMembers.length === 1 ? '' : 's'}`}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Select a cohort</div>
          )}
        </div>

        {/* Chat */}
        <div className="flex-1">
          {selectedGroup?.slack_channel_id ? (
            <ChatPanel channelId={selectedGroup.slack_channel_id} canPost={true} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a cohort to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupsTab;
