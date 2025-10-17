import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, UserCheck, Archive, RotateCcw, ExternalLink } from 'lucide-react';
import { buddiesService, BuddyPair } from '../../../services/community/buddiesService';
import CreatePairDialog from './CreatePairDialog';

const BuddyPairsAdminTab: React.FC = () => {
  const [buddyPairs, setBuddyPairs] = useState<BuddyPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadBuddyPairs();
  }, []);

  const loadBuddyPairs = async () => {
    try {
      setLoading(true);
      const data = await buddiesService.listAll();
      setBuddyPairs(data);
    } catch (error) {
      console.error('Error loading buddy pairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePair = async (email1: string, email2: string, status: 'pending' | 'confirmed') => {
    try {
      await buddiesService.createByEmails(email1, email2, status);
      await loadBuddyPairs();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating buddy pair:', error);
    }
  };

  const handleConfirmPair = async (pairId: string) => {
    try {
      await buddiesService.confirm(pairId);
      await loadBuddyPairs();
    } catch (error) {
      console.error('Error confirming pair:', error);
    }
  };

  const handleArchivePair = async (pairId: string) => {
    if (window.confirm('Are you sure you want to archive this buddy pair?')) {
      try {
        await buddiesService.archive(pairId);
        await loadBuddyPairs();
      } catch (error) {
        console.error('Error archiving pair:', error);
      }
    }
  };

  const handleRepair = async (pairId: string, newEmail: string) => {
    if (window.confirm('Archive previous channel and create a new one?')) {
      try {
        await buddiesService.repair(pairId, newEmail);
        await loadBuddyPairs();
      } catch (error) {
        console.error('Error re-pairing:', error);
      }
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
          <h2 className="text-xl font-semibold">Buddy Pairs</h2>
          <p className="text-gray-600">Manage student buddy pairings and relationships</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Pair
        </Button>
      </div>

      {buddyPairs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Buddy Pairs Yet</h3>
            <p className="text-gray-600 mb-4">Create your first buddy pair to get started.</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Pair
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User 1</TableHead>
                <TableHead>User 2</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buddyPairs.map((pair) => (
                <TableRow key={pair.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pair.user1_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pair.user2_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(pair.status)}>
                      {pair.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pair.slack_channel_id ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">#{pair.slack_channel_id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* Open in Slack */}}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No channel</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(pair.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {pair.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfirmPair(pair.id)}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Confirm
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRepair(pair.id, 'new@example.com')}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Re-pair
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchivePair(pair.id)}
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

      {/* Create Pair Dialog */}
      {showCreateDialog && (
        <CreatePairDialog
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreatePair}
        />
      )}
    </div>
  );
};

export default BuddyPairsAdminTab;







