import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  CheckCircle
} from 'lucide-react';
import SEOHead from '../components/common/SEOHead';

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'general'
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t('contactPage.info.emailTitle'),
      details: [t('contactPage.info.email1'), t('contactPage.info.email2')],
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Phone,
      title: t('contactPage.info.phoneTitle'),
      details: [t('contactPage.info.phone1'), t('contactPage.info.phone2')],
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: MapPin,
      title: t('contactPage.info.addressTitle'),
      details: [t('contactPage.info.addressLine1'), t('contactPage.info.addressLine2')],
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Clock,
      title: t('contactPage.info.hoursTitle'),
      details: [t('contactPage.info.hoursLine1'), t('contactPage.info.hoursLine2')],
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const departments = [
    {
      name: t('contactPage.departments.general.name'),
      email: t('contactPage.departments.general.email'),
      description: t('contactPage.departments.general.description')
    },
    {
      name: t('contactPage.departments.medical.name'),
      email: t('contactPage.departments.medical.email'),
      description: t('contactPage.departments.medical.description')
    },
    {
      name: t('contactPage.departments.technical.name'),
      email: t('contactPage.departments.technical.email'),
      description: t('contactPage.departments.technical.description')
    },
    {
      name: t('contactPage.departments.partnership.name'),
      email: t('contactPage.departments.partnership.email'),
      description: t('contactPage.departments.partnership.description')
    }
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', url: '#', color: 'hover:text-blue-600' },
    { icon: Instagram, name: 'Instagram', url: '#', color: 'hover:text-pink-600' },
    { icon: Twitter, name: 'Twitter', url: '#', color: 'hover:text-blue-400' },
    { icon: Linkedin, name: 'LinkedIn', url: '#', color: 'hover:text-blue-700' }
  ];

  const faqItems = [
    { question: t('contactPage.faq.q1'), answer: t('contactPage.faq.a1') },
    { question: t('contactPage.faq.q2'), answer: t('contactPage.faq.a2') },
    { question: t('contactPage.faq.q3'), answer: t('contactPage.faq.a3') }
  ];

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title={t('contact')}
        description={t('contactPage.seoDescription')}
        keywords={t('contactPage.seoKeywords')}
        url="https://revmoinfo.uz/contact"
      />

      <div className="min-h-screen theme-bg">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 dark:from-blue-400/5 dark:to-teal-400/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
              <MessageSquare size={16} className="text-blue-600" />
              <span className="text-blue-800 text-sm font-medium">{t('contactPage.badge')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold theme-text mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">{t('contactPage.heading')}</span>
            </h1>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto mb-8">
              {t('contactPage.intro')}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl theme-shadow-lg theme-border border p-6 text-center hover:theme-shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in hover-medical"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-16 h-16 ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-lg font-bold theme-text mb-3">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="theme-text-secondary text-sm">{detail}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('contactPage.form.title')}</h2>
                  <p className="text-gray-600">
                    {t('contactPage.form.desc')}
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contactPage.form.successTitle')}</h3>
                    <p className="text-gray-600">
                      {t('contactPage.form.successDesc')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('contactPage.form.nameLabel')}
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder={t('contactPage.form.namePlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('contactPage.form.emailLabel')}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder={t('contactPage.form.emailPlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('contactPage.form.phoneLabel')}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder={t('contactPage.form.phonePlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('contactPage.form.typeLabel')}
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="general">{t('contactPage.form.types.general')}</option>
                          <option value="medical">{t('contactPage.form.types.medical')}</option>
                          <option value="technical">{t('contactPage.form.types.technical')}</option>
                          <option value="partnership">{t('contactPage.form.types.partnership')}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('contactPage.form.subjectLabel')}
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder={t('contactPage.form.subjectPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('contactPage.form.messageLabel')}
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        placeholder={t('contactPage.form.messagePlaceholder')}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>{t('contactPage.form.submitting')}</span>
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          <span>{t('contactPage.form.submit')}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Departments */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('contactPage.sidebar.departmentsTitle')}</h3>
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors duration-200">
                      <h4 className="font-semibold text-gray-900 mb-1">{dept.name}</h4>
                      <p className="text-gray-600 text-sm mb-2">{dept.description}</p>
                      <a
                        href={`mailto:${dept.email}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {dept.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('contactPage.sidebar.socialTitle')}</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.url}
                        className={`w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 ${social.color} transition-colors duration-200`}
                      >
                        <Icon size={20} />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('contactPage.sidebar.faqTitle')}</h3>
                <div className="space-y-4">
                  {faqItems.map((faq, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">{faq.question}</h4>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">{t('contactPage.sidebar.emergencyTitle')}</h3>
                <p className="text-red-100 mb-4 text-sm">
                  {t('contactPage.sidebar.emergencyText')}
                </p>
                <a
                  href="tel:103"
                  className="inline-flex items-center space-x-2 bg-white text-red-600 px-4 py-2 rounded-xl font-semibold hover:bg-red-50 transition-colors duration-200"
                >
                  <Phone size={16} />
                  <span>103</span>
                </a>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('contactPage.sidebar.mapTitle')}</h2>
                <p className="text-gray-600">
                  {t('contactPage.sidebar.mapDesc')}
                </p>
              </div>
              <div className="bg-gray-100 rounded-2xl h-96 overflow-hidden">
                <iframe
                  src="https://maps.google.com/maps?q=Yunusabad%20district%2C%20Amir%20Temur%20street%20108%2C%20Tashkent&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
