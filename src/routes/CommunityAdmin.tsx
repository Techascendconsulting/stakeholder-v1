import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Calendar, Plus } from 'lucide-react';
import GroupsAdminTab from '../components/community/admin/GroupsAdminTab';
import BuddyPairsAdminTab from '../components/community/admin/BuddyPairsAdminTab';
import SessionsAdminTab from '../components/community/admin/SessionsAdminTab';

const CommunityAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('groups');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Hub (Admin)</h1>
          <p className="text-gray-600 mt-2">Manage groups, buddy pairs, and training sessions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="buddy-pairs" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Buddy Pairs
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="mt-6">
            <GroupsAdminTab />
          </TabsContent>

          <TabsContent value="buddy-pairs" className="mt-6">
            <BuddyPairsAdminTab />
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            <SessionsAdminTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityAdmin;






