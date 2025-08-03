/**
 * Analytics Tracker for ClickSprout v1.0
 * Tracks performance metrics across all platforms
 * Monitors views, clicks, shares, and conversions
 */

import { PostResult, Platform } from './poster'
import { GeneratedContent } from './aiContentGenerator'

// Types for analytics tracking
export interface AnalyticsData {
  postId: string
  platform: Platform
  content: GeneratedContent
  postResult: PostResult
  metrics: PostMetrics
  createdAt: Date
  lastUpdated: Date
}

export interface PostMetrics {
  views: number
  clicks: number
  shares: number
  likes: number
  comments: number
  saves: number
  clickThroughRate: number
  engagementRate: number
  viralScore: number
  revenue?: number
  conversions?: number
}

export interface PlatformMetrics {
  platform: Platform
  totalPosts: number
  totalViews: number
  totalClicks: number
  totalShares: number
  averageEngagement: number
  bestPerformingPost: string
  worstPerformingPost: string
  trendingHashtags: string[]
}

export interface AnalyticsReport {
  summary: {
    totalPosts: number
    totalViews: number
    totalClicks: number
    totalRevenue: number
    averageViralScore: number
    topPerformingPlatform: Platform
  }
  platformBreakdown: PlatformMetrics[]
  timeSeriesData: TimeSeriesPoint[]
  topPosts: AnalyticsData[]
  insights: string[]
  recommendations: string[]
}

export interface TimeSeriesPoint {
  date: Date
  views: number
  clicks: number
  shares: number
  revenue: number
}

/**
 * Initialize analytics tracking for a new post
 * @param postResult - Result from posting operation
 * @param content - Generated content that was posted
 * @returns Promise<string> - Analytics tracking ID
 */
export async function initializeTracking(
  postResult: PostResult,
  content: GeneratedContent
): Promise<string> {
  const analyticsData: AnalyticsData = {
    postId: postResult.postId || generateTrackingId(),
    platform: postResult.platform,
    content,
    postResult,
    metrics: {
      views: 0,
      clicks: 0,
      shares: 0,
      likes: 0,
      comments: 0,
      saves: 0,
      clickThroughRate: 0,
      engagementRate: 0,
      viralScore: content.estimatedViralScore
    },
    createdAt: new Date(),
    lastUpdated: new Date()
  }

  try {
    // Store in database (using your preferred storage solution)
    await storeAnalyticsData(analyticsData)
    
    // Set up periodic tracking
    scheduleMetricsCollection(analyticsData.postId)
    
    console.log(`Analytics tracking initialized for ${postResult.platform} post: ${analyticsData.postId}`)
    
    return analyticsData.postId
  } catch (error) {
    console.error('Failed to initialize analytics tracking:', error)
    throw new Error('Analytics initialization failed')
  }
}

/**
 * Update metrics for a specific post
 * @param postId - Post tracking ID
 * @param platform - Platform where post exists
 * @returns Promise<PostMetrics> - Updated metrics
 */
export async function updatePostMetrics(postId: string, platform: Platform): Promise<PostMetrics> {
  try {
    let metrics: PostMetrics

    switch (platform) {
      case 'reddit':
        metrics = await getRedditMetrics(postId)
        break
      case 'twitter':
        metrics = await getTwitterMetrics(postId)
        break
      case 'medium':
        metrics = await getMediumMetrics(postId)
        break
      case 'pinterest':
        metrics = await getPinterestMetrics(postId)
        break
      case 'facebook':
        metrics = await getFacebookMetrics(postId)
        break
      case 'linkedin':
        metrics = await getLinkedInMetrics(postId)
        break
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }

    // Calculate derived metrics
    metrics.clickThroughRate = metrics.views > 0 ? (metrics.clicks / metrics.views) * 100 : 0
    metrics.engagementRate = metrics.views > 0 ? ((metrics.likes + metrics.comments + metrics.shares) / metrics.views) * 100 : 0
    metrics.viralScore = calculateViralScore(metrics)

    // Update database
    await updateAnalyticsData(postId, { metrics, lastUpdated: new Date() })

    return metrics
  } catch (error) {
    console.error(`Failed to update metrics for ${platform} post ${postId}:`, error)
    throw new Error('Metrics update failed')
  }
}

/**
 * Get Reddit post metrics using API
 * @param postId - Reddit post ID
 * @returns Promise<PostMetrics> - Reddit metrics
 */
