'use client'

import React from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import SystemDashboard from '@/components/SystemDashboard'

export default function HealthPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Health</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor the health and performance of your ClickSprout system.
          </p>
        </div>
        
        <SystemDashboard />
      </div>
    </DashboardLayout>
  )
}
