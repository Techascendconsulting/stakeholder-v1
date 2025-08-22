// Simple test for the KB system
import AnsweringPipeline from './server/answer.js';

async function testKBSystem() {
  console.log('🧪 Testing KB System...\n');

  const pipeline = AnsweringPipeline.getInstance();

  // Test queries
  const testQueries = [
    "hi",
    "what is this project about",
    "what are the pain points",
    "how do they impact efficiency and experience",
    "what is churn",
    "what is the current process",
    "who are the stakeholders",
    "random question that shouldn't be found"
  ];

  for (const query of testQueries) {
    console.log(`Query: "${query}"`);
    try {
      const result = await pipeline.answer(query);
      console.log(`Answer: ${result.answer}`);
      console.log(`Match Type: ${result.matchType}`);
      console.log(`Confidence: ${result.confidence.toFixed(2)}`);
      console.log(`Sources: ${result.sources.join(', ')}`);
      console.log('---\n');
    } catch (error) {
      console.error(`❌ Error with query "${query}":`, error);
    }
  }

  // Test KB stats
  const stats = pipeline.getKBStats();
  console.log('📊 KB Statistics:');
  console.log(`Total Entries: ${stats.totalEntries}`);
  console.log('Categories:', stats.categories);
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testKBSystem().catch(console.error);
}

export { testKBSystem };
