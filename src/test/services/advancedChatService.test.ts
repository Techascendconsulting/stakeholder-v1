import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdvancedChatService } from '../../lib/advancedChatService'

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        })),
        insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
        update: vi.fn(() => Promise.resolve({ data: null, error: null })),
        delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
        textSearch: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          subscribe: vi.fn(() => ({ unsubscribe: vi.fn() }))
        }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null }))
    }
  }
}))

describe('AdvancedChatService', () => {
  let service: AdvancedChatService

  beforeEach(() => {
    service = new AdvancedChatService()
    vi.clearAllMocks()
  })

  describe('getThreadReplyCount', () => {
    it('should return reply count for existing thread', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockSingle = vi.fn(() => Promise.resolve({
        data: { reply_count: 5 },
        error: null
      }))
      const mockEq2 = vi.fn(() => ({ single: mockSingle }))
      const mockEq1 = vi.fn(() => ({ eq: mockEq2 }))
      const mockSelect = vi.fn(() => ({ eq: mockEq1 }))
      const mockFrom = vi.fn(() => ({ select: mockSelect }))
      supabase.from = mockFrom

      const result = await service.getThreadReplyCount(1)

      expect(result).toBe(5)
      expect(mockFrom).toHaveBeenCalledWith('message_threads')
      expect(mockSelect).toHaveBeenCalledWith('reply_count')
      expect(mockEq1).toHaveBeenCalledWith('parent_message_id', 1)
      expect(mockEq2).toHaveBeenCalledWith('parent_type', 'channel')
      expect(mockSingle).toHaveBeenCalled()
    })

    it('should return 0 for non-existent thread', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockSingle = vi.fn(() => Promise.resolve({
        data: null,
        error: { code: 'PGRST116' }
      }))
      const mockEq2 = vi.fn(() => ({ single: mockSingle }))
      const mockEq1 = vi.fn(() => ({ eq: mockEq2 }))
      const mockSelect = vi.fn(() => ({ eq: mockEq1 }))
      const mockFrom = vi.fn(() => ({ select: mockSelect }))
      supabase.from = mockFrom

      const result = await service.getThreadReplyCount(1)

      expect(result).toBe(0)
    })

    it('should handle 406 errors gracefully', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockSingle = vi.fn(() => Promise.resolve({
        data: null,
        error: { code: '406' }
      }))
      const mockEq2 = vi.fn(() => ({ single: mockSingle }))
      const mockEq1 = vi.fn(() => ({ eq: mockEq2 }))
      const mockSelect = vi.fn(() => ({ eq: mockEq1 }))
      const mockFrom = vi.fn(() => ({ select: mockSelect }))
      supabase.from = mockFrom

      const result = await service.getThreadReplyCount(1)

      expect(result).toBe(0)
    })
  })

  describe('updateThreadReplyCount', () => {
    it('should increment reply count for existing thread', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockUpdate = vi.fn(() => Promise.resolve({ data: null, error: null }))
      const mockUpdateEq = vi.fn(() => mockUpdate)

      const mockSingle = vi.fn(() => Promise.resolve({
        data: { id: 1, reply_count: 5 },
        error: null
      }))
      const mockEq2 = vi.fn(() => ({ single: mockSingle }))
      const mockEq1 = vi.fn(() => ({ eq: mockEq2 }))
      const mockSelect = vi.fn(() => ({ eq: mockEq1 }))
      
      const mockUpdateChain = vi.fn(() => ({ eq: mockUpdateEq }))
      
      const mockFrom = vi.fn()
        .mockReturnValueOnce({ select: mockSelect }) // First call returns select mock
        .mockReturnValueOnce({ update: mockUpdateChain }) // Second call returns update mock
        .mockReturnValueOnce({ insert: vi.fn() }) // Third call returns insert mock (won't be used)
      
      supabase.from = mockFrom

      await service.updateThreadReplyCount(1, true)

      // Verify the select was called
      expect(mockFrom).toHaveBeenCalledTimes(2)
      expect(mockSelect).toHaveBeenCalled()
      expect(mockSingle).toHaveBeenCalled()
      
      // Verify the update was called
      expect(mockUpdateChain).toHaveBeenCalled()
      expect(mockUpdateEq).toHaveBeenCalledWith('id', 1)
      
      // Verify the update was called with correct data
      expect(mockUpdateChain).toHaveBeenCalledWith({
        reply_count: 6,
        updated_at: expect.any(String)
      })
    })

    it('should create new thread record if not exists', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockInsert = vi.fn(() => Promise.resolve({ data: null, error: null }))

      const mockSingle = vi.fn(() => Promise.resolve({
        data: null,
        error: { code: 'PGRST116' }
      }))
      const mockEq2 = vi.fn(() => ({ single: mockSingle }))
      const mockEq1 = vi.fn(() => ({ eq: mockEq2 }))
      const mockSelect = vi.fn(() => ({ eq: mockEq1 }))
      const mockFrom = vi.fn(() => ({ 
        select: mockSelect,
        insert: mockInsert
      }))
      supabase.from = mockFrom

      await service.updateThreadReplyCount(1, true)

      expect(mockInsert).toHaveBeenCalledWith({
        parent_message_id: 1,
        parent_type: 'channel',
        reply_count: 1,
        thread_title: 'Thread for message 1'
      })
    })
  })

  describe('getUserProfile', () => {
    it('should fetch user profile', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockProfile = {
        id: 'user1',
        user_id: 'user1',
        display_name: 'Test User',
        bio: 'Test bio',
        avatar_url: 'https://example.com/avatar.jpg',
        is_public: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      const mockSingle = vi.fn(() => Promise.resolve({
        data: mockProfile,
        error: null
      }))
      const mockEq = vi.fn(() => ({ single: mockSingle }))
      const mockSelect = vi.fn(() => ({ eq: mockEq }))
      const mockFrom = vi.fn(() => ({ select: mockSelect }))
      supabase.from = mockFrom

      const result = await service.getUserProfile('user1')

      expect(result).toEqual(mockProfile)
    })
  })

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockSingle = vi.fn(() => Promise.resolve({
        data: { id: 'user1', display_name: 'Updated Name' },
        error: null
      }))
      const mockUpsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) }))
      const mockFrom = vi.fn(() => ({ upsert: mockUpsert }))
      supabase.from = mockFrom

      supabase.auth.getUser = vi.fn(() => Promise.resolve({
        data: { user: { id: 'user1' } }
      }))

      const result = await service.updateUserProfile({ display_name: 'Updated Name' })

      expect(result).toEqual({ id: 'user1', display_name: 'Updated Name' })
    })
  })

  describe('pinMessage', () => {
    it('should pin a message', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockSingle = vi.fn(() => Promise.resolve({
        data: { id: 1, message_id: 123 },
        error: null
      }))
      const mockSelect = vi.fn(() => ({ single: mockSingle }))
      const mockInsert = vi.fn(() => ({ select: mockSelect }))
      const mockFrom = vi.fn(() => ({ insert: mockInsert }))
      supabase.from = mockFrom

      supabase.auth.getUser = vi.fn(() => Promise.resolve({
        data: { user: { id: 'user1' } }
      }))

      const result = await service.pinMessage(123, 'channel')

      expect(result).toEqual({ id: 1, message_id: 123 })
    })
  })

  describe('unpinMessage', () => {
    it('should unpin a message', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockDelete = vi.fn(() => Promise.resolve({ data: null, error: null }))
      const mockEq3 = vi.fn(() => mockDelete)
      const mockEq2 = vi.fn(() => ({ eq: mockEq3 }))
      const mockEq1 = vi.fn(() => ({ eq: mockEq2 }))
      const mockDeleteFrom = vi.fn(() => ({ eq: mockEq1 }))
      const mockFrom = vi.fn(() => ({ delete: mockDeleteFrom }))
      supabase.from = mockFrom

      supabase.auth.getUser = vi.fn(() => Promise.resolve({
        data: { user: { id: 'user1' } }
      }))

      const result = await service.unpinMessage(123, 'channel')

      expect(result).toBe(true)
    })
  })

  describe('subscribeToTypingIndicators', () => {
    it('should subscribe to typing indicators', async () => {
      const { supabase } = await import('../../lib/supabase')
      const mockChannel = { unsubscribe: vi.fn() }
      const mockSubscribe = vi.fn(() => mockChannel)

      const mockChannelFn = vi.fn(() => ({
        on: vi.fn(() => ({
          subscribe: mockSubscribe
        }))
      }))
      supabase.channel = mockChannelFn

      const result = service.subscribeToTypingIndicators('1', undefined, vi.fn())

      expect(mockSubscribe).toHaveBeenCalled()
      expect(result).toBe(mockChannel)
    })
  })
})
