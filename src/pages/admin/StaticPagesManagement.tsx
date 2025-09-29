import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, FileText, Globe, Home, Settings } from 'lucide-react';
import HomepageManagement from './HomepageManagement';

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const StaticPagesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('homepage');

  // Mock data - in real app, this would come from Supabase
  const pages: StaticPage[] = [
    {
      id: '1',
      title: 'About Us',
      slug: 'about',
      content: 'About us page content...',
      meta_title: 'About Revmoinfo - Medical Information Platform',
      meta_description: 'Learn about Revmoinfo, the leading medical information platform for rheumatic diseases.',
      published: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Privacy Policy',
      slug: 'privacy',
      content: 'Privacy policy content...',
      meta_title: 'Privacy Policy - Revmoinfo',
      meta_description: 'Read our privacy policy to understand how we protect your data.',
      published: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      title: 'Data Security',
      slug: 'data-security',
      content: 'Data security information...',
      meta_title: 'Data Security - Revmoinfo',
      meta_description: 'Learn about our data security measures and protocols.',
      published: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '4',
      title: 'Terms of Use',
      slug: 'terms',
      content: 'Terms of use content...',
      meta_title: 'Terms of Use - Revmoinfo',
      meta_description: 'Read our terms of use for using the Revmoinfo platform.',
      published: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '5',
      title: 'Partnership',
      slug: 'partnership',
      content: 'Partnership information...',
      meta_title: 'Partnership Opportunities - Revmoinfo',
      meta_description: 'Explore partnership opportunities with Revmoinfo.',
      published: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '6',
      title: 'Contact',
      slug: 'contact',
      content: 'Contact page content...',
      meta_title: 'Contact Us - Revmoinfo',
      meta_description: 'Get in touch with the Revmoinfo team.',
      published: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '7',
      title: 'FAQ',
      slug: 'faq',
      content: 'Frequently asked questions...',
      meta_title: 'FAQ - Revmoinfo',
      meta_description: 'Find answers to frequently asked questions about Revmoinfo.',
      published: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const tabs = [
    { id: 'homepage', label: 'Bosh Sahifa', icon: Home },
    { id: 'static', label: 'Statik Sahifalar', icon: FileText }
  ];

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold theme-text">Sahifalar Boshqaruvi</h1>
          <p className="theme-text-secondary">Bosh sahifa va boshqa sahifalar kontentini boshqarish</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="theme-bg rounded-lg theme-shadow theme-border border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors duration-200 whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'theme-accent border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'theme-text-secondary hover:theme-accent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'homepage' && <HomepageManagement />}
        
        {activeTab === 'static' && (
          <div className="space-y-6">
            {/* Static Pages Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold theme-text">Statik Sahifalar</h2>
                <p className="theme-text-secondary">About, Contact, Privacy va boshqa sahifalar</p>
              </div>
              <button className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                <Plus size={20} />
                <span>Yangi Sahifa</span>
              </button>
            </div>

            {/* Search */}
            <div className="theme-bg rounded-lg theme-shadow theme-border border p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
                <input
                  type="text"
                  placeholder="Sahifalarni qidiring..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text"
                />
              </div>
            </div>

            {/* Pages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  className="theme-bg rounded-lg theme-shadow theme-border border p-6 hover:theme-shadow-lg transition-shadow duration-200"
                >
                  {/* Page Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <FileText size={20} className="theme-accent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold theme-text">
                          {page.title}
                        </h3>
                        <p className="text-sm theme-text-muted">
                          /{page.slug}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        page.published
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}
                    >
                      {page.published ? 'Nashr etilgan' : 'Qoralama'}
                    </span>
                  </div>

                  {/* SEO Info */}
                  <div className="mb-4">
                    <div className="text-sm theme-text-secondary mb-2">
                      <strong>Meta Title:</strong> {page.meta_title || 'Kiritilmagan'}
                    </div>
                    <div className="text-sm theme-text-secondary">
                      <strong>Meta Description:</strong> {page.meta_description ? 
                        (page.meta_description.length > 60 ? 
                          page.meta_description.substring(0, 60) + '...' : 
                          page.meta_description
                        ) : 'Kiritilmagan'
                      }
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="mb-4">
                    <p className="text-sm theme-text-secondary line-clamp-3">
                      {page.content.length > 100 ? 
                        page.content.substring(0, 100) + '...' : 
                        page.content
                      }
                    </p>
                  </div>

                  {/* Page Meta */}
                  <div className="text-xs theme-text-muted mb-4">
                    <div>Yaratilgan: {formatDate(page.created_at)}</div>
                    <div>Yangilangan: {formatDate(page.updated_at)}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button className="theme-accent hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors duration-200">
                        <Edit size={16} />
                      </button>
                      <button className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-colors duration-200">
                        <Globe size={16} />
                      </button>
                      <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <span className="text-xs theme-text-muted">
                      {page.content.length} belgi
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredPages.length === 0 && (
              <div className="text-center py-16">
                <div className="theme-text-muted mb-4">
                  <Search size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold theme-text-secondary mb-2">
                  Sahifa topilmadi
                </h3>
                <p className="theme-text-muted">
                  Qidiruv so'zini o'zgartiring
                </p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="theme-bg rounded-lg theme-shadow theme-border border p-6">
              <h3 className="text-lg font-semibold theme-text mb-4">Sahifalar Statistikasi</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold theme-accent">
                    {pages.length}
                  </div>
                  <div className="text-sm theme-text-secondary">Jami sahifalar</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {pages.filter(p => p.published).length}
                  </div>
                  <div className="text-sm theme-text-secondary">Nashr etilgan</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {pages.filter(p => !p.published).length}
                  </div>
                  <div className="text-sm theme-text-secondary">Qoralama</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaticPagesManagement;