
interface UrlInfo {
  isSupabaseStorage: boolean;
  isMeshyUrl: boolean;
  isExpired: boolean;
  priority: number;
}

interface UrlValidationResult {
  isValid: boolean;
  cleanUrl: string;
  isLocal: boolean;
  error?: string;
  canFallback?: boolean;
}

const analyzeUrl = (url: string): UrlInfo => {
  const isSupabaseStorage = url.includes('supabase.co/storage/v1/object/public/');
  const isMeshyUrl = url.includes('meshy.ai') || url.includes('assets.meshy.ai');
  
  let isExpired = false;
  if (isMeshyUrl) {
    try {
      const urlObj = new URL(url);
      const expiresParam = urlObj.searchParams.get('Expires');
      if (expiresParam) {
        const expiresTimestamp = parseInt(expiresParam);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        isExpired = expiresTimestamp < currentTimestamp;
      }
    } catch (e) {
      // Invalid URL, consider it expired
      isExpired = true;
    }
  }
  
  // Priority: Supabase storage (highest), non-expired Meshy URLs, expired URLs (lowest)
  let priority = 0;
  if (isSupabaseStorage) {
    priority = 100; // Highest priority
  } else if (isMeshyUrl && !isExpired) {
    priority = 50;  // Medium priority
  } else if (isMeshyUrl && isExpired) {
    priority = 5;   // Very low priority but still available for download
  } else {
    priority = 25;  // Other URLs
  }
  
  return {
    isSupabaseStorage,
    isMeshyUrl,
    isExpired,
    priority
  };
};

export const validateAndCleanUrl = (url: string | null | undefined): UrlValidationResult => {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      cleanUrl: '',
      isLocal: false,
      error: 'URL is empty or invalid'
    };
  }
  
  const trimmedUrl = url.trim();
  if (trimmedUrl.length === 0) {
    return {
      isValid: false,
      cleanUrl: '',
      isLocal: false,
      error: 'URL is empty'
    };
  }
  
  try {
    const urlObj = new URL(trimmedUrl);
    const isLocal = urlObj.hostname.includes('supabase.co');
    const info = analyzeUrl(trimmedUrl);
    
    // Mark expired Meshy URLs as valid but with fallback capability
    if (info.isMeshyUrl && info.isExpired) {
      return {
        isValid: true, // Changed: Allow expired URLs but mark them
        cleanUrl: trimmedUrl,
        isLocal,
        error: 'URL expired but available for download',
        canFallback: true
      };
    }
    
    return {
      isValid: true,
      cleanUrl: trimmedUrl,
      isLocal,
      canFallback: info.isMeshyUrl // Meshy URLs can use fallback strategies
    };
  } catch (e) {
    return {
      isValid: false,
      cleanUrl: trimmedUrl,
      isLocal: false,
      error: 'URL format is invalid'
    };
  }
};

// Updated function to return just the URL string for backward compatibility
export const prioritizeUrls = (urls: string[]): string | null => {
  const result = prioritizeUrlsWithInfo(urls);
  return result.url;
};

// New function that returns the object with URL and info
export const prioritizeUrlsWithInfo = (urls: string[]): { url: string | null; info: UrlInfo | null } => {
  if (!urls || urls.length === 0) {
    return { url: null, info: null };
  }
  
  // Filter out null/undefined URLs and validate them
  const validUrls = urls
    .filter(url => url && typeof url === 'string' && url.trim().length > 0)
    .map(url => {
      const validation = validateAndCleanUrl(url);
      return validation.isValid ? validation.cleanUrl : null;
    })
    .filter(Boolean);
  
  if (validUrls.length === 0) {
    return { url: null, info: null };
  }
  
  // If only one URL, return it
  if (validUrls.length === 1) {
    const info = analyzeUrl(validUrls[0]);
    return { url: validUrls[0], info };
  }
  
  // Analyze and sort URLs by priority
  const urlsWithInfo = validUrls.map(url => ({
    url,
    info: analyzeUrl(url)
  }));
  
  // Sort by priority (highest first), exclude expired URLs from preview loading
  const nonExpiredUrls = urlsWithInfo.filter(item => !item.info.isExpired);
  const expiredUrls = urlsWithInfo.filter(item => item.info.isExpired);
  
  // Prioritize non-expired URLs first
  const sortedUrls = [
    ...nonExpiredUrls.sort((a, b) => b.info.priority - a.info.priority),
    ...expiredUrls.sort((a, b) => b.info.priority - a.info.priority)
  ];
  
  const selected = sortedUrls[0];
  
  console.log('🎯 [URL-PRIORITIZATION] Selected URL:', selected.url.substring(0, 50) + '...', 'Info:', {
    isSupabaseStorage: selected.info.isSupabaseStorage,
    isMeshyUrl: selected.info.isMeshyUrl,
    isExpired: selected.info.isExpired,
    priority: selected.info.priority
  });
  
  return { url: selected.url, info: selected.info };
};

export const isUrlAccessible = async (url: string, timeout = 5000): Promise<boolean> => {
  try {
    // For Supabase storage URLs, assume they're accessible
    if (url.includes('supabase.co/storage/v1/object/public/')) {
      return true;
    }
    
    // For other URLs, do a quick HEAD request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return true; // If no error thrown, assume accessible
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn('⚠️ [URL-VALIDATION] URL not accessible:', url.substring(0, 50) + '...', error);
      return false;
    }
  } catch (error) {
    console.warn('⚠️ [URL-VALIDATION] URL accessibility check failed:', url.substring(0, 50) + '...', error);
    return false;
  }
};

export const validateModelUrl = (url: string): { valid: boolean; reason?: string; canFallback?: boolean } => {
  const validation = validateAndCleanUrl(url);
  
  if (!validation.isValid) {
    return { valid: false, reason: validation.error };
  }
  
  return { 
    valid: true, 
    canFallback: validation.canFallback 
  };
};
