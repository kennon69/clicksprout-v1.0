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
      severity: 'low' | 'medium' | 'high' | 'critical'
      message: string
      details?: string
      timestamp: string
      platform?: string
      postId?: string
      resolved?: boolean
    }>
  }
  performance: {
    memoryUsage?: any
    cpuUsage?: any
    processStats?: any
  }
}

export default function SystemDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showAlerts, setShowAlerts] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/posting-engine?action=health')
      const result = await response.json()
      
      if (result.success) {
        setHealth(result.data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEngine = async (start: boolean) => {
    try {
      const response = await fetch('/api/posting-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: start ? 'start' : 'stop' })
      })

      const result = await response.json()
      if (result.success) {
        await fetchSystemHealth()
      }
    } catch (error) {
      console.error('Failed to toggle engine:', error)
    }
  }

  const toggleMaintenanceMode = async () => {
    try {
      const response = await fetch('/api/posting-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'maintenance', 
          enable: !health?.engine.maintenanceMode 
        })
      })

      const result = await response.json()
      if (result.success) {
        await fetchSystemHealth()
      }
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/posting-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'resolve-alert', 
          alertId,
          acknowledgedBy: 'System Admin'
        })
      })

      const result = await response.json()
      if (result.success) {
        await fetchSystemHealth()
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const performHealthCheck = async () => {
    try {
      const response = await fetch('/api/posting-engine?action=healthcheck')
      const result = await response.json()
      
      if (result.success) {
        console.log('Health check results:', result.data)
        await fetchSystemHealth()
      }
    } catch (error) {
      console.error('Failed to perform health check:', error)
    }
  }

  useEffect(() => {
    fetchSystemHealth()

    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return 'text-green-500'
      case 'degraded':
        return 'text-yellow-500'
      case 'down':
      case 'stopped':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'down':
      case 'stopped':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              System Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Intelligent Posting Engine v{health?.engine.version || '2.0'} - Status & Monitoring
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                autoRefresh
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>

            <button
              onClick={fetchSystemHealth}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Refresh Now
            </button>
            
            <button
              onClick={performHealthCheck}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Health Check
            </button>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Engine Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engine Status</p>
                <p className={`text-2xl font-bold ${getStatusColor(health?.engine.status || 'unknown')}`}>
                  {health?.engine.status === 'running' ? 'Running' : 'Stopped'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleEngine(health?.engine.status !== 'running')}
                  className={`p-2 rounded-full ${
                    health?.engine.status === 'running' 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {health?.engine.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleMaintenanceMode}
                  className={`p-2 rounded-full ${
                    health?.engine.maintenanceMode
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Uptime: {formatUptime(health?.engine.uptime || 0)}
            </p>
            {health?.engine.maintenanceMode && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Maintenance Mode Active
              </p>
            )}
          </div>

          {/* Success Rate */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {health?.engine.successRate?.toFixed(1) || 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {health?.engine.totalPosts || 0} total posts
            </p>
          </div>

          {/* System Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Alerts</p>
                <p className={`text-2xl font-bold ${
                  (health?.systemAlerts.critical || 0) > 0 ? 'text-red-600' : 
                  (health?.systemAlerts.unresolved || 0) > 0 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {health?.systemAlerts.unresolved || 0}
                </p>
              </div>
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {health?.systemAlerts.critical || 0} critical alerts
            </p>
          </div>

          {/* Queue Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Queue Status</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(health?.retryQueue || 0) + (health?.scheduledPosts || 0)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {health?.retryQueue || 0} retries, {health?.scheduledPosts || 0} scheduled
            </p>
          </div>
        </div>

        {/* Alerts Panel */}
        {showAlerts && health?.systemAlerts.recentAlerts && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {health.systemAlerts.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{alert.message}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(alert.timestamp).toLocaleString()}
                        {alert.platform && ` • ${alert.platform}`}
                      </p>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {health?.platforms.map((platform) => (
            <div key={platform.platform} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                  {platform.platform}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  platform.status === 'healthy' ? 'bg-green-100 text-green-800' :
                  platform.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {platform.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Auth Status</span>
                  <span className={`font-medium ${
                    platform.authStatus === 'valid' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {platform.authStatus}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Error Count</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {platform.errorCount}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Rate Limit</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {platform.rateLimit.remaining}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Last Checked</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(platform.lastChecked).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        {health?.performance && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {health.engine.averageResponseTime}ms
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</p>
              </div>
              {health.performance.memoryUsage && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(health.performance.memoryUsage.heapUsed / 1024 / 1024)}MB
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {formatUptime(health.engine.uptime)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">System Uptime</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
        </div>
      </div>
    </div>
  )
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
                      <button
                        onClick={() => toggleEngine(false)}
                        className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Pause className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleEngine(true)}
                        className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      >
                        <Play className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Uptime: {formatUptime(health.engine.uptime)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Scheduled Posts
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {health.scheduledPosts}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <RefreshCw className="w-8 h-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Retry Queue
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {health.retryQueue}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Healthy Platforms
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {health.platforms.filter(p => p.status === 'healthy').length}/{health.platforms.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Health */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Platform Health Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {health.platforms.map((platform) => (
                  <div
                    key={platform.platform}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                        {platform.platform}
                      </h4>
                      {getStatusIcon(platform.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`capitalize ${getStatusColor(platform.status)}`}>
                          {platform.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Auth:</span>
                        <span className={getStatusColor(platform.authStatus)}>
                          {platform.authStatus}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Errors:</span>
                        <span className={platform.errorCount > 0 ? 'text-red-500' : 'text-green-500'}>
                          {platform.errorCount}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Rate Limit:</span>
                        <span className="text-gray-900 dark:text-white">
                          {platform.rateLimit.remaining}
                        </span>
                      </div>
                      
                      {platform.lastSuccessfulPost && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Last Post:</span>
                          <span className="text-gray-900 dark:text-white">
                            {new Date(platform.lastSuccessfulPost).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                System Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Monitoring</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Continuous health checks every 5 minutes
                  </p>
                </div>
                
                <div className="text-center">
                  <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Auto-Recovery</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Intelligent retry with exponential backoff
                  </p>
                </div>
                
                <div className="text-center">
                  <Globe className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Multi-Platform</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {health.platforms.length} platforms integrated and monitored
                  </p>
                </div>
              </div>
              
              {lastUpdated && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
