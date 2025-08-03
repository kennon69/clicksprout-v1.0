'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Globe, Sparkles, Image, Tag, BarChart3 } from 'lucide-react'

interface ContentGeneratorProps {
  onContentGenerated: (content: any) => void
}

export default function AdvancedContentGenerator({ onContentGenerated }: ContentGeneratorProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to process URL')
      }

      const result = await response.json()
      onContentGenerated(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* URL Input Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-lg font-semibold text-gray-900 mb-3">
              Product URL
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://amazon.com/product/... or any product URL"
                className="pl-12 h-14 text-lg rounded-xl border-2 border-gray-200 focus:border-purple-500 transition-colors"
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="mt-2 text-red-600 text-sm">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Viral Content
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Features Preview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Image className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Smart Extraction</h3>
          <p className="text-gray-600 text-sm">Automatically extracts product details, images, and key information</p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Viral Content</h3>
          <p className="text-gray-600 text-sm">AI-generated headlines, descriptions, and hashtags optimized for engagement</p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Performance Tracking</h3>
          <p className="text-gray-600 text-sm">Track clicks, conversions, and engagement across all platforms</p>
        </div>
      </div>
    </div>
  )
}
