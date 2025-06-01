
export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  cleanUrl: string;
  isExpired?: boolean;
  expiresAt?: Date;
  isLocal?: boolean;
  priority?: number;
  cacheKey?: string;
}

// Cache for URL validation results to prevent repeated validations
const validationCache = new Map<string, UrlValidationResult>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const validateAndCleanUrl = (url: string | null): UrlValidationResult => {
  if (!url) {
    return {
      isValid: false,
      error: 'No URL provided',
      cleanUrl: '',
      priority: 0
    };
  }
  
  // Check cache first
  const cacheKey = getCacheKey(url);
  if (validationCache.has(cacheKey)) {
    const cached = validationCache.get(cacheKey)!;
    const cacheAge = Date.now() - (cached.expiresAt?.getTime() || 0);
    if (cacheAge < CACHE_DURATION) {
      return { ...cached, cacheKey };
    }
    validationCache.delete(cacheKey);
  }
  
  try {
    const parsedUrl = new URL(url);
    
    // Determine if this is a local Supabase storage URL
    const isLocal = parsedUrl.hostname.includes('supabase.co') || 
                    parsedUrl.hostname.includes('cwjxbwqdfejhmiixoiym.supabase.co');
    
    // Set priority: local URLs get highest priority
    const priority = isLocal ? 100 : 50;
    
    // Check for expired Meshy.ai URLs
    if (parsedUrl.hostname.includes('meshy.ai') && parsedUrl.searchParams.has('Expires')) {
      const expiresTimestamp = parseInt(parsedUrl.searchParams.get('Expires') || '0');
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const isExpired = expiresTimestamp < currentTimestamp;
      
      if (isExpired) {
        const result = {
          isValid: false,
          error: 'URL has expired',
          cleanUrl: url,
          isExpired: true,
          expiresAt: new Date(expiresTimestamp * 1000),
          isLocal,
          priority: 0, // Expired URLs get lowest priority
          cacheKey
        };
        validationCache.set(cacheKey, result);
        return result;
      }
    }
    
    // Remove cache-busting parameters for better caching
    const cleanUrl = cleanUrlParameters(parsedUrl);
    
    const result = {
      isValid: true,
      cleanUrl,
      isExpired: false,
      isLocal,
      priority,
      cacheKey
    };
    
    validationCache.set(cacheKey, result);
    return result;
  } catch (e) {
    const result = {
      isValid: false,
      error: 'Invalid URL format',
      cleanUrl: url,
      priority: 0,
      cacheKey
    };
    validationCache.set(cacheKey, result);
    return result;
  }
};

// New function to prioritize URLs based on validation results
export const prioritizeUrls = (urls: (string | null)[]): string | null => {
  const validatedUrls = urls
    .filter((url): url is string => !!url)
    .map(url => ({ url, validation: validateAndCleanUrl(url) }))
    .filter(item => item.validation.isValid)
    .sort((a, b) => (b.validation.priority || 0) - (a.validation.priority || 0));
    
  console.log('🔍 [URL-PRIORITIZATION] URL prioritization results:', 
    validatedUrls.map(item => ({
      url: item.url.substring(0, 50) + '...',
      isLocal: item.validation.isLocal,
      priority: item.validation.priority,
      isExpired: item.validation.isExpired
    }))
  );
  
  return validatedUrls.length > 0 ? validatedUrls[0].validation.cleanUrl : null;
};

export const cleanUrlParameters = (url: URL): string => {
  // Remove cache-busting parameters but preserve important ones
  const paramsToRemove = ['t', 'cb', 'cache', 'timestamp', '_t', 'v', 'nocache'];
  paramsToRemove.forEach(param => {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
    }
  });
  
  return url.toString();
};

export const isUrlAccessible = async (url: string, timeout: number = 5000): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('URL accessibility check failed:', error);
    return false;
  }
};

export const getCacheKey = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Remove cache-busting parameters for consistent caching
    return cleanUrlParameters(urlObj);
  } catch {
    return url;
  }
};

// Utility to generate stable model IDs
export const generateStableModelId = (url: string, fileName?: string): string => {
  try {
    const validation = validateAndCleanUrl(url);
    const cleanUrl = validation.cleanUrl;
    const urlObj = new URL(cleanUrl);
    const pathParts = urlObj.pathname.split('/');
    const urlFileName = pathParts[pathParts.length - 1]?.split('.')[0] || 'unknown';
    const hostHash = urlObj.hostname.replace(/\./g, '-');
    const finalFileName = fileName?.replace(/\W/g, '') || urlFileName;
    return `model-${finalFileName}-${hostHash}`;
  } catch (e) {
    // Fallback for invalid URLs
    const safeFileName = fileName?.replace(/\W/g, '') || 'unknown';
    const urlHash = Math.abs(url.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
    return `model-${safeFileName}-${urlHash}`;
  }
};

// Clear validation cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of validationCache.entries()) {
    const cacheAge = now - (value.expiresAt?.getTime() || 0);
    if (cacheAge >= CACHE_DURATION) {
      validationCache.delete(key);
    }
  }
}, CACHE_DURATION);
