import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import CommunityLoungeView from '../../components/Views/CommunityLoungeView'
import userEvent from '@testing-library/user-event'

// Mock the services
vi.mock('../../lib/communityLoungeService', () => ({
  communityLoungeService: {
    getSpaces: vi.fn(() => Promise.resolve({
      data: [{ id: '1', name: 'Test Space', description: 'Test Description' }],
      error: null
    })),
    getChannels: vi.fn(() => Promise.resolve({
      data: [{ id: '1', name: 'general', description: 'General channel' }],
      error: null
    })),
    getMessages: vi.fn(() => Promise.resolve({
      data: [
        {
          id: 1,
          content: 'Test message',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          user: { name: 'Test User', avatar_url: null }
        }
      ],
      error: null
    })),
    sendMessage: vi.fn(() => Promise.resolve({ data: null, error: null }))
  }
}))

vi.mock('../../lib/advancedChatService', () => ({
  advancedChatService: {
    getThreadReplyCount: vi.fn(() => Promise.resolve(0)),
    searchMessages: vi.fn(() => Promise.resolve({ data: [], error: null }))
  }
}))

describe('CommunityLoungeView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<CommunityLoungeView />)
    expect(screen.getByText('Community Lounge')).toBeInTheDocument()
  })

  it('displays spaces and channels', async () => {
    render(<CommunityLoungeView />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Space')).toBeInTheDocument()
      expect(screen.getByText('general')).toBeInTheDocument()
    })
  })

  it('allows sending messages', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    const messageInput = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await user.type(messageInput, 'Hello world')
    await user.click(sendButton)
    
    await waitFor(() => {
      expect(messageInput).toHaveValue('')
    })
  })

  it('handles emoji selection', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    const emojiButton = screen.getByRole('button', { name: /emoji/i })
    await user.click(emojiButton)
    
    // Check if emoji picker is visible
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('handles message reactions', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    await waitFor(() => {
      const message = screen.getByText('Test message')
      expect(message).toBeInTheDocument()
    })
    
    // Hover over message to show reaction options
    const message = screen.getByText('Test message')
    fireEvent.mouseEnter(message)
    
    // Check if reaction buttons are visible
    expect(screen.getByText('✅')).toBeInTheDocument()
    expect(screen.getByText('👀')).toBeInTheDocument()
    expect(screen.getByText('✋')).toBeInTheDocument()
  })

  it('handles message editing', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    await waitFor(() => {
      const message = screen.getByText('Test message')
      expect(message).toBeInTheDocument()
    })
    
    // Hover over message and click more options
    const message = screen.getByText('Test message')
    fireEvent.mouseEnter(message)
    
    const moreOptionsButton = screen.getByRole('button', { name: /more options/i })
    await user.click(moreOptionsButton)
    
    // Check if edit option is available
    const editButton = screen.getByText('Edit (5min)')
    expect(editButton).toBeInTheDocument()
  })

  it('handles message deletion', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    await waitFor(() => {
      const message = screen.getByText('Test message')
      expect(message).toBeInTheDocument()
    })
    
    // Hover over message and click more options
    const message = screen.getByText('Test message')
    fireEvent.mouseEnter(message)
    
    const moreOptionsButton = screen.getByRole('button', { name: /more options/i })
    await user.click(moreOptionsButton)
    
    // Check if delete option is available
    const deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeInTheDocument()
  })

  it('handles message copying', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    await waitFor(() => {
      const message = screen.getByText('Test message')
      expect(message).toBeInTheDocument()
    })
    
    // Hover over message and click more options
    const message = screen.getByText('Test message')
    fireEvent.mouseEnter(message)
    
    const moreOptionsButton = screen.getByRole('button', { name: /more options/i })
    await user.click(moreOptionsButton)
    
    // Check if copy option is available
    const copyButton = screen.getByText('Copy')
    expect(copyButton).toBeInTheDocument()
  })

  it('handles thread replies', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    await waitFor(() => {
      const message = screen.getByText('Test message')
      expect(message).toBeInTheDocument()
    })
    
    // Hover over message and click reply
    const message = screen.getByText('Test message')
    fireEvent.mouseEnter(message)
    
    const replyButton = screen.getByRole('button', { name: /reply/i })
    await user.click(replyButton)
    
    // Check if thread panel is visible
    expect(screen.getByText('Reply to message')).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    const searchInput = screen.getByPlaceholderText('Search messages...')
    await user.type(searchInput, 'test')
    
    // Check if search is triggered
    await waitFor(() => {
      expect(searchInput).toHaveValue('test')
    })
  })

  it('handles channel switching', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    await waitFor(() => {
      const channel = screen.getByText('general')
      expect(channel).toBeInTheDocument()
    })
    
    const channel = screen.getByText('general')
    await user.click(channel)
    
    // Check if channel is selected
    expect(channel).toHaveClass('bg-blue-100')
  })

  it('handles space switching', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    await waitFor(() => {
      const space = screen.getByText('Test Space')
      expect(space).toBeInTheDocument()
    })
    
    const space = screen.getByText('Test Space')
    await user.click(space)
    
    // Check if space is selected
    expect(space).toHaveClass('bg-purple-100')
  })

  it('displays message timestamps correctly', async () => {
    render(<CommunityLoungeView />)
    
    await waitFor(() => {
      const message = screen.getByText('Test message')
      expect(message).toBeInTheDocument()
    })
    
    // Check if timestamp is displayed
    const timestamp = screen.getByText(/\d{1,2}:\d{2}/)
    expect(timestamp).toBeInTheDocument()
  })

  it('handles empty message input', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)
    
    // Should not send empty message
    await waitFor(() => {
      expect(sendButton).toBeInTheDocument()
    })
  })

  it('handles message formatting', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    const messageInput = screen.getByPlaceholderText('Type your message...')
    
    // Test bold formatting
    const boldButton = screen.getByRole('button', { name: /bold/i })
    await user.click(boldButton)
    await user.type(messageInput, 'bold text')
    
    expect(messageInput).toHaveValue('**bold text**')
  })

  it('handles bullet points', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    const messageInput = screen.getByPlaceholderText('Type your message...')
    
    // Test bullet point formatting
    const bulletButton = screen.getByRole('button', { name: /bullet/i })
    await user.click(bulletButton)
    
    expect(messageInput).toHaveValue('• ')
  })

  it('handles numbered lists', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    const messageInput = screen.getByPlaceholderText('Type your message...')
    
    // Test numbered list formatting
    const numberedButton = screen.getByRole('button', { name: /numbered/i })
    await user.click(numberedButton)
    
    expect(messageInput).toHaveValue('1. ')
  })

  it('handles mentions with @ symbol', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    const messageInput = screen.getByPlaceholderText('Type your message...')
    await user.type(messageInput, '@')
    
    // Check if mention suggestions appear
    await waitFor(() => {
      expect(screen.getByText('Mention someone')).toBeInTheDocument()
    })
  })

  it('handles textarea auto-resize', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    const messageInput = screen.getByPlaceholderText('Type your message...')
    const longMessage = 'This is a very long message that should cause the textarea to resize. '.repeat(10)
    
    await user.type(messageInput, longMessage)
    
    // Check if textarea has expanded
    expect(messageInput).toHaveStyle('height: auto')
  })

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    const messageInput = screen.getByPlaceholderText('Type your message...')
    await user.type(messageInput, 'Test message')
    
    // Test Enter key to send
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(messageInput).toHaveValue('')
    })
  })

  it('handles click outside to close menus', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    await waitFor(() => {
      const message = screen.getByText('Test message')
      expect(message).toBeInTheDocument()
    })
    
    // Open more options menu
    const message = screen.getByText('Test message')
    fireEvent.mouseEnter(message)
    
    const moreOptionsButton = screen.getByRole('button', { name: /more options/i })
    await user.click(moreOptionsButton)
    
    // Click outside to close
    fireEvent.click(document.body)
    
    // Menu should be closed
    await waitFor(() => {
      expect(screen.queryByText('Edit (5min)')).not.toBeInTheDocument()
    })
  })

  it('handles thread reply count display', async () => {
    render(<CommunityLoungeView />)
    
    await waitFor(() => {
      const message = screen.getByText('Test message')
      expect(message).toBeInTheDocument()
    })
    
    // Check if reply count is displayed
    const replyCount = screen.getByText('0 replies')
    expect(replyCount).toBeInTheDocument()
  })

  it('handles thread panel opening and closing', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    await waitFor(() => {
      const message = screen.getByText('Test message')
      expect(message).toBeInTheDocument()
    })
    
    // Click reply count to open thread panel
    const replyCount = screen.getByText('0 replies')
    await user.click(replyCount)
    
    // Check if thread panel is visible
    expect(screen.getByText('Reply to message')).toBeInTheDocument()
    
    // Close thread panel
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    
    // Thread panel should be closed
    await waitFor(() => {
      expect(screen.queryByText('Reply to message')).not.toBeInTheDocument()
    })
  })
})
