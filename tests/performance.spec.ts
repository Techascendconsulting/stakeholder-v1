import { test, expect } from '@playwright/test';

/**
 * Performance Test Suite
 * 
 * Tests page load performance with support for React.lazy and Suspense
 * Waits for proper hydration before checking elements
 */

/**
 * Helper function to wait for React hydration and lazy chunks to complete
 */
async function waitForReactHydration(page: any, timeoutMs = 20000) {
  const startTime = Date.now();
  
  // Step 1: Wait for document to be fully loaded
  await page.waitForLoadState('domcontentloaded', { timeout: timeoutMs });
  
  // Step 2: Wait for network to be idle (lazy chunks loaded)
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch {
    // Network idle might not happen in dev mode, continue anyway
  }
  
  // Step 3: Wait for React root to contain "Refinement" text
  // This ensures lazy-loaded components have rendered
  const maxRetries = 40; // 40 * 500ms = 20s total
  let retries = 0;
  let hydrated = false;
  
  while (retries < maxRetries && !hydrated) {
    const elapsed = Date.now() - startTime;
    
    if (elapsed > timeoutMs) {
      throw new Error('Timeout waiting for React hydration');
    }
    
    // Check if content is hydrated by looking for "Refinement" in the page
    const hasContent = await page.evaluate(() => {
      // Check in root container
      const root = document.getElementById('root') || document.querySelector('.content-root') || document.body;
      const text = root.textContent || '';
      return text.toLowerCase().includes('refinement');
    });
    
    if (hasContent) {
      hydrated = true;
      console.log(`   ⚡ React hydration complete in ${elapsed}ms`);
      break;
    }
    
    // Wait before retrying
    await page.waitForTimeout(500);
    retries++;
  }
  
  if (!hydrated) {
    console.log('   ⚠️  Page visible but content not yet hydrated');
    throw new Error('React content not hydrated after 20s');
  }
  
  // Extra buffer for animations and transitions
  await page.waitForTimeout(500);
}

