// Debug script to check stakeholders loading
const fs = require('fs');
const path = require('path');

// Read the mockData file
const mockDataPath = path.join(__dirname, 'src', 'data', 'mockData.ts');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

// Count stakeholders in the file
const stakeholderMatches = mockDataContent.match(/id: 'stake-\d+'/g);
const stakeholderCount = stakeholderMatches ? stakeholderMatches.length : 0;

console.log('🔍 Stakeholder Debug Report:');
console.log(`📊 Total stakeholders found in mockData.ts: ${stakeholderCount}`);

if (stakeholderMatches) {
  console.log('📋 Stakeholder IDs found:');
  stakeholderMatches.forEach((match, index) => {
    console.log(`  ${index + 1}. ${match}`);
  });
}

// Check for specific new stakeholders
const hasFinanceManager = mockDataContent.includes('Finance Manager');
const hasSupplyChainManager = mockDataContent.includes('Supply Chain Manager');
const hasCustomerExperienceManager = mockDataContent.includes('Customer Experience Manager');

console.log('\n🎯 New Stakeholders Check:');
console.log(`💰 Finance Manager (Michael): ${hasFinanceManager ? '✅ Found' : '❌ Missing'}`);
console.log(`📦 Supply Chain Manager (Lisa): ${hasSupplyChainManager ? '✅ Found' : '❌ Missing'}`);
console.log(`🤝 Customer Experience Manager (Robert): ${hasCustomerExperienceManager ? '✅ Found' : '❌ Missing'}`);

// Check project relevantStakeholders
const projectMatches = mockDataContent.match(/relevantStakeholders: \[([^\]]+)\]/g);
console.log('\n📈 Project Stakeholder Mappings:');
if (projectMatches) {
  projectMatches.forEach((match, index) => {
    console.log(`  Project ${index + 1}: ${match}`);
  });
} else {
  console.log('  ❌ No relevantStakeholders mappings found');
}