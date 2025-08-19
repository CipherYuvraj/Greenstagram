import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Sparkles, TrendingUp, Users, Award, Leaf, LogOut, Settings, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Link, useNavigate } from 'react-router-dom';

// Simple Layout component with navigation
const Layout: React.FC<{ children: React.ReactNode; showParticles?: boolean; particleTheme?: string; className?: string }> = ({ 
  children, 
  showParticles, 
  particleTheme, 
  className 
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 ${className || ''}`}>
      {/* Navigation Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-green-100 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
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
              >
                <Leaf className="w-8 h-8 text-green-600" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Greenstagram
              </span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Link
                to="/create"
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </Link>
              
              {/* Profile Button - Fixed to navigate to profile page */}
              <Link 
                to={`/profile/${user?.username || 'me'}`}
                className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{user?.username || 'User'}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {children}
    </div>
  );
};

// Simple PostCard component for now
const PostCard: React.FC<{ post: any; currentUser: any; onLike: (id: string) => void }> = ({ post, currentUser, onLike }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-100 shadow-lg"
  >
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
        <span className="text-white font-semibold">
          {post.userId.username.charAt(0).toUpperCase()}
        </span>
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">@{post.userId.username}</h3>
        <p className="text-sm text-gray-600">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
      {post.userId.isVerified && (
        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          ✓ Verified
        </div>
      )}
    </div>
    
    <p className="text-gray-800 mb-4">{post.content}</p>
    
    {post.hashtags && post.hashtags.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {post.hashtags.map((tag: string, index: number) => (
          <span key={index} className="text-green-600 text-sm">#{tag}</span>
        ))}
      </div>
    )}
    
    <div className="flex items-center space-x-6 text-gray-600">
      <button 
        onClick={() => onLike(post._id)}
        className="flex items-center space-x-2 hover:text-red-500 transition-colors"
      >
        <span>❤️</span>
        <span>{post.likes.length}</span>
      </button>
      <div className="flex items-center space-x-2">
        <span>💬</span>
        <span>{post.comments.length}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>🔄</span>
        <span>{post.shares}</span>
      </div>
    </div>
  </motion.div>
);

// Simple LoadingSpinner component
const LoadingSpinner: React.FC<{ size?: string; variant?: string; text?: string }> = ({ 
  size = 'md', 
  variant = 'default',
  text 
}) => (
  <div className="flex flex-col items-center space-y-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`border-4 border-green-200 border-t-green-500 rounded-full ${
        size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
      }`}
    />
    {text && <p className="text-gray-600">{text}</p>}
  </div>
);

// Simple AnimatedButton component
const AnimatedButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  variant?: string;
  size?: string;
  className?: string;
  particleEffect?: boolean;
  glowEffect?: boolean;
  icon?: any;
}> = ({ 
  children, 
  onClick, 
  loading = false, 
  variant = 'primary',
  size = 'md',
  className = '',
  particleEffect,
  glowEffect,
  icon: Icon
}) => (
  <motion.button
    onClick={onClick}
    disabled={loading}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`
      bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-medium 
      hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 
      focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 
      disabled:opacity-50 disabled:cursor-not-allowed ${className}
      ${size === 'lg' ? 'px-8 py-4 text-lg' : ''}
    `}
  >
    {loading ? (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
      />
    ) : (
      <>
        {Icon && <Icon className="w-5 h-5" />}
        <span>{children}</span>
      </>
    )}
  </motion.button>
);

const Home: React.FC = () => {
  const { user, fetchProfile } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const [feedType, setFeedType] = useState('following');

  // Fetch user profile and notifications on mount
  useEffect(() => {
    if (user?.username) {
      fetchProfile();
      fetchNotifications();
    }
  }, [user?.username, fetchProfile, fetchNotifications]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['feed', feedType],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/posts/feed?page=${pageParam}&type=${feedType}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch posts, using mock data:', error);
        // Fallback to mock data if API fails
        return {
          data: {
            posts: [
              {
                _id: '1',
                userId: {
                  _id: 'user1',
                  username: 'eco_warrior',
                  profilePicture: '',
                  isVerified: true
                },
                content: "Just completed my first week of zero waste living! 🌱 It's amazing how much we can reduce our environmental impact with small daily changes. #ZeroWaste #SustainableLiving",
                media: [],
                hashtags: ['ZeroWaste', 'SustainableLiving', 'EcoFriendly'],
                mentions: [],
                likes: [{ _id: 'like1' }, { _id: 'like2' }],
                comments: [{ _id: 'comment1' }],
                shares: 5,
                isEcoPost: true,
                ecoCategory: 'sustainable-living',
                visibility: 'public',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                _id: '2',
                userId: {
                  _id: 'user2',
                  username: 'plant_parent',
                  profilePicture: '',
                  isVerified: false
                },
                content: "My urban garden is thriving! 🌿 Growing your own vegetables is not only rewarding but also helps reduce your carbon footprint. Here's what I harvested today! #UrbanGardening #GrowYourOwn",
                media: [],
                hashtags: ['UrbanGardening', 'GrowYourOwn', 'Sustainability'],
                mentions: [],
                likes: [{ _id: 'like3' }],
                comments: [],
                shares: 2,
                isEcoPost: true,
                ecoCategory: 'gardening',
                visibility: 'public',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
              }
            ]
          },
          pagination: {
            hasMore: pageParam < 2
          }
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.pagination?.hasMore ? pages.length + 1 : undefined;
    },
    enabled: !!user
  });

  const posts = data?.pages?.flatMap(page => page.data.posts) || [];

  const feedTabs = [
    {
      key: 'following',
      label: 'Following',
      icon: Users,
      description: 'Posts from people you follow'
    },
    {
      key: 'trending',
      label: 'Trending',
      icon: TrendingUp,
      description: 'Popular posts this week'
    },
    {
      key: 'discover',
      label: 'Discover',
      icon: Sparkles,
      description: 'Explore new content'
    }
  ];

  const handlePostLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Refresh the feed after successful like
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner
            size="lg"
            variant="eco"
            text="Loading your eco-feed..."
          />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Something went wrong</h2>
            <p className="text-gray-500">Please try refreshing the page</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showParticles={true} particleTheme="eco">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Welcome to Greenstagram! 🌱
          </h1>
          <p className="text-gray-600">
            {user?.username ? `Hello, ${user.username}! Level ${user.ecoLevel || 1} • ${user.ecoPoints || 0} points` : 'Your eco-friendly social network'}
          </p>
        </motion.div>

        {/* Feed Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200">
            {feedTabs.map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setFeedType(tab.key)}
                className={`relative flex-1 px-4 py-3 rounded-lg transition-all duration-300 ${feedType === tab.key
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:text-green-600'}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {feedType === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center space-x-2">
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
          <motion.p
            key={feedType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-500 mt-2 text-center"
          >
            {feedTabs.find(tab => tab.key === feedType)?.description}
          </motion.p>
        </motion.div>

        {/* Posts Feed */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => (
              <motion.div
                key={`${feedType}-${post._id}`}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                layout
              >
                <PostCard
                  post={post}
                  currentUser={user}
                  onLike={handlePostLike}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {hasNextPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-8"
          >
            <AnimatedButton
              onClick={handleLoadMore}
              loading={isFetchingNextPage}
              variant="eco"
              size="lg"
              className="px-8"
              particleEffect={true}
              glowEffect={true}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More Posts'}
            </AnimatedButton>
          </motion.div>
        )}

        {/* Empty State */}
        {posts.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="mb-4">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 mb-6">
              {feedType === 'following'
                ? "Follow some eco-warriors to see their posts here!"
                : "Be the first to share something amazing!"
              }
            </p>
            <AnimatedButton
              onClick={() => window.location.href = '/explore'}
              variant="primary"
              icon={Sparkles}
            >
              Explore Content
            </AnimatedButton>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
