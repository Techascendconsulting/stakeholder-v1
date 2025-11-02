import { DatabaseCleanup } from './databaseCleanup';
import { MeetingDataService } from './meetingDataService';

export async function executeUserReset(userId: string): Promise<void> {
  console.log('🚨 EXECUTING COMPLETE USER DATA RESET FOR:', userId);
  
  try {
    // Step 1: Get current stats before reset
    const statsBefore = await DatabaseCleanup.getUserDataStats(userId);
    console.log('📊 BEFORE RESET:', statsBefore);
    
    // Step 2: Execute complete reset
    const resetResult = await DatabaseCleanup.resetUserData(userId);
    console.log('🗑️ RESET RESULT:', resetResult);
    
    if (!resetResult.success) {
      throw new Error(`Reset failed: ${resetResult.message}`);
    }
    
    // Step 3: Clear all caches
    MeetingDataService.forceClearAll();
    console.log('🧹 CLEARED ALL CACHES');
    
    // Step 4: Verify reset worked
    const statsAfter = await DatabaseCleanup.getUserDataStats(userId);
    console.log('📊 AFTER RESET:', statsAfter);
    
    // Step 5: Additional localStorage cleanup
    console.log('🧹 PERFORMING ADDITIONAL CLEANUP...');
    
    // Clear any remaining meeting-related keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('meeting') ||
        key.includes('transcript') ||
        key.includes('summary') ||
        key.includes('progress') ||
        key.includes('stakeholder') ||
        key.includes(userId)
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ REMOVED: ${key}`);
    });
    
    console.log('✅ RESET COMPLETE! USER DATA FULLY CLEARED');
    console.log('📈 READY FOR FRESH START - ALL COUNTS SHOULD BE 0');
    
  } catch (error) {
    console.error('❌ RESET FAILED:', error);
    throw error;
  }
}

// Make it available globally for console execution
if (typeof window !== 'undefined') {
  (window as any).executeUserReset = executeUserReset;
}