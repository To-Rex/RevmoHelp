import { supabase, isSupabaseAvailable } from './supabase';
import { staticCache, withCache, cacheKeys, invalidateRelatedCache } from './cache';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  created_at: string;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  color: string;
}

interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

// Get all categories
const _getCategories = async (): Promise<{ data: Category[] | null; error: any }> => {
  try {
    console.log('📂 Loading categories from Supabase...');
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available, using mock data');
      return { data: getMockCategories(), error: null };
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.log('❌ Supabase error loading categories:', error);
      console.log('🔄 Falling back to mock data');
      return { data: getMockCategories(), error: null };
    }

    console.log('✅ Categories loaded from Supabase:', data?.length || 0);
    return { data, error: null };
  } catch (error) {
    console.warn('📂 Error fetching categories from Supabase, using mock data:', error);
    return { data: getMockCategories(), error: null };
  }
};

// Cached version of getCategories
export const getCategories = withCache(
  _getCategories,
  () => cacheKeys.categories(),
  15 * 60 * 1000, // 15 minutes TTL for categories
  staticCache
);

// Create new category
export const createCategory = async (categoryData: CreateCategoryData): Promise<{ data: Category | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      // Mock creation
      const newCategory: Category = {
        id: Date.now().toString(),
        ...categoryData,
        created_at: new Date().toISOString()
      };
      return { data: newCategory, error: null };
    }

    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    // Invalidate related cache
    invalidateRelatedCache('category');

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Update category
export const updateCategory = async (categoryData: UpdateCategoryData): Promise<{ data: Category | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: null, error: { message: 'Supabase not available' } };
    }

    const { id, ...updateData } = categoryData;

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    // Invalidate related cache
    invalidateRelatedCache('category');

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Delete category
export const deleteCategory = async (categoryId: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { error: { message: 'Supabase not available' } };
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    // Invalidate related cache
    invalidateRelatedCache('category');

    return { error };
  } catch (error) {
    return { error };
  }
};

// Check if slug is unique
export const checkCategorySlugUniqueness = async (slug: string, excludeCategoryId?: string): Promise<{ isUnique: boolean; error?: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { isUnique: true };
    }

    let query = supabase
      .from('categories')
      .select('id')
      .eq('slug', slug);
    
    if (excludeCategoryId) {
      query = query.neq('id', excludeCategoryId);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      return { isUnique: false, error };
    }
    
    return { isUnique: !data };
  } catch (error) {
    return { isUnique: false, error };
  }
};

// Mock data fallback
const getMockCategories = (): Category[] => [
  { id: '1', name: 'Artrit', slug: 'artrit', color: '#3B82F6', created_at: '2024-01-01' },
  { id: '2', name: 'Artroz', slug: 'artroz', color: '#10B981', created_at: '2024-01-01' },
  { id: '3', name: 'Jismoniy tarbiya', slug: 'jismoniy-tarbiya', color: '#F59E0B', created_at: '2024-01-01' },
  { id: '4', name: 'Dorilar', slug: 'dorilar', color: '#EC4899', created_at: '2024-01-01' },
  { id: '5', name: 'Profilaktika', slug: 'profilaktika', color: '#8B5CF6', created_at: '2024-01-01' },
  { id: '6', name: 'Diagnostika', slug: 'diagnostika', color: '#06B6D4', created_at: '2024-01-01' }
];