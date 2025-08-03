/**
 * Main AI Processing API Route for ClickSprout v1.0
 * Orchestrates scraping, content generation, and posting workflow
 */

import { NextRequest, NextResponse } from 'next/server'
import { scrapeProduct, isValidUrl, ProductMetadata } from '@/lib/scraper'
import { generateViralContent, generateProductInfo, ContentRequest } from '@/lib/aiContentGenerator'
import { postToPlatform, batchPost, Platform } from '@/lib/poster'
import { initializeTracking } from '@/lib/analyticsTracker'

// Types for API requests and responses
interface ProcessRequest {
  // Input options
  productUrl?: string
  manualInput?: {
    title: string
    description: string
    category?: string
  }
  
  // Content generation options
  platforms: Platform[]
  contentType: 'article' | 'caption' | 'hashtags' | 'video-script' | 'ad-copy' | 'email'
  tone: 'professional' | 'casual' | 'humorous' | 'urgent' | 'inspiring' | 'educational'
  targetAudience: string
  
  // Posting options
  autoPost: boolean
  scheduledTime?: string
  platformOptions?: Record<Platform, any>
}

interface ProcessResponse {
  success: boolean
  data?: {
    productData: ProductMetadata
    generatedContent: Partial<Record<Platform, any>>
    postResults?: Partial<Record<Platform, any>>
    trackingIds?: Partial<Record<Platform, string>>
  }
  error?: string
  processingTime: number
}

/**
 * Main AI processing endpoint
 * Handles the complete workflow: scrape → generate → post → track
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    const body: ProcessRequest = await request.json()
    
    // Validate request
    if (!body.productUrl && !body.manualInput) {
      return NextResponse.json({
        success: false,
        error: 'Either productUrl or manualInput is required',
        processingTime: Date.now() - startTime
      }, { status: 400 })
    }

    if (!body.platforms || body.platforms.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one platform must be specified',
        processingTime: Date.now() - startTime
      }, { status: 400 })
    }

    // Step 1: Get product data (scrape or use manual input)
    let productData: ProductMetadata

    if (body.productUrl) {
      if (!isValidUrl(body.productUrl)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid URL provided',
          processingTime: Date.now() - startTime
        }, { status: 400 })
      }

      console.log(`Scraping product data from: ${body.productUrl}`)
      
      const scrapingResult = await scrapeProduct(body.productUrl, {
        enableJavaScript: true,
        timeout: 30000
      })

      if (scrapingResult.success && scrapingResult.data) {
        productData = scrapingResult.data
        console.log(`✅ Successfully scraped: ${productData.title}`)
      } else {
        console.log(`⚠️ Scraping failed, using AI fallback for: ${body.productUrl}`)
        
        // Fallback to AI generation
        productData = await generateProductInfo({
          url: body.productUrl,
          title: body.manualInput?.title,
          description: body.manualInput?.description
        })
      }
    } else {
      // Use manual input
      productData = {
        title: body.manualInput!.title,
        description: body.manualInput!.description,
        category: body.manualInput!.category,
        images: [],
        videos: [],
        url: '',
        scrapedAt: new Date()
      }
    }

    // Step 2: Generate content for each platform
    console.log(`🤖 Generating content for ${body.platforms.length} platforms`)
    
    const generatedContent: Partial<Record<Platform, any>> = {}
    const contentPromises = body.platforms.map(async (platform) => {
      const contentRequest: ContentRequest = {
        productData,
        platform: platform as any, // Cast to match ContentRequest type
        contentType: body.contentType,
        tone: body.tone,
        targetAudience: body.targetAudience
      }

      const result = await generateViralContent(contentRequest)
      
      if (result.success && result.content) {
        generatedContent[platform] = result.content
        console.log(`✅ Generated ${platform} content: ${result.content.title}`)
      } else {
        console.error(`❌ Failed to generate ${platform} content:`, result.error)
        throw new Error(`Content generation failed for ${platform}: ${result.error}`)
      }
    })

    await Promise.all(contentPromises)

    // Step 3: Post content if autoPost is enabled
    let postResults: Partial<Record<Platform, any>> = {}
    let trackingIds: Partial<Record<Platform, string>> = {}

    if (body.autoPost) {
      console.log(`📤 Auto-posting to ${body.platforms.length} platforms`)
      
      const postPromises = body.platforms.map(async (platform) => {
        try {
          const postRequest = {
            content: generatedContent[platform],
            platform,
            scheduledTime: body.scheduledTime ? new Date(body.scheduledTime) : undefined,
            options: body.platformOptions?.[platform]
          }

          const postResult = await postToPlatform(postRequest)
          postResults[platform] = postResult

          if (postResult.success) {
            console.log(`✅ Posted to ${platform}: ${postResult.url}`)
            
            // Initialize analytics tracking
            const trackingId = await initializeTracking(postResult, generatedContent[platform])
            trackingIds[platform] = trackingId
          } else {
            console.error(`❌ Failed to post to ${platform}:`, postResult.error)
          }
        } catch (error) {
          console.error(`❌ Posting error for ${platform}:`, error)
          postResults[platform] = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown posting error',
            platform,
            postedAt: new Date(),
            method: 'api'
          }
        }
      })

      await Promise.all(postPromises)
    }

    // Step 4: Return comprehensive response
    const processingTime = Date.now() - startTime
    console.log(`🎉 Processing complete in ${processingTime}ms`)

    const response: ProcessResponse = {
      success: true,
      data: {
        productData,
        generatedContent,
        ...(body.autoPost && { postResults, trackingIds })
      },
      processingTime
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ AI processing error:', error)
    
    const processingTime = Date.now() - startTime
    const response: ProcessResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown processing error',
      processingTime
    }

    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * Get processing status (for long-running operations)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json({
      error: 'Job ID is required'
    }, { status: 400 })
  }

  // This would typically check a job queue or database
  // For now, return a simple status
  return NextResponse.json({
    jobId,
    status: 'completed',
    message: 'Processing completed successfully'
  })
}

/**
 * Health check endpoint
 */
export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, { status: 200 })
}
