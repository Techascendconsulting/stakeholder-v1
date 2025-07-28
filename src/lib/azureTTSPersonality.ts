// Enhanced Azure TTS with Personality Support
import { azureTTS } from './azureTTS';
import personalityEngine, { ConversationContext, EnhancementOptions } from '../services/personalityEngine';
import contextAnalyzer from '../services/contextAnalyzer';

interface PersonalityTTSOptions {
  stakeholderId: string;
  stakeholderRole: string;
  conversationHistory: {
    userMessages: string[];
    assistantMessages: string[];
    messageCount: number;
  };
  context?: Partial<ConversationContext>;
  enhancementOptions?: Partial<EnhancementOptions>;
  useCache?: boolean;
}

interface StakeholderMapping {
  [key: string]: {
    voice: string;
    personalityId: string;
    role: string;
  };
}

class PersonalityAzureTTS {
  private stakeholderMappings: StakeholderMapping = {
    'stake-1': { // James Walker
      voice: 'en-GB-RyanNeural',
      personalityId: 'james_walker',
      role: 'Head of Customer Success'
    },
    'stake-2': { // Aisha Ahmed  
      voice: 'en-GB-MaisieNeural',
      personalityId: 'aisha_ahmed',
      role: 'Customer Service Manager'
    },
    'stake-3': { // David Thompson
      voice: 'en-GB-ThomasNeural', 
      personalityId: 'david_thompson',
      role: 'IT Systems Lead'
    },
    'stake-4': { // Sarah Patel
      voice: 'en-GB-SoniaNeural',
      personalityId: 'sarah_patel',
      role: 'UX Designer'
    },
    'stake-5': { // Emily Robinson
      voice: 'en-GB-LibbyNeural',
      personalityId: 'emily_robinson',
      role: 'Marketing Director'
    }
  };

  /**
   * Synthesize speech with personality enhancement
   */
  async synthesizeWithPersonality(
    text: string,
    options: PersonalityTTSOptions
  ): Promise<Blob> {
    console.log(`🎭 Synthesizing with personality for ${options.stakeholderId}:`, text);

    try {
      // Get stakeholder mapping
      const mapping = this.stakeholderMappings[options.stakeholderId];
      if (!mapping) {
        console.warn(`⚠️ No personality mapping found for ${options.stakeholderId}, using basic TTS`);
        return await azureTTS.synthesizeSpeech(text, 'en-GB-LibbyNeural', options.useCache);
      }

      // Generate conversation context
      const context = this.generateContext(text, options, mapping);
      
      // Generate personality-enhanced SSML
      const personalizedSSML = personalityEngine.generatePersonalizedSSML(
        text,
        mapping.personalityId,
        context,
        options.enhancementOptions || {}
      );

      // Use direct SSML synthesis
      const audioBlob = await this.synthesizeSSML(personalizedSSML, options.useCache);
      
      console.log(`✅ Successfully synthesized personality speech for ${mapping.personalityId}`);
      return audioBlob;

    } catch (error) {
      console.error(`❌ Error in personality synthesis for ${options.stakeholderId}:`, error);
      // Fallback to basic synthesis
      const mapping = this.stakeholderMappings[options.stakeholderId];
      const fallbackVoice = mapping?.voice || 'en-GB-LibbyNeural';
      return await azureTTS.synthesizeSpeech(text, fallbackVoice, options.useCache);
    }
  }

  /**
   * Generate conversation context for personality engine
   */
  private generateContext(
    text: string,
    options: PersonalityTTSOptions,
    mapping: StakeholderMapping[string]
  ): ConversationContext {
    // If context is provided, use it
    if (options.context) {
      return {
        type: 'explanation',
        emotion: 'friendly',
        complexity: 0.5,
        isFirstMessage: false,
        messageHistory: [],
        ...options.context
      };
    }

    // Generate context using analyzer
    return contextAnalyzer.generateConversationContext(
      text,
      options.conversationHistory,
      mapping.role
    );
  }

