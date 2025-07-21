/**
 * 🧪 Medium Integration Test Page
 * Tests Puppeteer-based Medium posting functionality
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Send } from 'lucide-react'

export default function MediumTestPage() {
  const [title, setTitle] = useState('ClickSprout - Revolutionary Product Marketing Tool')
  const [content, setContent] = useState(`Transform any product URL into viral marketing content with AI-powered automation.

ClickSprout uses advanced artificial intelligence to:
• Extract product details automatically
• Generate engaging titles and descriptions
• Create platform-optimized content
• Schedule posts across multiple platforms
• Track performance and analytics

Perfect for affiliate marketers, e-commerce stores, and content creators looking to amplify their product promotion efforts.

Try ClickSprout today and watch your product engagement soar!`)
  const [tags, setTags] = useState('marketing, AI, automation, products, affiliate')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [authStatus, setAuthStatus] = useState<any>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/medium', {
        method: 'GET'
      })
      
      const data = await response.json()
      setAuthStatus(data)
    } catch (error) {
      setAuthStatus({
        success: false,
        error: 'Connection test failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const publishToMedium = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      
      const response = await fetch('/api/medium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content,
          tags: tagsArray
        })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: 'Publishing failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            🔧 Medium Integration Test
          </h1>
          <p className="text-lg text-gray-600">
            Test Puppeteer-based Medium posting automation
          </p>
        </div>

        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Connection Test
            </CardTitle>
            <CardDescription>
              Test Medium credentials and automation setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Test Medium Connection
                </>
              )}
            </Button>
            
            {authStatus && (
              <div className={`p-4 rounded-lg ${authStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {authStatus.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {authStatus.success ? 'Connection Successful' : 'Connection Failed'}
                  </span>
                </div>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(authStatus, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Article Publishing Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Article Publishing Test
            </CardTitle>
            <CardDescription>
              Test publishing a complete article to Medium
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter article content..."
                rows={10}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="marketing, AI, automation..."
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={publishToMedium} 
              disabled={isLoading || !title || !content}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Publishing to Medium...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publish to Medium
                </>
              )}
            </Button>
            
            {result && (
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {result.success ? 'Published Successfully' : 'Publishing Failed'}
                  </span>
                </div>
                {result.url && (
                  <div className="mb-2">
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Published Article →
                    </a>
                  </div>
                )}
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>1.</strong> Make sure Puppeteer is installed: <code>npm install puppeteer</code>
            </p>
            <p className="text-sm text-gray-600">
              <strong>2.</strong> Configure Medium credentials in <code>.env.local</code>:
            </p>
            <pre className="bg-gray-100 p-2 rounded text-xs">
{`MEDIUM_USERNAME=your_medium_email
MEDIUM_PASSWORD=your_medium_password`}
            </pre>
            <p className="text-sm text-gray-600">
              <strong>3.</strong> Test connection first, then try publishing an article
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
