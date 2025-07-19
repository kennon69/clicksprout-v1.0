// Test platform API integration
const readline = require('readline')
const fs = require('fs')
const path = require('path')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🚀 ClickSprout Platform API Testing Suite')
console.log('=======================================\n')

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!')
  console.log('Please copy .env.local.example to .env.local and add your API keys.\n')
  process.exit(1)
}

// Read environment variables
require('dotenv').config({ path: envPath })

const testPlatformConnection = async (platform) => {
  console.log(`\n🔍 Testing ${platform} connection...`)
  
  const apiKeys = {
    reddit: {
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD
    },
    medium: {
      accessToken: process.env.MEDIUM_ACCESS_TOKEN
    },
    twitter: {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
      bearerToken: process.env.TWITTER_BEARER_TOKEN
    },
    pinterest: {
      accessToken: process.env.PINTEREST_ACCESS_TOKEN
    },
    facebook: {
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
      pageId: process.env.FACEBOOK_PAGE_ID
    }
  }

  const keys = apiKeys[platform]
  if (!keys) {
    console.log(`❌ ${platform} not supported for testing`)
    return
  }

  // Check if required keys are present
  const missingKeys = Object.entries(keys).filter(([key, value]) => !value)
  if (missingKeys.length > 0) {
    console.log(`❌ Missing ${platform} API keys:`)
    missingKeys.forEach(([key]) => console.log(`   - ${key}`))
    return
  }

  console.log(`✅ ${platform} API keys found`)
  
  // Test API connection
  try {
    const response = await fetch(`http://localhost:3000/api/test-platform?platform=${platform}`)
    const result = await response.json()
    
    if (result.authenticated) {
      console.log(`✅ ${platform} authentication successful`)
      
      // Ask if user wants to test posting
      const testPost = await new Promise((resolve) => {
        rl.question(`Test posting to ${platform}? (y/n): `, (answer) => {
          resolve(answer.toLowerCase() === 'y')
        })
      })
      
      if (testPost) {
        console.log(`📝 Creating test post on ${platform}...`)
        const postResponse = await fetch('http://localhost:3000/api/test-platform', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            platform: platform,
            testPost: true
          })
        })
        
        const postResult = await postResponse.json()
        
        if (postResult.success) {
          console.log(`✅ Test post successful!`)
          if (postResult.url) {
            console.log(`🔗 Post URL: ${postResult.url}`)
          }
        } else {
          console.log(`❌ Test post failed: ${postResult.error}`)
        }
      }
    } else {
      console.log(`❌ ${platform} authentication failed: ${result.error}`)
    }
  } catch (error) {
    console.log(`❌ Error testing ${platform}: ${error.message}`)
  }
}

const runTests = async () => {
  console.log('Starting platform tests...\n')
  
  const platforms = ['reddit', 'medium', 'twitter', 'pinterest', 'facebook']
  
  for (const platform of platforms) {
    await testPlatformConnection(platform)
  }
  
  console.log('\n🎉 Platform testing complete!')
  console.log('\n📊 Test Summary:')
  console.log('- Check the console output above for detailed results')
  console.log('- Fix any authentication issues before using the scheduler')
  console.log('- Test posts will be visible on your connected platforms')
  
  rl.close()
}

const main = async () => {
  console.log('This script will test your platform API connections.')
  console.log('Make sure your Next.js development server is running (npm run dev)\n')
  
  const proceed = await new Promise((resolve) => {
    rl.question('Start testing? (y/n): ', (answer) => {
      resolve(answer.toLowerCase() === 'y')
    })
  })
  
  if (proceed) {
    await runTests()
  } else {
    console.log('Testing cancelled.')
    rl.close()
  }
}

main().catch(console.error)
