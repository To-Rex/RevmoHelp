import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Star, MapPin, Calendar, Award } from 'lucide-react';
import { getDoctors } from '../../lib/doctors';
import { getDoctorRatingStats } from '../../lib/doctorReviews';
import { getDoctorReviews } from '../../lib/doctorReviews';
import { dataCache } from '../../lib/cache';
import type { Doctor } from '../../lib/doctors';

interface FeaturedDoctorsProps {
  doctors?: Doctor[];
}

const FeaturedDoctors: React.FC<FeaturedDoctorsProps> = ({ doctors = [] }) => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const [loadedDoctors, setLoadedDoctors] = useState<Doctor[]>([]);
  const [doctorRatings, setDoctorRatings] = useState<Record<string, { averageRating: number; totalReviews: number }>>({});
  const [doctorComments, setDoctorComments] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, [i18n.language]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading featured doctors...');
      
      // Check cache first using the cache system
      const cacheKey = `featured_doctors_${i18n.language}`;
      const cachedData = dataCache.get(cacheKey);
      
      if (cachedData) {
        setLoadedDoctors(cachedData.doctors);
        setDoctorRatings(cachedData.ratings);
        setDoctorComments(cachedData.comments);
        setDataLoaded(true);
        setLoading(false);
        console.log('📦 Using cached featured doctors data');
        return;
      }
      
      const { data, error } = await getDoctors(i18n.language, { active: true, verified: true, limit: 4 });
      
      if (data) {
        console.log('✅ Featured doctors loaded:', data.length);
        setLoadedDoctors(data);
        
        // Load ratings and comments for each doctor
        const dataPromises = data.map(async (doctor) => {
          const [stats, reviews] = await Promise.all([
            getDoctorRatingStats(doctor.id),
            getDoctorReviews(doctor.id, { approved: true })
          ]);
          return {
            doctorId: doctor.id,
            stats,
            commentsCount: reviews.data?.length || 0
          };
        });
        
        const results = await Promise.all(dataPromises);
        const ratingsMap = results.reduce((acc, { doctorId, stats }) => {
          acc[doctorId] = {
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews
          };
          return acc;
        }, {} as Record<string, { averageRating: number; totalReviews: number }>);
        
        const commentsMap = results.reduce((acc, { doctorId, commentsCount }) => {
          acc[doctorId] = commentsCount;
          return acc;
        }, {} as Record<string, number>);
        
        setDoctorRatings(ratingsMap);
        setDoctorComments(commentsMap);
        
        // Cache the results using the cache system
        const cacheData = {
          doctors: data,
          ratings: ratingsMap,
          comments: commentsMap
        };
        dataCache.set(cacheKey, cacheData, 3 * 60 * 1000); // 3 minutes TTL
        
        setDataLoaded(true);
      } else if (error) {
        console.log('❌ Error loading featured doctors:', error);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockDoctors: Doctor[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'aziza.karimova@revmoinfo.uz',
      full_name: 'Dr. Aziza Karimova',
      role: 'doctor',
      avatar_url: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Revmatologiya bo\'yicha 15 yillik tajribaga ega mutaxassis. Revmatoid artrit va boshqa autoimmun kasalliklar bo\'yicha ekspert.',
      specialization: 'Revmatologiya',
      experience_years: 15,
      certificates: ['Revmatologiya diplomi', 'Autoimmun kasalliklar sertifikati'],
      verified: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'bobur.toshmatov@revmoinfo.uz',
      full_name: 'Dr. Bobur Toshmatov',
      role: 'doctor',
      avatar_url: 'https://images.pexels.com/photos/6098828/pexels-photo-6098828.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Ortopediya va travmatologiya mutaxassisi. Qo\'shma kasalliklari va jarrohlik amaliyotlari bo\'yicha tajribali.',
      specialization: 'Ortopediya va travmatologiya',
      experience_years: 12,
      certificates: ['Ortopediya diplomi', 'Jarrohlik sertifikati'],
      verified: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'nilufar.abdullayeva@revmoinfo.uz',
      full_name: 'Dr. Nilufar Abdullayeva',
      role: 'doctor',
      avatar_url: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Reabilitatsiya va jismoniy terapiya mutaxassisi. Harakat terapiyasi va bemor reabilitatsiyasi bo\'yicha ekspert.',
      specialization: 'Reabilitatsiya va jismoniy terapiya',
      experience_years: 10,
      certificates: ['Jismoniy terapiya diplomi', 'Reabilitatsiya sertifikati'],
      verified: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      email: 'sardor.rahimov@revmoinfo.uz',
      full_name: 'Dr. Sardor Rahimov',
      role: 'doctor',
      avatar_url: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Ichki kasalliklar va kardiologiya mutaxassisi. Yurak-qon tomir kasalliklari va metabolik buzilishlar bo\'yicha tajribali.',
      specialization: 'Ichki kasalliklar, Kardiologiya',
      experience_years: 18,
      certificates: ['Ichki kasalliklar diplomi', 'Kardiologiya sertifikati'],
      verified: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  ];

  const displayDoctors = loadedDoctors.length > 0 ? loadedDoctors : (doctors.length > 0 ? doctors : mockDoctors);

  const formatExperience = (years: number) => {
    switch (i18n.language) {
      case 'ru': return `${years} лет опыта`;
      case 'en': return `${years} years experience`;
      default: return `${years} yil tajriba`;
    }
  };
  const formatReviews = (count: number) => {
    switch (i18n.language) {
      case 'ru': return `${count} отзывов`;
      case 'en': return `${count} reviews`;
      default: return `${count} sharh`;
    }
  };
  const certsLabel = i18n.language === 'ru' ? 'Сертификаты:' : i18n.language === 'en' ? 'Certificates:' : 'Sertifikatlar:';
  const moreLabel = i18n.language === 'ru' ? 'ещё' : i18n.language === 'en' ? 'more' : "ko'proq";
  const viewProfileLabel = i18n.language === 'ru' ? 'Смотреть профиль' : i18n.language === 'en' ? 'View profile' : "Profil ko'rish";

  if (loading) {
    return (
      <section className="py-20 theme-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="theme-text-muted">Shifokorlar yuklanmoqda...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 theme-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold theme-text mb-4">
            {t('ourDoctors')}
          </h2>
          <p className="text-xl theme-text-secondary max-w-2xl mx-auto">
            {t('experiencedDoctorsHelp')}
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayDoctors.slice(0, 3).map((doctor, index) => (
            <div
              key={doctor.id}
              className="bg-white dark:bg-white rounded-3xl theme-shadow-lg hover:theme-shadow-xl transition-all duration-500 hover:-translate-y-2 ring-1 ring-[#CAD8D6] hover:ring-[#94ABA3] border-0 overflow-hidden animate-fade-in h-full flex flex-col group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Doctor Photo */}
              <div className="relative overflow-hidden">
                <img
                  src={doctor.avatar_url || `https://images.pexels.com/photos/559829/pexels-photo-559829.jpeg?auto=compress&cs=tinysrgb&w=400`}
                  alt={doctor.full_name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                {doctor.verified && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <Award size={16} />
                  </div>
                )}
              {/* Rating badge */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                <Star size={14} className="text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-900">{doctorRatings[doctor.id]?.averageRating?.toFixed(1) || '4.9'}</span>
              </div>
              {/* Hover Indicator */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-gray-900 font-semibold flex items-center space-x-2">
                    <ArrowRight size={16} />
                    <span>{viewProfileLabel}</span>
                  </span>
                </div>
              </div>
            </div>

              {/* Doctor Info */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold theme-text mb-2 group-hover:theme-accent transition-colors duration-200">
                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="hover:theme-accent transition-colors duration-200"
                  >
                    {doctor.full_name}
                  </Link>
                </h3>
                
                <p className="theme-accent font-medium mb-3">
                  {doctor.specialization}
                </p>

                <p className="theme-text-secondary text-sm mb-4 line-clamp-3">
                  {doctor.bio}
                </p>

                {/* Experience */}
                <div className="flex items-center justify-between text-sm theme-text-muted mb-4">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{formatExperience(doctor.experience_years)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star size={14} className="text-yellow-500" />
                    <span>
                      {doctorRatings[doctor.id]?.averageRating?.toFixed(1) || '4.9'}
                      ({formatReviews(doctorRatings[doctor.id]?.totalReviews ?? doctorComments[doctor.id] ?? 0)})
                    </span>
                  </div>
                </div>

                {/* Certificates */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold theme-text mb-2">{certsLabel}</h4>
                  <div className="flex flex-wrap gap-1">
                    {doctor.certificates?.slice(0, 2).map((cert, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                        {cert}
                      </span>
                    ))}
                    {doctor.certificates && doctor.certificates.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                        +{doctor.certificates.length - 2} {moreLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Doctors Button */}
        <div className="text-center">
          <Link
            to="/doctors"
            className="inline-flex items-center space-x-2 theme-border border theme-accent px-8 py-4 rounded-lg font-semibold hover:theme-bg-tertiary transition-colors duration-300"
          >
            <span>{t('viewAllDoctors')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDoctors;
