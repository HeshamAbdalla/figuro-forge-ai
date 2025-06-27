
/**
 * Production Deployment Utilities
 */

import { logInfo, logWarn } from './productionLogger';

export interface DeploymentConfig {
  environment: 'production' | 'staging' | 'development';
  version: string;
  buildTime: Date;
  features: {
    maintenanceMode: boolean;
    betaFeatures: boolean;
    debugMode: boolean;
  };
}

export const DEPLOYMENT_CONFIG: DeploymentConfig = {
  environment: 'production',
  version: '1.0.0',
  buildTime: new Date(),
  features: {
    maintenanceMode: false,
    betaFeatures: false,
    debugMode: false
  }
};

export const validateProductionEnvironment = (): boolean => {
  const checks = [
    // Environment variables
    typeof window !== 'undefined',
    // Security
    window.location.protocol === 'https:' || window.location.hostname === 'localhost',
    // Features
    !DEPLOYMENT_CONFIG.features.debugMode,
    !DEPLOYMENT_CONFIG.features.maintenanceMode
  ];

  const isValid = checks.every(check => check === true);
  
  if (!isValid) {
    logWarn('Production environment validation failed');
  } else {
    logInfo('Production environment validated successfully');
  }

  return isValid;
};

export const logDeploymentInfo = (): void => {
  logInfo('Production deployment active', {
    environment: DEPLOYMENT_CONFIG.environment,
    version: DEPLOYMENT_CONFIG.version,
    buildTime: DEPLOYMENT_CONFIG.buildTime.toISOString(),
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    isProduction: DEPLOYMENT_CONFIG.environment === 'production'
  });
};

export const getHealthCheckStatus = (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: string;
}> => {
  return new Promise((resolve) => {
    const checks = {
      environment: validateProductionEnvironment(),
      browser: typeof window !== 'undefined',
      connectivity: navigator.onLine,
      localStorage: typeof localStorage !== 'undefined',
      webgl: !!document.createElement('canvas').getContext('webgl')
    };

    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (healthyChecks === totalChecks) {
      status = 'healthy';
    } else if (healthyChecks >= totalChecks * 0.8) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    resolve({
      status,
      checks,
      timestamp: new Date().toISOString()
    });
  });
};

// Initialize deployment logging
if (typeof window !== 'undefined') {
  logDeploymentInfo();
}
