# Local Performance & UI Testing Suite

This directory contains tools for running comprehensive local tests on your application without deploying it publicly.

## 🚀 Quick Start

Run all tests with a single command:

```bash
bash tests/run-local-tests.sh
```

## 📦 What's Included

### 1. **Playwright Performance Tests** (`performance.spec.ts`)
- Measures page load time
- Verifies critical UI elements are present
- Measures time to interactive
- **Target**: Page should load in under 3 seconds

### 2. **Lighthouse Audit**
- Performance score
- Accessibility score
- Best practices score
- SEO score
- **Output**: `tests/lighthouse-report.html`

### 3. **Autocannon Load Testing**
- Simulates 10 connections for 10 seconds
- Measures requests per second
- Measures throughput (bytes/sec)
- **Output**: `tests/autocannon-results.txt`

## 🔧 Manual Testing

### Run Playwright tests only:
```bash
npx playwright test
```

### Run Playwright tests with UI:
```bash
npx playwright test --headed
```

### Run specific test file:
```bash
npx playwright test performance.spec.ts
```

### Run Lighthouse only:
```bash
# Start preview server first
npm run preview

# In another terminal
npx lighthouse http://localhost:4173 --view
```

### Run Autocannon only:
```bash
# Start preview server first
npm run preview

# In another terminal
npx autocannon -d 10 -c 10 http://localhost:4173
```

## 📊 Understanding the Results

### Lighthouse Scores
- **90-100**: Excellent
- **50-89**: Needs improvement
- **0-49**: Poor

### Page Load Time
- **< 1s**: Excellent
- **1-3s**: Good
- **> 3s**: Needs optimization

### Load Test Metrics
- **Requests/sec**: Higher is better (indicates server can handle more load)
- **Bytes/sec**: Throughput measure
- **Latency**: Lower is better

## 🛠️ Troubleshooting

### Port already in use
If you see "Port 4173 is already in use":
```bash
# Kill existing preview servers
pkill -f "vite preview"

# Then run tests again
bash tests/run-local-tests.sh
```

### Browser installation
If Playwright fails to find browsers:
```bash
npx playwright install chromium
```

### Build failures
If the build fails:
```bash
# Check for TypeScript/linting errors
npm run build

# Fix any errors, then run tests again
```

## 📁 Output Files

After running tests, you'll find:
- `tests/lighthouse-report.html` - Detailed performance audit
- `tests/lighthouse-report.json` - Machine-readable lighthouse data
- `tests/autocannon-results.txt` - Load test statistics
- Playwright screenshots (if tests fail)

## 🎯 Performance Goals

Our performance targets:
- ✅ Lighthouse Performance: > 90
- ✅ Page Load Time: < 3 seconds
- ✅ Time to Interactive: < 4 seconds
- ✅ Lighthouse Accessibility: > 90
- ✅ Load Test: Handle 10+ concurrent users

## 🔄 CI/CD Integration

To run these tests in CI/CD pipelines, set the `CI` environment variable:
```bash
CI=true bash tests/run-local-tests.sh
```

This will:
- Enable test retries
- Run tests in series (not parallel)
- Use strict mode

## 📝 Adding New Tests

To add new Playwright tests:
1. Create a new `.spec.ts` file in the `tests/` directory
2. Follow the pattern in `performance.spec.ts`
3. Run `npx playwright test` to execute

Example:
```typescript
import { test, expect } from '@playwright/test';

test('my new test', async ({ page }) => {
  await page.goto('http://localhost:4173');
  // Your test logic here
});
```

## 🌟 Best Practices

1. **Run tests before pushing**: Catch performance regressions early
2. **Review Lighthouse suggestions**: Address warnings and errors
3. **Monitor load test results**: Ensure your app scales
4. **Keep tests fast**: Tests should complete in < 2 minutes
5. **Update baselines**: As you optimize, adjust performance targets

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse)
- [Autocannon Documentation](https://github.com/mcollina/autocannon)
- [Web Performance Best Practices](https://web.dev/performance)

