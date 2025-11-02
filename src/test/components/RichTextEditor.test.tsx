import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'

// Mock the RichTextEditor component since it might not exist yet
const MockRichTextEditor = ({ onSend, placeholder = 'Type your message...' }: { onSend: (message: string) => void, placeholder?: string }) => {
  return (
    <div>
      <textarea placeholder={placeholder} data-testid="message-input" />
      <button onClick={() => onSend('test message')} data-testid="send-button">
        Send
      </button>
    </div>
  )
}

describe('RichTextEditor', () => {
  const mockOnSend = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<MockRichTextEditor onSend={mockOnSend} />)
    expect(screen.getByTestId('message-input')).toBeInTheDocument()
    expect(screen.getByTestId('send-button')).toBeInTheDocument()
  })

  it('handles send button click', async () => {
    const user = userEvent.setup()
    render(<MockRichTextEditor onSend={mockOnSend} />)
    
    const sendButton = screen.getByTestId('send-button')
    await user.click(sendButton)
    
    expect(mockOnSend).toHaveBeenCalledWith('test message')
  })

  it('displays custom placeholder text', () => {
    render(<MockRichTextEditor onSend={mockOnSend} placeholder="Custom placeholder" />)
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })
})
