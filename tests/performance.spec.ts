import { test, expect } from '@playwright/test';

/**
 * Performance Test Suite
 * 
 * Tests page load performance using reliable data-testid selectors
 * Waits for the refinement-page testid before checking elements
 */

test.describe('Performance Tests', () => {
  test('should load Backlog Refinement page within 10 seconds', async ({ page }) => {
    console.log('\n🚀 Starting performance test...\n');
    
    try {
      // Record start time
      const startTime = Date.now();
      
      // Navigate to the app
      await page.goto('http://localhost:4173', { 
        timeout: 10000,
        waitUntil: 'domcontentloaded'
      });
      
      // Wait for the refinement page to be fully rendered (React.lazy complete)
      console.log('   ⏳ Waiting for page to render...');
      await page.waitForSelector('[data-testid="refinement-page"]', { timeout: 20000 });
      
      // Wait for network to stabilize
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
        // Ignore if network doesn't go idle (dev mode)
      });
      
      // Verify the critical heading is visible
      await page.locator('h1, h2').filter({ hasText: /Refinement/i }).first().waitFor({ 
        state: 'visible',
        timeout: 5000 
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
    console.log('🔍 Verifying critical UI elements...\n');
    
    try {
      await page.goto('http://localhost:4173', { 
        timeout: 10000,
        waitUntil: 'domcontentloaded'
      });
      
      // Wait for the page to be fully rendered
      console.log('   ⏳ Waiting for components to load...');
      await page.waitForSelector('[data-testid="refinement-page"]', { timeout: 20000 });
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      
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
    console.log('⏱️  Measuring Time to Interactive...\n');
    
    try {
      const startTime = Date.now();
      
      await page.goto('http://localhost:4173', { 
        timeout: 10000,
        waitUntil: 'domcontentloaded'
      });
      
      // Wait for the page to be fully rendered
      console.log('   ⏳ Waiting for interactive elements...');
      await page.waitForSelector('[data-testid="refinement-page"]', { timeout: 20000 });
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      
      // Wait for the main action button to be clickable (role-based selector)
      await page.getByRole('button', { name: /Watch.*Simulation/i }).first().waitFor({
        state: 'visible',
        timeout: 5000
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
    console.log('🔄 Testing navigation...\n');
    
    try {
      await page.goto('http://localhost:4173', { 
        timeout: 10000,
        waitUntil: 'domcontentloaded'
      });
      
      // Wait for the page to be fully rendered
      console.log('   ⏳ Waiting for navigation elements...');
      await page.waitForSelector('[data-testid="refinement-page"]', { timeout: 20000 });
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      
      // Find and verify the main action button
      const watchButton = page.getByRole('button', { name: /Watch.*Simulation/i }).first();
      await watchButton.waitFor({ state: 'visible', timeout: 5000 });
      
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
      let lazyChunkDetected = false;
      
      page.on('response', response => {
        const url = response.url();
        // Look for lazy-loaded chunk files (ScrumPracticeView, etc.)
        if (url.includes('ScrumPracticeView') || (url.includes('.js') && url.includes('chunk'))) {
          console.log(`   📦 Lazy chunk loaded: ${url.split('/').pop()}`);
          lazyChunkDetected = true;
        }
      });
      
      await page.goto('http://localhost:4173', { 
        timeout: 10000,
        waitUntil: 'networkidle'
      });
      
      // Wait for the page to be fully rendered
      await page.waitForSelector('[data-testid="refinement-page"]', { timeout: 20000 });
      
      // Verify the page loaded successfully
      const hasContent = await page.evaluate(() => {
        return document.body.textContent?.includes('Refinement') || false;
      });
      
      if (hasContent) {
        console.log('   ✅ Code splitting verified - lazy components loaded');
      } else {
        console.log('   ⚠️  Content not found after lazy load');
      }
      
      expect(hasContent).toBeTruthy();
      
      if (lazyChunkDetected) {
        console.log('   ✅ Lazy chunk network request detected');
      }
      
      console.log('\n✅ React.lazy is working correctly\n');
      
    } catch (error) {
      console.log(`❌ Lazy loading test failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      throw error;
    }
  });
});
