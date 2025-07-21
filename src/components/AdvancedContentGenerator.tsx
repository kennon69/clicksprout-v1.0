'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
// Update the import path if Input is located elsewhere, for example:
import { Input } from '@/components/ui/input'
// Or provide the correct relative path to Input component
import { 
  Globe, 
  Sparkles, 
  Zap, 
  Bot,
  Wand2,
  Brain,
  Eye,
  Link,
  RefreshCw,
  Download,
  Play,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react'

interface ScrapingResult {
  success: boolean
  error?: string
  metadata?: {
    title: string
    description: string
    price: string
    images: string[]
    brand: string
    category: string
    availability: string
    rating: string
    reviews: string
  }
  aiContent?: {
    viralTitle: string
    description: string
    hashtags: string[]
    hookLines: string[]
    ctaButtons: string[]
    engagement: {
      estimated_reach: number
      viral_score: number
      platform_suitability: Record<string, number>
    }
  }
  performance?: {
    scrapeTime: number
    aiGenerationTime: number
    totalTime: number
  }
}

interface AdvancedContentGeneratorProps {
  onContentGenerated: (content: any) => void
  className?: string
}

export default function AdvancedContentGenerator({
  onContentGenerated,
  className = ''
}: AdvancedContentGeneratorProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ScrapingResult | null>(null)
  const [mode, setMode] = useState<'quick' | 'full'>('full')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleScrapeAndGenerate = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch('/api/advanced-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, mode })
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        
        // Pass the generated content to parent component
        if (data.data.aiContent) {
          onContentGenerated({
            headline: data.data.aiContent.viralTitle,
            description: data.data.aiContent.description,
            hashtags: data.data.aiContent.hashtags,
            metadata: data.data.metadata,
            performance: data.data.performance
          })
        }
      } else {
        setError(data.error || 'Failed to process URL')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
      setProgress(0)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    setError(null)
  }

  const getViralScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getViralScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 60) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Advanced AI Scraper
          </h2>
        </div>
        <p className="text-gray-400 text-sm">
          Intelligent web scraping + AI-powered viral content generation
        </p>
      </div>

      {/* URL Input Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="space-y-4">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'quick' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('quick')}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Quick Scrape
            </Button>
            <Button
              variant={mode === 'full' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('full')}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Full AI Analysis
            </Button>
          </div>

          {/* URL Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="url"
                placeholder="Paste any product URL (Amazon, Shopify, AliExpress, etc.)"
                value={url}
                onChange={handleUrlChange}
                className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleScrapeAndGenerate}
              disabled={isLoading || !url.trim()}
              className="px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isLoading ? 'Processing...' : 'Generate'}
            </Button>
          </div>

          {/* Mode Description */}
          <div className="text-xs text-gray-400 bg-gray-700/30 rounded-lg p-3">
            {mode === 'quick' ? (
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>Quick mode: Fast metadata extraction (~5-10 seconds)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Brain className="w-3 h-3 text-purple-400" />
                <span>Full mode: Deep analysis + AI content generation (~30-60 seconds)</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {progress < 30 ? 'Analyzing URL...' :
                 progress < 60 ? 'Scraping content...' :
                 progress < 90 ? 'Generating AI content...' : 'Finalizing...'}
              </span>
              <span className="text-purple-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-medium">Scraping Failed</h3>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && result.success && (
        <div className="space-y-4">
          {/* Success Header */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <h3 className="text-green-400 font-medium">Content Generated Successfully!</h3>
              <p className="text-green-300 text-sm">
                Ready to edit and publish to your platforms
              </p>
            </div>
          </div>

          {/* Scraped Metadata */}
          {result.metadata && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Extracted Product Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400">Title:</span>
                    <p className="text-white">{result.metadata.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Price:</span>
                    <p className="text-green-400 font-medium">{result.metadata.price}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Brand:</span>
                    <p className="text-white">{result.metadata.brand}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400">Category:</span>
                    <p className="text-white">{result.metadata.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Rating:</span>
                    <p className="text-yellow-400">{result.metadata.rating}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Availability:</span>
                    <p className="text-white">{result.metadata.availability}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Generated Content */}
          {result.aiContent && (
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI-Generated Viral Content
              </h3>
              
              {/* Viral Score */}
              <div className="mb-6 p-4 bg-black/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Viral Potential Score</span>
                  <span className={`text-2xl font-bold ${getViralScoreColor(result.aiContent.engagement.viral_score)}`}>
                    {result.aiContent.engagement.viral_score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`bg-gradient-to-r ${getViralScoreGradient(result.aiContent.engagement.viral_score)} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${result.aiContent.engagement.viral_score}%` }}
                  />
                </div>
              </div>

              {/* Generated Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-purple-400 font-medium mb-2">Viral Title</h4>
                  <p className="text-white bg-gray-800/50 rounded-lg p-3">{result.aiContent.viralTitle}</p>
                </div>
                
                <div>
                  <h4 className="text-purple-400 font-medium mb-2">Description</h4>
                  <p className="text-gray-300 bg-gray-800/50 rounded-lg p-3">{result.aiContent.description}</p>
                </div>
                
                <div>
                  <h4 className="text-purple-400 font-medium mb-2">Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.aiContent.hashtags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Stats */}
          {result.performance && (
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Total: {(result.performance.totalTime / 1000).toFixed(1)}s</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>Scraping: {(result.performance.scrapeTime / 1000).toFixed(1)}s</span>
                </div>
                {result.performance.aiGenerationTime && (
                  <div className="flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    <span>AI: {(result.performance.aiGenerationTime / 1000).toFixed(1)}s</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
