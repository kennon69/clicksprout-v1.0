// ClickSprout Continuous Monitoring Script
// This script continuously monitors the posting engine and alerts on issues

const fs = require('fs')
const path = require('path')

class ClickSproutMonitor {
  constructor() {
    this.baseURL = 'http://localhost:3000'
    this.isRunning = false
    this.monitorInterval = null
    this.alertThresholds = {
      successRate: 95, // Alert if success rate drops below 95%
      responseTime: 5000, // Alert if response time exceeds 5 seconds
      errorCount: 10, // Alert if error count exceeds 10
      queueSize: 50, // Alert if queue size exceeds 50
      memoryUsage: 512 * 1024 * 1024, // Alert if memory usage exceeds 512MB
      uptime: 3600 // Alert if uptime is less than 1 hour (system restart)
    }
    this.lastAlerts = new Map()
    this.logFile = path.join(__dirname, 'monitoring-log.txt')
  }

  log(message) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}\n`
    console.log(logEntry.trim())
    
    try {
      fs.appendFileSync(this.logFile, logEntry)
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  async fetchSystemHealth() {
    try {
      const response = await fetch(`${this.baseURL}/api/posting-engine?action=health`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      return data.success ? data.data : null
    } catch (error) {
      throw new Error(`Failed to fetch system health: ${error.message}`)
    }
  }

  async fetchHealthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/api/posting-engine?action=healthcheck`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      return data.success ? data.data : null
    } catch (error) {
      throw new Error(`Failed to fetch health check: ${error.message}`)
    }
  }

  async sendAlert(type, message, severity = 'medium') {
    const alertKey = `${type}_${message}`
    const now = Date.now()
    
    // Prevent duplicate alerts within 5 minutes
    if (this.lastAlerts.has(alertKey) && (now - this.lastAlerts.get(alertKey)) < 300000) {
      return
    }
    
    this.lastAlerts.set(alertKey, now)
    
    // Log the alert
    this.log(`🚨 ALERT [${severity.toUpperCase()}]: ${message}`)
    
    // Send notification to posting engine
    try {
      await fetch(`${this.baseURL}/api/posting-engine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-alert',
          type: 'warning',
          severity,
          message,
          details: `Monitor detected: ${type}`,
          source: 'ClickSprout Monitor'
        })
      })
    } catch (error) {
      this.log(`Failed to send alert to posting engine: ${error.message}`)
    }
  }

  async checkSystemHealth(health) {
    const issues = []
    
    // Check engine status
    if (health.engine.status !== 'running') {
      issues.push({
        type: 'engine_status',
        message: `Engine is ${health.engine.status}`,
        severity: 'critical'
      })
    }
    
    // Check success rate
    if (health.engine.successRate < this.alertThresholds.successRate) {
      issues.push({
        type: 'success_rate',
        message: `Success rate dropped to ${health.engine.successRate.toFixed(1)}%`,
        severity: 'high'
      })
    }
    
    // Check response time
    if (health.engine.averageResponseTime > this.alertThresholds.responseTime) {
      issues.push({
        type: 'response_time',
        message: `Average response time is ${health.engine.averageResponseTime}ms`,
        severity: 'medium'
      })
    }
    
    // Check queue size
    const totalQueue = health.retryQueue + health.scheduledPosts
    if (totalQueue > this.alertThresholds.queueSize) {
      issues.push({
        type: 'queue_size',
        message: `Queue size is ${totalQueue} (${health.retryQueue} retries, ${health.scheduledPosts} scheduled)`,
        severity: 'medium'
      })
    }
    
    // Check memory usage
    if (health.performance?.memoryUsage?.heapUsed > this.alertThresholds.memoryUsage) {
      const memoryMB = Math.round(health.performance.memoryUsage.heapUsed / 1024 / 1024)
      issues.push({
        type: 'memory_usage',
        message: `High memory usage: ${memoryMB}MB`,
        severity: 'medium'
      })
    }
    
    // Check critical alerts
    if (health.systemAlerts.critical > 0) {
      issues.push({
        type: 'critical_alerts',
        message: `${health.systemAlerts.critical} critical system alerts`,
        severity: 'critical'
      })
    }
    
    // Check platform health
    health.platforms.forEach(platform => {
      if (platform.status === 'down') {
        issues.push({
          type: 'platform_down',
          message: `${platform.platform} platform is down`,
          severity: 'high'
        })
      } else if (platform.errorCount > this.alertThresholds.errorCount) {
        issues.push({
          type: 'platform_errors',
          message: `${platform.platform} has ${platform.errorCount} errors`,
          severity: 'medium'
        })
      }
    })
    
    return issues
  }

  async performMonitoringCheck() {
    try {
      this.log('🔍 Performing monitoring check...')
      
      // Fetch system health
      const health = await this.fetchSystemHealth()
      if (!health) {
        await this.sendAlert('system_health', 'Unable to fetch system health', 'critical')
        return
      }
      
      // Check for issues
      const issues = await this.checkSystemHealth(health)
      
      if (issues.length === 0) {
        this.log('✅ System is healthy')
      } else {
        this.log(`⚠️  Found ${issues.length} issues`)
        
        // Send alerts for each issue
        for (const issue of issues) {
          await this.sendAlert(issue.type, issue.message, issue.severity)
        }
      }
      
      // Log current status
      this.log(`📊 Status: Engine ${health.engine.status}, ` +
               `Success Rate: ${health.engine.successRate.toFixed(1)}%, ` +
               `Queue: ${health.retryQueue + health.scheduledPosts}, ` +
               `Alerts: ${health.systemAlerts.unresolved}`)
      
      // Periodic health check
      const healthCheck = await this.fetchHealthCheck()
      if (healthCheck && healthCheck.overall !== 'healthy') {
        await this.sendAlert('health_check', 
          `System health check: ${healthCheck.overall}`, 
          healthCheck.overall === 'critical' ? 'critical' : 'high')
      }
      
    } catch (error) {
      this.log(`❌ Monitoring check failed: ${error.message}`)
      await this.sendAlert('monitor_error', error.message, 'high')
    }
  }

  async start(intervalMinutes = 5) {
    if (this.isRunning) {
      this.log('⚠️  Monitor is already running')
      return
    }
    
    this.log(`🚀 Starting ClickSprout Monitor (checking every ${intervalMinutes} minutes)`)
    this.isRunning = true
    
    // Initial check
    await this.performMonitoringCheck()
    
    // Set up periodic monitoring
    this.monitorInterval = setInterval(async () => {
      await this.performMonitoringCheck()
    }, intervalMinutes * 60 * 1000)
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.log('🛑 Received SIGINT, shutting down monitor...')
      this.stop()
      process.exit(0)
    })
    
    process.on('SIGTERM', () => {
      this.log('🛑 Received SIGTERM, shutting down monitor...')
      this.stop()
      process.exit(0)
    })
    
    this.log('✅ Monitor started successfully')
  }

  stop() {
    if (!this.isRunning) {
      this.log('⚠️  Monitor is not running')
      return
    }
    
    this.log('🛑 Stopping ClickSprout Monitor...')
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      this.monitorInterval = null
    }
    
    this.isRunning = false
    this.log('✅ Monitor stopped successfully')
  }

  async status() {
    try {
      const health = await this.fetchSystemHealth()
      if (!health) {
        console.log('❌ Unable to fetch system status')
        return
      }
      
      console.log('\n📊 CLICKSPROUT SYSTEM STATUS')
      console.log('='.repeat(40))
      console.log(`Engine Status: ${health.engine.status}`)
      console.log(`Version: ${health.engine.version}`)
      console.log(`Uptime: ${Math.floor(health.engine.uptime / 3600)}h ${Math.floor((health.engine.uptime % 3600) / 60)}m`)
      console.log(`Success Rate: ${health.engine.successRate.toFixed(1)}%`)
      console.log(`Total Posts: ${health.engine.totalPosts}`)
      console.log(`Response Time: ${health.engine.averageResponseTime}ms`)
      console.log(`Maintenance Mode: ${health.engine.maintenanceMode ? 'ON' : 'OFF'}`)
      console.log(`Queue Size: ${health.retryQueue + health.scheduledPosts}`)
      console.log(`System Alerts: ${health.systemAlerts.unresolved} (${health.systemAlerts.critical} critical)`)
      
      console.log('\nPlatform Status:')
      health.platforms.forEach(platform => {
        console.log(`  ${platform.platform}: ${platform.status} (errors: ${platform.errorCount})`)
      })
      
      if (health.systemAlerts.recentAlerts.length > 0) {
        console.log('\nRecent Alerts:')
        health.systemAlerts.recentAlerts.slice(0, 5).forEach(alert => {
          console.log(`  [${alert.severity}] ${alert.message}`)
        })
      }
      
    } catch (error) {
      console.log(`❌ Error fetching status: ${error.message}`)
    }
  }

  async generateReport() {
    try {
      const health = await this.fetchSystemHealth()
      const healthCheck = await this.fetchHealthCheck()
      
      const report = {
        timestamp: new Date().toISOString(),
        systemHealth: health,
        healthCheck: healthCheck,
        monitorStatus: {
          isRunning: this.isRunning,
          logFile: this.logFile,
          alertThresholds: this.alertThresholds
        }
      }
      
      const reportFile = path.join(__dirname, `monitoring-report-${Date.now()}.json`)
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
      
      this.log(`📄 Monitoring report generated: ${reportFile}`)
      return reportFile
    } catch (error) {
      this.log(`❌ Failed to generate report: ${error.message}`)
      throw error
    }
  }
}

// Command-line interface
const monitor = new ClickSproutMonitor()

if (require.main === module) {
  const command = process.argv[2]
  
  switch (command) {
    case 'start':
      const interval = parseInt(process.argv[3]) || 5
      monitor.start(interval)
      break
    
    case 'status':
      monitor.status()
      break
    
    case 'report':
      monitor.generateReport()
        .then(file => console.log(`Report generated: ${file}`))
        .catch(error => console.error('Failed to generate report:', error))
      break
    
    default:
      console.log('ClickSprout Monitor v1.0')
      console.log('Usage:')
      console.log('  node monitor.js start [interval_minutes]  - Start monitoring')
      console.log('  node monitor.js status                    - Show system status')
      console.log('  node monitor.js report                    - Generate report')
      console.log('\nExample:')
      console.log('  node monitor.js start 5    # Monitor every 5 minutes')
      break
  }
}

module.exports = ClickSproutMonitor