async function getRedditMetrics(postId: string): Promise<PostMetrics> {
  try {
    // Extract post info from Reddit ID format (t3_xxxxx)
    const cleanId = postId.replace('t3_', '')
    
    const response = await fetch(`https://www.reddit.com/by_id/${postId}.json`, {
      headers: {
        'User-Agent': 'ClickSprout/1.0'
      }
    })

    const data = await response.json()
    const post = data.data?.children?.[0]?.data

    if (!post) {
      throw new Error('Post not found')
    }

    return {
      views: post.view_count || 0,
      clicks: post.num_clicks || 0,
      shares: post.num_crossposts || 0,
      likes: post.ups || 0,
      comments: post.num_comments || 0,
      saves: post.saved || 0,
      clickThroughRate: 0, // Will be calculated
      engagementRate: 0, // Will be calculated
      viralScore: 0 // Will be calculated
    }
  } catch (error) {
    console.warn('Reddit metrics unavailable:', error)
    return getDefaultMetrics()
  }
}

/**
 * Get Twitter post metrics using API
 * @param postId - Twitter post ID
 * @returns Promise<PostMetrics> - Twitter metrics
 */
async function getTwitterMetrics(postId: string): Promise<PostMetrics> {
  try {
    const response = await fetch(`https://api.twitter.com/2/tweets/${postId}?tweet.fields=public_metrics`, {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
      }
    })

    const data = await response.json()
    const metrics = data.data?.public_metrics

    if (!metrics) {
      throw new Error('Metrics not available')
    }

    return {
      views: metrics.impression_count || 0,
      clicks: metrics.url_link_clicks || 0,
      shares: metrics.retweet_count || 0,
      likes: metrics.like_count || 0,
      comments: metrics.reply_count || 0,
      saves: metrics.bookmark_count || 0,
      clickThroughRate: 0, // Will be calculated
      engagementRate: 0, // Will be calculated
      viralScore: 0 // Will be calculated
    }
  } catch (error) {
    console.warn('Twitter metrics unavailable:', error)
    return getDefaultMetrics()
  }
}

/**
 * Get Medium post metrics using API
 * @param postId - Medium post ID
 * @returns Promise<PostMetrics> - Medium metrics
 */
async function getMediumMetrics(postId: string): Promise<PostMetrics> {
  try {
    // Medium API doesn't provide detailed metrics in free tier
    // This would need to be implemented with web scraping or premium API
    console.warn('Medium metrics require premium API access')
    return getDefaultMetrics()
  } catch (error) {
    console.warn('Medium metrics unavailable:', error)
    return getDefaultMetrics()
  }
}

/**
 * Get Pinterest post metrics using API
 * @param postId - Pinterest pin ID
 * @returns Promise<PostMetrics> - Pinterest metrics
 */
async function getPinterestMetrics(postId: string): Promise<PostMetrics> {
  try {
    const response = await fetch(`https://api.pinterest.com/v5/pins/${postId}?pin_metrics=IMPRESSION,SAVE,PIN_CLICK`, {
      headers: {
        'Authorization': `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`
      }
    })

    const data = await response.json()
    const metrics = data.pin_metrics

    return {
      views: metrics?.IMPRESSION?.value || 0,
      clicks: metrics?.PIN_CLICK?.value || 0,
      shares: 0, // Pinterest doesn't track shares directly
      likes: 0, // Pinterest uses saves instead of likes
      comments: 0, // Would need separate API call
      saves: metrics?.SAVE?.value || 0,
      clickThroughRate: 0, // Will be calculated
      engagementRate: 0, // Will be calculated
      viralScore: 0 // Will be calculated
    }
  } catch (error) {
    console.warn('Pinterest metrics unavailable:', error)
    return getDefaultMetrics()
  }
}

/**
 * Get Facebook post metrics using Graph API
 * @param postId - Facebook post ID
 * @returns Promise<PostMetrics> - Facebook metrics
 */
