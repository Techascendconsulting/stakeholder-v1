import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface MotivationAudio {
  id: string
  title: string
  description: string
  url: string
  duration: number
  type: 'music' | 'talk'
  icon: string
  tags?: string[]
}

export class MotivationAudioService {
  private static instance: MotivationAudioService
  private audioCache: Map<string, string> = new Map()

  static getInstance(): MotivationAudioService {
    if (!MotivationAudioService.instance) {
      MotivationAudioService.instance = new MotivationAudioService()
    }
    return MotivationAudioService.instance
  }

  /**
   * Get the public URL for an audio file from Supabase storage
   */
  async getAudioUrl(fileName: string): Promise<string> {
    // Check cache first
    if (this.audioCache.has(fileName)) {
      return this.audioCache.get(fileName)!
    }

    try {
      const { data } = supabase.storage
        .from('community-files')
        .getPublicUrl(`audio/${fileName}`)

      const publicUrl = data.publicUrl
      this.audioCache.set(fileName, publicUrl)
      
      console.log(`🎵 Motivation Audio Service: Retrieved URL for ${fileName}`)
      return publicUrl
    } catch (error) {
      console.error(`❌ Error getting audio URL for ${fileName}:`, error)
      throw error
    }
  }

  /**
   * Get all available motivation audio files
   */
  async getAvailableAudio(): Promise<MotivationAudio[]> {
    try {
      const { data: files, error } = await supabase.storage
        .from('community-files')
        .list('audio')

      if (error) {
        throw error
      }

      console.log(`🎵 Motivation Audio Service: Found ${files.length} audio files`)
      return files.map(file => ({
        id: file.name,
        title: this.getTitleFromFileName(file.name),
        description: this.getDescriptionFromFileName(file.name),
        url: '', // Will be populated by getAudioUrl
        duration: this.getDurationFromFileName(file.name),
        type: this.getTypeFromFileName(file.name),
        icon: this.getIconFromFileName(file.name)
      }))
    } catch (error) {
      console.error('❌ Error getting available audio:', error)
      return []
    }
  }

  /**
   * Check if an audio file exists in storage
   */
  async audioExists(fileName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from('community-files')
        .list('audio', {
          search: fileName
        })

      return !error && data && data.length > 0
    } catch (error) {
      console.error(`❌ Error checking if audio exists: ${fileName}`, error)
      return false
    }
  }

  private getTitleFromFileName(fileName: string): string {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
    return nameWithoutExt
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private getDescriptionFromFileName(fileName: string): string {
    const title = this.getTitleFromFileName(fileName)
    return `Listen to ${title} for motivation and inspiration`
  }

  private getDurationFromFileName(fileName: string): number {
    // Default durations based on file type
    if (fileName.includes('overwhelm')) return 8
    if (fileName.includes('motivation')) return 6
    if (fileName.includes('music')) return 15
    return 5
  }

  private getTypeFromFileName(fileName: string): 'music' | 'talk' {
    if (fileName.includes('music') || fileName.includes('ambient') || fileName.includes('piano')) {
      return 'music'
    }
    return 'talk'
  }

  private getIconFromFileName(fileName: string): string {
    if (fileName.includes('music') || fileName.includes('ambient') || fileName.includes('piano')) {
      return 'Music'
    }
    return 'Mic'
  }
}

export const motivationAudioService = MotivationAudioService.getInstance()