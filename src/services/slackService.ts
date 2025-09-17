// Slack Service - handles all Slack API interactions
// Note: This is a placeholder service. In production, you'd need:
// 1. Slack App with proper OAuth2 setup
// 2. Bot token with appropriate scopes
// 3. Webhook endpoints for events
// 4. Environment variables for tokens

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
}

interface SlackUser {
  id: string;
  name: string;
  email: string;
}

class SlackService {
  private botToken: string;
  private baseUrl = 'https://slack.com/api';

  constructor() {
    // In production, get from environment variables
    this.botToken = process.env.VITE_SLACK_BOT_TOKEN || '';
  }

  // Create a new channel
  async createChannel(name: string, isPrivate: boolean = false): Promise<SlackChannel | null> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations.create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          is_private: isPrivate,
        }),
      });

      const data = await response.json();
      
      if (data.ok) {
        return {
          id: data.channel.id,
          name: data.channel.name,
          is_private: data.channel.is_private,
        };
      }
      
      console.error('Slack API error:', data.error);
      return null;
    } catch (error) {
      console.error('Error creating Slack channel:', error);
      return null;
    }
  }

  // Add user to channel
  async addUserToChannel(channelId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations.invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channelId,
          users: userId,
        }),
      });

      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Error adding user to channel:', error);
      return false;
    }
  }

  // Remove user from channel
  async removeUserFromChannel(channelId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations.kick`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channelId,
          user: userId,
        }),
      });

      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Error removing user from channel:', error);
      return false;
    }
  }

  // Post message to channel
  async postMessage(channelId: string, text: string, blocks?: any[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channelId,
          text,
          blocks,
        }),
      });

      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Error posting message:', error);
      return false;
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<SlackUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users.lookupByEmail`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
        },
        // Note: This would need proper query parameter handling
      });

      const data = await response.json();
      
      if (data.ok) {
        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.profile.email,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error looking up user:', error);
      return null;
    }
  }

  // Create buddy channel
  async createBuddyChannel(user1Name: string, user2Name: string): Promise<SlackChannel | null> {
    const channelName = `buddy-${user1Name}-${user2Name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return this.createChannel(channelName, true);
  }

  // Create group channel
  async createGroupChannel(groupName: string, groupType: string): Promise<SlackChannel | null> {
    const channelName = `${groupType}-${groupName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return this.createChannel(channelName, false);
  }

  // Post session reminder
  async postSessionReminder(channelId: string, sessionTitle: string, startTime: string): Promise<boolean> {
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🎯 *Live Session Reminder*\n\n*${sessionTitle}*\nStarts in 1 hour at ${startTime}\n\nGet ready to join!`
        }
      }
    ];

    return this.postMessage(channelId, `Live Session Reminder: ${sessionTitle}`, blocks);
  }
}

export const slackService = new SlackService();
export default slackService;
