
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

  // First try the direct URL
  try {
    console.log('🔄 [CORS-PROXY] Trying direct URL first...');
    
    // Test if URL is accessible
    const testResponse = await fetch(url, { method: 'HEAD' });
    if (testResponse.ok) {
      console.log('✅ [CORS-PROXY] Direct URL accessible');
      onSuccess(url);
      return;
    }
  } catch (error) {
    console.log('⚠️ [CORS-PROXY] Direct URL failed, trying proxies...');
  }

  // Try each CORS proxy
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    const proxiedUrl = `${proxy}${encodeURIComponent(url)}`;
    
    try {
      console.log(`🔄 [CORS-PROXY] Trying proxy ${i + 1}/${CORS_PROXIES.length}:`, proxy);
      
      const testResponse = await fetch(proxiedUrl, { method: 'HEAD' });
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

  // If all proxies failed, try the original URL anyway
  console.log('⚠️ [CORS-PROXY] All proxies failed, falling back to original URL');
  try {
    onSuccess(url);
  } catch (error) {
    onFailure(new Error('All loading attempts failed'));
  }
};
