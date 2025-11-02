import { supabase } from './communityLoungeService';

export async function seedCommunityLounge() {
  try {
    console.log('🌱 Checking Community Lounge data...');

    // Just check if spaces exist, don't try to create them
    const { data: existingSpaces } = await supabase
      .from('spaces')
      .select('id')
      .limit(1);

    if (existingSpaces && existingSpaces.length > 0) {
      console.log('✅ Community Lounge data already exists');
      return existingSpaces[0].id;
    } else {
      console.log('⚠️ No spaces found - please run the SQL setup first');
      // Don't throw error, just return null to let the app continue
      return null;
    }

  } catch (error) {
    console.error('❌ Error checking Community Lounge:', error);
    // Don't throw error, just return null to let the app continue
    return null;
  }
}
