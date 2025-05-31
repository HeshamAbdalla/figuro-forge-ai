
export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  cleanUrl: string;
  isExpired?: boolean;
  expiresAt?: Date;
}

export const validateAndCleanUrl = (url: string | null): UrlValidationResult => {
  if (!url) {
    return {
      isValid: false,
      error: 'No URL provided',
      cleanUrl: ''
    };
  }
  
  try {
    const parsedUrl = new URL(url);
    
    // Check for expired Meshy.ai URLs
    if (parsedUrl.hostname.includes('meshy.ai') && parsedUrl.searchParams.has('Expires')) {
      const expiresTimestamp = parseInt(parsedUrl.searchParams.get('Expires') || '0');
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const isExpired = expiresTimestamp < currentTimestamp;
      
      if (isExpired) {
        return {
          isValid: false,
          error: 'URL has expired',
          cleanUrl: url,
          isExpired: true,
          expiresAt: new Date(expiresTimestamp * 1000)
        };
      }
    }
    
    // Remove cache-busting parameters for better caching
    const cleanUrl = cleanUrlParameters(parsedUrl);
    
    return {
      isValid: true,
      cleanUrl,
      isExpired: false
    };
  } catch (e) {
    return {
      isValid: false,
      error: 'Invalid URL format',
      cleanUrl: url
    };
  }
};

export const cleanUrlParameters = (url: URL): string => {
  // Remove cache-busting parameters
  ['t', 'cb', 'cache', 'timestamp', '_t'].forEach(param => {
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

export const getUrlCacheKey = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Remove cache-busting parameters for consistent caching
    return cleanUrlParameters(urlObj);
  } catch {
    return url;
  }
};
