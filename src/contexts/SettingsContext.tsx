'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface UserSettings {
  // Profile Settings
  profile: {
    name: string
    email: string
    avatar: string
    timezone: string
    language: string
  }
  
  // API Keys
  apiKeys: {
    openai: string
    supabase: {
      url: string
      anonKey: string
    }
    anthropic: string
    serp: string
  }
  
  // Content Preferences
  content: {
    defaultTone: 'casual' | 'professional' | 'playful' | 'urgent' | 'inspiring'
    defaultLength: 'short' | 'medium' | 'long'
    defaultPlatforms: string[]
    autoGenerateHashtags: boolean
    includeEmojis: boolean
    maxHashtags: number
  }
  
  // Appearance
  appearance: {
    theme: 'light' | 'dark' | 'system'
    colorScheme: 'blue' | 'purple' | 'green' | 'orange' | 'pink'
    fontSize: 'small' | 'medium' | 'large'
    animations: boolean
  }

  // Branding
  branding: {
    customLogo: string // Base64 encoded image or URL
    customFavicon: string // Base64 encoded image or URL
    useCustomLogo: boolean
    useCustomFavicon: boolean
  }
  
  // Notifications
  notifications: {
    email: boolean
    push: boolean
    marketingEmails: boolean
    productUpdates: boolean
    weeklyReports: boolean
  }
  
  // Privacy & Security
  privacy: {
    analyticsTracking: boolean
    dataRetention: '30' | '90' | '365' | 'forever'
    shareUsageData: boolean
    twoFactorAuth: boolean
  }
}

const defaultSettings: UserSettings = {
  profile: {
    name: '',
    email: '',
    avatar: '',
    timezone: 'UTC',
    language: 'en'
  },
  apiKeys: {
    openai: '',
    supabase: {
      url: '',
      anonKey: ''
    },
    anthropic: '',
    serp: ''
  },
  content: {
    defaultTone: 'casual',
    defaultLength: 'medium',
    defaultPlatforms: ['instagram', 'facebook'],
    autoGenerateHashtags: true,
    includeEmojis: true,
    maxHashtags: 10
  },
  appearance: {
    theme: 'system',
    colorScheme: 'blue',
    fontSize: 'medium',
    animations: true
  },
  branding: {
    customLogo: '',
    customFavicon: '',
    useCustomLogo: false,
    useCustomFavicon: false
  },
  notifications: {
    email: true,
    push: false,
    marketingEmails: false,
    productUpdates: true,
    weeklyReports: true
  },
  privacy: {
    analyticsTracking: true,
    dataRetention: '90',
    shareUsageData: false,
    twoFactorAuth: false
  }
}

