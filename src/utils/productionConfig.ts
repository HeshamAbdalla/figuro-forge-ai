
/**
 * Production Configuration and Environment Detection
 */

import { logInfo } from './productionLogger';

export const PRODUCTION_CONFIG = {
  // Environment detection
  environment: {
    isProduction: window.location.hostname === 'figuros.ai' || window.location.hostname === 'www.figuros.ai',
    isDevelopment: process.env.NODE_ENV === 'development',
    isStaging: window.location.hostname.includes('lovable.app')
  },
  
  // Performance settings
  performance: {
    enableServiceWorker: true,
    enableCompression: true,
    enableCaching: true,
    enableLazyLoading: true
  },
  
  // Monitoring
  monitoring: {
    enableErrorReporting: true,
    enablePerformanceTracking: true,
    enableAnalytics: true,
    enableUserFeedback: true
  },
  
  // Security
  security: {
    enableCSP: true,
    enableHTTPS: true,
    enableRateLimiting: true,
    enableSecurityHeaders: true
  },
  
  // Features
  features: {
    enableBetaFeatures: false,
    enableDebugMode: false,
    enableMaintenanceMode: false
  }
};

export const getProductionBaseUrl = (): string => {
  if (PRODUCTION_CONFIG.environment.isProduction) {
    return 'https://figuros.ai';
  }
  return window.location.origin;
};

export const isProductionReady = (): boolean => {
  const checks = [
    // Environment checks
    typeof window !== 'undefined',
    // Feature checks
    !PRODUCTION_CONFIG.features.enableDebugMode,
    // Security checks
    PRODUCTION_CONFIG.security.enableHTTPS,
    // Performance checks
    PRODUCTION_CONFIG.performance.enableCaching
  ];
  
  return checks.every(check => check === true);
};

// Use production logger instead of console.log
logInfo('Production configuration loaded', {
  environment: PRODUCTION_CONFIG.environment,
  isProductionReady: isProductionReady(),
  baseUrl: getProductionBaseUrl()
});
