import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, TrendingUp, Users, Leaf, LogOut, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { apiService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';

// Simple Layout component with navigation
const Layout: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-800 transition-colors duration-300 ${className || ''}`}>
      {/* Navigation Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-green-100 dark:border-gray-800 shadow-lg transition-colors duration-300"
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
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent transition-colors duration-300">
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
                          <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              <Link 
                to={`/profile/${user?.username || 'me'}`}
                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium transition-colors duration-300">{user?.username || 'User'}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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

// PostCard component with loading and error states
const PostCard: React.FC<{ 
  post: any; 
  onLike: (id: string) => void;
  isLiking?: boolean;
}> = ({ post, onLike, isLiking = false }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-green-100 dark:border-gray-700 shadow-lg transition-colors duration-300"
  >
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
        <span className="text-white font-semibold">
          {post.userId.username.charAt(0).toUpperCase()}
        </span>
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">@{post.userId.username}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
      {post.userId.isVerified && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full transition-colors duration-300">
          ✓ Verified
        </div>
      )}
    </div>
    
    <p className="text-gray-800 dark:text-gray-200 mb-4 transition-colors duration-300">{post.content}</p>
    
    {post.hashtags && post.hashtags.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {post.hashtags.map((tag: string, index: number) => (
          <span key={index} className="text-green-600 dark:text-green-400 text-sm transition-colors duration-300">#{tag}</span>
        ))}
      </div>
    )}
    
    <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400 transition-colors duration-300">
      <button 
        onClick={() => onLike(post._id)}
        disabled={isLiking}
        className={`flex items-center space-x-2 ${isLiking ? 'opacity-50' : 'hover:text-red-500 dark:hover:text-red-400'} transition-colors`}
      >
        <span>{post.isLiked ? '❤️' : '🤍'}</span>
        <span>{post.likeCount || post.likes?.length || 0}</span>
      </button>
      <div className="flex items-center space-x-2">
        <span>💬</span>
        <span>{post.commentCount || post.comments?.length || 0}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>🔄</span>
        <span>{post.shares}</span>
      </div>
    </div>
  </motion.div>
);

// Simple LoadingSpinner component
const LoadingSpinner: React.FC<{ size?: string; text?: string }> = ({ 
  size = 'md', 
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
  size?: string;
  className?: string;
  icon?: any;
}> = ({ 
  children, 
  onClick, 
  loading = false, 
  size = 'md',
  className = '',
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

  const queryClient = useQueryClient();
  
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
        const response = await apiService.get(`posts/feed?page=${pageParam}&type=${feedType}`);
        return response;
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        throw error;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.pagination?.hasMore ? pages.length + 1 : undefined;
    },
    enabled: !!user
  });

  // Get posts from the API response or use an empty array if no data
  const posts = React.useMemo(() => {
    return data?.pages?.flatMap(page => page.data?.posts || []) || [];
  }, [data]);

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

  const likeMutation = useMutation({
    mutationFn: (postId: string) => {
      // Return the promise from the API call
      return apiService.likePost(postId);
    },
    onSuccess: (_, postId) => {
      // Update the cache to reflect the like
      queryClient.setQueryData(['feed', feedType], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              posts: page.data.posts.map((post: any) => {
                if (post._id === postId) {
                  const isLiked = post.likes.some((like: any) => 
                    like.userId === user?._id
                  );
                  
                  return {
                    ...post,
                    likes: isLiked
                      ? post.likes.filter((like: any) => like.userId !== user?._id)
                      : [...post.likes, { _id: `like-${Date.now()}`, userId: user?._id }],
                    likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1
                  };
                }
                return post;
              })
            }
          }))
        };
      });
    }
  });

  const handlePostLike = async (postId: string) => {
    try {
      await likeMutation.mutateAsync(postId);
    } catch (error) {
      console.error('Error liking post:', error);
      // The error will be handled by the mutation's onError
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
    <Layout>
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
                  key={post._id} 
                  post={post} 
                  onLike={handlePostLike}
                  isLiking={likeMutation.isPending && likeMutation.variables?.[0] === post._id}
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
              size="lg"
              className="px-8"
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
          
