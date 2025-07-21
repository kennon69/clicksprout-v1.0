// Platform API Service for ClickSprout
import { database } from './database'

// Import PostData from the main posting engine to avoid duplication
export interface PostData {
  id: string
  title: string
  content: string
  images: string[]
  hashtags: string[]
  platform: string
  scheduledTime?: string
  status: 'scheduled' | 'posted' | 'failed' | 'retrying' | 'cancelled' | 'pending'
  createdAt: string
  updatedAt?: string
  retryCount?: number
  maxRetries?: number
  lastError?: string
  platformPostId?: string
  url?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  tags?: string[]
  metadata?: Record<string, any>
}

export interface PostResponse {
  success: boolean
  postId?: string
  url?: string
  error?: string
  retryAfter?: number
}

export interface PostAnalytics {
  postId: string
  platform: string
  views: number
  clicks: number
  likes: number
  shares: number
  comments: number
  engagement: number
  lastUpdated: string
}

// Base Platform API Class
export abstract class PlatformAPI {
  protected apiKey: string
  protected apiSecret: string
  protected accessToken: string

  constructor(apiKey: string, apiSecret: string, accessToken: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.accessToken = accessToken
  }

  abstract post(data: PostData): Promise<PostResponse>
  abstract getAnalytics(postId: string): Promise<PostAnalytics>
  abstract validateAuth(): Promise<boolean>
}

// Reddit API Implementation
export class RedditAPI extends PlatformAPI {
  private username: string
  private password: string

  constructor(clientId: string, clientSecret: string, username: string, password: string) {
    super(clientId, clientSecret, '')
    this.username = username
    this.password = password
  }

  async validateAuth(): Promise<boolean> {
    try {
      const token = await this.getAccessToken()
      return !!token
    } catch (error) {
      console.error('Reddit auth validation failed:', error)
      return false
    }
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')
    
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ClickSprout/1.0'
      },
      body: `grant_type=password&username=${this.username}&password=${this.password}`
    })

    if (!response.ok) {
      throw new Error(`Reddit auth failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  }

  async post(data: PostData): Promise<PostResponse> {
    try {
      const token = await this.getAccessToken()
      const subreddit = 'test' // Default subreddit for testing
      
      const postData = {
        title: data.title,
        text: `${data.content}\n\n${data.hashtags.join(' ')}`,
        sr: subreddit,
        kind: 'self',
        api_type: 'json'
      }

      const response = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ClickSprout/1.0'
        },
        body: new URLSearchParams(postData).toString()
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.errors?.[0]?.[1] || 'Reddit post failed'
        }
      }

      const result = await response.json()
      
      if (result.json.errors.length > 0) {
        return {
          success: false,
          error: result.json.errors[0][1]
        }
      }

      return {
        success: true,
        postId: result.json.data.name,
        url: result.json.data.url
      }
    } catch (error) {
      console.error('Reddit post error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getAnalytics(postId: string): Promise<PostAnalytics> {
    try {
      const token = await this.getAccessToken()
      const response = await fetch(`https://oauth.reddit.com/api/info?id=${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'ClickSprout/1.0'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch Reddit analytics')
      }

      const data = await response.json()
      const post = data.data.children[0]?.data

      if (!post) {
        throw new Error('Post not found')
      }

      return {
        postId,
        platform: 'reddit',
        views: post.view_count || 0,
        clicks: 0, // Reddit doesn't provide click data
        likes: post.ups || 0,
        shares: 0, // Reddit doesn't provide share data
        comments: post.num_comments || 0,
        engagement: (post.ups || 0) + (post.num_comments || 0),
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Reddit analytics error:', error)
      throw error
    }
  }
}

