
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sessionManager } from '@/utils/sessionManager';
import { debugger } from '@/utils/debugUtils';

export const PerformanceDashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const refreshData = () => {
    const data = sessionManager.getPerformanceReport();
    setPerformanceData(data);
    console.log('📊 [PERFORMANCE-DASHBOARD] Current metrics:', data);
  };

  useEffect(() => {
    if (isVisible) {
      refreshData();
      const interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [isVisible]);

  // Only show in development or when explicitly enabled
  const shouldShow = process.env.NODE_ENV === 'development' || 
                   localStorage.getItem('debug_mode') === 'true';

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsVisible(!isVisible)}
        variant="outline"
        size="sm"
        className="mb-2"
      >
        {isVisible ? 'Hide' : 'Show'} Debug
      </Button>
      
      {isVisible && (
        <Card className="w-80 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance Dashboard</CardTitle>
            <Button onClick={refreshData} size="sm" variant="outline">
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {performanceData && (
              <>
                <div>
                  <strong>Session Manager:</strong>
                  <div>Cache Age: {performanceData.sessionManager.cacheAge ? 
                    `${(performanceData.sessionManager.cacheAge / 1000).toFixed(1)}s` : 'No cache'}</div>
                  <div>Has Profile: {performanceData.sessionManager.hasCachedProfile ? 'Yes' : 'No'}</div>
                  <div>Monitoring: {performanceData.sessionManager.isMonitoring ? 'Yes' : 'No'}</div>
                </div>
                
                <div>
                  <strong>Performance:</strong>
                  <div>Avg Load Time: {performanceData.debugger.averageProfileLoadTime?.toFixed(2) || 'N/A'}ms</div>
                  <div>Avg Memory: {performanceData.debugger.averageMemoryUsage?.toFixed(2) || 'N/A'}MB</div>
                  <div>Total Errors: {performanceData.debugger.totalErrors}</div>
                  <div>Metrics Count: {performanceData.debugger.metricsCount}</div>
                </div>
                
                <div>
                  <strong>Storage Keys:</strong>
                  <div className="max-h-20 overflow-y-auto text-xs">
                    {Object.keys(localStorage)
                      .filter(key => key.includes('supabase') || key.includes('auth'))
                      .map(key => <div key={key}>{key}</div>)}
                  </div>
                </div>
                
                <div>
                  <strong>Recent Errors:</strong>
                  <div className="max-h-20 overflow-y-auto text-xs">
                    {JSON.parse(localStorage.getItem('session_errors') || '[]')
                      .slice(-3)
                      .map((error: any, index: number) => (
                        <div key={index} className="text-red-600">
                          {error.context}: {error.message}
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
