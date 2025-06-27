
/**
 * Environment detection and URL utilities - Production Ready
 */

import { logDebug } from './productionLogger';

export const getEnvironmentType = (): 'production' | 'staging' | 'development' => {
  const hostname = window.location.hostname;
  
  if (hostname === 'figuros.ai' || hostname === 'www.figuros.ai') {
    return 'production';
  }
  
  if (hostname.includes('figuro') || hostname.includes('lovable.app')) {
    return 'staging';
  }
  
  return 'development';
};

export const isProduction = (): boolean => {
  return getEnvironmentType() === 'production';
};

export const getBaseUrl = (): string => {
  const envType = getEnvironmentType();
  
  switch (envType) {
    case 'production':
      return 'https://figuros.ai';
    case 'staging':
    case 'development':
    default:
      return window.location.origin;
  }
};

export const getAppUrl = (path: string = ''): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getStudioUrl = (): string => {
  return getAppUrl('/studio');
};

export const getAuthUrl = (): string => {
  return getAppUrl('/auth');
};

export const getProfileUrl = (): string => {
  return getAppUrl('/profile');
};

// Environment-specific configuration
export const getSupabaseRedirectUrl = (targetPath: string = '/studio'): string => {
  return getAppUrl(targetPath);
};

export const logEnvironmentInfo = (): void => {
  // Only log in development using production logger
  logDebug('Current environment info', {
    type: getEnvironmentType(),
    hostname: window.location.hostname,
    origin: window.location.origin,
    baseUrl: getBaseUrl(),
    isProduction: isProduction()
  });
};
