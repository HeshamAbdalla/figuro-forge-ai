
interface UrlInfo {
  isSupabaseStorage: boolean;
  isMeshyUrl: boolean;
  isExpired: boolean;
  priority: number;
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

export const isUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    // For Supabase storage URLs, assume they're accessible
    if (url.includes('supabase.co/storage/v1/object/public/')) {
      return true;
    }
    
    // For other URLs, do a quick HEAD request
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // Use no-cors to avoid CORS issues in testing
    });
    
    return true; // If no error thrown, assume accessible
  } catch (error) {
    console.warn('⚠️ [URL-VALIDATION] URL not accessible:', url, error);
    return false;
  }
};

export const validateModelUrl = (url: string): { valid: boolean; reason?: string } => {
  if (!url || typeof url !== 'string') {
    return { valid: false, reason: 'URL is empty or invalid' };
  }
  
  const trimmedUrl = url.trim();
  if (trimmedUrl.length === 0) {
    return { valid: false, reason: 'URL is empty' };
  }
  
  try {
    new URL(trimmedUrl);
  } catch (e) {
    return { valid: false, reason: 'URL format is invalid' };
  }
  
  const info = analyzeUrl(trimmedUrl);
  
  if (info.isMeshyUrl && info.isExpired) {
    return { valid: false, reason: 'Meshy URL has expired' };
  }
  
  return { valid: true };
};
