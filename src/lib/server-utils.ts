// Server-only utilities for Node.js modules
// This file should only be imported by server-side code

let nodeCron: any = null

// Lazy load node-cron only when needed on server
export const getNodeCron = () => {
  if (typeof window !== 'undefined') {
    throw new Error('node-cron should only be used on server-side')
  }
  
  if (!nodeCron) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      nodeCron = require('node-cron')
    } catch (error) {
      console.warn('node-cron not available:', error)
      return null
    }
  }
  
  return nodeCron
}

// Safe cron scheduler that works server-side only
export const scheduleCronJob = (pattern: string, callback: () => void) => {
  const cron = getNodeCron()
  if (cron) {
    return cron.schedule(pattern, callback)
  }
  console.warn('Cron scheduling not available - node-cron module missing')
  return null
}
