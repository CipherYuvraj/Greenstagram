import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  MessageCircle, 
  Home, 
  Compass, 
  PlusCircle, 
  User,
  Settings,
  LogOut,
  Leaf
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout } = useAuthStore();
  const notificationStore = useNotificationStore();
  const unreadCount = (notificationStore as any)?.unreadCount || 0;

  const navItems = [
    { icon: Home, label: 'Home', path: '/', active: location.pathname === '/' },
    { icon: Compass, label: 'Explore', path: '/explore', active: location.pathname === '/explore' },
    { icon: PlusCircle, label: 'Create', path: '/create', active: location.pathname === '/create' },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-green-100 shadow-lg"
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-50 via-transparent to-secondary-50 opacity-50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2"
          >
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="relative"
              >
                <Leaf className="w-8 h-8 text-primary-600" />
                {/* Particle trail */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary-400 rounded-full"
                    animate={{
                      x: [0, Math.random() * 10 - 5],
                      y: [0, Math.random() * 10 - 5],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Greenstagram
              </span>
            </Link>
          </motion.div>

          {/* Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-lg mx-8 relative">
            <form onSubmit={handleSearch}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="Search posts, users, challenges..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50/80 backdrop-blur border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                />
                {/* Search glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary-500/20"
                  animate={{ opacity: showSearchResults ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </form>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearchResults && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
                >
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-2">Quick suggestions</p>
                    {/* Add search suggestions here */}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-1">
            {/* Main Navigation */}
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Link
                  to={item.path}
                  className={`relative p-3 rounded-full transition-all duration-300 group ${
                    item.active 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  
                  {/* Active indicator */}
                  {item.active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary-500/10 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Hover particles */}
                  <AnimatePresence>
                    <motion.div className="absolute inset-0 pointer-events-none">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100"
                          animate={{
                            x: [0, Math.random() * 20 - 10],
                            y: [0, Math.random() * 20 - 10],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </Link>
              </motion.div>
            ))}

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="relative"
            >
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 rounded-full text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-all duration-300"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </button>
            </motion.div>

            {/* Messages */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Link
                to="/messages"
                className="p-3 rounded-full text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-all duration-300"
              >
                <MessageCircle className="w-6 h-6" />
              </Link>
            </motion.div>

            {/* User Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="relative"
            >
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="relative"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 hover:border-primary-400 transition-colors duration-300"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </motion.div>
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{user?.username}</p>
                      <p className="text-sm text-gray-500">Level {user?.ecoLevel} • {user?.ecoPoints} points</p>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to={`/profile/${user?.username}`}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
