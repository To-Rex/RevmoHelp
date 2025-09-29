import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Save, 
  RotateCcw, 
  Eye, 
  CheckCircle,
  AlertCircle,
  Settings as SettingsIcon,
  Monitor,
  Smartphone,
  Globe,
  Shield,
  Database,
  Bell,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Edit,
  X,
  Copy
} from 'lucide-react';
import { 
  applyColorScheme, 
  getCurrentColorScheme, 
  getAllColorSchemes,
  saveCustomColorScheme,
  deleteCustomColorScheme,
  generateColorVariants,
  applyCustomColorScheme,
  type CustomColorScheme
} from '../../utils/colorScheme';
import { updateGlobalColorScheme } from '../../lib/globalSettings';
import type { GlobalColorScheme } from '../../lib/globalSettings';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const Settings: React.FC = () => {
  const { admin } = useAdminAuth();
  const [currentScheme, setCurrentScheme] = useState<string>('default');
  const [previewScheme, setPreviewScheme] = useState<string>('default');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isApplying, setIsApplying] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState<CustomColorScheme | null>(null);
  const [customFormData, setCustomFormData] = useState({
    name: '',
    primary: '#90978C',
    primaryHover: '#7A8177',
    primaryActive: '#6B7268',
    description: ''
  });

  useEffect(() => {
    const scheme = getCurrentColorScheme();
    setCurrentScheme(scheme);
    setPreviewScheme(scheme);
  }, []);

  const handlePreview = (scheme: string) => {
    setPreviewScheme(scheme);
    applyColorScheme(scheme);
    setMessage({ type: '', text: '' });
  };

  const handleApply = async () => {
    setIsApplying(true);
    setMessage({ type: '', text: '' });

    try {
      // Simulate saving to backend (in real app, save to user preferences)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      applyColorScheme(previewScheme, true); // Apply globally when admin selects
      setCurrentScheme(previewScheme);
      const allSchemes = getAllColorSchemes();
      setMessage({ 
        type: 'success', 
        text: `${allSchemes[previewScheme].name} rang sxemasi hamma foydalanuvchilar uchun o'zgartirildi!` 
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.' });
    } finally {
      setIsApplying(false);
    }
  };

  const handleReset = () => {
    const defaultScheme = 'default';
    setPreviewScheme(defaultScheme);
    applyColorScheme(defaultScheme);
    setMessage({ type: '', text: '' });
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customFormData.name.trim()) {
      setMessage({ type: 'error', text: 'Shablon nomi kiritilishi shart' });
      return;
    }
    
    try {
      const customId = saveCustomColorScheme({
        name: customFormData.name,
        primary: customFormData.primary,
        primaryHover: customFormData.primaryHover,
        primaryActive: customFormData.primaryActive,
        description: customFormData.description || `${customFormData.name} maxsus rang sxemasi`
      });
      
      setMessage({ type: 'success', text: 'Maxsus shablon muvaffaqiyatli yaratildi!' });
      setShowCreateModal(false);
      setCustomFormData({ name: '', primary: '#90978C', primaryHover: '#7A8177', primaryActive: '#6B7268', description: '' });
      
      // Auto-apply the new scheme
      handlePreview(customId);
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
    }
  };

  const handleEditCustom = (scheme: CustomColorScheme) => {
    setCustomFormData({
      name: scheme.name,
      primary: scheme.primary,
      primaryHover: scheme.primaryHover,
      primaryActive: scheme.primaryActive,
      description: scheme.description
    });
    setEditingScheme(scheme);
    setShowEditModal(true);
  };

  const handleUpdateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingScheme || !customFormData.name.trim()) {
      setMessage({ type: 'error', text: 'Shablon nomi kiritilishi shart' });
      return;
    }
    
    try {
      // Delete old scheme
      deleteCustomColorScheme(editingScheme.id);
      
      // Create updated scheme
      const customId = saveCustomColorScheme({
        name: customFormData.name,
        primary: customFormData.primary,
        primaryHover: customFormData.primaryHover,
        primaryActive: customFormData.primaryActive,
        description: customFormData.description || `${customFormData.name} maxsus rang sxemasi`
      });
      
      setMessage({ type: 'success', text: 'Maxsus shablon muvaffaqiyatli yangilandi!' });
      setShowEditModal(false);
      setEditingScheme(null);
      setCustomFormData({ name: '', primary: '#90978C', primaryHover: '#7A8177', primaryActive: '#6B7268', description: '' });
      
      // Auto-apply the updated scheme
      handlePreview(customId);
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
    }
  };

  const handleDeleteCustom = (scheme: CustomColorScheme) => {
    if (!confirm(`"${scheme.name}" shablonini o'chirishni xohlaysizmi?`)) return;
    
    try {
      deleteCustomColorScheme(scheme.id);
      setMessage({ type: 'success', text: 'Maxsus shablon o\'chirildi!' });
      
      // If deleted scheme was active, switch to default
      if (previewScheme === scheme.id) {
        handlePreview('default');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik yuz berdi' });
    }
  };

  const handleDuplicateScheme = (scheme: any) => {
    setCustomFormData({
      name: `${scheme.name} (nusxa)`,
      primary: scheme.primary,
      primaryHover: scheme.primaryHover,
      primaryActive: scheme.primaryActive,
      description: `${scheme.description} - nusxa`
    });
    setShowCreateModal(true);
  };

  const openSitePreview = () => {
    window.open('/', '_blank');
  };

  const settingsSections = [
    {
      title: 'Rang Sxemasi',
      description: 'Sayt ranglarini boshqarish',
      icon: Palette,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Tizim Sozlamalari',
      description: 'Umumiy tizim konfiguratsiyasi',
      icon: SettingsIcon,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Xavfsizlik',
      description: 'Autentifikatsiya va ruxsatlar',
      icon: Shield,
      color: 'bg-red-100 text-red-600'
    },
    {
      title: 'Ma\'lumotlar Bazasi',
      description: 'Database sozlamalari',
      icon: Database,
      color: 'bg-green-100 text-green-600'
    }
  ];

  const allSchemes = getAllColorSchemes();
  const builtInSchemes = Object.entries(allSchemes).filter(([key, scheme]) => !scheme.isCustom);
  const customSchemes = Object.entries(allSchemes).filter(([key, scheme]) => scheme.isCustom);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold theme-text">Tizim Sozlamalari</h1>
          <p className="theme-text-secondary">Platformaning umumiy sozlamalarini boshqarish</p>
        </div>
        <button
          onClick={openSitePreview}
          className="flex items-center space-x-2 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
        >
          <Eye size={18} />
          <span>Saytni ko'rish</span>
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center space-x-2 animate-slide-down ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
          )}
          <span className={message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Settings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div
              key={index}
              className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6 hover:theme-shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-bold theme-text mb-2">{section.title}</h3>
              <p className="theme-text-secondary text-sm">{section.description}</p>
            </div>
          );
        })}
      </div>

      {/* Color Scheme Management */}
      <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
              <Palette size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text">Rang Sxemasi Boshqaruvi</h2>
              <p className="theme-text-secondary">Saytning asosiy ranglarini o'zgartiring</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm theme-text-muted">
              Joriy: <span className="font-semibold theme-text">{allSchemes[currentScheme]?.name || 'Default'}</span>
            </span>
          </div>
        </div>

        {/* Current vs Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold theme-text">Joriy Rang Sxemasi</h3>
            <div className="p-6 theme-bg-secondary rounded-xl border-l-4" style={{ borderLeftColor: allSchemes[currentScheme]?.primary || '#90978C' }}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold theme-text">{allSchemes[currentScheme]?.name || 'Default'}</h4>
                <div 
                  className="w-8 h-8 rounded-lg shadow-sm border-2 border-white"
                  style={{ backgroundColor: allSchemes[currentScheme]?.primary || '#90978C' }}
                ></div>
              </div>
              <p className="theme-text-secondary text-sm">{allSchemes[currentScheme]?.description || 'Default theme'}</p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="text-xs theme-text-muted">Asosiy rang:</div>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                  {allSchemes[currentScheme]?.primary || '#90978C'}
                </code>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold theme-text">Ko'rib Chiqilayotgan</h3>
            <div className="p-6 theme-bg-secondary rounded-xl border-l-4" style={{ borderLeftColor: allSchemes[previewScheme]?.primary || '#90978C' }}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold theme-text">{allSchemes[previewScheme]?.name || 'Default'}</h4>
                <div 
                  className="w-8 h-8 rounded-lg shadow-sm border-2 border-white"
                  style={{ backgroundColor: allSchemes[previewScheme]?.primary || '#90978C' }}
                ></div>
              </div>
              <p className="theme-text-secondary text-sm">{allSchemes[previewScheme]?.description || 'Default theme'}</p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="text-xs theme-text-muted">Asosiy rang:</div>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                  {allSchemes[previewScheme]?.primary || '#90978C'}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Color Scheme Options */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold theme-text">Mavjud Rang Sxemalari</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 theme-accent-bg text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors duration-200"
            >
              <Plus size={16} />
              <span>Yangi Shablon</span>
            </button>
          </div>
          
          {/* Built-in Schemes */}
          <div>
            <h4 className="font-semibold theme-text mb-4">Standart Shablonlar</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {builtInSchemes.map(([key, scheme]) => (
                <button
                  key={key}
                  onClick={() => handlePreview(key)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 text-left ${
                    previewScheme === key
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                      : 'theme-border hover:border-purple-300 dark:hover:border-purple-600 theme-bg-tertiary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold theme-text">{scheme.name}</h4>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-lg shadow-sm border border-gray-200"
                        style={{ backgroundColor: scheme.primary }}
                      ></div>
                      <div 
                        className="w-6 h-6 rounded-lg shadow-sm border border-gray-200"
                        style={{ backgroundColor: scheme.primaryHover }}
                      ></div>
                      <div 
                        className="w-6 h-6 rounded-lg shadow-sm border border-gray-200"
                        style={{ backgroundColor: scheme.primaryActive }}
                      ></div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateScheme(scheme);
                        }}
                        className="p-1 theme-text-muted hover:theme-accent transition-colors duration-200"
                        title="Nusxa olish"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="theme-text-secondary text-sm mb-3">{scheme.description}</p>
                  <div className="flex items-center justify-between">
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                      {scheme.primary}
                    </code>
                    {currentScheme === key && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                        Joriy
                      </span>
                    )}
                    {previewScheme === key && previewScheme !== currentScheme && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full">
                        Ko'rib chiqilmoqda
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Schemes */}
          {customSchemes.length > 0 && (
            <div>
              <h4 className="font-semibold theme-text mb-4">Maxsus Shablonlar</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customSchemes.map(([key, scheme]) => (
                  <button
                    key={key}
                    onClick={() => handlePreview(key)}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 text-left relative group ${
                      previewScheme === key
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                        : 'theme-border hover:border-purple-300 dark:hover:border-purple-600 theme-bg-tertiary'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold theme-text">{scheme.name}</h4>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded-lg shadow-sm border border-gray-200"
                          style={{ backgroundColor: scheme.primary }}
                        ></div>
                        <div 
                          className="w-6 h-6 rounded-lg shadow-sm border border-gray-200"
                          style={{ backgroundColor: scheme.primaryHover }}
                        ></div>
                        <div 
                          className="w-6 h-6 rounded-lg shadow-sm border border-gray-200"
                          style={{ backgroundColor: scheme.primaryActive }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Custom scheme actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCustom(scheme as CustomColorScheme);
                        }}
                        className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm theme-accent hover:text-blue-800 dark:hover:text-blue-300"
                        title="Tahrirlash"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateScheme(scheme);
                        }}
                        className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm theme-text-muted hover:theme-accent"
                        title="Nusxa olish"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustom(scheme as CustomColorScheme);
                        }}
                        className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm text-red-600 hover:text-red-800"
                        title="O'chirish"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    
                    <p className="theme-text-secondary text-sm mb-3">{scheme.description}</p>
                    <div className="flex items-center justify-between">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                        {scheme.primary}
                      </code>
                      <div className="flex items-center space-x-2">
                        {currentScheme === key && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                            Joriy
                          </span>
                        )}
                        {previewScheme === key && previewScheme !== currentScheme && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full">
                            Ko'rib chiqilmoqda
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                          Maxsus
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold theme-text">Ko'rinish Namunasi</h3>
          
          <div className="theme-bg-secondary rounded-xl p-6 border-l-4" style={{ borderLeftColor: allSchemes[previewScheme]?.primary || '#90978C' }}>
            <div className="space-y-4">
              {/* Sample UI Elements */}
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold theme-text">Namuna Sahifa</h4>
                <div className="flex items-center space-x-2">
                  <button 
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-200 theme-accent-bg text-white hover:bg-opacity-90"
                  >
                    Asosiy Tugma
                  </button>
                  <button className="px-4 py-2 rounded-lg font-medium transition-all duration-200 theme-border border theme-text hover:theme-bg-tertiary">
                    Ikkinchi Tugma
                  </button>
                </div>
              </div>
              
              <p className="theme-text-secondary">
                Bu yerda saytning asosiy matnlari ko'rsatiladi. Rang sxemasi o'zgarishi bilan 
                barcha elementlar avtomatik yangilanadi.
              </p>
              
              <div className="flex items-center space-x-4">
                <a href="#" className="theme-accent hover:theme-accent-secondary transition-colors duration-200 font-medium">
                  Namuna havola
                </a>
                <span className="theme-text-muted">•</span>
                <span className="theme-text-tertiary">Ikkinchi darajali matn</span>
              </div>

              {/* Sample Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="theme-bg rounded-lg theme-shadow theme-border border p-4">
                  <div className="w-8 h-8 theme-accent-bg rounded-lg flex items-center justify-center mb-3">
                    <Monitor size={16} className="text-white" />
                  </div>
                  <h5 className="font-semibold theme-text mb-2">Namuna Karta</h5>
                  <p className="theme-text-secondary text-sm">Karta tarkibi va dizayni</p>
                </div>
                
                <div className="theme-bg rounded-lg theme-shadow theme-border border p-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-3">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h5 className="font-semibold theme-text mb-2">Muvaffaqiyat</h5>
                  <p className="theme-text-secondary text-sm">Ijobiy xabarlar</p>
                </div>
                
                <div className="theme-bg rounded-lg theme-shadow theme-border border p-4">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mb-3">
                    <Bell size={16} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <h5 className="font-semibold theme-text mb-2">Bildirishnoma</h5>
                  <p className="theme-text-secondary text-sm">Tizim xabarlari</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t theme-border">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 theme-text-secondary hover:theme-accent px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
          >
            <RotateCcw size={18} />
            <span>Standartga qaytarish</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={openSitePreview}
              className="flex items-center space-x-2 theme-border border theme-text-secondary px-4 py-2 rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
            >
              <Eye size={18} />
              <span>Saytni ko'rish</span>
            </button>
            
            <button
              onClick={handleApply}
              disabled={isApplying || previewScheme === currentScheme}
              className="flex items-center space-x-2 theme-accent-bg text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>
                {isApplying ? 'Saqlanmoqda...' : 
                 previewScheme === currentScheme ? 'Saqlangan' : 'Saqlash'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Custom Color Scheme Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Yangi Rang Sxemasi</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCustomFormData({ name: '', primary: '#90978C', primaryHover: '#7A8177', primaryActive: '#6B7268', description: '' });
                  setMessage({ type: '', text: '' });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-6">
              {message.text && (
                <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm ${message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {message.text}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shablon nomi *
                </label>
                <input
                  type="text"
                  value={customFormData.name}
                  onChange={(e) => setCustomFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Masalan: Mening Rangim"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Rang Sozlamalari *
                </label>
                
                {/* Primary Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Asosiy rang (Primary)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customFormData.primary}
                      onChange={(e) => setCustomFormData(prev => ({ ...prev, primary: e.target.value }))}
                      className="w-16 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customFormData.primary}
                      onChange={(e) => setCustomFormData(prev => ({ ...prev, primary: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="#90978C"
                    />
                  </div>
                </div>
                
                {/* Hover Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Hover rangi
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customFormData.primaryHover}
                      onChange={(e) => setCustomFormData(prev => ({ ...prev, primaryHover: e.target.value }))}
                      className="w-16 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customFormData.primaryHover}
                      onChange={(e) => setCustomFormData(prev => ({ ...prev, primaryHover: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="#7A8177"
                    />
                  </div>
                </div>
                
                {/* Active Color */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Active rangi
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customFormData.primaryActive}
                      onChange={(e) => setCustomFormData(prev => ({ ...prev, primaryActive: e.target.value }))}
                      className="w-16 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customFormData.primaryActive}
                      onChange={(e) => setCustomFormData(prev => ({ ...prev, primaryActive: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="#6B7268"
                    />
                  </div>
                </div>
                
                {/* Auto-generate button */}
                <button
                  type="button"
                  onClick={() => {
                    const variants = generateColorVariants(customFormData.primary);
                    setCustomFormData(prev => ({
                      ...prev,
                      primaryHover: variants.hover,
                      primaryActive: variants.active
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm"
                >
                  Avtomatik Hover/Active ranglar yaratish
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tavsif
                </label>
                <textarea
                  value={customFormData.description}
                  onChange={(e) => setCustomFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Rang sxemasi haqida qisqacha..."
                />
              </div>

              {/* Enhanced Color Preview */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Ko'rinish Namunasi</h4>
                <div className="space-y-3">
                  {/* Color Swatches */}
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: customFormData.primary }}
                    ></div>
                    <div 
                      className="w-12 h-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: customFormData.primaryHover }}
                    ></div>
                    <div 
                      className="w-12 h-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: customFormData.primaryActive }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between">
                    <span>Asosiy</span>
                    <span>Hover</span>
                    <span>Active</span>
                  </div>
                  
                  {/* Sample Button */}
                  <div className="pt-3">
                    <button 
                      type="button"
                      className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105"
                      style={{ backgroundColor: customFormData.primary }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = customFormData.primaryHover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = customFormData.primary}
                    >
                      Namuna Tugma
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCustomFormData({ name: '', primary: '#90978C', primaryHover: '#7A8177', primaryActive: '#6B7268', description: '' });
                    setMessage({ type: '', text: '' });
                  }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: customFormData.primary }}
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Custom Color Scheme Modal */}
      {showEditModal && editingScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rang Sxemasini Tahrirlash</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingScheme(null);
                  setCustomFormData({ name: '', primary: '#90978C', primaryHover: '#7A8177', primaryActive: '#6B7268', description: '' });
                  setMessage({ type: '', text: '' });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCustom} className="space-y-6">
              {message.text && (
                <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm ${message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {message.text}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shablon nomi *
                </label>
                <input
                  type="text"
                  value={customFormData.name}
                  onChange={(e) => setCustomFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Rang Sozlamalari *
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      1. Asosiy Background Rangi *
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={customFormData.background}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, background: e.target.value }))}
                        className="w-12 h-12 rounded-lg border-2 theme-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customFormData.background}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, background: e.target.value }))}
                        className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text font-mono"
                        placeholder="#CAD8D6"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      2. Tugmalar Rangi (Primary) *
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={customFormData.primary}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, primary: e.target.value }))}
                        className="w-12 h-12 rounded-lg border-2 theme-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customFormData.primary}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, primary: e.target.value }))}
                        className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text font-mono"
                        placeholder="#90978C"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      3. Hover Rangi *
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={customFormData.primaryHover}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, primaryHover: e.target.value }))}
                        className="w-12 h-12 rounded-lg border-2 theme-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customFormData.primaryHover}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, primaryHover: e.target.value }))}
                        className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text font-mono"
                        placeholder="#7A8177"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      4. Active Rangi *
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={customFormData.primaryActive}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, primaryActive: e.target.value }))}
                        className="w-12 h-12 rounded-lg border-2 theme-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customFormData.primaryActive}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, primaryActive: e.target.value }))}
                        className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text font-mono"
                        placeholder="#6B7268"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      5. Kartalar Rangi (Items) *
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={customFormData.items}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, items: e.target.value }))}
                        className="w-12 h-12 rounded-lg border-2 theme-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customFormData.items}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, items: e.target.value }))}
                        className="flex-1 px-3 py-2 theme-border border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 theme-bg theme-text font-mono"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Auto-generate button */}
                <button
                  type="button"
                  onClick={() => {
                    const variants = generateColorVariants(customFormData.primary);
                    setCustomFormData(prev => ({
                      ...prev,
                      primaryHover: variants.hover,
                      primaryActive: variants.active
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm"
                >
                  Asosiy rangdan avtomatik yaratish
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tavsif
                </label>
                <textarea
                  value={customFormData.description}
                  onChange={(e) => setCustomFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Rang sxemasi haqida qisqacha..."
                />
              </div>

              {/* Enhanced Color Preview */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Ko'rinish Namunasi</h4>
                <div className="space-y-3">
                  {/* Color Swatches with Labels */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div 
                        className="w-full h-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-2"
                        style={{ backgroundColor: customFormData.primary }}
                      ></div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Asosiy</div>
                      <code className="text-xs font-mono text-gray-500">{customFormData.primary}</code>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-full h-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-2"
                        style={{ backgroundColor: customFormData.primaryHover }}
                      ></div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Hover</div>
                      <code className="text-xs font-mono text-gray-500">{customFormData.primaryHover}</code>
                    </div>
                    <div className="text-center">
                      <div 
                        className="w-full h-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-2"
                        style={{ backgroundColor: customFormData.primaryActive }}
                      ></div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
                      <code className="text-xs font-mono text-gray-500">{customFormData.primaryActive}</code>
                    </div>
                  </div>
                  
                  {/* Interactive Sample Elements */}
                  <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <button 
                      type="button"
                      className="w-full px-4 py-2 rounded-lg text-white font-medium transition-all duration-200"
                      style={{ backgroundColor: customFormData.primary }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = customFormData.primaryHover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = customFormData.primary}
                    >
                      Asosiy Tugma
                    </button>
                    <div 
                      className="w-full p-4 rounded-lg border-l-4 bg-white dark:bg-gray-800"
                      style={{ borderLeftColor: customFormData.primary }}
                    >
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Namuna Karta</h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Bu sizning yangi rang sxemangizning ko'rinishi</p>
                    </div>
                    <button className="px-4 py-2 border-2 rounded-lg font-medium transition-colors duration-200" style={{ borderColor: customFormData.primary, color: customFormData.primary }}>
                      Outline Tugma
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingScheme(null);
                    setCustomFormData({ name: '', primary: '#90978C', primaryHover: '#7A8177', primaryActive: '#6B7268', description: '' });
                    setMessage({ type: '', text: '' });
                  }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: customFormData.primary }}
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Info */}
        <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6">
          <h3 className="text-lg font-semibold theme-text mb-4">Platforma Ma'lumotlari</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Versiya</span>
              <span className="font-semibold theme-text">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Build</span>
              <span className="font-semibold theme-text">2024.01.20</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Environment</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                Production
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-text-secondary">Database</span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                Supabase
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6">
          <h3 className="text-lg font-semibold theme-text mb-4">Aloqa Ma'lumotlari</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <Mail size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium theme-text">Email</p>
                <p className="text-sm theme-text-secondary">admin@revmoinfo.uz</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <Phone size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium theme-text">Telefon</p>
                <p className="text-sm theme-text-secondary">+998 71 123 45 67</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium theme-text">Manzil</p>
                <p className="text-sm theme-text-secondary">Toshkent, O'zbekiston</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="theme-bg rounded-2xl theme-shadow-lg theme-border border p-6">
        <h3 className="text-lg font-semibold theme-text mb-4">Qo'shimcha Sozlamalar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold theme-text">Sayt Sozlamalari</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="theme-text-secondary">Yangi foydalanuvchi ro'yxati</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="theme-text-secondary">Email bildirishnomalar</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="theme-text-secondary">Avtomatik zaxira</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold theme-text">Xavfsizlik</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="theme-text-secondary">2FA majburiy</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="theme-text-secondary">Session timeout</span>
                <select className="px-2 py-1 theme-border border rounded text-sm theme-bg theme-text">
                  <option>24 soat</option>
                  <option>7 kun</option>
                  <option>30 kun</option>
                </select>
              </label>
              <label className="flex items-center justify-between">
                <span className="theme-text-secondary">Login loglar</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;