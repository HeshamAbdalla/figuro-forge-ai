
import { Figurine } from '@/types/figurine';

export const logModelDebugInfo = (figurine: Figurine) => {
  console.group(`🔍 Model Debug Info: ${figurine.title}`);
  console.log('Figurine ID:', figurine.id);
  console.log('Style:', figurine.style);
  console.log('Image URL:', figurine.image_url);
  console.log('Saved Image URL:', figurine.saved_image_url);
  console.log('Model URL:', figurine.model_url);
  console.log('Is Text-to-3D:', figurine.style === 'text-to-3d' || figurine.title.startsWith('Text-to-3D:'));
  console.log('Created At:', figurine.created_at);
  
  if (figurine.model_url) {
    try {
      const url = new URL(figurine.model_url);
      console.log('URL Hostname:', url.hostname);
      console.log('URL Pathname:', url.pathname);
      console.log('URL Search Params:', Object.fromEntries(url.searchParams.entries()));
      
      // Check for expired URLs
      if (url.hostname.includes('meshy.ai') && url.searchParams.has('Expires')) {
        const expiresTimestamp = parseInt(url.searchParams.get('Expires') || '0');
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const isExpired = expiresTimestamp < currentTimestamp;
        console.log('Expires Timestamp:', expiresTimestamp);
        console.log('Current Timestamp:', currentTimestamp);
        console.log('Is Expired:', isExpired);
        if (isExpired) {
          const expiredDate = new Date(expiresTimestamp * 1000);
          console.log('Expired Date:', expiredDate.toISOString());
        }
      }
    } catch (e) {
      console.error('Invalid URL format:', e);
    }
  } else {
    console.log('❌ No model URL available');
  }
  
  console.groupEnd();
};

export const validateModelUrl = async (url: string): Promise<{ isValid: boolean; error?: string }> => {
  if (!url) {
    return { isValid: false, error: 'No URL provided' };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Check for expired Meshy.ai URLs
    if (urlObj.hostname.includes('meshy.ai') && urlObj.searchParams.has('Expires')) {
      const expiresTimestamp = parseInt(urlObj.searchParams.get('Expires') || '0');
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (expiresTimestamp < currentTimestamp) {
        return { isValid: false, error: 'URL has expired' };
      }
    }
    
    // Basic connectivity test
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      
      if (!response.ok) {
        return { isValid: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      return { isValid: true };
    } catch (fetchError) {
      return { isValid: false, error: `Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown'}` };
    }
  } catch (e) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const getModelCacheStats = () => {
  // This would connect to the ModelLoader cache if needed
  console.log('📊 Model Cache Stats would be displayed here');
};