// Medium API Implementation
export class MediumAPI extends PlatformAPI {
  async validateAuth(): Promise<boolean> {
    try {
      const response = await fetch('https://api.medium.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      return response.ok
    } catch (error) {
      console.error('Medium auth validation failed:', error)
      return false
    }
  }

  async post(data: PostData): Promise<PostResponse> {
    try {
      // First, get user ID
      const userResponse = await fetch('https://api.medium.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!userResponse.ok) {
        throw new Error('Failed to get Medium user info')
      }

      const userData = await userResponse.json()
      const userId = userData.data.id

      // Create post
      const postData = {
        title: data.title,
        contentFormat: 'html',
        content: `<p>${data.content}</p><p>${data.hashtags.join(' ')}</p>`,
        publishStatus: 'public',
        tags: data.hashtags.map(tag => tag.replace('#', ''))
      }

      const response = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.errors?.[0]?.message || 'Medium post failed'
        }
      }

      const result = await response.json()
      return {
        success: true,
        postId: result.data.id,
        url: result.data.url
      }
    } catch (error) {
      console.error('Medium post error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getAnalytics(postId: string): Promise<PostAnalytics> {
    // Medium doesn't provide analytics through their API
    // This would need to be implemented with web scraping or alternative methods
    return {
      postId,
      platform: 'medium',
      views: 0,
      clicks: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      engagement: 0,
      lastUpdated: new Date().toISOString()
    }
  }
}

// Twitter API Implementation
export class TwitterAPI extends PlatformAPI {
  private bearerToken: string

  constructor(apiKey: string, apiSecret: string, accessToken: string, accessSecret: string, bearerToken: string) {
    super(apiKey, apiSecret, accessToken)
    this.bearerToken = bearerToken
  }

  async validateAuth(): Promise<boolean> {
    try {
      const response = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`
        }
      })
      return response.ok
    } catch (error) {
      console.error('Twitter auth validation failed:', error)
      return false
    }
  }

  async post(data: PostData): Promise<PostResponse> {
    try {
      const tweetText = `${data.title}\n\n${data.content}\n\n${data.hashtags.join(' ')}`
      
      // Truncate if too long (Twitter limit is 280 characters)
      const finalText = tweetText.length > 280 ? tweetText.substring(0, 277) + '...' : tweetText

      const postData = {
        text: finalText
      }

      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.errors?.[0]?.message || 'Twitter post failed'
        }
      }

      const result = await response.json()
      return {
        success: true,
        postId: result.data.id,
        url: `https://twitter.com/i/web/status/${result.data.id}`
      }
    } catch (error) {
      console.error('Twitter post error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getAnalytics(postId: string): Promise<PostAnalytics> {
    try {
      const response = await fetch(`https://api.twitter.com/2/tweets/${postId}?tweet.fields=public_metrics`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch Twitter analytics')
      }

      const data = await response.json()
      const metrics = data.data.public_metrics

      return {
        postId,
        platform: 'twitter',
        views: metrics.impression_count || 0,
        clicks: 0, // Twitter doesn't provide click data through public API
        likes: metrics.like_count || 0,
        shares: metrics.retweet_count || 0,
        comments: metrics.reply_count || 0,
        engagement: (metrics.like_count || 0) + (metrics.retweet_count || 0) + (metrics.reply_count || 0),
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Twitter analytics error:', error)
      throw error
    }
  }
}

// Pinterest API Implementation
export class PinterestAPI extends PlatformAPI {
  async validateAuth(): Promise<boolean> {
    try {
      const response = await fetch('https://api.pinterest.com/v5/user_account', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })
      return response.ok
    } catch (error) {
      console.error('Pinterest auth validation failed:', error)
      return false
    }
  }

  async post(data: PostData): Promise<PostResponse> {
    try {
      // Pinterest requires a board ID - we'll use the first available board
      const boardsResponse = await fetch('https://api.pinterest.com/v5/boards', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!boardsResponse.ok) {
        throw new Error('Failed to get Pinterest boards')
      }

      const boardsData = await boardsResponse.json()
      const boardId = boardsData.items[0]?.id

      if (!boardId) {
        throw new Error('No Pinterest boards found')
      }

      const postData = {
        title: data.title,
        description: `${data.content}\n\n${data.hashtags.join(' ')}`,
        board_id: boardId,
        media_source: {
          source_type: 'image_url',
          url: data.images[0] || 'https://via.placeholder.com/600x400'
        }
      }

      const response = await fetch('https://api.pinterest.com/v5/pins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.message || 'Pinterest post failed'
        }
      }

      const result = await response.json()
      return {
        success: true,
        postId: result.id,
        url: result.url
      }
    } catch (error) {
      console.error('Pinterest post error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getAnalytics(postId: string): Promise<PostAnalytics> {
    try {
      const response = await fetch(`https://api.pinterest.com/v5/pins/${postId}?pin_metrics=IMPRESSION,SAVE`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch Pinterest analytics')
      }

      const data = await response.json()
      const metrics = data.pin_metrics

      return {
        postId,
        platform: 'pinterest',
        views: metrics.IMPRESSION || 0,
        clicks: 0, // Pinterest doesn't provide click data
        likes: 0, // Pinterest doesn't provide like data
        shares: metrics.SAVE || 0,
        comments: 0, // Pinterest doesn't provide comment data
        engagement: metrics.SAVE || 0,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Pinterest analytics error:', error)
      throw error
    }
  }
}

// Facebook API Implementation
export class FacebookAPI extends PlatformAPI {
  private pageId: string

  constructor(accessToken: string, pageId: string) {
    super('', '', accessToken)
    this.pageId = pageId
  }

  async validateAuth(): Promise<boolean> {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.pageId}?access_token=${this.accessToken}`)
      return response.ok
    } catch (error) {
      console.error('Facebook auth validation failed:', error)
      return false
    }
  }

  async post(data: PostData): Promise<PostResponse> {
    try {
      const postData = {
        message: `${data.title}\n\n${data.content}\n\n${data.hashtags.join(' ')}`,
        access_token: this.accessToken
      }

      const response = await fetch(`https://graph.facebook.com/v18.0/${this.pageId}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.error?.message || 'Facebook post failed'
        }
      }

      const result = await response.json()
      return {
        success: true,
        postId: result.id,
        url: `https://facebook.com/${result.id}`
      }
    } catch (error) {
      console.error('Facebook post error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getAnalytics(postId: string): Promise<PostAnalytics> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}?fields=insights.metric(post_impressions,post_clicks,post_reactions_by_type_total)&access_token=${this.accessToken}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch Facebook analytics')
      }

