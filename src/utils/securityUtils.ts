
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
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_user_id: user?.id || null,
        p_ip_address: this.ipAddress,
        p_endpoint: endpoint,
        p_limit: limit,
        p_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false;
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
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
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
