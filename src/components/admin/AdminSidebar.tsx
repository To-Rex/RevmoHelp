import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart3,
  Building2,
  FileImage,
  X,
  User,
  Stethoscope,
  Shield,
  Heart,
  Bell,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { AdminUser } from '../../lib/adminAuth';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminUser | null;
  currentPath: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  admin,
  currentPath,
  collapsed,
  onToggleCollapse
}) => {
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Adminlar', href: '/admin/admins', icon: Shield },
    { name: 'Foydalanuvchilar', href: '/admin/users', icon: Users },
    { name: 'Maqolalar', href: '/admin/posts', icon: FileText },
    { name: 'Shifokorlar', href: '/admin/doctors', icon: Stethoscope },
    { name: 'Kasalliklar', href: '/admin/diseases', icon: Activity },
    { name: 'Sahifalar', href: '/admin/pages', icon: FileImage },
    { name: 'Bemorlar Tarixi', href: '/admin/patient-stories', icon: Heart },
    { name: 'Hamkorlar', href: '/admin/partners', icon: Building2 },
   { name: 'Bildirishnomalar', href: '/admin/notifications', icon: Bell },
    { name: 'Analitika', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Sozlamalar', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(href);
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 ${collapsed ? 'w-16' : 'w-64 lg:w-72'} theme-bg theme-shadow-lg
      transform transition-all duration-300 ease-in-out
      lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col overflow-hidden
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 lg:h-18 px-4 lg:px-6 theme-border border-b flex-shrink-0">
        <Link to="/" className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} group`}>
          <img
            src="/logo.png"
            alt="Revmohelp Logo"
            className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {!collapsed && (
            <div>
              <span className="text-lg font-bold theme-text group-hover:theme-accent transition-colors duration-300">Revmohelp</span>
              <div className="text-xs theme-text-muted hidden lg:block">Admin Panel</div>
            </div>
          )}
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 theme-text-secondary hover:theme-text rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-2 theme-text-secondary hover:theme-text rounded-lg hover:theme-bg-tertiary transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-5">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center ${collapsed ? 'justify-center px-2' : 'px-3 lg:px-4'} py-2 lg:py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'theme-text-secondary hover:theme-bg-tertiary hover:theme-text group-hover:translate-x-1'
                }`}
                onClick={onClose}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={18} className={`${collapsed ? '' : 'mr-2 lg:mr-3'} ${isActive(item.href) ? 'text-white' : 'theme-text-muted group-hover:theme-accent'}`} />
                {!collapsed && (
                  <>
                    <span className="truncate text-sm">{item.name}</span>
                    {isActive(item.href) && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User info */}
      <div className="p-3 lg:p-4 theme-border border-t flex-shrink-0">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2 lg:space-x-3'} p-2 lg:p-3 theme-bg-tertiary rounded-xl`}>
          <div className="w-8 h-8 lg:w-9 lg:h-9 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={16} className="theme-accent" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold theme-text truncate">
                {admin?.full_name || 'Admin User'}
              </p>
              <p className="text-xs theme-text-muted capitalize flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                <span className="truncate">{admin?.role || 'admin'}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;