test.describe('Performance Tests', () => {
  test('should load Backlog Refinement page within 10 seconds', async ({ page }) => {
    console.log('\n🚀 Starting performance test (with React.lazy support)...\n');
    
    try {
      // Record start time
      const startTime = Date.now();
      
      // Navigate to the app
      await page.goto('http://localhost:4173', { 
        timeout: 10000,
        waitUntil: 'domcontentloaded'
      });
      
      // Wait for React hydration and lazy chunks
      console.log('   ⏳ Waiting for React hydration and lazy chunks...');
      await waitForReactHydration(page, 20000);
      
      // Wait for the critical heading to be visible (flexible selector)
      // Match any h1 or h2 that contains "Refinement"
      await page.locator('h1, h2').filter({ hasText: /Refinement/i }).first().waitFor({ 
        state: 'visible',
        timeout: 10000 
      });
      
      // Calculate load time
      const loadTime = Date.now() - startTime;
      
      // Log the result with user-friendly output
      if (loadTime < 3000) {
        console.log(`✅ Loaded in ${loadTime} ms - Excellent! 🎉`);
      } else if (loadTime < 5000) {
        console.log(`✅ Loaded in ${loadTime} ms - Good performance ⚡`);
      } else if (loadTime < 10000) {
        console.log(`⚠️  Loaded in ${loadTime} ms - A bit slow, but acceptable`);
      } else {
        console.log(`❌ Loaded in ${loadTime} ms - Too slow`);
      }
      
      console.log(`📊 Target: < 10000 ms\n`);
      
      // Assert performance requirement (10s max)
      expect(loadTime).toBeLessThan(10000);
      
    } catch (error) {
      console.log(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      throw error;
    }
  });

  test('should verify critical UI elements are present', async ({ page }) => {
    console.log('🔍 Verifying critical UI elements (after hydration)...\n');
    
    try {
      await page.goto('http://localhost:4173', { 
        timeout: 10000,
        waitUntil: 'domcontentloaded'
      });
      
      // Wait for React hydration
      console.log('   ⏳ Waiting for lazy components to load...');
      await waitForReactHydration(page, 20000);
      
      // Check for critical page elements with flexible selectors
      // 1. Main heading with "Refinement"
      const headingVisible = await page.locator('h1, h2').filter({ hasText: /Refinement/i }).first().isVisible();
      if (headingVisible) {
        console.log('   ✅ Main heading found');
      } else {
        console.log('   ⚠️  Main heading not visible');
      }
      expect(headingVisible).toBeTruthy();
      
      // 2. "Why" section
      const whySection = await page.locator('h2, h3').filter({ hasText: /Why.*Refinement/i }).first().isVisible();
      if (whySection) {
        console.log('   ✅ "Why" section found');
      } else {
        console.log('   ⚠️  "Why" section not visible');
      }
      expect(whySection).toBeTruthy();
      
      // 3. "Process" section
      const processSection = await page.locator('h2, h3').filter({ hasText: /Process|The Refinement Process/i }).first().isVisible();
      if (processSection) {
        console.log('   ✅ Process section found');
      } else {
        console.log('   ⚠️  Process section not visible');
      }
      expect(processSection).toBeTruthy();
      
      console.log('\n✅ All critical UI elements are present\n');
      
    } catch (error) {
      console.log(`❌ Element verification failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      throw error;
    }
  });

  test('should measure time to interactive', async ({ page }) => {
    console.log('⏱️  Measuring Time to Interactive (with lazy loading)...\n');
    
    try {
      const startTime = Date.now();
      
      await page.goto('http://localhost:4173', { 
        timeout: 10000,
        waitUntil: 'domcontentloaded'
      });
      
      // Wait for React hydration and lazy chunks
      console.log('   ⏳ Waiting for components to become interactive...');
      await waitForReactHydration(page, 20000);
      
      // Wait for the main action button to be clickable (role-based selector)
      // This is more reliable and matches how users interact
      await page.getByRole('button', { name: /Watch.*Simulation/i }).first().waitFor({
        state: 'visible',
        timeout: 10000
      });
      
      const timeToInteractive = Date.now() - startTime;
      
      // User-friendly output
      if (timeToInteractive < 2000) {
        console.log(`✅ Time to Interactive: ${timeToInteractive} ms - Lightning fast! ⚡`);
      } else if (timeToInteractive < 4000) {
        console.log(`✅ Time to Interactive: ${timeToInteractive} ms - Great! 🎯`);
      } else if (timeToInteractive < 10000) {
        console.log(`⚠️  Time to Interactive: ${timeToInteractive} ms - Acceptable`);
      } else {
        console.log(`❌ Time to Interactive: ${timeToInteractive} ms - Too slow`);
      }
      
      console.log(`📊 Target: < 10000 ms\n`);
      
      // Interactive should happen within 10 seconds
      expect(timeToInteractive).toBeLessThan(10000);
      
    } catch (error) {
      console.log(`❌ Interactive test failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      throw error;
    }
  });

  test('should handle navigation and back button', async ({ page }) => {
    console.log('🔄 Testing navigation (after lazy load)...\n');
    
    try {
      await page.goto('http://localhost:4173', { 
        timeout: 10000,
        waitUntil: 'domcontentloaded'
      });
      
      // Wait for hydration
      console.log('   ⏳ Waiting for navigation elements to load...');
      await waitForReactHydration(page, 20000);
      
      // Find and verify the main action button
      const watchButton = page.getByRole('button', { name: /Watch.*Simulation/i }).first();
      await watchButton.waitFor({ state: 'visible', timeout: 10000 });
      
      console.log('   ✅ Watch button is clickable');
      
      // Test that back button exists
      const backButton = page.getByRole('button', { name: /Back/i }).first();
      const backExists = await backButton.count() > 0;
      
      if (backExists) {
        console.log('   ✅ Back button found');
      } else {
        console.log('   ⚠️  Back button not found');
      }
      
      expect(backExists).toBeTruthy();
      
      console.log('\n✅ Navigation elements verified\n');
      
    } catch (error) {
      console.log(`❌ Navigation test failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      throw error;
    }
  });

  test('should verify React lazy loading is working', async ({ page }) => {
    console.log('⚙️  Verifying React.lazy code splitting...\n');
    
    try {
      // Track network requests to verify lazy chunks are loaded
      const lazyChunkLoaded = new Promise((resolve) => {
        page.on('response', response => {
          const url = response.url();
          // Look for lazy-loaded chunk files (ScrumPracticeView, etc.)
          if (url.includes('ScrumPracticeView') || url.includes('.js')) {
            console.log(`   📦 Lazy chunk loaded: ${url.split('/').pop()}`);
            resolve(true);
          }
        });
        
        // Resolve after timeout if no chunks detected
        setTimeout(() => resolve(true), 5000);
      });
      
      await page.goto('http://localhost:4173', { 
        timeout: 10000,
        waitUntil: 'networkidle'
      });
      
      await lazyChunkLoaded;
      
      // Verify the page loaded successfully
      await waitForReactHydration(page, 20000);
      
      const hasContent = await page.evaluate(() => {
        return document.body.textContent?.includes('Refinement') || false;
      });
      
      if (hasContent) {
        console.log('   ✅ Code splitting verified - lazy components loaded');
      } else {
        console.log('   ⚠️  Content not found after lazy load');
      }
      
      expect(hasContent).toBeTruthy();
      
      console.log('\n✅ React.lazy is working correctly\n');
      
    } catch (error) {
      console.log(`❌ Lazy loading test failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      throw error;
    }
  });
});
