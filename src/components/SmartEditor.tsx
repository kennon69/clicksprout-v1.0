'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Save, 
  Sparkles, 
  Zap, 
  Bot, 
  Wand2, 
  Target,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Lightbulb,
  Eye,
  MessageCircle,
  Share2,
  Download,
  Upload,
  Settings,
  Maximize2,
  Copy,
  Check,
  AlertCircle,
  X
} from 'lucide-react'
import AIContentAssistant from './AIContentAssistant'
import { aiCopilot, AIContentSuggestion } from '@/lib/ai-copilot'

interface SmartEditorProps {
  initialContent?: {
    headline: string
    description: string
    hashtags: string[]
    platform: string
  }
  onSave?: (content: any) => void
  onPublish?: (content: any) => void
}

export default function SmartEditor({
  initialContent = {
    headline: '',
    description: '',
    hashtags: [],
    platform: 'general'
  },
  onSave,
  onPublish
}: SmartEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isAIAssistantVisible, setIsAIAssistantVisible] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showOptimizationResult, setShowOptimizationResult] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<AIContentSuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const headlineRef = useRef<HTMLTextAreaElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const hashtagsRef = useRef<HTMLInputElement>(null)

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (onSave) {
        onSave(content)
        setLastSaved(new Date())
      }
    }, 2000)

    return () => clearTimeout(autoSave)
  }, [content, onSave])

  // Auto-resize textareas
  useEffect(() => {
    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }

    if (headlineRef.current) resizeTextarea(headlineRef.current)
    if (descriptionRef.current) resizeTextarea(descriptionRef.current)
  }, [content.headline, content.description])

  const handleContentChange = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: field === 'hashtags' ? value.split(' ').filter(Boolean) : value
    }))
  }

  const handleSuggestionApply = (suggestion: AIContentSuggestion) => {
    const fieldMap: Record<string, string> = {
      headline: 'headline',
      description: 'description',
      hashtag: 'hashtags',
      cta: 'description', // CTAs go into description
      hook: 'headline',
      template: 'description'
    }

    const field = fieldMap[suggestion.type]
    if (field) {
      if (field === 'hashtags') {
        setContent(prev => ({
          ...prev,
          hashtags: suggestion.content.split(' ').filter(tag => tag.startsWith('#'))
        }))
      } else {
        setContent(prev => ({
          ...prev,
          [field]: suggestion.content
        }))
      }
    }
  }

  const handleOptimizeContent = async () => {
    setIsOptimizing(true)
    try {
      const result = await aiCopilot.optimizeContent(
        content.headline + ' ' + content.description,
        content.platform,
        ['engagement', 'conversion', 'viral']
      )
      setOptimizationResult(result)
      setShowOptimizationResult(true)
    } catch (error) {
      console.error('Optimization error:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleApplyOptimization = () => {
    if (optimizationResult) {
      const [headline, ...descriptionParts] = optimizationResult.optimizedContent.split('. ')
      setContent(prev => ({
        ...prev,
        headline: headline || prev.headline,
        description: descriptionParts.join('. ') || prev.description
      }))
      setShowOptimizationResult(false)
    }
  }

  const handleGenerateContent = async () => {
    setIsGenerating(true)
    try {
      // Generate suggestions for all fields
      const suggestions = await Promise.all([
        aiCopilot.generateSuggestions('', { type: 'headline', platform: content.platform }),
        aiCopilot.generateSuggestions('', { type: 'description', platform: content.platform }),
        aiCopilot.generateSuggestions('', { type: 'hashtag', platform: content.platform })
      ])

      const allSuggestions = suggestions.flat()
      setAiSuggestions(allSuggestions)
      
      // Auto-apply best suggestions
      const bestHeadline = allSuggestions.find(s => s.type === 'headline')
      const bestDescription = allSuggestions.find(s => s.type === 'description')
      const bestHashtags = allSuggestions.find(s => s.type === 'hashtag')

      if (bestHeadline) handleSuggestionApply(bestHeadline)
      if (bestDescription) handleSuggestionApply(bestDescription)
      if (bestHashtags) handleSuggestionApply(bestHashtags)
    } catch (error) {
      console.error('Content generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyToClipboard = (field: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handlePublish = () => {
    console.log('SmartEditor handlePublish called with content:', content)
    if (onPublish) {
      console.log('Calling onPublish callback')
      onPublish(content)
    } else {
      console.log('No onPublish callback provided')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Smart Content Editor</h1>
                <p className="text-gray-400">AI-powered viral content creation</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {lastSaved && (
                <span className="text-sm text-gray-400">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              
              <Button
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                AI Generate
              </Button>
              
              <Button
                onClick={handleOptimizeContent}
                disabled={isOptimizing}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {isOptimizing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Optimize
              </Button>
              
              <Button
                onClick={handlePublish}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="space-y-6">
                {/* Headline */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Headline</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard('headline', content.headline)}
                        className="text-gray-400 hover:text-white"
                      >
                        {copiedField === 'headline' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <span className="text-xs text-gray-500">
                        {content.headline.length}/100
                      </span>
                    </div>
                  </div>
                  <textarea
                    ref={headlineRef}
                    value={content.headline}
                    onChange={(e) => handleContentChange('headline', e.target.value)}
                    placeholder="Enter your viral headline..."
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none overflow-hidden"
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Description</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard('description', content.description)}
                        className="text-gray-400 hover:text-white"
                      >
                        {copiedField === 'description' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <span className="text-xs text-gray-500">
                        {content.description.length}/500
                      </span>
                    </div>
                  </div>
                  <textarea
                    ref={descriptionRef}
                    value={content.description}
                    onChange={(e) => handleContentChange('description', e.target.value)}
                    placeholder="Describe your content in detail..."
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none overflow-hidden min-h-[120px]"
                    maxLength={500}
                  />
                </div>

                {/* Hashtags */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Hashtags</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard('hashtags', content.hashtags.join(' '))}
                        className="text-gray-400 hover:text-white"
                      >
                        {copiedField === 'hashtags' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <span className="text-xs text-gray-500">
                        {content.hashtags.length} tags
                      </span>
                    </div>
                  </div>
                  <input
                    ref={hashtagsRef}
                    value={content.hashtags.join(' ')}
                    onChange={(e) => handleContentChange('hashtags', e.target.value)}
                    placeholder="#viral #trending #innovation"
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Platform Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Target Platform</label>
                  <select
                    value={content.platform}
                    onChange={(e) => handleContentChange('platform', e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="pinterest">Pinterest</option>
                    <option value="reddit">Reddit</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Preview</h3>
                <span className="text-sm text-gray-400 capitalize">{content.platform}</span>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
                  <h4 className="font-bold text-white mb-2 line-clamp-2">
                    {content.headline || 'Your headline will appear here...'}
                  </h4>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-4">
                    {content.description || 'Your description will appear here...'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {content.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <Button
                    onClick={() => setIsAIAssistantVisible(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Get AI Help
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Result Modal */}
        {showOptimizationResult && optimizationResult && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">AI Optimization Results</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOptimizationResult(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Optimized Content</h4>
                  <p className="text-gray-300 text-sm">{optimizationResult.optimizedContent}</p>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">
                    Score: <span className="text-green-400">{optimizationResult.score}%</span>
                  </h4>
                  <ul className="space-y-1">
                    {optimizationResult.improvements.map((improvement: string, index: number) => (
                      <li key={index} className="text-sm text-gray-300 flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowOptimizationResult(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApplyOptimization}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                  >
                    Apply Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Content Assistant */}
      <AIContentAssistant
        currentContent={content}
        onSuggestionApply={handleSuggestionApply}
        onContentOptimize={handleOptimizeContent}
        isVisible={isAIAssistantVisible}
        onToggle={() => setIsAIAssistantVisible(!isAIAssistantVisible)}
      />
    </div>
  )
}