      const data = await response.json()
      const insights = data.insights?.data || []

      const impressions = insights.find((i: any) => i.name === 'post_impressions')?.values?.[0]?.value || 0
      const clicks = insights.find((i: any) => i.name === 'post_clicks')?.values?.[0]?.value || 0
      const reactions = insights.find((i: any) => i.name === 'post_reactions_by_type_total')?.values?.[0]?.value || {}

      const totalReactions = Object.values(reactions).reduce((sum: number, count: any) => sum + count, 0)

      return {
        postId,
        platform: 'facebook',
        views: impressions,
        clicks: clicks,
        likes: totalReactions,
        shares: 0, // Would need separate API call
        comments: 0, // Would need separate API call
        engagement: totalReactions + clicks,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Facebook analytics error:', error)
      throw error
    }
  }
}

// LinkedIn API Implementation
export class LinkedInAPI extends PlatformAPI {
  private personId: string

  constructor(accessToken: string, personId: string = '') {
    super('', '', accessToken)
    this.personId = personId
  }

  async validateAuth(): Promise<boolean> {
    try {
      const response = await fetch('https://api.linkedin.com/v2/people/~', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        this.personId = data.id
        return true
      }
      return false
    } catch (error) {
      console.error('LinkedIn auth validation failed:', error)
      return false
    }
  }

