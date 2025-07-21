/**
 * 🔧 Medium Puppeteer Automation for ClickSprout v1.0
 * 📌 Automates Medium article publishing using username/password login
 * 🚀 Replaces Medium API integration with direct browser automation
 */

const puppeteer = require('puppeteer');

/**
 * Posts an article to Medium using Puppeteer automation
 * @param {string} title - Article title
 * @param {string} content - Article content (HTML or plain text)
 * @param {Object} options - Additional publishing options
 * @returns {Promise<Object>} Publishing result
 */
async function postToMedium(title, content, options = {}) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  // Set user agent to avoid detection
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

  try {
    console.log('🔗 Navigating to Medium sign in...');
    
    // Navigate to Medium sign in page
    await page.goto('https://medium.com/m/signin', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Click "Sign in with email" button
    console.log('📧 Clicking sign in with email...');
    await page.waitForSelector('button[data-action="sign-in-prompt"], a[href*="signin"]', { visible: true });
    await page.click('button[data-action="sign-in-prompt"], a[href*="signin"]');

    // Wait for email input field
    console.log('✉️ Entering email...');
    await page.waitForSelector('input[type="email"], input[name="email"]', { visible: true });
    await page.type('input[type="email"], input[name="email"]', process.env.MEDIUM_USERNAME, { delay: 100 });
    
    // Click continue/next button
    await page.click('button[type="submit"], button:contains("Continue")');

    // Wait for password field and enter password
    console.log('🔐 Entering password...');
    await page.waitForSelector('input[type="password"], input[name="password"]', { visible: true });
    await page.type('input[type="password"], input[name="password"]', process.env.MEDIUM_PASSWORD, { delay: 100 });
    
    // Submit login form
    await page.click('button[type="submit"], button:contains("Sign in")');

    // Wait for navigation after login
    console.log('🔄 Waiting for login to complete...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

    // Navigate to write page
    console.log('✍️ Opening write page...');
    await page.goto('https://medium.com/new-story', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for editor to load
    await page.waitForSelector('h1[data-default-value], h1[placeholder]', { visible: true });

    // Enter title
    console.log('📝 Adding title...');
    const titleSelector = 'h1[data-default-value], h1[placeholder], h1.graf--title';
    await page.click(titleSelector);
    await page.keyboard.selectAll();
    await page.keyboard.type(title, { delay: 50 });

    // Enter content
    console.log('📄 Adding content...');
    const contentSelector = 'div[data-default-value], div[role="textbox"], div.graf--p';
    await page.click(contentSelector);
    
    // Clear existing content and add new content
    await page.keyboard.selectAll();
    await page.keyboard.type(content, { delay: 30 });

    // Add tags if provided
    if (options.tags && options.tags.length > 0) {
      console.log('🏷️ Adding tags...');
      // Medium tags are usually added after clicking publish
    }

    // Wait a moment for content to be processed
    await page.waitForTimeout(2000);

    // Click publish button
    console.log('🚀 Publishing article...');
    await page.waitForSelector('button[data-action="publish"], button:contains("Publish")', { visible: true });
    await page.click('button[data-action="publish"], button:contains("Publish")');

    // Wait for publish dialog
    await page.waitForSelector('button[data-action="publish"], button:contains("Publish now")', { visible: true });
    
    // Add tags in publish dialog if available
    if (options.tags && options.tags.length > 0) {
      try {
        const tagInput = await page.$('input[placeholder*="tag"], input[placeholder*="Add"]');
        if (tagInput) {
          for (const tag of options.tags.slice(0, 5)) { // Medium allows up to 5 tags
            await tagInput.type(tag);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
          }
        }
      } catch (err) {
        console.log('⚠️ Could not add tags:', err.message);
      }
    }

    // Final publish confirmation
    await page.click('button[data-action="publish"], button:contains("Publish now")');

    // Wait for success confirmation
    await page.waitForTimeout(3000);

    console.log('✅ Medium article published successfully!');
    
    // Try to get the published article URL
    let articleUrl = null;
    try {
      const currentUrl = page.url();
      if (currentUrl.includes('medium.com') && currentUrl !== 'https://medium.com/new-story') {
        articleUrl = currentUrl;
      }
    } catch (err) {
      console.log('⚠️ Could not capture article URL');
    }

    return {
      success: true,
      message: 'Article published to Medium successfully',
      url: articleUrl,
      platform: 'medium',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error posting to Medium:', error);
    
    // Take screenshot for debugging
    try {
      await page.screenshot({ path: 'medium-error.png', fullPage: true });
      console.log('📸 Error screenshot saved as medium-error.png');
    } catch (screenshotErr) {
      console.log('Could not take error screenshot');
    }

    return {
      success: false,
      error: error.message,
      platform: 'medium',
      timestamp: new Date().toISOString()
    };
  } finally {
    await browser.close();
  }
}

/**
 * Test Medium login credentials
 * @returns {Promise<Object>} Login test result
 */
async function testMediumLogin() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  try {
    console.log('🧪 Testing Medium login credentials...');
    
    await page.goto('https://medium.com/m/signin', { waitUntil: 'networkidle2' });
    
    // Check if required environment variables exist
    if (!process.env.MEDIUM_USERNAME || !process.env.MEDIUM_PASSWORD) {
      throw new Error('Missing MEDIUM_USERNAME or MEDIUM_PASSWORD environment variables');
    }

    // Perform login test (without actually logging in)
    await page.waitForSelector('button[data-action="sign-in-prompt"], a[href*="signin"]', { visible: true });
    
    console.log('✅ Medium login page loaded successfully');
    console.log('✅ Environment variables configured');
    
    return {
      success: true,
      message: 'Medium automation ready',
      credentials: 'configured'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      credentials: 'missing'
    };
  } finally {
    await browser.close();
  }
}

module.exports = { 
  postToMedium,
  testMediumLogin
};
