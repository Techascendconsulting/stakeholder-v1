import OpenAI from 'openai';
import { Message } from '../types';
import SessionCacheService from './sessionCache';
import { MODEL, API_CONFIG, CLIENT_CONFIG } from '../config/openai.config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  ...CLIENT_CONFIG
});

// Helper to create OpenAI API parameters
const createCompletionParams = (messages: any[], dynamicConfig?: any) => ({
  ...API_CONFIG,
  messages,
  ...(dynamicConfig && {
    temperature: dynamicConfig.temperature || API_CONFIG.temperature,
    max_tokens: dynamicConfig.maxTokens || API_CONFIG.max_tokens
  })
});

class AIService {
  private static readonly CONFIG = {
    // OpenAI API configuration
    api: {
      base: API_CONFIG,
      greeting: { ...API_CONFIG, temperature: 0.7, max_tokens: 50 },
      conversation: { ...API_CONFIG },
      phaseDetection: { ...API_CONFIG, temperature: 0.1, max_tokens: 10 },
      noteGeneration: { ...API_CONFIG, temperature: 0.2, max_tokens: 200 }
    }
  };

  // Main conversation method
  public static async getResponse(userMessage: string, context: any = {}): Promise<string> {
    try {
      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage }
      ];

      const completion = await openai.chat.completions.create(
        createCompletionParams(messages)
      );

      return completion.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";
    } catch (error) {
      console.error('Error in getResponse:', error);
      return "I apologize, there was an error processing your request.";
    }
  }
}