  async post(data: PostData): Promise<PostResponse> {
    try {
      if (!this.personId) {
        const authValid = await this.validateAuth()
        if (!authValid) {
          return {
            success: false,
            error: 'LinkedIn authentication failed'
          }
        }
      }

      const postContent = `${data.title}\n\n${data.content}\n\n${data.hashtags.join(' ')}`

      const postData = {
        author: `urn:li:person:${this.personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: postContent
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      }

      // If there are images, add them to the post
      if (data.images && data.images.length > 0) {
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE'
        // LinkedIn requires media to be uploaded first - this is a simplified version
        // In production, you'd need to implement the media upload flow
      }

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.message || 'LinkedIn post failed'
        }
      }

      const result = await response.json()
      const postId = result.id

      return {
        success: true,
        postId: postId,
        url: `https://www.linkedin.com/feed/update/${postId}`
      }
    } catch (error) {
      console.error('LinkedIn post error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getAnalytics(postId: string): Promise<PostAnalytics> {
    try {
      // LinkedIn analytics require different endpoints and permissions
      // This is a basic implementation - full analytics would need LinkedIn Marketing API
      const response = await fetch(`https://api.linkedin.com/v2/socialActions/${postId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      })

      if (!response.ok) {
        // If we can't get detailed analytics, return basic structure
        return {
          postId,
          platform: 'linkedin',
          views: 0,
          clicks: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          engagement: 0,
          lastUpdated: new Date().toISOString()
        }
      }

      const data = await response.json()
      
      return {
        postId,
        platform: 'linkedin',
        views: data.totalFirstLevelShares || 0,
        clicks: 0, // LinkedIn doesn't provide click data through basic API
        likes: data.totalFirstLevelShares || 0,
        shares: data.totalShares || 0,
        comments: data.totalComments || 0,
        engagement: (data.totalFirstLevelShares || 0) + (data.totalShares || 0) + (data.totalComments || 0),
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('LinkedIn analytics error:', error)
      return {
        postId,
        platform: 'linkedin',
        views: 0,
        clicks: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        engagement: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }
}

// Platform Factory
export class PlatformFactory {
  static createPlatform(platform: string): PlatformAPI | null {
    switch (platform.toLowerCase()) {
      case 'reddit':
        return new RedditAPI(
          process.env.REDDIT_CLIENT_ID!,
          process.env.REDDIT_CLIENT_SECRET!,
          process.env.REDDIT_USERNAME!,
          process.env.REDDIT_PASSWORD!
        )
      case 'medium':
        return new MediumAPI('', '', process.env.MEDIUM_ACCESS_TOKEN!)
      case 'twitter':
        return new TwitterAPI(
          process.env.TWITTER_API_KEY!,
          process.env.TWITTER_API_SECRET!,
          process.env.TWITTER_ACCESS_TOKEN!,
          process.env.TWITTER_ACCESS_SECRET!,
          process.env.TWITTER_BEARER_TOKEN!
        )
      case 'pinterest':
        return new PinterestAPI('', '', process.env.PINTEREST_ACCESS_TOKEN!)
      case 'facebook':
        return new FacebookAPI(
          process.env.FACEBOOK_ACCESS_TOKEN!,
          process.env.FACEBOOK_PAGE_ID!
        )
      case 'linkedin':
        if (!process.env.LINKEDIN_ACCESS_TOKEN) {
          console.warn('LinkedIn access token not configured')
          return null
        }
        return new LinkedInAPI(
          process.env.LINKEDIN_ACCESS_TOKEN,
          process.env.LINKEDIN_PERSON_ID || ''
        )
      default:
        return null
    }
  }

  static getSupportedPlatforms(): string[] {
    return ['reddit', 'medium', 'twitter', 'pinterest', 'facebook', 'linkedin']
  }

  static isPlatformSupported(platform: string): boolean {
    return this.getSupportedPlatforms().includes(platform.toLowerCase())
  }
}

// Post Scheduler Service
export class PostScheduler {
  private static instance: PostScheduler
  private scheduledPosts: Map<string, NodeJS.Timeout> = new Map()

  static getInstance(): PostScheduler {
    if (!PostScheduler.instance) {
      PostScheduler.instance = new PostScheduler()
    }
    return PostScheduler.instance
  }

  async schedulePost(postData: PostData): Promise<void> {
    const scheduledTime = new Date(postData.scheduledTime!)
    const now = new Date()
    
    if (scheduledTime <= now) {
      // Post immediately
      await this.executePost(postData)
      return
    }

    const delay = scheduledTime.getTime() - now.getTime()
    
    const timeout = setTimeout(async () => {
      await this.executePost(postData)
      this.scheduledPosts.delete(postData.id)
    }, delay)

    this.scheduledPosts.set(postData.id, timeout)
    
    // Save to database
    await this.savePostToDatabase(postData)
  }

  async executePost(postData: PostData): Promise<void> {
    const platform = PlatformFactory.createPlatform(postData.platform)
    
    if (!platform) {
      console.error(`Platform ${postData.platform} not supported`)
      await this.updatePostStatus(postData.id, 'failed', 'Platform not supported')
      return
    }

    try {
      const result = await platform.post(postData)
      
      if (result.success) {
        await this.updatePostStatus(postData.id, 'posted', undefined, result.postId, result.url)
        
        // Schedule analytics collection
        setTimeout(async () => {
          await this.collectAnalytics(postData.platform, result.postId!)
        }, 60000) // Wait 1 minute before collecting analytics
      } else {
        await this.updatePostStatus(postData.id, 'failed', result.error)
        
        // Retry logic
        if (result.retryAfter) {
          setTimeout(async () => {
            await this.executePost(postData)
          }, result.retryAfter * 1000)
        }
      }
    } catch (error) {
      console.error(`Post execution failed for ${postData.platform}:`, error)
      await this.updatePostStatus(postData.id, 'failed', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  async collectAnalytics(platform: string, postId: string): Promise<void> {
    const platformAPI = PlatformFactory.createPlatform(platform)
    
    if (!platformAPI) {
      console.error(`Platform ${platform} not supported for analytics`)
      return
    }

    try {
      const analytics = await platformAPI.getAnalytics(postId)
      await this.saveAnalyticsToDatabase(analytics)
    } catch (error) {
      console.error(`Analytics collection failed for ${platform}:`, error)
    }
  }

  private async savePostToDatabase(postData: PostData): Promise<void> {
    try {
      await database.insert('posts', {
        id: postData.id,
        title: postData.title,
        content: postData.content,
        images: postData.images,
        hashtags: postData.hashtags,
        platform: postData.platform,
        scheduled_time: postData.scheduledTime,
        status: postData.status,
        created_at: postData.createdAt,
        updated_at: postData.updatedAt || postData.createdAt
      })
    } catch (error) {
      console.error('Failed to save post to database:', error)
    }
  }

  private async updatePostStatus(
    postId: string,
    status: 'scheduled' | 'posted' | 'failed',
    error?: string,
    platformPostId?: string,
    url?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (error) updateData.error = error
      if (platformPostId) updateData.platform_post_id = platformPostId
      if (url) updateData.url = url

      await database.update('posts', updateData, { id: postId })
    } catch (error) {
      console.error('Failed to update post status:', error)
    }
  }

  private async saveAnalyticsToDatabase(analytics: PostAnalytics): Promise<void> {
    try {
      await database.upsert('post_analytics', {
        post_id: analytics.postId,
        platform: analytics.platform,
        views: analytics.views,
        clicks: analytics.clicks,
        likes: analytics.likes,
        shares: analytics.shares,
        comments: analytics.comments,
        engagement: analytics.engagement,
        last_updated: analytics.lastUpdated
      }, { post_id: analytics.postId, platform: analytics.platform })
    } catch (error) {
      console.error('Failed to save analytics to database:', error)
    }
  }

  cancelScheduledPost(postId: string): void {
    const timeout = this.scheduledPosts.get(postId)
    if (timeout) {
      clearTimeout(timeout)
      this.scheduledPosts.delete(postId)
    }
  }

  getScheduledPosts(): string[] {
    return Array.from(this.scheduledPosts.keys())
  }
}

// Platform Authentication Manager
export class PlatformAuthManager {
  private static instance: PlatformAuthManager
  private authStatus: Map<string, boolean> = new Map()
  private lastCheck: Map<string, number> = new Map()
  private readonly CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): PlatformAuthManager {
    if (!PlatformAuthManager.instance) {
      PlatformAuthManager.instance = new PlatformAuthManager()
    }
    return PlatformAuthManager.instance
  }

  async checkPlatformAuth(platform: string): Promise<boolean> {
    const now = Date.now()
    const lastCheck = this.lastCheck.get(platform) || 0
    
    // Return cached result if checked recently
    if (now - lastCheck < this.CHECK_INTERVAL && this.authStatus.has(platform)) {
      return this.authStatus.get(platform)!
    }

    const platformAPI = PlatformFactory.createPlatform(platform)
    if (!platformAPI) {
      this.authStatus.set(platform, false)
      this.lastCheck.set(platform, now)
      return false
    }

    try {
      const isValid = await platformAPI.validateAuth()
      this.authStatus.set(platform, isValid)
      this.lastCheck.set(platform, now)
      return isValid
    } catch (error) {
      console.error(`Auth check failed for ${platform}:`, error)
      this.authStatus.set(platform, false)
      this.lastCheck.set(platform, now)
      return false
    }
  }

  async checkAllPlatforms(): Promise<Record<string, boolean>> {
    const platforms = ['reddit', 'medium', 'twitter', 'pinterest', 'facebook', 'linkedin']
    const results: Record<string, boolean> = {}

    for (const platform of platforms) {
      results[platform] = await this.checkPlatformAuth(platform)
    }

    return results
  }

  getAuthStatus(platform: string): boolean | undefined {
    return this.authStatus.get(platform)
  }

  clearAuthCache(platform?: string): void {
    if (platform) {
      this.authStatus.delete(platform)
      this.lastCheck.delete(platform)
    } else {
      this.authStatus.clear()
      this.lastCheck.clear()
    }
  }
}

// Export the scheduler and auth manager instances
export const scheduler = PostScheduler.getInstance()
export const authManager = PlatformAuthManager.getInstance()