async function getFacebookMetrics(postId: string): Promise<PostMetrics> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postId}/insights?metric=post_impressions,post_clicks,post_reactions_by_type_total&access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`
    )

    const data = await response.json()
    const insights = data.data || []

    const impressions = insights.find((i: any) => i.name === 'post_impressions')?.values?.[0]?.value || 0
    const clicks = insights.find((i: any) => i.name === 'post_clicks')?.values?.[0]?.value || 0
    const reactions = insights.find((i: any) => i.name === 'post_reactions_by_type_total')?.values?.[0]?.value || {}

    const totalReactions = Object.values(reactions).reduce((sum: number, count: any) => sum + (count || 0), 0)

    return {
      views: impressions,
      clicks: clicks,
      shares: 0, // Would need separate API call
      likes: totalReactions,
      comments: 0, // Would need separate API call
      saves: 0, // Facebook doesn't track saves publicly
      clickThroughRate: 0, // Will be calculated
      engagementRate: 0, // Will be calculated
      viralScore: 0 // Will be calculated
    }
  } catch (error) {
    console.warn('Facebook metrics unavailable:', error)
    return getDefaultMetrics()
  }
}

/**
 * Get LinkedIn post metrics using API
 * @param postId - LinkedIn post ID
 * @returns Promise<PostMetrics> - LinkedIn metrics
 */
async function getLinkedInMetrics(postId: string): Promise<PostMetrics> {
  try {
    // LinkedIn analytics require specific permissions and are limited
    console.warn('LinkedIn metrics require special API access')
    return getDefaultMetrics()
  } catch (error) {
    console.warn('LinkedIn metrics unavailable:', error)
    return getDefaultMetrics()
  }
}

/**
 * Calculate viral score based on engagement metrics
 * @param metrics - Post metrics
 * @returns number - Viral score (0-100)
 */
function calculateViralScore(metrics: PostMetrics): number {
  if (metrics.views === 0) return 0

  const engagementRate = metrics.engagementRate
  const clickRate = metrics.clickThroughRate
  const shareRate = metrics.views > 0 ? (metrics.shares / metrics.views) * 100 : 0

  // Weighted score calculation
  const score = (engagementRate * 0.4) + (clickRate * 0.3) + (shareRate * 0.3)

  return Math.min(100, Math.max(0, Math.round(score)))
}

/**
 * Generate comprehensive analytics report
 * @param timeRange - Time range for report ('7d', '30d', '90d', 'all')
 * @returns Promise<AnalyticsReport> - Comprehensive analytics report
 */
export async function generateAnalyticsReport(timeRange: '7d' | '30d' | '90d' | 'all' = '30d'): Promise<AnalyticsReport> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case 'all':
        startDate.setFullYear(2020) // Set to a very early date
        break
    }

    const allData = await getAnalyticsDataInRange(startDate, endDate)
    
    // Calculate summary metrics
    const summary = {
      totalPosts: allData.length,
      totalViews: allData.reduce((sum, d) => sum + d.metrics.views, 0),
      totalClicks: allData.reduce((sum, d) => sum + d.metrics.clicks, 0),
      totalRevenue: allData.reduce((sum, d) => sum + (d.metrics.revenue || 0), 0),
      averageViralScore: allData.length > 0 ? allData.reduce((sum, d) => sum + d.metrics.viralScore, 0) / allData.length : 0,
      topPerformingPlatform: getTopPerformingPlatform(allData)
    }

    // Calculate platform breakdown
    const platformBreakdown = calculatePlatformMetrics(allData)

    // Generate time series data
    const timeSeriesData = generateTimeSeriesData(allData, startDate, endDate)

    // Get top performing posts
    const topPosts = allData
      .sort((a, b) => b.metrics.viralScore - a.metrics.viralScore)
      .slice(0, 10)

    // Generate insights and recommendations
    const insights = generateInsights(allData, summary)
    const recommendations = generateRecommendations(allData, platformBreakdown)

    return {
      summary,
      platformBreakdown,
      timeSeriesData,
      topPosts,
      insights,
      recommendations
    }
  } catch (error) {
    console.error('Failed to generate analytics report:', error)
    throw new Error('Analytics report generation failed')
  }
}

/**
 * Schedule automated metrics collection for a post
 * @param postId - Post tracking ID
 */
function scheduleMetricsCollection(postId: string): void {
  // Schedule collection at intervals: 1h, 6h, 24h, 7d, 30d
  const intervals = [
    { delay: 1000 * 60 * 60, label: '1 hour' },      // 1 hour
    { delay: 1000 * 60 * 60 * 6, label: '6 hours' }, // 6 hours
    { delay: 1000 * 60 * 60 * 24, label: '24 hours' }, // 24 hours
    { delay: 1000 * 60 * 60 * 24 * 7, label: '7 days' }, // 7 days
    { delay: 1000 * 60 * 60 * 24 * 30, label: '30 days' } // 30 days
  ]

  intervals.forEach(interval => {
    setTimeout(async () => {
      try {
        const analyticsData = await getAnalyticsData(postId)
        if (analyticsData) {
          await updatePostMetrics(postId, analyticsData.platform)
          console.log(`Metrics updated for ${postId} at ${interval.label}`)
        }
      } catch (error) {
        console.error(`Failed to update metrics at ${interval.label}:`, error)
      }
    }, interval.delay)
  })
}

// Helper Functions

function generateTrackingId(): string {
  return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getDefaultMetrics(): PostMetrics {
  return {
    views: 0,
    clicks: 0,
    shares: 0,
    likes: 0,
    comments: 0,
    saves: 0,
    clickThroughRate: 0,
    engagementRate: 0,
    viralScore: 0
  }
}

function getTopPerformingPlatform(data: AnalyticsData[]): Platform {
  const platformScores: Record<Platform, number> = {} as Record<Platform, number>

  data.forEach(d => {
    if (!platformScores[d.platform]) {
      platformScores[d.platform] = 0
    }
    platformScores[d.platform] += d.metrics.viralScore
  })

  return Object.entries(platformScores).reduce((top, [platform, score]) => 
    score > (platformScores[top as Platform] || 0) ? platform as Platform : top
  , 'reddit' as Platform)
}

function calculatePlatformMetrics(data: AnalyticsData[]): PlatformMetrics[] {
  const platforms = ['reddit', 'twitter', 'medium', 'pinterest', 'facebook', 'linkedin'] as Platform[]
  
  return platforms.map(platform => {
    const platformData = data.filter(d => d.platform === platform)
    
    return {
      platform,
      totalPosts: platformData.length,
      totalViews: platformData.reduce((sum, d) => sum + d.metrics.views, 0),
      totalClicks: platformData.reduce((sum, d) => sum + d.metrics.clicks, 0),
      totalShares: platformData.reduce((sum, d) => sum + d.metrics.shares, 0),
      averageEngagement: platformData.length > 0 ? 
        platformData.reduce((sum, d) => sum + d.metrics.engagementRate, 0) / platformData.length : 0,
      bestPerformingPost: platformData.length > 0 ? 
        platformData.sort((a, b) => b.metrics.viralScore - a.metrics.viralScore)[0].postId : '',
      worstPerformingPost: platformData.length > 0 ? 
        platformData.sort((a, b) => a.metrics.viralScore - b.metrics.viralScore)[0].postId : '',
      trendingHashtags: extractTrendingHashtags(platformData)
    }
  }).filter(p => p.totalPosts > 0)
}

function generateTimeSeriesData(data: AnalyticsData[], startDate: Date, endDate: Date): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dayData = data.filter(d => 
      d.createdAt.toDateString() === currentDate.toDateString()
    )

    points.push({
      date: new Date(currentDate),
      views: dayData.reduce((sum, d) => sum + d.metrics.views, 0),
      clicks: dayData.reduce((sum, d) => sum + d.metrics.clicks, 0),
      shares: dayData.reduce((sum, d) => sum + d.metrics.shares, 0),
      revenue: dayData.reduce((sum, d) => sum + (d.metrics.revenue || 0), 0)
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return points
}

function extractTrendingHashtags(data: AnalyticsData[]): string[] {
  const hashtagCounts: Record<string, number> = {}

  data.forEach(d => {
    d.content.hashtags.forEach(hashtag => {
      const clean = hashtag.replace('#', '').toLowerCase()
      hashtagCounts[clean] = (hashtagCounts[clean] || 0) + d.metrics.viralScore
    })
  })

  return Object.entries(hashtagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([hashtag]) => `#${hashtag}`)
}

