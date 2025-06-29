
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRLSPerformance } from '@/hooks/useRLSPerformance';
import { Activity, Shield, Zap, CheckCircle, RefreshCw } from 'lucide-react';

export const RLSPerformanceMonitor: React.FC = () => {
  const { performanceData, loading, error, refreshPerformance } = useRLSPerformance();

  if (loading) {
    return (
      <Card className="bg-figuro-darker/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5" />
            RLS Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-white/70">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Checking performance...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-figuro-darker/50 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5" />
            RLS Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400 text-sm">{error}</div>
          <Button 
            onClick={refreshPerformance}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!performanceData) {
    return null;
  }

  return (
    <Card className="bg-figuro-darker/50 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="w-5 h-5" />
          RLS Performance Monitor
          <Badge 
            className={`ml-auto ${
              performanceData.optimization_status === 'completed' 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}
          >
            {performanceData.optimization_status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/70">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Active Policies</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {performanceData.active_policies}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/70">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Security Functions</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {performanceData.security_functions}
            </div>
          </div>
        </div>

        {/* Performance Improvements */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Optimizations Applied
          </h4>
          <div className="space-y-1">
            {performanceData.performance_improvements.map((improvement, index) => (
              <div key={index} className="text-xs text-white/60 pl-6">
                • {improvement}
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">
              Last checked: {new Date(performanceData.timestamp).toLocaleString()}
            </span>
            <Button 
              onClick={refreshPerformance}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
