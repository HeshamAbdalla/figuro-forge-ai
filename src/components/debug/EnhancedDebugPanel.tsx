
import React, { useState, useEffect, useRef, useCallback } from "react";
import { logger, logManager } from "@/utils/logLevelManager";
import { globalPerformanceMonitor } from "@/components/model-viewer/utils/performanceMonitor";

interface EnhancedDebugPanelProps {
  visible?: boolean;
}

const EnhancedDebugPanel: React.FC<EnhancedDebugPanelProps> = ({ visible = false }) => {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(Date.now());
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [performanceStats, setPerformanceStats] = useState({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0
  });
  const [renderHistory, setRenderHistory] = useState<number[]>([]);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  
  // Performance tracking refs
  const updateIntervalRef = useRef<NodeJS.Timeout>();
  const renderTimeRef = useRef(Date.now());
  const componentMountTimeRef = useRef(Date.now());

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !visible) {
    return null;
  }

  // Track renders with performance impact analysis
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRender = now - renderTimeRef.current;
    
    setRenderCount(prev => prev + 1);
    setLastRenderTime(now);
    
    // Track render frequency history
    setRenderHistory(prev => {
      const newHistory = [...prev, timeSinceLastRender].slice(-10); // Keep last 10 renders
      return newHistory;
    });
    
    renderTimeRef.current = now;
    
    // Log excessive rendering
    if (timeSinceLastRender < 16) { // Faster than 60fps
      logger.warn('EnhancedDebugPanel: Excessive render frequency detected', 'debug-panel-perf', {
        timeSinceLastRender,
        renderCount
      });
    }
  });

  // Optimized update function with performance monitoring
  const updateDebugInfo = useCallback(() => {
    try {
      // Update logs
      const logs = logManager.getRecentLogs(10);
      setRecentLogs(logs);
      
      // Update performance stats
      const stats = globalPerformanceMonitor.getStats();
      setPerformanceStats(stats);
      
      // Log performance issues
      if (stats.fps < 30 && stats.fps > 0) {
        logger.warn('EnhancedDebugPanel: Low FPS detected', 'debug-panel-perf', { fps: stats.fps });
      }
      
      if (stats.memoryUsage > 100) {
        logger.warn('EnhancedDebugPanel: High memory usage detected', 'debug-panel-perf', { 
          memoryUsage: stats.memoryUsage 
        });
      }
    } catch (error) {
      logger.error('EnhancedDebugPanel: Error updating debug info', 'debug-panel-perf', error);
    }
  }, []);

  // Throttled update interval
  useEffect(() => {
    updateIntervalRef.current = setInterval(updateDebugInfo, 2000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [updateDebugInfo]);

  const handleClearLogs = useCallback(() => {
    logManager.clearBuffer();
    setRecentLogs([]);
    logger.info('EnhancedDebugPanel: Logs cleared', 'debug-panel');
  }, []);

  const handleSetLogLevel = useCallback((level: string) => {
    logManager.setLevel(level as any);
    logger.info(`EnhancedDebugPanel: Log level changed to: ${level}`, 'debug-panel');
  }, []);

  const handleResetRenderCount = useCallback(() => {
    setRenderCount(0);
    setRenderHistory([]);
    componentMountTimeRef.current = Date.now();
    logger.info('EnhancedDebugPanel: Render count reset', 'debug-panel');
  }, []);

  // Performance analysis functions
  const getRenderFrequency = () => {
    const timeSinceLastRender = Date.now() - lastRenderTime;
    if (timeSinceLastRender < 50) return 'CRITICAL';
    if (timeSinceLastRender < 100) return 'HIGH';
    if (timeSinceLastRender < 1000) return 'MEDIUM';
    return 'LOW';
  };

  const getAverageRenderInterval = () => {
    if (renderHistory.length < 2) return 0;
    const sum = renderHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / renderHistory.length);
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 50) return 'text-green-400';
    if (memory < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getFpsColor = (fps: number) => {
    if (fps >= 50) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRenderFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'CRITICAL': return 'text-red-500 animate-pulse';
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const componentAge = Math.round((Date.now() - componentMountTimeRef.current) / 1000);
  const renderRate = componentAge > 0 ? (renderCount / componentAge).toFixed(1) : '0';

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/95 text-white rounded-lg font-mono text-xs max-w-sm border border-white/20">
      {/* Header */}
      <div 
        className="p-3 cursor-pointer border-b border-white/20 flex justify-between items-center"
        onClick={() => setIsPanelExpanded(!isPanelExpanded)}
      >
        <div className="text-figuro-accent font-bold">
          🔧 Enhanced Debug Panel
        </div>
        <div className="text-white/60">
          {isPanelExpanded ? '▼' : '▲'}
        </div>
      </div>
      
      {isPanelExpanded && (
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          {/* Render Performance Analysis */}
          <div className="space-y-1">
            <div className="text-white/60 font-semibold">Render Analysis:</div>
            <div className="flex justify-between">
              <span className="text-white/80">Count:</span>
              <span className="text-white">{renderCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Rate:</span>
              <span className="text-white">{renderRate}/sec</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Frequency:</span>
              <span className={getRenderFrequencyColor(getRenderFrequency())}>
                {getRenderFrequency()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Avg Interval:</span>
              <span className="text-white">{getAverageRenderInterval()}ms</span>
            </div>
            <button 
              onClick={handleResetRenderCount}
              className="text-xs bg-blue-600/20 hover:bg-blue-600/40 px-2 py-0.5 rounded mt-1"
            >
              Reset Count
            </button>
          </div>

          {/* Performance Stats */}
          <div className="space-y-1 border-t border-white/20 pt-2">
            <div className="text-white/60 font-semibold">Performance:</div>
            <div className="flex justify-between">
              <span className="text-white/80">FPS:</span>
              <span className={getFpsColor(performanceStats.fps)}>
                {performanceStats.fps.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Memory:</span>
              <span className={getMemoryColor(performanceStats.memoryUsage)}>
                {performanceStats.memoryUsage.toFixed(1)}MB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Render Time:</span>
              <span className="text-white">{performanceStats.renderTime.toFixed(1)}ms</span>
            </div>
          </div>

          {/* Log Level Control */}
          <div className="space-y-1 border-t border-white/20 pt-2">
            <div className="text-white/60 font-semibold">Log Control:</div>
            <select 
              value={logManager.getLevel()} 
              onChange={(e) => handleSetLogLevel(e.target.value)}
              className="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs w-full"
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
              <option value="silent">Silent</option>
            </select>
          </div>

          {/* Recent Logs */}
          <div className="space-y-1 border-t border-white/20 pt-2">
            <div className="flex justify-between items-center">
              <div className="text-white/60 font-semibold">Recent Logs:</div>
              <button 
                onClick={handleClearLogs}
                className="text-xs bg-red-600/20 hover:bg-red-600/40 px-2 py-0.5 rounded"
              >
                Clear
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-0.5">
              {recentLogs.slice(-5).map((log, index) => (
                <div key={index} className="text-xs">
                  <span className={`${
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warn' ? 'text-yellow-400' :
                    log.level === 'info' ? 'text-blue-400' :
                    'text-white/60'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-white/80 ml-1">
                    {log.message.substring(0, 40)}...
                  </span>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <div className="text-white/40 text-xs">No recent logs</div>
              )}
            </div>
          </div>

          {/* Performance Warnings */}
          {(getRenderFrequency() === 'CRITICAL' || getRenderFrequency() === 'HIGH') && (
            <div className="bg-red-600/20 border border-red-600/40 rounded p-2 mt-2">
              <div className="text-red-400 text-xs font-bold">⚠️ PERFORMANCE ALERT</div>
              <div className="text-red-300 text-xs">
                {getRenderFrequency() === 'CRITICAL' ? 
                  'Critical render frequency detected! Component may be in render loop.' :
                  'High render frequency detected. Check for unnecessary re-renders.'
                }
              </div>
              <div className="text-red-300 text-xs mt-1">
                Rate: {renderRate} renders/sec
              </div>
            </div>
          )}
          
          {performanceStats.memoryUsage > 100 && (
            <div className="bg-yellow-600/20 border border-yellow-600/40 rounded p-2 mt-2">
              <div className="text-yellow-400 text-xs font-bold">⚠️ MEMORY WARNING</div>
              <div className="text-yellow-300 text-xs">
                High memory usage detected: {performanceStats.memoryUsage.toFixed(1)}MB
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedDebugPanel;
