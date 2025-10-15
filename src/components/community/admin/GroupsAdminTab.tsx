import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, FileUp, Edit, Archive } from 'lucide-react';
import { groupsService, GroupWithCount } from '../../../services/community/groupsService';
import GroupCreateDialog from './GroupCreateDialog';
import GroupManageMembersDialog from './GroupManageMembersDialog';
import ImportCsvDialog from './ImportCsvDialog';

const GroupsAdminTab: React.FC = () => {
  const [groups, setGroups] = useState<GroupWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showImportCsv, setShowImportCsv] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithCount | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupsService.listAll();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupData: any) => {
    try {
      await groupsService.create(groupData);
      await loadGroups();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleManageMembers = (group: GroupWithCount) => {
    setSelectedGroup(group);
    setShowManageMembers(true);
  };

  const handleArchiveGroup = async (groupId: string) => {
    if (window.confirm('Are you sure you want to archive this group?')) {
      try {
        await groupsService.archive(groupId);
        await loadGroups();
      } catch (error) {
        console.error('Error archiving group:', error);
      }
    }
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
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Groups</h2>
          <p className="text-gray-600">Manage community groups and memberships</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowImportCsv(true)}
            className="flex items-center gap-2"
          >
            <FileUp className="w-4 h-4" />
            Import CSV
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Groups Yet</h3>
            <p className="text-gray-600 mb-4">Create your first group to get started.</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(group.type)}>
                      {group.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {group.start_date ? new Date(group.start_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {group.end_date ? new Date(group.end_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>{group.member_count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageMembers(group)}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Members
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* Edit functionality */}}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchiveGroup(group.id)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialogs */}
      {showCreateDialog && (
        <GroupCreateDialog
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreateGroup}
        />
      )}

      {showManageMembers && selectedGroup && (
        <GroupManageMembersDialog
          group={selectedGroup}
          onClose={() => setShowManageMembers(false)}
          onUpdate={loadGroups}
        />
      )}

      {showImportCsv && (
        <ImportCsvDialog
          onClose={() => setShowImportCsv(false)}
          onImport={loadGroups}
        />
      )}
    </div>
  );
};

export default GroupsAdminTab;





