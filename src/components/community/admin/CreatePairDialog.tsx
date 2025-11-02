import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreatePairDialogProps {
  onClose: () => void;
  onSubmit: (email1: string, email2: string, status: 'pending' | 'confirmed') => void;
}

const CreatePairDialog: React.FC<CreatePairDialogProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email1: '',
    email2: '',
    status: 'pending' as 'pending' | 'confirmed'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email1.trim() || !formData.email2.trim()) return;

    setLoading(true);
    try {
      await onSubmit(formData.email1.trim(), formData.email2.trim(), formData.status);
    } catch (error) {
      console.error('Error creating pair:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Buddy Pair</DialogTitle>
          <DialogDescription>
            Create a new buddy pair by entering two email addresses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email1">First User Email *</Label>
            <Input
              id="email1"
              type="email"
              value={formData.email1}
              onChange={(e) => setFormData({ ...formData, email1: e.target.value })}
              placeholder="user1@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email2">Second User Email *</Label>
            <Input
              id="email2"
              type="email"
              value={formData.email2}
              onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
              placeholder="user2@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'pending' | 'confirmed') => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.email1.trim() || !formData.email2.trim()}
            >
              {loading ? 'Creating...' : 'Create Pair'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePairDialog;
