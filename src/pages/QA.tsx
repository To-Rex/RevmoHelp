import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  Plus, 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Calendar, 
  User,
  CheckCircle,
  Clock,
  Tag,
  TrendingUp,
  Award,
  HelpCircle,
  Star
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';
import LanguageAwareLink from '../components/common/LanguageAwareLink';
import { useAuth } from '../hooks/useAuth';
import { getQuestions, createQuestion, getQAStats } from '../lib/questions';
import { getCategories } from '../lib/categories';
import type { Question, Answer } from '../types';
import type { Doctor } from '../lib/doctors';
import { getDoctors } from '../lib/doctors';
import { getDoctorRatingStats } from '../lib/doctorReviews';
import { dataCache } from '../lib/cache';

const QA: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('questions');
  const [loading, setLoading] = useState(true);
  const [askOpen, setAskOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<string>('');
  const [questionsState, setQuestionsState] = useState<any[]>([]);
  const [categoriesState, setCategoriesState] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalQuestions: 0, totalAnswers: 0, totalDoctors: 0, answeredQuestions: 0 });
  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);
  const [doctorRatings, setDoctorRatings] = useState<Record<string, { averageRating: number; totalReviews: number }>>({});

  // Load data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [qRes, cRes, sRes] = await Promise.all([
          getQuestions({ allowMock: false }),
          getCategories(),
          getQAStats()
        ]);
        if (qRes.data) setQuestionsState(qRes.data as any[]);
        if (cRes.data) setCategoriesState(cRes.data as any[]);
        if (sRes) setStats(sRes);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load Top Experts (prefer cached FeaturedDoctors)
  useEffect(() => {
    const loadTopExperts = async () => {
      try {
        const cacheKey = `featured_doctors_${i18n.language}`;
        const cached = dataCache.get(cacheKey);
        if (cached?.doctors) {
          setTopDoctors(cached.doctors.slice(0, 3));
          setDoctorRatings(cached.ratings || {});
          return;
        }
        const { data } = await getDoctors(i18n.language, { active: true, verified: true, limit: 3 });
        if (data) {
          const top3 = data.slice(0, 3);
          setTopDoctors(top3);
          const entries = await Promise.all(
            top3.map(async (d) => {
              try {
                const stats = await getDoctorRatingStats(d.id);
                return [d.id, { averageRating: stats.averageRating, totalReviews: stats.totalReviews }] as const;
              } catch {
                return [d.id, { averageRating: 4.9, totalReviews: 0 }] as const;
              }
            })
          );
          const ratingsMap = Object.fromEntries(entries);
          setDoctorRatings(ratingsMap);
          // Soft fill cache for consumers
          dataCache.set(cacheKey, { doctors: data, ratings: ratingsMap, comments: {} }, 3 * 60 * 1000);
        }
      } catch (e) {
        console.error('Failed to load top experts:', e);
      }
    };
    loadTopExperts();
  }, [i18n.language]);

  // Mock questions data
  const mockQuestions: Question[] = [];

  const baseQuestions = questionsState;
  const categories = [
    { value: 'all', label: 'Barcha kategoriyalar', count: baseQuestions.length },
    ...categoriesState.map((c: any) => ({ value: c.id, label: c.name, count: baseQuestions.filter((q: any) => q.category_id === c.id).length }))
  ];

  const statuses = [
    { value: 'all', label: 'Barcha savollar', count: baseQuestions.length },
    { value: 'open', label: 'Ochiq savollar', count: baseQuestions.filter((q: any) => q.status === 'open').length },
    { value: 'answered', label: 'Javob berilgan', count: baseQuestions.filter((q: any) => q.status === 'answered').length },
    { value: 'closed', label: 'Yopilgan', count: baseQuestions.filter((q: any) => q.status === 'closed').length }
  ];

  const filteredQuestions = baseQuestions.filter((question: any) => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || question.category_id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || question.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-800';
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'answered':
        return t('answered');
      case 'open':
        return t('open');
      case 'closed':
        return t('closed');
      default:
        return 'Unknown';
    }
  };

  const popularTags = [
    'artrit', 'artroz', 'og\'riq', 'dorilar', 'mashqlar', 
    'profilaktika', 'diagnostika', 'davolash', 'belgilar'
  ];

  const topExperts = [
    {
      id: '1',
      name: 'Dr. Aziza Karimova',
      specialty: 'Revmatologiya',
      answers: 45,
      rating: 4.9,
      avatar: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '2',
      name: 'Dr. Bobur Toshmatov',
      specialty: 'Ortopediya',
      answers: 32,
      rating: 4.8,
      avatar: 'https://images.pexels.com/photos/6098828/pexels-photo-6098828.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '3',
      name: 'Dr. Nilufar Abdullayeva',
      specialty: 'Reabilitatsiya',
      answers: 28,
      rating: 4.9,
      avatar: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title="Savol-Javob"
        description="Revmatik kasalliklar bo'yicha savollar va javoblar. Professional shifokorlardan maslahat oling."
        keywords="savol javob, tibbiy maslahat, revmatik kasalliklar, shifokor maslahati"
        url="https://revmohelp.uz/qa"
      />

      <div className="min-h-screen theme-bg">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 dark:from-blue-400/5 dark:to-teal-400/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <HelpCircle size={16} className="text-blue-600" />
              <span className="text-blue-800 text-sm font-medium">Professional Medical Q&A</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">{t('qaTitle')}</span>
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8">
              <span className="text-lg font-bold mb-2 block">{t('haveQuestion')}</span>
              {t('getFreeAdvice')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setAskOpen(true)} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2">
                <Plus size={20} />
                <span>{t('askQuestionBtn')}</span>
              </button>
              <Link
                to="/doctors"
                className="bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors duration-200 transform hover:scale-105 shadow-lg"
              >
                {t('meetDoctors')}
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl theme-shadow-lg p-6 text-center hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-gray-200/60 dark:ring-white/10">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-white" />
              </div>
              <div className="text-2xl font-bold theme-text mb-1">{stats.totalQuestions.toLocaleString()}</div>
              <div className="theme-text-secondary">{t('totalQuestions')}</div>
            </div>
            <div className="bg-white rounded-2xl theme-shadow-lg p-6 text-center hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-gray-200/60 dark:ring-white/10">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div className="text-2xl font-bold theme-text mb-1">{stats.totalAnswers.toLocaleString()}</div>
              <div className="theme-text-secondary">{t('totalAnswers')}</div>
            </div>
            <div className="bg-white rounded-2xl theme-shadow-lg p-6 text-center hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-gray-200/60 dark:ring-white/10">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award size={24} className="text-white" />
              </div>
              <div className="text-2xl font-bold theme-text mb-1">{stats.totalDoctors.toLocaleString()}</div>
              <div className="theme-text-secondary">{t('expertDoctors')}</div>
            </div>
            <div className="bg-white rounded-2xl theme-shadow-lg p-6 text-center hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-gray-200/60 dark:ring-white/10">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div className="text-2xl font-bold theme-text mb-1">{stats.totalQuestions ? Math.round((stats.answeredQuestions / stats.totalQuestions) * 100) : 0}%</div>
              <div className="theme-text-secondary">{t('responseRate')}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Search and Filters */}
              <div className="bg-white rounded-2xl theme-shadow-lg p-6 ring-1 ring-gray-200/60 dark:ring-white/10">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                      <input
                        type="text"
                        placeholder="Savollar bo'yicha qidiring..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white theme-text outline-none border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="lg:w-56">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl bg-white theme-text outline-none border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label} ({category.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="lg:w-48">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl bg-white theme-text outline-none border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label} ({status.count})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="theme-text-secondary">
                  <span className="font-semibold theme-text">{filteredQuestions.length}</span> ta savol topildi
                </p>
                <button onClick={() => setAskOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-md">
                  <Plus size={18} />
                  <span>Yangi savol</span>
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {filteredQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-2xl theme-shadow-lg hover:theme-shadow-xl transition-all duration-300 p-6 animate-fade-in transform hover:-translate-y-1 ring-1 ring-gray-200/60 dark:ring-white/10"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {question.category && (
                            <span
                              className="px-3 py-1 rounded-full text-white text-sm font-medium"
                              style={{ backgroundColor: question.category.color }}
                            >
                              {question.category.name}
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(question.status)}`}>
                            {getStatusLabel(question.status)}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors duration-200">
                          <LanguageAwareLink to={`/questions/${question.slug}`}>
                            {question.title}
                          </LanguageAwareLink>
                        </h3>
                        
                        <p className="theme-text-secondary leading-relaxed mb-4 line-clamp-2">
                          {question.content}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {question.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 theme-bg-tertiary theme-text-secondary text-sm rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 cursor-pointer"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm theme-text-muted">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User size={14} />
                              <span>{question.author?.full_name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{formatDate(question.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <MessageSquare size={14} />
                              <span>{question.answers_count} javob</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye size={14} />
                              <span>{question.views_count} ko'rishlar</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredQuestions.length === 0 && (
                <div className="text-center py-16">
                  <div className="theme-text-muted mb-4">
                    <Search size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold theme-text-secondary mb-2">
                    Hech qanday savol topilmadi
                  </h3>
                  <p className="theme-text-muted mb-6">
                    Qidiruv so'zini o'zgartiring yoki yangi savol bering
                  </p>
                  <button onClick={() => setAskOpen(true)} className="theme-accent-bg text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105">
                    Birinchi savol berish
                  </button>
                </div>
              )}

              {/* Load More */}
              {filteredQuestions.length > 0 && (
                <div className="text-center">
                  <button onClick={() => setAskOpen(true)} className="bg-white border-2 border-blue-600 theme-accent px-8 py-4 rounded-xl font-semibold hover:theme-bg-tertiary transition-colors duration-200 transform hover:scale-105">
                    Ko'proq savollarni ko'rish
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Popular Tags */}
              <div className="bg-white rounded-2xl theme-shadow-lg p-6 ring-1 ring-gray-200/60 dark:ring-white/10">
                <h3 className="text-lg font-bold theme-text mb-4">Mashhur Teglar</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      className="px-3 py-1 bg-[#CAD8D6] text-[#3E433B] dark:bg-red dark:text-black text-xs rounded-full font-medium border-0 hover:opacity-90 transition-colors duration-200"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Experts */}
              <div className="bg-white rounded-2xl theme-shadow-lg p-6 ring-1 ring-gray-200/60 dark:ring-white/10">
                <h3 className="text-lg font-bold theme-text mb-4">Top Ekspertlar</h3>
                <div className="space-y-4">
                  {(topDoctors.length ? topDoctors.slice(0,3) : topExperts).map((d: any) => (
                    <div key={d.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-white rounded-xl border border-black hover:theme-shadow-md transition-all duration-200">
                      <img
                        src={d.avatar_url || d.avatar}
                        alt={d.full_name || d.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold theme-text text-sm">{d.full_name || d.name}</h4>
                        <p className="theme-text-secondary text-xs">{d.specialization || d.specialty}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            <Star size={12} className="text-yellow-500 fill-current" />
                            <span className="text-xs theme-text-muted">{(doctorRatings[d.id]?.averageRating ?? d.rating ?? 4.9).toFixed ? (doctorRatings[d.id]?.averageRating ?? d.rating ?? 4.9).toFixed(1) : (doctorRatings[d.id]?.averageRating ?? d.rating ?? 4.9)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ask Question CTA */}
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Savolingiz bormi?</h3>
                <p className="text-blue-100 mb-4">
                  Professional shifokorlardan bepul maslahat oling
                </p>
                <button onClick={() => setAskOpen(true)} className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 transform hover:scale-105">
                  Savol berish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {askOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200/60 dark:ring-white/10 overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/5">
              <div className="flex items-center space-x-3"><HelpCircle size={22} className="text-blue-600" /><h3 className="text-xl font-bold theme-text">{t('askQuestionBtn')}</h3></div>
              <button onClick={() => setAskOpen(false)} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-white/10 dark:hover:bg-white/15">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {!user && (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                  {t('loginToAsk') || 'Savol berish uchun kiring'}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Sarlavha</label>
                <input value={formTitle} onChange={(e)=>setFormTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white theme-text placeholder-gray-400 outline-none border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" placeholder="Savolingiz sarlavhasi" />
              </div>
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Savol matni</label>
                <textarea value={formContent} onChange={(e)=>setFormContent(e.target.value)} rows={6} className="w-full px-4 py-3 rounded-xl bg-white theme-text placeholder-gray-400 resize-none outline-none border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" placeholder="Savolingizni batafsil yozing" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Kategoriya</label>
                  <select value={formCategory} onChange={(e)=>setFormCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white theme-text outline-none border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none">
                    <option value="">Tanlang</option>
                    {categoriesState.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-white/20 flex items-center justify-end gap-3">
              <button onClick={() => setAskOpen(false)} className="px-5 py-3 rounded-xl bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-white/5 dark:text-black dark:border-white/25">Bekor qilish</button>
              <button disabled={submitting || !formTitle.trim() || !formContent.trim() || !formCategory} onClick={async ()=>{
                setSubmitting(true);
                try {
                  const { data, error } = await createQuestion({
                    title: formTitle.trim(),
                    content: formContent.trim(),
                    category_id: formCategory || undefined
                  } as any);
                  if (!error && data) {
                    setAskOpen(false);
                    setFormTitle(''); setFormContent(''); setFormCategory('');
                    const res = await getQuestions({ allowMock: false });
                    if (res.data) setQuestionsState(res.data as any[]);
                    const prefix = i18n.language === 'uz' ? '' : `/${i18n.language}`;
                    navigate(`${prefix}/questions/${data.slug}`);
                  } else {
                    console.error('Create question failed:', error);
                    const message = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
                    alert('Savol yuborilmadi: ' + message);
                  }
                } finally { setSubmitting(false); }
              }} className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">{submitting ? 'Yuborilmoqda...' : 'Savolni yuborish'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QA;
