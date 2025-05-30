
import { supabase } from "@/integrations/supabase/client";

export interface SecurityEvent {
  event_type: string;
  event_details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  success?: boolean;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private ipAddress: string | null = null;

  private constructor() {
    // Simplified IP detection
    this.detectIPAddress().catch(() => {
      // Ignore IP detection failures
    });
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private async detectIPAddress(): Promise<void> {
    try {
      const response = await fetch('https://api.ipify.org?format=json', { 
        signal: AbortSignal.timeout(2000) 
      });
      const data = await response.json();
      this.ipAddress = data.ip;
    } catch (error) {
      console.log('IP detection skipped:', error instanceof Error ? error.message : 'Unknown');
    }
  }

  // Simplified security logging that doesn't block
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Don't wait for this - fire and forget
      setTimeout(async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          await supabase.rpc('log_security_event', {
            p_user_id: user?.id || null,
            p_event_type: event.event_type,
            p_event_details: event.event_details || {},
            p_ip_address: this.ipAddress,
            p_user_agent: navigator.userAgent,
            p_success: event.success ?? true
          });
        } catch (error) {
          console.log('Security logging failed (non-blocking):', error);
        }
      }, 0);
    } catch (error) {
      // Ignore all errors
    }
  }

  // Simplified rate limit check
  async checkRateLimit(endpoint: string, limit: number = 100, windowMinutes: number = 60): Promise<boolean> {
    try {
      console.log(`🔍 [SECURITY] Quick rate limit check for ${endpoint}...`);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 1000);
      });
      
      const checkPromise = supabase.rpc('check_rate_limit', {
        p_user_id: user?.id || null,
        p_ip_address: this.ipAddress,
        p_endpoint: endpoint,
        p_limit: limit,
        p_window_minutes: windowMinutes
      });

      const { data, error } = await Promise.race([checkPromise, timeoutPromise]);

      if (error) {
        console.log('⚠️ [SECURITY] Rate limit check failed, allowing:', error.message);
        return true; // Fail open
      }

      const canProceed = data === true;
      console.log(`${canProceed ? '✅' : '❌'} [SECURITY] Rate limit result:`, canProceed);
      return canProceed;
    } catch (error) {
      console.log('⚠️ [SECURITY] Rate limit error, allowing:', error instanceof Error ? error.message : 'Unknown');
      return true; // Always fail open
    }
  }

  sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  detectSuspiciousActivity(user: any, session: any): boolean {
    // Simplified detection - only basic checks
    try {
      const now = new Date();
      const sessionStart = new Date(session?.issued_at || now);
      const timeDiff = now.getTime() - sessionStart.getTime();
      
      // Flag if session is older than 24 hours
      return timeDiff > 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  }
}

export const securityManager = SecurityManager.getInstance();
