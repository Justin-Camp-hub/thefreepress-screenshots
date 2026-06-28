const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set viewport to capture above-the-fold content
    await page.setViewport({ width: 1400, height: 900 });
    
    console.log('Navigating to thefp.com...');
    await page.goto('https://www.thefp.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait a moment for any lazy-loaded images
    await page.waitForTimeout(2000);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `thefreepress-${timestamp}.png`;
    const filepath = path.join('/tmp', filename);

    console.log(`Taking screenshot: ${filename}`);
    await page.screenshot({ path: filepath, fullPage: false });

    // Write metadata
    const metafile = path.join('/tmp', 'screenshot-meta.json');
    fs.writeFileSync(metafile, JSON.stringify({
      timestamp: new Date().toISOString(),
      url: 'https://www.thefp.com',
      filename: filename
    }, null, 2));

    console.log(`✓ Screenshot saved to ${filepath}`);
    process.exit(0);

  } catch (error) {
    console.error('Error taking screenshot:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
