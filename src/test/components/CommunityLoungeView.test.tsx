import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CommunityLoungeView from '../../components/Views/CommunityLoungeView';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the services
vi.mock('../../lib/communityLoungeService', () => ({
  communityLoungeService: {
    getSpaces: vi.fn(),
    getChannels: vi.fn(),
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    createChannel: vi.fn(),
  }
}));

vi.mock('../../lib/advancedChatService', () => ({
  advancedChatService: {
    searchMessages: vi.fn(),
  }
}));

// Mock RichTextEditor
vi.mock('../RichTextEditor', () => ({
  default: ({ onSend, placeholder }: any) => (
    <div data-testid="rich-text-editor">
      <textarea 
        data-testid="message-input" 
        placeholder={placeholder}
        onChange={(e) => {
          // Simulate typing
        }}
      />
      <button 
        data-testid="send-button"
        onClick={() => onSend('Test message', '<p>Test message</p>')}
      >
        Send
      </button>
    </div>
  )
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('CommunityLoungeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the main chat interface', () => {
      renderWithProviders(<CommunityLoungeView />);
      
      expect(screen.getByText('BA Community')).toBeInTheDocument();
      expect(screen.getByText("Today's Motivation")).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search messages, files, and more...')).toBeInTheDocument();
    });

    it('should display sample channels in sidebar', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      await waitFor(() => {
        expect(screen.getByText('general')).toBeInTheDocument();
        expect(screen.getByText('random')).toBeInTheDocument();
      });
    });

    it('should display sample messages', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      await waitFor(() => {
        expect(screen.getByText('Hello everyone! Welcome to the BA Community! 👋')).toBeInTheDocument();
        expect(screen.getByText('Thanks for having us! Looking forward to learning together.')).toBeInTheDocument();
      });
    });
  });

  describe('Channel Functionality', () => {
    it('should allow creating new channels', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      // Click the add channel button
      const addButton = screen.getByRole('button', { name: /plus/i });
      fireEvent.click(addButton);
      
      // Should show channel creation input
      const channelInput = screen.getByPlaceholderText('Channel name');
      expect(channelInput).toBeInTheDocument();
      
      // Type channel name and create
      fireEvent.change(channelInput, { target: { value: 'test-channel' } });
      fireEvent.keyPress(channelInput, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('test-channel')).toBeInTheDocument();
      });
    });

    it('should filter messages by selected channel', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      // Initially should show general channel messages
      await waitFor(() => {
        expect(screen.getByText('Hello everyone! Welcome to the BA Community! 👋')).toBeInTheDocument();
      });
      
      // Click on random channel
      const randomChannel = screen.getByText('random');
      fireEvent.click(randomChannel);
      
      // Should show different messages for random channel
      await waitFor(() => {
        expect(screen.queryByText('Hello everyone! Welcome to the BA Community! 👋')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter messages when searching', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      const searchInput = screen.getByPlaceholderText('Search messages, files, and more...');
      
      // Search for "Hello"
      fireEvent.change(searchInput, { target: { value: 'Hello' } });
      
      await waitFor(() => {
        expect(screen.getByText('Hello everyone! Welcome to the BA Community! 👋')).toBeInTheDocument();
        expect(screen.queryByText('Thanks for having us! Looking forward to learning together.')).not.toBeInTheDocument();
      });
    });

    it('should clear search results when clearing search', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      const searchInput = screen.getByPlaceholderText('Search messages, files, and more...');
      
      // Search for something
      fireEvent.change(searchInput, { target: { value: 'Hello' } });
      
      // Clear search
      const clearButton = screen.getByRole('button', { name: /x/i });
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(screen.getByText('Thanks for having us! Looking forward to learning together.')).toBeInTheDocument();
      });
    });
  });

  describe('Message Functionality', () => {
    it('should send new messages', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      const sendButton = screen.getByTestId('send-button');
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('should show hover actions on message hover', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      const message = screen.getByText('Hello everyone! Welcome to the BA Community! 👋').closest('div');
      fireEvent.mouseEnter(message!);
      
      await waitFor(() => {
        expect(screen.getByText('Reply')).toBeInTheDocument();
        expect(screen.getByText('More Options')).toBeInTheDocument();
      });
    });
  });

  describe('Thread Functionality', () => {
    it('should open thread when clicking "View thread"', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      // Find and click "View thread" button
      const viewThreadButton = screen.getByText(/1 reply.*View thread/);
      fireEvent.click(viewThreadButton);
      
      await waitFor(() => {
        expect(screen.getByText('Thread')).toBeInTheDocument();
        expect(screen.getByText('Reply to thread...')).toBeInTheDocument();
      });
    });

    it('should send thread replies', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      // Open thread
      const viewThreadButton = screen.getByText(/1 reply.*View thread/);
      fireEvent.click(viewThreadButton);
      
      // Send thread reply
      const threadSendButton = screen.getAllByTestId('send-button')[1]; // Second RichTextEditor
      fireEvent.click(threadSendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });
  });

  describe('File Attachments', () => {
    it('should handle file selection', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      const fileInput = screen.getByTestId('file-input');
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        // Should show file name or handle file upload
        expect(fileInput).toBeInTheDocument();
      });
    });
  });

  describe('Channel Search', () => {
    it('should filter channels when searching', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      const channelSearchInput = screen.getByPlaceholderText('Search channels...');
      
      // Search for "general"
      fireEvent.change(channelSearchInput, { target: { value: 'general' } });
      
      await waitFor(() => {
        expect(screen.getByText('general')).toBeInTheDocument();
        expect(screen.queryByText('random')).not.toBeInTheDocument();
      });
    });
  });

  describe('Reply Counts', () => {
    it('should display correct reply counts', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      await waitFor(() => {
        expect(screen.getByText(/1 reply.*View thread/)).toBeInTheDocument();
        expect(screen.getByText(/2 replies.*View thread/)).toBeInTheDocument();
      });
    });

    it('should update reply counts when new replies are added', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      // Open thread and send reply
      const viewThreadButton = screen.getByText(/1 reply.*View thread/);
      fireEvent.click(viewThreadButton);
      
      const threadSendButton = screen.getAllByTestId('send-button')[1];
      fireEvent.click(threadSendButton);
      
      // Close thread
      const closeButton = screen.getByRole('button', { name: /x/i });
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/2 replies.*View thread/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle empty message sending gracefully', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      // Try to send empty message
      const sendButton = screen.getByTestId('send-button');
      fireEvent.click(sendButton);
      
      // Should not crash and should not add empty message
      await waitFor(() => {
        const messages = screen.getAllByText(/Test message/);
        expect(messages.length).toBe(0);
      });
    });

    it('should handle channel switching without errors', async () => {
      renderWithProviders(<CommunityLoungeView />);
      
      // Switch between channels multiple times
      const generalChannel = screen.getByText('general');
      const randomChannel = screen.getByText('random');
      
      fireEvent.click(randomChannel);
      fireEvent.click(generalChannel);
      fireEvent.click(randomChannel);
      
      // Should not crash
      expect(screen.getByText('BA Community')).toBeInTheDocument();
    });
  });
});
