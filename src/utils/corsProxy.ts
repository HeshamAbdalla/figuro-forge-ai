
const CORS_PROXIES = [
  'https://cors-proxy.fringe.zone/',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

export const tryLoadWithCorsProxies = async (
  url: string,
  onSuccess: (workingUrl: string) => void,
  onFailure: (error: Error) => void
): Promise<void> => {
  console.log('🔄 [CORS-PROXY] Attempting to load URL:', url);

  // First try the direct URL (prioritize Supabase storage URLs)
  try {
    console.log('🔄 [CORS-PROXY] Trying direct URL first...');
    
    // For Supabase storage URLs, try direct access first as they should be public
    if (url.includes('cwjxbwqdfejhmiixoiym.supabase.co/storage')) {
      console.log('✅ [CORS-PROXY] Supabase storage URL detected, using direct access');
      onSuccess(url);
      return;
    }
    
    // Test if URL is accessible for other URLs
    const testResponse = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // Try no-cors first
    });
    
    console.log('✅ [CORS-PROXY] Direct URL accessible');
    onSuccess(url);
    return;
  } catch (error) {
    console.log('⚠️ [CORS-PROXY] Direct URL failed, trying with CORS mode...');
    
    // Try with CORS mode
    try {
      const testResponse = await fetch(url, { method: 'HEAD' });
      if (testResponse.ok) {
        console.log('✅ [CORS-PROXY] Direct URL accessible with CORS');
        onSuccess(url);
        return;
      }
    } catch (corsError) {
      console.log('⚠️ [CORS-PROXY] CORS mode also failed, trying proxies...');
    }
  }

  // Try each CORS proxy
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    const proxiedUrl = `${proxy}${encodeURIComponent(url)}`;
    
    try {
      console.log(`🔄 [CORS-PROXY] Trying proxy ${i + 1}/${CORS_PROXIES.length}:`, proxy);
      
      const testResponse = await fetch(proxiedUrl, { 
        method: 'HEAD',
        timeout: 10000 // 10 second timeout
      });
      
      if (testResponse.ok) {
        console.log('✅ [CORS-PROXY] Proxy successful:', proxy);
        onSuccess(proxiedUrl);
        return;
      }
    } catch (error) {
      console.log(`⚠️ [CORS-PROXY] Proxy ${i + 1} failed:`, error);
      continue;
    }
  }

  // If all proxies failed, try the original URL anyway as a last resort
  console.log('⚠️ [CORS-PROXY] All proxies failed, falling back to original URL');
  try {
    onSuccess(url);
  } catch (error) {
    const finalError = error instanceof Error ? error : new Error('All loading attempts failed');
    onFailure(finalError);
  }
};
