import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Auth validation schemas
export const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Username can only contain letters, numbers, and underscores'
    }),
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .min(6)
    .required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match'
    }),
  bio: Joi.string()
    .max(500)
    .optional()
    .allow(''),
  interests: Joi.array()
    .items(Joi.string())
    .optional()
    .default([])
});

export const loginSchema = Joi.object({
  emailOrUsername: Joi.string()
    .required()
    .messages({
      'any.required': 'Email or username is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// ...existing code for other schemas...

// Post validation schemas
export const createPostSchema = Joi.object({
  content: Joi.string()
    .max(2000)
    .required(),
  media: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('image', 'video').required(),
      url: Joi.string().uri().required(),
      publicId: Joi.string().required(),
      alt: Joi.string().optional(),
      width: Joi.number().optional(),
      height: Joi.number().optional()
    })
  ).optional(),
  location: Joi.object({
    name: Joi.string().required(),
    coordinates: Joi.array().items(Joi.number()).length(2).optional()
  }).optional(),
  challenge: Joi.string().optional(),
  ecoCategory: Joi.string()
    .valid('gardening', 'recycling', 'sustainable-living', 'renewable-energy', 'wildlife', 'climate-action')
    .optional(),
  visibility: Joi.string()
    .valid('public', 'private', 'friends')
    .default('public')
});

// Challenge validation schemas
export const createChallengeSchema = Joi.object({
  title: Joi.string()
    .max(100)
    .required(),
  description: Joi.string()
    .max(1000)
    .required(),
  duration: Joi.number()
    .min(1)
    .required(),
  points: Joi.number()
    .min(10)
    .required(),
  category: Joi.string()
    .valid('gardening', 'recycling', 'sustainable-living', 'renewable-energy', 'wildlife', 'climate-action')
    .required(),
  difficulty: Joi.string()
    .valid('easy', 'medium', 'hard')
    .default('medium'),
  rules: Joi.array()
    .items(Joi.string())
    .min(1)
    .required(),
  startDate: Joi.date()
    .min('now')
    .required(),
  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .required()
});

// User profile validation
export const updateProfileSchema = Joi.object({
  bio: Joi.string()
    .max(300)
    .optional(),
  location: Joi.object({
    country: Joi.string().optional(),
    city: Joi.string().optional(),
    coordinates: Joi.array().items(Joi.number()).length(2).optional()
  }).optional(),
  interests: Joi.array()
    .items(Joi.string().valid('gardening', 'recycling', 'sustainable-living', 'renewable-energy', 'wildlife', 'climate-action'))
    .optional(),
  isPrivate: Joi.boolean()
    .optional()
});
