import { supabase, isSupabaseAvailable } from './supabase';
import { dataCache, withCache, cacheKeys, invalidateRelatedCache } from './cache';

export interface Question {
  id: string;
  title: string;
  content: string;
  slug: string;
  author_id: string;
  author?: {
    id: string;
    full_name: string;
    role: string;
    avatar_url?: string;
  };
  category_id?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  tags: string[];
  status: 'open' | 'answered' | 'closed';
  views_count: number;
  votes_count: number;
  answers_count: number;
  best_answer_id?: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  content: string;
  question_id: string;
  author_id: string;
  author?: {
    id: string;
    full_name: string;
    role: string;
    avatar_url?: string;
  };
  is_best_answer: boolean;
  votes_count: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionVote {
  id: string;
  question_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface AnswerVote {
  id: string;
  answer_id: string;
  user_id: string;
  vote_type: 'up' | 'down' | 'helpful';
  created_at: string;
}

export interface CreateQuestionData {
  title: string;
  content: string;
  category_id?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface CreateAnswerData {
  content: string;
  question_id: string;
}

// Get all questions with filters
const _getQuestions = async (options?: {
  status?: string;
  category_id?: string;
  author_id?: string;
  limit?: number;
  offset?: number;
  allowMock?: boolean;
}): Promise<{ data: Question[] | null; error: any }> => {
  try {
    console.log('❓ Loading questions from Supabase...');
    
    if (!isSupabaseAvailable() || !supabase) {
      console.log('⚠️ Supabase not available');
      return { data: options?.allowMock === false ? [] : getMockQuestions(), error: null };
    }

    let query = supabase
      .from('questions')
      .select(`
        *,

        category:categories!questions_category_id_fkey(id, name, slug, color)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
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
      console.log('❌ Supabase error loading questions:', error);
      return { data: options?.allowMock === false ? [] : getMockQuestions(), error: null };
    }

    console.log('✅ Questions loaded from Supabase:', data?.length || 0);
    return { data, error: null };
  } catch (error) {
    console.warn('❓ Error fetching questions from Supabase:', error);
    return { data: options?.allowMock === false ? [] : getMockQuestions(), error: null };
  }
};

// Cached version of getQuestions
export const getQuestions = withCache(
  _getQuestions,
  (options) => `questions.${JSON.stringify(options || {})}`,
  2 * 60 * 1000 // 2 minutes TTL
);

// Get single question by slug
const _getQuestionBySlug = async (slug: string): Promise<{ data: Question | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      const mockQuestions = getMockQuestions();
      const question = mockQuestions.find(q => q.slug === slug);
      return { data: question || null, error: question ? null : { message: 'Question not found' } };
    }

    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,

        category:categories!questions_category_id_fkey(id, name, slug, color)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.log('❌ Supabase error loading question:', error);
      const mockQuestions = getMockQuestions();
      const question = mockQuestions.find(q => q.slug === slug);
      return { data: question || null, error: null };
    }

    // Increment view count
    await supabase
      .from('questions')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', data.id);

    return { data, error: null };
  } catch (error) {
    console.warn('❓ Error fetching question by slug:', error);
    const mockQuestions = getMockQuestions();
    const question = mockQuestions.find(q => q.slug === slug);
    return { data: question || null, error: null };
  }
};

export const getQuestionBySlug = withCache(
  _getQuestionBySlug,
  (slug) => `question.${slug}`,
  5 * 60 * 1000 // 5 minutes TTL
);

// Get answers for a question
const _getAnswers = async (questionId: string): Promise<{ data: Answer[] | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return { data: getMockAnswers(questionId), error: null };
    }

    const { data, error } = await supabase
      .from('answers')
      .select(`
        *,
        author:profiles!answers_author_id_fkey(id, full_name, role, avatar_url)
      `)
      .eq('question_id', questionId)
      .order('is_best_answer', { ascending: false })
      .order('votes_count', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.log('❌ Supabase error loading answers:', error);
      return { data: getMockAnswers(questionId), error: null };
    }

    return { data, error: null };
  } catch (error) {
    console.warn('❓ Error fetching answers:', error);
    return { data: getMockAnswers(questionId), error: null };
  }
};

export const getAnswers = withCache(
  _getAnswers,
  (questionId) => `answers.${questionId}`,
  2 * 60 * 1000 // 2 minutes TTL
);

// Create a new question
// Simple keyword extraction for tags
const extractTags = (title: string, content: string, maxTags: number = 5): string[] => {
  const text = `${title} ${content}`.toLowerCase();
  const words = text
    .replace(/[^a-zа-яё0-9\s'-]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const stop = new Set([
    // Uzbek stopwords
    'va','ham','bilan','uchun','bu','shu','u','ko\'p','kam','qanday','qandaydir','bor','yo\'q','emas','lekin','yoki','yoki','boshqa','hali','shuningdek','degan','deb','qilib','qilmoq','da','ning','ga','dan','ni','ta','q','bir','ikki','uch','to\'rt','besh','oltita','etti','sakkiz','to\'qqiz','o\'n',
    // Russian
    'и','в','во','не','что','он','на','я','с','со','как','а','то','все','она','так','его','но','да','ты','к','у','же','вы','за','бы','по','ее','мне','есть','если','из','уже','только','мы','такой','еще','для','чтобы','когда','тогда','без','про','ли','быть',
    // English
    'the','a','an','and','or','but','if','then','else','for','of','on','in','at','to','from','by','with','is','are','was','were','be','been','being','it','this','that','these','those','as','about','into','over','after','before','between','during','out','up','down'
  ]);
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (w.length < 3) continue;
    if (stop.has(w)) continue;
    const key = w.replace(/^-+|-+$/g,'');
    if (!key) continue;
    freq[key] = (freq[key] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a,b)=>b[1]-a[1])
    .slice(0, maxTags)
    .map(([k])=>k);
};

export const createQuestion = async (questionData: CreateQuestionData): Promise<{ data: Question | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error('Supabase not available');
    }

    const userRes = await supabase.auth.getUser();
    const user = userRes.data?.user || null;

    // Generate slug from title
    const slug = questionData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Auto meta fields
    const metaTitle = (questionData.meta_title || questionData.title).slice(0, 60);
    const plainContent = questionData.content.replace(/\s+/g, ' ').trim();
    const metaDescription = (questionData.meta_description || plainContent).slice(0, 160);

    // Auto tags if not provided
    const autoTags = questionData.tags && questionData.tags.length > 0
      ? questionData.tags
      : extractTags(questionData.title, questionData.content);

    const insertPayload = {
      title: questionData.title,
      content: questionData.content,
      category_id: questionData.category_id || null,
      tags: autoTags,
      meta_title: metaTitle,
      meta_description: metaDescription,
      slug: `${slug}-${Date.now()}`,
      author_id: user ? user.id : null
    } as any;

    const { data, error } = await supabase
      .from('questions')
      .insert(insertPayload)
      .select(`
        *,

        category:categories!questions_category_id_fkey(id, name, slug, color)
      `)
      .single();

    if (error) {
      console.error('Supabase insert error details:', error);
      // Return structured error
      return { data: null, error };
    }

    // Invalidate cache
    invalidateRelatedCache(cacheKeys.QUESTIONS);

    return { data, error: null };
  } catch (err) {
    const safe = err instanceof Error ? err : (err && typeof err === 'object' ? JSON.stringify(err) : String(err));
    console.error('❌ Error creating question:', safe);
    return { data: null, error: typeof err === 'object' ? err : { message: safe } };
  }
};

// Create a new answer
export const createAnswer = async (answerData: CreateAnswerData): Promise<{ data: Answer | null; error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error('Supabase not available');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user is a doctor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'doctor') {
      throw new Error('Only doctors can answer questions');
    }

    const { data, error } = await supabase
      .from('answers')
      .insert({
        ...answerData,
        author_id: user.id
      })
      .select(`
        *,
        author:profiles!answers_author_id_fkey(id, full_name, role, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Invalidate cache
    invalidateRelatedCache(cacheKeys.QUESTIONS);
    invalidateRelatedCache(`answers.${answerData.question_id}`);
    
    return { data, error: null };
  } catch (error) {
    console.error('❌ Error creating answer:', error);
    return { data: null, error };
  }
};

// Vote on a question
export const voteQuestion = async (questionId: string, voteType: 'up' | 'down'): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error('Supabase not available');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('question_votes')
      .select('*')
      .eq('question_id', questionId)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if same type
        await supabase
          .from('question_votes')
          .delete()
          .eq('id', existingVote.id);
      } else {
        // Update vote type
        await supabase
          .from('question_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
      }
    } else {
      // Create new vote
      await supabase
        .from('question_votes')
        .insert({
          question_id: questionId,
          user_id: user.id,
          vote_type: voteType
        });
    }

    // Invalidate cache
    invalidateRelatedCache(cacheKeys.QUESTIONS);
    
    return { error: null };
  } catch (error) {
    console.error('❌ Error voting on question:', error);
    return { error };
  }
};

// Vote on an answer
export const voteAnswer = async (answerId: string, voteType: 'up' | 'down' | 'helpful'): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error('Supabase not available');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user already voted with this type
    const { data: existingVote } = await supabase
      .from('answer_votes')
      .select('*')
      .eq('answer_id', answerId)
      .eq('user_id', user.id)
      .eq('vote_type', voteType)
      .single();

    if (existingVote) {
      // Remove vote if exists
      await supabase
        .from('answer_votes')
        .delete()
        .eq('id', existingVote.id);
    } else {
      // For up/down votes, remove opposite vote first
      if (voteType === 'up' || voteType === 'down') {
        const oppositeType = voteType === 'up' ? 'down' : 'up';
        await supabase
          .from('answer_votes')
          .delete()
          .eq('answer_id', answerId)
          .eq('user_id', user.id)
          .eq('vote_type', oppositeType);
      }

      // Create new vote
      await supabase
        .from('answer_votes')
        .insert({
          answer_id: answerId,
          user_id: user.id,
          vote_type: voteType
        });
    }

    // Invalidate cache
    const { data: answer } = await supabase
      .from('answers')
      .select('question_id')
      .eq('id', answerId)
      .single();

    if (answer) {
      invalidateRelatedCache(`answers.${answer.question_id}`);
    }
    
    return { error: null };
  } catch (error) {
    console.error('❌ Error voting on answer:', error);
    return { error };
  }
};

