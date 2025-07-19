// Test the AI Content Generator API
// Run this with: node test-ai-generator.js

const testAPI = async () => {
  const API_URL = 'http://localhost:3000/api/ai-content-generator'
  
  console.log('🧪 Testing AI Content Generator API...\n')

  // Test 1: Basic content generation
  console.log('📝 Test 1: Basic content generation')
  try {
    const response1 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Summer Glow Serum',
        description: 'A lightweight hydrating facial serum with vitamin C and SPF 30'
      })
    })

    const result1 = await response1.json()
    console.log('✅ Response:', result1)
    console.log('📊 Generated content length:', result1.result?.length || 0)
    console.log('🏷️ Hashtags found:', result1.hashtags?.length || 0)
    console.log('💡 Suggestions provided:', result1.suggestions?.length || 0)
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 2: Different platform and tone
  console.log('📝 Test 2: LinkedIn professional tone')
  try {
    const response2 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Project Management Tool',
        description: 'Advanced collaboration software for remote teams',
        platform: 'linkedin',
        tone: 'professional',
        length: 'long'
      })
    })

    const result2 = await response2.json()
    console.log('✅ Response:', result2)
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 3: Twitter short format
  console.log('📝 Test 3: Twitter short format')
  try {
    const response3 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Smart Watch Pro',
        description: 'Fitness tracker with heart rate monitoring and GPS',
        platform: 'twitter',
        tone: 'playful',
        length: 'short'
      })
    })

    const result3 = await response3.json()
    console.log('✅ Response:', result3)
    console.log('📏 Character count:', result3.result?.length || 0)
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 4: GET endpoint
  console.log('📝 Test 4: GET endpoint info')
  try {
    const response4 = await fetch(API_URL, {
      method: 'GET'
    })

    const result4 = await response4.json()
    console.log('✅ API Info:', result4)
  } catch (error) {
    console.error('❌ Test 4 failed:', error.message)
  }

  console.log('\n🎉 Testing complete!')
}

// Check if we're in Node.js environment
if (typeof fetch === 'undefined') {
  console.log('❌ This test requires Node.js 18+ or a fetch polyfill')
  console.log('💡 Install node-fetch: npm install node-fetch')
  console.log('💡 Or run in browser console on localhost:3000')
} else {
  testAPI()
}

// Browser version (paste this in browser console):
/*
(async () => {
  const response = await fetch('/api/ai-content-generator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Summer Glow Serum',
      description: 'A lightweight hydrating facial serum with vitamin C and SPF 30'
    })
  })
  const result = await response.json()
  console.log('🎯 AI Generated Content:', result)
})()
*/
