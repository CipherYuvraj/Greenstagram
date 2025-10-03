/// <reference types="vite/client" />
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Award, 
  Heart, 
  MessageCircle, 
  Share2, 
  UserPlus, 
  UserMinus,
  Grid3X3,
  Bookmark,
  Edit,
  Leaf,
  Zap,
  ChevronLeft
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

// Layout component from Home.tsx
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Navigation Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-green-100 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-2">
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
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 font-medium">{user?.username}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {children}
    </div>
  );
};

// Comment Component
const CommentSection: React.FC<{ postId: string; comments: any[]; onAddComment: (content: string) => void }> = ({ 
  comments, 
  onAddComment 
}) => {
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        <span>{comments.length}</span>
      </button>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            {/* Comments List */}
            {comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {comment.userId?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">
                    @{comment.userId?.username || 'User'}
                  </p>
                  <p className="text-gray-700">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
              >
                Post
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch profile data
  const { data: profileData, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => apiService.getUserProfile(username!),
    enabled: !!username
  });

  // Fetch user's posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', username],
    queryFn: () => apiService.getUserPosts(username!),
    enabled: !!username && activeTab === 'posts'
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
        mutationFn: ({ action }: { action: 'follow' | 'unfollow' }) =>
      action === 'follow' 
        ? apiService.followUser(profileData?.data?.user?._id!)
        : apiService.unfollowUser(profileData?.data?.user?._id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update follow status');
      console.error('Follow error:', error);
    }
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: (postId: string) => apiService.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPosts', username] });
    },
    onError: (error) => {
      toast.error('Failed to like post');
      console.error('Like error:', error);
    }
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      apiService.addComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPosts', username] });
      toast.success('Comment added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add comment');
      console.error('Comment error:', error);
    }
  });

  const profileUser = profileData?.data?.user;
  const posts = postsData?.data?.posts || [];
  const isOwnProfile = currentUser?.username === username;
  const isFollowing = profileUser?.followers?.some((follower: any) => 
    follower._id === currentUser?.id || follower === currentUser?.id
  );

  const handleFollow = () => {
    if (!profileUser) return;
    followMutation.mutate({ action: isFollowing ? 'unfollow' : 'follow' });
  };

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const handleAddComment = (postId: string, content: string) => {
    commentMutation.mutate({ postId, content });
  };

  if (profileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full"
          />
        </div>
      </Layout>
    );
  }

  if (profileError || !profileUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Profile not found</h2>
            <p className="text-gray-500 mb-4">The user you're looking for doesn't exist</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { key: 'posts', label: 'Posts', icon: Grid3X3 },
    { key: 'saved', label: 'Saved', icon: Bookmark },
    { key: 'badges', label: 'Badges', icon: Award }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-green-100 shadow-xl mb-8 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5" />
          
          {/* Floating Eco Elements */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-300 opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5
              }}
            >
              {['🌱', '🌿', '♻️', '🌍', '⚡', '☀️'][i]}
            </motion.div>
          ))}

          <div className="relative z-10">
            {/* Profile Picture and Basic Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Picture */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                  {profileUser.profilePicture ? (
                    <img
                      src={profileUser.profilePicture}
                      alt={profileUser.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profileUser.username.charAt(0).toUpperCase()
                  )}
                </div>
                
                {/* Level Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                >
                  Lv.{profileUser.ecoLevel || 1}
                </motion.div>

                {/* Verified Badge */}
                {profileUser.isVerified && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="absolute -top-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg"
                  >
                    <Award className="w-4 h-4" />
                  </motion.div>
                )}
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    @{profileUser.username}
                    {profileUser.isVerified && (
                      <span className="ml-2 text-blue-500">✓</span>
                    )}
                  </h1>
                  
                  <div className="flex items-center justify-center md:justify-start space-x-4 text-gray-600 mb-4">
                    {profileUser.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profileUser.location.city}, {profileUser.location.country}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {profileUser.bio && (
                    <p className="text-gray-700 mb-6 max-w-2xl leading-relaxed">
                      {profileUser.bio}
                    </p>
                  )}

                  {/* Interests Tags */}
                  {profileUser.interests && profileUser.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                      {profileUser.interests.map((interest: string, index: number) => (
                        <motion.span
                          key={interest}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {interest}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col space-y-3"
              >
                {isOwnProfile ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFollow}
                      disabled={followMutation.isPending}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isFollowing
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                      }`}
                    >
                      {followMutation.isPending ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                          <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
                        </>
                      )}
                    </motion.button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Posts', value: posts.length, icon: Grid3X3, color: 'from-blue-500 to-blue-600' },
            { label: 'Followers', value: profileUser.followers?.length || 0, icon: Users, color: 'from-green-500 to-green-600' },
            { label: 'Following', value: profileUser.following?.length || 0, icon: Users, color: 'from-purple-500 to-purple-600' },
            { label: 'Eco Points', value: profileUser.ecoPoints || 0, icon: Zap, color: 'from-yellow-500 to-orange-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-100 shadow-lg"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${stat.color} mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value.toLocaleString()}</p>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl border border-green-100 shadow-lg overflow-hidden"
        >
          {/* Tab Headers */}
          <div className="flex border-b border-green-100">
            {tabs.map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'text-green-600 border-b-2 border-green-500 bg-green-50'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-25'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'posts' && (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {postsLoading ? (
                    <div className="flex justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full"
                      />
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-6">
                      {posts.map((post: any, index: number) => (
                        <motion.div
                          key={post._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                        >
                          {/* Post Header */}
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {profileUser.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">@{profileUser.username}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Post Content */}
                          <p className="text-gray-800 mb-4">{post.content}</p>

                          {/* Post Media */}
                          {post.media && post.media.length > 0 && (
                            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {post.media.map((media: any, mediaIndex: number) => (
                                <img
                                  key={mediaIndex}
                                  src={media.url}
                                  alt="Post media"
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}

                          {/* Post Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-6">
                              <button
                                onClick={() => handleLike(post._id)}
                                disabled={likeMutation.isPending}
                                className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
                              >
                                <Heart className={`w-5 h-5 ${post.likes?.some((like: any) => like._id === currentUser?.id || like === currentUser?.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                <span>{post.likes?.length || 0}</span>
                              </button>

                              <CommentSection
                                postId={post._id}
                                comments={post.comments || []}
                                onAddComment={(content) => handleAddComment(post._id, content)}
                              />

                              <div className="flex items-center space-x-2 text-gray-600">
                                <Share2 className="w-5 h-5" />
                                <span>{post.shares || 0}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Grid3X3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts yet</h3>
                      <p className="text-gray-500">
                        {isOwnProfile ? "Share your first eco-friendly post!" : "This user hasn't posted anything yet."}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-12"
                >
                  <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No saved posts yet</h3>
                  <p className="text-gray-500">Saved posts will appear here</p>
                </motion.div>
              )}

              {activeTab === 'badges' && (
                <motion.div
                  key="badges"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {profileUser.badges && profileUser.badges.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {profileUser.badges.map((badge: any, index: number) => (
                        <motion.div
                          key={badge.badgeId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center"
                        >
                          <div className="text-3xl mb-2">{badge.icon}</div>
                          <h4 className="font-semibold text-gray-800 mb-1">{badge.name}</h4>
                          <p className="text-xs text-gray-600 capitalize">{badge.category}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No badges yet</h3>
                      <p className="text-gray-500">
                        {isOwnProfile ? "Complete challenges to earn badges!" : "This user hasn't earned any badges yet."}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;

