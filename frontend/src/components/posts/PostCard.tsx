import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  MapPin,
  Clock,
  Award,
  Leaf
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post, User } from '../../types';

interface PostCardProps {
  post: Post;
  currentUser?: User;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  className?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onLike,
  onShare,
  className = ''
}) => {
  const [isLiked, setIsLiked] = useState(
    currentUser ? post.likes.some((like: { _id: any; }) => like._id === currentUser._id) : false
  );
  const [showComments, setShowComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post._id);
  };

  const ecoCategories = {
    'gardening': { icon: '🌱', color: 'text-green-600', bg: 'bg-green-100' },
    'recycling': { icon: '♻️', color: 'text-blue-600', bg: 'bg-blue-100' },
    'sustainable-living': { icon: '🌿', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    'renewable-energy': { icon: '☀️', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    'wildlife': { icon: '🦋', color: 'text-purple-600', bg: 'bg-purple-100' },
    'climate-action': { icon: '🌍', color: 'text-indigo-600', bg: 'bg-indigo-100' }
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden group ${className}`}
    >
      {/* Ambient glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 rounded-2xl"
        animate={{
          opacity: isHovered ? 1 : 0.5,
          scale: isHovered ? 1.02 : 1
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Header */}
      <div className="relative p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gradient-to-r from-primary-400 to-secondary-400">
                {post.userId.profilePicture ? (
                  <img
                    src={post.userId.profilePicture}
                    alt={post.userId.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {post.userId.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Online indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
              />
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{post.userId.username}</h3>
                {post.userId.isVerified && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  >
                    <Award className="w-4 h-4 text-blue-500" />
                  </motion.div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                
                {post.location && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{post.location.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>

        {/* Eco Category */}
        {post.ecoCategory && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
              ecoCategories[post.ecoCategory as keyof typeof ecoCategories]?.bg
            } ${ecoCategories[post.ecoCategory as keyof typeof ecoCategories]?.color}`}
          >
            <span>{ecoCategories[post.ecoCategory as keyof typeof ecoCategories]?.icon}</span>
            <span className="capitalize">{post.ecoCategory.replace('-', ' ')}</span>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-800 leading-relaxed"
        >
          {post.content}
        </motion.p>

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-1 mt-2"
          >
            {post.hashtags.map((hashtag: string, index: number) => (
              <motion.span
                key={`${hashtag}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="text-primary-600 text-sm font-medium hover:text-primary-700 cursor-pointer"
              >
                #{hashtag}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>

      {/* Media */}
      {post.media.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="relative"
        >
          <div className={`grid gap-1 ${
            post.media.length === 1 
              ? 'grid-cols-1' 
              : post.media.length === 2 
              ? 'grid-cols-2' 
              : 'grid-cols-2 grid-rows-2'
          }`}>
            {post.media.slice(0, 4).map((media, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={`relative overflow-hidden ${
                  post.media.length === 1 ? 'aspect-square' : 'aspect-square'
                } ${index === 3 && post.media.length > 4 ? 'relative' : ''}`}
              >
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={media.alt || 'Post image'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    controls={false}
                    muted
                  />
                )}
                
                {/* More indicator */}
                {index === 3 && post.media.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      +{post.media.length - 4}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Challenge Badge */}
      {post.challenge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mx-4 mt-3 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200"
        >
          <div className="flex items-center space-x-2">
            <Leaf className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-800">
              Challenge: {post.challenge.title}
            </span>
            <span className="text-xs text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">
              +{post.challenge.points} points
            </span>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {/* Like Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`p-2 rounded-full transition-all duration-300 ${
                isLiked 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <motion.div
                animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </motion.div>
            </motion.button>

            {/* Comment Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowComments(!showComments)}
              className="p-2 rounded-full text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.button>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onShare?.(post._id)}
              className="p-2 rounded-full text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300"
            >
              <Share2 className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{post.likes.length} likes</span>
            <span>{post.comments.length} comments</span>
            {post.shares > 0 && <span>{post.shares} shares</span>}
          </div>
        </div>

        {/* Like animation particles */}
        <AnimatePresence>
          {isLiked && (
            <div className="absolute pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-red-500 rounded-full"
                  initial={{ 
                    x: 60, 
                    y: 40,
                    scale: 0,
                    opacity: 1
                  }}
                  animate={{
                    x: 60 + (Math.random() - 0.5) * 100,
                    y: 40 + (Math.random() - 0.5) * 100,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100 p-4 bg-gray-50/50"
          >
            {/* Comments would go here */}
            <p className="text-sm text-gray-500">Comments section coming soon...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default PostCard;