interface SettingsContextType {
  settings: UserSettings
  updateSettings: (section: keyof UserSettings, key: string, value: any) => void
  updateNestedSettings: (section: keyof UserSettings, subsection: string, key: string, value: any) => void
  saveSettings: () => Promise<void>
  resetSettings: () => void
  exportSettings: () => void
  importSettings: (settings: Partial<UserSettings>) => void
  uploadLogo: (file: File) => Promise<string>
  uploadFavicon: (file: File) => Promise<string>
  resetLogo: () => void
  resetFavicon: () => void
  isLoading: boolean
  hasUnsavedChanges: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [originalSettings, setOriginalSettings] = useState<UserSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load settings from localStorage on mount
  useEffect(() => {
    if (!isClient) return
    
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('clicksprout_settings')
        if (savedSettings) {
          const parsed = { ...defaultSettings, ...JSON.parse(savedSettings) }
          setSettings(parsed)
          setOriginalSettings(parsed)
          
          // Apply theme settings safely
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              applyThemeSettings(parsed.appearance)
              
              // Apply custom favicon if set
              if (parsed.branding?.useCustomFavicon && parsed.branding?.customFavicon) {
                updateFaviconInDocument(parsed.branding.customFavicon)
              }
            }, 0)
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    
    loadSettings()
  }, [isClient])

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings))
  }, [settings, originalSettings])

  const applyThemeSettings = (appearance: UserSettings['appearance']) => {
    try {
      // Only apply if document is available
      if (typeof document === 'undefined' || !document.documentElement) {
        return
      }

      // Store current theme state to avoid unnecessary changes
      const currentlyDark = document.documentElement.classList.contains('dark')
      let shouldBeDark = false

      // Determine if theme should be dark
      if (appearance.theme === 'dark') {
        shouldBeDark = true
      } else if (appearance.theme === 'light') {
        shouldBeDark = false
      } else {
        // System theme - check system preference
        if (typeof window !== 'undefined' && window.matchMedia) {
          shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
      }

      // Only change theme if it's different from current state
      if (shouldBeDark !== currentlyDark) {
        if (shouldBeDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }

      // Apply color scheme
      document.documentElement.style.setProperty('--primary-color', `var(--${appearance.colorScheme}-500)`)
      
      // Apply font size
      const fontSize = {
        small: '14px',
        medium: '16px',
        large: '18px'
      }[appearance.fontSize]
      document.documentElement.style.fontSize = fontSize
    } catch (error) {
      console.error('Failed to apply theme settings:', error)
    }

    // Apply animations
    if (!appearance.animations) {
      document.documentElement.style.setProperty('--animation-duration', '0s')
    } else {
      document.documentElement.style.setProperty('--animation-duration', '0.3s')
    }
  }

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))

    // Apply appearance changes immediately
    if (section === 'appearance') {
      applyThemeSettings({
        ...settings.appearance,
        [key]: value
      })
    }
  }

  const updateNestedSettings = (section: keyof UserSettings, subsection: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [key]: value
        }
      }
    }))
  }

  const saveSettings = async () => {
    try {
      localStorage.setItem('clicksprout_settings', JSON.stringify(settings))
      setOriginalSettings(settings)
      
      // Don't reapply theme settings during save - they should only change when explicitly updated
      // The theme is already applied immediately when changed via updateSettings
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    applyThemeSettings(defaultSettings.appearance)
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `clicksprout-settings-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importSettings = (newSettings: Partial<UserSettings>) => {
    const merged = { ...defaultSettings, ...newSettings }
    setSettings(merged)
    applyThemeSettings(merged.appearance)
  }

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Logo upload handler
  const uploadLogo = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file')
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Logo file size must be less than 2MB')
      }

      const base64 = await fileToBase64(file)
      
      setSettings(prev => ({
        ...prev,
        branding: {
          ...prev.branding,
          customLogo: base64,
          useCustomLogo: true
        }
      }))

      return base64
    } catch (error) {
      console.error('Failed to upload logo:', error)
      throw error
    }
  }

  // Favicon upload handler
  const uploadFavicon = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file')
      }
      
      // Validate file size (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        throw new Error('Favicon file size must be less than 1MB')
      }

      const base64 = await fileToBase64(file)
      
      setSettings(prev => ({
        ...prev,
        branding: {
          ...prev.branding,
          customFavicon: base64,
          useCustomFavicon: true
        }
      }))

      // Update the actual favicon in the document
      updateFaviconInDocument(base64)

      return base64
    } catch (error) {
      console.error('Failed to upload favicon:', error)
      throw error
    }
  }

  // Helper to update favicon in document
  const updateFaviconInDocument = (faviconBase64: string) => {
    try {
      // Only manipulate DOM if document is available and ready
      if (typeof document === 'undefined' || !document.head) {
        return
      }

      // Remove existing favicon links safely
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]')
      existingFavicons.forEach(link => {
        try {
          if (link.parentNode) {
            link.parentNode.removeChild(link)
          }
        } catch (error) {
          console.warn('Failed to remove favicon link:', error)
        }
      })

      // Add new favicon
      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/png'
      link.href = faviconBase64
      
      // Safely append to head
      if (document.head) {
        document.head.appendChild(link)
      }
    } catch (error) {
      console.error('Failed to update favicon in document:', error)
    }
  }

  // Reset logo
  const resetLogo = () => {
    setSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        customLogo: '',
        useCustomLogo: false
      }
    }))
  }

  // Reset favicon
  const resetFavicon = () => {
    setSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        customFavicon: '',
        useCustomFavicon: false
      }
    }))

    // Reset to default favicon
    updateFaviconInDocument('/favicon.ico')
  }

  const value: SettingsContextType = {
    settings,
    updateSettings,
    updateNestedSettings,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
    uploadLogo,
    uploadFavicon,
    resetLogo,
    resetFavicon,
    isLoading,
    hasUnsavedChanges
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    console.error('useSettings called outside of SettingsProvider. Make sure the component is wrapped with SettingsProvider.')
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Hook to get just the API keys for use in API calls
export function useApiKeys() {
  const { settings } = useSettings()
  return settings.apiKeys
}

// Hook to get content preferences for generators
export function useContentPreferences() {
  const { settings } = useSettings()
  return settings.content
}
