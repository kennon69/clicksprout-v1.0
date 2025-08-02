'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  Zap, 
  BarChart3, 
  Share2, 
  Target,
  Sparkles,
  TrendingUp,
  Play,
  Star,
  Users,
  CheckCircle,
  Rocket,
  Brain,
  Eye,
  Heart,
  Lightbulb,
  MousePointer,
  BarChart2,
  Globe,
  DollarSign,
  Clock,
  Trophy,
  ChevronRight,
  ArrowUp,
  Flame,
  Megaphone,
  Layers,
  Wand2,
  Bot,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const testimonials = [
    {
      text: "ClickSprout is like having a marketing genius in my pocket. My conversion rates went from 2% to 12% overnight!",
      author: "Sarah Chen",
      role: "E-commerce Entrepreneur",
      avatar: "💼",
      revenue: "+$847K",
      company: "TechStyle Co."
    },
    {
      text: "I went from unknown to 500K followers in 3 months. ClickSprout's AI creates content that actually goes viral.",
      author: "Mike Rodriguez",
      role: "Content Creator",
      avatar: "🚀",
      revenue: "+$120K",
      company: "@MikeCreates"
    },
    {
      text: "Finally, an AI tool that actually understands viral marketing. My engagement rates are through the roof!",
      author: "Emily Watson",
      role: "Digital Marketer",
      avatar: "💎",
      revenue: "+$290K",
      company: "Watson Digital"
    },
    {
      text: "From $5K to $50K monthly revenue in 6 months. The AI-generated content performs better than my expensive agency!",
      author: "David Park",
      role: "Startup Founder",
      avatar: "🌟",
      revenue: "+$540K",
      company: "NextGen Apps"
    }
  ]

  const features = [
    {
      icon: Bot,
      title: "AI Content Generator",
      description: "Create viral titles, descriptions, and hashtags in seconds",
      demo: "Amazon link → 10 viral variations",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Globe,
      title: "Multi-Platform Publishing",
      description: "Auto-post to Pinterest, Reddit, Medium, and more",
      demo: "1 click → 12 platforms",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track views, clicks, conversions, and revenue",
      demo: "Real-time insights",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Wand2,
      title: "Smart Optimization",
      description: "AI learns what works and optimizes automatically",
      demo: "Self-improving content",
      color: "from-orange-500 to-red-600"
    }
  ]

  const platforms = [
    { name: "Pinterest", users: "450M+", color: "bg-red-500" },
    { name: "Reddit", users: "430M+", color: "bg-orange-500" },
    { name: "Medium", users: "120M+", color: "bg-green-500" },
    { name: "Twitter", users: "450M+", color: "bg-blue-500" },
    { name: "LinkedIn", users: "900M+", color: "bg-blue-600" },
    { name: "Facebook", users: "3B+", color: "bg-blue-700" }
  ]

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)

    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)

    return () => {
      clearInterval(testimonialInterval)
      clearInterval(featureInterval)
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.3),transparent_50%)]"></div>
      </div>
      
      {/* Floating Elements with Mouse Parallax */}
      <div 
        className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"
        style={{
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
        }}
      ></div>
      <div 
        className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"
        style={{
          transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
        }}
      ></div>
      <div 
        className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-xl animate-pulse delay-2000"
        style={{
          transform: `translate(${mousePosition.x * 0.008}px, ${mousePosition.y * 0.008}px)`
        }}
      ></div>

      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-pulse">
                  <Sparkles className="text-white w-6 h-6" />
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ClickSprout
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
                Dashboard
              </Link>
              <Link href="/submit">
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium backdrop-blur-sm mb-8 animate-bounce">
              <Flame className="w-4 h-4 mr-2 text-orange-400" />
              #1 AI-Powered Product Promotion Platform
              <ArrowUp className="w-4 h-4 ml-2 text-green-400" />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-8xl font-bold text-white mb-6 leading-tight">
              Transform
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                Any Product
              </span>
              Into Viral Gold
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              ClickSprout&apos;s AI creates viral content that drives 
              <span className="text-yellow-400 font-bold animate-pulse"> 10x more clicks</span>, 
              <span className="text-green-400 font-bold animate-pulse"> 5x higher conversions</span>, and 
              <span className="text-blue-400 font-bold animate-pulse"> unlimited growth</span>.
              <br />
              <span className="text-lg text-gray-400 mt-4 block">No marketing experience required. Just paste, generate, and go viral.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link href="/submit">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl shadow-blue-500/25 transform hover:scale-110 transition-all duration-300 px-8 py-4 text-lg font-semibold">
                  <Rocket className="w-6 h-6 mr-3" />
                  Start Creating Viral Content
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300">
                <Play className="w-6 h-6 mr-3" />
                Watch 2-Min Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Everything You Need to
              <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Dominate Social Media
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform handles everything from content creation to analytics, 
              so you can focus on what matters most - growing your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div 
                  key={index}
                  className={`transform transition-all duration-500 ${
                    currentFeature === index ? 'scale-105 -rotate-1' : 'scale-100'
                  }`}
                >
                  <div className={`bg-gradient-to-br ${feature.color} p-[1px] rounded-2xl`}>
                    <div className="bg-black/80 backdrop-blur-md rounded-2xl p-6 hover:bg-black/60 transition-all duration-300 group h-full">
                      <div className="flex items-center justify-center mb-4">
                        <IconComponent className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="text-xs text-blue-400 font-medium bg-blue-400/10 rounded-full px-3 py-1 inline-block">
                        {feature.demo}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Reach
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> 5+ Billion </span>
              People
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Auto-publish to all major platforms simultaneously and maximize your reach.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {platforms.map((platform, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 group"
              >
                <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-white font-bold text-lg">{platform.name[0]}</span>
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-blue-300 transition-colors duration-300">
                  {platform.name}
                </h3>
                <p className="text-gray-400 text-sm">{platform.users} users</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Success Stories That
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Speak Volumes
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of entrepreneurs who've transformed their businesses with ClickSprout.
            </p>
          </div>

          <div className="relative">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`transition-all duration-500 ${
                  currentTestimonial === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0'
                }`}
              >
                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 lg:p-12">
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-2xl lg:text-3xl text-gray-200 mb-8 italic text-center leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </blockquote>
                  
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
                    <div className="text-6xl">{testimonial.avatar}</div>
                    <div className="text-center lg:text-left">
                      <div className="font-bold text-white text-xl">{testimonial.author}</div>
                      <div className="text-gray-400 text-lg">{testimonial.role}</div>
                      <div className="text-blue-400 font-medium text-sm mt-1">{testimonial.company}</div>
                      <div className="text-green-400 font-bold text-lg mt-2 flex items-center justify-center lg:justify-start">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        {testimonial.revenue}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial indicators */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  currentTestimonial === index ? 'bg-blue-400 scale-125' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/20 rounded-3xl p-12 text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <Megaphone className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"> Explode </span>
              Your Growth?
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join over 50,000 entrepreneurs who&apos;ve unlocked viral growth with ClickSprout&apos;s AI. 
              Start creating viral content in under 60 seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-6">
              <Link href="/submit">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl shadow-blue-500/25 transform hover:scale-110 transition-all duration-300 px-10 py-5 text-xl font-bold">
                  <Zap className="w-6 h-6 mr-3" />
                  Launch Your Viral Content
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                Free Forever Plan
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                Cancel Anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ClickSprout
              </span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2025 ClickSprout v1.0. Transforming products into viral content.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
