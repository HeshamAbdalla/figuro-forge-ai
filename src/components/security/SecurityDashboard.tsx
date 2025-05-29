import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Activity, RefreshCw } from 'lucide-react';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEventFromDB {
  id: string;
  event_type: string;
  event_details: any;
  created_at: string;
  success: boolean;
  ip_address: string | null;
  user_agent: string;
  user_id: string;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  event_details: any;
  created_at: string;
  success: boolean;
  ip_address?: string;
}

export function SecurityDashboard() {
  const { user, securityScore } = useEnhancedAuth();
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSecurityEvents = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transform the data to match our SecurityEvent interface
      const transformedEvents: SecurityEvent[] = (data || []).map((event: SecurityEventFromDB) => ({
        id: event.id,
        event_type: event.event_type,
        event_details: event.event_details,
        created_at: event.created_at,
        success: event.success,
        ip_address: event.ip_address || undefined
      }));
      
      setRecentEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
  }, [user]);

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getEventIcon = (eventType: string, success: boolean) => {
    if (!success) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    
    switch (eventType) {
      case 'signin_success':
      case 'signup_success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'auth_refresh_success':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!user) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Please sign in to view your security dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Score Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getSecurityScoreColor(securityScore)}>
                {securityScore}/100
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {getSecurityScoreLabel(securityScore)} security level
            </p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    securityScore >= 80 ? 'bg-green-600' :
                    securityScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${securityScore}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Verified</span>
                <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                  {user.email_confirmed_at ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Phone Verified</span>
                <Badge variant={user.phone_confirmed_at ? "default" : "secondary"}>
                  {user.phone_confirmed_at ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">2FA Enabled</span>
                <Badge variant="secondary">Not Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>
              Your latest authentication and security activities
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSecurityEvents}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No security events found
            </div>
          ) : (
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  {getEventIcon(event.event_type, event.success)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {formatEventType(event.event_type)}
                      </p>
                      <Badge variant={event.success ? "default" : "destructive"}>
                        {event.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                    {event.ip_address && (
                      <p className="text-xs text-muted-foreground">
                        IP: {event.ip_address}
                      </p>
                    )}
                    {event.event_details && Object.keys(event.event_details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-blue-600">
                          View Details
                        </summary>
                        <pre className="text-xs mt-1 p-2 bg-gray-50 rounded overflow-auto">
                          {JSON.stringify(event.event_details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
          <CardDescription>
            Improve your account security with these suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!user.email_confirmed_at && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Verify your email address to improve account security and unlock full features.
                </AlertDescription>
              </Alert>
            )}
            
            {!user.phone_confirmed_at && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Add and verify a phone number for enhanced account security and recovery options.
                </AlertDescription>
              </Alert>
            )}
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Regularly review your security events and report any suspicious activity.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
