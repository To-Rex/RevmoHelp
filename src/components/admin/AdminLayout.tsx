import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart3,
  Menu,
  X,
  Building2,
  FileImage,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Stethoscope,
  Shield
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import ThemeToggle from '../common/ThemeToggle';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, isAuthenticated, loading, logout } = useAdminAuth();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Admin panel yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    navigate('/admin/login');
    return null;
  }


  return (
    <div className="h-screen theme-bg-secondary flex overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        admin={admin}
        currentPath={location.pathname}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0 overflow-hidden">
        {/* Top Bar Component */}
        <AdminTopBar
          onMenuClick={() => setSidebarOpen(true)}
          admin={admin}
          onSignOut={() => {
            logout();
            navigate('/admin/login');
          }}
        />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 2xl:p-8 overflow-auto bg-gray-50 dark:bg-gray-900/20">
          <div className="max-w-none">
          <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;