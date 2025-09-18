import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users } from 'lucide-react';
import { groupsService, Group } from '../../services/community/groupsService';
import ChatPanel from './ChatPanel';

const GroupsTab: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupsService.listMyGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (group: Group) => {
    setSelectedGroup(group);
    setShowChat(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cohort': return 'bg-blue-100 text-blue-800';
      case 'graduate': return 'bg-green-100 text-green-800';
      case 'mentor': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Groups Yet</h3>
          <p className="text-gray-600">You're not in any groups yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Groups</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <Badge className={getTypeColor(group.type)}>
                  {group.type}
                </Badge>
              </div>
              <CardDescription>
                {group.start_date && group.end_date 
                  ? `${new Date(group.start_date).toLocaleDateString()} - ${new Date(group.end_date).toLocaleDateString()}`
                  : 'No dates set'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {group.slack_channel_id ? 'Chat available' : 'No chat channel'}
                </div>
                <Button
                  variant={group.slack_channel_id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleOpenChat(group)}
                  disabled={!group.slack_channel_id}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {group.slack_channel_id ? 'Open Chat' : 'No Chat'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chat Drawer */}
      {showChat && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedGroup.name} Chat</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
              >
                ×
              </Button>
            </div>
            <div className="h-[calc(100vh-80px)]">
              <ChatPanel 
                channelId={selectedGroup.slack_channel_id || null}
                canPost={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsTab;
