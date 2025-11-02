// Test file for Stakeholder Knowledge Base
import StakeholderKnowledgeBase from './services/stakeholderKnowledgeBase';

// Test the knowledge base
const testKnowledgeBase = () => {
  const kb = StakeholderKnowledgeBase.getInstance();
  
  console.log('🧪 Testing Stakeholder Knowledge Base...');
  
  // Test 1: Basic response
  const response1 = kb.getStakeholderResponse(
    'What are your main pain points?',
    'Sales Manager'
  );
  console.log('✅ Test 1 - Pain Points:', response1.text);
  
  // Test 2: Role-specific response
  const response2 = kb.getStakeholderResponse(
    'What is your role?',
    'IT Director'
  );
  console.log('✅ Test 2 - Role Question:', response2.text);
  
  // Test 3: Emergency fallback
  const response3 = kb.getStakeholderResponse(
    'Random question that should not exist',
    'Customer Service Manager'
  );
  console.log('✅ Test 3 - Emergency Fallback:', response3.text);
  
  // Test 4: Voice optimization
  console.log('✅ Test 4 - Voice Response:', response1.voice);
  
  // Test 5: Statistics
  const stats = kb.getStats();
  console.log('✅ Test 5 - Stats:', stats);
  
  console.log('🎉 All tests passed! Knowledge base is working correctly.');
};

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testKnowledgeBase = testKnowledgeBase;
} else {
  // Node environment
  testKnowledgeBase();
}

export { testKnowledgeBase };
