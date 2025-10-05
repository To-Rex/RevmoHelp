// Comprehensive Caching System for Revmoinfo
// Provides intelligent caching with TTL, invalidation, and memory management

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enableLogging: boolean;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;
  private accessTimes = new Map<string, number>();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxSize: 1000, // Maximum cache entries
      enableLogging: true,
      ...config
    };

    // Clean up expired items every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Set cache item with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key
    };

    // Remove oldest items if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, item);
    this.accessTimes.set(key, Date.now());

    if (this.config.enableLogging) {
      console.log(`📦 Cache SET: ${key} (TTL: ${item.ttl}ms)`);
    }
  }

  /**
   * Get cache item if not expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      if (this.config.enableLogging) {
        console.log(`⏰ Cache EXPIRED: ${key}`);
      }
      return null;
    }

    // Update access time for LRU
    this.accessTimes.set(key, Date.now());

    if (this.config.enableLogging) {
      console.log(`📦 Cache HIT: ${key}`);
    }

    return item.data;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific cache item
   */
  delete(key: string): boolean {
    this.accessTimes.delete(key);
    const deleted = this.cache.delete(key);
    
    if (deleted && this.config.enableLogging) {
      console.log(`🗑️ Cache DELETE: ${key}`);
    }
    
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.accessTimes.clear();
    
    if (this.config.enableLogging) {
      console.log('🧹 Cache CLEARED');
    }
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }

    if (this.config.enableLogging && count > 0) {
      console.log(`🔄 Cache INVALIDATED: ${count} items matching "${pattern}"`);
    }

    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestItem: string | null;
    newestItem: string | null;
  } {
    const now = Date.now();
    let oldestTime = now;
    let newestTime = 0;
    let oldestKey: string | null = null;
    let newestKey: string | null = null;

    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
      if (time > newestTime) {
        newestTime = time;
        newestKey = key;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need hit/miss tracking for accurate calculation
      oldestItem: oldestKey,
      newestItem: newestKey
    };
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        this.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0 && this.config.enableLogging) {
      console.log(`🧹 Cache CLEANUP: Removed ${cleanedCount} expired items`);
    }
  }

  /**
   * Evict oldest accessed items when cache is full
   */
  private evictOldest(): void {
    if (this.accessTimes.size === 0) return;

    // Find oldest accessed item
    let oldestTime = Date.now();
    let oldestKey: string | null = null;

    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      if (this.config.enableLogging) {
        console.log(`🔄 Cache EVICTED: ${oldestKey} (LRU)`);
      }
    }
  }
}

// Create global cache instances with different TTLs
export const dataCache = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes for general data
  maxSize: 500,
  enableLogging: true
});

export const imageCache = new CacheManager({
  defaultTTL: 30 * 60 * 1000, // 30 minutes for images
  maxSize: 200,
  enableLogging: false
});

export const userCache = new CacheManager({
  defaultTTL: 10 * 60 * 1000, // 10 minutes for user data
  maxSize: 100,
  enableLogging: true
});

export const staticCache = new CacheManager({
  defaultTTL: 60 * 60 * 1000, // 1 hour for static content
  maxSize: 50,
  enableLogging: false
});

/**
 * Cache wrapper for async functions
 */
export const withCache = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl?: number,
  cacheInstance: CacheManager = dataCache
) => {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    
    // Try to get from cache first
    const cached = cacheInstance.get<R>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fn(...args);
      cacheInstance.set(key, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  };
};

/**
 * Invalidate related cache entries when data changes
 */
