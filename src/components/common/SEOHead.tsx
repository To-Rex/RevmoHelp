import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  article?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Revmohelp - O\'zbekistonda artrit, osteoporoz va revmatik kasalliklar davolash',
  description = '🏥 Toshkentdagi eng yaxshi revmatologlardan bepul maslahat. Artrit, osteoporoz, revmatoid artrit, ankilozlovchi spondilit davolash usullari. ✅ Professional tibbiy yordam va konsultatsiya.',
  keywords = 'artrit davolash toshkent, osteoporoz shifokor o\'zbekiston, revmatologiya markazi, bo\'g\'im og\'rig\'i, revmatoid artrit belgilari, ankilozlovchi spondilit, spondiloartrit, sistemik lupus eritematoz, podagra, fibromialgiya, revmatik kasalliklar, bo\'g\'imlar og\'rig\'i, suyaklar og\'rig\'i, mushaklar og\'rig\'i, immunitet kasalliklari, autoimmun kasalliklar, tibbiy diagnostika, rentgen, MRT, analizlar, dori vositalari, fizioterapiya, massaj, gimnastika, parhez, vitaminlar, kaltsiy, D vitamini, shifokorlar ro\'yxati, konsultatsiya narxi, onlayn maslahat, telegon shifokor, bemorlar hikoyalari, maqolalar, yangiliklar, salomatlik maslahatlari, tibbiy konsultatsiya, shifokor maslahat, bemor yordam, salomatlik sayt, tibbiy ma\'lumot, revmatolog toshkent, artrit alomatlari, osteoporoz oldini olish, bo\'g\'im kasalliklari, revmatik og\'riq, tibbiy muolaja, sog\'liqni saqlash, kasallik belgilari, tibbiy yordam o\'zbekiston, onlayn shifokor, tekin konsultatsiya, tibbiy portal, salomatlik platformasi, revmatolog konsultatsiya, artrit simptomlari, osteoporoz davolash, revmatik bemorlar, bo\'g\'im shishishi, qizil rang, harorat ko\'tarilishi, charchoq, og\'riq qoldiruvchi dori, steroidlar, immunosupressorlar, biologik preparatlar, revmatologiya klinikasi, toshkent revmatolog, o\'zbekiston shifokorlar, bemorlar uchun yordam, salomatlikni saqlash, kasalliklar diagnostikasi, davolash usullari, profilaktika, sog\'liqni mustahkamlash',
  image = 'https://revmohelp.uz/logo.png',
  url = 'https://revmohelp.uz',
  type = 'website',
  article,
}) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const siteTitle = 'Revmohelp';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
  
  // Generate hreflang URLs
  const baseUrl = 'https://revmohelp.uz';
  const currentPath = location.pathname.replace(/^\/(ru|en)/, ''); // Remove language prefix
  
  const hreflangs = [
    { lang: 'uz', url: `${baseUrl}${currentPath}` },
    { lang: 'ru', url: `${baseUrl}/ru${currentPath}` },
    { lang: 'en', url: `${baseUrl}/en${currentPath}` }
  ];
  
  // Get localized content based on current language
  const getLocalizedContent = () => {
    switch (i18n.language) {
      case 'ru':
        return {
          title: title === 'Revmohelp' ? 'Revmohelp' : 
                title === 'Biz Haqimizda' ? 'О нас' :
                title === 'Aloqa' ? 'Контакты' :
                title === 'Maxfiylik Siyosati' ? 'Политика конфиденциальности' :
                title === 'Ma\'lumotlar Xavfsizligi' ? 'Безопасность данных' :
                title === 'Foydalanish Shartlari' ? 'Условия использования' :
                title === 'Tez-tez Beriladigan Savollar' ? 'Часто задаваемые вопросы' :
                title === 'Maqolalar' ? 'Статьи' :
                title === 'Shifokorlar' ? 'Врачи' :
                title === 'Savol-Javob' ? 'Вопросы-ответы' :
                title === 'Kirish' ? 'Войти' :
                title === 'Ro\'yxatdan o\'tish' ? 'Регистрация' :
                title === 'Profil' ? 'Профиль' : title,
          description: i18n.language === 'ru' ? 
            'Профессиональная медицинская информационная платформа для пациентов и врачей. Достоверная информация о ревматических заболеваниях.' :
            description
        };
      case 'en':
        return {
          title: title === 'Revmohelp' ? 'Revmohelp' : 
                title === 'Biz Haqimizda' ? 'About Us' :
                title === 'Aloqa' ? 'Contact' :
                title === 'Maxfiylik Siyosati' ? 'Privacy Policy' :
                title === 'Ma\'lumotlar Xavfsizligi' ? 'Data Security' :
                title === 'Foydalanish Shartlari' ? 'Terms of Use' :
                title === 'Tez-tez Beriladigan Savollar' ? 'FAQ' :
                title === 'Maqolalar' ? 'Articles' :
                title === 'Shifokorlar' ? 'Doctors' :
                title === 'Savol-Javob' ? 'Q&A' :
                title === 'Kirish' ? 'Login' :
                title === 'Ro\'yxatdan o\'tish' ? 'Register' :
                title === 'Profil' ? 'Profile' : title,
          description: i18n.language === 'en' ? 
            'Professional medical information platform for patients and doctors. Reliable information about rheumatic diseases.' :
            description
        };
      default:
        return { title, description };
    }
  };
  
  const localizedContent = getLocalizedContent();
  const localizedTitle = localizedContent.title === siteTitle ? localizedContent.title : `${localizedContent.title} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{localizedTitle}</title>
      <meta name="description" content={localizedContent.description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Revmoinfo Team" />
      <link rel="canonical" href={url} />
      
      {/* Hreflang tags for multilingual SEO */}
      {hreflangs.map((hreflang) => (
        <link
          key={hreflang.lang}
          rel="alternate"
          hrefLang={hreflang.lang}
          href={hreflang.url}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${currentPath}`} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={localizedTitle} />
      <meta property="og:description" content={localizedContent.description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content={`${i18n.language}_${i18n.language.toUpperCase()}`} />
      <meta property="og:locale:alternate" content="ru_RU" />
      <meta property="og:locale:alternate" content="uz_UZ" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={localizedTitle} />
      <meta name="twitter:description" content={localizedContent.description} />
      <meta name="twitter:image" content={image} />

      {/* Article specific meta tags */}
      {article && type === 'article' && (
        <>
          <meta property="article:author" content={article.author} />
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.section && (
            <meta property="article:section" content={article.section} />
          )}
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'Article' : 'WebSite',
          name: localizedTitle,
          description: localizedContent.description,
          url: url,
          image: image,
          inLanguage: i18n.language,
          ...(type === 'article' && article && {
            author: {
              '@type': 'Person',
              name: article.author,
            },
            datePublished: article.publishedTime,
            dateModified: article.modifiedTime,
            articleSection: article.section,
            keywords: article.tags?.join(', '),
            inLanguage: i18n.language,
          }),
          ...(type === 'website' && {
            availableLanguage: ['uz', 'ru', 'en'],
          }),
          ...(type === 'website' && {
            potentialAction: {
              '@type': 'SearchAction',
              target: `${url}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;