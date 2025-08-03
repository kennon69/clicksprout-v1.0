/**
 * Multi-Platform Poster for ClickSprout v1.0
 * Handles posting to Reddit, Medium, Pinterest, Facebook, Twitter/X
 * Uses APIs where available, browser automation as fallback
 */

import { GeneratedContent } from './aiContentGenerator'

// Types for posting operations
export interface PostRequest {
  content: GeneratedContent
  platform: Platform
  scheduledTime?: Date
  options?: PlatformSpecificOptions
}

export interface PostResult {
  success: boolean
  postId?: string
  url?: string
  error?: string
  platform: Platform
  postedAt: Date
  method: 'api' | 'automation'
}

export type Platform = 'reddit' | 'medium' | 'pinterest' | 'facebook' | 'twitter' | 'linkedin'

export interface PlatformSpecificOptions {
  // Reddit options
  subreddit?: string
  flairId?: string
  
  // Medium options
  tags?: string[]
  publishStatus?: 'public' | 'draft' | 'unlisted'
  
  // Pinterest options
  boardId?: string
  imageUrl?: string
  
  // Facebook options
  pageId?: string
  
  // Twitter options
  replyToTweetId?: string
  
  // LinkedIn options
  visibility?: 'PUBLIC' | 'CONNECTIONS'
}

/**
 * Main posting function - routes to appropriate platform handler
 * @param request - Post request with content and platform details
 * @returns Promise<PostResult> - Result of posting operation
 */
export async function postToPlatform(request: PostRequest): Promise<PostResult> {
  try {
    switch (request.platform) {
      case 'reddit':
        return await postToReddit(request)
      case 'medium':
        return await postToMedium(request)
      case 'pinterest':
        return await postToPinterest(request)
      case 'facebook':
        return await postToFacebook(request)
      case 'twitter':
        return await postToTwitter(request)
      case 'linkedin':
        return await postToLinkedIn(request)
      default:
        throw new Error(`Unsupported platform: ${request.platform}`)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown posting error',
      platform: request.platform,
      postedAt: new Date(),
      method: 'api'
    }
  }
}

/**
 * Post to Reddit using API
 * @param request - Reddit post request
 * @returns Promise<PostResult> - Reddit posting result
 */
async function postToReddit(request: PostRequest): Promise<PostResult> {
  const { content, options } = request
  const subreddit = options?.subreddit || 'test'

  try {
    // Get Reddit access token
    const accessToken = await getRedditAccessToken()
    
    const postData: Record<string, string> = {
      sr: subreddit,
      kind: 'link', // or 'self' for text posts
      title: content.title,
      text: content.content,
      url: extractUrlFromContent(content)
    }

    if (options?.flairId) {
      postData.flair_id = options.flairId
    }

    const response = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ClickSprout/1.0'
      },
      body: new URLSearchParams(postData)
    })

    const result = await response.json()

    if (result.json?.errors?.length > 0) {
      throw new Error(`Reddit API error: ${result.json.errors[0][1]}`)
    }

    const postId = result.json?.data?.name
    const postUrl = `https://reddit.com/r/${subreddit}/comments/${postId}`

    return {
      success: true,
      postId,
      url: postUrl,
      platform: 'reddit',
      postedAt: new Date(),
      method: 'api'
    }

  } catch (error) {
    console.warn('Reddit API posting failed, trying automation fallback')
    return await postToRedditWithAutomation(request)
  }
}

/**
 * Post to Medium using API
 * @param request - Medium post request
 * @returns Promise<PostResult> - Medium posting result
 */
