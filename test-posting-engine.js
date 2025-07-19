// ClickSprout Posting Engine Comprehensive Test Suite
// This script tests all aspects of the intelligent posting engine

const testPostingEngine = async () => {
  console.log('🧪 Starting ClickSprout Posting Engine Test Suite...')
  
  const baseURL = 'http://localhost:3000'
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  }

  // Test helper function
  const runTest = async (testName, testFn) => {
    try {
      console.log(`\n🔬 Running: ${testName}`)
      await testFn()
      console.log(`✅ PASSED: ${testName}`)
      results.passed++
      results.tests.push({ name: testName, status: 'PASSED' })
    } catch (error) {
      console.log(`❌ FAILED: ${testName}`)
      console.error(error.message)
      results.failed++
      results.tests.push({ name: testName, status: 'FAILED', error: error.message })
    }
  }

  // Test 1: Engine Health Check
  await runTest('Engine Health Check', async () => {
    const response = await fetch(`${baseURL}/api/posting-engine?action=health`)
    const data = await response.json()
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (!data.success) throw new Error('Health check failed')
    if (!data.data.engine) throw new Error('Engine data missing')
    
    console.log(`   Engine Status: ${data.data.engine.status}`)
    console.log(`   Version: ${data.data.engine.version}`)
    console.log(`   Uptime: ${data.data.engine.uptime}s`)
  })

  // Test 2: Start Engine
  await runTest('Start Engine', async () => {
    const response = await fetch(`${baseURL}/api/posting-engine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' })
    })
    const data = await response.json()
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (!data.success) throw new Error('Failed to start engine')
    
    console.log(`   Message: ${data.message}`)
  })

  // Test 3: Platform Health Check
  await runTest('Platform Health Check', async () => {
    const response = await fetch(`${baseURL}/api/posting-engine?action=health`)
    const data = await response.json()
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (!data.data.platforms) throw new Error('Platform data missing')
    
    const platforms = data.data.platforms
    console.log(`   Platforms monitored: ${platforms.length}`)
    
    platforms.forEach(platform => {
      console.log(`   ${platform.platform}: ${platform.status} (${platform.authStatus})`)
    })
  })

  // Test 4: Post Scheduling
  await runTest('Post Scheduling', async () => {
    const testPost = {
      id: `test_${Date.now()}`,
      title: 'Test Post from ClickSprout',
      content: 'This is a test post to verify the posting engine works correctly.',
      images: [],
      hashtags: ['#test', '#clicksprout', '#automation'],
      platform: 'reddit',
      scheduledTime: new Date(Date.now() + 5000).toISOString(), // 5 seconds from now
      status: 'scheduled',
      createdAt: new Date().toISOString()
    }

    const response = await fetch(`${baseURL}/api/posting-engine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'schedule', postData: testPost })
    })
    const data = await response.json()
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (!data.success) throw new Error(`Scheduling failed: ${data.message}`)
    
    console.log(`   Post scheduled: ${testPost.id}`)
    console.log(`   Scheduled for: ${testPost.scheduledTime}`)
  })

  // Test 5: System Alerts
  await runTest('System Alerts', async () => {
    const response = await fetch(`${baseURL}/api/posting-engine?action=alerts`)
    const data = await response.json()
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (!data.success) throw new Error('Failed to fetch alerts')
    
    const alerts = data.data || []
    console.log(`   Total alerts: ${alerts.length}`)
    
    if (alerts.length > 0) {
      const latestAlert = alerts[0]
      console.log(`   Latest alert: ${latestAlert.message} (${latestAlert.severity})`)
    }
  })

  // Test 6: Performance Metrics
  await runTest('Performance Metrics', async () => {
    const response = await fetch(`${baseURL}/api/posting-engine?action=health`)
    const data = await response.json()
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const engine = data.data.engine
    console.log(`   Success Rate: ${engine.successRate}%`)
    console.log(`   Total Posts: ${engine.totalPosts}`)
    console.log(`   Average Response Time: ${engine.averageResponseTime}ms`)
    console.log(`   Maintenance Mode: ${engine.maintenanceMode ? 'ON' : 'OFF'}`)
  })

  // Test 7: Maintenance Mode Toggle
  await runTest('Maintenance Mode Toggle', async () => {
    // Enable maintenance mode
    const enableResponse = await fetch(`${baseURL}/api/posting-engine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'maintenance', enable: true })
    })
    const enableData = await enableResponse.json()
    
    if (!enableResponse.ok) throw new Error(`HTTP ${enableResponse.status}`)
    if (!enableData.success) throw new Error('Failed to enable maintenance mode')
    
    // Disable maintenance mode
    const disableResponse = await fetch(`${baseURL}/api/posting-engine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'maintenance', enable: false })
    })
    const disableData = await disableResponse.json()
    
    if (!disableResponse.ok) throw new Error(`HTTP ${disableResponse.status}`)
    if (!disableData.success) throw new Error('Failed to disable maintenance mode')
    
    console.log(`   Maintenance mode toggled successfully`)
  })

  // Test 8: Configuration Management
  await runTest('Configuration Management', async () => {
    const response = await fetch(`${baseURL}/api/posting-engine?action=config`)
    const data = await response.json()
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (!data.success) throw new Error('Failed to fetch configuration')
    
    const config = data.data
    console.log(`   Email notifications: ${config.email.enabled ? 'ON' : 'OFF'}`)
    console.log(`   Slack notifications: ${config.slack.enabled ? 'ON' : 'OFF'}`)
    console.log(`   SMS notifications: ${config.sms.enabled ? 'ON' : 'OFF'}`)
  })

  // Test 9: Platform API Validation
  await runTest('Platform API Validation', async () => {
    const response = await fetch(`${baseURL}/api/test-platform`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'reddit' })
    })
    const data = await response.json()
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    console.log(`   Reddit API test: ${data.success ? 'PASSED' : 'FAILED'}`)
    if (!data.success) {
      console.log(`   Error: ${data.error}`)
    }
  })

  // Test 10: Complete Health Check
  await runTest('Complete Health Check', async () => {
    const response = await fetch(`${baseURL}/api/posting-engine?action=healthcheck`)
    const data = await response.json()
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (!data.success) throw new Error('Health check failed')
    
    const healthCheck = data.data
    console.log(`   Overall Health: ${healthCheck.overall}`)
    console.log(`   Components checked: ${healthCheck.details.length}`)
    
    healthCheck.details.forEach(detail => {
      console.log(`   ${detail.component}: ${detail.status} - ${detail.message}`)
    })
  })

  // Test Summary
  console.log('\n' + '='.repeat(50))
  console.log('🏁 TEST SUITE COMPLETE')
  console.log('='.repeat(50))
  console.log(`✅ Tests Passed: ${results.passed}`)
  console.log(`❌ Tests Failed: ${results.failed}`)
  console.log(`📊 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`)
  
  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:')
    results.tests.filter(t => t.status === 'FAILED').forEach(test => {
      console.log(`   - ${test.name}: ${test.error}`)
    })
  }

  console.log('\n🎯 RECOMMENDATIONS:')
  if (results.failed === 0) {
    console.log('✅ All tests passed! Your posting engine is ready for production.')
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.')
    console.log('🔧 Common fixes:')
    console.log('   - Check if the Next.js server is running on port 3000')
    console.log('   - Verify all API endpoints are working')
    console.log('   - Check platform API credentials')
    console.log('   - Ensure database connection is working')
  }

  console.log('\n🚀 Next Steps:')
  console.log('1. Set up platform API credentials in .env.local')
  console.log('2. Test with real platform accounts')
  console.log('3. Monitor system alerts and performance')
  console.log('4. Configure notification settings')
  console.log('5. Schedule real posts and monitor success rates')
  
  return results
}

// Run the test suite
testPostingEngine().catch(console.error)
