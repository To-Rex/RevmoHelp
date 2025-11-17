import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 700000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('/pages/admin/') || id.includes('AdminLogin') || id.includes('/lib/')) {
            if (id.includes('Dashboard') || id.includes('Settings') || id.includes('AdminsManagement') || id.includes('AdminLogin') || id.includes('/lib/') || id.includes('PostsManagement') || id.includes('CreatePost') || id.includes('StaticPagesManagement')) {
              return 'adminCore';
            } else if (id.includes('UsersManagement')) {
              return 'adminUsers';
            } else if (id.includes('DoctorsManagement') || id.includes('DiseasesManagement') || id.includes('PatientStoriesManagement')) {
              return 'adminMedical';
            } else if (id.includes('Analytics') || id.includes('HomepageManagement') || id.includes('NotificationsManagement') || id.includes('PartnersManagement')) {
              return 'adminOther';
            } else {
              return 'admin';
            }
          }
          if (id.includes('/pages/') && (id.includes('Doctor') || id.includes('doctor-'))) {
            return 'doctor';
          }
          if (id.includes('/pages/') && ['Home','Posts','PostDetail','Doctors','DoctorProfile','QA','QuestionDetail','About','Contact','Partnership','Login','Register','Profile','FAQ'].some(p => id.includes(p))) {
            return 'publicCore';
          }
          if (id.includes('/pages/') && ['ConsultationForm','Privacy','DataSecurity','Terms','PartnerDetail','PatientStories','PatientStoryDetail','Diseases','DiseaseDetail','TelegramLogin','TelegramVerify'].some(p => id.includes(p))) {
            return 'publicExtended';
          }
          if (id.includes('/components/')) {
            return 'shared';
          }
        },
      },
    },
  },
});
