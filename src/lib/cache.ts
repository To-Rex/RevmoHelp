// Cache preloading and initialization
// Separated from cache utilities to avoid circular dependencies

import { dataCache } from './cacheUtils';
import { isSupabaseAvailable } from './supabase';
import { getDoctors } from './doctors';
import { getPosts } from './posts';
import { getCategories } from './categories';

/**
 * Preload critical data into cache
 */
export const preloadCriticalData = async (): Promise<void> => {
  console.log('🚀 Preloading critical data into cache...');

  try {
    // Check Supabase connection health first
    const isHealthy = await isSupabaseAvailable();

    if (!isHealthy) {
      console.warn('⚠️ Supabase connection not available, skipping data preload');
      return;
    }

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

// Initialize cache system
console.log('🏗️ Revmohelp cache system initialized');

// Preload critical data after a short delay
setTimeout(() => {
  preloadCriticalData();
}, 1000);

// Re-export CacheManager for backward compatibility
export { CacheManager } from './cacheUtils';