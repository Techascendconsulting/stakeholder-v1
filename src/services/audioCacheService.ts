// Persistent audio cache service using IndexedDB
// This stores audio blobs permanently to avoid repeated ElevenLabs API calls

interface AudioCacheEntry {
  id: string;
  text: string;
  voiceId: string;
  audioBlob: Blob;
  timestamp: number;
  meetingType: string;
}

class AudioCacheService {
  private dbName = 'StakeholderAudioCache';
  private dbVersion = 1;
  private storeName = 'audioCache';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ AUDIO CACHE: Failed to open IndexedDB');
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ AUDIO CACHE: IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('voiceId', 'voiceId', { unique: false });
          store.createIndex('meetingType', 'meetingType', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('✅ AUDIO CACHE: Created object store and indexes');
        }
      };
    });
  }

  private generateCacheKey(text: string, voiceId: string, meetingType: string = 'refinement'): string {
    // Create a hash-like key for consistent storage
    const textHash = this.simpleHash(text);
    return `${meetingType}:${voiceId}:${textHash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  async storeAudio(text: string, voiceId: string, audioBlob: Blob, meetingType: string = 'refinement'): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    const id = this.generateCacheKey(text, voiceId, meetingType);
    const entry: AudioCacheEntry = {
      id,
      text,
      voiceId,
      audioBlob,
      timestamp: Date.now(),
      meetingType
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      request.onsuccess = () => {
        console.log(`💾 AUDIO CACHE: Stored audio for "${text.substring(0, 30)}..." (${audioBlob.size} bytes)`);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ AUDIO CACHE: Failed to store audio');
        reject(new Error('Failed to store audio'));
      };
    });
  }

  async getAudio(text: string, voiceId: string, meetingType: string = 'refinement'): Promise<Blob | null> {
    if (!this.db) {
      await this.init();
    }

    const id = this.generateCacheKey(text, voiceId, meetingType);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as AudioCacheEntry | undefined;
        if (result) {
          console.log(`🎵 AUDIO CACHE: Found cached audio for "${text.substring(0, 30)}..." (${result.audioBlob.size} bytes)`);
          resolve(result.audioBlob);
        } else {
          console.log(`🔍 AUDIO CACHE: No cached audio found for "${text.substring(0, 30)}..."`);
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('❌ AUDIO CACHE: Failed to retrieve audio');
        reject(new Error('Failed to retrieve audio'));
      };
    });
  }

  async preGenerateRefinementMeetingAudio(): Promise<void> {
    console.log('🎬 AUDIO CACHE: Starting pre-generation of refinement meeting audio...');
    
    // Import the refinement service to get team members and responses
    const AgileRefinementService = (await import('./agileRefinementService')).default;
    const { synthesizeToBlob } = await import('./elevenLabsTTS');
    
    const aiService = AgileRefinementService.getInstance();
    const teamMembers = aiService.getTeamMembers();
    
    // Define the standard refinement meeting responses
    const responses = [
      {
        speaker: 'Sarah',
        text: "Good morning everyone. We have 1 story to review today. Bola, would you like to present the first story for us? I'll mark it as refined once we're done discussing it."
      },
      {
        speaker: 'Bola',
        text: "Thank you Sarah. I'd like to present our first story: 'Tenant can upload attachments to support maintenance request'. As a tenant, I want to upload attachments like photos, documents, or videos when submitting a maintenance request, so that I can provide visual evidence and detailed information to help the maintenance team understand the issue better. The acceptance criteria include: 1) Users can upload multiple file types including images, PDFs, and videos, 2) File size limit of 10MB per attachment with a maximum of 5 attachments per request, 3) Users can preview uploaded files before submitting, 4) System validates file types and shows clear error messages for invalid files, 5) Uploaded files are securely stored and accessible to maintenance staff, and 6) Users can remove or replace attachments before final submission."
      },
      {
        speaker: 'Srikanth',
        text: "Bola, quick question - when you mentioned multiple file types, are we talking about users uploading multiple files at once, or just supporting different formats one at a time?"
      },
      {
        speaker: 'Bola',
        text: "Good question Srikanth. Yes, users should be able to upload multiple files at once - up to 5 attachments per maintenance request. So a tenant could upload, for example, 3 photos of the issue, a PDF document with additional details, and a video showing the problem. This gives them flexibility to provide comprehensive evidence for their maintenance request."
      },
      {
        speaker: 'Lisa',
        text: "Srikanth, for the file storage, should we use cloud storage or local storage? And do we need to implement any virus scanning for uploaded files?"
      },
      {
        speaker: 'Srikanth',
        text: "Good point Lisa. I think we should use cloud storage for scalability and implement basic virus scanning. We can use AWS S3 for storage and integrate with a scanning service. The 10MB limit per file seems reasonable, but we should also consider total request size limits."
      },
      {
        speaker: 'Tom',
        text: "For testing, we'll need to cover file upload scenarios, validation, error handling, and security. I'll create test cases for different file types, sizes, and edge cases like network interruptions during upload."
      },
      {
        speaker: 'Sarah',
        text: "Great discussion team. Based on what I'm hearing, this looks like a 5-point story. Srikanth, do you agree with that estimate?"
      },
      {
        speaker: 'Srikanth',
        text: "Yes, 5 points sounds right. The file upload functionality, validation, cloud storage integration, and security considerations make this a solid 5-point story."
      },
      {
        speaker: 'Sarah',
        text: "Perfect. I'm moving this story to the Refined column. Great work everyone, that concludes our refinement meeting for today."
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const response of responses) {
      try {
        const teamMember = teamMembers.find(member => member.name === response.speaker);
        if (!teamMember) {
          console.warn(`⚠️ AUDIO CACHE: Team member ${response.speaker} not found`);
          continue;
        }

        // Check if we already have this audio cached
        const existingAudio = await this.getAudio(response.text, teamMember.voiceId, 'refinement');
        if (existingAudio) {
          console.log(`✅ AUDIO CACHE: Audio already exists for ${response.speaker}`);
          successCount++;
          continue;
        }

        // Generate new audio
        const audioBlob = await synthesizeToBlob(response.text, {
          stakeholderName: teamMember.name,
          voiceId: teamMember.voiceId
        });

        // Store in cache
        await this.storeAudio(response.text, teamMember.voiceId, audioBlob, 'refinement');
        successCount++;
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ AUDIO CACHE: Failed to pre-generate audio for ${response.speaker}:`, error);
        errorCount++;
      }
    }

    console.log(`🎬 AUDIO CACHE: Pre-generation complete. Success: ${successCount}, Errors: ${errorCount}`);
  }

  async clearCache(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🧹 AUDIO CACHE: Cleared all cached audio');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ AUDIO CACHE: Failed to clear cache');
        reject(new Error('Failed to clear cache'));
      };
    });
  }

  async getCacheStats(): Promise<{ totalEntries: number; totalSize: number; entriesByVoice: Record<string, number> }> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result as AudioCacheEntry[];
        const totalSize = entries.reduce((sum, entry) => sum + entry.audioBlob.size, 0);
        const entriesByVoice = entries.reduce((acc, entry) => {
          acc[entry.voiceId] = (acc[entry.voiceId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        resolve({
          totalEntries: entries.length,
          totalSize,
          entriesByVoice
        });
      };

      request.onerror = () => {
        reject(new Error('Failed to get cache stats'));
      };
    });
  }
}

// Export singleton instance
export const audioCacheService = new AudioCacheService();
export default audioCacheService;
