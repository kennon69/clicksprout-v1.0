// Database abstraction layer for ClickSprout v1.0
// Supports multiple database backends with fallback to localStorage

// Type definitions for Supabase client (optional dependency)
type SupabaseClient = any // Fallback type when Supabase is not available

// Helper function to safely import Supabase
async function safeImportSupabase(): Promise<{ createClient: (url: string, key: string) => any } | null> {
  try {
    // Try to dynamically import Supabase
    const supabase = await import('@supabase/supabase-js')
    return supabase
  } catch (error) {
    // Package not available - try to use stub as fallback
    try {
      console.warn('Supabase package not available, using stub fallback')
      const stub = await import('./supabase-stub')
      return stub
    } catch (stubError) {
      // Both failed - return null to trigger localStorage fallback
      console.warn('Both Supabase and stub failed, using localStorage fallback')
      return null
    }
  }
}

// Database types
export interface ContentRecord {
  id?: string
  url: string
  title: string
  description: string
  price?: string
  images: string[]
  videos: string[]
  generated_content?: string
  hashtags: string[]
  market_research?: any
  created_at?: string
  updated_at?: string
}

export interface ScheduledPostRecord {
  id?: string
  content_id?: string
  platform: string
  content: string
  images: string[]
  scheduled_time: string
  status: 'scheduled' | 'posted' | 'failed'
  posted_at?: string
  error_message?: string
  created_at?: string
  updated_at?: string
}

export interface ContentTemplateRecord {
  id?: string
  name: string
  title: string
  description: string
  content: string
  hashtags: string[]
  images: string[]
  created_at?: string
  updated_at?: string
}

// Generate unique IDs
function generateId(): string {
  return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
}

