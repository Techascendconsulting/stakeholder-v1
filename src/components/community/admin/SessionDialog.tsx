import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Session } from '../../../services/community/sessionsService';

interface SessionDialogProps {
  session?: Session;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
  }) => void;
}

const SessionDialog: React.FC<SessionDialogProps> = ({ session, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title,
        description: session.description || '',
        start_time: new Date(session.start_time).toISOString().slice(0, 16),
        end_time: new Date(session.end_time).toISOString().slice(0, 16)
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.start_time || !formData.end_time) return;

    setLoading(true);
    try {
      await onSubmit({
        title: formData.title,
        description: formData.description || undefined,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString()
      });
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{session ? 'Edit Session' : 'Create Session'}</DialogTitle>
          <DialogDescription>
            {session ? 'Update the training session details.' : 'Create a new training session.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter session title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter session description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.title.trim() || !formData.start_time || !formData.end_time}
            >
              {loading ? 'Saving...' : (session ? 'Update Session' : 'Create Session')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SessionDialog;

















