import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  timeout: 8000,     // 8 second timeout
  maxRetries: 1,     // Only retry once
  defaultHeaders: {  // Optimize headers
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Use GPT-3.5-turbo for faster responses
const MODEL = "gpt-3.5-turbo";

// Default API parameters for faster responses
const DEFAULT_API_PARAMS = {
  model: MODEL,
  temperature: 0.3,
  max_tokens: 130,    // Keep responses concise but meaningful
  presence_penalty: 0,
  frequency_penalty: 0,
  stream: false       // Disable streaming for faster responses
};

// Helper for creating API parameters
const createApiParams = (messages: any[], overrides = {}) => ({
  ...DEFAULT_API_PARAMS,
  messages,
  ...overrides  // This will override any duplicate keys from DEFAULT_API_PARAMS
});

class AIService {
  private static instance: AIService;
  
  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async generateResponse(userMessage: string, systemPrompt?: string): Promise<string> {
    try {
      const messages = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userMessage }
      ];

      const completion = await openai.chat.completions.create(createApiParams(messages));
      return completion.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";
    } catch (error) {
      console.error('Error in generateResponse:', error);
      return "I apologize, there was an error processing your request.";
    }
  }
}

export default AIService;