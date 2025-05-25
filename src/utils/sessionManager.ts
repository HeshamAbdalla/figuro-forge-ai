
import { supabase } from "@/integrations/supabase/client";
import { debugger } from "./debugUtils";

export interface SessionHealth {
  isValid: boolean;
  hasUser: boolean;
  hasProfile: boolean;
  tokenExpiry: number | null;
  issues: string[];
}

export class SessionManager {
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private lastProfileFetch: number = 0;
  private profileCache: any = null;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  public async initializeSession(): Promise<SessionHealth> {
    const initStart = performance.now();
    console.log('🚀 [SESSION-MANAGER] Initializing session...');
    
    try {
      // Test network latency first
      await debugger.testNetworkLatency();
      
      // Verify session configuration
      const debugInfo = debugger.verifySessionConfiguration();
      console.log('🔧 [SESSION-MANAGER] Debug info:', debugInfo);
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        debugger.logSessionError(error, 'Session initialization');
        throw error;
      }
      
      const health = await this.checkSessionHealth(session);
      console.log('✅ [SESSION-MANAGER] Session health:', health);
      
      // Start monitoring if session is valid
      if (health.isValid) {
        this.startSessionMonitoring();
      }
      
      console.log('🚀 [SESSION-MANAGER] Initialization completed in', performance.now() - initStart, 'ms');
      return health;
      
    } catch (error) {
      debugger.logSessionError(error, 'Session initialization failed');
      throw error;
    }
  }

  public async checkSessionHealth(session: any): Promise<SessionHealth> {
    const health: SessionHealth = {
      isValid: false,
      hasUser: false,
      hasProfile: false,
      tokenExpiry: null,
      issues: []
    };
    
    if (!session) {
      health.issues.push('No session found');
      return health;
    }
    
    if (!session.user) {
      health.issues.push('No user in session');
      return health;
    }
    
    health.hasUser = true;
    health.tokenExpiry = session.expires_at ? new Date(session.expires_at * 1000).getTime() : null;
    
    // Check token expiry
    if (health.tokenExpiry && health.tokenExpiry < Date.now()) {
      health.issues.push('Token expired');
      return health;
    }
    
    // Check profile
    try {
      const profile = await this.getProfile(session.user.id);
      health.hasProfile = !!profile;
      if (!profile) {
        health.issues.push('Profile not found');
      }
    } catch (error) {
      health.issues.push('Profile fetch failed');
      debugger.logSessionError(error, 'Profile health check');
    }
    
    health.isValid = health.hasUser && health.hasProfile && health.issues.length === 0;
    return health;
  }

  public async getProfile(userId: string, forceRefresh = false): Promise<any> {
    const profileStart = performance.now();
    const now = Date.now();
    
    // Return cached profile if valid and not forcing refresh
    if (!forceRefresh && this.profileCache && (now - this.lastProfileFetch) < this.cacheTimeout) {
      console.log('💾 [SESSION-MANAGER] Returning cached profile');
      debugger.trackProfileLoadPerformance(profileStart, true, this.profileCache);
      return this.profileCache;
    }
    
    try {
      console.log('🔄 [SESSION-MANAGER] Fetching fresh profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        debugger.logSessionError(error, 'Profile fetch');
        debugger.trackProfileLoadPerformance(profileStart, false);
        throw error;
      }
      
      // Update cache
      this.profileCache = data;
      this.lastProfileFetch = now;
      
      console.log('✅ [SESSION-MANAGER] Profile fetched successfully');
      debugger.trackProfileLoadPerformance(profileStart, true, data);
      
      return data;
      
    } catch (error) {
      debugger.logSessionError(error, 'Profile fetch failed');
      debugger.trackProfileLoadPerformance(profileStart, false);
      throw error;
    }
  }

  private startSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    
    // Check session health every 2 minutes
    this.sessionCheckInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const health = await this.checkSessionHealth(session);
        
        if (!health.isValid) {
          console.warn('⚠️ [SESSION-MANAGER] Session health issues:', health.issues);
        }
        
        // Monitor memory usage
        if ((performance as any).memory) {
          const memory = (performance as any).memory;
          const usageMB = memory.usedJSHeapSize / 1024 / 1024;
          
          if (usageMB > 100) { // Alert if over 100MB
            console.warn('⚠️ [SESSION-MANAGER] High memory usage:', usageMB.toFixed(2), 'MB');
          }
        }
        
      } catch (error) {
        debugger.logSessionError(error, 'Session monitoring');
      }
    }, 2 * 60 * 1000);
  }

  public clearCache(): void {
    this.profileCache = null;
    this.lastProfileFetch = 0;
    console.log('🧹 [SESSION-MANAGER] Cache cleared');
  }

  public destroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
    this.clearCache();
    console.log('🔴 [SESSION-MANAGER] Session manager destroyed');
  }

  public getPerformanceReport(): any {
    return {
      sessionManager: {
        cacheAge: this.lastProfileFetch ? Date.now() - this.lastProfileFetch : null,
        hasCachedProfile: !!this.profileCache,
        isMonitoring: !!this.sessionCheckInterval
      },
      debugger: debugger.getPerformanceReport()
    };
  }
}

export const sessionManager = new SessionManager();
