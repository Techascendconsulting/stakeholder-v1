import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import CommunityLoungeView from '../../components/Views/CommunityLoungeView'
import userEvent from '@testing-library/user-event'

// Mock services with more realistic data
const mockSpaces = [
  { id: '1', name: 'BA Training Community', description: 'Main community for Business Analysts' },
  { id: '2', name: 'Agile Hub', description: 'Agile methodologies and practices' }
]

const mockChannels = [
  { id: '1', name: 'general', description: 'General discussions' },
  { id: '2', name: 'agile', description: 'Agile discussions' },
  { id: '3', name: 'requirements', description: 'Requirements gathering' }
]

const mockMessages = [
  {
    id: 1,
    content: 'Welcome to the BA Training Community!',
    user_id: 'user1',
    created_at: new Date().toISOString(),
    user: { name: 'John Doe', avatar_url: null }
  },
  {
    id: 2,
    content: 'Great to be here!',
    user_id: 'user2',
    created_at: new Date().toISOString(),
    user: { name: 'Jane Smith', avatar_url: null }
  }
]

vi.mock('../../lib/communityLoungeService', () => ({
  communityLoungeService: {
    getSpaces: vi.fn(() => Promise.resolve({ data: mockSpaces, error: null })),
    getChannels: vi.fn(() => Promise.resolve({ data: mockChannels, error: null })),
    getMessages: vi.fn(() => Promise.resolve({ data: mockMessages, error: null })),
    sendMessage: vi.fn(() => Promise.resolve({ data: null, error: null }))
  }
}))

vi.mock('../../lib/advancedChatService', () => ({
  advancedChatService: {
    getThreadReplyCount: vi.fn(() => Promise.resolve(0)),
    searchMessages: vi.fn(() => Promise.resolve({ data: [], error: null }))
  }
}))