  /**
   * Synthesize SSML directly (bypassing the basic createSSML)
   */
  private async synthesizeSSML(ssml: string, useCache: boolean = true): Promise<Blob> {
    const config = {
      subscriptionKey: import.meta.env.VITE_AZURE_TTS_KEY,
      region: import.meta.env.VITE_AZURE_TTS_REGION || 'eastus',
      endpoint: `https://${import.meta.env.VITE_AZURE_TTS_REGION || 'eastus'}.tts.speech.microsoft.com/cognitiveservices/v1`
    };

    if (!config.subscriptionKey) {
      throw new Error('Azure TTS not configured. Please add VITE_AZURE_TTS_KEY to your environment variables.');
    }

    // Generate cache key from SSML content
    const cacheKey = this.generateCacheKey(ssml);
    
    // Check cache first (reusing azureTTS cache)
    if (useCache && (azureTTS as any).audioCache?.has(cacheKey)) {
      return (azureTTS as any).audioCache.get(cacheKey);
    }

    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': config.subscriptionKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'BA-Training-Platform-Personality'
        },
        body: ssml
      });

      if (!response.ok) {
        throw new Error(`Azure TTS request failed: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();

      if (audioBlob.size === 0) {
        throw new Error('Azure TTS returned empty audio data');
      }

      // Cache the result
      if (useCache && (azureTTS as any).audioCache) {
        (azureTTS as any).audioCache.set(cacheKey, audioBlob);
      }

      return audioBlob;

    } catch (error) {
      console.error('SSML synthesis error:', error);
      throw error;
    }
  }

  /**
   * Generate cache key for SSML content
   */
  private generateCacheKey(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Quick synthesis for simple responses (uses minimal personality)
   */
  async synthesizeQuick(
    text: string,
    stakeholderId: string,
    emotion: ConversationContext['emotion'] = 'friendly'
  ): Promise<Blob> {
    const mapping = this.stakeholderMappings[stakeholderId];
    if (!mapping) {
      return await azureTTS.synthesizeSpeech(text);
    }

    return await this.synthesizeWithPersonality(text, {
      stakeholderId,
      stakeholderRole: mapping.role,
      conversationHistory: {
        userMessages: [],
        assistantMessages: [],
        messageCount: 0
      },
      context: {
        type: 'explanation',
        emotion,
        complexity: 0.3,
        isFirstMessage: false,
        messageHistory: []
      },
      enhancementOptions: {
        addFillers: false,
        addPauses: true,
        adjustEmotion: true,
        emphasizeKeywords: true,
        useTransitions: false
      }
    });
  }

  /**
   * Greeting synthesis with enhanced personality
   */
  async synthesizeGreeting(
    text: string,
    stakeholderId: string
  ): Promise<Blob> {
    const mapping = this.stakeholderMappings[stakeholderId];
    if (!mapping) {
      return await azureTTS.synthesizeSpeech(text);
    }

    return await this.synthesizeWithPersonality(text, {
      stakeholderId,
      stakeholderRole: mapping.role,
      conversationHistory: {
        userMessages: [],
        assistantMessages: [],
        messageCount: 0
      },
      context: {
        type: 'greeting',
        emotion: 'friendly',
        complexity: 0.2,
        isFirstMessage: true,
        messageHistory: []
      },
      enhancementOptions: {
        addFillers: true,
        addPauses: true,
        adjustEmotion: true,
        emphasizeKeywords: false,
        useTransitions: false
      }
    });
  }

  /**
   * Technical explanation with thoughtful personality
   */
  async synthesizeTechnical(
    text: string,
    stakeholderId: string,
    complexity: number = 0.8
  ): Promise<Blob> {
    const mapping = this.stakeholderMappings[stakeholderId];
    if (!mapping) {
      return await azureTTS.synthesizeSpeech(text);
    }

    return await this.synthesizeWithPersonality(text, {
      stakeholderId,
      stakeholderRole: mapping.role,
      conversationHistory: {
        userMessages: [],
        assistantMessages: [],
        messageCount: 1
      },
      context: {
        type: 'technical_explanation',
        emotion: 'thoughtful',
        complexity,
        isFirstMessage: false,
        messageHistory: []
      },
      enhancementOptions: {
        addFillers: true,
        addPauses: true,
        adjustEmotion: true,
        emphasizeKeywords: true,
        useTransitions: true
      }
    });
  }

  /**
   * Empathetic response for frustrated users
   */
  async synthesizeEmpathetic(
    text: string,
    stakeholderId: string
  ): Promise<Blob> {
    const mapping = this.stakeholderMappings[stakeholderId];
    if (!mapping) {
      return await azureTTS.synthesizeSpeech(text);
    }

    return await this.synthesizeWithPersonality(text, {
      stakeholderId,
      stakeholderRole: mapping.role,
      conversationHistory: {
        userMessages: ['This is frustrating', 'It\'s not working'],
        assistantMessages: [],
        messageCount: 2
      },
      context: {
        type: 'acknowledgment',
        emotion: 'empathetic',
        userMood: 'frustrated',
        complexity: 0.4,
        isFirstMessage: false,
        messageHistory: []
      },
      enhancementOptions: {
        addFillers: true,
        addPauses: true,
        adjustEmotion: true,
        emphasizeKeywords: false,
        useTransitions: false
      }
    });
  }

  /**
   * Get available personalities
   */
  getAvailablePersonalities(): Array<{
    id: string;
    name: string;
    role: string;
    voice: string;
  }> {
    return Object.entries(this.stakeholderMappings).map(([id, mapping]) => ({
      id,
      name: personalityEngine.getPersonality(mapping.personalityId)?.name || 'Unknown',
      role: mapping.role,
      voice: mapping.voice
    }));
  }

  /**
   * Update stakeholder mapping (for dynamic configuration)
   */
  updateStakeholderMapping(stakeholderId: string, mapping: StakeholderMapping[string]): void {
    this.stakeholderMappings[stakeholderId] = mapping;
    console.log(`🎭 Updated personality mapping for ${stakeholderId}:`, mapping);
  }

  /**
   * Check if personality is available for stakeholder
   */
  hasPersonality(stakeholderId: string): boolean {
    return !!this.stakeholderMappings[stakeholderId];
  }

  /**
   * Get personality info for stakeholder
   */
  getPersonalityInfo(stakeholderId: string) {
    const mapping = this.stakeholderMappings[stakeholderId];
    if (!mapping) return null;

    return {
      ...mapping,
      personality: personalityEngine.getPersonality(mapping.personalityId)
    };
  }
}

export default new PersonalityAzureTTS();
export { PersonalityTTSOptions };