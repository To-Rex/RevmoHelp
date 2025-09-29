import { supabase } from './supabase';
import { isSupabaseAvailable } from './supabase';
import { getCategories } from './categories';
import { dataCache, withCache, cacheKeys, invalidateRelatedCache } from './cache';
import type { Post, PostTranslation } from '../types';

export interface CreatePostData {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featured_image?: File;
  youtube_url?: string;
  category_id: string;
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  published: boolean;
  translations?: {
    [key: string]: {
      title: string;
      content: string;
      excerpt: string;
      meta_title?: string;
      meta_description?: string;
      slug: string;
    };
  };
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

// Upload image to Supabase storage
export const uploadPostImage = async (file: File, postId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${postId}-${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Image upload error:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};

// Delete image from storage
export const deletePostImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `posts/${fileName}`;

    const { error } = await supabase.storage
      .from('post-images')
      .remove([filePath]);

    if (error) {
      console.error('Image delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

// Check if slug is unique
export const checkSlugUniqueness = async (slug: string, language: string = 'uz', excludePostId?: string): Promise<{ isUnique: boolean; error?: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { isUnique: true };
    }

    // Check main posts table (for Uzbek)
    if (language === 'uz') {
      let query = supabase
        .from('posts')
        .select('id')
        .eq('slug', slug);
      
      if (excludePostId) {
        query = query.neq('id', excludePostId);
      }
      
      const { data: mainPost, error: mainError } = await query.maybeSingle();
      
      if (mainError) {
        return { isUnique: false, error: mainError };
      }
      
      if (mainPost) {
        return { isUnique: false };
      }
    }

    // Check translations table
    let translationQuery = supabase
      .from('post_translations')
      .select('post_id')
      .eq('language', language)
      .eq('slug', slug);
    
    if (excludePostId) {
      translationQuery = translationQuery.neq('post_id', excludePostId);
    }
    
    const { data: translation, error: translationError } = await translationQuery.maybeSingle();
    
    if (translationError) {
      return { isUnique: false, error: translationError };
    }
    
    return { isUnique: !translation };
  } catch (error) {
    return { isUnique: false, error };
  }
};

// Get all posts with author and category info
const _getPosts = async (language: string = 'uz', options?: {
  published?: boolean;
  category_id?: string;
  author_id?: string;
  limit?: number;
  offset?: number;
  allowMock?: boolean;
}): Promise<{ data: Post[] | null; error: any }> => {
  try {
    console.log('📝 Loading posts from Supabase for language:', language);
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available');
      if (options?.allowMock === false) {
        return { data: [], error: null };
      }
      console.log('Using mock data');
      return { data: getMockPosts(language, options?.limit), error: null };
    }

    // Build query
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, full_name, role, avatar_url),
        category:categories!posts_category_id_fkey(id, name, slug, color),
        translations:post_translations(*)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (options?.published !== undefined) {
      query = query.eq('published', options.published);
    }

    if (options?.category_id) {
      query = query.eq('category_id', options.category_id);
    }

    if (options?.author_id) {
      query = query.eq('author_id', options.author_id);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.log('❌ Supabase error:', error);
      if (options?.allowMock === false) {
        return { data: [], error: null };
      }
      console.log('🔄 Falling back to mock data');
      return { data: getMockPosts(language, options?.limit), error: null };
    }

    // Process posts with translations
    const pickTranslation = (translations: any[] | undefined, lang: string) => {
      if (!translations || translations.length === 0) return null;
      const order = [lang, 'uz', 'ru', 'en'].filter((v, i, a) => a.indexOf(v) === i);
      for (const l of order) {
        const t = translations.find((x: any) => x.language === l);
        if (t && (t.title || t.content || t.excerpt)) return t;
      }
      return null;
    };

    const processedPosts = (data || []).map((post: any) => {
      const tr = pickTranslation(post.translations, language);

      // For non-Uzbek languages, prefer translation fields; keep base slug unless translation for that exact language exists
      if (language !== 'uz') {
        const exact = post.translations?.find((t: any) => t.language === language);
        return {
          ...post,
          title: tr?.title || post.title,
          content: tr?.content || post.content,
          excerpt: tr?.excerpt || post.excerpt,
          slug: exact?.slug || post.slug,
          meta_title: tr?.meta_title || post.meta_title,
          meta_description: tr?.meta_description || post.meta_description,
          current_language: exact ? language : (tr?.language || 'uz')
        };
      }

      // Uzbek: use base fields; if missing, fill from any translation; never change slug
      return {
        ...post,
        title: post.title || tr?.title || post.title,
        content: post.content || tr?.content || post.content,
        excerpt: post.excerpt || tr?.excerpt || post.excerpt,
        meta_title: post.meta_title || tr?.meta_title || post.meta_title,
        meta_description: post.meta_description || tr?.meta_description || post.meta_description,
        current_language: 'uz'
      };
    });
    console.log('✅ Posts loaded from Supabase:', processedPosts.length);
    return { data: processedPosts, error: null };
  } catch (error) {
    console.warn('📝 Error fetching posts from Supabase:', error);
    if (options?.allowMock === false) {
      return { data: [], error: null };
    }
    return { data: getMockPosts(language, options?.limit), error: null };
  }
};

