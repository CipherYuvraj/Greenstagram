import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Sparkles, TrendingUp, Users, Award } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PostCard from '../components/posts/PostCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AnimatedButton from '../components/ui/AnimatedButton';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { apiClient } from '../services/api';

const Home = () => {
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
      // Mock data for now since backend posts endpoint might not be ready
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

  const handlePostLike = async (postId) => {
    try {
      await apiClient.post(`/posts/${postId}/like`);
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
  <Layout showParticles={true} particleTheme="eco" className="!p-0">
    <div className="max-w-2xl mx-auto px-4 py-8">
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
                  : 'text-gray-600 hover:text-primary-600'}`}
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

