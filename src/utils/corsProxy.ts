
/**
 * Utility for handling CORS proxies for 3D model loading
 */

// List of available CORS proxies (updated with more reliable services)
const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://cors-proxy.fringe.zone/",
  "https://corsproxy.io/?",
  "https://cors-anywhere.herokuapp.com/"
];

/**
 * Adds a CORS proxy to a URL
 * @param url The original URL
 * @param proxyIndex The index of the proxy to use (defaults to 0)
 * @returns The URL with the CORS proxy
 */
export const addCorsProxy = (url: string, proxyIndex: number = 0): string => {
  if (!url) return url;
  
  // Don't add a proxy for blob URLs or data URLs
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    console.log("Skipping proxy for blob or data URL:", url);
    return url;
  }
  
  // Ensure proxy index is valid
  const validIndex = Math.max(0, Math.min(proxyIndex, CORS_PROXIES.length - 1));
  const proxy = CORS_PROXIES[validIndex];
  
  // Different encoding strategies for different proxies
  let proxiedUrl: string;
  
  if (proxy.includes('allorigins.win')) {
    // For allorigins, encode the URL properly
    proxiedUrl = `${proxy}${encodeURIComponent(url)}`;
  } else if (proxy.includes('cors-proxy.fringe.zone')) {
    // For fringe.zone, append without encoding
    proxiedUrl = `${proxy}${url}`;
  } else if (proxy.includes('corsproxy.io')) {
    // For corsproxy.io, encode the URL
    proxiedUrl = `${proxy}${encodeURIComponent(url)}`;
  } else {
    // Default encoding for other proxies
    proxiedUrl = `${proxy}${url}`;
  }
  
  console.log(`Adding CORS proxy (${validIndex}):`, proxiedUrl);
  return proxiedUrl;
};

/**
 * Check if a URL is already a proxied URL
 */
export const isProxiedUrl = (url: string): boolean => {
  if (!url) return false;
  return CORS_PROXIES.some(proxy => url.startsWith(proxy));
};

/**
 * Get the original URL from a proxied URL
 */
export const getOriginalUrl = (proxiedUrl: string): string => {
  if (!proxiedUrl) return proxiedUrl;
  
  // If it's not a proxied URL, return it as is
  if (!isProxiedUrl(proxiedUrl)) return proxiedUrl;
  
  // Find which proxy was used
  const proxy = CORS_PROXIES.find(p => proxiedUrl.startsWith(p));
  if (!proxy) return proxiedUrl;
  
  // Extract and decode the original URL
  const encodedUrl = proxiedUrl.substring(proxy.length);
  try {
    return decodeURIComponent(encodedUrl);
  } catch (e) {
    console.error('Error decoding proxied URL:', e);
    return proxiedUrl;
  }
};

/**
 * Test if a proxy can actually download data from a URL
 * @param proxiedUrl The URL with proxy applied
 * @returns Promise<boolean> Whether the proxy works for data download
 */
const testProxyDataAccess = async (proxiedUrl: string): Promise<boolean> => {
  try {
    console.log(`Testing data access with proxy: ${proxiedUrl}`);
    
    // Try to fetch a small amount of data (first 1024 bytes)
    const response = await fetch(proxiedUrl, {
      method: 'GET',
      headers: {
        'Range': 'bytes=0-1023'
      }
    });
    
    if (!response.ok) {
      console.log(`Proxy test failed with status: ${response.status}`);
      return false;
    }
    
    // Try to read a small amount of the response to ensure it's actually accessible
    const reader = response.body?.getReader();
    if (!reader) {
      console.log('Proxy test failed: no readable stream');
      return false;
    }
    
    const { done, value } = await reader.read();
    reader.releaseLock();
    
    if (done || !value || value.length === 0) {
      console.log('Proxy test failed: no data received');
      return false;
    }
    
    console.log(`Proxy test succeeded: received ${value.length} bytes`);
    return true;
  } catch (error) {
    console.log(`Proxy test failed with error:`, error);
    return false;
  }
};

/**
 * Try to load a URL with different CORS proxies
 * @param url The original URL
 * @param onSuccess Callback when successful
 * @param onError Callback when all attempts fail
 */
export const tryLoadWithCorsProxies = async (
  url: string,
  onSuccess: (loadedUrl: string) => void,
  onError: (error: Error) => void
): Promise<void> => {
  if (!url) {
    onError(new Error("No URL provided"));
    return;
  }

  // Skip proxies for blob URLs - pass them through directly
  if (url.startsWith('blob:')) {
    console.log("Direct access for blob URL:", url);
    onSuccess(url);
    return;
  }

  // For external URLs, start directly with proxy attempts since we know they're CORS-blocked
  console.log("Starting proxy attempts for external URL:", url);

  // Try with each proxy with proper data access testing
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxiedUrl = addCorsProxy(url, i);
    console.log(`Trying proxy ${i}: ${proxiedUrl.substring(0, 100)}...`);
    
    try {
      const canDownloadData = await testProxyDataAccess(proxiedUrl);
      if (canDownloadData) {
        console.log(`Proxy ${i} succeeded for data access`);
        onSuccess(proxiedUrl);
        return;
      }
    } catch (error) {
      console.log(`Proxy ${i} failed:`, error);
      // Continue to next proxy
    }
  }

  // If all attempts fail, call the error callback
  console.error("All proxy attempts failed for URL:", url);
  onError(new Error("Failed to load URL with all available proxies - all proxies are either blocked or non-functional"));
};

export default {
  addCorsProxy,
  tryLoadWithCorsProxies,
  isProxiedUrl,
  getOriginalUrl
};
