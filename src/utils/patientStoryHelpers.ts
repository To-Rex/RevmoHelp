import { FileText, Image as ImageIcon, Video } from 'lucide-react';
import type { PatientStory } from '../lib/patientStories';

export const getContentTypeIcon = (story: PatientStory) => {
  switch (story.content_type) {
    case 'image': return ImageIcon;
    case 'video': return Video;
    default: return FileText;
  }
};

export const getContentTypeLabel = (story: PatientStory) => {
  switch (story.content_type) {
    case 'image': return 'Rasm Hikoyasi';
    case 'video': return 'Video Hikoya';
    default: return 'Matn Hikoyasi';
  }
};

export const getContentTypeColor = (story: PatientStory) => {
  switch (story.content_type) {
    case 'image': return 'bg-teal-600';
    case 'video': return 'bg-red-600';
    default: return 'bg-blue-600';
  }
};
