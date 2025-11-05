import { FileText, Image as ImageIcon, Video } from 'lucide-react';
import type { Disease } from '../lib/diseases';

export const getContentTypeIcon = (disease: Disease) => {
  if (disease.youtube_url) return Video;
  if (disease.featured_image_url) return ImageIcon;
  return FileText;
};

export const getContentTypeLabel = (disease: Disease) => {
  if (disease.youtube_url) return 'Video Ma\'lumot';
  if (disease.featured_image_url) return 'Rasm Ma\'lumot';
  return 'Matn Ma\'lumot';
};

export const getContentTypeColor = (disease: Disease) => {
  if (disease.youtube_url) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
  if (disease.featured_image_url) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
  return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
};