import  { User } from '@/models/User';
import Post from '@/models/Post';
import  { Challenge } from '@/models/Challenge';
import { IBadge } from '@/types';
import logger from '@/utils/logger';

export const checkBadges = async (userId: string): Promise<void> => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const postCount = await Post.countDocuments({ userId });
    const challengeCount = await Challenge.countDocuments({ 
      participants: userId,
      status: 'completed'
    });

    const badges: Omit<IBadge, 'earnedAt'>[] = [];

    // Activity badges
    //@ts-ignore
    if (postCount >= 1 && !user.badges.includes('first-post')) {
      badges.push({
        badgeId: 'first-post',
        name: 'First Steps',
        description: 'Created your first eco-post',
        icon: '🌱',
        category: 'activity'
      });
    }
 //@ts-ignore
    if (postCount >= 10 && !user.badges.includes('eco-poster')) {
      badges.push({
        badgeId: 'eco-poster',
        name: 'Eco Poster',
        description: 'Created 10 eco-friendly posts',
        icon: '📱',
        category: 'activity'
      });
    }
 //@ts-ignore
    if (postCount >= 50 && !user.badges.includes('content-creator')) {
      badges.push({
        badgeId: 'content-creator',
        name: 'Content Creator',
        description: 'Created 50 amazing posts',
        icon: '🎨',
        category: 'activity'
      });
    }
 //@ts-ignore
    if (postCount >= 100 && !user.badges.includes('eco-influencer')) {
      badges.push({
        badgeId: 'eco-influencer',
        name: 'Eco Influencer',
        description: 'Created 100 inspiring posts',
        icon: '🌟',
        category: 'activity'
      });
    }
 //@ts-ignore
    // Challenge badges
    if (challengeCount >= 1 && !user.badges.includes('challenger')) {
      badges.push({
        badgeId: 'challenger',
        name: 'Challenger',
        description: 'Completed your first eco-challenge',
        icon: '🏆',
        category: 'challenge'
      });
    }
 //@ts-ignore
    if (challengeCount >= 5 && !user.badges.includes('eco-warrior')) {
      badges.push({
        badgeId: 'eco-warrior',
        name: 'Eco Warrior',
        description: 'Completed 5 eco-challenges',
        icon: '⚔️',
        category: 'challenge'
      });
    }
 //@ts-ignore
    if (challengeCount >= 10 && !user.badges.includes('champion')) {
      badges.push({
        badgeId: 'champion',
        name: 'Champion',
        description: 'Completed 10 eco-challenges',
        icon: '👑',
        category: 'challenge'
      });
    }

    // Streak badges
     //@ts-ignore
    if (user.currentStreak >= 7 && !user.badges.includes('week-streak')) {
      badges.push({
        badgeId: 'week-streak',
        name: 'Week Warrior',
        description: 'Maintained a 7-day streak',
        icon: '🔥',
        category: 'streak'
      });
    }
     //@ts-ignore

    if (user.currentStreak >= 30 && !user.badges.includes('month-streak')) {
      badges.push({
        badgeId: 'month-streak',
        name: 'Monthly Master',
        description: 'Maintained a 30-day streak',
        icon: '🔥🔥',
        category: 'streak'
      });
    }
 //@ts-ignore
    if (user.currentStreak >= 100 && !user.badges.includes('century-streak')) {
      badges.push({
        badgeId: 'century-streak',
        name: 'Century Streaker',
        description: 'Maintained a 100-day streak',
        icon: '🔥🔥🔥',
        category: 'streak'
      });
    }

    // Level badges
     //@ts-ignore
    if (user.ecoLevel >= 5 && !user.badges.includes('rising-star')) {
      badges.push({
        badgeId: 'rising-star',
        name: 'Rising Star',
        description: 'Reached eco-level 5',
        icon: '⭐',
        category: 'special'
      });
    }
 //@ts-ignore
    if (user.ecoLevel >= 10 && !user.badges.includes('eco-expert')) {
      badges.push({
        badgeId: 'eco-expert',
        name: 'Eco Expert',
        description: 'Reached eco-level 10',
        icon: '🎓',
        category: 'special'
      });
    }

    // Follower badges
     //@ts-ignore
    if (user.followers.length >= 10 && !user.badges.includes('popular')) {
      badges.push({
        badgeId: 'popular',
        name: 'Popular',
        description: 'Gained 10 followers',
        icon: '👥',
        category: 'special'
      });
    }
 //@ts-ignore
    if (user.followers.length >= 100 && !user.badges.includes('community-leader')) {
      badges.push({
        badgeId: 'community-leader',
        name: 'Community Leader',
        description: 'Gained 100 followers',
        icon: '👑',
        category: 'special'
      });
    }

    // Award new badges
     
    for (const badge of badges) {
      //@ts-ignore
      user.badges.push(badge.badgeId);
    }

    if (badges.length > 0) {
      await user.save();
      logger.info(`Awarded ${badges.length} new badges to user: ${user.username}`);
    }
  } catch (error) {
    logger.error('Badge check error:', error);
  }
};
