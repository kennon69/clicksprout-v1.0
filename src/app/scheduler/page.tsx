'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import PlatformTester from '@/components/PlatformTester'

interface Platform {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  enabled: boolean
}

interface ScheduledPost {
  id: string
  platform: string
  title: string
  content: string
  images: string[]
  scheduledTime: string
  status: 'scheduled' | 'posted' | 'failed'
}

export default function SchedulerPage() {
  const router = useRouter()
  
  // Use ref to track if component is mounted
  const isMountedRef = React.useRef(true)
  
  const [platforms, setPlatforms] = useState<Platform[]>([
    { 
      id: 'pinterest', 
      name: 'Pinterest', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.690 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.001 24c6.624 0 11.999-5.373 11.999-12C24 5.372 18.626.001 12.001.001z"/>
        </svg>
      ), 
      color: 'bg-red-500', 
      enabled: false 
    },
    { 
      id: 'reddit', 
      name: 'Reddit', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      ), 
      color: 'bg-orange-500', 
      enabled: false 
    },
    { 
      id: 'medium', 
      name: 'Medium', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
        </svg>
      ), 
      color: 'bg-green-500', 
      enabled: false 
    },
    { 
      id: 'twitter', 
      name: 'Twitter', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ), 
      color: 'bg-blue-500', 
      enabled: false 
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ), 
      color: 'bg-blue-600', 
      enabled: false 
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ), 
      color: 'bg-blue-700', 
      enabled: false 
    }
  ])

  const [contentData, setContentData] = useState<any>(null)
  const [scheduledTime, setScheduledTime] = useState('')
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])

  useEffect(() => {
    // Load final content from localStorage
    const savedContent = localStorage.getItem('finalContent') || localStorage.getItem('currentContent')
    if (savedContent && isMountedRef.current) {
      setContentData(JSON.parse(savedContent))
    }

    // Load scheduled posts
    const savedPosts = localStorage.getItem('scheduledPosts')
    if (savedPosts && isMountedRef.current) {
      setScheduledPosts(JSON.parse(savedPosts))
    }

    // Set default schedule time to 1 hour from now
    if (isMountedRef.current) {
      const defaultTime = new Date()
      defaultTime.setHours(defaultTime.getHours() + 1)
      setScheduledTime(defaultTime.toISOString().slice(0, 16))
    }

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const togglePlatform = (platformId: string) => {
    setPlatforms(platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, enabled: !platform.enabled }
        : platform
    ))
  }

  const handleSchedulePosts = async () => {
    if (!contentData) {
      alert('No content available. Please edit content first.')
      return
    }

    const enabledPlatforms = platforms.filter(p => p.enabled)
    if (enabledPlatforms.length === 0) {
      alert('Please select at least one platform.')
      return
    }

    if (!scheduledTime) {
      alert('Please select a schedule time.')
      return
    }

    const newPosts: ScheduledPost[] = []
    
    // Schedule posts for each platform
    for (const platform of enabledPlatforms) {
      const postData = {
        id: `${platform.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: contentData.title,
        content: contentData.description || contentData.content,
        images: contentData.images || [],
        hashtags: contentData.hashtags || [],
        platform: platform.id,
        scheduledTime,
        status: 'scheduled' as const,
        createdAt: new Date().toISOString()
      }

      try {
        const response = await fetch('/api/schedule-manager', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'schedule',
            postData
          })
        })

        const result = await response.json()
        
        if (result.success) {
          newPosts.push({
            id: postData.id,
            platform: platform.name,
            title: postData.title,
            content: postData.content,
            images: postData.images,
            scheduledTime,
            status: 'scheduled'
          })
        } else {
          console.error(`Failed to schedule post for ${platform.name}:`, result.error)
        }
      } catch (error) {
        console.error(`Error scheduling post for ${platform.name}:`, error)
      }
    }

    // Only update state if component is still mounted
    if (isMountedRef.current && newPosts.length > 0) {
      const updatedPosts = [...scheduledPosts, ...newPosts]
      setScheduledPosts(updatedPosts)
      localStorage.setItem('scheduledPosts', JSON.stringify(updatedPosts))

      alert(`Successfully scheduled ${newPosts.length} posts!`)
    }
  }

  const deletePost = (postId: string) => {
    if (!isMountedRef.current) return
    
    const updatedPosts = scheduledPosts.filter(post => post.id !== postId)
    setScheduledPosts(updatedPosts)
    localStorage.setItem('scheduledPosts', JSON.stringify(updatedPosts))
  }

  const handlePostNow = async () => {
    if (!contentData) {
      alert('No content available. Please edit content first.')
      return
    }

    const enabledPlatforms = platforms.filter(p => p.enabled)
    if (enabledPlatforms.length === 0) {
      alert('Please select at least one platform to post to.')
      return
    }

    const postResults = []
    
    // Post to each platform immediately
    for (const platform of enabledPlatforms) {
      const postData = {
        id: `${platform.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: contentData.title,
        content: contentData.description || contentData.content,
        images: contentData.images || [],
        hashtags: contentData.hashtags || [],
        platform: platform.id,
        status: 'posted' as const,
        createdAt: new Date().toISOString()
      }

      try {
        const response = await fetch(`/api/post/${platform.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData)
        })

        const result = await response.json()
        
        if (result.success) {
          postResults.push({
            platform: platform.name,
            success: true,
            url: result.url,
            postId: result.postId
          })
        } else {
          postResults.push({
            platform: platform.name,
            success: false,
            error: result.error
          })
        }
      } catch (error) {
        console.error(`Error posting to ${platform.name}:`, error)
        postResults.push({
          platform: platform.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Show results
    const successCount = postResults.filter(r => r.success).length
    const failCount = postResults.filter(r => !r.success).length
    
    if (successCount > 0) {
      alert(`Successfully posted to ${successCount} platform(s)!${failCount > 0 ? ` ${failCount} failed.` : ''}`)
    } else {
      alert('All posts failed. Please check your platform configurations.')
    }

    // Log results for debugging
    console.log('Post results:', postResults)
  }

  const handleSaveTemplate = () => {
    if (!contentData) {
      alert('No content available to save as template.')
      return
    }

    // Save current content as a template
    const templates = JSON.parse(localStorage.getItem('contentTemplates') || '[]')
    const newTemplate = {
      id: Date.now().toString(),
      name: contentData.title.substring(0, 50) + '...',
      title: contentData.title,
      description: contentData.description,
      content: contentData.generatedContent,
      hashtags: contentData.hashtags || [],
      images: contentData.selectedImages || [],
      createdAt: new Date().toISOString()
    }

    templates.push(newTemplate)
    localStorage.setItem('contentTemplates', JSON.stringify(templates))
    
    alert('Content saved as template successfully!')
  }

  const handleViewAnalytics = () => {
    router.push('/analytics')
  }

  const handleEditContent = () => {
    router.push('/editor')
  }

  const handleNewContent = () => {
    router.push('/submit')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'posted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Content Scheduler</h1>
            <p className="text-gray-600 dark:text-gray-300">Schedule your content across multiple social media platforms</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scheduling Panel */}
            <div className="space-y-6">
              {/* Content Preview */}
              {contentData ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Preview</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title:</span>
                      <p className="text-gray-900 dark:text-white truncate">{contentData.title}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Content Length:</span>
                      <p className="text-gray-900 dark:text-white">{contentData.generatedContent?.length || 0} characters</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Images:</span>
                      <p className="text-gray-900 dark:text-white">{contentData.selectedImages?.length || 0} selected</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">No Content Available</h3>
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">You need to create content before scheduling posts</p>
                    <button
                      onClick={handleNewContent}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Create Content
                    </button>
                  </div>
                </div>
              )}

              {/* Platform Connection Test */}
              <PlatformTester platforms={platforms} />

              {/* Platform Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Platforms</h3>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                        platform.enabled
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center text-white mr-3`}>
                        {platform.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{platform.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {platform.enabled ? 'Selected' : 'Click to select'}
                        </p>
                      </div>
                      {platform.enabled && (
                        <div className="ml-auto">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule Time */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule Time</h3>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Posts will be published at the specified time
                </p>
              </div>

              {/* Schedule Button */}
              <button
                onClick={handleSchedulePosts}
                disabled={!contentData}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
              >
                {contentData ? 'Schedule Posts' : 'No Content Available'}
              </button>
            </div>

            {/* Scheduled Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Scheduled Posts</h3>
              
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No posts scheduled yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                            {post.platform.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{post.platform}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(post.scheduledTime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{post.title}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="mr-3">📝 {post.content.length} chars</span>
                        <span>🖼️ {post.images.length} images</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={handlePostNow}
                disabled={!contentData}
                className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Post Now</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Publish immediately</p>
                </div>
              </button>
              
              <button 
                onClick={handleSaveTemplate}
                disabled={!contentData}
                className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Save Template</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reuse this content</p>
                </div>
              </button>
              
              <button 
                onClick={handleEditContent}
                className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <svg className="w-8 h-8 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Edit Content</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Modify your content</p>
                </div>
              </button>
              
              <button 
                onClick={handleViewAnalytics}
                className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <svg className="w-8 h-8 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">View Analytics</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Track performance</p>
                </div>
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={handleNewContent}
                  className="flex items-center p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow hover:shadow-md transition-all"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium">Create New Content</p>
                    <p className="text-sm text-blue-100">Start with a new product URL</p>
                  </div>
                </button>

                <button 
                  onClick={() => router.push('/analytics')}
                  className="flex items-center p-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg shadow hover:shadow-md transition-all"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium">View Analytics</p>
                    <p className="text-sm text-green-100">Track your content performance</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
