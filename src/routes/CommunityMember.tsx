import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Calendar } from 'lucide-react';
import GroupsTab from '../components/community/GroupsTab';
import BuddyTab from '../components/community/BuddyTab';
import SessionsTab from '../components/community/SessionsTab';

const CommunityMember: React.FC = () => {
  const [activeTab, setActiveTab] = useState('groups');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
          <p className="text-gray-600 mt-2">Connect with your groups, buddy, and training sessions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="buddy" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              My Buddy
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="mt-6">
            <GroupsTab />
          </TabsContent>

          <TabsContent value="buddy" className="mt-6">
            <BuddyTab />
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            <SessionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityMember;

