// Cached version of getPosts
export const getPosts = withCache(
  _getPosts,
  (language, options) => cacheKeys.posts(language, options),
  3 * 60 * 1000 // 3 minutes TTL
);

// Get single post by slug
const _getPostBySlug = async (slug: string, language: string = 'uz'): Promise<{ data: Post | null; error: any }> => {
  try {
    console.log('📝 Loading post by slug from Supabase:', slug, 'language:', language);
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available, using mock data');
      // Return mock post by slug
      const mockPosts = getMockPosts(language);
      const post = mockPosts.find(p => p.slug === slug);
      return { data: post || null, error: post ? null : { message: 'Post not found' } };
    }

    // First try to find by translation slug
    const { data: translationData, error: translationError } = await supabase
      .from('post_translations')
      .select(`
        *,
        post:posts(
          *,
          author:profiles!posts_author_id_fkey(id, full_name, role, avatar_url),
          category:categories!posts_category_id_fkey(id, name, slug, color)
        )
      `)
      .eq('slug', slug)
      .eq('language', language)
      .single();

    if (translationError || !translationData) {
      // Fallback to original posts table (for Uzbek default)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, full_name, role, avatar_url),
          category:categories!posts_category_id_fkey(id, name, slug, color),
          translations:post_translations(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.log('❌ Supabase error loading post:', error);
        console.log('🔄 Falling back to mock data');
        const mockPosts = getMockPosts(language);
        const post = mockPosts.find(p => p.slug === slug);
        return { data: post || null, error: post ? null : { message: 'Post not found' } };
      }

      // Process with translation if available
      const translation = data.translations?.find((t: any) => t.language === language);
      const processedPost = translation ? {
        ...data,
        title: translation.title,
        content: translation.content,
        excerpt: translation.excerpt,
        slug: translation.slug,
        meta_title: translation.meta_title,
        meta_description: translation.meta_description,
        current_language: language
      } : data;

      // Increment view count
      await supabase
        .from('posts')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', data.id);

      console.log('✅ Post loaded from Supabase:', processedPost.title);
      return { data: processedPost, error: null };
    }

    // Found translation, process it
    const post = translationData.post;
    const processedPost = {
      ...post,
      title: translationData.title,
      content: translationData.content,
      excerpt: translationData.excerpt,
      slug: translationData.slug,
      meta_title: translationData.meta_title,
      meta_description: translationData.meta_description,
      current_language: language
    };

    // Increment view count
    await supabase
      .from('posts')
      .update({ views_count: (post.views_count || 0) + 1 })
      .eq('id', post.id);

    console.log('✅ Post translation loaded from Supabase:', processedPost.title);
    return { data: processedPost, error: null };
  } catch (error) {
    console.warn('📝 Error fetching post from Supabase, using mock data:', error);
    const mockPosts = getMockPosts(language);
    const post = mockPosts.find(p => p.slug === slug);
    return { data: post || null, error: null };
  }
};

