/**
 * Advanced Web Scraper for ClickSprout v1.0
 * Handles intelligent product metadata extraction from any URL
 * Uses multiple fallback strategies for maximum success rate
 */

import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'

// Types for structured data extraction
export interface ProductMetadata {
  title: string
  description: string
  price?: string
  images: string[]
  videos: string[]
  brand?: string
  category?: string
  availability?: string
  rating?: number
  reviews?: number
  url: string
  scrapedAt: Date
}

export interface ScrapingResult {
  success: boolean
  data?: ProductMetadata
  error?: string
  method: 'cheerio' | 'puppeteer' | 'fallback'
}

/**
 * Primary scraping function - tries multiple methods for best results
 * @param url - Product URL to scrape
 * @param options - Scraping configuration options
 * @returns Promise<ScrapingResult> - Structured product data or error
 */
export async function scrapeProduct(
  url: string, 
  options: {
    timeout?: number
    userAgent?: string
    waitForSelector?: string
    enableJavaScript?: boolean
  } = {}
): Promise<ScrapingResult> {
  const config = {
    timeout: options.timeout || 30000,
    userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    enableJavaScript: options.enableJavaScript || false,
    ...options
  }

  // Try Cheerio first (fast, lightweight)
  try {
    const cheerioResult = await scrapeWithCheerio(url, config)
    if (cheerioResult.success && cheerioResult.data) {
      return { ...cheerioResult, method: 'cheerio' }
    }
  } catch (error) {
    console.warn('Cheerio scraping failed:', error)
  }

  // Fallback to Puppeteer (handles JavaScript-heavy sites)
  if (config.enableJavaScript) {
    try {
      const puppeteerResult = await scrapeWithPuppeteer(url, config)
      if (puppeteerResult.success && puppeteerResult.data) {
        return { ...puppeteerResult, method: 'puppeteer' }
      }
    } catch (error) {
      console.warn('Puppeteer scraping failed:', error)
    }
  }

  return {
    success: false,
    error: 'All scraping methods failed',
    method: 'fallback'
  }
}

/**
 * Fast scraping using Cheerio for static content
 * @param url - Target URL
 * @param config - Scraping configuration
 * @returns Promise<ScrapingResult> - Scraped data or error
 */
async function scrapeWithCheerio(url: string, config: any): Promise<ScrapingResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: AbortSignal.timeout(config.timeout)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract metadata using multiple selectors (OpenGraph, Twitter Cards, JSON-LD, etc.)
    const metadata: ProductMetadata = {
      title: extractTitle($),
      description: extractDescription($),
      price: extractPrice($),
      images: extractImages($, url),
      videos: extractVideos($, url),
      brand: extractBrand($),
      category: extractCategory($),
      availability: extractAvailability($),
      rating: extractRating($),
      reviews: extractReviewCount($),
      url,
      scrapedAt: new Date()
    }

    // Validate that we got meaningful data
    if (!metadata.title && !metadata.description) {
      throw new Error('No meaningful content found')
    }

    return {
      success: true,
      data: metadata,
      method: 'cheerio'
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'cheerio'
    }
  }
}

/**
 * JavaScript-enabled scraping using Puppeteer for dynamic content
 * @param url - Target URL
 * @param config - Scraping configuration
 * @returns Promise<ScrapingResult> - Scraped data or error
 */
async function scrapeWithPuppeteer(url: string, config: any): Promise<ScrapingResult> {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })

    const page = await browser.newPage()
    await page.setUserAgent(config.userAgent)
    await page.setViewport({ width: 1366, height: 768 })

    // Navigate to page with timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: config.timeout
    })

    // Wait for specific selector if provided
    if (config.waitForSelector) {
      await page.waitForSelector(config.waitForSelector, { timeout: 5000 })
    }

    // Extract data using page evaluation
    const metadata = await page.evaluate((currentUrl) => {
      // Helper function to extract text content safely
      const getText = (selector: string): string => {
        const element = document.querySelector(selector)
        return element?.textContent?.trim() || ''
      }

      // Helper function to extract attribute safely
      const getAttr = (selector: string, attr: string): string => {
        const element = document.querySelector(selector)
        return element?.getAttribute(attr) || ''
      }

      // Extract all images
      const images = Array.from(document.querySelectorAll('img'))
        .map(img => img.src)
        .filter(src => src && !src.includes('data:'))
        .slice(0, 10) // Limit to first 10 images

      // Extract all videos
      const videos = Array.from(document.querySelectorAll('video'))
        .map(video => video.src || video.querySelector('source')?.src)
        .filter(Boolean)
        .slice(0, 5) // Limit to first 5 videos

      return {
        title: getText('h1') || 
               getAttr('meta[property="og:title"]', 'content') ||
               getAttr('meta[name="twitter:title"]', 'content') ||
               document.title,
        description: getAttr('meta[property="og:description"]', 'content') ||
                    getAttr('meta[name="description"]', 'content') ||
                    getAttr('meta[name="twitter:description"]', 'content'),
        price: getText('[data-testid="price"]') || 
               getText('.price') || 
               getText('[class*="price"]'),
        images,
        videos,
        brand: getAttr('meta[property="product:brand"]', 'content'),
        category: getAttr('meta[property="product:category"]', 'content'),
        availability: getAttr('meta[property="product:availability"]', 'content'),
        url: currentUrl,
        scrapedAt: new Date()
      }
    }, url)

    return {
      success: true,
      data: metadata as ProductMetadata,
      method: 'puppeteer'
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'puppeteer'
    }
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Helper functions for Cheerio extraction
function extractTitle($: cheerio.CheerioAPI): string {
  return $('meta[property="og:title"]').attr('content') ||
         $('meta[name="twitter:title"]').attr('content') ||
         $('h1').first().text().trim() ||
         $('title').text().trim() ||
         ''
}

