/**
 * 🔧 Advanced AI-Powered Scraper + Article Generator for ClickSprout v1.0
 * 📌 High-quality link scraping and intelligent content generation
 * 🚀 Combines web scraping with OpenAI for professional articles
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

/**
 * Advanced scraper and AI article generator
 * @param {string} link - URL to scrape and generate content for
 * @returns {Promise<Object>} Scraped data and generated article
 */
async function scrapeAndGenerate(link) {
  console.log(`🔍 Starting advanced scraping for: ${link}`);
  
  let title = '', description = '', images = [], videos = [];
  let content = '', price = '', brand = '', category = '';
  
  try {
    // Step 1: Try basic HTTP request first (faster)
    let html = '';
    try {
      console.log('📡 Attempting basic HTTP scraping...');
      const response = await axios.get(link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      html = response.data;
    } catch (httpError) {
      console.log('⚠️ Basic HTTP failed, using Puppeteer for dynamic content...');
      
      // Step 2: Use Puppeteer for JavaScript-heavy sites
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.goto(link, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      html = await page.content();
      await browser.close();
    }

    // Step 3: Parse HTML content with Cheerio
    const $ = cheerio.load(html);
    
    // Extract Open Graph and meta data
    title = $('meta[property="og:title"]').attr('content') || 
            $('meta[name="twitter:title"]').attr('content') || 
            $('title').text().trim() || 
            $('h1').first().text().trim();
    
    description = $('meta[property="og:description"]').attr('content') || 
                  $('meta[name="description"]').attr('content') || 
                  $('meta[name="twitter:description"]').attr('content') || 
                  $('p').first().text().trim();
    
    // Extract images
    const ogImage = $('meta[property="og:image"]').attr('content');
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    if (ogImage) images.push(ogImage);
    if (twitterImage && !images.includes(twitterImage)) images.push(twitterImage);
    
    // Extract additional images from common selectors
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.startsWith('data:') && src.includes('http')) {
        if (!images.includes(src)) images.push(src);
      }
    });
    
    // Extract videos
    const ogVideo = $('meta[property="og:video"]').attr('content');
    if (ogVideo) videos.push(ogVideo);
    
    $('video source').each((i, el) => {
      const src = $(el).attr('src');
      if (src && !videos.includes(src)) videos.push(src);
    });
    
    // Extract product-specific data
    price = $('meta[property="product:price:amount"]').attr('content') || 
            $('.price, .cost, [data-price]').first().text().trim() ||
            $('span:contains("$"), span:contains("€"), span:contains("£")').first().text().trim();
    
    brand = $('meta[property="product:brand"]').attr('content') || 
            $('.brand, [data-brand]').first().text().trim();
    
    category = $('meta[property="product:category"]').attr('content') || 
               $('.category, [data-category]').first().text().trim();
    
    // Extract main content
    content = $('.content, .description, .product-description, .post-content, article').first().text().trim() ||
              $('p').slice(0, 3).map((i, el) => $(el).text().trim()).get().join(' ');
    
    console.log('✅ Scraping completed successfully');
    
  } catch (error) {
    console.error('❌ Error during scraping:', error.message);
    title = 'Product Information';
    description = 'Check out this amazing product';
  }

  // Step 4: Generate AI-powered article content
  console.log('🤖 Generating AI-powered article...');
  
  try {
    const article = await generateAIArticle({
      title,
      description,
      content,
      price,
      brand,
      category,
      url: link
    });
    
    console.log('✅ AI article generation completed');
    
    return {
      success: true,
      url: link,
      title: title || 'Amazing Product Discovery',
      description: description || 'Check out this incredible find!',
      content: article,
      images: images.slice(0, 10), // Limit to 10 images
      videos: videos.slice(0, 5),  // Limit to 5 videos
      price,
      brand,
      category,
      metadata: {
        scrapedAt: new Date().toISOString(),
        imageCount: images.length,
        videoCount: videos.length
      }
    };
    
  } catch (aiError) {
    console.error('❌ AI generation failed:', aiError.message);
    
    // Fallback to template-based content
    const fallbackContent = generateFallbackContent({
      title,
      description,
      content,
      price,
      brand,
      url: link
    });
    
    return {
      success: true,
      url: link,
      title: title || 'Product Discovery',
      description: description || 'Check out this product',
      content: fallbackContent,
      images: images.slice(0, 10),
      videos: videos.slice(0, 5),
      price,
      brand,
      category,
      metadata: {
        scrapedAt: new Date().toISOString(),
        imageCount: images.length,
        videoCount: videos.length,
        aiGenerated: false
      }
    };
  }
}

/**
 * Generate AI-powered article using OpenAI
 * @param {Object} productData - Scraped product information
 * @returns {Promise<string>} Generated article content
 */
async function generateAIArticle(productData) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Import OpenAI for content generation
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Write a comprehensive, engaging, and SEO-optimized article about this product. Make it viral and compelling:

Product Title: ${productData.title}
Description: ${productData.description}
Price: ${productData.price || 'Contact for pricing'}
Brand: ${productData.brand || 'Premium brand'}
Category: ${productData.category || 'Featured product'}
URL: ${productData.url}

Content Guidelines:
- Write 400-600 words
- Use engaging headlines and subheadings
- Include compelling reasons to buy
- Add urgency and social proof
- Optimize for social media sharing
- Include relevant hashtags
- Make it conversion-focused

Structure:
1. Attention-grabbing headline
2. Product highlights and benefits
3. Why this product stands out
4. Call to action

Write in an enthusiastic, persuasive tone that drives engagement and conversions.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert marketing copywriter specializing in viral product promotion content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    return response.choices[0].message.content.trim();
    
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    throw error;
  }
}

/**
 * Generate fallback content when AI is unavailable
 * @param {Object} productData - Scraped product information
 * @returns {string} Template-based content
 */
function generateFallbackContent(productData) {
  const { title, description, price, brand, url } = productData;
  
  return `# ${title}

## 🔥 Amazing Product Discovery!

${description}

### ✨ Why You'll Love This Product:

• **Premium Quality**: Top-rated product with excellent reviews
• **Great Value**: ${price ? `Starting at ${price}` : 'Competitive pricing available'}
• **Trusted Brand**: ${brand || 'Reputable manufacturer'}
• **Fast Shipping**: Quick delivery to your door

### 🎯 Perfect For:
- Anyone looking for quality and value
- Smart shoppers who want the best deals
- People who appreciate premium products

### 💡 Key Features:
- High-quality construction and materials
- Excellent customer satisfaction ratings
- Reliable performance you can count on
- Great addition to any collection

### 🚀 Get Yours Today!

Don't miss out on this incredible find! Click the link below to learn more and secure yours before they're gone.

👉 **[Check It Out Here](${url})**

#Products #Shopping #Deals #MustHave #Quality

---
*Found something amazing? Share it with friends and spread the love!* ❤️`;
}

/**
 * Quick product info extraction (lightweight version)
 * @param {string} url - URL to scrape
 * @returns {Promise<Object>} Basic product information
 */
async function quickScrape(url) {
  try {
    console.log(`🔍 Quick scraping: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    });
    
    const $ = cheerio.load(response.data);
    
    const title = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
    const image = $('meta[property="og:image"]').attr('content');
    const price = $('.price, .cost, [data-price]').first().text().trim();
    
    return {
      success: true,
      title: title || 'Product',
      description: description || 'Amazing product discovery',
      image: image || '',
      price: price || '',
      url
    };
    
  } catch (error) {
    console.error('Quick scrape failed:', error.message);
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

export { 
  scrapeAndGenerate,
  quickScrape
};
