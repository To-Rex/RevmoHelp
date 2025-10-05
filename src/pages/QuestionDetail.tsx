import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, Eye, Clock, Star, CheckCircle, AlertCircle, Heart, Award, User, Calendar, Tag, Send, CreditCard as Edit, Trash2 } from 'lucide-react';
import { getQuestionBySlug, getAnswers, createAnswer, voteQuestion, voteAnswer, markBestAnswer, type Question, type Answer } from '../lib/questions';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { uz, ru, enUS } from 'date-fns/locale';

const QuestionDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});
  const [hasLiked, setHasLiked] = useState(false);

  // Get locale for date formatting
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'ru': return ru;
      case 'en': return enUS;
      default: return uz;
    }
  };

  // Load question and answers
  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const [questionResult, answersResult] = await Promise.all([
          getQuestionBySlug(slug),
          question ? getAnswers(question.id) : Promise.resolve({ data: [], error: null })
        ]);

        if (questionResult.data) {
           setQuestion(questionResult.data);
           setHasLiked((questionResult.data as any).user_vote_type === 'up');

           // Load answers for this question
           const answersData = await getAnswers(questionResult.data.id);
           if (answersData.data) {
             setAnswers(answersData.data);
           }
         } else {
           navigate('/qa');
         }
      } catch (error) {
        console.error('Error loading question:', error);
        navigate('/qa');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, navigate]);

  // Handle question voting
  const handleQuestionVote = async (voteType: 'up' | 'down') => {
    if (!user || !question) {
      alert(t('pleaseLogin'));
      return;
    }

    if (votingStates[`question-${question.id}`]) return;

    setVotingStates(prev => ({ ...prev, [`question-${question.id}`]: true }));

    try {
      const { error } = await voteQuestion(question.id, voteType);
      if (error) {
        console.error('Error voting:', error);
        alert(t('votingError'));
      } else {
        // Refresh question data
        const { data } = await getQuestionBySlug(slug!);
        if (data) {
          setQuestion(data);
          setHasLiked((data as any).user_vote_type === 'up');
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert(t('votingError'));
    } finally {
      setVotingStates(prev => ({ ...prev, [`question-${question.id}`]: false }));
    }
  };

  // Handle answer voting
  const handleAnswerVote = async (answerId: string, voteType: 'up' | 'down' | 'helpful') => {
    if (!user) {
      alert(t('pleaseLogin'));
      return;
    }

    if (votingStates[`answer-${answerId}`]) return;

    setVotingStates(prev => ({ ...prev, [`answer-${answerId}`]: true }));

    try {
      const { error } = await voteAnswer(answerId, voteType);
      if (error) {
        console.error('Error voting:', error);
        alert(t('votingError'));
      } else {
        // Refresh answers
        if (question) {
          const { data } = await getAnswers(question.id);
          if (data) {
            setAnswers(data);
          }
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert(t('votingError'));
    } finally {
      setVotingStates(prev => ({ ...prev, [`answer-${answerId}`]: false }));
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !question) {
      alert(t('pleaseLogin'));
      return;
    }

    if (!answerContent.trim()) {
      alert(t('answerRequired'));
      return;
    }

    setSubmittingAnswer(true);

    try {
      const { data, error } = await createAnswer({
        content: answerContent,
        question_id: question.id
      });

      if (error) {
        console.error('Error creating answer:', error);
        const errorMessage = error?.message || (typeof error === 'string' ? error : t('answerSubmissionError'));
        alert(`${t('answerSubmissionError')}: ${errorMessage}`);
      } else {
        setAnswerContent('');
        // Refresh answers
        const { data: answersData } = await getAnswers(question.id);
        if (answersData) {
          setAnswers(answersData);
        }
        // Refresh question to update answer count
        const { data: questionData } = await getQuestionBySlug(slug!);
        if (questionData) {
          setQuestion(questionData);
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : t('answerSubmissionError'));
      alert(`${t('answerSubmissionError')}: ${errorMessage}`);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Handle mark as best answer
  const handleMarkBestAnswer = async (answerId: string) => {
    if (!user || !question) return;

    try {
      const { error } = await markBestAnswer(question.id, answerId);
      if (error) {
        console.error('Error marking best answer:', error);
        alert(t('markBestAnswerError'));
      } else {
        // Refresh data
        const [questionData, answersData] = await Promise.all([
          getQuestionBySlug(slug!),
          getAnswers(question.id)
        ]);
        
        if (questionData.data) setQuestion(questionData.data);
        if (answersData.data) setAnswers(answersData.data);
      }
    } catch (error) {
      console.error('Error marking best answer:', error);
      alert(t('markBestAnswerError'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold theme-text mb-4">{t('questionNotFound')}</h2>
          <Link to="/qa" className="text-primary-600 hover:text-primary-700">
            {t('backToQuestions')}
          </Link>
        </div>
      </div>
    );
  }

  const canAnswerQuestions = user && user.role === 'doctor';
  const canMarkBestAnswer = user && (question.author_id === user.id || ['admin', 'moderator'].includes(user.role || ''));

  return (
    <div className="min-h-screen theme-bg">
      {/* Header */}
      <section className="py-8 bg-white border-b border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/qa"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors duration-300"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t('backToQuestions')}
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: question.category?.color || '#6B7280' }}
            />
            <span className="text-sm font-medium" style={{ color: question.category?.color || '#6B7280' }}>
              {question.category?.name || t('uncategorized')}
            </span>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              question.status === 'answered' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : question.status === 'closed'
                ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
            }`}>
              {question.status === 'answered' && <CheckCircle size={14} className="inline mr-1" />}
              {question.status === 'open' && <AlertCircle size={14} className="inline mr-1" />}
              {t(question.status)}
            </div>
            {question.best_answer_id && (
              <div className="flex items-center space-x-1 text-green-600">
                <Star size={14} className="fill-current" />
                <span className="text-sm font-medium">{t('hasAcceptedAnswer')}</span>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold theme-text mb-4">
            {question.title}
          </h1>
          
          <div className="flex items-center space-x-6 text-sm theme-text-muted">
            <div className="flex items-center space-x-1">
              <Eye size={16} />
              <span>{question.views_count.toLocaleString()} {t('views')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle size={16} />
              <span>{question.answers_count} {t('answers')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={16} />
              <span>
                {formatDistanceToNow(new Date(question.created_at), { 
                  addSuffix: true, 
                  locale: getDateLocale() 
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Question Content */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 ring-1 ring-gray-200/60 dark:ring-white/10 shadow">
            <div className="flex items-start space-x-6">
              {/* Like Section */}
              <div className="flex flex-col items-center space-y-3 min-w-[80px]">
                <span className="text-2xl font-bold theme-text">{question.votes_count}</span>
                <button
                  onClick={() => handleQuestionVote('up')}
                  disabled={!user || votingStates[`question-${question.id}`]}
                  className={`p-3 rounded-xl transition-colors duration-300 disabled:opacity-50 ${hasLiked ? 'text-red-600 fill-current hover:bg-red-100 dark:hover:bg-red-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900/20'}`}
                >
                  <Heart size={24} />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="prose prose-lg max-w-none theme-text mb-6">
                  {question.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {question.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Author */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={question.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.author?.full_name || 'User')}&background=3B82F6&color=fff`} 
                      alt={question.author?.full_name || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold theme-text">{question.author?.full_name || 'Anonymous'}</div>
                      <div className="text-sm theme-text-muted">{t(question.author?.role || 'user')}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm theme-text-muted">
                    {t('asked')} {formatDistanceToNow(new Date(question.created_at), { 
                      addSuffix: true, 
                      locale: getDateLocale() 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Answers Section */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold theme-text mb-6">
            {answers.length} {t('answers')}
          </h2>
          
          <div className="space-y-6">
            {answers.map(answer => (
              <div
                key={answer.id}
                className={`bg-white rounded-2xl p-6 ring-1 ring-gray-200/60 dark:ring-white/10 shadow ${
                  answer.is_best_answer ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/10' : ''
                }`}
              >
                {/* Answer Content */}
                <div>
                  {answer.is_best_answer && (
                    <div className="flex items-center space-x-2 mb-4 text-green-600">
                      <Award size={16} />
                      <span className="text-sm font-medium">{t('bestAnswer')}</span>
                    </div>
                  )}

                  <div className="prose max-w-none theme-text mb-4">
                    {answer.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))}
                  </div>

                  {/* Answer Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleAnswerVote(answer.id, 'helpful')}
                        disabled={!user || votingStates[`answer-${answer.id}`]}
                        className="flex items-center space-x-1 text-sm theme-text-muted hover:text-red-600 transition-colors duration-300 disabled:opacity-50"
                      >
                        <Heart size={16} />
                        <span>{answer.helpful_count} {t('helpful')}</span>
                      </button>

                      {canMarkBestAnswer && !answer.is_best_answer && (
                        <button
                          onClick={() => handleMarkBestAnswer(answer.id)}
                          className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700 transition-colors duration-300"
                        >
                          <CheckCircle size={16} />
                          <span>{t('markAsBest')}</span>
                        </button>
                      )}
                    </div>

                    {/* Answer Author */}
                    <div className="flex items-center space-x-3">
                      <img
                        src={answer.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(answer.author?.full_name || 'Doctor')}&background=10B981&color=fff`}
                        alt={answer.author?.full_name || 'Doctor'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium theme-text">{answer.author?.full_name || 'Doctor'}</div>
                        <div className="text-xs theme-text-muted">
                          {t(answer.author?.role || 'doctor')} • {formatDistanceToNow(new Date(answer.created_at), {
                            addSuffix: true,
                            locale: getDateLocale()
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Answer Form */}
      {canAnswerQuestions && (
        <section className="py-8 bg-white border-t border-gray-200 dark:border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-bold theme-text mb-6">{t('yourAnswer')}</h3>
            
            <form onSubmit={handleSubmitAnswer} className="space-y-6">
              <div>
                <textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder={t('writeYourAnswer')}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl bg-white theme-text outline-none border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 shadow-sm resize-none placeholder-gray-400"
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm theme-text-muted">
                  {t('answerGuidelines')}
                </p>
                
                <button
                  type="submit"
                  disabled={submittingAnswer || !answerContent.trim()}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingAnswer ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send size={20} className="mr-2" />
                  )}
                  {submittingAnswer ? t('submitting') : t('submitAnswer')}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Login prompt for non-doctors */}
      {!canAnswerQuestions && user && (
        <section className="py-8 bg-white border-t border-gray-200 dark:border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl p-8 ring-1 ring-gray-200/60 dark:ring-white/10 shadow">
              <User size={48} className="mx-auto theme-text-muted mb-4" />
              <h3 className="text-xl font-bold theme-text mb-2">{t('doctorsOnlyAnswer')}</h3>
              <p className="theme-text-secondary mb-6">{t('doctorsOnlyAnswerDesc')}</p>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                {t('contactUs')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Login prompt for guests */}
      {!user && (
        <section className="py-8 bg-white border-t border-gray-200 dark:border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl p-8 ring-1 ring-gray-200/60 dark:ring-white/10 shadow">
              <User size={48} className="mx-auto theme-text-muted mb-4" />
              <h3 className="text-xl font-bold theme-text mb-2">{t('loginToAnswer')}</h3>
              <p className="theme-text-secondary mb-6">{t('loginToAnswerDesc')}</p>
              <div className="flex items-center justify-center space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 theme-border border rounded-xl theme-text hover:theme-bg-tertiary transition-colors duration-300"
                >
                  {t('register')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default QuestionDetail;