function generateInsights(data: AnalyticsData[], summary: any): string[] {
  const insights: string[] = []

  if (summary.totalPosts > 0) {
    insights.push(`You've posted ${summary.totalPosts} times with an average viral score of ${summary.averageViralScore.toFixed(1)}`)
  }

  if (summary.topPerformingPlatform) {
    insights.push(`${summary.topPerformingPlatform} is your top performing platform`)
  }

  const highPerformers = data.filter(d => d.metrics.viralScore > 80)
  if (highPerformers.length > 0) {
    insights.push(`${highPerformers.length} of your posts achieved viral status (80+ score)`)
  }

  return insights
}

function generateRecommendations(data: AnalyticsData[], platformMetrics: PlatformMetrics[]): string[] {
  const recommendations: string[] = []

  // Find best performing platform
  const bestPlatform = platformMetrics.sort((a, b) => b.averageEngagement - a.averageEngagement)[0]
  if (bestPlatform) {
    recommendations.push(`Focus more content on ${bestPlatform.platform} - it has your highest engagement rate`)
  }

  // Check posting frequency
  if (data.length < 10) {
    recommendations.push('Increase posting frequency for better analytics insights')
  }

  // Check for low-performing content
  const lowPerformers = data.filter(d => d.metrics.viralScore < 30)
  if (lowPerformers.length > data.length * 0.5) {
    recommendations.push('Consider A/B testing different content styles to improve viral scores')
  }

  return recommendations
}

// Database interaction functions (implement based on your storage solution)
async function storeAnalyticsData(data: AnalyticsData): Promise<void> {
  // Implement database storage
  console.log('Storing analytics data:', data.postId)
}

async function updateAnalyticsData(postId: string, updates: Partial<AnalyticsData>): Promise<void> {
  // Implement database update
  console.log('Updating analytics data:', postId, updates)
}

async function getAnalyticsData(postId: string): Promise<AnalyticsData | null> {
  // Implement database retrieval
  console.log('Fetching analytics data:', postId)
  return null
}

async function getAnalyticsDataInRange(startDate: Date, endDate: Date): Promise<AnalyticsData[]> {
  // Implement database range query
  console.log('Fetching analytics data in range:', startDate, endDate)
  return []
}
