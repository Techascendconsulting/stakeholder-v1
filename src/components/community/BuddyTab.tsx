import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck, Clock, MessageSquare } from 'lucide-react';
import { buddiesService, BuddyPair } from '../../services/community/buddiesService';
import ChatPanel from './ChatPanel';

const BuddyTab: React.FC = () => {
  const [buddy, setBuddy] = useState<BuddyPair | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuddy();
  }, []);

  const loadBuddy = async () => {
    try {
      setLoading(true);
      const buddies = await buddiesService.listMine();
      setBuddy(buddies.length > 0 ? buddies[0] : null);
    } catch (error) {
      console.error('Error loading buddy:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <UserCheck className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </CardContent>
      </Card>
    );
  }

  if (!buddy) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Buddy Yet</h3>
          <p className="text-gray-600">You haven't been paired with a buddy yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Buddy</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Buddy Pair</CardTitle>
            <Badge className={getStatusColor(buddy.status)}>
              {getStatusIcon(buddy.status)}
              {buddy.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${buddy.user2_email}`} />
                <AvatarFallback>
                  {buddy.user2_email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{buddy.user2_email}</h4>
                <p className="text-sm text-gray-600">Your buddy partner</p>
              </div>
            </div>

            {buddy.status === 'confirmed' && buddy.slack_channel_id ? (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Private Chat</h4>
                <div className="h-64 border rounded-lg">
                  <ChatPanel 
                    channelId={buddy.slack_channel_id}
                    canPost={true}
                  />
                </div>
              </div>
            ) : buddy.status === 'pending' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800">Pair pending. You'll see chat when confirmed.</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600">No chat channel available.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuddyTab;