// Cached version of getPostBySlug
export const getPostBySlug = withCache(
  _getPostBySlug,
  (slug, language) => cacheKeys.postBySlug(slug, language),
  10 * 60 * 1000 // 10 minutes TTL
);

// Get single post by ID (UUID)
const _getPostById = async (id: string, language: string = 'uz'): Promise<{ data: Post | null; error: any }> => {
  try {
    console.log('📝 Loading post by ID from Supabase:', id, 'language:', language);
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available, using mock data');
      // Return mock post by id
      const mockPosts = getMockPosts(language);
      const post = mockPosts.find(p => p.id === id);
      return { data: post || null, error: post ? null : { message: 'Post not found' } };
    }

    // Get post by ID with all relations and translations
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, full_name, role, avatar_url),
        category:categories!posts_category_id_fkey(id, name, slug, color),
        translations:post_translations(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.log('❌ Supabase error loading post by ID:', error);
      console.log('🔄 Falling back to mock data');
      const mockPosts = getMockPosts(language);
      const post = mockPosts.find(p => p.id === id);
      return { data: post || null, error: post ? null : { message: 'Post not found' } };
    }

    // Process with translation if available
    const translation = data.translations?.find((t: any) => t.language === language);
    const processedPost = translation ? {
      ...data,
      title: translation.title,
      content: translation.content,
      excerpt: translation.excerpt,
      slug: translation.slug,
      meta_title: translation.meta_title,
      meta_description: translation.meta_description,
      current_language: language
    } : data;

    console.log('✅ Post loaded by ID from Supabase:', processedPost.title);
    return { data: processedPost, error: null };
  } catch (error) {
    console.warn('📝 Error fetching post by ID from Supabase, using mock data:', error);
    const mockPosts = getMockPosts(language);
    const post = mockPosts.find(p => p.id === id);
    return { data: post || null, error: null };
  }
};

// Cached version of getPostById
export const getPostById = withCache(
  _getPostById,
  (id, language) => cacheKeys.postById(id, language),
  10 * 60 * 1000 // 10 minutes TTL
);

