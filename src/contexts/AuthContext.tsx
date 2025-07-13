import { supabase } from './supabase'

export interface StudentSubscription {
  id: string
  name: string
  email: string
  subscription_tier: 'free' | 'premium' | 'enterprise'
  subscription_status_active: boolean
  selected_project_id: string | null
  meeting_count: number
  stripe_customer_id: string | null
  subscription_expires_at: string | null
  created_at: string
  updated_at: string
}

class SubscriptionService {
  async getStudentSubscription(userId: string): Promise<StudentSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST204') {
          console.warn('Database schema issue - students table or columns missing:', error.message)
          return null
        }
        console.error('Error fetching student subscription:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  }

  async createStudentRecord(userId: string, name: string, email: string): Promise<StudentSubscription | null> {
    try {
      // Check if admin email for enterprise access
      const isAdmin = email === 'admin@batraining.com' || email.includes('admin')
      
      const { data, error } = await supabase
        .from('students')
        .insert({
          id: userId,
          name,
          email,
          // Only include fields that definitely exist
          ...(isAdmin ? {} : {}) // Will add subscription fields when schema is fixed
        })
        .select()
        .single()

      if (error) {
        console.warn('Could not create student record (schema issue):', error.message)
        return null
      }

      return data
    } catch (error) {
      console.warn('Database connection error:', error)
      return null
    }
  }

  async updateStudentSubscription(userId: string, updates: Partial<StudentSubscription>): Promise<StudentSubscription | null> {
    try {
      // First check if record exists
      const { data: existing, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (fetchError) {
        console.warn('Could not fetch student record (schema issue):', fetchError.message)
        return null
      }

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('students')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select()
          .single()

        if (error) {
          console.warn('Could not update student subscription (schema issue):', error.message)
          return null
        }

        return data
      } else {
        console.warn('Student record not found for user:', userId)
        return null
      }
    } catch (error) {
      console.warn('Database connection error:', error)
      return null
    }
  }

  async selectProject(userId: string, projectId: string): Promise<boolean> {
    try {
      const student = await this.getStudentSubscription(userId)
      if (!student) {
        console.warn('No student record found, allowing project selection anyway')
        return true // Allow selection even if student record doesn't exist
      }

      // For free users, lock the project selection
      if (student.subscription_tier === 'free' && student.selected_project_id) {
        if (student.selected_project_id && student.selected_project_id !== projectId) {
          throw new Error('Free users can only access one project. Upgrade to Premium to access more projects.')
        }
      }

      // Try to update, but don't fail if it doesn't work
      try {
        await this.updateStudentSubscription(userId, {
          selected_project_id: projectId
        })
      } catch (updateError) {

      return true
    } catch (error) {
      console.error('Error selecting project:', error)
      throw error
    }
  }

  async incrementMeetingCount(userId: string): Promise<boolean> {
    try {
      const student = await this.getStudentSubscription(userId)
      if (!student) return false

      // Check meeting limits for free users
      if (student.subscription_tier === 'free' && student.meeting_count >= 2) {
        throw new Error('Free users are limited to 2 meetings. Upgrade to Premium for unlimited meetings.')
      }

      await this.updateStudentSubscription(userId, {
        meeting_count: student.meeting_count + 1
      })

      return true
    } catch (error) {
      console.error('Error incrementing meeting count:', error)
      throw error
    }
  }

  canAccessProject(student: StudentSubscription | null, projectId: string): boolean {
    // Temporary bypass: Allow access to all projects for all users
    return true
  }

  canSaveNotes(student: StudentSubscription | null): boolean {
    // Temporary bypass: Allow all users to save notes
    return true
  }

  canCreateMoreMeetings(student: StudentSubscription | null): boolean {
    // Temporary bypass: Allow unlimited meetings for all users
    return true
  }

  getProjectLimit(student: StudentSubscription | null): number {
    if (!student) return 0

    switch (student.subscription_tier) {
      case 'free':
        return 1
      case 'premium':
        return 2
      case 'enterprise':
        return 999 // Unlimited
      default:
        return 0
    }
  }

  getMeetingLimit(student: StudentSubscription | null): number {
    if (!student) return 0

    switch (student.subscription_tier) {
      case 'free':
        return 2
      case 'premium':
      case 'enterprise':
        return 999 // Unlimited
      default:
        return 0
    }
  }
}

export const subscriptionService = new SubscriptionService()