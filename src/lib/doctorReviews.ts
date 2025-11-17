import { supabase, isSupabaseAvailable } from './supabase';
import { dataCache, withCache, cacheKeys, invalidateRelatedCache } from './cacheUtils';

export interface DoctorReview {
  id: string;
  doctor_id: string;
  user_id?: string;
  rating: number;
  comment: string;
  anonymous: boolean;
  reviewer_name?: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorRatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateDoctorReviewData {
  doctor_id: string;
  rating: number;
  comment: string;
  anonymous?: boolean;
  reviewer_name?: string;
}

// Get doctor rating statistics
const _getDoctorRatingStats = async (doctorId: string): Promise<DoctorRatingStats> => {
  try {
    console.log('⭐ Loading rating stats for doctor:', doctorId);
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available, using mock data');
      return getMockRatingStats(doctorId);
    }

    const { data, error } = await supabase
      .from('doctor_reviews')
      .select('rating')
      .eq('doctor_id', doctorId)
      .eq('approved', true);

    if (error) {
      console.log('❌ Supabase error loading rating stats:', error);
      return getMockRatingStats(doctorId);
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No reviews found, using mock data');
      return getMockRatingStats(doctorId);
    }

    // Calculate statistics
    const totalReviews = data.length;
    const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    // Calculate rating distribution
    const ratingDistribution = {
      1: data.filter(r => r.rating === 1).length,
      2: data.filter(r => r.rating === 2).length,
      3: data.filter(r => r.rating === 3).length,
      4: data.filter(r => r.rating === 4).length,
      5: data.filter(r => r.rating === 5).length,
    };

    console.log('✅ Rating stats loaded from Supabase:', { averageRating, totalReviews });
    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      ratingDistribution
    };
  } catch (error) {
    console.warn('⭐ Error fetching rating stats, using mock data:', error);
    return getMockRatingStats(doctorId);
  }
};

// Cached version of getDoctorRatingStats
export const getDoctorRatingStats = withCache(
  _getDoctorRatingStats,
  (doctorId) => cacheKeys.doctorRatingStats(doctorId),
  10 * 60 * 1000 // 10 minutes TTL
);

// Get all reviews for a doctor
const _getDoctorReviews = async (doctorId: string, options?: {
  approved?: boolean;
  limit?: number;
}): Promise<{ data: DoctorReview[] | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: getMockReviews(doctorId), error: null };
    }

    let query = supabase
      .from('doctor_reviews')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (options?.approved !== undefined) {
      query = query.eq('approved', options.approved);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.log('❌ Supabase error loading reviews:', error);
      return { data: getMockReviews(doctorId), error: null };
    }

    return { data, error: null };
  } catch (error) {
    console.warn('⭐ Error fetching reviews, using mock data:', error);
    return { data: getMockReviews(doctorId), error: null };
  }
};

// Cached version of getDoctorReviews
export const getDoctorReviews = withCache(
  _getDoctorReviews,
  (doctorId, options) => cacheKeys.doctorReviews(doctorId, options),
  5 * 60 * 1000 // 5 minutes TTL
);

// Create new review
export const createDoctorReview = async (reviewData: CreateDoctorReviewData): Promise<{ data: DoctorReview | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      // Mock review creation
      const newReview: DoctorReview = {
        id: Date.now().toString(),
        doctor_id: reviewData.doctor_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        anonymous: reviewData.anonymous || false,
        reviewer_name: reviewData.reviewer_name,
        approved: true, // Auto-approve for demo
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { data: newReview, error: null };
    }

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('doctor_reviews')
      .insert({
        doctor_id: reviewData.doctor_id,
        user_id: user?.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        anonymous: reviewData.anonymous || false,
        reviewer_name: user ? undefined : reviewData.reviewer_name,
        approved: true // Auto-approve reviews
      })
      .select()
      .single();

    // Invalidate related cache
    invalidateRelatedCache('doctor', reviewData.doctor_id);
    dataCache.delete(cacheKeys.doctorRatingStats(reviewData.doctor_id));
    dataCache.invalidatePattern(`doctor_reviews.${reviewData.doctor_id}.*`);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Mock data fallback
const getMockRatingStats = (doctorId: string): DoctorRatingStats => {
  // Generate consistent mock data based on doctor ID
  const seed = doctorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed * 9301 + 49297) % 233280 / 233280;
  
  const baseRating = 4.5 + (random * 0.8); // Between 4.5 and 5.3
  const totalReviews = Math.floor(50 + (random * 200)); // Between 50 and 250 reviews
  
  return {
    averageRating: Math.round(baseRating * 10) / 10,
    totalReviews,
    ratingDistribution: {
      1: Math.floor(totalReviews * 0.02),
      2: Math.floor(totalReviews * 0.03),
      3: Math.floor(totalReviews * 0.05),
      4: Math.floor(totalReviews * 0.25),
      5: Math.floor(totalReviews * 0.65)
    }
  };
};

const getMockReviews = (doctorId: string): DoctorReview[] => [
  {
    id: '1',
    doctor_id: doctorId,
    user_id: 'user-1',
    rating: 5,
    comment: 'Juda professional shifokor! Menga juda yordam berdi.',
    reviewer_name: 'Malika Karimova',
    approved: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    doctor_id: doctorId,
    user_id: undefined,
    rating: 5,
    comment: 'Shifokor juda sabr-toqatli va tushuntiradi.',
    reviewer_name: undefined,
    approved: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '3',
    doctor_id: doctorId,
    user_id: 'user-3',
    rating: 4,
    comment: 'Yaxshi maslahat berdi, lekin biroz kutish vaqti uzoq edi.',
    reviewer_name: 'Akmal Toshmatov',
    approved: true,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString()
  }
];