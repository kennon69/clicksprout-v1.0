#!/usr/bin/env node

/**
 * ClickSprout Development Test Runner
 * 
 * Comprehensive testing for ClickSprout's core features:
 * - AI Content Generation
 * - Settings Management  
 * - Database Integration
 * - API Health Checks
 */

const { test: testAI, runComprehensiveTest } = require('./test-ai-content.js')

const testDatabaseConnection = async () => {
  console.log('🗄️  Testing Database Connection...')
  
  try {
    const response = await fetch('http://localhost:3000/api/content', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Database API accessible')
      console.log(`📊 Found ${data.length || 0} content records`)
      return true
    } else {
      console.log('❌ Database API error:', data.error)
      return false
    }
  } catch (error) {
    console.log('❌ Database connection failed:', error.message)
    return false
  }
}

const testAPIHealth = async () => {
  console.log('🔍 Testing API Health...')
  
  const endpoints = [
    '/api/content',
    '/api/campaigns', 
    '/api/scheduler',
    '/api/ai-content-generator'
  ]
  
  let healthyEndpoints = 0
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`)
      if (response.status < 500) {
        console.log(`✅ ${endpoint} - Accessible`)
        healthyEndpoints++
      } else {
        console.log(`⚠️  ${endpoint} - Server Error (${response.status})`)
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Connection Failed`)
    }
  }
  
  console.log(`📈 API Health: ${healthyEndpoints}/${endpoints.length} endpoints accessible`)
  return healthyEndpoints === endpoints.length
}

const runFullTestSuite = async () => {
  console.log('🧪 ClickSprout Development Test Suite')
  console.log('═'.repeat(50))
  
  const results = {
    api: false,
    database: false,
    ai: false
  }
  
  // Test API Health
  console.log('\n1️⃣ API Health Check')
  results.api = await testAPIHealth()
  
  // Test Database
  console.log('\n2️⃣ Database Integration')
  results.database = await testDatabaseConnection()
  
  // Test AI Content Generation
  console.log('\n3️⃣ AI Content Generation')
  try {
    await testAI()
    results.ai = true
    console.log('✅ AI Content Generation test passed')
  } catch (error) {
    console.log('❌ AI Content Generation test failed:', error.message)
    results.ai = false
  }
  
  // Summary
  console.log('\n📊 Test Results Summary')
  console.log('═'.repeat(50))
  console.log(`🔧 API Health: ${results.api ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🗄️  Database: ${results.database ? '✅ PASS' : '❌ FAIL'}`) 
  console.log(`🤖 AI Generation: ${results.ai ? '✅ PASS' : '❌ FAIL'}`)
  
  const totalPassed = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 Overall Score: ${totalPassed}/${totalTests} (${Math.round(totalPassed/totalTests*100)}%)`)
  
  if (totalPassed === totalTests) {
    console.log('\n🎉 All systems operational! ClickSprout is ready for development.')
  } else {
    console.log('\n⚠️  Some systems need attention. Check the failing components.')
    console.log('\n💡 Quick fixes:')
    if (!results.api) console.log('   - Start the Next.js dev server: npm run dev')
    if (!results.database) console.log('   - Check database configuration in .env.local')
    if (!results.ai) console.log('   - Verify OpenAI API key in .env.local')
  }
}

// Run based on command line arguments
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('ClickSprout Development Test Runner')
    console.log('Usage:')
    console.log('  node dev-test.js                    # Run full test suite')
    console.log('  node dev-test.js --ai-only          # Test AI only')
    console.log('  node dev-test.js --db-only          # Test database only')
    console.log('  node dev-test.js --api-only         # Test API health only')
  } else if (args.includes('--ai-only')) {
    testAI()
  } else if (args.includes('--db-only')) {
    testDatabaseConnection()
  } else if (args.includes('--api-only')) {
    testAPIHealth()
  } else {
    runFullTestSuite()
  }
}

module.exports = {
  testDatabaseConnection,
  testAPIHealth,
  runFullTestSuite
}
