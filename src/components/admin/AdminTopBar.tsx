import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Stethoscope,
  Settings
} from 'lucide-react';
import type { AdminUser } from '../../lib/adminAuth';

interface AdminTopBarProps {
  onMenuClick: () => void;
  admin: AdminUser | null;
  onSignOut: () => void;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({ 
  onMenuClick, 
  admin, 
  onSignOut 
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = () => {
    onSignOut();
    setUserMenuOpen(false);
  };

  return (
    <div className="theme-bg theme-shadow-lg theme-border border-b backdrop-blur-sm bg-opacity-95 flex-shrink-0">
      <div className="flex items-center justify-between h-16 lg:h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 theme-text-secondary hover:theme-text rounded-xl hover:theme-bg-tertiary transition-all duration-200 transform hover:scale-105"
          >
            <Menu size={20} />
          </button>
          
          {/* Search - Hidden on small screens, visible on medium+ */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted" size={16} />
            <input
              type="text"
              placeholder="Qidirish..."
              className="pl-10 pr-4 py-2 w-48 lg:w-80 theme-border border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 theme-bg theme-text text-sm"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          {/* Notifications */}
          <button className="relative p-2 theme-text-secondary hover:theme-text rounded-xl hover:theme-bg-tertiary transition-all duration-200 transform hover:scale-105">
            <Bell size={18} />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-3 w-3 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-xl hover:theme-bg-tertiary transition-all duration-200"
            >
              <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-r from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={16} className="theme-accent" />
              </div>
              <div className="hidden lg:block text-left min-w-0">
                <div className="text-sm font-semibold theme-text truncate max-w-32">
                  {admin?.full_name || 'Admin User'}
                </div>
                <div className="text-xs theme-text-muted truncate max-w-32">
                  @{admin?.login || 'admin'}
                </div>
              </div>
              <ChevronDown size={14} className="hidden lg:block theme-text-muted flex-shrink-0" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 lg:w-52 theme-bg rounded-xl theme-shadow-lg theme-border border py-2 z-50">
                <div className="px-4 py-3 theme-border border-b">
                  <div className="text-sm font-semibold theme-text truncate">
                    {admin?.full_name || 'Admin User'}
                  </div>
                  <div className="text-xs theme-text-muted truncate">
                    @{admin?.login || 'admin'} • {admin?.role || 'admin'}
                  </div>
                </div>
                <Link
                  to="/"
                  className="flex items-center space-x-2 px-4 py-3 text-sm theme-text-secondary hover:theme-bg-tertiary hover:theme-accent transition-all duration-200"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Stethoscope size={16} />
                  <span>Saytni ko'rish</span>
                </Link>
                <div className="theme-border border-t my-2"></div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut size={16} />
                  <span>Chiqish</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTopBar;