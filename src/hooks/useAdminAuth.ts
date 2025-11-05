import { useState, useEffect } from 'react';
import { getCurrentAdmin, adminLogout } from '../lib/adminAuth';
import type { AdminUser } from '../lib/adminAuth';

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 Checking admin authentication...');
    
    const checkAuth = () => {
      const currentAdmin = getCurrentAdmin();
      if (currentAdmin) {
        console.log('✅ Admin authenticated:', currentAdmin.full_name);
        setAdmin(currentAdmin);
        setIsAuthenticated(true);
      } else {
        console.log('❌ No admin authentication found');
        setAdmin(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    console.log('🚪 Admin logout initiated');
    adminLogout();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const login = (adminData: AdminUser) => {
    console.log('✅ Admin login successful:', adminData.full_name);
    setAdmin(adminData);
    setIsAuthenticated(true);
  };

  return {
    admin,
    isAuthenticated,
    loading,
    login,
    logout
  };
};