async function postToMedium(request: PostRequest): Promise<PostResult> {
  const { content, options } = request

  try {
    const accessToken = process.env.MEDIUM_ACCESS_TOKEN
    if (!accessToken) {
      throw new Error('Medium access token not configured')
    }

    // Get user ID first
    const userResponse = await fetch('https://api.medium.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    const userData = await userResponse.json()
    const userId = userData.data.id

    // Create post
    const postData = {
      title: content.title,
      contentFormat: 'markdown',
      content: formatContentForMedium(content),
      tags: options?.tags || content.hashtags.map(tag => tag.replace('#', '')).slice(0, 5),
      publishStatus: options?.publishStatus || 'public'
    }

    const response = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Medium API error: ${result.errors?.[0]?.message || 'Unknown error'}`)
    }

    return {
      success: true,
      postId: result.data.id,
      url: result.data.url,
      platform: 'medium',
      postedAt: new Date(),
      method: 'api'
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Medium posting failed',
      platform: 'medium',
      postedAt: new Date(),
      method: 'api'
    }
  }
}

/**
 * Post to Pinterest using API
 * @param request - Pinterest post request
 * @returns Promise<PostResult> - Pinterest posting result
 */
async function postToPinterest(request: PostRequest): Promise<PostResult> {
  const { content, options } = request

  try {
    const accessToken = process.env.PINTEREST_ACCESS_TOKEN
    if (!accessToken) {
      throw new Error('Pinterest access token not configured')
    }

    const pinData = {
      board_id: options?.boardId || await getDefaultPinterestBoard(),
      media_source: {
        source_type: 'image_url',
        url: options?.imageUrl || extractImageFromContent(content)
      },
      title: content.title,
      description: `${content.content}\n\n${content.hashtags.join(' ')}\n\n${content.callToAction}`
    }

    const response = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pinData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Pinterest API error: ${result.message || 'Unknown error'}`)
    }

    return {
      success: true,
      postId: result.id,
      url: `https://pinterest.com/pin/${result.id}`,
      platform: 'pinterest',
      postedAt: new Date(),
      method: 'api'
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Pinterest posting failed',
      platform: 'pinterest',
      postedAt: new Date(),
      method: 'api'
    }
  }
}

/**
 * Post to Facebook using Graph API
 * @param request - Facebook post request
 * @returns Promise<PostResult> - Facebook posting result
 */
async function postToFacebook(request: PostRequest): Promise<PostResult> {
  const { content, options } = request

  try {
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN
    const pageId = options?.pageId || process.env.FACEBOOK_PAGE_ID
    
    if (!accessToken || !pageId) {
      throw new Error('Facebook credentials not configured')
    }

    const postData = {
      message: `${content.title}\n\n${content.content}\n\n${content.hashtags.join(' ')}\n\n${content.callToAction}`,
      access_token: accessToken
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })

    const result = await response.json()

    if (result.error) {
      throw new Error(`Facebook API error: ${result.error.message}`)
    }

    return {
      success: true,
      postId: result.id,
      url: `https://facebook.com/${result.id}`,
      platform: 'facebook',
      postedAt: new Date(),
      method: 'api'
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Facebook posting failed',
      platform: 'facebook',
      postedAt: new Date(),
      method: 'api'
    }
  }
}

/**
 * Post to Twitter/X using API
 * @param request - Twitter post request
 * @returns Promise<PostResult> - Twitter posting result
 */
async function postToTwitter(request: PostRequest): Promise<PostResult> {
  const { content, options } = request

  try {
    // Format content for Twitter
    const tweetText = formatContentForTwitter(content)
    
    const tweetData = {
      text: tweetText,
      reply: options?.replyToTweetId ? { in_reply_to_tweet_id: options.replyToTweetId } : undefined
    }

    // Use Twitter API v2
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tweetData)
    })

    const result = await response.json()

    if (result.errors) {
      throw new Error(`Twitter API error: ${result.errors[0].message}`)
    }

    return {
      success: true,
      postId: result.data.id,
      url: `https://twitter.com/i/status/${result.data.id}`,
      platform: 'twitter',
      postedAt: new Date(),
      method: 'api'
    }

  } catch (error) {
    console.warn('Twitter API posting failed, trying automation fallback')
    return await postToTwitterWithAutomation(request)
  }
}

/**
 * Post to LinkedIn using API
 * @param request - LinkedIn post request
 * @returns Promise<PostResult> - LinkedIn posting result
 */
async function postToLinkedIn(request: PostRequest): Promise<PostResult> {
  const { content, options } = request

  try {
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN
    const personId = process.env.LINKEDIN_PERSON_ID
    
    if (!accessToken || !personId) {
      throw new Error('LinkedIn credentials not configured')
    }

    const postData = {
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: `${content.title}\n\n${content.content}\n\n${content.hashtags.join(' ')}\n\n${content.callToAction}`
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': options?.visibility || 'PUBLIC'
      }
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${result.message || 'Unknown error'}`)
    }

    return {
      success: true,
      postId: result.id,
      url: `https://linkedin.com/feed/update/${result.id}`,
      platform: 'linkedin',
      postedAt: new Date(),
      method: 'api'
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'LinkedIn posting failed',
      platform: 'linkedin',
      postedAt: new Date(),
      method: 'api'
    }
  }
}

// Helper Functions

/**
 * Get Reddit access token using OAuth
 * @returns Promise<string> - Reddit access token
 */