// Mark answer as best
export const markBestAnswer = async (questionId: string, answerId: string): Promise<{ error: any }> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error('Supabase not available');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user is the question author or admin
    const { data: question } = await supabase
      .from('questions')
      .select('author_id')
      .eq('id', questionId)
      .single();

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!question || (question.author_id !== user.id && !['admin', 'moderator'].includes(profile?.role))) {
      throw new Error('Only question author or admin can mark best answer');
    }

    // Remove best answer from other answers
    await supabase
      .from('answers')
      .update({ is_best_answer: false })
      .eq('question_id', questionId);

    // Mark this answer as best
    await supabase
      .from('answers')
      .update({ is_best_answer: true })
      .eq('id', answerId);

    // Update question with best answer
    await supabase
      .from('questions')
      .update({ best_answer_id: answerId })
      .eq('id', questionId);

    // Invalidate cache
    invalidateRelatedCache(cacheKeys.QUESTIONS);
    invalidateRelatedCache(`answers.${questionId}`);
    
    return { error: null };
  } catch (error) {
    console.error('❌ Error marking best answer:', error);
    return { error };
  }
};

// Get Q&A statistics
export const getQAStats = async (): Promise<{
  totalQuestions: number;
  answeredQuestions: number;
  totalAnswers: number;
  totalDoctors: number;
}> => {
  try {
    if (!isSupabaseAvailable() || !supabase) {
      return {
        totalQuestions: 156,
        answeredQuestions: 142,
        totalAnswers: 298,
        totalDoctors: 12
      };
    }

    const [questionsResult, answersResult, doctorsResult] = await Promise.all([
      supabase.from('questions').select('status', { count: 'exact' }),
      supabase.from('answers').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'doctor')
    ]);

    const totalQuestions = questionsResult.count || 0;
    const answeredQuestions = questionsResult.data?.filter(q => q.status === 'answered').length || 0;
    const totalAnswers = answersResult.count || 0;
    const totalDoctors = doctorsResult.count || 0;

    return {
      totalQuestions,
      answeredQuestions,
      totalAnswers,
      totalDoctors
    };
  } catch (error) {
    console.warn('❓ Error fetching Q&A stats:', error);
    return {
      totalQuestions: 156,
      answeredQuestions: 142,
      totalAnswers: 298,
      totalDoctors: 12
    };
  }
};

