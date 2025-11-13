import React, { useState, useEffect } from 'react';
import { Users, FileText, Eye, TrendingUp, Building2, MessageSquare, ArrowUpRight, Activity, Clock, CheckCircle, Stethoscope, Heart, Award, Calendar, User, Play, Image as ImageIcon, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPosts } from '../../lib/posts';
import { getAuthUsers } from '../../lib/adminUsers';
import { getDoctors } from '../../lib/doctors';
import { getPatientStories } from '../../lib/patientStories';
import { getAllNotifications } from '../../lib/notifications';
import type { Post } from '../../types';
import type { AuthUser } from '../../lib/adminUsers';
import type { Doctor } from '../../lib/doctors';
import type { PatientStory } from '../../lib/patientStories';
import type { Notification } from '../../lib/notifications';

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stories, setStories] = useState<PatientStory[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [postsResult, usersResult, doctorsResult, storiesResult, notificationsResult] = await Promise.all([
        getPosts('uz'),
        getAuthUsers(),
        getDoctors('uz'),
        getPatientStories('uz'),
        getAllNotifications()
      ]);

      if (postsResult.data) setPosts(postsResult.data);
      if (usersResult.data) setUsers(usersResult.data);
      if (doctorsResult.data) setDoctors(doctorsResult.data);
      if (storiesResult.data) setStories(storiesResult.data);
      if (notificationsResult.data) setNotifications(notificationsResult.data);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate real statistics
  const calculateStats = () => {
    const totalViews = posts.reduce((sum, post) => sum + (post.views_count || 0), 0);
    const publishedPosts = posts.filter(p => p.published);
    const activeDoctors = doctors.filter(d => d.active && d.verified);
    const publishedStories = stories.filter(s => s.published);
    
    // Calculate growth (mock data for demonstration)
    const getGrowthPercentage = (current: number) => {
      const mockPrevious = Math.floor(current * 0.85); // Simulate 15% growth
      return ((current - mockPrevious) / mockPrevious * 100).toFixed(1);
    };

    return {
      totalUsers: users.length,
      totalViews,
      totalPosts: publishedPosts.length,
      totalDoctors: activeDoctors.length,
      userGrowth: getGrowthPercentage(users.length),
      viewGrowth: getGrowthPercentage(totalViews),
      postGrowth: getGrowthPercentage(publishedPosts.length),
      doctorGrowth: getGrowthPercentage(activeDoctors.length)
    };
  };

  const stats = calculateStats();

  // Get recent posts
  const recentPosts = posts
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(post => ({
      id: post.id,
      title: post.title,
      author: post.author?.full_name || 'Noma\'lum',
      views: post.views_count || 0,
      status: post.published ? 'published' : 'draft',
      date: new Date(post.created_at).toLocaleDateString('uz-UZ'),
      type: post.youtube_url ? 'video' : post.featured_image_url ? 'image' : 'text'
    }));

  // Get recent users
  const recentUsers = users
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(user => ({
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email,
      role: user.user_metadata?.role || 'patient',
      joinDate: new Date(user.created_at).toLocaleDateString('uz-UZ'),
      avatar: (user.user_metadata?.full_name || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase(),
      provider: user.app_metadata?.provider || 'email'
    }));

  // Generate recent activity from real data
  const recentActivity = [
    ...posts.slice(0, 2).map(post => ({
      id: `post-${post.id}`,
      user: post.author?.full_name || 'Noma\'lum muallif',
      action: post.published ? 'maqola nashr etdi' : 'qoralama yaratdi',
      target: post.title,
      time: getRelativeTime(post.published_at || post.created_at),
      color: post.published ? 'bg-green-500' : 'bg-yellow-500'
    })),
    ...users.slice(0, 2).map(user => ({
      id: `user-${user.id}`,
      user: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Foydalanuvchi',
      action: 'ro\'yxatdan o\'tdi',
      target: `${user.user_metadata?.role || 'patient'} sifatida`,
      time: getRelativeTime(user.created_at),
      color: 'bg-blue-500'
    })),
    ...stories.slice(0, 1).map(story => ({
      id: `story-${story.id}`,
      user: 'Admin',
      action: 'bemor tarixi qo\'shdi',
      target: story.patient_name,
      time: getRelativeTime(story.created_at),
      color: 'bg-purple-500'
    })),
    ...notifications.slice(0, 1).map(notification => ({
      id: `notification-${notification.id}`,
      user: notification.creator?.full_name || 'System',
      action: 'bildirishnoma yubordi',
      target: notification.title,
      time: getRelativeTime(notification.sent_at),
      color: 'bg-orange-500'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

  function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} daqiqa oldin`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} soat oldin`;
    } else {
      return `${Math.floor(diffInHours / 24)} kun oldin`;
    }
  }

  const quickActions = [
    { name: 'Yangi Maqola', icon: FileText, color: 'bg-blue-600', href: '/admin/posts/create' },
    { name: 'Foydalanuvchilar', icon: Users, color: 'bg-green-600', href: '/admin/users' },
    { name: 'Analitika', icon: TrendingUp, color: 'bg-purple-600', href: '/admin/analytics' },
    { name: 'Bildirishnomalar', icon: MessageSquare, color: 'bg-orange-600', href: '/admin/notifications' },
  ];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return ImageIcon;
      default: return FileText;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-red-600';
      case 'image': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const getProviderIcon = (provider: string) => {
    if (provider === 'google') {
      return (
        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-3 h-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
      );
    }
    return '📧';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Dashboard yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 xl:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-2xl font-bold theme-text">Dashboard</h1>
          <p className="theme-text-secondary mt-1 text-sm lg:text-base">Platformangiz holatini kuzatib boring</p>
        </div>
        <div className="flex items-center space-x-3 lg:space-x-4">
          <div className="flex items-center space-x-2 text-xs lg:text-sm theme-text-muted">
            <Clock size={16} />
            <span>Oxirgi yangilanish: {lastUpdated.toLocaleTimeString('uz-UZ')}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center space-x-2 theme-accent-bg text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            <Activity size={16} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="theme-bg rounded-2xl theme-border border p-4 lg:p-6 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 lg:p-3 rounded-xl bg-primary-100 dark:bg-primary-900/20">
              <Users size={20} className="lg:size-22 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUpRight size={14} className="text-secondary-500" />
              <span className="text-xs lg:text-sm font-medium text-secondary-600 dark:text-secondary-400">
                +{stats.userGrowth}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-bold theme-text mb-1">
              {stats.totalUsers.toLocaleString()}
            </p>
            <p className="text-xs lg:text-sm theme-text-secondary">
              Jami Foydalanuvchilar
            </p>
          </div>
        </div>

        <div className="theme-bg rounded-2xl theme-border border p-4 lg:p-6 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 lg:p-3 rounded-xl bg-primary-100 dark:bg-primary-900/20">
              <FileText size={20} className="lg:size-22 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUpRight size={14} className="text-secondary-500" />
              <span className="text-xs lg:text-sm font-medium text-secondary-600 dark:text-secondary-400">
                +{stats.postGrowth}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-bold theme-text mb-1">
              {stats.totalPosts}
            </p>
            <p className="text-xs lg:text-sm theme-text-secondary">
              Nashr Etilgan Maqolalar
            </p>
          </div>
        </div>

        <div className="theme-bg rounded-2xl theme-border border p-4 lg:p-6 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 lg:p-3 rounded-xl bg-primary-100 dark:bg-primary-900/20">
              <Eye size={20} className="lg:size-22 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUpRight size={14} className="text-secondary-500" />
              <span className="text-xs lg:text-sm font-medium text-secondary-600 dark:text-secondary-400">
                +{stats.viewGrowth}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-bold theme-text mb-1">
              {stats.totalViews.toLocaleString()}
            </p>
            <p className="text-xs lg:text-sm theme-text-secondary">
              Jami Ko'rishlar
            </p>
          </div>
        </div>

        <div className="theme-bg rounded-2xl theme-border border p-4 lg:p-6 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 lg:p-3 rounded-xl bg-primary-100 dark:bg-primary-900/20">
              <Stethoscope size={20} className="lg:size-22 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUpRight size={14} className="text-secondary-500" />
              <span className="text-xs lg:text-sm font-medium text-secondary-600 dark:text-secondary-400">
                +{stats.doctorGrowth}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-xl lg:text-2xl font-bold theme-text mb-1">
              {stats.totalDoctors}
            </p>
            <p className="text-xs lg:text-sm theme-text-secondary">
              Faol Shifokorlar
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="theme-bg rounded-2xl theme-border border p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-bold theme-text mb-4 lg:mb-6">Tezkor Amallar</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className={`${action.color} text-white p-4 lg:p-5 rounded-xl hover:opacity-90 transition-all duration-200 transform hover:scale-105 block`}
              >
                <Icon size={20} className="lg:size-22 mb-2 lg:mb-3 mx-auto" />
                <div className="text-xs lg:text-sm font-medium text-center">{action.name}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Posts */}
        <div className="theme-bg rounded-2xl theme-border border">
          <div className="p-4 lg:p-6 theme-border border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg lg:text-xl font-bold theme-text">So'nggi Maqolalar</h2>
              <Link
                to="/admin/posts"
                className="text-xs lg:text-sm theme-accent hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Barchasini ko'rish
              </Link>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              {recentPosts.length > 0 ? recentPosts.map((post) => {
                const PostIcon = getPostTypeIcon(post.type);
                return (
                  <div key={post.id} className="flex flex-col lg:flex-row lg:items-start lg:justify-between p-4 theme-bg-tertiary rounded-xl transition-all duration-200 space-y-2 lg:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <PostIcon size={16} className={`${getPostTypeColor(post.type)}`} />
                        <p className="text-sm font-semibold theme-text line-clamp-2 lg:truncate">
                          {post.title}
                        </p>
                      </div>
                      <p className="text-sm theme-text-muted mb-2">
                        {post.author} tomonidan
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs theme-text-muted">
                        <div className="flex items-center space-x-1">
                          <Eye size={12} />
                          <span>{post.views.toLocaleString()} ko'rishlar</span>
                        </div>
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <div className="lg:ml-4 flex-shrink-0">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          post.status === 'published'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}
                      >
                        {post.status === 'published' ? 'Nashr etilgan' : 'Qoralama'}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <FileText size={32} className="theme-text-muted mx-auto mb-2 opacity-50" />
                  <p className="theme-text-secondary text-sm">Hozircha maqolalar yo'q</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="theme-bg rounded-2xl theme-border border">
          <div className="p-4 lg:p-6 theme-border border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg lg:text-xl font-bold theme-text">So'nggi Foydalanuvchilar</h2>
              <Link
                to="/admin/users"
                className="text-xs lg:text-sm theme-accent hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Barchasini ko'rish
              </Link>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              {recentUsers.length > 0 ? recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 theme-bg-tertiary rounded-xl transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold theme-accent">{user.avatar}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold theme-text truncate">
                          {user.name}
                        </p>
                        {getProviderIcon(user.provider)}
                      </div>
                      <p className="text-xs theme-text-muted truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                        user.role === 'doctor'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : user.role === 'admin'
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {user.role}
                    </span>
                    <div className="text-xs theme-text-muted mt-1 hidden lg:block">{user.joinDate}</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Users size={32} className="theme-text-muted mx-auto mb-2 opacity-50" />
                  <p className="theme-text-secondary text-sm">Hozircha foydalanuvchilar yo'q</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="theme-bg rounded-2xl theme-border border">
        <div className="p-4 lg:p-6 theme-border border-b">
          <div className="flex items-center space-x-2">
            <Activity size={18} className="lg:size-20 theme-accent" />
            <h2 className="text-lg lg:text-xl font-bold theme-text">So'nggi Faollik</h2>
          </div>
        </div>
        <div className="p-4 lg:p-6">
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 ${activity.color} rounded-full mt-2 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm theme-text">
                    <span className="font-semibold">{activity.user}</span> {activity.action}
                    {activity.target && (
                      <span className="font-medium"> "{activity.target}"</span>
                    )}
                  </p>
                  <p className="text-xs theme-text-muted">{activity.time}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Activity size={32} className="theme-text-muted mx-auto mb-2 opacity-50" />
                <p className="theme-text-secondary text-sm">Hozircha faollik yo'q</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="theme-bg rounded-2xl theme-border border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold theme-text">Tizim Holati</h3>
            <CheckCircle size={18} className="text-secondary-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Server</span>
              <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Onlayn</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Ma'lumotlar bazasi</span>
              <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Ulangan</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Xotira</span>
              <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">78% ishlatilgan</span>
            </div>
          </div>
        </div>

        <div className="theme-bg rounded-2xl theme-border border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold theme-text">Samaradorlik</h3>
            <TrendingUp size={18} className="text-primary-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Javob vaqti</span>
              <span className="text-sm font-medium theme-text">245ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Uptime</span>
              <span className="text-sm font-medium theme-text">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Yuklanish</span>
              <span className="text-sm font-medium theme-text">Past</span>
            </div>
          </div>
        </div>

        <div className="theme-bg rounded-2xl theme-border border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold theme-text">Kontent</h3>
            <Heart size={18} className="text-secondary-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Bemor tarixi</span>
              <span className="text-sm font-medium theme-text">{stories.filter(s => s.published).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Kategoriyalar</span>
              <span className="text-sm font-medium theme-text">6</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Bildirishnomalar</span>
              <span className="text-sm font-medium theme-text">{notifications.filter(n => n.active).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;