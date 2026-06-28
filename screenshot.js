const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  let browser;
  try {
    console.log('Launching Chromium...');
    
    // These flags are REQUIRED for GitHub Actions Ubuntu runners
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    console.log('Loading https://www.thefp.com...');
    
    // networkidle0 = waits for all network connections to close
    await page.goto('https://www.thefp.com', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Small delay for lazy images
    await page.waitForTimeout(1500);

    // Create screenshots directory
    const screenshotDir = path.join(process.env.GITHUB_WORKSPACE || '.', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const filepath = path.join(screenshotDir, `thefreepress-${dateStr}.png`);

    console.log(`Saving screenshot to: ${filepath}`);
    await page.screenshot({
      path: filepath,
      fullPage: false // Capture above-the-fold only
    });

    const stats = fs.statSync(filepath);
    console.log(`✓ Screenshot saved (${stats.size} bytes)`);
    process.exit(0);

  } catch (error) {
    console.error('✗ Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
