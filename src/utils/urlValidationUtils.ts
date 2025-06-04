
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
    priority = 10;  // Low priority but still usable
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
    
    if (info.isMeshyUrl && info.isExpired) {
      return {
        isValid: false,
        cleanUrl: trimmedUrl,
        isLocal,
        error: 'Meshy URL has expired'
      };
    }
    
    return {
      isValid: true,
      cleanUrl: trimmedUrl,
      isLocal
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

export const prioritizeUrls = (urls: string[]): string | null => {
  if (!urls || urls.length === 0) {
    return null;
  }
  
  // Filter out null/undefined URLs
  const validUrls = urls.filter(url => url && typeof url === 'string' && url.trim().length > 0);
  
  if (validUrls.length === 0) {
    return null;
  }
  
  // If only one URL, return it
  if (validUrls.length === 1) {
    return validUrls[0];
  }
  
  // Analyze and sort URLs by priority
  const urlsWithInfo = validUrls.map(url => ({
    url,
    info: analyzeUrl(url)
  }));
  
  // Sort by priority (highest first)
  urlsWithInfo.sort((a, b) => b.info.priority - a.info.priority);
  
  const selectedUrl = urlsWithInfo[0].url;
  const selectedInfo = urlsWithInfo[0].info;
  
  console.log('🎯 [URL-PRIORITIZATION] Selected URL:', selectedUrl, 'Info:', selectedInfo);
  
  return selectedUrl;
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
      console.warn('⚠️ [URL-VALIDATION] URL not accessible:', url, error);
      return false;
    }
  } catch (error) {
    console.warn('⚠️ [URL-VALIDATION] URL accessibility check failed:', url, error);
    return false;
  }
};

export const validateModelUrl = (url: string): { valid: boolean; reason?: string } => {
  const validation = validateAndCleanUrl(url);
  
  if (!validation.isValid) {
    return { valid: false, reason: validation.error };
  }
  
  return { valid: true };
};
