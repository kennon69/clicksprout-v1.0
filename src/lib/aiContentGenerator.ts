/**
 * AI Content Generator for ClickSprout v1.0
 * Generates viral marketing content using OpenAI GPT-4 and Claude Sonnet
 * Handles fallback generation when scraping fails
 */

import OpenAI from 'openai'
import { ProductMetadata } from './scraper'

// Types for content generation
export interface ContentRequest {
  productData?: ProductMetadata
  manualInput?: {
    title: string
    description: string
    url?: string
    category?: string
  }
  platform: 'reddit' | 'medium' | 'pinterest' | 'facebook' | 'twitter' | 'general'
  contentType: 'article' | 'caption' | 'hashtags' | 'video-script' | 'ad-copy' | 'email'
  tone: 'professional' | 'casual' | 'humorous' | 'urgent' | 'inspiring' | 'educational'
  targetAudience: string
}

export interface GeneratedContent {
  title: string
  content: string
  hashtags: string[]
  callToAction: string
  estimatedViralScore: number
  platform: string
  contentType: string
  generatedAt: Date
  tokenUsage?: number
}

export interface AIGenerationResult {
  success: boolean
  content?: GeneratedContent
  error?: string
  provider: 'openai' | 'claude' | 'fallback'
}

// Initialize OpenAI client
let openaiClient: OpenAI | null = null
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
}

/**
 * Main content generation function with multiple AI provider fallbacks
 * @param request - Content generation parameters
 * @returns Promise<AIGenerationResult> - Generated content or error
 */
export async function generateViralContent(request: ContentRequest): Promise<AIGenerationResult> {
  // Try OpenAI first
  if (openaiClient) {
    try {
      const openaiResult = await generateWithOpenAI(request)
      if (openaiResult.success) {
        return { ...openaiResult, provider: 'openai' }
      }
    } catch (error) {
      console.warn('OpenAI generation failed:', error)
    }
  }

  // Fallback to Claude (if available)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const claudeResult = await generateWithClaude(request)
      if (claudeResult.success) {
        return { ...claudeResult, provider: 'claude' }
      }
    } catch (error) {
      console.warn('Claude generation failed:', error)
    }
  }

  // Final fallback to template-based generation
  return generateFallbackContent(request)
}

/**
 * Generate content using OpenAI GPT-4
 * @param request - Content generation parameters
 * @returns Promise<AIGenerationResult> - Generated content
 */
async function generateWithOpenAI(request: ContentRequest): Promise<AIGenerationResult> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized')
  }

  const prompt = buildPrompt(request)
  
  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a viral marketing expert specializing in creating engaging content that drives clicks, shares, and conversions. You understand psychology, social media algorithms, and what makes content go viral.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })

    const result = response.choices[0]?.message?.content
    if (!result) {
      throw new Error('No response from OpenAI')
    }

    const parsedContent = JSON.parse(result)
    const content: GeneratedContent = {
      title: parsedContent.title,
      content: parsedContent.content,
      hashtags: parsedContent.hashtags || [],
      callToAction: parsedContent.callToAction,
      estimatedViralScore: parsedContent.viralScore || calculateViralScore(parsedContent),
      platform: request.platform,
      contentType: request.contentType,
      generatedAt: new Date(),
      tokenUsage: response.usage?.total_tokens
    }

    return {
      success: true,
      content,
      provider: 'openai'
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown OpenAI error',
      provider: 'openai'
    }
  }
}

/**
 * Generate content using Claude Sonnet (Anthropic)
 * @param request - Content generation parameters
 * @returns Promise<AIGenerationResult> - Generated content
 */
