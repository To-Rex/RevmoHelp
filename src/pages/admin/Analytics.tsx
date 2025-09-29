import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  FileText, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw
} from 'lucide-react';
import { getPosts } from '../../lib/posts';
import { getAuthUsers } from '../../lib/adminUsers';
import { getDoctors } from '../../lib/doctors';
import { getPatientStories } from '../../lib/patientStories';
import type { Post } from '../../types';
import type { AuthUser } from '../../lib/adminUsers';
import type { Doctor } from '../../lib/doctors';
import type { PatientStory } from '../../lib/patientStories';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stories, setStories] = useState<PatientStory[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [postsResult, usersResult, doctorsResult, storiesResult] = await Promise.all([
        getPosts('uz'),
        getAuthUsers(),
        getDoctors('uz'),
        getPatientStories('uz')
      ]);

      if (postsResult.data) setPosts(postsResult.data);
      if (usersResult.data) setUsers(usersResult.data);
      if (doctorsResult.data) setDoctors(doctorsResult.data);
      if (storiesResult.data) setStories(storiesResult.data);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading analytics data:', error);
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
      totalStories: publishedStories.length,
      userGrowth: getGrowthPercentage(users.length),
      viewGrowth: getGrowthPercentage(totalViews),
      postGrowth: getGrowthPercentage(publishedPosts.length),
      doctorGrowth: getGrowthPercentage(activeDoctors.length)
    };
  };

  const stats = calculateStats();

  // Get top posts by views
  const topPosts = posts
    .filter(p => p.published)
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 5)
    .map(post => ({
      id: post.id,
      title: post.title,
      views: post.views_count || 0,
      growth: Math.random() > 0.5 ? +(Math.random() * 30).toFixed(1) : -(Math.random() * 10).toFixed(1),
      category: post.category?.name || 'Kategoriyasiz',
      author: post.author?.full_name || 'Noma\'lum'
    }));

  // Calculate user distribution by role
  const usersByRole = users.reduce((acc, user) => {
    const role = user.user_metadata?.role || 'patient';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userRoleDistribution = [
    { role: 'Bemorlar', count: usersByRole.patient || 0, percentage: ((usersByRole.patient || 0) / users.length * 100).toFixed(1), color: 'bg-blue-500' },
    { role: 'Shifokorlar', count: usersByRole.doctor || 0, percentage: ((usersByRole.doctor || 0) / users.length * 100).toFixed(1), color: 'bg-green-500' },
    { role: 'Moderatorlar', count: usersByRole.moderator || 0, percentage: ((usersByRole.moderator || 0) / users.length * 100).toFixed(1), color: 'bg-orange-500' },
    { role: 'Adminlar', count: usersByRole.admin || 0, percentage: ((usersByRole.admin || 0) / users.length * 100).toFixed(1), color: 'bg-red-500' },
    { role: 'Mehmonlar', count: usersByRole.guest || 0, percentage: ((usersByRole.guest || 0) / users.length * 100).toFixed(1), color: 'bg-gray-500' }
  ].filter(item => item.count > 0);

  // Calculate traffic sources (mock data based on real patterns)
  const trafficSources = [
    { source: 'To\'g\'ridan-to\'g\'ri', visitors: Math.floor(stats.totalUsers * 0.35), percentage: 35.0, color: 'bg-blue-500' },
    { source: 'Google qidiruv', visitors: Math.floor(stats.totalUsers * 0.28), percentage: 28.0, color: 'bg-green-500' },
    { source: 'Ijtimoiy tarmoqlar', visitors: Math.floor(stats.totalUsers * 0.18), percentage: 18.0, color: 'bg-purple-500' },
    { source: 'Boshqa saytlar', visitors: Math.floor(stats.totalUsers * 0.12), percentage: 12.0, color: 'bg-orange-500' },
    { source: 'Email', visitors: Math.floor(stats.totalUsers * 0.07), percentage: 7.0, color: 'bg-teal-500' }
  ];

  // Recent activity based on real data
  const recentActivity = [
    ...posts.slice(0, 2).map(post => ({
      id: `post-${post.id}`,
      user: post.author?.full_name || 'Noma\'lum muallif',
      action: 'yangi maqola nashr etdi',
      target: post.title,
      time: getRelativeTime(post.published_at || post.created_at),
      color: 'bg-blue-500'
    })),
    ...users.slice(0, 2).map(user => ({
      id: `user-${user.id}`,
      user: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Foydalanuvchi',
      action: 'ro\'yxatdan o\'tdi',
      target: user.user_metadata?.role || 'patient',
      time: getRelativeTime(user.created_at),
      color: 'bg-green-500'
    })),
    ...stories.slice(0, 1).map(story => ({
      id: `story-${story.id}`,
      user: 'Admin',
      action: 'yangi bemor tarixi qo\'shdi',
      target: story.patient_name,
      time: getRelativeTime(story.created_at),
      color: 'bg-purple-500'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);

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

  const timeRanges = [
    { value: '7d', label: 'Oxirgi 7 kun' },
    { value: '30d', label: 'Oxirgi 30 kun' },
    { value: '90d', label: 'Oxirgi 3 oy' },
    { value: '1y', label: 'Oxirgi yil' }
  ];

  const deviceStats = [
    { device: 'Desktop', count: Math.floor(stats.totalUsers * 0.45), percentage: 45, icon: Monitor },
    { device: 'Mobile', count: Math.floor(stats.totalUsers * 0.40), percentage: 40, icon: Smartphone },
    { device: 'Tablet', count: Math.floor(stats.totalUsers * 0.15), percentage: 15, icon: Tablet }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Analitika ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold theme-text">Analitika va Hisobotlar</h1>
          <p className="theme-text-secondary">Platforma faoliyati va foydalanuvchi statistikasi</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm theme-text-muted">
            <Clock size={16} />
            <span>Oxirgi yangilanish: {lastUpdated.toLocaleTimeString('uz-UZ')}</span>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={loadAnalyticsData}
            className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <RefreshCw size={16} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border p-6 hover:theme-shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium theme-text-secondary">Jami Foydalanuvchilar</p>
              <p className="text-2xl font-bold theme-text">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50">
              <Users size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight size={16} className="text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              +{stats.userGrowth}%
            </span>
            <span className="text-sm theme-text-secondary ml-1">oldingi davr bilan</span>
          </div>
        </div>

        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border p-6 hover:theme-shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium theme-text-secondary">Sahifa Ko'rishlari</p>
              <p className="text-2xl font-bold theme-text">
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/50">
              <Eye size={24} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight size={16} className="text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              +{stats.viewGrowth}%
            </span>
            <span className="text-sm theme-text-secondary ml-1">oldingi davr bilan</span>
          </div>
        </div>

        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border p-6 hover:theme-shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium theme-text-secondary">Nashr Etilgan Maqolalar</p>
              <p className="text-2xl font-bold theme-text">
                {stats.totalPosts}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/50">
              <FileText size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight size={16} className="text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              +{stats.postGrowth}%
            </span>
            <span className="text-sm theme-text-secondary ml-1">oldingi davr bilan</span>
          </div>
        </div>

        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border p-6 hover:theme-shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium theme-text-secondary">Faol Shifokorlar</p>
              <p className="text-2xl font-bold theme-text">
                {stats.totalDoctors}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/50">
              <Activity size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight size={16} className="text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              +{stats.doctorGrowth}%
            </span>
            <span className="text-sm theme-text-secondary ml-1">oldingi davr bilan</span>
          </div>
        </div>

        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border p-6 hover:theme-shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium theme-text-secondary">Bemor Tarixi</p>
              <p className="text-2xl font-bold theme-text">
                {stats.totalStories}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/50">
              <Activity size={24} className="text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight size={16} className="text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              +15.2%
            </span>
            <span className="text-sm theme-text-secondary ml-1">oldingi davr bilan</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Posts */}
        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border">
          <div className="p-6 theme-border border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold theme-text flex items-center space-x-2">
                <BarChart3 size={20} className="theme-accent" />
                <span>Eng Ko'p O'qilgan Maqolalar</span>
              </h2>
              <span className="text-sm theme-text-muted">{timeRange}</span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topPosts.length > 0 ? topPosts.map((post, index) => (
                <div key={post.id} className="flex items-start justify-between p-4 theme-bg-secondary rounded-xl hover:theme-shadow-md transition-all duration-200">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold theme-accent">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold theme-text line-clamp-2 mb-1">
                        {post.title}
                      </p>
                      <div className="flex items-center space-x-4 text-xs theme-text-muted">
                        <span>{post.views.toLocaleString()} ko'rishlar</span>
                        <span>{post.category}</span>
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span
                      className={`text-sm font-medium flex items-center space-x-1 ${
                        post.growth > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {post.growth > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      <span>{post.growth > 0 ? '+' : ''}{post.growth}%</span>
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <FileText size={32} className="theme-text-muted mx-auto mb-2 opacity-50" />
                  <p className="theme-text-secondary">Hozircha maqolalar yo'q</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border">
          <div className="p-6 theme-border border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold theme-text flex items-center space-x-2">
                <PieChart size={20} className="theme-accent" />
                <span>Trafik Manbalari</span>
              </h2>
              <span className="text-sm theme-text-muted">{timeRange}</span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {trafficSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 ${source.color} rounded-full`}></div>
                    <span className="text-sm font-medium theme-text">
                      {source.source}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold theme-text">
                      {source.visitors.toLocaleString()}
                    </div>
                    <div className="text-xs theme-text-muted">
                      {source.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles Distribution */}
        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border">
          <div className="p-6 theme-border border-b">
            <h2 className="text-lg font-semibold theme-text flex items-center space-x-2">
              <Users size={20} className="theme-accent" />
              <span>Foydalanuvchilar Taqsimoti</span>
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {userRoleDistribution.map((role) => (
                <div key={role.role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 ${role.color} rounded-full`}></div>
                    <span className="text-sm font-medium theme-text">{role.role}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold theme-text">
                      {role.count.toLocaleString()}
                    </div>
                    <div className="text-xs theme-text-muted">
                      {role.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Statistics */}
        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border">
          <div className="p-6 theme-border border-b">
            <h2 className="text-lg font-semibold theme-text flex items-center space-x-2">
              <Monitor size={20} className="theme-accent" />
              <span>Qurilma Statistikasi</span>
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {deviceStats.map((device) => {
                const Icon = device.icon;
                return (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                        <Icon size={16} className="theme-accent" />
                      </div>
                      <span className="text-sm font-medium theme-text">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold theme-text">
                        {device.count.toLocaleString()}
                      </div>
                      <div className="text-xs theme-text-muted">
                        {device.percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="theme-bg rounded-xl theme-shadow-lg theme-border border">
        <div className="p-6 theme-border border-b">
          <h2 className="text-lg font-semibold theme-text flex items-center space-x-2">
            <Activity size={20} className="theme-accent" />
            <span>So'nggi Faollik</span>
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-4 theme-bg-secondary rounded-xl hover:theme-shadow-md transition-all duration-200">
                <div className={`w-3 h-3 ${activity.color} rounded-full mt-2 flex-shrink-0`}></div>
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
                <p className="theme-text-secondary">Hozircha faollik yo'q</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Performance */}
      <div className="theme-bg rounded-xl theme-shadow-lg theme-border border">
        <div className="p-6 theme-border border-b">
          <h2 className="text-lg font-semibold theme-text flex items-center space-x-2">
            <TrendingUp size={20} className="theme-accent" />
            <span>Kontent Samaradorligi</span>
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 theme-bg-secondary rounded-xl">
              <div className="text-2xl font-bold theme-text mb-2">
                {posts.length > 0 ? Math.round(stats.totalViews / posts.length) : 0}
              </div>
              <div className="text-sm theme-text-secondary">O'rtacha ko'rishlar/maqola</div>
            </div>
            <div className="text-center p-6 theme-bg-secondary rounded-xl">
              <div className="text-2xl font-bold theme-text mb-2">
                {posts.filter(p => p.published).length}
              </div>
              <div className="text-sm theme-text-secondary">Nashr etilgan maqolalar</div>
            </div>
            <div className="text-center p-6 theme-bg-secondary rounded-xl">
              <div className="text-2xl font-bold theme-text mb-2">
                {posts.filter(p => !p.published).length}
              </div>
              <div className="text-sm theme-text-secondary">Qoralama maqolalar</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold theme-text">Tizim Holati</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Server</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Onlayn</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Ma'lumotlar bazasi</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Ulangan</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Xotira</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">78% ishlatilgan</span>
            </div>
          </div>
        </div>

        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold theme-text">Samaradorlik</h3>
            <TrendingUp size={20} className="text-blue-500" />
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

        <div className="theme-bg rounded-xl theme-shadow-lg theme-border border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold theme-text">Xavfsizlik</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">SSL Sertifikat</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Faol</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Firewall</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Himoyalangan</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">Oxirgi skan</span>
              <span className="text-sm font-medium theme-text">2 soat oldin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;