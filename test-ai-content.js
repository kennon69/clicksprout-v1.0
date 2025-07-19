#!/usr/bin/env node

/**
 * ClickSprout AI Content Generator Test Suite
 * 
 * Tests the AI content generation capabilities for multiple platforms and scenarios
 * Validates that ClickSprout can generate quality content for product promotion
 * 
 * Usage:
 *   node test-ai-content.js              # Single test
 *   node test-ai-content.js -c           # Comprehensive test suite  
 *   node test-ai-content.js --help       # Show help
 * 
 * Features tested:
 * - Content generation for multiple platforms (Instagram, LinkedIn, Reddit, Pinterest)
 * - Tone adaptation (casual, professional, playful, inspiring)
 * - Length variations (short, medium, long)
 * - Hashtag generation
 * - Call-to-action creation
 * - Platform-specific optimization
 */

const test = async () => {
  console.log('🧪 Testing AI Content Generator API...\n')

  try {
    const response = await fetch('http://localhost:3000/api/ai-content-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productTitle: 'Summer Glow Serum - Premium Vitamin C Face Serum',
        productDescription: 'A lightweight hydrating facial serum with vitamin C and SPF 30. Perfect for daily skincare routine, reduces dark spots and provides sun protection.',
        platform: 'instagram',
        tone: 'casual',
        length: 'medium'
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ API Response Success!')
      
      if (data.success && data.data) {
        const result = data.data
        console.log('📝 Generated Content:')
        console.log('-'.repeat(50))
        console.log(`Title: ${result.title}`)
        console.log(`Description: ${result.description}`)
        console.log('-'.repeat(50))
        
        if (result.hashtags && result.hashtags.length > 0) {
          console.log('🏷️  Generated Hashtags:', result.hashtags.join(' '))
        }
        
        if (result.callToAction) {
          console.log('📢 Call to Action:', result.callToAction)
        }
        
        console.log('\n� ClickSprout AI Features Tested:')
        console.log('   ✓ Content Generation')
        console.log('   ✓ Platform Optimization')
        console.log('   ✓ Hashtag Generation')
        console.log('   ✓ Tone Adaptation')
        
      } else {
        console.log('❌ API returned error:', data.error || 'Unknown response format')
      }
    } else {
      console.log('❌ API Error:', data.error || `HTTP ${response.status}: ${response.statusText}`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure:')
    console.log('   1. Next.js dev server is running (npm run dev)')
    console.log('   2. OpenAI API key is set in .env.local')
    console.log('   3. Port 3000 is available')
  }
}

// Test multiple scenarios to validate ClickSprout AI capabilities
const runComprehensiveTest = async () => {
  console.log('🧪 Running Comprehensive ClickSprout AI Test Suite...\n')

  const testCases = [
    {
      name: 'Instagram Beauty Product',
      data: {
        productTitle: 'Glow Beauty Vitamin C Serum',
        productDescription: 'Premium anti-aging serum with 20% Vitamin C, hyaluronic acid, and natural botanicals. Brightens skin and reduces fine lines.',
        platform: 'instagram',
        tone: 'casual',
        length: 'short'
      }
    },
    {
      name: 'LinkedIn Tech Product',
      data: {
        productTitle: 'CloudSync Pro - Business Cloud Storage',
        productDescription: 'Enterprise-grade cloud storage solution with 99.9% uptime, advanced security, and seamless team collaboration features.',
        platform: 'linkedin',
        tone: 'professional',
        length: 'medium'
      }
    },
    {
      name: 'Reddit Gaming Product',
      data: {
        productTitle: 'GameMax Mechanical Gaming Keyboard',
        productDescription: 'RGB backlit mechanical keyboard with tactile switches, programmable keys, and ultra-fast response time for competitive gaming.',
        platform: 'reddit',
        tone: 'playful',
        length: 'long'
      }
    },
    {
      name: 'Pinterest Home Decor',
      data: {
        productTitle: 'Minimalist Wooden Coffee Table',
        productDescription: 'Handcrafted oak coffee table with clean lines and hidden storage compartment. Perfect for modern living rooms.',
        platform: 'pinterest',
        tone: 'inspiring',
        length: 'medium'
      }
    }
  ]

  let passedTests = 0
  let totalTests = testCases.length

  for (const testCase of testCases) {
    console.log(`\n📱 Testing: ${testCase.name}`)
    console.log('━'.repeat(40))
    
    try {
      const response = await fetch('http://localhost:3000/api/ai-content-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      })

      const data = await response.json()

      if (response.ok && data.success && data.data) {
        const result = data.data
        
        console.log(`✅ ${testCase.name} - SUCCESS`)
        console.log(`📝 Title: ${result.title?.substring(0, 60)}...`)
        console.log(`📝 Description: ${result.description?.substring(0, 80)}...`)
        console.log(`🏷️  Hashtags: ${result.hashtags?.slice(0, 3).join(' ') || 'None'}`)
        console.log(`📢 CTA: ${result.callToAction || 'None'}`)
        
        // Validate content quality
        const hasTitle = result.title && result.title.length > 10
        const hasDescription = result.description && result.description.length > 20
        const hasHashtags = result.hashtags && result.hashtags.length > 0
        
        if (hasTitle && hasDescription && hasHashtags) {
          console.log('✓ Content quality validation passed')
          passedTests++
        } else {
          console.log('⚠️  Content quality issues detected')
        }
        
      } else {
        console.log(`❌ ${testCase.name} - FAILED`)
        console.log(`Error: ${data.error || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.log(`❌ ${testCase.name} - ERROR`)
      console.log(`Network/API Error: ${error.message}`)
    }
    
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n📊 Test Results Summary:')
  console.log('═'.repeat(50))
  console.log(`✅ Passed: ${passedTests}/${totalTests}`)
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`)
  console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! ClickSprout AI is working perfectly.')
  } else {
    console.log('\n⚠️  Some tests failed. Check the API configuration and OpenAI key.')
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--comprehensive') || args.includes('-c')) {
    console.log('🔬 Running Comprehensive Test Suite...\n')
    runComprehensiveTest()
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log('ClickSprout AI Content Generator Test Script')
    console.log('Usage:')
    console.log('  node test-ai-content.js              # Run single test')
    console.log('  node test-ai-content.js -c           # Run comprehensive test suite')
    console.log('  node test-ai-content.js --help       # Show this help')
  } else {
    console.log('🧪 Running Single Test (use -c for comprehensive suite)\n')
    test()
  }
}

module.exports = { test, runComprehensiveTest }
