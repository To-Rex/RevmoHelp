import { FileText, Image as ImageIcon, Video } from 'lucide-react';
import type { PatientStory } from '../lib/patientStories';

export const getContentTypeIcon = (contentType: string) => {
  switch (contentType) {
    case 'image': return ImageIcon;
    case 'video': return Video;
    default: return FileText;
  }
};

export const getContentTypeLabel = (contentType: string) => {
  switch (contentType) {
    case 'image': return 'Rasm Hikoyasi';
    case 'video': return 'Video Hikoya';
    default: return 'Matn Hikoyasi';
  }
};

export const getContentTypeColor = (contentType: string) => {
  switch (contentType) {
    case 'image': return 'bg-teal-600';
    case 'video': return 'bg-red-600';
    default: return 'bg-blue-600';
  }
};
