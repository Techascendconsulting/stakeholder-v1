import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Search, Users } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { buddyService, BuddyPair, User } from '../../../services/buddyService';

const BuddyTab: React.FC = () => {
  const { user } = useAuth();
  const [buddy, setBuddy] = useState<BuddyPair | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<BuddyPair[]>([]);

  useEffect(() => {
    loadBuddyData();
  }, [user?.id]);

  const loadBuddyData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [buddyData, pendingData] = await Promise.all([
        buddyService.getMyBuddy(user.id),
        buddyService.getPendingInvitations(user.id)
      ]);
      
      setBuddy(buddyData);
      setPendingInvitations(pendingData);
    } catch (error) {
      console.error('Error loading buddy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await buddyService.searchUsers(query);
      // Filter out current user
      const filteredResults = results.filter(u => u.id !== user?.id);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (userId: string) => {
    if (!user?.id) return;
    
    setInviting(true);
    try {
      const success = await buddyService.sendInvitation(user.id, userId);
      if (success) {
        setShowInviteModal(false);
        setSearchQuery('');
        setSearchResults([]);
        loadBuddyData();
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setInviting(false);
    }
  };

  const handleAcceptInvitation = async (buddyPairId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await buddyService.acceptInvitation(buddyPairId, user.id);
      if (success) {
        loadBuddyData();
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleRejectInvitation = async (buddyPairId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await buddyService.rejectInvitation(buddyPairId, user.id);
      if (success) {
        loadBuddyData();
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show pending invitations first
  if (pendingInvitations.length > 0) {
    const invitation = pendingInvitations[0];
    const otherUser = invitation.user1_id === user?.id ? invitation.user2 : invitation.user1;
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Users className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Buddy Invitation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <strong>{otherUser?.name || otherUser?.email}</strong> wants to be your study buddy!
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => handleAcceptInvitation(invitation.id)}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="w-5 h-5 mr-2" />
              Accept
            </button>
            <button
              onClick={() => handleRejectInvitation(invitation.id)}
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 mr-2" />
              Decline
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show confirmed buddy
  if (buddy && buddy.status === 'confirmed') {
    const otherUser = buddy.user1_id === user?.id ? buddy.user2 : buddy.user1;
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Study Buddy: {otherUser?.name || otherUser?.email}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Connected since {new Date(buddy.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        {/* Slack Channel Embed */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Buddy Chat
          </h3>
          <div className="h-96 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                Slack channel embed will appear here
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Channel ID: {buddy.slack_channel_id || 'Not created yet'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show pending invitation sent
  if (buddy && buddy.status === 'pending') {
    const otherUser = buddy.user1_id === user?.id ? buddy.user2 : buddy.user1;
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invitation Sent
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Request sent to <strong>{otherUser?.name || otherUser?.email}</strong> – awaiting acceptance.
          </p>
        </div>
      </div>
    );
  }

  // No buddy - show invite option
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          You don't have a buddy yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Invite one to get started with your learning journey.
        </p>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Invite Buddy
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Invite a Study Buddy
            </h3>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {searching && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name || user.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => handleInvite(user.id)}
                      disabled={inviting}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {inviting ? 'Sending...' : 'Invite'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuddyTab;
