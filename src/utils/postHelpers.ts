import { FileText, Image as ImageIcon, Video } from 'lucide-react';
import type { Post } from '../types';

export const getPostTypeIcon = (post: Post) => {
  if (post.youtube_url) return Video;
  if (post.featured_image_url) return ImageIcon;
  return FileText;
};

export const getPostTypeLabel = (post: Post) => {
  if (post.youtube_url) return 'Video';
  if (post.featured_image_url) return 'Rasm';
  return 'Matn';
};

export const getPostTypeColor = (post: Post) => {
  if (post.youtube_url) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
  if (post.featured_image_url) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
  return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
};