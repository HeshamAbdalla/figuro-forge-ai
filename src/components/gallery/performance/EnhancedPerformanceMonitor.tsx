
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  MemoryStick, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { intelligentModelCache } from './IntelligentModelCache';
import { advancedMemoryManager } from './AdvancedMemoryManager';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  activeModels: number;
  cacheHitRate: number;
  webglContexts: number;
}

interface EnhancedPerformanceMonitorProps {
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
  onToggleCompact?: () => void;
}

const EnhancedPerformanceMonitor: React.FC<EnhancedPerformanceMonitorProps> = ({
  visible = true,
  position = 'bottom-right',
  compact = false,
  onToggleCompact
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    activeModels: 0,
    cacheHitRate: 0,
    webglContexts: 0
  });
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(!compact);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);

  // Performance monitoring loop
  useEffect(() => {
    if (!visible) return;

    const updateMetrics = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      
      frameCountRef.current++;
      
      if (deltaTime >= 1000) { // Update every second
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
        const frameTime = deltaTime / frameCountRef.current;
        
        // Update FPS history
        fpsHistoryRef.current.push(fps);
        if (fpsHistoryRef.current.length > 30) {
          fpsHistoryRef.current.shift();
        }
        
        // Get memory stats
        const memoryStats = advancedMemoryManager.getMemoryStats();
        const memoryUsage = memoryStats ? memoryStats.used : 0;
        
        // Get cache stats
        const cacheStats = intelligentModelCache.getStats();
        
        // Update metrics
        setMetrics({
          fps,
          frameTime,
          memoryUsage,
          activeModels: 0, // Would be tracked by model manager
          cacheHitRate: cacheStats.hitRate * 100,
          webglContexts: 0 // Would be tracked by context manager
        });
        
        // Check for performance alerts
        const newAlerts: string[] = [];
        
        if (fps < 30) {
          newAlerts.push('Low FPS detected');
        }
        
        if (memoryUsage > 600) {
          newAlerts.push('High memory usage');
        }
        
        if (cacheStats.hitRate < 0.5 && cacheStats.hitRate > 0) {
          newAlerts.push('Low cache hit rate');
        }
        
        setAlerts(newAlerts);
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      requestAnimationFrame(updateMetrics);
    };
    
    const animationId = requestAnimationFrame(updateMetrics);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [visible]);

  const getPositionClasses = () => {
    const baseClasses = "fixed z-50 pointer-events-auto";
    switch (position) {
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'bottom-right':
      default:
        return `${baseClasses} bottom-4 right-4`;
    }
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-400';
    if (value >= thresholds.warning) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryStatusColor = (usage: number) => {
    if (usage < 400) return 'text-green-400';
    if (usage < 600) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!visible) return null;

  return (
    <div className={getPositionClasses()}>
      <Card className="bg-black/80 backdrop-blur-sm border-white/10 text-white min-w-[280px]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              Performance Monitor
            </CardTitle>
            <div className="flex items-center gap-1">
              {alerts.length > 0 && (
                <Badge variant="destructive" className="text-xs px-1">
                  {alerts.length}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0 text-white/60 hover:text-white"
              >
                {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="space-y-3">
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* FPS */}
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Zap size={12} />
                  <span>FPS</span>
                </div>
                <div className={cn("font-mono text-lg", getStatusColor(metrics.fps, { good: 45, warning: 30 }))}>
                  {metrics.fps}
                </div>
                <Progress 
                  value={Math.min(metrics.fps, 60)} 
                  max={60} 
                  className="h-1"
                />
              </div>

              {/* Memory Usage */}
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <MemoryStick size={12} />
                  <span>Memory</span>
                </div>
                <div className={cn("font-mono text-lg", getMemoryStatusColor(metrics.memoryUsage))}>
                  {metrics.memoryUsage.toFixed(0)}MB
                </div>
                <Progress 
                  value={metrics.memoryUsage} 
                  max={800} 
                  className="h-1"
                />
              </div>

              {/* Cache Hit Rate */}
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp size={12} />
                  <span>Cache</span>
                </div>
                <div className={cn("font-mono text-lg", getStatusColor(metrics.cacheHitRate, { good: 70, warning: 50 }))}>
                  {metrics.cacheHitRate.toFixed(0)}%
                </div>
                <Progress 
                  value={metrics.cacheHitRate} 
                  max={100} 
                  className="h-1"
                />
              </div>

              {/* Frame Time */}
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Activity size={12} />
                  <span>Frame</span>
                </div>
                <div className={cn("font-mono text-lg", getStatusColor(33.33 - metrics.frameTime, { good: 16.67, warning: 25 }))}>
                  {metrics.frameTime.toFixed(1)}ms
                </div>
                <Progress 
                  value={Math.min(metrics.frameTime, 50)} 
                  max={50} 
                  className="h-1"
                />
              </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-red-400 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Alerts
                </div>
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs text-red-300">
                    <XCircle size={10} />
                    {alert}
                  </div>
                ))}
              </div>
            )}

            {/* Performance Status */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Status</span>
                <div className="flex items-center gap-1">
                  {alerts.length === 0 ? (
                    <>
                      <CheckCircle size={12} className="text-green-400" />
                      <span className="text-green-400">Good</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={12} className="text-yellow-400" />
                      <span className="text-yellow-400">Issues</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => advancedMemoryManager.forceCleanup()}
                className="h-6 text-xs bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                Clear Cache
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => intelligentModelCache.clear()}
                className="h-6 text-xs bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                Reset Models
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default EnhancedPerformanceMonitor;
