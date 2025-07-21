'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface ContentItem {
  id: string
  title: string
  url: string
  platforms: string[]
  scheduledTime?: string
  posted: boolean
  createdAt: string
  stats?: {
    views: number
    clicks: number
    shares: number
    conversions: number
  }
}

interface AnalyticsData {
  totalContent: number
  totalPosts: number
  totalViews: number
  totalClicks: number
  totalShares: number
  totalConversions: number
  conversionRate: number
  topPerformingContent: Array<{
    title: string
    platform: string
    engagement: number
    color: string
  }>
  topPerformingPlatforms: Array<{
    platform: string
    posts: number
    engagement: number
    color: string
  }>
  recentActivity: Array<{
    id: string
    type: 'content' | 'click' | 'share' | 'conversion'
    contentTitle: string
    platform: string
    timestamp: string
    value: number
  }>
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalContent: 0,
    totalPosts: 0,
    totalViews: 0,
    totalClicks: 0,
    totalShares: 0,
    totalConversions: 0,
    conversionRate: 0,
    topPerformingContent: [],
    topPerformingPlatforms: [],
    recentActivity: []
  })

  const [timeRange, setTimeRange] = useState('7d')
  const [contentItems, setContentItems] = useState<ContentItem[]>([])

  useEffect(() => {
    // Load content from localStorage
    const savedContent = localStorage.getItem('currentContent')
    if (savedContent) {
      const contentData: ContentItem[] = [JSON.parse(savedContent)]
      setContentItems(contentData)
      
      // Calculate analytics from real content data
      const analytics = calculateAnalytics(contentData)
      setAnalyticsData(analytics)
    }
  }, [timeRange])

  const calculateAnalytics = (campaignsData: Campaign[]): AnalyticsData => {
    if (campaignsData.length === 0) {
      return {
        totalCampaigns: 0,
        totalPosts: 0,
        totalViews: 0,
        totalClicks: 0,
        totalShares: 0,
        totalConversions: 0,
        conversionRate: 0,
        topPerformingCampaigns: [],
        topPerformingPlatforms: [],
        recentActivity: []
      }
    }

    const totalCampaigns = campaignsData.length
    const totalPosts = campaignsData.reduce((sum, campaign) => sum + (campaign.links.length * campaign.platforms.length), 0)
    const totalViews = campaignsData.reduce((sum, campaign) => sum + (campaign.stats?.views || 0), 0)
    const totalClicks = campaignsData.reduce((sum, campaign) => sum + (campaign.stats?.clicks || 0), 0)
    const totalShares = campaignsData.reduce((sum, campaign) => sum + (campaign.stats?.shares || 0), 0)
    const totalConversions = campaignsData.reduce((sum, campaign) => sum + (campaign.stats?.conversions || 0), 0)
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100) : 0

    // Create top performing campaigns
    const topPerformingCampaigns = campaignsData
      .filter(campaign => campaign.stats)
      .sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
      .slice(0, 4)
      .map((campaign, index) => ({
        name: campaign.name,
        platform: campaign.platforms[0] || 'Multiple',
        engagement: Math.round(((campaign.stats?.clicks || 0) / (campaign.stats?.views || 1)) * 100),
        color: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'][index]
      }))

    // Create top performing platforms
    const platformStats = new Map<string, { posts: number; views: number; clicks: number }>()
    
    campaignsData.forEach(campaign => {
      campaign.platforms.forEach(platform => {
        const current = platformStats.get(platform) || { posts: 0, views: 0, clicks: 0 }
        platformStats.set(platform, {
          posts: current.posts + campaign.links.length,
          views: current.views + (campaign.stats?.views || 0),
          clicks: current.clicks + (campaign.stats?.clicks || 0)
        })
      })
    })

    const topPerformingPlatforms = Array.from(platformStats.entries())
      .sort((a, b) => b[1].views - a[1].views)
      .slice(0, 5)
      .map(([platform, stats], index) => ({
        platform,
        posts: stats.posts,
        engagement: Math.round((stats.clicks / (stats.views || 1)) * 100),
        color: ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'][index]
      }))

    // Create recent activity from campaigns
    const recentActivity = campaignsData
      .flatMap(campaign => [
        {
          id: `${campaign.id}-campaign`,
          type: 'campaign' as const,
          campaignName: campaign.name,
          platform: campaign.platforms[0] || 'Multiple',
          timestamp: new Date(campaign.createdAt).toLocaleString(),
          value: 1
        },
        ...(campaign.stats ? [
          {
            id: `${campaign.id}-clicks`,
            type: 'click' as const,
            campaignName: campaign.name,
            platform: campaign.platforms[0] || 'Multiple',
            timestamp: new Date(campaign.createdAt).toLocaleString(),
            value: campaign.stats.clicks
          },
          {
            id: `${campaign.id}-shares`,
            type: 'share' as const,
            campaignName: campaign.name,
            platform: campaign.platforms[0] || 'Multiple',
            timestamp: new Date(campaign.createdAt).toLocaleString(),
            value: campaign.stats.shares
          },
          {
            id: `${campaign.id}-conversions`,
            type: 'conversion' as const,
            campaignName: campaign.name,
            platform: campaign.platforms[0] || 'Multiple',
            timestamp: new Date(campaign.createdAt).toLocaleString(),
            value: campaign.stats.conversions
          }
        ] : [])
      ])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return {
      totalCampaigns,
      totalPosts,
      totalViews,
      totalClicks,
      totalShares,
      totalConversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      topPerformingCampaigns,
      topPerformingPlatforms,
      recentActivity
    }
  }

  const StatCard = ({ title, value, subtitle, trend, icon, color }: {
    title: string
    value: string | number
    subtitle: string
    trend?: number
    icon: React.ReactNode
    color: string
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`text-sm font-medium px-2 py-1 rounded-full ${
            trend > 0 ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900' 
                      : trend < 0 ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900'
                      : 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
      <p className="text-gray-600 dark:text-gray-300">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    </div>
  )

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'campaign':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      case 'click':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'share':
        return <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
      case 'conversion':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
    }
  }

  if (campaigns.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="max-w-7xl mx-auto text-center py-16">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">No Analytics Data</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Create some campaigns to start tracking your performance metrics</p>
            <button 
              onClick={() => window.location.href = '/campaigns'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Create Your First Campaign
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Track your content performance and engagement metrics</p>
            </div>
            <div className="flex space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Export Report
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Posts"
              value={analyticsData.totalPosts}
              subtitle="Published this period"
              trend={15}
              color="bg-blue-500"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            
            <StatCard
              title="Total Views"
              value={analyticsData.totalViews.toLocaleString()}
              subtitle="Across all platforms"
              trend={23}
              color="bg-green-500"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
            />
            
            <StatCard
              title="Total Clicks"
              value={analyticsData.totalClicks.toLocaleString()}
              subtitle="Link clicks"
              trend={18}
              color="bg-purple-500"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
            />
            
            <StatCard
              title="Conversion Rate"
              value={`${analyticsData.conversionRate}%`}
              subtitle="Clicks to sales"
              trend={12}
              color="bg-orange-500"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Platform Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Platform Performance</h3>
              <div className="space-y-4">
                {analyticsData.topPerformingPlatforms.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 ${platform.color} rounded-full mr-3`}></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{platform.platform}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{platform.posts} posts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{platform.engagement}%</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {analyticsData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      {getActivityIcon(activity.type)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {activity.type} on {activity.platform}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {activity.type === 'campaign' ? '1 campaign' : `${activity.value} ${activity.type}${activity.value !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mock Chart 1 */}
              <div>
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">Views Over Time</h4>
                <div className="h-48 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300">Interactive chart placeholder</p>
                  </div>
                </div>
              </div>

              {/* Mock Chart 2 */}
              <div>
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">Clicks vs Conversions</h4>
                <div className="h-48 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300">Interactive chart placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">🔥 Best Performing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pinterest posts get 3x more engagement than other platforms</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">⏰ Optimal Timing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Posts published at 2-4 PM get highest click-through rates</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">💡 Recommendation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Include more visual content to boost engagement by 45%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
