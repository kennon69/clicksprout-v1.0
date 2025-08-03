'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Bot, 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  Target,
  Zap,
  MessageCircle,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  X,
  Maximize2,
  Minimize2,
  Settings,
  Brain,
  Wand2,
  BarChart3,
  Heart,
  Share2
} from 'lucide-react'
import { aiCopilot, AIContentSuggestion, ViralScore } from '@/lib/ai-copilot'

interface AIContentAssistantProps {
  currentContent: {
    headline: string
    description: string
    hashtags: string[]
    platform: string
  }
  onSuggestionApply: (suggestion: AIContentSuggestion) => void
  onContentOptimize: (optimizedContent: string) => void
  isVisible: boolean
  onToggle: () => void
}

export default function AIContentAssistant({
  currentContent,
  onSuggestionApply,
  onContentOptimize,
  isVisible,
  onToggle
}: AIContentAssistantProps) {
  const [suggestions, setSuggestions] = useState<AIContentSuggestion[]>([])
  const [viralScore, setViralScore] = useState<ViralScore | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'suggestions' | 'score' | 'chat' | 'templates'>('suggestions')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Real-time content analysis
  useEffect(() => {
    if (currentContent.headline || currentContent.description) {
      generateSuggestions()
      calculateViralScore()
    }
  }, [currentContent])

  const generateSuggestions = async () => {
    setIsLoading(true)
    try {
      const [headlineSuggestions, descriptionSuggestions, hashtagSuggestions, ctaSuggestions] = await Promise.all([
        aiCopilot.generateSuggestions(currentContent.headline, {
          type: 'headline',
          platform: currentContent.platform
        }),
        aiCopilot.generateSuggestions(currentContent.description, {
          type: 'description',
          platform: currentContent.platform
        }),
        aiCopilot.generateSuggestions(currentContent.hashtags.join(' '), {
          type: 'hashtag',
          platform: currentContent.platform
        }),
        aiCopilot.generateSuggestions(currentContent.description, {
          type: 'cta',
          platform: currentContent.platform
        })
      ])

      setSuggestions([
        ...headlineSuggestions,
        ...descriptionSuggestions,
        ...hashtagSuggestions,
        ...ctaSuggestions
      ])
    } catch (error) {
      console.error('Error generating suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateViralScore = async () => {
    try {
      const score = await aiCopilot.calculateViralScore(currentContent)
      setViralScore(score)
    } catch (error) {
      console.error('Error calculating viral score:', error)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Simulate AI response (in production, this would call actual AI service)
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage)
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
    }, 1000)
  }

  const generateAIResponse = (input: string): string => {
    const responses = [
      "I'd suggest focusing on emotional triggers in your headline. Try starting with words like 'Finally' or 'Discover'.",
      "Your content has great potential! Consider adding more specific benefits and social proof.",
      "For viral content, try the 'problem-solution-benefit' structure. It's proven to increase engagement by 40%.",
      "Based on your platform, I recommend shorter, punchier sentences. Visual content performs 3x better here.",
      "Consider adding urgency elements like 'Limited time' or 'While supplies last' to boost conversions."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 60) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full w-14 h-14 shadow-2xl animate-pulse"
      >
        <Bot className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <div className={`fixed ${isExpanded ? 'inset-4' : 'bottom-6 right-6 w-96 h-[600px]'} z-50 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Copilot</h3>
            <p className="text-gray-400 text-xs">Your viral content assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
          { id: 'score', label: 'Score', icon: BarChart3 },
          { id: 'chat', label: 'Chat', icon: MessageCircle },
          { id: 'templates', label: 'Templates', icon: Wand2 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4" style={{ height: isExpanded ? 'calc(100vh - 140px)' : '520px' }}>
        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-slate-800/50 rounded-lg p-4 border border-white/5 hover:border-blue-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getScoreGradient(suggestion.score)}`}></div>
                      <span className="text-xs font-medium text-gray-400 uppercase">
                        {suggestion.type}
                      </span>
                      <span className={`text-xs font-bold ${getScoreColor(suggestion.score)}`}>
                        {suggestion.score}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(suggestion.content)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSuggestionApply(suggestion)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                      >
                        <Zap className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-white text-sm mb-2">{suggestion.content}</p>
                  {suggestion.reasoning && (
                    <p className="text-gray-400 text-xs">{suggestion.reasoning}</p>
                  )}
                </div>
              ))
            )}
            
            <Button
              onClick={generateSuggestions}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Suggestions
            </Button>
          </div>
        )}

        {/* Viral Score Tab */}
        {activeTab === 'score' && viralScore && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${viralScore.overall * 3.51} 351`}
                    className={`${getScoreColor(viralScore.overall)} transition-all duration-1000`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(viralScore.overall)}`}>
                      {viralScore.overall}
                    </div>
                    <div className="text-xs text-gray-400">Viral Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="space-y-3">
              {[
                { label: 'Engagement', score: viralScore.engagement, icon: Heart },
                { label: 'Shareability', score: viralScore.shareability, icon: Share2 },
                { label: 'Conversion', score: viralScore.conversion, icon: Target },
                { label: 'Platform Fit', score: viralScore.platformOptimization, icon: TrendingUp }
              ].map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{metric.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(metric.score)}`}
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(metric.score)}`}>
                      {metric.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                AI Feedback
              </h4>
              <ul className="space-y-1">
                {viralScore.feedback.map((item, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Ask me anything about your content!</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Try: &quot;How can I make this more viral?&quot; or &quot;What&apos;s trending?&quot;
                  </p>
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-gray-300'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={handleChatSubmit} className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI for help..."
                className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">AI Templates coming soon!</p>
              <p className="text-gray-500 text-sm mt-2">
                Smart templates based on your content will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
