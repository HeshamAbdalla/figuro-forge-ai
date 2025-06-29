
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RLSPerformanceMonitor } from './RLSPerformanceMonitor';
import { OptimizedSecurityManager } from '@/utils/optimizedSecurityUtils';
import { Shield, Award, AlertTriangle, CheckCircle, RefreshCw, TrendingUp } from 'lucide-react';

interface OptimizationStatus {
  isOptimized: boolean;
  duplicatePolicies: number;
  performanceScore: number;
  recommendations: string[];
}

export const OptimizedSecurityDashboard: React.FC = () => {
  const [optimizationStatus, setOptimizationStatus] = useState<OptimizationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkOptimizationStatus = async () => {
    try {
      setLoading(true);
      const status = await OptimizedSecurityManager.validateOptimization();
      setOptimizationStatus(status);
    } catch (error) {
      console.error('Failed to check optimization status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkOptimizationStatus();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="bg-figuro-darker/50 border-white/10">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-white/70">Checking optimization status...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Excellent' };
    if (score >= 70) return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Good' };
    return { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Needs Attention' };
  };

  const scoreBadge = optimizationStatus ? getScoreBadge(optimizationStatus.performanceScore) : null;

  return (
    <div className="space-y-6">
      {/* Optimization Status Overview */}
      <Card className="bg-figuro-darker/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="w-5 h-5" />
            RLS Optimization Status
            {optimizationStatus?.isOptimized && (
              <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
                <Award className="w-3 h-3 mr-1" />
                Fully Optimized
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Real-time monitoring of Row Level Security performance optimizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {optimizationStatus && (
            <>
              {/* Performance Score */}
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-white/70" />
                  <span className="text-white/70">Performance Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {optimizationStatus.performanceScore}
                  </span>
                  {scoreBadge && (
                    <Badge className={scoreBadge.color}>
                      {scoreBadge.label}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Duplicate Policies Status */}
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div className="flex items-center gap-2">
                  {optimizationStatus.duplicatePolicies === 0 ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-white/70">Duplicate Policies</span>
                </div>
                <Badge 
                  className={optimizationStatus.duplicatePolicies === 0 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }
                >
                  {optimizationStatus.duplicatePolicies === 0 ? 'Eliminated' : optimizationStatus.duplicatePolicies}
                </Badge>
              </div>

              {/* Recommendations */}
              {optimizationStatus.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    Recommendations
                  </h4>
                  <div className="space-y-1">
                    {optimizationStatus.recommendations.map((recommendation, index) => (
                      <div key={index} className="text-xs text-yellow-300 pl-6">
                        • {recommendation}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {optimizationStatus.isOptimized && optimizationStatus.duplicatePolicies === 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
                    <CheckCircle className="w-4 h-4" />
                    Optimization Complete! 🎉
                  </div>
                  <div className="text-sm text-green-300">
                    Your RLS policies have been fully optimized. You should now experience:
                  </div>
                  <ul className="text-xs text-green-300 mt-2 space-y-1 pl-4">
                    <li>• Up to 90% reduction in query overhead</li>
                    <li>• No more RLS performance warnings</li>
                    <li>• Faster database operations</li>
                    <li>• Improved application responsiveness</li>
                  </ul>
                </div>
              )}

              <Button 
                onClick={checkOptimizationStatus}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detailed Performance Monitor */}
      <RLSPerformanceMonitor />
    </div>
  );
};
