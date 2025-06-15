import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  Home, 
  Search, 
  PlusCircle, 
  User, 
  Bell,
  LogOut,
  Settings,
  Award,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Navbar: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: PlusCircle, label: 'Create', path: '/create' },
    { icon: Award, label: 'Challenges', path: '/challenges' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg"
            >
              <Leaf className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Greenstagram
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative group"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                    isActivePath(item.path)
                      ? 'text-green-600'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.div>
                {isActivePath(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Eco Points */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-full"
            >
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                {user?.ecoPoints || 0}
              </span>
            </motion.div>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-800">@{user?.username}</p>
                      <p className="text-sm text-gray-600">Level {user?.ecoLevel}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} className="text-gray-600" />
                      <span className="text-gray-700">Profile</span>
                    </Link>
                    
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={16} className="text-gray-600" />
                      <span className="text-gray-700">Settings</span>
                    </Link>
                    
                    <hr className="my-2" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="grid grid-cols-3 gap-4 mb-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors ${
                      isActivePath(item.path)
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">@{user?.username}</p>
                      <p className="text-sm text-gray-600">{user?.ecoPoints} eco points</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
