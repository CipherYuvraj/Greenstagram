import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { groqService } from '../services/groqService';
import { plantService } from '../services/plantService';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Rate limiting for AI routes - more restrictive due to API costs
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 AI requests per windowMs
  message: { 
    success: false, 
    message: 'Too many AI requests, please try again later' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all AI routes
router.use(aiLimiter);

// Generate green quote
router.get('/quote', authenticate, async (req, res) => {
  try {
    const { topic } = req.query;
    const quote = await groqService.generateGreenQuote(topic);
    
    res.json({
      success: true,
      data: {
        quote,
        topic: topic || 'environment',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to generate quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quote'
    });
  }
});

// Generate eco tips
router.get('/tips', authenticate, async (req, res) => {
  try {
    const { category } = req.query;
    const tips = await groqService.generateEcoTips(category);
    
    res.json({
      success: true,
      data: {
        tips,
        category: category || 'general',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to generate eco tips:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate eco tips'
    });
  }
});

// Generate post ideas based on user interests
router.get('/post-ideas', authenticate, async (req, res) => {
  try {
    const { interests } = req.query;
    let userInterests = [];

    if (typeof interests === 'string') {
      userInterests = interests.split(',').map(i => i.trim());
    } else if (Array.isArray(interests)) {
      userInterests = interests;
    } else {
      // Default interests if none provided
      userInterests = ['sustainable_living', 'recycling', 'energy_saving'];
    }
    
    const ideas = await groqService.generatePostIdeas(userInterests);
    
    res.json({
      success: true,
      data: {
        ideas,
        interests: userInterests,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to generate post ideas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate post ideas'
    });
  }
});

// Moderate content
router.post('/moderate', 
  authenticate,
  [
    body('content')
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 2000 })
      .withMessage('Content must be less than 2000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { content } = req.body;
      const moderation = await groqService.moderateContent(content);
      
      res.json({
        success: true,
        data: {
          ...moderation,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to moderate content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to moderate content'
      });
    }
  }
);

// Plant identification
router.post('/identify-plant',
  authenticate,
  [
    body('imageUrl')
      .notEmpty()
      .withMessage('Image URL is required')
      .isURL()
      .withMessage('Valid image URL is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { imageUrl } = req.body;
      const plantData = await plantService.identifyPlant(imageUrl);
      
      res.json({
        success: true,
        data: {
          plant: plantData,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to identify plant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to identify plant'
      });
    }
  }
);

// AI service health check
router.get('/health', authenticate, async (_req, res) => {
  try {
    const groqHealth = await groqService.healthCheck();
    
    res.json({
      success: true,
      data: {
        services: {
          groq: groqHealth,
          plantnet: {
            status: 'configured', // TODO: Add actual PlantNet health check
            note: 'PlantNet integration pending API key configuration'
          }
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AI health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'AI health check failed'
    });
  }
});

export default router;
