'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import SmartEditor from '@/components/SmartEditor'
import { ArrowLeft, Save, Calendar, RefreshCw, Upload } from 'lucide-react'

interface ContentData {
  id: string
  url: string
  title: string
  description: string
  content: string
  price?: string
  images: string[]
  videos?: string[]
  hashtags: string[]
  createdAt: string
  updatedAt?: string
}

export default function EditorPage() {
  const router = useRouter()
  const [contentData, setContentData] = useState<ContentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState<number>(0)

  useEffect(() => {
    // Try to load content data from sessionStorage (new) or localStorage (legacy)
    const loadContentData = async () => {
      try {
        // First, try to load from sessionStorage (new advanced generator)
        const generatedContent = sessionStorage.getItem('generatedContent')
        if (generatedContent) {
          const parsed = JSON.parse(generatedContent)
          console.log('Loading generated content from session:', parsed)

          const formattedContent: ContentData = {
            id: Date.now().toString(),
            url: parsed.metadata?.url || '',
            title: parsed.headline || 'Generated Content',
            description: parsed.description || '',
            content: parsed.description || '',
            price: parsed.metadata?.price || '',
            images: parsed.metadata?.images || [],
            videos: [],
            hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
            createdAt: new Date().toISOString(),
            // performance: parsed.performance
          }

          setContentData(formattedContent)
          setIsLoading(false)
          
          // Clear sessionStorage after loading
          sessionStorage.removeItem('generatedContent')
          return
        }

        // Fallback: Try to load already formatted content from localStorage
        const savedContent = localStorage.getItem('currentContent')
        if (savedContent) {
          const parsed = JSON.parse(savedContent)
          setContentData(parsed)
          setIsLoading(false)
          return
        }

        // Legacy fallback: Try to load scraped data and convert it
        const scrapedData = localStorage.getItem('scrapedData')
        if (scrapedData) {
          const parsed = JSON.parse(scrapedData)
          console.log('Loading legacy scraped data:', parsed)

          // Generate AI content if not already present
          let generatedContent = ''
          let hashtags: string[] = []

          try {
            console.log('Generating AI content for scraped data...')
            const generateResponse = await fetch('/api/generate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: parsed.title,
                description: parsed.description,
                url: parsed.url,
                type: 'complete'
              }),
            })

            if (generateResponse.ok) {
              const generated = await generateResponse.json()
              generatedContent = generated.generatedContent || generated.content || ''
              hashtags = generated.hashtags || []
              console.log('AI content generated successfully')
            }
          } catch (error) {
            console.error('Failed to generate AI content:', error)
          }

          // Convert scraped data to editor format
          const editorData: ContentData = {
            id: `content-${Date.now()}`,
            url: parsed.url,
            title: parsed.title || 'Untitled Product',
            description: parsed.description || '',
            content: generatedContent,
            price: parsed.price,
            images: parsed.images || [],
            videos: parsed.videos || [],
            hashtags: hashtags,
            createdAt: new Date().toISOString()
          }

          setContentData(editorData)
          
          // Save the converted data for future use
          localStorage.setItem('currentContent', JSON.stringify(editorData))
        }
      } catch (error) {
        console.error('Error loading content data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadContentData()
  }, [])

  const handleSave = async () => {
    if (!contentData || isSaving) return

    // Prevent duplicate saves within 2 seconds
    const now = Date.now()
    if (now - lastSaveTime < 2000) {
      console.log('Save prevented: too frequent')
      return
    }

    setIsSaving(true)
    setLastSaveTime(now)
    
    try {
      // Update the timestamp
      const updatedData = {
        ...contentData,
        updatedAt: new Date().toISOString()
      }

      // Save content data to localStorage
      localStorage.setItem('currentContent', JSON.stringify(updatedData))
      
      // Also update the contentData state
      setContentData(updatedData)
      
      // TODO: Save to backend API when available
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      alert('Content saved successfully!')
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateContentData = (updates: Partial<ContentData>) => {
    if (!contentData) return
    
    const updatedData = {
      ...contentData,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    setContentData(updatedData)
    localStorage.setItem('currentContent', JSON.stringify(updatedData))
  }

  const handleRegenerate = async () => {
    if (!contentData) return

    setIsRegenerating(true)
    try {
      // TODO: Call AI API to regenerate content
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      // For now, just show a success message
      alert('Content regenerated successfully!')
    } catch (error) {
      console.error('Error regenerating content:', error)
      alert('Failed to regenerate content. Please try again.')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleContentChange = (updatedContent: Partial<ContentData>) => {
    if (!contentData) return
    
    const updatedData = {
      ...contentData,
      ...updatedContent,
      updatedAt: new Date().toISOString()
    }
    
    setContentData(updatedData)
    localStorage.setItem('currentContent', JSON.stringify(updatedData))
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading editor...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (!contentData) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-full p-4 mb-6 inline-block">
              <svg className="w-16 h-16 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Content to Edit</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please submit a product link first to generate content that you can edit.
            </p>
            <button 
              onClick={() => router.push('/submit')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all inline-flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Submit Product Link</span>
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smart Content Editor</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Edit and optimize your AI-generated promotional content
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                
                <button
                  onClick={() => {
                    if (contentData) {
                      localStorage.setItem('currentContent', JSON.stringify(contentData))
                      localStorage.setItem('finalContent', JSON.stringify(contentData))
                    }
                    router.push('/scheduler')
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Posts</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Editing Content for:</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 truncate max-w-md">{contentData.url}</p>
                </div>
              </div>
              {contentData.price && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Product Price</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{contentData.price}</p>
                </div>
              )}
            </div>
          </div>

          {/* Smart Editor */}
          <div className="space-y-6">
            {/* Media Gallery */}
            {((contentData.images && contentData.images.length > 0) || (contentData.videos && contentData.videos.length > 0)) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Scraped Media 
                  {contentData.images && ` (${contentData.images.length} images`}
                  {contentData.videos && `, ${contentData.videos.length} videos)`}
                </h3>
                
                {/* Images */}
                {contentData.images && contentData.images.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {contentData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Product image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button 
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                              onClick={() => {
                                navigator.clipboard.writeText(image)
                                alert('Image URL copied!')
                              }}
                            >
                              Copy URL
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {contentData.videos && contentData.videos.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Videos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contentData.videos.map((video, index) => (
                        <div key={index} className="relative group">
                          <video 
                            src={video} 
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                            controls
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <button 
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                              onClick={() => {
                                navigator.clipboard.writeText(video)
                                alert('Video URL copied!')
                              }}
                            >
                              Copy URL
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* File Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Additional Media
              </h3>
              
              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        files.forEach(file => {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            const imageUrl = event.target?.result as string
                            updateContentData({
                              images: [...(contentData.images || []), imageUrl]
                            })
                          }
                          reader.readAsDataURL(file)
                        })
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Click to upload images or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </label>
                  </div>
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Videos
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        files.forEach(file => {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            const videoUrl = event.target?.result as string
                            updateContentData({
                              videos: [...(contentData.videos || []), videoUrl]
                            })
                          }
                          reader.readAsDataURL(file)
                        })
                      }}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Click to upload videos or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">MP4, MOV, AVI up to 50MB</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <SmartEditor
              initialContent={{
                headline: contentData.title,
                description: contentData.description,
                hashtags: contentData.hashtags,
                platform: 'general'
              }}
              onSave={(content) => {
                console.log('SmartEditor save callback triggered:', content)
                // Don't automatically save on every change, only when user clicks save
              }}
              onPublish={(content) => {
                console.log('SmartEditor publish callback triggered:', content)
                console.log('Current contentData:', contentData)
                
                if (!contentData) {
                  console.error('No contentData available for publishing')
                  return
                }
                
                const updatedData = {
                  ...contentData,
                  title: content.headline,
                  description: content.description,
                  hashtags: content.hashtags,
                  content: content.description,
                  updatedAt: new Date().toISOString()
                }
                
                console.log('Updated data for scheduler:', updatedData)
                setContentData(updatedData)
                localStorage.setItem('currentContent', JSON.stringify(updatedData))
                localStorage.setItem('finalContent', JSON.stringify(updatedData))
                
                console.log('Navigating to scheduler...')
                router.push('/scheduler')
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
