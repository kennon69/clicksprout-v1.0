// AI Content Generator Test Client
// This demonstrates how to use the new /api/ai-content-generator endpoint

async function testAIContentGenerator() {
  const testData = {
    title: "Summer Glow Serum",
    description: "A lightweight hydrating facial serum with vitamin C and SPF 30",
    type: "social",
    platform: "instagram", 
    tone: "casual",
    length: "medium"
  }

  try {
    console.log('🚀 Testing AI Content Generator...')
    console.log('📝 Input:', testData)
    
    const response = await fetch('/api/ai-content-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    
    console.log('✅ Response:', result)
    console.log('📄 Generated Content:')
    console.log(result.result)
    
    if (result.hashtags) {
      console.log('🏷️ Hashtags:', result.hashtags.join(' '))
    }
    
    if (result.suggestions) {
      console.log('💡 Alternative Headlines:')
      result.suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`)
      })
    }
    
    return result
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Example usage for different platforms
const examples = {
  instagram: {
    title: "Summer Glow Serum",
    description: "A lightweight hydrating facial serum with vitamin C and SPF 30",
    type: "social",
    platform: "instagram",
    tone: "casual",
    length: "medium"
  },
  
  linkedin: {
    title: "Professional Development Course",
    description: "Comprehensive online course for career advancement and skill building",
    type: "marketing",
    platform: "linkedin",
    tone: "professional", 
    length: "long"
  },
  
  twitter: {
    title: "Productivity App",
    description: "Simple task management app that helps you stay organized",
    type: "product",
    platform: "twitter",
    tone: "playful",
    length: "short"
  },
  
  pinterest: {
    title: "Artisan Coffee Beans",
    description: "Premium single-origin coffee beans roasted to perfection",
    type: "social",
    platform: "pinterest", 
    tone: "inspiring",
    length: "medium"
  }
}

// Export for use in components
if (typeof module !== 'undefined') {
  module.exports = { testAIContentGenerator, examples }
}

console.log('🎯 AI Content Generator Test Client Ready!')
console.log('📚 Use testAIContentGenerator() to test the API')
console.log('💡 Check the examples object for different platform configurations')
