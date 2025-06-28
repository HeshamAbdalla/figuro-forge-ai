
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Shield, Activity, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  success: boolean;
  created_at: string;
  event_details: any;
}

interface SecurityStats {
  totalEvents: number;
  failedEvents: number;
  successRate: number;
  recentActivity: SecurityEvent[];
}

/**
 * SecurityDashboard provides user-level security monitoring
 */
export const SecurityDashboard: React.FC = () => {
  const { user } = useEnhancedAuth();
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchSecurityStats = async (showToast = false) => {
    if (!user) return;

    try {
      setRefreshing(true);

      // Fetch user's security events
      const { data: events, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const totalEvents = events?.length || 0;
      const failedEvents = events?.filter(e => !e.success).length || 0;
      const successRate = totalEvents > 0 ? ((totalEvents - failedEvents) / totalEvents) * 100 : 100;

      setSecurityStats({
        totalEvents,
        failedEvents,
        successRate,
        recentActivity: events?.slice(0, 10) || []
      });

      if (showToast) {
        toast({
          title: "Security Data Refreshed",
          description: `Found ${totalEvents} security events`
        });
      }
    } catch (error: any) {
      console.error('Error fetching security stats:', error);
      toast({
        title: "Failed to Load Security Data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getEventIcon = (eventType: string, success: boolean) => {
    if (!success) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    
    switch (eventType) {
      case 'user_session_active':
      case 'user_signin':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'checkout_session_created':
      case 'payment_verified':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventDescription = (event: SecurityEvent) => {
    const baseDescription = event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (event.event_details) {
      if (event.event_details.plan) {
        return `${baseDescription} (${event.event_details.plan} plan)`;
      }
      if (event.event_details.sessionValid !== undefined) {
        return `${baseDescription} (${event.event_details.sessionValid ? 'Valid' : 'Invalid'} session)`;
      }
    }
    
    return baseDescription;
  };

  useEffect(() => {
    fetchSecurityStats();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading security data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!securityStats) {
    return (
      <Alert className="border-red-500 bg-red-50">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Could not load security data
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Security events logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {securityStats.failedEvents} failed events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={securityStats.failedEvents === 0 ? "default" : "destructive"}>
                {securityStats.failedEvents === 0 ? "Secure" : "Alert"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Current security status</p>
          </CardContent>
        </Card>
      </div>

      {/* Failed Events Alert */}
      {securityStats.failedEvents > 0 && (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Security Alert:</strong> {securityStats.failedEvents} failed security events detected. 
            Please review your recent activity below.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Security Activity</CardTitle>
            <CardDescription>
              Your latest security events and authentication activities
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSecurityStats(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {securityStats.recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No security events found
            </p>
          ) : (
            <div className="space-y-3">
              {securityStats.recentActivity.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.event_type, event.success)}
                    <div>
                      <p className="font-medium">{getEventDescription(event)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={event.success ? "default" : "destructive"}>
                    {event.success ? "Success" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Your account is being monitored:</strong> All authentication and payment activities are logged for security.
              </AlertDescription>
            </Alert>
            
            {securityStats.failedEvents > 0 && (
              <Alert className="border-orange-500 bg-orange-50">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Action Required:</strong> Review failed security events and ensure your account hasn't been compromised.
                </AlertDescription>
              </Alert>
            )}
            
            <Alert>
              <Clock className="w-4 h-4" />
              <AlertDescription>
                Security events are retained for 90 days. Older events are automatically cleaned up.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
