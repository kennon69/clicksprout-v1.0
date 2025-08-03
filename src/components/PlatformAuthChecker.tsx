'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  ExternalLink,
  Key,
  Settings
} from 'lucide-react'

interface PlatformStatus {
  name: string
  isAuthenticated: boolean
  isSupported: boolean
  status: string
}

interface PlatformConfig {
  name: string
  displayName: string
  description: string
  setupUrl: string
  requiredEnvVars: string[]
  icon: string
}

const platformConfigs: PlatformConfig[] = [
  {
    name: 'reddit',
    displayName: 'Reddit',
    description: 'Post to Reddit communities',
    setupUrl: 'https://www.reddit.com/prefs/apps',
    requiredEnvVars: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USERNAME', 'REDDIT_PASSWORD'],
    icon: '🔴'
  },
  {
    name: 'twitter',
    displayName: 'Twitter/X',
    description: 'Post tweets and engage with followers',
    setupUrl: 'https://developer.twitter.com/en/portal/dashboard',
    requiredEnvVars: ['TWITTER_BEARER_TOKEN'],
    icon: '🐦'
  },
  {
    name: 'pinterest',
    displayName: 'Pinterest',
    description: 'Share visual content and drive traffic',
    setupUrl: 'https://developers.pinterest.com/apps/',
    requiredEnvVars: ['PINTEREST_ACCESS_TOKEN'],
    icon: '📌'
  },
  {
    name: 'medium',
    displayName: 'Medium',
    description: 'Publish articles and stories',
    setupUrl: 'https://medium.com/me/settings',
    requiredEnvVars: ['MEDIUM_ACCESS_TOKEN'],
    icon: '📝'
  },
  {
    name: 'facebook',
    displayName: 'Facebook',
    description: 'Post to Facebook pages',
    setupUrl: 'https://developers.facebook.com/',
    requiredEnvVars: ['FACEBOOK_ACCESS_TOKEN', 'FACEBOOK_PAGE_ID'],
    icon: '📘'
  },
  {
    name: 'linkedin',
    displayName: 'LinkedIn',
    description: 'Share professional content',
    setupUrl: 'https://www.linkedin.com/developers/apps',
    requiredEnvVars: ['LINKEDIN_ACCESS_TOKEN'],
    icon: '💼'
  }
]

export default function PlatformAuthChecker() {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<string | null>(null)

  const fetchPlatformStatus = async () => {
    try {
      const response = await fetch('/api/platform-auth')
      const data = await response.json()
      
      if (data.success) {
        setPlatforms(data.platforms)
      }
    } catch (error) {
      console.error('Failed to fetch platform status:', error)
    } finally {
      setLoading(false)
    }
  }

  const testPlatform = async (platformName: string) => {
    setRefreshing(platformName)
    try {
      const response = await fetch('/api/platform-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'test',
          platform: platformName
        })
      })
      
      const data = await response.json()
      
      // Update the specific platform status
      setPlatforms(prev => prev.map(p => 
        p.name === platformName 
          ? { ...p, isAuthenticated: data.isAuthenticated, status: data.message }
          : p
      ))
    } catch (error) {
      console.error(`Failed to test ${platformName}:`, error)
    } finally {
      setRefreshing(null)
    }
  }

  const refreshAllPlatforms = async () => {
    setRefreshing('all')
    try {
      const response = await fetch('/api/platform-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'refresh'
        })
      })
      
      if (response.ok) {
        await fetchPlatformStatus()
      }
    } catch (error) {
      console.error('Failed to refresh platforms:', error)
    } finally {
      setRefreshing(null)
    }
  }

  useEffect(() => {
    fetchPlatformStatus()
  }, [])

  const getStatusIcon = (platform: PlatformStatus) => {
    if (platform.isAuthenticated) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusText = (platform: PlatformStatus) => {
    if (platform.isAuthenticated) {
      return 'Ready'
    } else {
      return 'Authentication Required'
    }
  }

  const getStatusColor = (platform: PlatformStatus) => {
    if (platform.isAuthenticated) {
      return 'text-green-600 bg-green-50 border-green-200'
    } else {
      return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Checking platform authentication...</span>
      </div>
    )
  }

  const authenticatedCount = platforms.filter(p => p.isAuthenticated).length
  const totalCount = platforms.length

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Authentication Status</h2>
        <p className="text-gray-600 mb-4">
          Configure your platform API credentials to enable automated posting.
        </p>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-green-600">{authenticatedCount}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> platforms configured
            </div>
            {authenticatedCount < totalCount && (
              <div className="flex items-center text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                Some platforms need configuration
              </div>
            )}
          </div>
          
          <Button
            onClick={refreshAllPlatforms}
            disabled={refreshing === 'all'}
            variant="outline"
            size="sm"
          >
            {refreshing === 'all' ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => {
          const config = platformConfigs.find(c => c.name === platform.name)
          if (!config) return null

          return (
            <div
              key={platform.name}
              className={`border rounded-lg p-4 ${getStatusColor(platform)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{config.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{config.displayName}</h3>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                </div>
                {getStatusIcon(platform)}
              </div>

              <div className="mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(platform)}`}>
                  {getStatusText(platform)}
                </span>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => testPlatform(platform.name)}
                  disabled={refreshing === platform.name}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  {refreshing === platform.name ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Settings className="w-3 h-3 mr-1" />
                  )}
                  Test
                </Button>
                
                <Button
                  onClick={() => window.open(config.setupUrl, '_blank')}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Key className="w-3 h-3 mr-1" />
                  Setup
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>

              {!platform.isAuthenticated && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                  <p className="font-medium text-gray-700 mb-1">Required environment variables:</p>
                  <ul className="text-gray-600 space-y-1">
                    {config.requiredEnvVars.map(envVar => (
                      <li key={envVar} className="font-mono">{envVar}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Configuration Instructions</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Copy <code className="bg-blue-100 px-1 rounded">.env.example</code> to <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
          <li>2. Click &quot;Setup&quot; for each platform to get your API credentials</li>
          <li>3. Add the credentials to your <code className="bg-blue-100 px-1 rounded">.env.local</code> file</li>
          <li>4. Restart your development server</li>
          <li>5. Use the &quot;Test&quot; button to verify authentication</li>
        </ol>
      </div>
    </div>
  )
}
