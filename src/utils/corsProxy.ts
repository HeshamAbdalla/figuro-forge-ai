
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

  // First try without a proxy
  try {
    console.log("Trying to load URL directly:", url);
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // Allow cross-origin requests
    });
    console.log("Direct URL access succeeded");
    onSuccess(url);
    return;
  } catch (error) {
    console.log("Direct access failed, trying proxies...", error);
  }

  // Try with each proxy with better error handling
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxiedUrl = addCorsProxy(url, i);
    console.log(`Trying with proxy ${i}:`, proxiedUrl);
    
    try {
      const response = await fetch(proxiedUrl, { 
        method: 'HEAD',
        timeout: 10000 // 10 second timeout
      });
      if (response.ok || response.status === 0) { // Status 0 is ok for CORS
        console.log(`Proxy ${i} succeeded`);
        onSuccess(proxiedUrl);
        return;
      }
    } catch (error) {
      console.log(`Proxy ${i} failed:`, error);
      // Continue to next proxy
    }
  }

  // If all attempts fail, call the error callback
  console.error("All proxy attempts failed");
  onError(new Error("Failed to load URL with all available proxies"));
};

export default {
  addCorsProxy,
  tryLoadWithCorsProxies,
  isProxiedUrl,
  getOriginalUrl
};
