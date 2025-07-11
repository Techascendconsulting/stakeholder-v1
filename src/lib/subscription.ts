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
        .single()

      if (error) {
        if (error.code === '42P01') {
          console.warn('Students table not yet created. Please run the SQL setup script in Supabase.')
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
      const isAdmin = email === 'admin@batraining.com'
      
      const { data, error } = await supabase
        .from('students')
        .insert({
          id: userId,
          name,
          email,
          subscription_tier: isAdmin ? 'enterprise' : 'free',
          subscription_status_active: true,
          meeting_count: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating student record:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  }

  async updateStudentSubscription(userId: string, updates: Partial<StudentSubscription>): Promise<StudentSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating student subscription:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  }

  async selectProject(userId: string, projectId: string): Promise<boolean> {
    try {
      const student = await this.getStudentSubscription(userId)
      if (!student) return false

      // For free users, lock the project selection
      if (student.subscription_tier === 'free') {
        if (student.selected_project_id && student.selected_project_id !== projectId) {
          throw new Error('Free users can only access one project. Upgrade to Premium to access more projects.')
        }
      }

      await this.updateStudentSubscription(userId, {
        selected_project_id: projectId
      })

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
    if (!student) return false

    switch (student.subscription_tier) {
      case 'free':
        // Free users can only access their selected project
        return student.selected_project_id === projectId || !student.selected_project_id
      case 'premium':
        // Premium users can access up to 2 projects
        return true // We'll implement project limit logic later
      case 'enterprise':
        // Enterprise users can access all projects
        return true
      default:
        return false
    }
  }

  canSaveNotes(student: StudentSubscription | null): boolean {
    if (!student) return false
    return student.subscription_tier !== 'free'
  }

  canCreateMoreMeetings(student: StudentSubscription | null): boolean {
    if (!student) return false
    
    if (student.subscription_tier === 'free') {
      return student.meeting_count < 2
    }
    
    return true // Premium and Enterprise have unlimited meetings
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