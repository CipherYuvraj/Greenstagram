import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  TrendingUp, 
  Users, 
  Award, 
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Camera,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Navbar from '../layout/Navbar';

// Mock data - TODO: Replace with actual API calls
const mockPosts = [
  {
    id: 1,
    user: { username: 'eco_warrior', profilePicture: null },
    content: "Just finished my first week of zero waste living! 🌱 It's amazing how much plastic we use without realizing it. Small changes, big impact! #ZeroWaste #SustainableLiving",
    imageUrls: ["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400"],
    likes: 42,
    comments: 8,
    shares: 3,
    timeAgo: "2 hours ago",
    ecoPoints: 15
  },
  {
    id: 2,
    user: { username: 'plant_parent', profilePicture: null },
    content: "My urban garden is thriving! 🌿 Growing your own herbs and vegetables is so rewarding. Plus, it's a great way to reduce your carbon footprint. #UrbanGardening #GrowYourOwn",
    imageUrls: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"],
    likes: 67,
    comments: 12,
    shares: 5,
    timeAgo: "4 hours ago",
    ecoPoints: 20
  }
];

const mockChallenges = [
  {
    id: 1,
    title: "30-Day Plastic Free Challenge",
    difficulty: "medium",
    participants: 1247,
    daysLeft: 15,
    ecoPoints: 50
  },
  {
    id: 2,
    title: "Energy Saver Week",
    difficulty: "easy",
    participants: 856,
    daysLeft: 3,
    ecoPoints: 25
  }
];

const Dashboard: React.FC = () => {
  const { user, fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Message */}
            <motion.div
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-100"
            >
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg"
                >
                  <Leaf className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Welcome back, {user?.username}! 🌿
                  </h1>
                  <p className="text-gray-600">Ready to make a positive impact today?</p>
                </div>
              </div>
            </motion.div>

            {/* Create Post */}
            <motion.div
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-100"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <Leaf className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Share your eco-friendly journey..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <Camera size={20} />
                    <span>Photo</span>
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                >
                  Share
                </motion.button>
              </div>
            </motion.div>

            {/* Posts Feed */}
            {mockPosts.map((post) => (
              <motion.div
                key={post.id}
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-green-100 overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">@{post.user.username}</h3>
                      <p className="text-sm text-gray-600">{post.timeAgo}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">+{post.ecoPoints}</span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-4">
                  <p className="text-gray-800 mb-4">{post.content}</p>
                  {post.imageUrls.length > 0 && (
                    <motion.img
                      whileHover={{ scale: 1.02 }}
                      src={post.imageUrls[0]}
                      alt="Post image"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Heart size={20} />
                      <span>{post.likes}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle size={20} />
                      <span>{post.comments}</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
                    >
                      <Share2 size={20} />
                      <span>{post.shares}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Stats */}
            <motion.div
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-100"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Impact</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">{user?.ecoPoints || 0}</p>
                  <p className="text-sm text-gray-600">Eco Points</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <Award className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-700">Level {user?.ecoLevel || 1}</p>
                  <p className="text-sm text-gray-600">Eco Level</p>
                </div>
                <div className="text-center p-3 bg-teal-50 rounded-lg">
                  <Users className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-teal-700">{user?.followers?.length || 0}</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700">{user?.streaks?.current || 0}</p>
                  <p className="text-sm text-gray-600">Day Streak</p>
                </div>
              </div>
            </motion.div>

            {/* Active Challenges */}
            <motion.div
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-100"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Challenges</h2>
              <div className="space-y-4">
                {mockChallenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{challenge.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        challenge.difficulty === 'easy' 
                          ? 'bg-green-100 text-green-700'
                          : challenge.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{challenge.participants} participants</span>
                      <span>{challenge.daysLeft} days left</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">+{challenge.ecoPoints} points</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-green-600 transition-colors"
                      >
                        Join
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Daily Tip - TODO: Integrate with OpenAI service */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white"
            >
              <h2 className="text-lg font-semibold mb-2">🌱 Daily Eco Tip</h2>
              <p className="text-green-100">
                "Replace single-use plastic bags with reusable cloth bags when shopping. One reusable bag can eliminate the need for thousands of plastic bags over its lifetime!"
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all duration-200"
              >
                Share this tip
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
