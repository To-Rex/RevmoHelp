import { supabase, isSupabaseAvailable } from './supabase';
import { dataCache, withCache, cacheKeys, invalidateRelatedCache } from './cacheUtils';

export interface Comment {
  id: string;
  post_id: string;
  user_id?: string;
  author_name?: string;
  content: string;
  parent_id?: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    role: string;
    avatar_url?: string;
  };
  replies?: Comment[];
  replies_count?: number;
}

export interface CreateCommentData {
  post_id: string;
  content: string;
  author_name?: string; // For anonymous users
  parent_id?: string; // For replies
}

export interface UpdateCommentData {
  id: string;
  content: string;
}

// Get comments for a post
const _getPostComments = async (postId: string): Promise<{ data: Comment[] | null; error: any }> => {
  try {
    console.log('💬 Loading comments for post:', postId);
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available, using mock data');
      return { data: getMockComments(postId), error: null };
    }

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles(id, full_name, role, avatar_url)
      `)
      .eq('post_id', postId)
      .eq('approved', true)
      .is('parent_id', null) // Only top-level comments
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Supabase error loading comments:', error);
      console.log('🔄 Falling back to mock data');
      return { data: getMockComments(postId), error: null };
    }

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select(`
            *,
            author:profiles(id, full_name, role, avatar_url)
          `)
          .eq('parent_id', comment.id)
          .eq('approved', true)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          replies: replies || [],
          replies_count: replies?.length || 0
        };
      })
    );

    console.log('✅ Comments loaded from Supabase:', commentsWithReplies.length);
    return { data: commentsWithReplies, error: null };
  } catch (error) {
    console.warn('💬 Error fetching comments from Supabase, using mock data:', error);
    return { data: getMockComments(postId), error: null };
  }
};

// Cached version of getPostComments
export const getPostComments = withCache(
  _getPostComments,
  (postId) => cacheKeys.postComments(postId),
  2 * 60 * 1000 // 2 minutes TTL for comments
);

// Create new comment
export const createComment = async (commentData: CreateCommentData): Promise<{ data: Comment | null; error: any }> => {
  try {
    console.log('💬 Creating comment:', commentData);
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available, using mock');
      // Mock comment creation
      const newComment: Comment = {
        id: Date.now().toString(),
        post_id: commentData.post_id,
        user_id: undefined,
        author_name: commentData.author_name || 'Anonim',
        content: commentData.content,
        parent_id: commentData.parent_id,
        approved: true, // Auto-approved
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { data: newComment, error: null };
    }

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Current user for comment:', user?.email || 'anonymous');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: commentData.post_id,
        user_id: user?.id,
        author_name: user ? undefined : commentData.author_name,
        content: commentData.content,
        parent_id: commentData.parent_id,
        approved: true // Auto-approve comments
      })
      .select(`
        *,
        author:profiles(id, full_name, role, avatar_url)
      `)
      .single();

    if (error) {
      console.error('❌ Error creating comment:', error);
      return { data: null, error };
    }

    // Invalidate related cache
    invalidateRelatedCache('comment', commentData.post_id);
    dataCache.delete(cacheKeys.postComments(commentData.post_id));

    console.log('✅ Comment created successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Exception creating comment:', error);
    return { data: null, error };
  }
};

// Update comment
export const updateComment = async (commentData: UpdateCommentData): Promise<{ data: Comment | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: null, error: { message: 'Supabase not available' } };
    }

    const { data, error } = await supabase
      .from('comments')
      .update({
        content: commentData.content,
        approved: true // Keep approved after edit
      })
      .eq('id', commentData.id)
      .select(`
        *,
        author:profiles(id, full_name, role, avatar_url)
      `)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Delete comment
export const deleteComment = async (commentId: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { error: { message: 'Supabase not available' } };
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Approve comment (admin only)
export const approveComment = async (commentId: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { error: { message: 'Supabase not available' } };
    }

    const { error } = await supabase
      .from('comments')
      .update({ approved: true })
      .eq('id', commentId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Get all comments for admin
export const getAllComments = async (): Promise<{ data: Comment[] | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles(id, full_name, role, avatar_url),
        post:posts(id, title, slug)
      `)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Mock data fallback
const getMockComments = (postId: string): Comment[] => [
  {
    id: '1',
    post_id: postId,
    user_id: 'user-1',
    content: 'Bu maqola juda foydali bo\'ldi! Shifokorimga ko\'rsatdim va u ham ma\'qulladi. Rahmat!',
    approved: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    author: {
      id: 'user-1',
      full_name: 'Malika Karimova',
      role: 'patient',
      avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    replies: [
      {
        id: '1-1',
        post_id: postId,
        user_id: 'doctor-1',
        content: 'Xush kelibsiz! Agar qo\'shimcha savollaringiz bo\'lsa, bemalol so\'rang.',
        parent_id: '1',
        approved: true,
        created_at: new Date(Date.now() - 43200000).toISOString(),
        updated_at: new Date(Date.now() - 43200000).toISOString(),
        author: {
          id: 'doctor-1',
          full_name: 'Dr. Aziza Karimova',
          role: 'doctor',
          avatar_url: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100'
        }
      }
    ],
    replies_count: 1
  },
  {
    id: '2',
    post_id: postId,
    author_name: 'Anonim Bemor',
    content: 'Menda ham shunga o\'xshash belgilar bor. Qaysi shifokorga murojaat qilishim kerak?',
    approved: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    replies: [],
    replies_count: 0
  },
  {
    id: '3',
    post_id: postId,
    user_id: 'user-3',
    content: 'Juda tushunarli yozilgan. Oilamdagi boshqa a\'zolarga ham ko\'rsataman.',
    approved: true,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
    author: {
      id: 'user-3',
      full_name: 'Akmal Toshmatov',
      role: 'patient'
    },
    replies: [],
    replies_count: 0
  }
];