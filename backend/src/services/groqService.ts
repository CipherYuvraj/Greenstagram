import Groq from 'groq-sdk';
import { azureKeyVault } from '../config/azure';
import { logger } from '../utils/logger';

export class GroqService {
  private groq: Groq | null = null;

  constructor() {
    this.initializeGroq();
  }

  private async initializeGroq(): Promise<void> {
    try {
      const apiKey = await azureKeyVault.getSecret('groq-api-key', 'GROQ_API_KEY');
      
      if (apiKey) {
        this.groq = new Groq({
          apiKey: apiKey
        });
        logger.info('✅ Groq AI service initialized');
      } else {
        logger.warn('⚠️ Groq API key not found - AI features will be disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize Groq service:', error);
    }
  }

  async generateGreenQuote(topic: string = 'environment'): Promise<string> {
    try {
      if (!this.groq) {
        await this.initializeGroq();
      }

      if (!this.groq) {
        // Fallback quotes when Groq is not available
        logger.warn('⚠️ Groq service not available - using fallback quotes');
        return this.getFallbackQuote();
      }

      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an environmental expert who creates inspiring, short quotes about sustainability and environmental protection. Keep quotes under 150 characters and make them motivational.'
          },
          {
            role: 'user',
            content: `Generate an inspiring environmental quote about ${topic}`
          }
        ],
        model: 'llama3-8b-8192', // Groq's fast Llama model
        max_tokens: 100,
        temperature: 0.8,
        top_p: 0.9
      });

      const quote = response.choices[0]?.message?.content?.trim() || this.getFallbackQuote();
      
      logger.trackEvent('GreenQuoteGenerated', { 
        topic, 
        length: quote.length,
        model: 'llama3-8b-8192',
        provider: 'groq'
      });
      
      return quote;
    } catch (error) {
      logger.error('Failed to generate green quote with Groq:', error);
      return this.getFallbackQuote();
    }
  }

  async generateEcoTips(category: string = 'general'): Promise<string[]> {
    try {
      if (!this.groq) {
        await this.initializeGroq();
      }

      if (!this.groq) {
        logger.warn('⚠️ Groq service not available - using fallback tips');
        return this.getFallbackTips(category);
      }

      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an environmental expert. Provide practical, actionable eco-friendly tips. Return exactly 3 tips, each on a new line, numbered 1-3. Keep each tip under 100 characters.'
          },
          {
            role: 'user',
            content: `Generate 3 practical eco-friendly tips for ${category}`
          }
        ],
        model: 'llama3-8b-8192',
        max_tokens: 200,
        temperature: 0.7,
        top_p: 0.8
      });

      const content = response.choices[0]?.message?.content || '';
      const tips = content.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .filter(tip => tip.length > 0)
        .slice(0, 3);

      logger.trackEvent('EcoTipsGenerated', {
        category,
        count: tips.length,
        model: 'llama3-8b-8192',
        provider: 'groq'
      });

      return tips.length > 0 ? tips : this.getFallbackTips(category);
    } catch (error) {
      logger.error('Failed to generate eco tips with Groq:', error);
      return this.getFallbackTips(category);
    }
  }

  async generatePostIdeas(interests: string[]): Promise<string[]> {
    try {
      if (!this.groq) {
        await this.initializeGroq();
      }

      if (!this.groq) {
        return this.getFallbackPostIdeas();
      }

      const interestsText = interests.join(', ');
      
      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a social media expert focused on sustainability. Generate engaging post ideas for eco-conscious users. Return exactly 3 post ideas, each on a new line. Keep each idea under 120 characters and make them actionable.'
          },
          {
            role: 'user',
            content: `Generate 3 engaging social media post ideas for someone interested in: ${interestsText}`
          }
        ],
        model: 'mixtral-8x7b-32768', // Use Mixtral for more creative content
        max_tokens: 250,
        temperature: 0.9,
        top_p: 0.9
      });

      const content = response.choices[0]?.message?.content || '';
      const ideas = content.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .filter(idea => idea.length > 0)
        .slice(0, 3);

      logger.trackEvent('PostIdeasGenerated', {
        interests: interestsText,
        count: ideas.length,
        model: 'mixtral-8x7b-32768',
        provider: 'groq'
      });

      return ideas.length > 0 ? ideas : this.getFallbackPostIdeas();
    } catch (error) {
      logger.error('Failed to generate post ideas with Groq:', error);
      return this.getFallbackPostIdeas();
    }
  }

  async moderateContent(content: string): Promise<{ isAppropriate: boolean; reason?: string }> {
    try {
      if (!this.groq) {
        await this.initializeGroq();
      }

      if (!this.groq) {
        // Default to appropriate if service unavailable
        return { isAppropriate: true };
      }

      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a content moderator for an eco-friendly social platform. Analyze content for appropriateness. Respond with only "APPROPRIATE" or "INAPPROPRIATE: reason" where reason is brief.'
          },
          {
            role: 'user',
            content: `Moderate this content: "${content}"`
          }
        ],
        model: 'llama3-8b-8192',
        max_tokens: 50,
        temperature: 0.1 // Low temperature for consistent moderation
      });

      const result = response.choices[0]?.message?.content?.trim() || 'APPROPRIATE';
      
      if (result.startsWith('INAPPROPRIATE:')) {
        const reason = result.replace('INAPPROPRIATE:', '').trim();
        logger.trackEvent('ContentModerated', { 
          appropriate: false, 
          reason,
          provider: 'groq'
        });
        return { isAppropriate: false, reason };
      }

      logger.trackEvent('ContentModerated', { 
        appropriate: true,
        provider: 'groq'
      });
      return { isAppropriate: true };
    } catch (error) {
      logger.error('Failed to moderate content with Groq:', error);
      // Default to appropriate on error to avoid blocking users
      return { isAppropriate: true };
    }
  }

  private getFallbackQuote(): string {
    const fallbackQuotes = [
      "The Earth does not belong to us; we belong to the Earth. 🌍",
      "Small acts, when multiplied by millions of people, can transform the world. 🌱",
      "Be the change you wish to see in the world. 🌿",
      "The best time to plant a tree was 20 years ago. The second best time is now. 🌳",
      "We don't inherit the earth from our ancestors; we borrow it from our children. 🌎",
      "Every day is Earth Day when you live sustainably. 🌿",
      "Reduce, reuse, recycle - the three R's for a better tomorrow. ♻️",
      "Nature is not a place to visit, it is home. 🏡",
      "The greatest threat to our planet is the belief that someone else will save it. 💪",
      "Live simply so that others may simply live. ✨"
    ];
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  }

  private getFallbackTips(category: string): string[] {
    const tipsByCategory: { [key: string]: string[] } = {
      energy: [
        "Switch to LED light bulbs to reduce energy consumption by up to 80%",
        "Unplug electronics when not in use to avoid phantom energy draw",
        "Use natural light during the day instead of artificial lighting"
      ],
      water: [
        "Fix leaky faucets promptly - a single drip can waste 3,000 gallons per year",
        "Take shorter showers to conserve water and reduce energy usage",
        "Collect rainwater in containers for watering plants and gardens"
      ],
      recycling: [
        "Separate recyclables properly according to your local guidelines",
        "Repurpose glass jars and containers for storage instead of buying new",
        "Compost organic waste to reduce landfill burden and create rich soil"
      ],
      transportation: [
        "Walk or bike for trips under 2 miles instead of driving",
        "Use public transportation or carpool to reduce emissions",
        "Combine multiple errands into one trip to save fuel"
      ],
      general: [
        "Bring reusable bags when shopping to reduce plastic waste",
        "Choose products with minimal packaging whenever possible",
        "Start a small herb garden to reduce food packaging and transport"
      ]
    };

    return tipsByCategory[category] || tipsByCategory.general;
  }

  private getFallbackPostIdeas(): string[] {
    return [
      "Share a photo of your latest eco-friendly purchase and explain why you chose it",
      "Document your plastic-free day challenge and inspire others to try it",
      "Show before/after photos of a space you've made more sustainable"
    ];
  }

  // Health check method to verify Groq service
  async healthCheck(): Promise<{ status: string; model?: string; latency?: number }> {
    try {
      if (!this.groq) {
        return { status: 'unavailable' };
      }

      const startTime = Date.now();
      
      await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'llama3-8b-8192',
        max_tokens: 1
      });

      const latency = Date.now() - startTime;

      return {
        status: 'healthy',
        model: 'llama3-8b-8192',
        latency
      };
    } catch (error) {
      logger.error('Groq health check failed:', error);
      return { status: 'error' };
    }
  }
}

export const groqService = new GroqService();
