import { ENV } from '../config/env.js';
import { createApi } from 'unsplash-js';

/**
 * Unsplash Service
 *
 * Provides free, high-quality editorial images for collection covers.
 * Uses Unsplash API (50 requests/hour free tier).
 *
 * @see https://unsplash.com/developers
 */

interface UnsplashPhoto {
  id: string;
  url: string;
  downloadUrl: string;
  photographer: string;
  photographerUrl: string;
  description: string | null;
}

class UnsplashService {
  private api: ReturnType<typeof createApi> | null = null;
  private cache = new Map<string, UnsplashPhoto>();
  private CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    if (ENV.UNSPLASH_ACCESS_KEY) {
      this.api = createApi({
        accessKey: ENV.UNSPLASH_ACCESS_KEY,
      });
    }
  }

  /**
   * Search for editorial images matching collection theme
   * @param query Search keywords (e.g., "minimalist", "cozy", "luxury")
   * @param orientation Image orientation preference
   */
  async searchPhotos(
    query: string,
    orientation: 'landscape' | 'portrait' | 'squarish' = 'portrait'
  ): Promise<UnsplashPhoto | null> {
    // Check cache first
    const cacheKey = `${query}-${orientation}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.api) {
      console.warn('⚠️ Unsplash API not configured. Using placeholder images.');
      return this.getPlaceholder(query);
    }

    try {
      const result = await this.api.search.getPhotos({
        query,
        orientation,
        perPage: 10,
        orderBy: 'relevant',
      });

      if (result.errors) {
        console.error('Unsplash API errors:', result.errors);
        return this.getPlaceholder(query);
      }

      const photos = result.response?.results;
      if (!photos || photos.length === 0) {
        console.warn(`No Unsplash photos found for query: ${query}`);
        return this.getPlaceholder(query);
      }

      // Pick a random photo from top results for variety
      const photo = photos[Math.floor(Math.random() * Math.min(5, photos.length))];

      const unsplashPhoto: UnsplashPhoto = {
        id: photo.id,
        url: photo.urls.regular,
        downloadUrl: photo.links.download_location,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        description: photo.description || photo.alt_description,
      };

      // Cache the result
      this.cache.set(cacheKey, unsplashPhoto);
      setTimeout(() => this.cache.delete(cacheKey), this.CACHE_TTL);

      // Trigger download event (required by Unsplash API guidelines)
      if (this.api && unsplashPhoto.downloadUrl) {
        this.api.photos.trackDownload({ downloadLocation: unsplashPhoto.downloadUrl });
      }

      return unsplashPhoto;
    } catch (error) {
      console.error('Error fetching Unsplash photo:', error);
      return this.getPlaceholder(query);
    }
  }

  /**
   * Get a curated photo from Unsplash Editorial
   */
  async getEditorialPhoto(): Promise<UnsplashPhoto | null> {
    if (!this.api) {
      return this.getPlaceholder('editorial');
    }

    try {
      const result = await this.api.photos.getRandom({
        count: 1,
        featured: true,
        orientation: 'portrait',
      });

      if (result.errors || !result.response) {
        return this.getPlaceholder('editorial');
      }

      const photo = Array.isArray(result.response) ? result.response[0] : result.response;

      return {
        id: photo.id,
        url: photo.urls.regular,
        downloadUrl: photo.links.download_location,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        description: photo.description || photo.alt_description,
      };
    } catch (error) {
      console.error('Error fetching editorial photo:', error);
      return this.getPlaceholder('editorial');
    }
  }

  /**
   * Get photo based on collection editorial vibe
   * Maps vibe keywords to Unsplash search queries
   */
  async getPhotoForVibe(vibe: string): Promise<UnsplashPhoto | null> {
    // Map editorial vibes to search-friendly keywords
    const vibeToQuery: Record<string, string> = {
      minimalist: 'minimalist elegant design',
      cozy: 'cozy warm home interior',
      luxurious: 'luxury elegant lifestyle',
      'high-tech': 'modern technology sleek',
      playful: 'playful colorful fun',
      sophisticated: 'sophisticated elegant style',
      rustic: 'rustic natural organic',
      modern: 'modern contemporary clean',
      vintage: 'vintage retro classic',
      bohemian: 'bohemian eclectic artistic',
    };

    const query = vibeToQuery[vibe.toLowerCase()] || vibe;
    return this.searchPhotos(query, 'portrait');
  }

  /**
   * Placeholder image generator (fallback when Unsplash unavailable)
   */
  private getPlaceholder(theme: string): UnsplashPhoto {
    // Generate a consistent placeholder based on theme hash
    const hash = theme.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['2C3E50', '34495E', '7F8C8D', '95A5A6', 'BDC3C7'];
    const color = colors[hash % colors.length];

    return {
      id: `placeholder-${hash}`,
      url: `https://via.placeholder.com/400x600/${color}/FFFFFF?text=${encodeURIComponent(theme)}`,
      downloadUrl: '',
      photographer: 'Placeholder',
      photographerUrl: '',
      description: `Placeholder for ${theme}`,
    };
  }

  /**
   * Format attribution text for display
   */
  getAttribution(photo: UnsplashPhoto): string {
    return `Photo by ${photo.photographer} on Unsplash`;
  }
}

export const unsplashService = new UnsplashService();
