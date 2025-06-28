
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface SecurityHealthData {
  timestamp: string;
  admin_count: number;
  recent_failures: number;
  suspicious_unlimited_users: number;
  critical_issues: string[];
  security_score: number;
}

/**
 * SecurityHealthMonitor provides real-time security health monitoring
 */
export const SecurityHealthMonitor: React.FC = () => {
  const [healthData, setHealthData] = useState<SecurityHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchSecurityHealth = async (showToast = false) => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.rpc('security_health_check');
      
      if (error) throw error;
      
      setHealthData(data);
      
      if (showToast) {
        toast({
          title: "Security Health Updated",
          description: `Security score: ${data.security_score}/100`
        });
      }
    } catch (error: any) {
      console.error('Error fetching security health:', error);
      toast({
        title: "Health Check Failed",
        description: error.message || "Could not fetch security health data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityHealth();
    // Set up periodic health checks every 5 minutes
    const interval = setInterval(() => fetchSecurityHealth(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading security health...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthData) {
    return (
      <Alert className="border-red-500 bg-red-50">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Could not load security health data
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Security Score Card */}
      <Card className={getScoreBg(healthData.security_score)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Security Health Score</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSecurityHealth(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            <span className={getScoreColor(healthData.security_score)}>
              {healthData.security_score}/100
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Last updated: {new Date(healthData.timestamp).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {healthData.critical_issues.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription>
            <div className="space-y-2">
              <strong className="text-red-800">Critical Security Issues:</strong>
              <ul className="list-disc list-inside space-y-1">
                {healthData.critical_issues.map((issue, index) => (
                  <li key={index} className="text-red-700">
                    {issue === 'NO_ADMIN_USERS' && 'No admin users configured'}
                    {issue === 'UNAUTHORIZED_UNLIMITED_USERS' && 'Users with unlimited plans but no payment records'}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.admin_count}</div>
            <Badge variant={healthData.admin_count > 0 ? "default" : "destructive"}>
              {healthData.admin_count > 0 ? "Active" : "None"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Failures</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.recent_failures}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Users</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.suspicious_unlimited_users}</div>
            <Badge variant={healthData.suspicious_unlimited_users === 0 ? "default" : "destructive"}>
              {healthData.suspicious_unlimited_users === 0 ? "None" : "Found"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      {healthData.security_score >= 80 && healthData.critical_issues.length === 0 && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Security Status: Excellent</strong> - All security checks are passing
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
