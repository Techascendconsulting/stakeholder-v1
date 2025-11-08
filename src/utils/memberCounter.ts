/**
 * Automatic Member Counter Utility
 * 
 * Calculates the current member count based on a base number and weekly growth.
 * This ensures the number stays current without manual updates.
 */

// Base configuration
const BASE_COUNT = 2847; // Starting number as of the base date
const BASE_DATE = new Date('2025-01-20'); // Reference date for the base count
const WEEKLY_INCREASE = 10; // Number to add per week

/**
 * Calculate the current member count
 * @returns {number} Current member count
 */
export function getCurrentMemberCount(): number {
  const now = new Date();
  const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
  
  // Calculate weeks elapsed since base date
  const timeDiff = now.getTime() - BASE_DATE.getTime();
  const weeksElapsed = Math.floor(timeDiff / millisecondsPerWeek);
  
  // Calculate current count
  const currentCount = BASE_COUNT + (weeksElapsed * WEEKLY_INCREASE);
  
  return currentCount;
}

/**
 * Format the member count for display
 * @returns {string} Formatted member count (e.g., "2,847+")
 */
export function getFormattedMemberCount(): string {
  const count = getCurrentMemberCount();
  return count.toLocaleString('en-US') + '+';
}

/**
 * Get projection for future date
 * @param {Date} futureDate - Date to project to
 * @returns {number} Projected member count
 */
export function getProjectedCount(futureDate: Date): number {
  const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
  const timeDiff = futureDate.getTime() - BASE_DATE.getTime();
  const weeksElapsed = Math.floor(timeDiff / millisecondsPerWeek);
  return BASE_COUNT + (weeksElapsed * WEEKLY_INCREASE);
}

/**
 * Get weekly increase rate
 * @returns {number} Weekly increase amount
 */
export function getWeeklyIncrease(): number {
  return WEEKLY_INCREASE;
}