async function getRedditAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  const username = process.env.REDDIT_USERNAME
  const password = process.env.REDDIT_PASSWORD

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error('Reddit credentials not configured')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ClickSprout/1.0'
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username,
      password
    })
  })

  const result = await response.json()

  if (result.error) {
    throw new Error(`Reddit auth error: ${result.error}`)
  }

  return result.access_token
}

/**
 * Format content specifically for Medium markdown
 * @param content - Generated content
 * @returns string - Medium-formatted content
 */
function formatContentForMedium(content: GeneratedContent): string {
  return `
# ${content.title}

${content.content}

---

${content.hashtags.join(' ')}

**${content.callToAction}**
`
}

/**
 * Format content for Twitter character limit
 * @param content - Generated content
 * @returns string - Twitter-formatted content
 */
function formatContentForTwitter(content: GeneratedContent): string {
  const maxLength = 280
  let tweet = `${content.title}\n\n${content.content}\n\n${content.hashtags.slice(0, 3).join(' ')}\n\n${content.callToAction}`
  
  if (tweet.length > maxLength) {
    // Truncate content to fit
    const overhead = content.title.length + content.hashtags.slice(0, 3).join(' ').length + content.callToAction.length + 10 // spaces/newlines
    const availableForContent = maxLength - overhead
    
    if (availableForContent > 50) {
      const truncatedContent = content.content.substring(0, availableForContent - 3) + '...'
      tweet = `${content.title}\n\n${truncatedContent}\n\n${content.hashtags.slice(0, 3).join(' ')}\n\n${content.callToAction}`
    } else {
      // Very short version
      tweet = `${content.title}\n\n${content.callToAction}`
    }
  }
  
  return tweet
}

/**
 * Extract URL from content for link posts
 * @param content - Generated content
 * @returns string - Extracted URL or empty string
 */
function extractUrlFromContent(content: GeneratedContent): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const match = content.callToAction.match(urlRegex) || content.content.match(urlRegex)
  return match ? match[0] : ''
}

/**
 * Extract image URL from content for visual posts
 * @param content - Generated content
 * @returns string - Image URL or default placeholder
 */
function extractImageFromContent(content: GeneratedContent): string {
  // This would typically extract from the original product data
  // For now, return a placeholder that can be customized
  return 'https://via.placeholder.com/600x400/FF6B6B/FFFFFF?text=' + encodeURIComponent(content.title)
}

/**
 * Get default Pinterest board ID
 * @returns Promise<string> - Default board ID
 */
async function getDefaultPinterestBoard(): Promise<string> {
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('Pinterest access token not configured')
  }

  const response = await fetch('https://api.pinterest.com/v5/boards', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  const result = await response.json()
  
  if (result.items && result.items.length > 0) {
    return result.items[0].id
  }
  
  throw new Error('No Pinterest boards found')
}

// Browser automation fallbacks (for when APIs fail)

/**
 * Post to Reddit using browser automation fallback
 * @param request - Reddit post request
 * @returns Promise<PostResult> - Reddit posting result
 */
async function postToRedditWithAutomation(request: PostRequest): Promise<PostResult> {
  // This would use the browser-automation.ts module
  // For now, return a placeholder implementation
  return {
    success: false,
    error: 'Browser automation not implemented yet',
    platform: 'reddit',
    postedAt: new Date(),
    method: 'automation'
  }
}

/**
 * Post to Twitter using browser automation fallback
 * @param request - Twitter post request
 * @returns Promise<PostResult> - Twitter posting result
 */
async function postToTwitterWithAutomation(request: PostRequest): Promise<PostResult> {
  // This would use the browser-automation.ts module
  // For now, return a placeholder implementation
  return {
    success: false,
    error: 'Browser automation not implemented yet',
    platform: 'twitter',
    postedAt: new Date(),
    method: 'automation'
  }
}

/**
 * Batch post to multiple platforms
 * @param content - Generated content
 * @param platforms - Array of target platforms
 * @param options - Platform-specific options
 * @returns Promise<PostResult[]> - Results from all platforms
 */
export async function batchPost(
  content: GeneratedContent,
  platforms: Platform[],
  options: Record<Platform, PlatformSpecificOptions> = {} as Record<Platform, PlatformSpecificOptions>
): Promise<PostResult[]> {
  const results = await Promise.allSettled(
    platforms.map(platform => 
      postToPlatform({
        content,
        platform,
        options: options[platform]
      })
    )
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        success: false,
        error: result.reason?.message || 'Unknown error',
        platform: platforms[index],
        postedAt: new Date(),
        method: 'api' as const
      }
    }
  })
}
