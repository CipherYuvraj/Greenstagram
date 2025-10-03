import express from 'express';
import axios from 'axios';
import { authenticate } from '../middleware/auth';
import { getGroqAPIKey, getPlantNetAPIKey } from '../config/azure';
import { cacheGet, cacheSet } from '../config/redis';
import logger from '../utils/logger';

const router = express.Router();

// Generate eco quote
router.post('/quote', authenticate, async (req: express.Request, res) => {
  try {
    const { theme = 'sustainability' } = req.body;
    
    const cacheKey = `quote:${theme}`;
    const cachedQuote = await cacheGet(cacheKey);
    
    if (cachedQuote) {
      return res.json({
        success: true,
        data: { quote: cachedQuote },
        cached: true
      });
    }

    const groqApiKey = await getGroqAPIKey();
    
    const prompt = `Generate an inspiring and motivational quote about ${theme} and environmental consciousness. 
    The quote should be original, memorable, and encourage eco-friendly actions. 
    Keep it under 150 characters. Return only the quote without quotation marks.`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const quote = response.data.choices[0].message.content.trim();
    
    // Cache for 1 hour
    await cacheSet(cacheKey, quote, 3600);

    logger.info(`Generated quote for theme: ${theme}`);

    res.json({
      success: true,
      data: { quote }
    });
    return;
  } catch (error) {
    logger.error('Generate quote error:', error);
    
    // Fallback quotes
    const fallbackQuotes = {
      sustainability: "Every small action towards sustainability creates ripples of positive change.",
      nature: "In nature, nothing is wasted. Let's learn from the master of recycling.",
      climate: "The Earth does not belong to us; we belong to the Earth.",
      energy: "The sun provides more energy in one hour than humanity uses in a year."
    };

    const { theme = 'sustainability' } = req.body;

    res.json({
      success: true,
      data: { 
        quote: fallbackQuotes[theme as keyof typeof fallbackQuotes] || fallbackQuotes.sustainability 
      },
      fallback: true
    });
    return;
  }
});

// Plant identification
router.post('/plant-identify', authenticate, async (req: express.Request, res: express.Response) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const cacheKey = `plant:${Buffer.from(imageUrl).toString('base64')}`;
    const cachedResult = await cacheGet(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    const plantNetApiKey = await getPlantNetAPIKey();
    
    try {
      const formData = new FormData();
      formData.append('images', imageUrl);
      formData.append('modifiers', JSON.stringify(['crops_fast', 'similar_images']));
      formData.append('plant_language', 'en');
      formData.append('plant_details', JSON.stringify(['common_names', 'best_quality_images']));

      const response = await axios.post(
        'https://my-api.plantnet.org/v1/identify/weurope',
        {
          images: [imageUrl],
          organs: ['flower', 'leaf', 'fruit'],
          include_related_images: false
        },
        {
          headers: {
            'Api-Key': plantNetApiKey,
            'Content-Type': 'application/json'
          },
          params: {
            'include-related-images': false,
            'no-reject': false,
            'lang': 'en'
          }
        }
      );

      if (response.data.results && response.data.results.length > 0) {
        const bestMatch = response.data.results[0];
        const result = {
          species: bestMatch.species.scientificNameWithoutAuthor,
          commonNames: bestMatch.species.commonNames || [],
          confidence: Math.round(bestMatch.score * 100),
          family: bestMatch.species.family?.scientificNameWithoutAuthor || 'Unknown',
          genus: bestMatch.species.genus?.scientificNameWithoutAuthor || 'Unknown',
          careTips: generateCareTips(bestMatch.species.scientificNameWithoutAuthor),
          images: bestMatch.images?.slice(0, 3) || []
        };

        // Cache for 7 days
        await cacheSet(cacheKey, result, 7 * 24 * 3600);

        return res.json({
          success: true,
          data: result
        });
      } else {
        return res.json({
          success: true,
          data: {
            species: 'Unknown',
            commonNames: [],
            confidence: 0,
            message: 'Could not identify the plant. Try a clearer image with visible flowers or leaves.'
          }
        });
      }
    } catch (plantNetError: any) {
      logger.warn('PlantNet API error:', plantNetError.response?.data || plantNetError.message);
      
      // Fallback response
      return res.json({
        success: true,
        data: {
          species: 'Unknown',
          commonNames: [],
          confidence: 0,
          message: 'Plant identification service temporarily unavailable. Please try again later.',
          careTips: 'Ensure your plant gets adequate sunlight, water regularly but avoid overwatering, and provide good drainage.'
        }
      });
    }
  } catch (error) {
    logger.error('Plant identification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Plant identification service error'
    });
  }
});

// Helper function to generate care tips
const generateCareTips = (scientificName: string): string => {
  const generalTips = [
    'Provide adequate sunlight based on the plant\'s natural habitat',
    'Water regularly but ensure good drainage to prevent root rot',
    'Use well-draining soil appropriate for the plant type',
    'Monitor for pests and diseases regularly',
    'Fertilize during growing season with appropriate nutrients'
  ];

  // Add specific tips based on plant family/type
  const specificTips: { [key: string]: string[] } = {
    'Succulent': [
      'Allow soil to dry completely between waterings',
      'Provide bright, indirect sunlight',
      'Use cactus/succulent soil mix'
    ],
    'Cactus': [
      'Water very sparingly, especially in winter',
      'Provide maximum sunlight exposure',
      'Use well-draining cactus soil'
    ],
    'Fern': [
      'Keep soil consistently moist but not waterlogged',
      'Provide high humidity and indirect light',
      'Avoid direct sunlight'
    ],
    'Orchid': [
      'Use orchid bark mix for potting',
      'Water weekly by soaking roots',
      'Provide bright, indirect light'
    ]
  };

  let tips = [...generalTips];
  
  // Check if the scientific name contains common plant types
  for (const [type, specificTipList] of Object.entries(specificTips)) {
    if (scientificName.toLowerCase().includes(type.toLowerCase())) {
      tips = [...specificTipList, ...tips.slice(0, 2)];
      break;
    }
  }

  return tips.slice(0, 3).join('. ') + '.';
};

// Get plant care reminder
router.post('/plant-care', authenticate, async (req: express.Request, res) => {
  try {
    const { plantType = 'general' } = req.body;
    
    const careReminders = {
      general: [
        'Check soil moisture before watering',
        'Remove dead or yellowing leaves',
        'Rotate plant for even light exposure',
        'Check for signs of pests or disease'
      ],
      succulent: [
        'Water only when soil is completely dry',
        'Ensure drainage holes in pot',
        'Provide bright light but avoid scorching',
        'Remove dead leaves from base'
      ],
      flowering: [
        'Deadhead spent flowers to encourage blooms',
        'Provide consistent watering during bloom period',
        'Use flowering plant fertilizer monthly',
        'Ensure adequate morning sunlight'
      ],
      indoor: [
        'Dust leaves weekly for better photosynthesis',
        'Check for proper humidity levels',
        'Rotate weekly for balanced growth',
        'Monitor for spider mites in dry conditions'
      ]
    };

    const reminders = careReminders[plantType as keyof typeof careReminders] || careReminders.general;
    const todaysReminder = reminders[Math.floor(Math.random() * reminders.length)];

    res.json({
      success: true,
      data: {
        reminder: todaysReminder,
        plantType,
        allTips: reminders
      }
    });
  } catch (error) {
    logger.error('Plant care reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Plant care service error'
    });
  }
});

export default router;
