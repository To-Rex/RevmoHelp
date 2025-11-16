import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Award, TrendingUp, Search, Filter, Plus, ChevronDown, Clock, Eye, ThumbsUp, MessageCircle, Star, User, Calendar, Tag, CheckCircle, AlertCircle, ThumbsDown, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getQuestions, getQAStats, voteQuestion, type Question } from '../lib/questions';
import { getCategories, type Category } from '../lib/categories';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { uz, ru, enUS } from 'date-fns/locale';

const QAPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    answeredQuestions: 0,
    totalAnswers: 0,
    totalDoctors: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});

  // Get locale for date formatting
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'ru': return ru;
      case 'en': return enUS;
      default: return uz;
    }
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [questionsResult, categoriesResult, statsResult] = await Promise.all([
          getQuestions({ 
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
            limit: 20 
          }),
          getCategories(),
          getQAStats()
        ]);

        if (questionsResult.data) {
          setQuestions(questionsResult.data);
        }
        if (categoriesResult.data) {
          setCategories(categoriesResult.data);
        }
        setStats(statsResult);
      } catch (error) {
        console.error('Error loading Q&A data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, selectedStatus, sortBy]);

  // Filter and sort questions
  const filteredQuestions = questions
    .filter(question => {
      if (searchTerm) {
        return question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
               question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.votes_count - a.votes_count;
        case 'most-answered':
          return b.answers_count - a.answers_count;
        case 'most-viewed':
          return b.views_count - a.views_count;
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Handle voting
  const handleVote = async (questionId: string, voteType: 'up' | 'down') => {
    if (!user) {
      alert(t('pleaseLogin'));
      return;
    }

    if (votingStates[questionId]) return;

    setVotingStates(prev => ({ ...prev, [questionId]: true }));

    try {
      const { error } = await voteQuestion(questionId, voteType);
      if (error) {
        console.error('Error voting:', error);
        alert(t('votingError'));
      } else {
        // Refresh questions to get updated vote counts
        const { data } = await getQuestions({ 
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
          limit: 20 
        });
        if (data) {
          setQuestions(data);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert(t('votingError'));
    } finally {
      setVotingStates(prev => ({ ...prev, [questionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-secondary-50 dark:bg-gray-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6">
              {t('qaPageTitle')}
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto">
              {t('qaPageSubtitle')}
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6 theme-bg-secondary rounded-2xl theme-border border">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-primary-600" />
              </div>
              <div className="text-3xl font-bold theme-text mb-2">{stats.totalQuestions.toLocaleString()}</div>
              <div className="theme-text-secondary">{t('totalQuestions')}</div>
            </div>
            
            <div className="text-center p-6 theme-bg-secondary rounded-2xl theme-border border">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div className="text-3xl font-bold theme-text mb-2">{stats.answeredQuestions.toLocaleString()}</div>
              <div className="theme-text-secondary">{t('answeredQuestions')}</div>
            </div>
            
            <div className="text-center p-6 theme-bg-secondary rounded-2xl theme-border border">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={24} className="text-blue-600" />
              </div>
              <div className="text-3xl font-bold theme-text mb-2">{stats.totalAnswers.toLocaleString()}</div>
              <div className="theme-text-secondary">{t('totalAnswers')}</div>
            </div>
            
            <div className="text-center p-6 theme-bg-secondary rounded-2xl theme-border border">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-purple-600" />
              </div>
              <div className="text-3xl font-bold theme-text mb-2">{stats.totalDoctors.toLocaleString()}</div>
              <div className="theme-text-secondary">{t('expertDoctors')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 theme-bg-secondary theme-border-b border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-wrap gap-4 pr-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 theme-text-muted" />
                  <input
                    type="text"
                    placeholder={t('searchQuestions')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 theme-border border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 theme-bg theme-text"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 pr-8 py-3 theme-border border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg theme-text"
                >
                  <option value="all">{t('allCategories')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 pr-8 py-3 theme-border border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg theme-text"
                >
                  <option value="all">{t('allStatuses')}</option>
                  <option value="open">{t('openQuestions')}</option>
                  <option value="answered">{t('answeredQuestions')}</option>
                  <option value="closed">{t('closedQuestions')}</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 pr-8 py-3 theme-border border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 theme-bg theme-text"
                >
                  <option value="newest">{t('newest')}</option>
                  <option value="popular">{t('mostPopular')}</option>
                  <option value="most-answered">{t('mostAnswered')}</option>
                  <option value="most-viewed">{t('mostViewed')}</option>
                  <option value="oldest">{t('oldest')}</option>
                </select>
              </div>
            </div>
            
            {/* Ask Question Button */}
            {user ? (
              <Link
                to="/ask-question"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-300 font-medium"
              >
                <Plus size={20} className="mr-2" />
                {t('askQuestion')}
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-300 font-medium"
              >
                <Plus size={20} className="mr-2" />
                {t('loginToAsk')}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Questions List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="theme-bg-secondary rounded-2xl p-6 theme-border border sticky top-8">
                <h3 className="text-lg font-semibold theme-text mb-4">{t('categories')}</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors duration-300 ${
                      selectedCategory === 'all'
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'theme-text-secondary hover:theme-bg-tertiary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{t('allCategories')}</span>
                      <span className="text-sm opacity-70">{stats.totalQuestions}</span>
                    </div>
                  </button>
                  
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-colors duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'theme-text-secondary hover:theme-bg-tertiary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                        <span className="text-sm opacity-70">{category.posts_count || 0}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Questions List */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12 theme-bg-secondary rounded-2xl theme-border border">
                    <MessageSquare size={48} className="mx-auto theme-text-muted mb-4" />
                    <h3 className="text-xl font-semibold theme-text mb-2">{t('noQuestionsFound')}</h3>
                    <p className="theme-text-secondary mb-6">{t('noQuestionsFoundDesc')}</p>
                    {user ? (
                      <Link
                        to="/ask-question"
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-300"
                      >
                        <Plus size={20} className="mr-2" />
                        {t('askFirstQuestion')}
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-300"
                      >
                        <Plus size={20} className="mr-2" />
                        {t('loginToAsk')}
                      </Link>
                    )}
                  </div>
                ) : (
                  filteredQuestions.map(question => (
                    <div key={question.id} className="theme-bg-secondary rounded-2xl p-6 theme-border border hover:theme-shadow-lg transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                          <button 
                            onClick={() => handleVote(question.id, 'up')}
                            disabled={!user || votingStates[question.id]}
                            className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors duration-300 disabled:opacity-50"
                          >
                            <ThumbsUp size={18} className="text-green-600" />
                          </button>
                          <span className="text-lg font-semibold theme-text">{question.votes_count}</span>
                          <button 
                            onClick={() => handleVote(question.id, 'down')}
                            disabled={!user || votingStates[question.id]}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors duration-300 disabled:opacity-50"
                          >
                            <ThumbsDown size={18} className="text-red-600" />
                          </button>
                        </div>
                        
                        {/* Question Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: question.category?.color || '#6B7280' }}
                                />
                                <span className="text-sm font-medium" style={{ color: question.category?.color || '#6B7280' }}>
                                  {question.category?.name || t('uncategorized')}
                                </span>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  question.status === 'answered'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                    : question.status === 'closed'
                                    ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                }`}>
                                  {question.status === 'answered' && <CheckCircle size={12} className="inline mr-1 pr-2" />}
                                  {question.status === 'open' && <AlertCircle size={12} className="inline mr-1 pr-2" />}
                                  {t(question.status)}
                                </div>
                                {question.best_answer_id && (
                                  <div className="flex items-center space-x-1 text-green-600">
                                    <Star size={12} className="fill-current pr-1" />
                                    <span className="text-xs font-medium">{t('hasAcceptedAnswer')}</span>
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="text-xl font-semibold theme-text mb-2 hover:text-primary-600 transition-colors duration-300">
                                <Link to={`/questions/${question.slug}`}>
                                  {question.title}
                                </Link>
                              </h3>
                              
                              <p className="theme-text-secondary mb-4 line-clamp-2">
                                {question.content}
                              </p>
                              
                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {question.tags.map(tag => (
                                  <span 
                                    key={tag}
                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                              
                              {/* Question Stats */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6 text-sm theme-text-muted">
                                  <div className="flex items-center space-x-1">
                                    <Eye size={16} className="pr-2" />
                                    <span>{question.views_count.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MessageCircle size={16} className="pr-2" />
                                    <span>{question.answers_count}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock size={16} className="pr-2" />
                                    <span>
                                      {formatDistanceToNow(new Date(question.created_at), {
                                        addSuffix: true,
                                        locale: getDateLocale()
                                      })}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Author */}
                                <div className="flex items-center space-x-3">
                                  <img 
                                    src={question.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.author?.full_name || 'User')}&background=3B82F6&color=fff`} 
                                    alt={question.author?.full_name || 'User'}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <div>
                                    <div className="text-sm font-medium theme-text">{question.author?.full_name || 'Anonymous'}</div>
                                    <div className="text-xs theme-text-muted">{t(question.author?.role || 'user')}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Load More Button */}
              {filteredQuestions.length > 0 && (
                <div className="text-center mt-12">
                  <button className="px-8 py-3 theme-border border rounded-xl theme-text hover:theme-bg-tertiary transition-colors duration-300">
                    {t('loadMore')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QAPage;