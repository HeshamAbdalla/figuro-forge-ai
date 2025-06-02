
import { supabase } from "@/integrations/supabase/client";
import { extractTaskId, generateThumbnailPaths, TaskIdExtractionResult } from "@/utils/taskIdExtractor";

export interface ThumbnailResult {
  url: string | null;
  exists: boolean;
  source: string;
  taskId: string | null;
  confidence: 'high' | 'medium' | 'low';
}

export interface ThumbnailCache {
  [key: string]: ThumbnailResult & { timestamp: number };
}

class ThumbnailServiceClass {
  private cache: ThumbnailCache = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private pendingChecks = new Map<string, Promise<ThumbnailResult>>();

  /**
   * Get cache key for a file
   */
  private getCacheKey(fullPath: string, fileName: string): string {
    return `${fullPath}:${fileName}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(entry: ThumbnailCache[string]): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  /**
   * Check if a thumbnail exists at a given path
   */
  private async checkThumbnailExists(thumbnailPath: string): Promise<string | null> {
    try {
      const pathParts = thumbnailPath.split('/');
      const fileName = pathParts.pop();
      const directory = pathParts.join('/');
      
      if (!fileName || !directory) return null;

      const { data, error } = await supabase.storage
        .from('figurine-images')
        .list(directory, { search: fileName });

      if (error || !data || data.length === 0) {
        return null;
      }

      // Verify the file actually exists and is accessible
      const { data: publicUrlData } = supabase.storage
        .from('figurine-images')
        .getPublicUrl(thumbnailPath);

      const url = publicUrlData.publicUrl;
      
      // Quick HEAD request to verify accessibility
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          return url;
        }
      } catch {
        // If HEAD request fails, still return the URL as it might work
        return url;
      }

      return null;
    } catch (error) {
      console.warn('Error checking thumbnail existence:', error);
      return null;
    }
  }

  /**
   * Find thumbnail for a 3D model file
   */
  async findThumbnail(fullPath: string, fileName: string): Promise<ThumbnailResult> {
    const cacheKey = this.getCacheKey(fullPath, fileName);
    
    // Check cache first
    const cached = this.cache[cacheKey];
    if (cached && this.isCacheValid(cached)) {
      console.log('📋 [THUMBNAIL] Cache hit for:', fileName);
      return {
        url: cached.url,
        exists: cached.exists,
        source: cached.source,
        taskId: cached.taskId,
        confidence: cached.confidence
      };
    }

    // Check if there's already a pending check for this file
    if (this.pendingChecks.has(cacheKey)) {
      console.log('⏳ [THUMBNAIL] Reusing pending check for:', fileName);
      return this.pendingChecks.get(cacheKey)!;
    }

    // Start new check
    const checkPromise = this.performThumbnailCheck(fullPath, fileName);
    this.pendingChecks.set(cacheKey, checkPromise);

    try {
      const result = await checkPromise;
      
      // Cache the result
      this.cache[cacheKey] = {
        ...result,
        timestamp: Date.now()
      };
      
      return result;
    } finally {
      this.pendingChecks.delete(cacheKey);
    }
  }

  /**
   * Perform the actual thumbnail check
   */
  private async performThumbnailCheck(fullPath: string, fileName: string): Promise<ThumbnailResult> {
    console.log('🔍 [THUMBNAIL] Starting check for:', fileName);
    
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return {
          url: null,
          exists: false,
          source: 'no_auth',
          taskId: null,
          confidence: 'low'
        };
      }

      const userId = session.user.id;

      // Extract task ID with confidence scoring
      const extraction = extractTaskId(fullPath, fileName);
      if (!extraction.taskId) {
        console.warn('⚠️ [THUMBNAIL] No task ID extracted for:', fileName);
        return {
          url: null,
          exists: false,
          source: 'no_task_id',
          taskId: null,
          confidence: 'low'
        };
      }

      console.log('🔍 [THUMBNAIL] Extracted task ID:', {
        taskId: extraction.taskId,
        confidence: extraction.confidence,
        method: extraction.method
      });

      // Generate possible thumbnail paths
      const possiblePaths = generateThumbnailPaths(extraction.taskId, userId);
      
      console.log('🔍 [THUMBNAIL] Checking paths:', possiblePaths.length);

      // Check each possible path
      for (const thumbnailPath of possiblePaths) {
        const thumbnailUrl = await this.checkThumbnailExists(thumbnailPath);
        if (thumbnailUrl) {
          console.log('✅ [THUMBNAIL] Found at:', thumbnailPath);
          return {
            url: thumbnailUrl,
            exists: true,
            source: 'storage',
            taskId: extraction.taskId,
            confidence: extraction.confidence
          };
        }
      }

      console.log('❌ [THUMBNAIL] No thumbnail found for:', fileName);
      return {
        url: null,
        exists: false,
        source: 'not_found',
        taskId: extraction.taskId,
        confidence: extraction.confidence
      };

    } catch (error) {
      console.error('❌ [THUMBNAIL] Error during check:', error);
      return {
        url: null,
        exists: false,
        source: 'error',
        taskId: null,
        confidence: 'low'
      };
    }
  }

  /**
   * Clear cache for a specific file or all cache
   */
  clearCache(fullPath?: string, fileName?: string): void {
    if (fullPath && fileName) {
      const cacheKey = this.getCacheKey(fullPath, fileName);
      delete this.cache[cacheKey];
      console.log('🗑️ [THUMBNAIL] Cleared cache for:', fileName);
    } else {
      this.cache = {};
      console.log('🗑️ [THUMBNAIL] Cleared all thumbnail cache');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { entries: number; hitRatio: number } {
    const totalEntries = Object.keys(this.cache).length;
    const validEntries = Object.values(this.cache).filter(entry => this.isCacheValid(entry)).length;
    
    return {
      entries: totalEntries,
      hitRatio: totalEntries > 0 ? validEntries / totalEntries : 0
    };
  }
}

export const ThumbnailService = new ThumbnailServiceClass();
