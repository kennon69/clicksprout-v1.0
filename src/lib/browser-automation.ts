/**
 * Browser Automation for ClickSprout v1.0
 * Handles posting when platform APIs are unavailable
 * Uses Puppeteer for automated browser interactions
 */

import puppeteer, { Browser, Page } from 'puppeteer'
import { GeneratedContent } from './aiContentGenerator'
import { PostRequest, PostResult } from './poster'

// Types for browser automation
export interface BrowserConfig {
  headless: boolean
  viewport: { width: number; height: number }
  userAgent: string
  timeout: number
}

export interface LoginCredentials {
  username: string
  password: string
  twoFactorCode?: string
}

export interface AutomationResult {
  success: boolean
  postUrl?: string
  error?: string
  screenshots?: string[]
}

const DEFAULT_CONFIG: BrowserConfig = {
  headless: true,
  viewport: { width: 1366, height: 768 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  timeout: 30000
}

/**
 * Main browser automation function for posting content
 * @param request - Post request with content and platform
 * @param credentials - Login credentials for the platform
 * @param config - Browser configuration options
 * @returns Promise<PostResult> - Result of automated posting
 */
export async function automatePost(
  request: PostRequest,
  credentials: LoginCredentials,
  config: BrowserConfig = DEFAULT_CONFIG
): Promise<PostResult> {
  let browser: Browser | null = null
  
  try {
    browser = await puppeteer.launch({
      headless: config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    })

    const page = await browser.newPage()
    await page.setUserAgent(config.userAgent)
    await page.setViewport(config.viewport)

    // Set longer timeout for complex operations
    page.setDefaultTimeout(config.timeout)

    let result: AutomationResult

    switch (request.platform) {
      case 'reddit':
        result = await automateRedditPost(page, request, credentials)
        break
      case 'twitter':
        result = await automateTwitterPost(page, request, credentials)
        break
      case 'medium':
        result = await automateMediumPost(page, request, credentials)
        break
      case 'pinterest':
        result = await automatePinterestPost(page, request, credentials)
        break
      case 'facebook':
        result = await automateFacebookPost(page, request, credentials)
        break
      case 'linkedin':
        result = await automateLinkedInPost(page, request, credentials)
        break
      default:
        throw new Error(`Browser automation not implemented for ${request.platform}`)
    }

    return {
      success: result.success,
      postId: extractPostIdFromUrl(result.postUrl || '', request.platform),
      url: result.postUrl,
      error: result.error,
      platform: request.platform,
      postedAt: new Date(),
      method: 'automation'
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Browser automation failed',
      platform: request.platform,
      postedAt: new Date(),
      method: 'automation'
    }
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

/**
 * Automate Reddit posting using browser
 * @param page - Puppeteer page instance
 * @param request - Post request
 * @param credentials - Reddit login credentials
 * @returns Promise<AutomationResult> - Automation result
 */
async function automateRedditPost(
  page: Page,
  request: PostRequest,
  credentials: LoginCredentials
): Promise<AutomationResult> {
  try {
    // Navigate to Reddit login
    await page.goto('https://www.reddit.com/login')
    await page.waitForSelector('#loginUsername')

    // Login
    await page.type('#loginUsername', credentials.username)
    await page.type('#loginPassword', credentials.password)
    await page.click('button[type="submit"]')
    
    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    // Navigate to subreddit
    const subreddit = request.options?.subreddit || 'test'
    await page.goto(`https://www.reddit.com/r/${subreddit}/submit`)
    await page.waitForSelector('[data-testid="post-type-link"]')

    // Choose post type (link or text)
    const hasUrl = extractUrlFromContent(request.content)
    if (hasUrl) {
      await page.click('[data-testid="post-type-link"]')
      await page.waitForSelector('input[name="url"]')
      await page.type('input[name="url"]', hasUrl)
    } else {
      await page.click('[data-testid="post-type-text"]')
    }

    // Fill in title
    await page.waitForSelector('textarea[name="title"]')
    await page.type('textarea[name="title"]', request.content.title)

    // Fill in text content if text post
    if (!hasUrl) {
      await page.waitForSelector('div[data-testid="richtext-editor"]')
      await page.click('div[data-testid="richtext-editor"]')
      await page.type('div[data-testid="richtext-editor"]', formatContentForReddit(request.content))
    }

    // Submit post
    await page.click('button[type="submit"]')
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 })

    // Get post URL
    const postUrl = page.url()

    return {
      success: true,
      postUrl,
      screenshots: [await page.screenshot({ encoding: 'base64' })]
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Reddit automation failed',
      screenshots: [await page.screenshot({ encoding: 'base64' })]
    }
  }
}

/**
 * Automate Twitter posting using browser
 * @param page - Puppeteer page instance
 * @param request - Post request
 * @param credentials - Twitter login credentials
 * @returns Promise<AutomationResult> - Automation result
 */
async function automateTwitterPost(
  page: Page,
  request: PostRequest,
  credentials: LoginCredentials
): Promise<AutomationResult> {
  try {
    // Navigate to Twitter login
    await page.goto('https://twitter.com/login')
    await page.waitForSelector('input[name="text"]')

    // Login step 1: username/email
    await page.type('input[name="text"]', credentials.username)
    await page.click('span:has-text("Next")')
    
    // Login step 2: password
    await page.waitForSelector('input[name="password"]')
    await page.type('input[name="password"]', credentials.password)
    await page.click('span:has-text("Log in")')
    
    // Handle 2FA if needed
    if (credentials.twoFactorCode) {
      try {
        await page.waitForSelector('input[name="text"]', { timeout: 5000 })
        await page.type('input[name="text"]', credentials.twoFactorCode)
        await page.click('span:has-text("Next")')
      } catch {
        // 2FA not required or already handled
      }
    }

    // Wait for home page
    await page.waitForSelector('[data-testid="tweetTextarea_0"]', { timeout: 15000 })

    // Type tweet content
    const tweetText = formatContentForTwitter(request.content)
    await page.click('[data-testid="tweetTextarea_0"]')
    await page.type('[data-testid="tweetTextarea_0"]', tweetText)

    // Post tweet
    await page.click('[data-testid="tweetButtonInline"]')
    
    // Wait for success (URL will change)
    await page.waitForFunction(
      () => window.location.href.includes('/status/'),
      { timeout: 10000 }
    )

    const postUrl = page.url()

    return {
      success: true,
      postUrl,
      screenshots: [await page.screenshot({ encoding: 'base64' })]
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Twitter automation failed',
      screenshots: [await page.screenshot({ encoding: 'base64' })]
    }
  }
}

/**
 * Automate Medium posting using browser
 * @param page - Puppeteer page instance
 * @param request - Post request
 * @param credentials - Medium login credentials
 * @returns Promise<AutomationResult> - Automation result
 */
async function automateMediumPost(
  page: Page,
  request: PostRequest,
  credentials: LoginCredentials
): Promise<AutomationResult> {
  try {
    // Navigate to Medium login
    await page.goto('https://medium.com/m/signin')
    await page.waitForSelector('input[type="email"]')

    // Login
    await page.type('input[type="email"]', credentials.username)
    await page.click('button[type="submit"]')
    
    await page.waitForSelector('input[type="password"]')
    await page.type('input[type="password"]', credentials.password)
    await page.click('button[type="submit"]')

    // Wait for dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    // Create new story
    await page.goto('https://medium.com/new-story')
    await page.waitForSelector('[data-testid="richTextEditor"]')

    // Add title
    await page.click('h1[data-testid="richTextEditor"]')
    await page.type('h1[data-testid="richTextEditor"]', request.content.title)

    // Add content
    await page.click('div[data-testid="richTextEditor"]:not(h1)')
    await page.type('div[data-testid="richTextEditor"]:not(h1)', formatContentForMedium(request.content))

    // Publish
    await page.click('button:has-text("Publish")')
    await page.waitForSelector('button:has-text("Publish now")')
    await page.click('button:has-text("Publish now")')

    // Wait for success page
    await page.waitForSelector('a[href*="/p/"]', { timeout: 10000 })
    const postUrl = await page.$eval('a[href*="/p/"]', el => el.href)

    return {
      success: true,
      postUrl,
      screenshots: [await page.screenshot({ encoding: 'base64' })]
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Medium automation failed',
      screenshots: [await page.screenshot({ encoding: 'base64' })]
    }
  }
}

/**
 * Automate Pinterest posting using browser
 * @param page - Puppeteer page instance
 * @param request - Post request
 * @param credentials - Pinterest login credentials
 * @returns Promise<AutomationResult> - Automation result
 */
async function automatePinterestPost(
  page: Page,
  request: PostRequest,
  credentials: LoginCredentials
): Promise<AutomationResult> {
  try {
    // Navigate to Pinterest login
    await page.goto('https://www.pinterest.com/login/')
    await page.waitForSelector('#email')

    // Login
    await page.type('#email', credentials.username)
    await page.type('#password', credentials.password)
    await page.click('button[type="submit"]')

    // Wait for home page
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    // Create pin
    await page.goto('https://www.pinterest.com/pin/create/')
    await page.waitForSelector('[data-testid="media-upload-input"]')

    // Upload image (would need to be provided)
    const imageUrl = request.options?.imageUrl || generatePlaceholderImage(request.content.title)
    if (imageUrl.startsWith('http')) {
      // For URL-based images, we'd need to download and upload
      console.warn('Pinterest automation requires local image file')
    }

    // Add description
    await page.waitForSelector('textarea[data-testid="pin-draft-description"]')
    await page.type('textarea[data-testid="pin-draft-description"]', formatContentForPinterest(request.content))

    // Add title
    await page.waitForSelector('input[data-testid="pin-draft-title"]')
    await page.type('input[data-testid="pin-draft-title"]', request.content.title)

    // Publish
    await page.click('button[data-testid="pin-draft-publish-button"]')
    
    // Wait for success
    await page.waitForSelector('[data-testid="pin-url"]', { timeout: 10000 })
    const postUrl = await page.$eval('[data-testid="pin-url"]', el => el.textContent)

    return {
      success: true,
      postUrl: postUrl || undefined,
      screenshots: [await page.screenshot({ encoding: 'base64' })]
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Pinterest automation failed',
      screenshots: [await page.screenshot({ encoding: 'base64' })]
    }
  }
}

/**
 * Automate Facebook posting using browser
 * @param page - Puppeteer page instance
 * @param request - Post request
 * @param credentials - Facebook login credentials
 * @returns Promise<AutomationResult> - Automation result
 */
async function automateFacebookPost(
  page: Page,
  request: PostRequest,
  credentials: LoginCredentials
): Promise<AutomationResult> {
  try {
    // Navigate to Facebook login
    await page.goto('https://www.facebook.com/login')
    await page.waitForSelector('#email')

    // Login
    await page.type('#email', credentials.username)
    await page.type('#pass', credentials.password)
    await page.click('#loginbutton')

    // Wait for home page
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    // Create post
    await page.waitForSelector('[data-testid="status-attachment-mentions-input"]')
    await page.click('[data-testid="status-attachment-mentions-input"]')
    
    // Type content
    const postText = formatContentForFacebook(request.content)
    await page.type('[data-testid="status-attachment-mentions-input"]', postText)

    // Post
    await page.click('[data-testid="react-composer-post-button"]')
    
    // Wait for post to appear in feed
    await page.waitForSelector('[data-testid="fbfeed_story"]', { timeout: 10000 })

    return {
      success: true,
      postUrl: page.url(),
      screenshots: [await page.screenshot({ encoding: 'base64' })]
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Facebook automation failed',
      screenshots: [await page.screenshot({ encoding: 'base64' })]
    }
  }
}

/**
 * Automate LinkedIn posting using browser
 * @param page - Puppeteer page instance
 * @param request - Post request
 * @param credentials - LinkedIn login credentials
 * @returns Promise<AutomationResult> - Automation result
 */
async function automateLinkedInPost(
  page: Page,
  request: PostRequest,
  credentials: LoginCredentials
): Promise<AutomationResult> {
  try {
    // Navigate to LinkedIn login
    await page.goto('https://www.linkedin.com/login')
    await page.waitForSelector('#username')

    // Login
    await page.type('#username', credentials.username)
    await page.type('#password', credentials.password)
    await page.click('button[type="submit"]')

    // Wait for home page
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

    // Create post
    await page.waitForSelector('button[aria-label="Start a post"]')
    await page.click('button[aria-label="Start a post"]')
    
    // Wait for post composer
    await page.waitForSelector('div[data-testid="share-box-content-editor"]')
    await page.click('div[data-testid="share-box-content-editor"]')
    
    // Type content
    const postText = formatContentForLinkedIn(request.content)
    await page.type('div[data-testid="share-box-content-editor"]', postText)

    // Post
    await page.click('button[data-testid="share-actions-post-button"]')
    
    // Wait for success
    await page.waitForSelector('[data-testid="success-share-alert"]', { timeout: 10000 })

    return {
      success: true,
      postUrl: page.url(),
      screenshots: [await page.screenshot({ encoding: 'base64' })]
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'LinkedIn automation failed',
      screenshots: [await page.screenshot({ encoding: 'base64' })]
    }
  }
}

// Content formatting functions for each platform

function formatContentForReddit(content: GeneratedContent): string {
  return `${content.content}\n\n${content.hashtags.join(' ')}\n\n${content.callToAction}`
}

function formatContentForTwitter(content: GeneratedContent): string {
  const maxLength = 280
  let tweet = `${content.title}\n\n${content.content}\n\n${content.hashtags.slice(0, 3).join(' ')}\n\n${content.callToAction}`
  
  if (tweet.length > maxLength) {
    const overhead = content.title.length + content.hashtags.slice(0, 3).join(' ').length + content.callToAction.length + 10
    const availableForContent = maxLength - overhead
    
    if (availableForContent > 50) {
      const truncatedContent = content.content.substring(0, availableForContent - 3) + '...'
      tweet = `${content.title}\n\n${truncatedContent}\n\n${content.hashtags.slice(0, 3).join(' ')}\n\n${content.callToAction}`
    } else {
      tweet = `${content.title}\n\n${content.callToAction}`
    }
  }
  
  return tweet
}

function formatContentForMedium(content: GeneratedContent): string {
  return `${content.content}\n\n---\n\n${content.hashtags.join(' ')}\n\n**${content.callToAction}**`
}

function formatContentForPinterest(content: GeneratedContent): string {
  return `${content.content}\n\n${content.hashtags.join(' ')}\n\n${content.callToAction}`
}

function formatContentForFacebook(content: GeneratedContent): string {
  return `${content.title}\n\n${content.content}\n\n${content.hashtags.join(' ')}\n\n${content.callToAction}`
}

function formatContentForLinkedIn(content: GeneratedContent): string {
  return `${content.title}\n\n${content.content}\n\n${content.hashtags.join(' ')}\n\n${content.callToAction}`
}

// Helper functions

function extractUrlFromContent(content: GeneratedContent): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const match = content.callToAction.match(urlRegex) || content.content.match(urlRegex)
  return match ? match[0] : ''
}

function extractPostIdFromUrl(url: string, platform: string): string {
  switch (platform) {
    case 'reddit':
      const redditMatch = url.match(/\/comments\/([a-zA-Z0-9]+)\//)
      return redditMatch ? redditMatch[1] : ''
    case 'twitter':
      const twitterMatch = url.match(/\/status\/(\d+)/)
      return twitterMatch ? twitterMatch[1] : ''
    case 'medium':
      const mediumMatch = url.match(/\/p\/([a-zA-Z0-9]+)/)
      return mediumMatch ? mediumMatch[1] : ''
    default:
      return ''
  }
}

function generatePlaceholderImage(title: string): string {
  return `https://via.placeholder.com/600x400/FF6B6B/FFFFFF?text=${encodeURIComponent(title)}`
}

/**
 * Test browser automation setup
 * @returns Promise<boolean> - Whether browser automation is working
 */
export async function testBrowserAutomation(): Promise<boolean> {
  let browser: Browser | null = null
  
  try {
    browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto('https://example.com')
    const title = await page.title()
    
    return title === 'Example Domain'
  } catch (error) {
    console.error('Browser automation test failed:', error)
    return false
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