export const invalidateRelatedCache = (entityType: string, entityId?: string): void => {
  switch (entityType) {
    case 'doctor':
      dataCache.invalidatePattern('doctors.*');
      dataCache.invalidatePattern('doctor_profiles.*');
      if (entityId) {
        dataCache.invalidatePattern(`doctor.${entityId}.*`);
        dataCache.invalidatePattern(`doctor_reviews.${entityId}.*`);
      }
      break;
      
    case 'post':
      dataCache.invalidatePattern('posts.*');
      if (entityId) {
        dataCache.invalidatePattern(`post.${entityId}.*`);
        dataCache.invalidatePattern(`comments.${entityId}.*`);
      }
      break;
      
    case 'user':
      userCache.invalidatePattern('users.*');
      userCache.invalidatePattern('profiles.*');
      if (entityId) {
        userCache.invalidatePattern(`user.${entityId}.*`);
      }
      break;
      
    case 'category':
      dataCache.invalidatePattern('categories.*');
      dataCache.invalidatePattern('posts.*'); // Posts depend on categories
      break;
      
    case 'comment':
      if (entityId) {
        dataCache.invalidatePattern(`comments.${entityId}.*`);
      }
      break;

    case 'question':
      dataCache.invalidatePattern('questions.*');
      dataCache.invalidatePattern('question.*');
      if (entityId) {
        dataCache.invalidatePattern(`answers.${entityId}`);
      }
      break;

    default:
      console.warn(`Unknown entity type for cache invalidation: ${entityType}`);
  }
};

/**
 * Preload critical data into cache
 */
export const preloadCriticalData = async (): Promise<void> => {
  console.log('🚀 Preloading critical data into cache...');
  
  try {
    // Check Supabase connection health first
    const { isSupabaseAvailable } = await import('./supabase');
    const isHealthy = await isSupabaseAvailable();
    
    if (!isHealthy) {
      console.warn('⚠️ Supabase connection not available, skipping data preload');
      return;
    }

    // Import functions dynamically to avoid circular dependencies
    const { getDoctors } = await import('./doctors');
    const { getPosts } = await import('./posts');
    const { getCategories } = await import('./categories');
    
    // Preload in parallel
    await Promise.allSettled([
      getDoctors('uz', { active: true, verified: true, limit: 10 }),
      getPosts('uz', { published: true, limit: 20 }),
      getCategories()
    ]);
    
    console.log('✅ Critical data preloaded successfully');
  } catch (error) {
    console.error('❌ Error preloading critical data:', error);
  }
};

/**
 * Cache key generators
 */
export const cacheKeys = {
  doctors: (language: string, options?: any) => 
    `doctors.${language}.${JSON.stringify(options || {})}`,
  
  doctorById: (id: string, language: string) => 
    `doctor.${id}.${language}`,
  
  doctorReviews: (doctorId: string, options?: any) => 
    `doctor_reviews.${doctorId}.${JSON.stringify(options || {})}`,
  
  doctorRatingStats: (doctorId: string) => 
    `doctor_rating_stats.${doctorId}`,
  
  posts: (language: string, options?: any) => 
    `posts.${language}.${JSON.stringify(options || {})}`,
  
  postBySlug: (slug: string, language: string) => 
    `post.${slug}.${language}`,
  
  postById: (id: string, language: string) => 
    `post.${id}.${language}`,
  
  postComments: (postId: string) => 
    `comments.${postId}`,
  
  categories: () => 'categories.all',
  
  userProfiles: () => 'users.profiles.all',
  
  patientStories: (language: string, options?: any) => 
    `patient_stories.${language}.${JSON.stringify(options || {})}`,
  
  partners: (options?: any) => 
    `partners.${JSON.stringify(options || {})}`,
  
  homepageSettings: (section: string, language: string) =>
    `homepage.${section}.${language}`,

  questions: (options?: any) =>
    `questions.${JSON.stringify(options || {})}`,

  questionBySlug: (slug: string) =>
    `question.${slug}`,

  answers: (questionId: string) =>
    `answers.${questionId}`
};

// Initialize cache system
console.log('🏗️ Revmohelp cache system initialized');

// Preload critical data after a short delay
setTimeout(() => {
  preloadCriticalData();
}, 1000);

// Export cache instances for direct use
export { CacheManager };