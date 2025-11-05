export type UserRole = 'admin' | 'moderator' | 'doctor' | 'patient' | 'guest';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featured_image_url?: string;
  youtube_url?: string;
  author_id: string;
  author?: User;
  category_id: string;
  category?: Category;
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  published: boolean;
  published_at?: string;
  blocked?: boolean;
  created_at: string;
  updated_at: string;
  views_count: number;
  rating?: number;
  rating_count?: number;
  translations?: PostTranslation[];
  current_language?: string;
}

export interface PostTranslation {
  id: string;
  post_id: string;
  language: 'uz' | 'ru' | 'en';
  title: string;
  content: string;
  excerpt: string;
  meta_title?: string;
  meta_description?: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
  posts_count?: number;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  slug: string;
  author_id: string;
  author?: User;
  category_id?: string;
  category?: Category;
  tags: string[];
  status: 'open' | 'answered' | 'closed';
  answers_count: number;
  views_count: number;
  votes_count: number;
  best_answer_id?: string;
  created_at: string;
  updated_at: string;
  user_vote_type?: 'up' | 'down' | null;
}

export interface Answer {
  id: string;
  content: string;
  question_id: string;
  author_id: string;
  author?: User;
  is_best_answer: boolean;
  votes_count: number;
  helpful_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Language {
  code: 'uz' | 'ru' | 'en';
  name: string;
  nativeName: string;
}