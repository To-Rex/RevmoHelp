import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/common/SEOHead';
import HeroSection from '../components/home/HeroSection';
import LatestPosts from '../components/home/LatestPosts';
import FeaturedDoctors from '../components/home/FeaturedDoctors';
import DiseasesSection from '../components/home/DiseasesSection';
import { getPosts } from '../lib/posts';
import type { Post } from '../types';

const Home: React.FC = () => {
  const { i18n } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [i18n.language]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Check cache first
      const cacheKey = `home_posts_${i18n.language}`;
      const cachedPosts = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      
      // Use cache if less than 3 minutes old
      if (cachedPosts && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < 3 * 60 * 1000) {
          setPosts(JSON.parse(cachedPosts));
          setDataLoaded(true);
          setLoading(false);
          console.log('📦 Using cached home posts data');
          return;
        }
      }
      
      const { data } = await getPosts(i18n.language, { published: true, limit: 6 });
      if (data) {
        setPosts(data);
        
        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        
        setDataLoaded(true);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-bg min-h-screen">
      <SEOHead
        title="Revmohelp"
        description="Revmatik kasalliklar haqida ishonchli ma'lumot. Bemor va shifokorlar uchun professional tibbiy ma'lumot va yo'riqnoma platformasi."
        keywords="revmatik kasalliklar, shifokor, bemor, tibbiy ma'lumot, revmatologiya, salomatlik, artrit, artroz"
        url="https://revmohelp.uz"
      />
      
      <main className="theme-bg">
        <HeroSection />
        <DiseasesSection />
        <LatestPosts posts={posts} />
        <FeaturedDoctors />
      </main>
    </div>
  );
};

export default Home;
