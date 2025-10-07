import { test, expect } from '@playwright/test';

/**
 * Performance Test Suite
 * 
 * Tests page load performance and measures critical metrics
 * for the Backlog Refinement page
 */

test.describe('Performance Tests', () => {
  test('should load Backlog Refinement page within 3 seconds', async ({ page }) => {
    console.log('\n🚀 Starting performance test...\n');
    
    // Record start time
    const startTime = Date.now();
    
    // Navigate to the app
    await page.goto('http://localhost:4173');
    
    // Wait for the critical content to be visible
    // This ensures the page is fully interactive
    await page.waitForSelector('text=Backlog Refinement', { timeout: 5000 });
    
    // Calculate load time
    const loadTime = Date.now() - startTime;
    
    // Log the result
    console.log(`✅ Page load time: ${loadTime} ms`);
    console.log(`📊 Target: < 3000 ms (${loadTime < 3000 ? 'PASSED' : 'FAILED'})\n`);
    
    // Assert performance requirement
    expect(loadTime).toBeLessThan(3000);
  });

  test('should verify critical UI elements are present', async ({ page }) => {
    console.log('🔍 Verifying critical UI elements...\n');
    
    await page.goto('http://localhost:4173');
    
    // Check for critical page elements
    await expect(page.locator('text=Backlog Refinement')).toBeVisible();
    await expect(page.locator('text=Why Backlog Refinement Matters')).toBeVisible();
    await expect(page.locator('text=The Refinement Process')).toBeVisible();
    
    console.log('✅ All critical UI elements are present\n');
  });

  test('should measure time to interactive', async ({ page }) => {
    console.log('⏱️  Measuring Time to Interactive...\n');
    
    const startTime = Date.now();
    
    await page.goto('http://localhost:4173');
    
    // Wait for a button to be clickable (interactive)
    await page.waitForSelector('button:has-text("Watch Refinement Simulation")', { 
      state: 'visible',
      timeout: 5000 
    });
    
    const timeToInteractive = Date.now() - startTime;
    
    console.log(`✅ Time to Interactive: ${timeToInteractive} ms\n`);
    
    // Interactive should happen quickly
    expect(timeToInteractive).toBeLessThan(4000);
  });
});

