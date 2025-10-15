#!/usr/bin/env node

/**
 * Test Script for Audio Generation
 * 
 * This script validates the audio generation setup without making API calls.
 * It checks configuration, file structure, and validates the transcript data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AUDIO_FILES, VOICE_IDS } from './generate-refinement-audio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function testConfiguration() {
  console.log('🔧 Testing Configuration...');
  
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.log('❌ ELEVENLABS_API_KEY not found in environment');
    return false;
  }
  
  if (apiKey.length < 20) {
    console.log('❌ ELEVENLABS_API_KEY appears to be too short');
    return false;
  }
  
  console.log('✅ ELEVENLABS_API_KEY is configured');
  console.log(`🔑 Key length: ${apiKey.length} characters`);
  console.log(`🔑 Key preview: ${apiKey.substring(0, 8)}...`);
  
  return true;
}

function testFileStructure() {
  console.log('\n📁 Testing File Structure...');
  
  const outputDir = path.join(__dirname, '..', 'public', 'audio', 'refinement');
  const scriptsDir = path.join(__dirname);
  
  // Check if directories exist or can be created
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`✅ Created output directory: ${outputDir}`);
    } else {
      console.log(`✅ Output directory exists: ${outputDir}`);
    }
    
    if (!fs.existsSync(scriptsDir)) {
      console.log(`❌ Scripts directory missing: ${scriptsDir}`);
      return false;
    } else {
      console.log(`✅ Scripts directory exists: ${scriptsDir}`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ File structure error: ${error.message}`);
    return false;
  }
}

function testTranscriptData() {
  console.log('\n📝 Testing Transcript Data...');
  
  // Check if we have the expected number of files
  const expectedCount = 27;
  if (AUDIO_FILES.length !== expectedCount) {
    console.log(`❌ Expected ${expectedCount} audio files, got ${AUDIO_FILES.length}`);
    return false;
  }
  
  console.log(`✅ Found ${AUDIO_FILES.length} audio files`);
  
  // Check for required voice IDs
  const requiredVoices = ['Sarah', 'Bola', 'Victor', 'Srikanth', 'Lisa', 'Tom'];
  for (const voice of requiredVoices) {
    if (!VOICE_IDS[voice]) {
      console.log(`❌ Missing voice ID for: ${voice}`);
      return false;
    }
  }
  
  console.log('✅ All required voice IDs are configured');
  
  // Check for duplicate IDs
  const ids = AUDIO_FILES.map(file => file.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.log('❌ Duplicate audio IDs found');
    return false;
  }
  
  console.log('✅ All audio IDs are unique');
  
  // Check for empty text
  const emptyTexts = AUDIO_FILES.filter(file => !file.text || file.text.trim().length === 0);
  if (emptyTexts.length > 0) {
    console.log(`❌ Found ${emptyTexts.length} files with empty text`);
    return false;
  }
  
  console.log('✅ All files have text content');
  
  // Check text lengths
  const shortTexts = AUDIO_FILES.filter(file => file.text.length < 10);
  if (shortTexts.length > 0) {
    console.log(`⚠️  Found ${shortTexts.length} files with very short text`);
    shortTexts.forEach(file => {
      console.log(`   - ${file.id}: "${file.text}"`);
    });
  }
  
  const longTexts = AUDIO_FILES.filter(file => file.text.length > 1000);
  if (longTexts.length > 0) {
    console.log(`⚠️  Found ${longTexts.length} files with very long text`);
    longTexts.forEach(file => {
      console.log(`   - ${file.id}: ${file.text.length} characters`);
    });
  }
  
  return true;
}

function testVoiceIds() {
  console.log('\n🎤 Testing Voice IDs...');
  
  const voiceIdPattern = /^[a-zA-Z0-9]{20}$/;
  let allValid = true;
  
  for (const [name, voiceId] of Object.entries(VOICE_IDS)) {
    if (!voiceIdPattern.test(voiceId)) {
      console.log(`❌ Invalid voice ID format for ${name}: ${voiceId}`);
      allValid = false;
    } else {
      console.log(`✅ ${name}: ${voiceId}`);
    }
  }
  
  return allValid;
}

function testTrialCoverage() {
  console.log('\n🎭 Testing Trial Coverage...');
  
  // Check Trial 1 files
  const trial1Files = AUDIO_FILES.filter(file => 
    !file.id.includes('-2') && file.id !== 'sarah-goodbye'
  );
  
  // Check Trial 2 files
  const trial2Files = AUDIO_FILES.filter(file => 
    file.id.includes('-2')
  );
  
  // Check common files
  const commonFiles = AUDIO_FILES.filter(file => 
    file.id === 'sarah-opening' || file.id === 'sarah-goodbye'
  );
  
  console.log(`📊 Trial 1 files: ${trial1Files.length}`);
  console.log(`📊 Trial 2 files: ${trial2Files.length}`);
  console.log(`📊 Common files: ${commonFiles.length}`);
  
  // Check speaker distribution
  const speakerCounts = {};
  AUDIO_FILES.forEach(file => {
    speakerCounts[file.speaker] = (speakerCounts[file.speaker] || 0) + 1;
  });
  
  console.log('\n👥 Speaker distribution:');
  for (const [speaker, count] of Object.entries(speakerCounts)) {
    console.log(`   ${speaker}: ${count} files`);
  }
  
  return true;
}

function testOutputPaths() {
  console.log('\n📁 Testing Output Paths...');
  
  const outputDir = path.join(__dirname, '..', 'public', 'audio', 'refinement');
  let allValid = true;
  
  for (const file of AUDIO_FILES) {
    const outputPath = path.join(outputDir, `${file.id}.mp3`);
    const relativePath = path.relative(process.cwd(), outputPath);
    
    // Check if path is valid
    try {
      path.resolve(outputPath);
      console.log(`✅ ${file.id}.mp3 -> ${relativePath}`);
    } catch (error) {
      console.log(`❌ Invalid path for ${file.id}: ${error.message}`);
      allValid = false;
    }
  }
  
  return allValid;
}

async function runAllTests() {
  console.log('🧪 Running Audio Generation Tests');
  console.log('='.repeat(50));
  
  const tests = [
    { name: 'Configuration', fn: testConfiguration },
    { name: 'File Structure', fn: testFileStructure },
    { name: 'Transcript Data', fn: testTranscriptData },
    { name: 'Voice IDs', fn: testVoiceIds },
    { name: 'Trial Coverage', fn: testTrialCoverage },
    { name: 'Output Paths', fn: testOutputPaths }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = test.fn();
      if (result) {
        passed++;
        console.log(`\n✅ ${test.name} test passed`);
      } else {
        failed++;
        console.log(`\n❌ ${test.name} test failed`);
      }
    } catch (error) {
      failed++;
      console.log(`\n💥 ${test.name} test crashed: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Ready to generate audio files.');
    console.log('\n🚀 To generate audio files, run:');
    console.log('   node scripts/generate-refinement-audio.js');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix the issues before generating audio.');
  }
  
  return failed === 0;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });
}

export { runAllTests };