// Create new post
export const createPost = async (postData: CreatePostData): Promise<{ data: Post | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      // Mock post creation
      const newPost: Post = {
        id: Date.now().toString(),
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        slug: postData.slug,
        featured_image_url: postData.featured_image ? URL.createObjectURL(postData.featured_image) : undefined,
        youtube_url: postData.youtube_url,
        author_id: 'demo-user',
        category_id: postData.category_id,
        tags: postData.tags,
        meta_title: postData.meta_title,
        meta_description: postData.meta_description,
        published: postData.published,
        published_at: postData.published ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views_count: 0
      };
      return { data: newPost, error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Create post without image first
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        slug: postData.slug,
        youtube_url: postData.youtube_url,
        author_id: user.id,
        category_id: postData.category_id,
        tags: postData.tags,
        meta_title: postData.meta_title,
        meta_description: postData.meta_description,
        published: postData.published,
        published_at: postData.published ? new Date().toISOString() : null
      })
      .select()
      .single();

    // Invalidate related cache
    if (post?.id) {
      invalidateRelatedCache('post', post.id);
    } else {
      invalidateRelatedCache('post');
    }

    if (postError) {
      return { data: null, error: postError };
    }

    // Create default Uzbek translation
    // Only create Uzbek translation if it doesn't already exist
    const { data: existingTranslation } = await supabase
      .from('post_translations')
      .select('id')
      .eq('post_id', post.id)
      .eq('language', 'uz')
      .maybeSingle();

    if (!existingTranslation) {
      const { error: translationError } = await supabase
        .from('post_translations')
        .insert({
          post_id: post.id,
          language: 'uz',
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt,
          slug: postData.slug,
          meta_title: postData.meta_title,
          meta_description: postData.meta_description
        });

      if (translationError) {
        console.warn('Warning: Could not create default translation:', translationError);
      }
    }

    // Create additional translations if provided
    if (postData.translations) {
      const slugify = (str?: string) => {
        if (!str) return '';
        return str
          .toString()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '-')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      };

      const translationInserts = Object.entries(postData.translations)
        .map(([lang, translation]) => {
          const computedSlug = translation.slug || slugify(translation.title) || `${postData.slug}-${lang}`;
          return {
            post_id: post.id,
            language: lang,
            title: translation.title || postData.title,
            content: translation.content || postData.content,
            excerpt: translation.excerpt || postData.excerpt,
            slug: computedSlug,
            meta_title: translation.meta_title || postData.meta_title,
            meta_description: translation.meta_description || postData.meta_description
          };
        });

      const { error: additionalTranslationsError } = await supabase
        .from('post_translations')
        .insert(translationInserts);

      if (additionalTranslationsError) {
        console.warn('Warning: Could not create additional translations:', additionalTranslationsError);
      }
    }
    // Upload image if provided
    if (postData.featured_image && post) {
      const imageUrl = await uploadPostImage(postData.featured_image, post.id);
      if (imageUrl) {
        const { data: updatedPost, error: updateError } = await supabase
          .from('posts')
          .update({ featured_image_url: imageUrl })
          .eq('id', post.id)
          .select(`
            *,
            author:profiles!posts_author_id_fkey(id, full_name, role, avatar_url),
            category:categories!posts_category_id_fkey(id, name, slug, color),
            translations:post_translations(*)
          `)
          .single();

        if (updateError) {
          return { data: null, error: updateError };
        }

        return { data: updatedPost, error: null };
      }
    }

    // Get post with relations
    const { data: finalPost, error: finalError } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, full_name, role, avatar_url),
        category:categories!posts_category_id_fkey(id, name, slug, color),
        translations:post_translations(*)
      `)
      .eq('id', post.id)
      .single();

    return { data: finalPost, error: finalError };
  } catch (error) {
    return { data: null, error };
  }
};

// Update post
export const updatePost = async (postData: UpdatePostData): Promise<{ data: Post | null; error: any }> => {
  try {
    const { id, featured_image, ...updateData } = postData;

    // Handle image upload if new image provided
    if (featured_image) {
      const imageUrl = await uploadPostImage(featured_image, id);
      if (imageUrl) {
        updateData.featured_image_url = imageUrl;
      }
    }

    // Set published_at if publishing
    if (updateData.published === true) {
      updateData.published_at = new Date().toISOString();
    } else if (updateData.published === false) {
      updateData.published_at = null;
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, full_name, role, avatar_url),
        category:categories!posts_category_id_fkey(id, name, slug, color)
      `)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Delete post