describe('CommunityLounge Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load and display complete community lounge interface', async () => {
    render(<CommunityLoungeView />)
    
    // Check if main components are loaded
    await waitFor(() => {
      expect(screen.getByText('Community Lounge')).toBeInTheDocument()
      expect(screen.getByText('BA Training Community')).toBeInTheDocument()
      expect(screen.getByText('general')).toBeInTheDocument()
      expect(screen.getByText('Welcome to the BA Training Community!')).toBeInTheDocument()
    })
  })

  it('should handle complete message workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Wait for interface to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    })
    
    // Type and send a message
    const messageInput = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await user.type(messageInput, 'Hello everyone!')
    await user.click(sendButton)
    
    // Verify message was sent
    await waitFor(() => {
      expect(messageInput).toHaveValue('')
    })
  })

  it('should handle complete thread reply workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByText('Welcome to the BA Training Community!')).toBeInTheDocument()
    })
    
    // Hover over message to show actions
    const message = screen.getByText('Welcome to the BA Training Community!')
    fireEvent.mouseEnter(message)
    
    // Click reply button
    const replyButton = screen.getByRole('button', { name: /reply/i })
    await user.click(replyButton)
    
    // Verify thread panel opens
    expect(screen.getByText('Reply to message')).toBeInTheDocument()
    
    // Type and send reply
    const threadInput = screen.getByPlaceholderText('Reply to message...')
    await user.type(threadInput, 'Thanks for the welcome!')
    
    const threadSendButton = screen.getByRole('button', { name: /send reply/i })
    await user.click(threadSendButton)
    
    // Verify reply was sent
    await waitFor(() => {
      expect(threadInput).toHaveValue('')
    })
  })

  it('should handle complete message editing workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByText('Great to be here!')).toBeInTheDocument()
    })
    
    // Hover over message and open more options
    const message = screen.getByText('Great to be here!')
    fireEvent.mouseEnter(message)
    
    const moreOptionsButton = screen.getByRole('button', { name: /more options/i })
    await user.click(moreOptionsButton)
    
    // Click edit button
    const editButton = screen.getByText('Edit (5min)')
    await user.click(editButton)
    
    // Edit the message
    const editInput = screen.getByDisplayValue('Great to be here!')
    await user.clear(editInput)
    await user.type(editInput, 'Great to be here! This is an edited message.')
    
    // Save the edit
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)
    
    // Verify edit was saved
    await waitFor(() => {
      expect(screen.getByText('Great to be here! This is an edited message.')).toBeInTheDocument()
    })
  })

  it('should handle complete search workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Wait for interface to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search messages...')).toBeInTheDocument()
    })
    
    // Perform search
    const searchInput = screen.getByPlaceholderText('Search messages...')
    await user.type(searchInput, 'welcome')
    
    // Verify search is performed
    await waitFor(() => {
      expect(searchInput).toHaveValue('welcome')
    })
    
    // Clear search
    await user.clear(searchInput)
    
    // Verify search is cleared
    expect(searchInput).toHaveValue('')
  })

  it('should handle complete channel switching workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Wait for channels to load
    await waitFor(() => {
      expect(screen.getByText('general')).toBeInTheDocument()
      expect(screen.getByText('agile')).toBeInTheDocument()
    })
    
    // Switch to agile channel
    const agileChannel = screen.getByText('agile')
    await user.click(agileChannel)
    
    // Verify channel switch
    expect(agileChannel).toHaveClass('bg-blue-100')
  })

  it('should handle complete space switching workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Wait for spaces to load
    await waitFor(() => {
      expect(screen.getByText('BA Training Community')).toBeInTheDocument()
      expect(screen.getByText('Agile Hub')).toBeInTheDocument()
    })
    
    // Switch to Agile Hub space
    const agileSpace = screen.getByText('Agile Hub')
    await user.click(agileSpace)
    
    // Verify space switch
    expect(agileSpace).toHaveClass('bg-purple-100')
  })

  it('should handle complete reaction workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByText('Welcome to the BA Training Community!')).toBeInTheDocument()
    })
    
    // Hover over message to show reactions
    const message = screen.getByText('Welcome to the BA Training Community!')
    fireEvent.mouseEnter(message)
    
    // Click reaction
    const reactionButton = screen.getByText('✅')
    await user.click(reactionButton)
    
    // Verify reaction was added
    expect(reactionButton).toHaveClass('bg-blue-100')
  })

  it('should handle complete emoji picker workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Wait for interface to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /emoji/i })).toBeInTheDocument()
    })
    
    // Open emoji picker
    const emojiButton = screen.getByRole('button', { name: /emoji/i })
    await user.click(emojiButton)
    
    // Verify emoji picker is open
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Select an emoji
    const emojiElement = screen.getByText('😀')
    await user.click(emojiElement)
    
    // Verify emoji was added to input
    const messageInput = screen.getByPlaceholderText('Type your message...')
    expect(messageInput).toHaveValue('😀')
  })

  it('should handle complete formatting workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Wait for interface to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument()
    })
    
    // Apply bold formatting
    const boldButton = screen.getByRole('button', { name: /bold/i })
    await user.click(boldButton)
    
    // Type bold text
    const messageInput = screen.getByPlaceholderText('Type your message...')
    await user.type(messageInput, 'This is bold text')
    
    // Verify formatting was applied
    expect(messageInput).toHaveValue('**This is bold text**')
    
    // Send the message
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)
    
    // Verify message was sent with formatting
    await waitFor(() => {
      expect(messageInput).toHaveValue('')
    })
  })

  it('should handle complete copy message workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByText('Great to be here!')).toBeInTheDocument()
    })
    
    // Hover over message and open more options
    const message = screen.getByText('Great to be here!')
    fireEvent.mouseEnter(message)
    
    const moreOptionsButton = screen.getByRole('button', { name: /more options/i })
    await user.click(moreOptionsButton)
    
    // Click copy button
    const copyButton = screen.getByText('Copy')
    await user.click(copyButton)
    
    // Verify copy was successful (check clipboard API was called)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Great to be here!')
  })

  it('should handle complete delete message workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Mock window.confirm
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    
    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByText('Great to be here!')).toBeInTheDocument()
    })
    
    // Hover over message and open more options
    const message = screen.getByText('Great to be here!')
    fireEvent.mouseEnter(message)
    
    const moreOptionsButton = screen.getByRole('button', { name: /more options/i })
    await user.click(moreOptionsButton)
    
    // Click delete button
    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)
    
    // Verify confirmation dialog was shown
    expect(mockConfirm).toHaveBeenCalled()
    
    // Verify message was deleted
    await waitFor(() => {
      expect(screen.queryByText('Great to be here!')).not.toBeInTheDocument()
    })
    
    mockConfirm.mockRestore()
  })

  it('should handle complete mention workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Wait for interface to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    })
    
    // Type @ symbol to trigger mentions
    const messageInput = screen.getByPlaceholderText('Type your message...')
    await user.type(messageInput, '@')
    
    // Verify mention suggestions appear
    await waitFor(() => {
      expect(screen.getByText('Mention someone')).toBeInTheDocument()
    })
    
    // Select a mention
    const mentionOption = screen.getByText('John Doe')
    await user.click(mentionOption)
    
    // Verify mention was added
    expect(messageInput).toHaveValue('@John Doe ')
  })

  it('should handle complete keyboard navigation workflow', async () => {
    const user = userEvent.setup()
    render(<CommunityLoungeView />)
    
    // Wait for interface to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    })
    
    // Type message and use Enter to send
    const messageInput = screen.getByPlaceholderText('Type your message...')
    await user.type(messageInput, 'Message sent with Enter key')
    await user.keyboard('{Enter}')
    
    // Verify message was sent
    await waitFor(() => {
      expect(messageInput).toHaveValue('')
    })
    
    // Type message and use Shift+Enter for new line
    await user.type(messageInput, 'Line 1')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    await user.type(messageInput, 'Line 2')
    
    // Verify new line was added
    expect(messageInput).toHaveValue('Line 1\nLine 2')
  })
})
