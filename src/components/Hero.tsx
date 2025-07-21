'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Hero() {
  const router = useRouter()

  const handleStartPromoting = () => {
    console.log('🚀 Start Promoting button clicked!')
    try {
      router.push('/submit')
      console.log('✅ Router.push called successfully')
    } catch (error) {
      console.error('❌ Router error:', error)
      // Fallback to window navigation
      window.location.href = '/submit'
    }
  }

  const handleViewDashboard = () => {
    console.log('📊 View Dashboard button clicked!')
    try {
      router.push('/analytics')
      console.log('✅ Router.push called successfully')
    } catch (error) {
      console.error('❌ Router error:', error)
      // Fallback to window navigation
      window.location.href = '/analytics'
    }
  }

  const handleQuickAction = (path: string, action: string) => {
    console.log(`🔥 Quick action clicked: ${action} -> ${path}`)
    try {
      router.push(path)
      console.log('✅ Router.push called successfully')
    } catch (error) {
      console.error('❌ Router error:', error)
      // Fallback to window navigation
      window.location.href = path
    }
  }
  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Hero Content */}
        <div className="max-w-4xl mx-auto">
          {/* Logo and Badge */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-full px-6 py-2 flex items-center space-x-3 shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                ClickSprout v1.0
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Grow Traffic. 
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Grow Sales.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform any product link into viral content. Auto-generate titles, descriptions, and hashtags. 
            Schedule posts across platforms. Track performance with powerful analytics.
          </p>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Content</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Generate viral titles, descriptions, and hashtags automatically</p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Auto Scheduling</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Post and schedule content across multiple platforms automatically</p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg p-6 shadow-lg">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Track clicks, views, shares, and conversions in real-time</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="w-full sm:w-auto" 
              onClick={handleStartPromoting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Promoting
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={handleViewDashboard}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Dashboard
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            <p className="mb-2">✨ No payment plans required • 🚀 Free AI content generation • 📈 Unlimited backlinks</p>
            <p>Trusted by 10,000+ marketers and entrepreneurs</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <button
              onClick={() => handleQuickAction('/submit', 'Submit URL')}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Submit URL</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">Start promoting</p>
            </button>

            <button
              onClick={() => handleQuickAction('/analytics', 'Analytics')}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Analytics</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">View performance</p>
            </button>

            <button
              onClick={() => handleQuickAction('/scheduler', 'Scheduler')}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Scheduler</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">Auto-post content</p>
            </button>

            <button
              onClick={() => handleQuickAction('/analytics', 'Analytics')}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Analytics</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">Track results</p>
            </button>
          </div>
        </div>

        {/* Hero Image/Demo */}
        <div className="mt-16 max-w-6xl mx-auto">
          <div className="relative">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl p-8">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-purple-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Interactive Demo Content */}
                <div className="text-center z-10">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V9a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quick Start Demo</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Paste any product URL and watch the magic happen</p>
                  
                  {/* Quick Demo Form */}
                  <div className="max-w-md mx-auto">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://amazon.com/product-link"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                      <Button 
                        size="sm"
                        onClick={handleStartPromoting}
                        className="whitespace-nowrap"
                      >
                        Try Now
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Works with Amazon, Shopify, AliExpress, and more
                    </p>
                  </div>
                </div>
                
                {/* Background Animation */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-8 h-8 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="absolute top-8 right-6 w-6 h-6 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute bottom-6 left-8 w-10 h-10 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