async function generateWithClaude(request: ContentRequest): Promise<AIGenerationResult> {
  // Implementation for Claude API
  // Note: This would require the Anthropic SDK
  try {
    const prompt = buildPrompt(request)
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${result.error?.message || 'Unknown error'}`)
    }

    const parsedContent = JSON.parse(result.content[0].text)
    const content: GeneratedContent = {
      title: parsedContent.title,
      content: parsedContent.content,
      hashtags: parsedContent.hashtags || [],
      callToAction: parsedContent.callToAction,
      estimatedViralScore: parsedContent.viralScore || calculateViralScore(parsedContent),
      platform: request.platform,
      contentType: request.contentType,
      generatedAt: new Date()
    }

    return {
      success: true,
      content,
      provider: 'claude'
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Claude error',
      provider: 'claude'
    }
  }
}

/**
 * Fallback content generation using templates when AI APIs fail
 * @param request - Content generation parameters
 * @returns AIGenerationResult - Template-based content
 */
function generateFallbackContent(request: ContentRequest): AIGenerationResult {
  const productInfo = request.productData || request.manualInput
  if (!productInfo) {
    return {
      success: false,
      error: 'No product data available for fallback generation',
      provider: 'fallback'
    }
  }

  const templates = getFallbackTemplates(request.platform, request.contentType, request.tone)
  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)]

  const content: GeneratedContent = {
    title: selectedTemplate.title.replace('{PRODUCT}', productInfo.title),
    content: selectedTemplate.content.replace('{PRODUCT}', productInfo.title).replace('{DESCRIPTION}', productInfo.description || ''),
    hashtags: selectedTemplate.hashtags,
    callToAction: selectedTemplate.callToAction.replace('{URL}', productInfo.url || ''),
    estimatedViralScore: 60, // Conservative estimate for template content
    platform: request.platform,
    contentType: request.contentType,
    generatedAt: new Date()
  }

  return {
    success: true,
    content,
    provider: 'fallback'
  }
}

/**
 * Build AI prompt based on request parameters
 * @param request - Content generation parameters
 * @returns string - Formatted prompt for AI
 */
function buildPrompt(request: ContentRequest): string {
  const productInfo = request.productData || request.manualInput
  if (!productInfo) {
    throw new Error('No product information provided')
  }

  return `
Create viral ${request.contentType} content for ${request.platform} with a ${request.tone} tone.

PRODUCT INFORMATION:
- Title: ${productInfo.title}
- Description: ${productInfo.description || 'No description available'}
- URL: ${productInfo.url || 'No URL provided'}
- Category: ${productInfo.category || 'General'}
${request.productData?.price ? `- Price: ${request.productData.price}` : ''}
${request.productData?.brand ? `- Brand: ${request.productData.brand}` : ''}

TARGET AUDIENCE: ${request.targetAudience}

REQUIREMENTS:
1. Create content optimized for ${request.platform} algorithm
2. Use ${request.tone} tone throughout
3. Include psychological triggers (scarcity, social proof, FOMO)
4. Add platform-specific formatting
5. Include 5-10 relevant hashtags
6. Create compelling call-to-action
7. Estimate viral score (0-100)

RESPONSE FORMAT (JSON):
{
  "title": "Compelling headline that grabs attention",
  "content": "Main content body optimized for the platform",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "callToAction": "Clear action for users to take",
  "viralScore": 85,
  "reasoning": "Brief explanation of viral potential"
}

Make it irresistible to click, share, and engage with!
`
}

/**
 * Calculate viral score based on content characteristics
 * @param content - Generated content object
 * @returns number - Estimated viral score (0-100)
 */
function calculateViralScore(content: any): number {
  let score = 50 // Base score

  // Check for emotional triggers
  const emotionalWords = ['amazing', 'incredible', 'shocking', 'unbelievable', 'secret', 'exclusive', 'limited', 'urgent']
  const hasEmotionalTriggers = emotionalWords.some(word => 
    content.title?.toLowerCase().includes(word) || 
    content.content?.toLowerCase().includes(word)
  )
  if (hasEmotionalTriggers) score += 10

  // Check for numbers in title
  if (/\d+/.test(content.title)) score += 5

  // Check for question in title
  if (content.title?.includes('?')) score += 5

  // Check hashtag relevance
  if (content.hashtags?.length >= 5) score += 10

  // Check call-to-action strength
  const strongCTAs = ['click', 'buy', 'get', 'download', 'try', 'discover', 'learn']
  const hasStrongCTA = strongCTAs.some(cta => 
    content.callToAction?.toLowerCase().includes(cta)
  )
  if (hasStrongCTA) score += 10

  // Check content length (optimal ranges)
  const contentLength = content.content?.length || 0
  if (contentLength >= 100 && contentLength <= 300) score += 10 // Twitter optimal
  if (contentLength >= 200 && contentLength <= 500) score += 5  // General social optimal

  return Math.min(100, Math.max(0, score))
}

/**
 * Get fallback templates for different platforms and content types
 * @param platform - Target platform
 * @param contentType - Type of content
 * @param tone - Content tone
 * @returns Array of template objects
 */
function getFallbackTemplates(platform: string, contentType: string, tone: string) {
  const templates = {
    reddit: {
      article: [
        {
          title: "Just discovered {PRODUCT} - Game changer!",
          content: "Found this amazing product and had to share: {PRODUCT}. {DESCRIPTION} Anyone else tried this?",
          hashtags: ["#ProductReview", "#LifeHack", "#MustHave"],
          callToAction: "Check it out here: {URL}"
        }
      ],
      caption: [
        {
          title: "{PRODUCT} - Worth the hype?",
          content: "Thoughts on {PRODUCT}? {DESCRIPTION}",
          hashtags: ["#Review", "#ProductDiscussion"],
          callToAction: "What do you think? {URL}"
        }
      ]
    },
    twitter: {
      caption: [
        {
          title: "🔥 {PRODUCT}",
          content: "Just found {PRODUCT} and I'm impressed! {DESCRIPTION} 🚀",
          hashtags: ["#ProductReview", "#TechFinds", "#MustTry"],
          callToAction: "Check it out 👉 {URL}"
        }
      ]
    },
    // Add more platform-specific templates...
  }

  // Default fallback template
  const defaultTemplate = [
    {
      title: "{PRODUCT} - Amazing Discovery!",
      content: "Just discovered {PRODUCT}. {DESCRIPTION}",
      hashtags: ["#ProductReview", "#Discovery", "#MustHave"],
      callToAction: "Learn more: {URL}"
    }
  ]

  // Get platform templates
  const platformTemplates = templates[platform as keyof typeof templates]
  if (!platformTemplates) {
    return defaultTemplate
  }

  // Get content type templates with proper type checking
  const contentTemplates = (platformTemplates as any)[contentType]
  return contentTemplates || defaultTemplate
}

/**
 * Generate product information when scraping fails
 * @param input - Basic product information
 * @returns Promise<ProductMetadata> - AI-generated product details
 */
export async function generateProductInfo(input: {
  title?: string
  url?: string
  description?: string
}): Promise<ProductMetadata> {
  const prompt = `
Generate detailed product information for: ${input.title || input.url}

Based on the URL or title, infer and create:
- Professional product title
- Compelling description (100-200 words)
- Likely category
- Estimated price range
- Target brand (if identifiable)

Response as JSON:
{
  "title": "Professional product name",
  "description": "Compelling product description",
  "category": "Product category",
  "price": "Estimated price range",
  "brand": "Likely brand name"
}
`

  try {
    if (openaiClient) {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a product expert who can infer product details from minimal information.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(response.choices[0]?.message?.content || '{}')
      
      return {
        title: result.title || input.title || 'Product',
        description: result.description || input.description || 'No description available',
        price: result.price,
        images: [],
        videos: [],
        brand: result.brand,
        category: result.category,
        url: input.url || '',
        scrapedAt: new Date()
      }
    }
  } catch (error) {
    console.warn('AI product generation failed:', error)
  }

  // Fallback to basic info
  return {
    title: input.title || 'Product',
    description: input.description || 'Amazing product worth checking out!',
    images: [],
    videos: [],
    url: input.url || '',
    scrapedAt: new Date()
  }
}

/**
 * Optimize content for specific platform algorithms
 * @param content - Generated content
 * @param platform - Target platform
 * @returns GeneratedContent - Platform-optimized content
 */
export function optimizeForPlatform(content: GeneratedContent, platform: string): GeneratedContent {
  const optimized = { ...content }

  switch (platform) {
    case 'twitter':
      // Truncate for Twitter character limit
      if (optimized.content.length > 240) {
        optimized.content = optimized.content.substring(0, 237) + '...'
      }
      // Add Twitter-specific hashtags
      optimized.hashtags = optimized.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      break

    case 'reddit':
      // Remove promotional language for Reddit
      optimized.content = optimized.content.replace(/buy now|purchase|sale/gi, '')
      optimized.callToAction = optimized.callToAction.replace(/buy now/gi, 'check this out')
      break

    case 'linkedin':
      // Professional tone for LinkedIn
      optimized.content = optimized.content.replace(/amazing|incredible/gi, 'impressive')
      break

    case 'facebook':
      // Add engaging questions for Facebook
      if (!optimized.content.includes('?')) {
        optimized.content += ' What do you think?'
      }
      break
  }

  return optimized
}
