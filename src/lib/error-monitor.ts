// Error monitoring and stability utilities for ClickSprout
export class ErrorMonitor {
  private static errors: Array<{
    timestamp: string
    type: string
    message: string
    stack?: string
    component?: string
    url?: string
  }> = []

  static logError(error: Error | string, context?: {
    component?: string
    action?: string
    url?: string
    data?: any
  }) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      type: typeof error === 'string' ? 'custom' : 'error',
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      component: context?.component,
      url: context?.url || (typeof window !== 'undefined' ? window.location.href : ''),
      ...context
    }

    this.errors.push(errorRecord)
    
    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 ClickSprout Error:', errorRecord)
    }

    // Store in localStorage for persistence
    try {
      const storedErrors = JSON.parse(localStorage.getItem('clicksprout_errors') || '[]')
      storedErrors.push(errorRecord)
      // Keep only last 100 errors
      const recentErrors = storedErrors.slice(-100)
      localStorage.setItem('clicksprout_errors', JSON.stringify(recentErrors))
    } catch (e) {
      console.warn('Failed to store error in localStorage:', e)
    }
  }

  static getErrors() {
    return this.errors
  }

  static getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('clicksprout_errors') || '[]')
    } catch {
      return []
    }
  }

  static clearErrors() {
    this.errors = []
    try {
      localStorage.removeItem('clicksprout_errors')
    } catch (e) {
      console.warn('Failed to clear stored errors:', e)
    }
  }

  // Stability check utilities
  static async runStabilityCheck(): Promise<{
    isStable: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check API endpoints
    try {
      const response = await fetch('/api/analytics')
      if (!response.ok) {
        issues.push('API routes not responding properly')
        recommendations.push('Check API route implementations')
      }
    } catch (e) {
      issues.push('Failed to connect to API endpoints')
      recommendations.push('Verify server is running and routes are configured')
    }

    // Check localStorage availability
    try {
      localStorage.setItem('stability_test', 'test')
      localStorage.removeItem('stability_test')
    } catch (e) {
      issues.push('localStorage not available')
      recommendations.push('Ensure browser supports localStorage or provide fallback')
    }

    // Check for React context issues
    if (typeof window !== 'undefined') {
      try {
        // Basic React context check
        const hasReactContext = document.querySelector('[data-reactroot]') !== null
        if (!hasReactContext) {
          issues.push('React context may not be properly initialized')
          recommendations.push('Check root layout and context providers')
        }
      } catch (e) {
        issues.push('DOM access issues detected')
        recommendations.push('Check for hydration or SSR issues')
      }
    }

    return {
      isStable: issues.length === 0,
      issues,
      recommendations
    }
  }
}

// React hook for error monitoring
export function useErrorMonitor() {
  const logError = (error: Error | string, context?: any) => {
    ErrorMonitor.logError(error, context)
  }

  const getErrors = () => ErrorMonitor.getErrors()
  const clearErrors = () => ErrorMonitor.clearErrors()

  return { logError, getErrors, clearErrors }
}

// Global error handler for unhandled promises
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    ErrorMonitor.logError(new Error(event.reason), {
      component: 'Global',
      action: 'unhandledPromiseRejection'
    })
  })

  window.addEventListener('error', (event) => {
    ErrorMonitor.logError(event.error || new Error(event.message), {
      component: 'Global',
      action: 'globalError',
      url: event.filename
    })
  })
}
