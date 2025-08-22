// Simple test for the multi-agent system
import MultiAgentSystem from './src/services/multiAgentSystem.js';

async function testMultiAgent() {
  console.log('🧪 Testing Multi-Agent System...\n');

  const multiAgent = MultiAgentSystem.getInstance();

  // Test queries
  const testQueries = [
    "what challenges do they face",
    "what are the pain points",
    "how do they impact efficiency"
  ];

  for (const query of testQueries) {
    console.log(`Query: "${query}"`);
    try {
      const result = await multiAgent.processUserMessage(
        query,
        { name: 'Jess Morgan', role: 'Customer Success Manager' },
        { id: 'customer-onboarding', name: 'Customer Onboarding Process Optimization' }
      );
      console.log(`Response: ${result}`);
      console.log('---\n');
    } catch (error) {
      console.error(`❌ Error with query "${query}":`, error);
    }
  }

  // Test conversation stats
  const stats = multiAgent.getConversationStats();
  console.log('📊 Conversation Statistics:');
  console.log(stats);
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testMultiAgent().catch(console.error);
}

export { testMultiAgent };