// Database service with multiple backend support
export class DatabaseService {
  // Check if we have database connectivity
  static async isDatabaseAvailable(): Promise<boolean> {
    try {
      // Try to connect to Supabase if configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabaseModule = await safeImportSupabase()
        if (!supabaseModule) {
          return false // Package not available
        }
        
        const supabase = supabaseModule.createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
        // Test connection
        const { error } = await supabase.from('content').select('count').limit(1)
        return !error
      }
      return false
    } catch (error) {
      console.warn('Database not available, using localStorage fallback')
      return false
    }
  }

  // Content operations
  static async saveContent(content: ContentRecord): Promise<ContentRecord | null> {
    try {
      const isDatabaseAvailable = await this.isDatabaseAvailable()
      
      if (isDatabaseAvailable) {
        // Use real database
        try {
          const supabaseModule = await safeImportSupabase()
          if (!supabaseModule) {
            throw new Error('Supabase package not available')
          }
          
          const supabase = supabaseModule.createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          const contentWithTimestamps = {
            ...content,
            id: content.id || generateId(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { data, error } = await supabase
            .from('content')
            .insert([contentWithTimestamps])
            .select()
            .single()

          if (error) throw error
          return data
        } catch (supabaseError) {
          console.warn('Supabase operation failed, falling back to localStorage:', supabaseError)
          // Fall through to localStorage fallback
        }
      }
      
      // Fallback to localStorage (either database unavailable or Supabase failed)
      const contentWithId = {
        ...content,
        id: content.id || generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const existingContent = JSON.parse(localStorage.getItem('database_content') || '[]')
      const updatedContent = [...existingContent, contentWithId]
      localStorage.setItem('database_content', JSON.stringify(updatedContent))
      
      return contentWithId
    } catch (error) {
      console.error('Error saving content:', error)
      
      // Ultimate fallback to localStorage
      try {
        const contentWithId = {
          ...content,
          id: content.id || generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const existingContent = JSON.parse(localStorage.getItem('database_content') || '[]')
        const updatedContent = [...existingContent, contentWithId]
        localStorage.setItem('database_content', JSON.stringify(updatedContent))
        
        return contentWithId
      } catch (localError) {
        console.error('All storage methods failed:', localError)
        return null
      }
    }
  }

  static async getContent(id: string): Promise<ContentRecord | null> {
    try {
      const isDatabaseAvailable = await this.isDatabaseAvailable()
      
      if (isDatabaseAvailable) {
        try {
          const supabaseModule = await safeImportSupabase()
          if (!supabaseModule) {
            throw new Error('Supabase package not available')
          }
          
          const supabase = supabaseModule.createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error
          return data
        } catch (supabaseError) {
          console.warn('Supabase operation failed, falling back to localStorage:', supabaseError)
          // Fall through to localStorage fallback
        }
      }
      
      // Fallback to localStorage
      const content = JSON.parse(localStorage.getItem('database_content') || '[]')
      return content.find((item: ContentRecord) => item.id === id) || null
    } catch (error) {
      console.error('Error getting content:', error)
      
      // Fallback to localStorage
      try {
        const content = JSON.parse(localStorage.getItem('database_content') || '[]')
        return content.find((item: ContentRecord) => item.id === id) || null
      } catch {
        return null
      }
    }
  }

  static async getAllContent(): Promise<ContentRecord[]> {
    try {
      const isDatabaseAvailable = await this.isDatabaseAvailable()
      
      if (isDatabaseAvailable) {
        try {
          const supabaseModule = await safeImportSupabase()
          if (!supabaseModule) {
            throw new Error('Supabase package not available')
          }
          
          const supabase = supabaseModule.createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          const { data, error } = await supabase
            .from('content')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) throw error
          return data || []
        } catch (supabaseError) {
          console.warn('Supabase operation failed, falling back to localStorage:', supabaseError)
          // Fall through to localStorage fallback
        }
      }
      
      // Fallback to localStorage
      const content = JSON.parse(localStorage.getItem('database_content') || '[]')
      return content.sort((a: ContentRecord, b: ContentRecord) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      )
    } catch (error) {
      console.error('Error getting all content:', error)
      
      // Fallback to localStorage
      try {
        const content = JSON.parse(localStorage.getItem('database_content') || '[]')
        return content.sort((a: ContentRecord, b: ContentRecord) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        )
      } catch {
        return []
      }
    }
  }

  static async updateContent(id: string, content: Partial<ContentRecord>): Promise<ContentRecord | null> {
    try {
      const isDatabaseAvailable = await this.isDatabaseAvailable()
      
      if (isDatabaseAvailable) {
        try {
          const supabaseModule = await safeImportSupabase()
          if (!supabaseModule) {
            throw new Error('Supabase package not available')
          }
          
          const supabase = supabaseModule.createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          const { data, error } = await supabase
            .from('content')
            .update({
              ...content,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

          if (error) throw error
          return data
        } catch (supabaseError) {
          console.warn('Supabase operation failed, falling back to localStorage:', supabaseError)
          // Fall through to localStorage fallback
        }
      }
      
      // Fallback to localStorage
      const allContent = JSON.parse(localStorage.getItem('database_content') || '[]')
      const index = allContent.findIndex((item: ContentRecord) => item.id === id)
      
      if (index !== -1) {
        allContent[index] = {
          ...allContent[index],
          ...content,
          updated_at: new Date().toISOString()
        }
        localStorage.setItem('database_content', JSON.stringify(allContent))
        return allContent[index]
      }
      return null
    } catch (error) {
      console.error('Error updating content:', error)
      return null
    }
  }

  // Scheduled posts operations
  static async saveScheduledPost(post: ScheduledPostRecord): Promise<ScheduledPostRecord | null> {
    try {
      const postWithId = {
        ...post,
        id: post.id || generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const existingPosts = JSON.parse(localStorage.getItem('database_scheduled_posts') || '[]')
      const updatedPosts = [...existingPosts, postWithId]
      localStorage.setItem('database_scheduled_posts', JSON.stringify(updatedPosts))
      
      return postWithId
    } catch (error) {
      console.error('Error saving scheduled post:', error)
      return null
    }
  }

  static async getAllScheduledPosts(): Promise<ScheduledPostRecord[]> {
    try {
      const posts = JSON.parse(localStorage.getItem('database_scheduled_posts') || '[]')
      return posts.sort((a: ScheduledPostRecord, b: ScheduledPostRecord) => 
        new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
      )
    } catch (error) {
      console.error('Error getting scheduled posts:', error)
      return []
    }
  }

  static async updateScheduledPost(id: string, post: Partial<ScheduledPostRecord>): Promise<ScheduledPostRecord | null> {
    try {
      const allPosts = JSON.parse(localStorage.getItem('database_scheduled_posts') || '[]')
      const index = allPosts.findIndex((item: ScheduledPostRecord) => item.id === id)
      
      if (index !== -1) {
        allPosts[index] = {
          ...allPosts[index],
          ...post,
          updated_at: new Date().toISOString()
        }
        localStorage.setItem('database_scheduled_posts', JSON.stringify(allPosts))
        return allPosts[index]
      }
      return null
    } catch (error) {
      console.error('Error updating scheduled post:', error)
      return null
    }
  }

  // Content templates operations
  static async saveTemplate(template: ContentTemplateRecord): Promise<ContentTemplateRecord | null> {
    try {
      const templateWithId = {
        ...template,
        id: template.id || generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const existingTemplates = JSON.parse(localStorage.getItem('database_templates') || '[]')
      const updatedTemplates = [...existingTemplates, templateWithId]
      localStorage.setItem('database_templates', JSON.stringify(updatedTemplates))
      
      return templateWithId
    } catch (error) {
      console.error('Error saving template:', error)
      return null
    }
  }

  static async getAllTemplates(): Promise<ContentTemplateRecord[]> {
    try {
      const templates = JSON.parse(localStorage.getItem('database_templates') || '[]')
      return templates.sort((a: ContentTemplateRecord, b: ContentTemplateRecord) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      )
    } catch (error) {
      console.error('Error getting templates:', error)
      return []
    }
  }

  // Generic database methods for posting engine
  static async insert(table: string, data: any): Promise<any> {
    try {
      const isDatabaseAvailable = await this.isDatabaseAvailable()
      
      if (isDatabaseAvailable) {
        // Use real database
        try {
          const supabaseModule = await safeImportSupabase()
          if (!supabaseModule) {
            throw new Error('Supabase package not available')
          }
          
          const supabase = supabaseModule.createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          const { data: result, error } = await supabase
            .from(table)
            .insert(data)
            .select()
            .single()

          if (error) throw error
          return result
        } catch (error) {
          console.warn('Database insert failed, using localStorage fallback:', error)
        }
      }

      // Fallback to localStorage
      const existingData = JSON.parse(localStorage.getItem(`database_${table}`) || '[]')
      const newData = Array.isArray(data) ? data : [data]
      const updatedData = [...existingData, ...newData]
      localStorage.setItem(`database_${table}`, JSON.stringify(updatedData))
      
      return Array.isArray(data) ? newData : newData[0]
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error)
      throw error
    }
  }

  static async update(table: string, filter: any, data: any): Promise<any> {
    try {
      const isDatabaseAvailable = await this.isDatabaseAvailable()
      
      if (isDatabaseAvailable) {
        // Use real database
        try {
          const supabaseModule = await safeImportSupabase()
          if (!supabaseModule) {
            throw new Error('Supabase package not available')
          }
          
          const supabase = supabaseModule.createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          let query = supabase.from(table).update(data)
          
          // Apply filters
          Object.keys(filter).forEach(key => {
            query = query.eq(key, filter[key])
          })

          const { data: result, error } = await query.select()

          if (error) throw error
          return result
        } catch (error) {
          console.warn('Database update failed, using localStorage fallback:', error)
        }
      }

      // Fallback to localStorage
      const existingData = JSON.parse(localStorage.getItem(`database_${table}`) || '[]')
      const updatedData = existingData.map((item: any) => {
        // Check if item matches filter
        const matches = Object.keys(filter).every(key => item[key] === filter[key])
        return matches ? { ...item, ...data, updated_at: new Date().toISOString() } : item
      })
      localStorage.setItem(`database_${table}`, JSON.stringify(updatedData))
      
      return updatedData.filter((item: any) => {
        return Object.keys(filter).every(key => item[key] === filter[key])
      })
    } catch (error) {
      console.error(`Error updating ${table}:`, error)
      throw error
    }
  }

  static async select(table: string, filter: any = {}, options: any = {}): Promise<any[]> {
    try {
      const isDatabaseAvailable = await this.isDatabaseAvailable()
      
      if (isDatabaseAvailable) {
        // Use real database
        try {
          const supabaseModule = await safeImportSupabase()
          if (!supabaseModule) {
            throw new Error('Supabase package not available')
          }
          
          const supabase = supabaseModule.createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          let query = supabase.from(table).select('*')
          
          // Apply filters
          Object.keys(filter).forEach(key => {
            if (typeof filter[key] === 'object' && filter[key].gte) {
              query = query.gte(key, filter[key].gte)
            } else {
              query = query.eq(key, filter[key])
            }
          })

          // Apply options
          if (options.orderBy) {
            query = query.order(options.orderBy)
          }
          if (options.limit) {
            query = query.limit(options.limit)
          }

          const { data, error } = await query

          if (error) throw error
          return data || []
        } catch (error) {
          console.warn('Database select failed, using localStorage fallback:', error)
        }
      }

      // Fallback to localStorage
      let existingData = JSON.parse(localStorage.getItem(`database_${table}`) || '[]')
      
      // Apply filters
      if (Object.keys(filter).length > 0) {
        existingData = existingData.filter((item: any) => {
          return Object.keys(filter).every(key => {
            if (typeof filter[key] === 'object' && filter[key].gte) {
              return new Date(item[key]) >= new Date(filter[key].gte)
            }
            return item[key] === filter[key]
          })
        })
      }

      // Apply sorting
      if (options.orderBy) {
        existingData.sort((a: any, b: any) => {
          return new Date(b[options.orderBy]).getTime() - new Date(a[options.orderBy]).getTime()
        })
      }

      // Apply limit
      if (options.limit) {
        existingData = existingData.slice(0, options.limit)
      }

      return existingData
    } catch (error) {
      console.error(`Error selecting from ${table}:`, error)
      return []
    }
  }

  static async upsert(table: string, data: any, filter: any): Promise<any> {
    try {
      const isDatabaseAvailable = await this.isDatabaseAvailable()
      
      if (isDatabaseAvailable) {
        // Use real database
        try {
          const supabaseModule = await safeImportSupabase()
          if (!supabaseModule) {
            throw new Error('Supabase package not available')
          }
          
          const supabase = supabaseModule.createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          const { data: result, error } = await supabase
            .from(table)
            .upsert(data)
            .select()

          if (error) throw error
        } catch (error) {
          console.warn('Database upsert failed, using localStorage fallback:', error)
        }
      }

      // Fallback to localStorage
      const existingData = JSON.parse(localStorage.getItem(`database_${table}`) || '[]')
      const existingIndex = existingData.findIndex((item: any) => {
        return Object.keys(filter).every(key => item[key] === filter[key])
      })

      if (existingIndex >= 0) {
        // Update existing
        existingData[existingIndex] = { ...existingData[existingIndex], ...data, updated_at: new Date().toISOString() }
      } else {
        // Insert new
        existingData.push({ ...data, created_at: new Date().toISOString() })
      }

      localStorage.setItem(`database_${table}`, JSON.stringify(existingData))
      return existingIndex >= 0 ? existingData[existingIndex] : existingData[existingData.length - 1]
    } catch (error) {
      console.error(`Error upserting ${table}:`, error)
      throw error
    }
  }
}

// Database wrapper class for instance methods
class Database {
  async insert(table: string, data: any): Promise<any> {
    return DatabaseService.insert(table, data)
  }

  async update(table: string, filter: any, data: any): Promise<any> {
    return DatabaseService.update(table, filter, data)
  }

  async select(table: string, filter: any = {}, options: any = {}): Promise<any[]> {
    return DatabaseService.select(table, filter, options)
  }

  async upsert(table: string, data: any, filter: any): Promise<any> {
    return DatabaseService.upsert(table, data, filter)
  }

  // Delegate existing methods to static methods
  async saveContent(content: ContentRecord): Promise<ContentRecord | null> {
    return DatabaseService.saveContent(content)
  }

  async getContent(id: string): Promise<ContentRecord | null> {
    return DatabaseService.getContent(id)
  }

  async getAllContent(): Promise<ContentRecord[]> {
    return DatabaseService.getAllContent()
  }

  async updateContent(id: string, updates: Partial<ContentRecord>): Promise<ContentRecord | null> {
    return DatabaseService.updateContent(id, updates)
  }

  async saveScheduledPost(post: ScheduledPostRecord): Promise<ScheduledPostRecord | null> {
    return DatabaseService.saveScheduledPost(post)
  }

  async getAllScheduledPosts(): Promise<ScheduledPostRecord[]> {
    return DatabaseService.getAllScheduledPosts()
  }

  async updateScheduledPost(id: string, updates: Partial<ScheduledPostRecord>): Promise<ScheduledPostRecord | null> {
    return DatabaseService.updateScheduledPost(id, updates)
  }

  async saveTemplate(template: ContentTemplateRecord): Promise<ContentTemplateRecord | null> {
    return DatabaseService.saveTemplate(template)
  }

  async getAllTemplates(): Promise<ContentTemplateRecord[]> {
    return DatabaseService.getAllTemplates()
  }
}

// Export the database instance
export const database = new Database()
