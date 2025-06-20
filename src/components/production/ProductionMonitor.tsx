
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { globalPerformanceMonitor } from '../model-viewer/utils/performanceMonitor';
import { webGLContextTracker } from '../model-viewer/utils/resourceManager';

interface ProductionMonitorProps {
  enableErrorReporting?: boolean;
  enablePerformanceTracking?: boolean;
}

/**
 * Production-ready monitoring component that tracks critical issues
 * without exposing debug information to end users
 */
export const ProductionMonitor: React.FC<ProductionMonitorProps> = ({
  enableErrorReporting = true,
  enablePerformanceTracking = false
}) => {
  useEffect(() => {
    if (!enableErrorReporting && !enablePerformanceTracking) return;

    let performanceCheckInterval: NodeJS.Timeout | null = null;

    // Track critical performance issues that affect user experience
    if (enablePerformanceTracking) {
      const handleCriticalPerformance = (stats: any) => {
        // Only alert on severe performance degradation
        if (stats.fps < 15) {
          toast.error('Performance issue detected. Refreshing may help improve performance.');
        }
        
        if (stats.memoryUsage > 500) {
          toast.warning('High memory usage detected. Consider closing other browser tabs.');
        }
      };

      globalPerformanceMonitor.addCallback(handleCriticalPerformance);
      globalPerformanceMonitor.start();

      // Check WebGL context limits periodically
      performanceCheckInterval = setInterval(() => {
        if (webGLContextTracker.isNearingLimit()) {
          toast.warning('Too many 3D models loaded. Some models may not display properly.');
        }
      }, 30000); // Check every 30 seconds

      // Global error handling for unhandled errors
      if (enableErrorReporting) {
        const handleUnhandledError = (event: ErrorEvent) => {
          // Only show user-friendly messages for critical errors
          if (event.error?.message?.includes('WebGL') || 
              event.error?.message?.includes('3D') ||
              event.error?.message?.includes('model')) {
            toast.error('Unable to display 3D content. Please refresh the page or try a different browser.');
          }
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
          // Handle critical promise rejections
          if (event.reason?.message?.includes('network') ||
              event.reason?.message?.includes('fetch')) {
            toast.error('Network error occurred. Please check your connection and try again.');
          }
        };

        window.addEventListener('error', handleUnhandledError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
          window.removeEventListener('error', handleUnhandledError);
          window.removeEventListener('unhandledrejection', handleUnhandledRejection);
          
          if (enablePerformanceTracking) {
            globalPerformanceMonitor.removeCallback(handleCriticalPerformance);
            globalPerformanceMonitor.stop();
            
            if (performanceCheckInterval) {
              clearInterval(performanceCheckInterval);
            }
          }
        };
      }
    }
  }, [enableErrorReporting, enablePerformanceTracking]);

  // This component doesn't render anything visible
  return null;
};

export default ProductionMonitor;
