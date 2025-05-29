
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
    this.detectIPAddress();
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private async detectIPAddress(): Promise<void> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      this.ipAddress = data.ip;
    } catch (error) {
      console.warn('Could not detect IP address:', error);
    }
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
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
      console.error('Failed to log security event:', error);
    }
  }

  async checkRateLimit(endpoint: string, limit: number = 100, windowMinutes: number = 60): Promise<boolean> {
    try {
      console.log(`🔍 [SECURITY] Checking rate limit for ${endpoint} (limit: ${limit}, window: ${windowMinutes}min)...`);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create a timeout promise to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Rate limit check timeout')), 2000);
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
        console.warn('⚠️ [SECURITY] Rate limit check failed, allowing request:', error);
        return true; // Fail open
      }

      const canProceed = data === true;
      console.log(`${canProceed ? '✅' : '❌'} [SECURITY] Rate limit result:`, canProceed);
      return canProceed;
    } catch (error) {
      console.warn('⚠️ [SECURITY] Rate limit check error, allowing request:', error);
      return true; // Fail open to prevent blocking legitimate users
    }
  }

  sanitizeInput(input: string): string {
    // Basic XSS prevention
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
    // Basic suspicious activity detection
    const now = new Date();
    const sessionStart = new Date(session?.issued_at || now);
    const timeDiff = now.getTime() - sessionStart.getTime();
    
    // Flag if session is older than 24 hours
    if (timeDiff > 24 * 60 * 60 * 1000) {
      return true;
    }
    
    // Add more sophisticated checks here
    return false;
  }
}

export const securityManager = SecurityManager.getInstance();