export const deletePost = async (postId: string): Promise<{ error: any }> => {
  try {
    // Get post to check for image
    const { data: post } = await supabase
      .from('posts')
      .select('featured_image_url')
      .eq('id', postId)
      .single();

    // Delete image from storage if exists
    if (post?.featured_image_url) {
      await deletePostImage(post.featured_image_url);
    }

    // Delete post
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    // Invalidate related cache
    invalidateRelatedCache('post', postId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Search posts
export const searchPosts = async (query: string, options?: {
  category_id?: string;
  published?: boolean;
}): Promise<{ data: Post[] | null; error: any }> => {
  try {
    let searchQuery = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, full_name, role, avatar_url),
        category:categories!posts_category_id_fkey(id, name, slug, color)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (options?.published !== undefined) {
      searchQuery = searchQuery.eq('published', options.published);
    }

    if (options?.category_id) {
      searchQuery = searchQuery.eq('category_id', options.category_id);
    }

    const { data, error } = await searchQuery;

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Mock data fallback when Supabase is not available
const getMockPosts = (language?: string, limit?: number): Post[] => {
  const mockPosts = [
    {
      id: '1',
      title: 'Revmatoid artrit: belgilar va davolash usullari',
      content: 'Revmatoid artrit - bu autoimmun kasallik bo\'lib, qo\'shmalarda yallig\'lanish va og\'riq keltirib chiqaradi...',
      excerpt: 'Revmatoid artrit haqida bilishingiz kerak bo\'lgan barcha ma\'lumotlar: belgilar, diagnostika va zamonaviy davolash usullari.',
      slug: 'revmatoid-artrit-belgilar-davolash',
      featured_image_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800',
      author_id: '1',
      author: {
        id: '1',
        email: 'doctor@example.com',
        full_name: 'Dr. Aziza Karimova',
        role: 'doctor',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      category_id: '1',
      category: {
        id: '1',
        name: 'Artrit',
        slug: 'artrit',
        color: '#3B82F6',
        created_at: '2024-01-01'
      },
      tags: ['artrit', 'revmatik kasallik', 'davolash'],
      meta_title: 'Revmatoid artrit belgilari va davolash usullari',
      meta_description: 'Revmatoid artrit haqida to\'liq ma\'lumot',
      published: true,
      published_at: new Date().toISOString(),
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      views_count: 1250
    },
    {
      id: '2',
      title: 'Osteoartroz: erta belgilarni qanday aniqlash mumkin',
      content: 'Osteoartroz - bu qo\'shma kasalligi bo\'lib, asosan keksa yoshdagi odamlarda uchraydi...',
      excerpt: 'Osteoartroz kasalligining erta belgilari va oldini olish choralari haqida batafsil ma\'lumot.',
      slug: 'osteoartroz-erta-belgilar',
      featured_image_url: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=800',
      youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      author_id: '2',
      author: {
        id: '2',
        email: 'doctor2@example.com',
        full_name: 'Dr. Bobur Toshmatov',
        role: 'doctor',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      category_id: '2',
      category: {
        id: '2',
        name: 'Artroz',
        slug: 'artroz',
        color: '#10B981',
        created_at: '2024-01-01'
      },
      tags: ['artroz', 'belgilar', 'profilaktika'],
      meta_title: 'Osteoartroz erta belgilari',
      meta_description: 'Osteoartroz belgilarini erta aniqlash',
      published: true,
      published_at: new Date(Date.now() - 86400000).toISOString(),
      created_at: '2024-01-12T14:30:00Z',
      updated_at: '2024-01-12T14:30:00Z',
      views_count: 890
    },
    {
      id: '3',
      title: 'Qo\'shma og\'riqlarini kamaytirish uchun mashqlar',
      content: 'Revmatik kasalliklardan aziyat chekayotgan bemorlar uchun maxsus jismoniy mashqlar...',
      excerpt: 'Revmatik kasalliklardan aziyat chekayotgan bemorlar uchun maxsus jismoniy mashqlar kompleksi.',
      slug: 'qoshma-ogriqlarini-kamaytirish-mashqlar',
      featured_image_url: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=800',
      author_id: '3',
      author: {
        id: '3',
        email: 'doctor3@example.com',
        full_name: 'Dr. Nilufar Abdullayeva',
        role: 'doctor',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      category_id: '3',
      category: {
        id: '3',
        name: 'Jismoniy tarbiya',
        slug: 'jismoniy-tarbiya',
        color: '#F59E0B',
        created_at: '2024-01-01'
      },
      tags: ['mashqlar', 'og\'riq', 'reabilitatsiya'],
      meta_title: 'Qo\'shma og\'riqlari uchun mashqlar',
      meta_description: 'Og\'riqni kamaytirish uchun mashqlar',
      published: true,
      published_at: new Date(Date.now() - 172800000).toISOString(),
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-10T09:15:00Z',
      views_count: 2100
    }
  ];

  return limit ? mockPosts.slice(0, limit) : mockPosts;
};
