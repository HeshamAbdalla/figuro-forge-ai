
export interface DebugMetrics {
  sessionInitTime: number;
  profileLoadTime: number;
  memoryUsage: number;
  errorCount: number;
  timestamp: number;
}

export interface SessionDebugInfo {
  sessionExists: boolean;
  sessionValid: boolean;
  userExists: boolean;
  profileExists: boolean;
  storageKeys: string[];
  cacheState: any;
}

export class SessionProfileDebugger {
  private metrics: DebugMetrics[] = [];
  private maxMetrics = 100;

  // Session verification methods
  public verifySessionConfiguration(): SessionDebugInfo {
    const sessionStart = performance.now();
    
    console.log('🔍 [SESSION-DEBUG] Starting session verification...');
    
    const storageKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('auth') || key.includes('session')
    );
    
    const debugInfo: SessionDebugInfo = {
      sessionExists: false,
      sessionValid: false,
      userExists: false,
      profileExists: false,
      storageKeys,
      cacheState: null
    };
    
    console.log('🔍 [SESSION-DEBUG] Storage keys found:', storageKeys);
    console.log('🔍 [SESSION-DEBUG] Session verification completed in', performance.now() - sessionStart, 'ms');
    
    return debugInfo;
  }

  public trackProfileLoadPerformance(startTime: number, success: boolean, profileData?: any): void {
    const loadTime = performance.now() - startTime;
    const memoryUsage = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    
    const metric: DebugMetrics = {
      sessionInitTime: 0,
      profileLoadTime: loadTime,
      memoryUsage,
      errorCount: success ? 0 : 1,
      timestamp: Date.now()
    };
    
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
    
    console.log('📊 [PROFILE-DEBUG] Load time:', loadTime.toFixed(2), 'ms');
    console.log('📊 [PROFILE-DEBUG] Memory usage:', (memoryUsage / 1024 / 1024).toFixed(2), 'MB');
    console.log('📊 [PROFILE-DEBUG] Success:', success);
    
    if (profileData) {
      console.log('📊 [PROFILE-DEBUG] Profile data:', {
        hasId: !!profileData.id,
        hasName: !!profileData.full_name,
        hasAvatar: !!profileData.avatar_url,
        plan: profileData.plan
      });
    }
  }

  public logSessionError(error: any, context: string): void {
    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('🚨 [SESSION-ERROR]', context, errorInfo);
    
    // Store error for later analysis
    const errors = JSON.parse(localStorage.getItem('session_errors') || '[]');
    errors.push(errorInfo);
    if (errors.length > 50) errors.shift();
    localStorage.setItem('session_errors', JSON.stringify(errors));
  }

  public getPerformanceReport(): any {
    const avgProfileLoad = this.metrics.reduce((sum, m) => sum + m.profileLoadTime, 0) / this.metrics.length;
    const avgMemory = this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / this.metrics.length;
    const totalErrors = this.metrics.reduce((sum, m) => sum + m.errorCount, 0);
    
    return {
      averageProfileLoadTime: avgProfileLoad,
      averageMemoryUsage: avgMemory / 1024 / 1024, // MB
      totalErrors,
      metricsCount: this.metrics.length,
      lastMetrics: this.metrics.slice(-5)
    };
  }

  public monitorConcurrentSessions(): void {
    const tabId = Date.now().toString();
    const activeTabsKey = 'active_tabs';
    
    // Register this tab
    const activeTabs = JSON.parse(localStorage.getItem(activeTabsKey) || '[]');
    activeTabs.push({ id: tabId, timestamp: Date.now() });
    localStorage.setItem(activeTabsKey, JSON.stringify(activeTabs));
    
    console.log('👥 [SESSION-DEBUG] Active tabs:', activeTabs.length);
    
    // Cleanup old tabs (older than 5 minutes)
    const cleanupInterval = setInterval(() => {
      const currentTabs = JSON.parse(localStorage.getItem(activeTabsKey) || '[]');
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const validTabs = currentTabs.filter((tab: any) => tab.timestamp > fiveMinutesAgo);
      localStorage.setItem(activeTabsKey, JSON.stringify(validTabs));
    }, 60000);
    
    // Cleanup on tab close
    window.addEventListener('beforeunload', () => {
      clearInterval(cleanupInterval);
      const currentTabs = JSON.parse(localStorage.getItem(activeTabsKey) || '[]');
      const filteredTabs = currentTabs.filter((tab: any) => tab.id !== tabId);
      localStorage.setItem(activeTabsKey, JSON.stringify(filteredTabs));
    });
  }

  public testNetworkLatency(): Promise<number> {
    return new Promise((resolve) => {
      const start = performance.now();
      fetch('/favicon.ico', { cache: 'no-cache' })
        .then(() => {
          const latency = performance.now() - start;
          console.log('🌐 [NETWORK-DEBUG] Latency:', latency.toFixed(2), 'ms');
          resolve(latency);
        })
        .catch(() => {
          console.log('🌐 [NETWORK-DEBUG] Network test failed');
          resolve(-1);
        });
    });
  }
}

export const sessionDebugger = new SessionProfileDebugger();
