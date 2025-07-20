'use client'

import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw,
  Zap,
  TrendingUp,
  Globe,
  Database,
  Settings,
  Play,
  Pause
} from 'lucide-react'

interface SystemHealth {
  engine: {
    status: string
    uptime: number
    version: string
    maintenanceMode: boolean
    totalPosts: number
    successRate: number
    averageResponseTime: number
  }
  platforms: Array<{
    platform: string
    status: 'healthy' | 'degraded' | 'down'
    lastChecked: string
    lastSuccessfulPost: string
    errorCount: number
    authStatus: 'valid' | 'expired' | 'invalid'
    rateLimit: {
      remaining: number
      resetTime: string
    }
  }>
  retryQueue: number
  scheduledPosts: number
  systemAlerts: {
    total: number
    critical: number
    unresolved: number
    recentAlerts: Array<{
      id: string
      type: 'error' | 'warning' | 'info' | 'success'
      title: string
      message: string
      timestamp: string
      resolved: boolean
    }>
  }
}

const SystemDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSystemHealth()
    const interval = setInterval(fetchSystemHealth, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemHealth = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setHealth(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch system health:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch system health')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running':
      case 'healthy':
        return 'text-green-600 dark:text-green-400'
      case 'degraded':
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'down':
      case 'error':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running':
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'down':
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    }
  }

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / 86400)
    const hours = Math.floor((uptime % 86400) / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  if (loading && !health) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  System Health Check Failed
                </h3>
                <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchSystemHealth}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Dashboard
          </h1>
          <button
            onClick={fetchSystemHealth}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {health && (
          <>
            {/* Engine Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Engine Status
                    </p>
                    <div className="flex items-center mt-2">
                      {getStatusIcon(health.engine.status)}
                      <span className={`ml-2 font-semibold capitalize ${getStatusColor(health.engine.status)}`}>
                        {health.engine.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {health.engine.status === 'running' ? (
                      <Pause className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                    ) : (
                      <Play className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                    )}
                    <Settings className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Uptime: {formatUptime(health.engine.uptime)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Version: {health.engine.version}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Posts
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {health.engine.totalPosts.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Success Rate: {health.engine.successRate}%
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Queue
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {health.retryQueue}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Scheduled: {health.scheduledPosts}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Alerts
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {health.systemAlerts.unresolved}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Critical: {health.systemAlerts.critical}
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Platform Status
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {health.platforms.map((platform) => (
                    <div key={platform.platform} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {platform.platform}
                          </span>
                        </div>
                        {getStatusIcon(platform.status)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Auth: <span className={getStatusColor(platform.authStatus)}>{platform.authStatus}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Errors: {platform.errorCount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Rate Limit: {platform.rateLimit.remaining}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            {health.systemAlerts.recentAlerts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Alerts
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {health.systemAlerts.recentAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {getStatusIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {alert.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!alert.resolved && (
                          <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                            Resolve
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SystemDashboard