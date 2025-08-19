// OpenAI API configuration
export const AI_CONFIG = {
  // Base configuration
  model: "gpt-3.5-turbo",
  temperature: 0.3,
  max_tokens: 130,
  presence_penalty: 0,
  frequency_penalty: 0,
  
  // Response types
  types: {
    greeting: {
      temperature: 0.7,
      max_tokens: 50
    },
    conversation: {
      temperature: 0.3,
      max_tokens: 130
    },
    phaseDetection: {
      temperature: 0.1,
      max_tokens: 10
    },
    noteGeneration: {
      temperature: 0.2,
      max_tokens: 200
    }
  }
};

// OpenAI client configuration
export const CLIENT_CONFIG = {
  timeout: 10000,  // 10 second timeout
  maxRetries: 1    // Only retry once to keep responses fast
};
