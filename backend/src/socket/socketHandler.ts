import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { getJWTSecret } from '../config/azure';
import logger from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const socketHandler = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const jwtSecret = await getJWTSecret();
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      
      const user = await User.findById(decoded.userId).select('username');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      socket.username = user.username;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.username} (${socket.userId})`);

    // Join user-specific room for notifications
    socket.join(`user:${socket.userId}`);

    // Handle joining challenge rooms
    socket.on('join_challenge', (challengeId: string) => {
      socket.join(`challenge:${challengeId}`);
      logger.debug(`User ${socket.username} joined challenge room: ${challengeId}`);
    });

    // Handle leaving challenge rooms
    socket.on('leave_challenge', (challengeId: string) => {
      socket.leave(`challenge:${challengeId}`);
      logger.debug(`User ${socket.username} left challenge room: ${challengeId}`);
    });

    // Handle typing in comments
    socket.on('typing_start', (data: { postId: string }) => {
      socket.to(`post:${data.postId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.username
      });
    });

    socket.on('typing_stop', (data: { postId: string }) => {
      socket.to(`post:${data.postId}`).emit('user_stopped_typing', {
        userId: socket.userId
      });
    });

    // Handle joining post rooms for real-time comments
    socket.on('join_post', (postId: string) => {
      socket.join(`post:${postId}`);
    });

    socket.on('leave_post', (postId: string) => {
      socket.leave(`post:${postId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.username} (${socket.userId})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.username}:`, error);
    });
  });

  // Helper functions to emit events
  const emitToUser = (userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  const emitToChallenge = (challengeId: string, event: string, data: any) => {
    io.to(`challenge:${challengeId}`).emit(event, data);
  };

  const emitToPost = (postId: string, event: string, data: any) => {
    io.to(`post:${postId}`).emit(event, data);
  };

  // Export helper functions
  return {
    emitToUser,
    emitToChallenge,
    emitToPost
  };
};
