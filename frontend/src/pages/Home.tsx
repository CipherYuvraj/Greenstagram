import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Sparkles, TrendingUp, Users, Award } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/posts/PostCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/services/api';
import { Post } from '@/types';

const Home: React.FC = () => {
  const { user } = useAuthStore();
  const [feedType, setFeedType] = useState<'following' | 'trending' | 'discover'>('following');

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
      const endpoint = feedType === 'following' 
        ? '/posts/feed' 
        : feedType === 'trending' 
        ? '/posts/trending' 
        : '/posts/discover';
      
      const response = await apiClient.get(`${endpoint}?page=${pageParam}&limit=10`);
      return response.data;
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.pagination?.hasMore ? pages.length + 1 : undefined;
    },
    enabled: !!user
  });

  const posts = data?.pages?.flatMap(page => page.data.posts) || [];

  const feedTabs = [
    { 
      key: 'following' as const, 
      label: 'Following', 
      icon: Users,
      description: 'Posts from people you follow'
    },
    { 
      key: 'trending' as const, 
      label: 'Trending', 
      icon: TrendingUp,
      description: 'Popular posts this week'
    },
    { 
      key: 'discover' as const, 
      label: 'Discover', 
      icon: Sparkles,
      description: 'Explore new content'
    }
  ];

  const handlePostLike = async (postId: string) => {
    try {
      await apiClient.post(`/posts/${postId}/like`);
      // Optimistic update would go here
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

  return (
    <Layout showParticles={true} particleTheme="eco">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 p-6 bg-gradient-to-r from-primary-500 via-secondary-500 to-emerald-500 rounded-2xl text-white relative overflow-hidden"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                animate={{
                  x: [0, Math.random() * 100],
                  y: [0, Math.random() * 100],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-2"
            >
              Welcome back, {user?.username}! 🌱
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 mb-4"
            >
              You're at Level {user?.ecoLevel} with {user?.ecoPoints} eco-points! 
              Keep sharing your green journey.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span className="text-sm">Streak: {user?.currentStreak} days</span>
              </div>
              
              {user?.badges && user.badges.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Latest badge:</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {user.badges[user.badges.length - 1]?.name}
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Feed Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200">
            {feedTabs.map((tab, index) => (
              <motion.button
                key={tab.key}
                onClick={() => setFeedType(tab.key)}
                className={`relative flex-1 px-4 py-3 rounded-lg transition-all duration-300 ${
                  feedType === tab.key
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {feedType === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg"
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
            {posts.map((post: Post, index: number) => (
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