function extractDescription($: cheerio.CheerioAPI): string {
  return $('meta[property="og:description"]').attr('content') ||
         $('meta[name="description"]').attr('content') ||
         $('meta[name="twitter:description"]').attr('content') ||
         $('.description').first().text().trim() ||
         ''
}

function extractPrice($: cheerio.CheerioAPI): string | undefined {
  const priceSelectors = [
    '[data-testid="price"]',
    '.price',
    '[class*="price"]',
    '[id*="price"]',
    '.cost',
    '.amount'
  ]

  for (const selector of priceSelectors) {
    const price = $(selector).first().text().trim()
    if (price && /[\$£€¥₹]/.test(price)) {
      return price
    }
  }
  return undefined
}

function extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const images: string[] = []
  
  // OpenGraph image
  const ogImage = $('meta[property="og:image"]').attr('content')
  if (ogImage) images.push(ogImage)

  // Twitter image
  const twitterImage = $('meta[name="twitter:image"]').attr('content')
  if (twitterImage) images.push(twitterImage)

  // All img tags
  $('img').each((_, img) => {
    const src = $(img).attr('src')
    if (src && !src.startsWith('data:')) {
      const absoluteUrl = new URL(src, baseUrl).href
      images.push(absoluteUrl)
    }
  })

  // Remove duplicates and limit to 10
  return [...new Set(images)].slice(0, 10)
}

function extractVideos($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const videos: string[] = []

  $('video').each((_, video) => {
    const src = $(video).attr('src')
    if (src) {
      const absoluteUrl = new URL(src, baseUrl).href
      videos.push(absoluteUrl)
    }

    // Check for source tags within video
    $(video).find('source').each((_, source) => {
      const sourceSrc = $(source).attr('src')
      if (sourceSrc) {
        const absoluteUrl = new URL(sourceSrc, baseUrl).href
        videos.push(absoluteUrl)
      }
    })
  })

  return [...new Set(videos)].slice(0, 5)
}

function extractBrand($: cheerio.CheerioAPI): string | undefined {
  return $('meta[property="product:brand"]').attr('content') ||
         $('[data-testid="brand"]').text().trim() ||
         $('.brand').first().text().trim() ||
         undefined
}

function extractCategory($: cheerio.CheerioAPI): string | undefined {
  return $('meta[property="product:category"]').attr('content') ||
         $('[data-testid="category"]').text().trim() ||
         $('.category').first().text().trim() ||
         undefined
}

function extractAvailability($: cheerio.CheerioAPI): string | undefined {
  return $('meta[property="product:availability"]').attr('content') ||
         $('[data-testid="availability"]').text().trim() ||
         $('.availability').first().text().trim() ||
         undefined
}

function extractRating($: cheerio.CheerioAPI): number | undefined {
  const ratingText = $('[data-testid="rating"]').text().trim() ||
                    $('.rating').first().text().trim() ||
                    $('[class*="star"]').first().text().trim()
  
  const rating = parseFloat(ratingText)
  return isNaN(rating) ? undefined : rating
}

function extractReviewCount($: cheerio.CheerioAPI): number | undefined {
  const reviewText = $('[data-testid="reviews"]').text().trim() ||
                    $('.reviews').first().text().trim() ||
                    $('[class*="review"]').first().text().trim()
  
  const match = reviewText.match(/(\d+)/)
  return match ? parseInt(match[1]) : undefined
}

/**
 * Quick validation to check if a URL is scrapeable
 * @param url - URL to validate
 * @returns boolean - Whether the URL appears to be valid for scraping
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

/**
 * Extract domain from URL for platform-specific handling
 * @param url - Target URL
 * @returns string - Domain name (e.g., 'amazon.com')
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return ''
  }
}