// Mock data for fallback
const getMockQuestions = (): Question[] => [
  {
    id: '1',
    title: 'Revmatoid artrit belgilari qanday?',
    content: 'Menda qo\'llarimda og\'riq va shishish bor. Bu revmatoid artrit belgisi bo\'lishi mumkinmi? Qanday tekshiruvlar o\'tkazish kerak?',
    slug: 'revmatoid-artrit-belgilari',
    author_id: 'user1',
    author: {
      id: 'user1',
      full_name: 'Aziza Karimova',
      role: 'patient',
      avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    category_id: 'cat1',
    category: {
      id: 'cat1',
      name: 'Artrit',
      slug: 'artrit',
      color: '#3B82F6'
    },
    tags: ['artrit', 'belgilar', 'diagnostika'],
    status: 'answered',
    views_count: 245,
    votes_count: 12,
    answers_count: 3,
    best_answer_id: 'ans1',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-16T14:20:00Z'
  },
  {
    id: '2',
    title: 'Osteoartroz uchun qanday mashqlar foydali?',
    content: 'Tizzalarimda osteoartroz tashxisi qo\'yilgan. Qanday jismoniy mashqlar qilishim mumkin va qaysilaridan qochishim kerak?',
    slug: 'osteoartroz-mashqlar',
    author_id: 'user2',
    author: {
      id: 'user2',
      full_name: 'Bobur Rahimov',
      role: 'patient',
      avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    category_id: 'cat2',
    category: {
      id: 'cat2',
      name: 'Artroz',
      slug: 'artroz',
      color: '#10B981'
    },
    tags: ['artroz', 'mashqlar', 'jismoniy tarbiya'],
    status: 'answered',
    views_count: 189,
    votes_count: 8,
    answers_count: 2,
    best_answer_id: 'ans3',
    created_at: '2024-01-14T09:15:00Z',
    updated_at: '2024-01-15T11:45:00Z'
  },
  {
    id: '3',
    title: 'Revmatik kasalliklarni oldini olish mumkinmi?',
    content: 'Oilamda revmatik kasalliklar ko\'p uchraydi. Men ham xavf ostidaman. Qanday profilaktika choralari mavjud?',
    slug: 'revmatik-kasalliklar-profilaktika',
    author_id: 'user3',
    author: {
      id: 'user3',
      full_name: 'Malika Tosheva',
      role: 'patient',
      avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    category_id: 'cat3',
    category: {
      id: 'cat3',
      name: 'Profilaktika',
      slug: 'profilaktika',
      color: '#F59E0B'
    },
    tags: ['profilaktika', 'genetika', 'oldini olish'],
    status: 'open',
    views_count: 156,
    votes_count: 15,
    answers_count: 0,
    created_at: '2024-01-13T16:20:00Z',
    updated_at: '2024-01-13T16:20:00Z'
  }
];

const getMockAnswers = (questionId: string): Answer[] => {
  if (questionId === '1') {
    return [
      {
        id: 'ans1',
        content: 'Revmatoid artrit belgilari quyidagilarni o\'z ichiga oladi:\n\n1. **Ertalabki qotishish** - 30 daqiqadan ortiq davom etadi\n2. **Simmetrik bo\'g\'im og\'riqlari** - ikki qo\'lda bir xil joyda\n3. **Shishish va qizarish**\n4. **Umumiy charchoq**\n\nTekshiruvlar:\n- Qon tahlili (RF, anti-CCP)\n- Rentgen\n- Ultratovush\n\nAlbatta revmatolog bilan maslahatlashing.',
        question_id: '1',
        author_id: 'doc1',
        author: {
          id: 'doc1',
          full_name: 'Dr. Shohida Nazarova',
          role: 'doctor',
          avatar_url: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150'
        },
        is_best_answer: true,
        votes_count: 18,
        helpful_count: 12,
        created_at: '2024-01-15T14:30:00Z',
        updated_at: '2024-01-15T14:30:00Z'
      }
    ];
  }
  return [];
};
