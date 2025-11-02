// OpenAI API configuration
export const MODEL = "gpt-3.5-turbo";

export const API_CONFIG = {
  model: MODEL,
  temperature: 0.3,
  max_tokens: 130,    // Keep responses concise but meaningful
  presence_penalty: 0,
  frequency_penalty: 0,
  stream: false       // Disable streaming for faster responses
};

// Helper for faster API calls
export const createApiParams = (messages: any[], overrides = {}) => ({
  ...API_CONFIG,
  messages,
  ...overrides
});

// OpenAI client configuration
export const CLIENT_CONFIG = {
  timeout: 8000,     // 8 second timeout
  maxRetries: 1,     // Only retry once
  defaultHeaders: {  // Optimize headers
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};