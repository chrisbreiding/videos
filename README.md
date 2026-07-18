# Videos

A React app for managing video subscriptions and playlists.

## Development

Start the development server:

```bash
npm start
```

The app will be available at `http://localhost:8001`.

## Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

### Running Tests

| Command                 | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `npm test`              | Run all tests headlessly                          |
| `npm run test:ui`       | Open interactive UI mode                          |
| `npm run test:headed`   | Run tests with visible browser                    |
| `npm run test:debug`    | Debug tests step by step                          |
| `npm run test:coverage` | Run all tests and generate a code coverage report |

### Code Coverage

`npm run test:coverage` runs the full suite against an Istanbul-instrumented build and writes a report to `coverage/`. Open `coverage/index.html` for a browsable, line-by-line breakdown, or re-generate a report from the last run with `npm run coverage:report`.

Coverage is only instrumented when the `COVERAGE` env var is set (the script sets it), so regular `npm test` runs are unaffected. Because coverage is collected at runtime, only source files loaded during the tests appear in the report.

### Test Configuration

- Tests are located in the `tests/` directory
- Tests run against Chromium, Firefox, and WebKit
- The dev server starts automatically when running tests
- Screenshots are captured on test failure
- Traces are recorded on first retry

### Writing Tests

Create new test files in the `tests/` directory with the `.spec.js` extension:

```javascript
import { test, expect } from '@playwright/test'

test('example test', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Videos')
})
```

### Viewing Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```
