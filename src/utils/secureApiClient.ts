
import { securityManager } from './securityUtils';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  rateLimitEndpoint?: string;
  rateLimitCount?: number;
  rateLimitWindow?: number;
}

export class SecureApiClient {
  private baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  async request(url: string, options: ApiRequestOptions = {}): Promise<Response> {
    const {
      method = 'GET',
      headers = {},
      body,
      rateLimitEndpoint,
      rateLimitCount = 100,
      rateLimitWindow = 60
    } = options;

    // Check rate limit if endpoint specified
    if (rateLimitEndpoint) {
      const canProceed = await securityManager.checkRateLimit(
        rateLimitEndpoint, 
        rateLimitCount, 
        rateLimitWindow
      );
      
      if (!canProceed) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    }

    // Prepare request
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...this.baseHeaders,
        ...headers
      },
      credentials: 'same-origin',
      mode: 'cors'
    };

    if (body && method !== 'GET') {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      // Log security event
      await securityManager.logSecurityEvent({
        event_type: 'api_request',
        event_details: {
          url,
          method,
          status: response.status,
          endpoint: rateLimitEndpoint
        },
        success: response.ok
      });

      return response;
    } catch (error) {
      // Log failed request
      await securityManager.logSecurityEvent({
        event_type: 'api_request_failed',
        event_details: {
          url,
          method,
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: rateLimitEndpoint
        },
        success: false
      });

      throw error;
    }
  }
}

export const secureApiClient = new SecureApiClient();
