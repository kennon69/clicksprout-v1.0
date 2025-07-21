'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/contexts/SettingsContext'

interface HeaderProps {
  onMenuToggle?: () => void
  showActionButtons?: boolean // New prop to control action buttons
}

export default function Header({ onMenuToggle, showActionButtons = false }: HeaderProps) {
  const router = useRouter()
  const { settings, updateSettings } = useSettings()

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🌓 Theme toggle clicked') // Debug log
    const newTheme = settings.appearance.theme === 'dark' ? 'light' : 'dark'
    updateSettings('appearance', 'theme', newTheme)
  }

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🚀 Get Started button clicked - navigating to /submit')
    try {
      router.push('/submit')
      console.log('✅ Router.push(/submit) called successfully')
    } catch (error) {
      console.error('❌ Router error:', error)
      // Fallback to window navigation
      window.location.href = '/submit'
    }
  }

  const handleDashboard = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('📊 Dashboard button clicked - navigating to /analytics')
    try {
      router.push('/analytics')
      console.log('✅ Router.push(/analytics) called successfully')
    } catch (error) {
      console.error('❌ Router error:', error)
      // Fallback to window navigation
      window.location.href = '/analytics'
    }
  }

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            {/* Logo - shown on mobile or when no menu toggle */}
            <div className={`flex items-center space-x-2 ${onMenuToggle ? 'lg:hidden' : ''}`}>
              {/* Custom Logo with Fallback */}
              <div className="w-8 h-8 flex items-center justify-center">
                {settings.branding?.useCustomLogo && settings.branding?.customLogo ? (
                  <img 
                    src={settings.branding.customLogo} 
                    alt="Custom Logo"
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                )}
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ClickSprout</span>
            </div>
          </div>

          {/* Navigation - only show when not using sidebar */}
          {!onMenuToggle && (
            <nav className="hidden md:flex items-center space-x-8">
              {/* Navigation items removed for cleaner home page */}
            </nav>
          )}

          {/* Actions - Only show when showActionButtons is true */}
          <div className="flex items-center">
            {/* Dark Mode Toggle - always show */}
            <div className={`${showActionButtons ? 'mr-8' : 'mr-0'} flex-shrink-0`}>
              <button
                onClick={toggleTheme}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
                type="button"
                data-button="theme-toggle"
              >
                {settings.appearance.theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Show action buttons only when showActionButtons is true */}
            {showActionButtons && (
              <>
                {/* Dashboard Button */}
                <div className="mr-6 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleDashboard}
                  >
                    Dashboard
                  </Button>
                </div>

                {/* Get Started Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={handleGetStarted}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 h-9 px-4 py-2"
                    type="button"
                    data-button="get-started"
                  >
                    Get Started
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
