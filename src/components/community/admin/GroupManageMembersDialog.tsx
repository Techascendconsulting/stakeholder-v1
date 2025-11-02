import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, User } from 'lucide-react';
import { GroupWithCount, Member, groupsService } from '../../../services/community/groupsService';

interface GroupManageMembersDialogProps {
  group: GroupWithCount;
  onClose: () => void;
  onUpdate: () => void;
}

const GroupManageMembersDialog: React.FC<GroupManageMembersDialogProps> = ({ 
  group, 
  onClose, 
  onUpdate 
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [emailChips, setEmailChips] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [group.id]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await groupsService.listMembers(group.id);
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = () => {
    if (emailInput.trim() && !emailChips.includes(emailInput.trim())) {
      setEmailChips([...emailChips, emailInput.trim()]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmailChips(emailChips.filter(e => e !== email));
  };

  const handleAddMembers = async () => {
    if (emailChips.length === 0) return;

    setAdding(true);
    try {
      await groupsService.addByEmails(group.id, emailChips);
      setEmailChips([]);
      await loadMembers();
      onUpdate();
    } catch (error) {
      console.error('Error adding members:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await groupsService.removeMember(group.id, userId);
      await loadMembers();
      onUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Members - {group.name}</DialogTitle>
          <DialogDescription>
            Add or remove members from this group. Use email addresses to add new members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Members Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="emails">Add Members by Email</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="emails"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email address"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                />
                <Button type="button" onClick={handleAddEmail} disabled={!emailInput.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Use emails. System resolves emails to user IDs.
              </p>
            </div>

            {/* Email Chips */}
            {emailChips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {emailChips.map((email, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {emailChips.length > 0 && (
              <Button
                onClick={handleAddMembers}
                disabled={adding}
                className="w-full"
              >
                {adding ? 'Adding Members...' : `Add ${emailChips.length} Member(s)`}
              </Button>
            )}
          </div>

          {/* Current Members */}
          <div className="space-y-4">
            <h4 className="font-semibold">Current Members ({members.length})</h4>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No members yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{member.full_name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(member.user_id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupManageMembersDialog;
