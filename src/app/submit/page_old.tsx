'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import AdvancedContentGenerator from '@/components/AdvancedContentGenerator'

interface ScrapedData {
  title: string
  description: string
  price?: string
  images: string[]
  videos: string[]
  url: string
  marketResearch?: {
    competitorUrls: string[]
    suggestedHashtags: string[]
    targetAudience: string
    priceComparison: string[]
    marketTrends: string[]
  }
}

export default function SubmitPage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [enableMarketResearch, setEnableMarketResearch] = useState(true)
  const [researchStatus, setResearchStatus] = useState('')
  const [marketResearchData, setMarketResearchData] = useState<any>(null)
  const [activeResearchType, setActiveResearchType] = useState<string | null>(null)
  const [isResearching, setIsResearching] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const router = useRouter()
  
  // Use ref to track if component is mounted
  const isMountedRef = React.useRef(true)

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleContentGenerated = (content: any) => {
    console.log('Content generated:', content)
    setGeneratedContent(content)
    
    // Navigate to editor with the generated content
    const editorData = {
      headline: content.headline,
      description: content.description,
      hashtags: content.hashtags,
      metadata: content.metadata,
      performance: content.performance
    }
    
    // Store in sessionStorage for the editor
    sessionStorage.setItem('generatedContent', JSON.stringify(editorData))
    
    // Navigate to editor
    router.push('/editor')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submit form clicked with URL:', url)
    
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setIsLoading(true)
    setError('')
    setResearchStatus('')

    try {
      // Validate URL
      console.log('Validating URL...')
      new URL(url)

      setResearchStatus('Scraping product data...')
      console.log('Starting scrape request...')

      // Call scraper API
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, enableMarketResearch }),
      })

      console.log('Scrape response status:', response.status)
      const responseData = await response.json()
      console.log('Scrape response data:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to scrape URL')
      }

      const scrapedData: ScrapedData = responseData

      if (enableMarketResearch && scrapedData.marketResearch) {
        setResearchStatus('AI market research complete! Generating content...')
      } else {
        setResearchStatus('Scraping complete! Generating content...')
      }

      // Enhance content with AI if needed
      if (!scrapedData.title || scrapedData.title.length < 10) {
        setResearchStatus('Enhancing content with AI...')
        console.log('Enhancing content with AI...')
        
        const enhanceResponse = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: scrapedData.title,
            description: scrapedData.description,
            url: scrapedData.url,
            type: 'enhance'
          }),
        })

        if (enhanceResponse.ok) {
          const enhancedContent = await enhanceResponse.json()
          scrapedData.title = enhancedContent.title
          scrapedData.description = enhancedContent.description
          console.log('Content enhanced successfully')
        }
      }

      setResearchStatus('Content ready! Generating promotional content...')

      // Generate AI content for the editor
      console.log('Generating AI promotional content...')
      console.log('Scraped data for generation:', scrapedData)
      
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: scrapedData.title,
          description: scrapedData.description,
          url: scrapedData.url,
          type: 'complete'
        }),
      })

      let generatedContent = ''
      let hashtags: string[] = []
      
      if (generateResponse.ok) {
        const generated = await generateResponse.json()
        console.log('Generated AI content:', generated)
        generatedContent = generated.generatedContent || generated.content || ''
        hashtags = generated.hashtags || []
        console.log('AI content generated successfully')
      } else {
        console.error('Failed to generate AI content:', await generateResponse.text())
      }

      // Create complete content data for the editor
      const editorData = {
        id: `content-${Date.now()}`,
        url: scrapedData.url,
        title: scrapedData.title,
        description: scrapedData.description,
        content: generatedContent,
        price: scrapedData.price,
        images: scrapedData.images || [],
        videos: scrapedData.videos || [],
        hashtags: hashtags,
        createdAt: new Date().toISOString()
      }

      // Store both formats for backward compatibility
      localStorage.setItem('scrapedData', JSON.stringify(scrapedData))
      localStorage.setItem('currentContent', JSON.stringify(editorData))
      console.log('Content data stored:', editorData)
      console.log('Data stored, redirecting to editor...')

      setResearchStatus('Redirecting to content editor...')

      // Redirect to editor
      router.push('/editor')
    } catch (err) {
      console.error('Submission error:', err)
      if (err instanceof Error) {
        if (err.message.includes('Invalid URL')) {
          setError('Please enter a valid URL (e.g., https://example.com/product)')
        } else if (err.message.includes('Failed to scrape')) {
          setError('Unable to access this website. Please try a different URL or check if the site is accessible.')
        } else {
          setError(err.message)
        }
      } else {
        setError('An unexpected error occurred. Please try again or contact support.')
      }
    } finally {
      setIsLoading(false)
      setResearchStatus('')
    }
    setResearchStatus('')
  }

  const handleMarketResearch = async (type: 'competitors' | 'hashtags' | 'audience' | 'trends') => {
    if (!url) {
      setError('Please enter a product URL first')
      return
    }

    setIsResearching(true)
    setActiveResearchType(type)
    setError('')

    try {
      const statusMessages = {
        competitors: 'Analyzing competitors and pricing...',
        hashtags: 'Finding trending hashtags...',
        audience: 'Identifying target audience...',
        trends: 'Researching market trends...'
      }

      setResearchStatus(statusMessages[type])

      const response = await fetch('/api/market-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url, 
          type,
          title: 'Product Research' // You can extract this from the URL later
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate market research')
      }

      const data = await response.json()
      setMarketResearchData((prev: any) => ({ ...prev, [type]: data }))
      setResearchStatus(`${statusMessages[type]} Complete!`)
      
      // Clear status after 2 seconds - only if component is still mounted
      setTimeout(() => {
        if (isMountedRef.current) {
          setResearchStatus('')
          setActiveResearchType(null)
        }
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate market research')
      setResearchStatus('')
      setActiveResearchType(null)
    } finally {
      setIsResearching(false)
    }
  }

  const sampleUrls = [
    'https://www.amazon.com/dp/B08N5WRWNW',
    'https://shopify.com/sample-product',
    'https://www.aliexpress.com/item/123456789.html'
  ]

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mr-4 animate-pulse-glow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Product Analyzer
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Enter any product URL to automatically extract information, generate viral content, and get AI market insights.
            </p>
          </div>

          {/* Main Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.amazon.com/product-link or any product URL..."
                    className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 18c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9l4-4m-4 4l4 4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* AI Market Research Option */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Market Research</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Get competitor analysis, trending hashtags, and market insights</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableMarketResearch}
                      onChange={(e) => setEnableMarketResearch(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {enableMarketResearch && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => handleMarketResearch('competitors')}
                      disabled={isResearching}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 ${activeResearchType === 'competitors' ? 'animate-spin' : 'animate-pulse-glow'}`}>
                        {activeResearchType === 'competitors' ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Competitor Analysis</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Find similar products & pricing</p>
                      {marketResearchData?.competitors && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ✓ Complete
                          </span>
                        </div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleMarketResearch('hashtags')}
                      disabled={isResearching}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 ${activeResearchType === 'hashtags' ? 'animate-spin' : 'animate-pulse-glow'}`}>
                        {activeResearchType === 'hashtags' ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Trending Hashtags</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Viral hashtag suggestions</p>
                      {marketResearchData?.hashtags && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ✓ Complete
                          </span>
                        </div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleMarketResearch('audience')}
                      disabled={isResearching}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 ${activeResearchType === 'audience' ? 'animate-spin' : 'animate-pulse-glow'}`}>
                        {activeResearchType === 'audience' ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Target Audience</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Ideal customer profile</p>
                      {marketResearchData?.audience && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ✓ Complete
                          </span>
                        </div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleMarketResearch('trends')}
                      disabled={isResearching}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 ${activeResearchType === 'trends' ? 'animate-spin' : 'animate-pulse-glow'}`}>
                        {activeResearchType === 'trends' ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Market Trends</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Current market insights</p>
                      {marketResearchData?.trends && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ✓ Complete
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Market Research Results */}
              {marketResearchData && (
                <div className="space-y-6">
                  {marketResearchData.competitors && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Competitor Analysis</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {marketResearchData.competitors.competitorAnalysis?.competitors.map((competitor: any, index: number) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{competitor.name}</h4>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">{competitor.price}</p>
                            <div className="flex items-center mb-2">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">{competitor.rating}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({competitor.marketShare} market share)</span>
                            </div>
                            <div className="space-y-1">
                              {competitor.features.slice(0, 3).map((feature: string, fIndex: number) => (
                                <span key={fIndex} className="inline-block text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-1 mb-1">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Average Price:</strong> {marketResearchData.competitors.competitorAnalysis?.averagePrice}
                          <span className="mx-4">|</span>
                          <strong>Price Range:</strong> {marketResearchData.competitors.competitorAnalysis?.priceRange.min} - {marketResearchData.competitors.competitorAnalysis?.priceRange.max}
                        </p>
                      </div>
                    </div>
                  )}

                  {marketResearchData.hashtags && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trending Hashtags</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Viral Hashtags</h4>
                          <div className="flex flex-wrap gap-2">
                            {marketResearchData.hashtags.trendingHashtags?.viral.map((hashtag: string, index: number) => (
                              <span key={index} className="inline-block bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
                                {hashtag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Trending Now</h4>
                          <div className="flex flex-wrap gap-2">
                            {marketResearchData.hashtags.trendingHashtags?.trending.map((hashtag: string, index: number) => (
                              <span key={index} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                                {hashtag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {marketResearchData.audience && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Target Audience</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Demographics</h4>
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <p><strong>Age:</strong> {marketResearchData.audience.targetAudience?.primaryDemographics.ageRange}</p>
                            <p><strong>Gender:</strong> {marketResearchData.audience.targetAudience?.primaryDemographics.gender}</p>
                            <p><strong>Income:</strong> {marketResearchData.audience.targetAudience?.primaryDemographics.income}</p>
                            <p><strong>Education:</strong> {marketResearchData.audience.targetAudience?.primaryDemographics.education}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Interests</h4>
                          <div className="flex flex-wrap gap-2">
                            {marketResearchData.audience.targetAudience?.interests.slice(0, 6).map((interest: string, index: number) => (
                              <span key={index} className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {marketResearchData.trends && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Trends</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Market Overview</h4>
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <p><strong>Growth Rate:</strong> <span className="text-green-600 dark:text-green-400">{marketResearchData.trends.marketTrends?.growthRate}</span></p>
                            <p><strong>Market Size:</strong> {marketResearchData.trends.marketTrends?.marketSize}</p>
                            <p><strong>Forecast:</strong> {marketResearchData.trends.marketTrends?.forecast.nextQuarter}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Key Opportunities</h4>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            {marketResearchData.trends.marketTrends?.opportunities.slice(0, 4).map((opportunity: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-2">•</span>
                                {opportunity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Display */}
              {(isLoading || researchStatus) && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <div className="flex-1">
                      <p className="text-blue-800 dark:text-blue-200 font-medium">
                        {researchStatus || 'Processing your request...'}
                      </p>
                      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="ml-3 text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !url}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Scraping & Generating Content...</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Scrape & Generate Content</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sample URLs */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Try Sample URLs:</h3>
            <div className="space-y-2">
              {sampleUrls.map((sampleUrl, index) => (
                <button
                  key={index}
                  onClick={() => setUrl(sampleUrl)}
                  className="block w-full text-left px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/20 rounded-lg transition-colors"
                >
                  {sampleUrl}
                </button>
              ))}
            </div>
          </div>

          {/* How it Works */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Scrape Product Data</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Extract title, description, images, and pricing from any product URL</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Content Generation</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Generate viral titles, descriptions, and promotional copy using AI</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Edit & Publish</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Fine-tune content and schedule posts across multiple platforms</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
