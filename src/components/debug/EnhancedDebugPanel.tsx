
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  const [renderLoopDetected, setRenderLoopDetected] = useState(false);
  
  // Performance tracking refs
  const updateIntervalRef = useRef<NodeJS.Timeout>();
  const renderTimeRef = useRef(Date.now());
  const componentMountTimeRef = useRef(Date.now());
  const renderCountRef = useRef(0);
  const lastRenderCountResetRef = useRef(Date.now());

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !visible) {
    return null;
  }

  // Render loop detection and prevention
  const detectRenderLoop = useCallback(() => {
    const now = Date.now();
    const timeSinceLastReset = now - lastRenderCountResetRef.current;
    
    // If more than 100 renders in 5 seconds, we have a render loop
    if (renderCountRef.current > 100 && timeSinceLastReset < 5000) {
      setRenderLoopDetected(true);
      logger.error('EnhancedDebugPanel: Render loop detected! Disabling updates.', 'debug-panel-critical', {
        renderCount: renderCountRef.current,
        timeWindow: timeSinceLastReset
      });
      return true;
    }
    
    // Reset counter every 10 seconds
    if (timeSinceLastReset > 10000) {
      renderCountRef.current = 0;
      lastRenderCountResetRef.current = now;
      setRenderLoopDetected(false);
    }
    
    return false;
  }, []);

  // Track renders with loop detection
  const trackRender = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRender = now - renderTimeRef.current;
    
    renderCountRef.current++;
    
    // Detect render loop before updating state
    if (detectRenderLoop()) {
      return; // Don't update state if render loop detected
    }
    
    setRenderCount(prev => prev + 1);
    setLastRenderTime(now);
    
    // Track render frequency history (throttled)
    if (timeSinceLastRender > 50) { // Only track if gap > 50ms
      setRenderHistory(prev => {
        const newHistory = [...prev, timeSinceLastRender].slice(-10);
        return newHistory;
      });
    }
    
    renderTimeRef.current = now;
    
    // Log excessive rendering (throttled)
    if (timeSinceLastRender < 16 && renderCountRef.current % 50 === 0) {
      logger.warn('EnhancedDebugPanel: High render frequency', 'debug-panel-perf', {
        timeSinceLastRender,
        renderCount: renderCountRef.current
      });
    }
  }, [detectRenderLoop]);

  // Track renders on every render (but throttled)
  useEffect(() => {
    trackRender();
  }); // Intentionally no dependency array, but now it's safe due to throttling

  // Optimized update function with performance monitoring
  const updateDebugInfo = useCallback(() => {
    if (renderLoopDetected) {
      logger.debug('EnhancedDebugPanel: Skipping update due to render loop detection', 'debug-panel');
      return;
    }

    try {
      // Update logs (throttled)
      const logs = logManager.getRecentLogs(10);
      setRecentLogs(logs);
      
      // Update performance stats
      const stats = globalPerformanceMonitor.getStats();
      setPerformanceStats(stats);
      
      // Log performance issues (throttled)
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
  }, [renderLoopDetected]);

  // Throttled update interval with cleanup
  useEffect(() => {
    if (renderLoopDetected) return;

    updateIntervalRef.current = setInterval(updateDebugInfo, 2000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [updateDebugInfo, renderLoopDetected]);

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
    renderCountRef.current = 0;
    componentMountTimeRef.current = Date.now();
    lastRenderCountResetRef.current = Date.now();
    setRenderLoopDetected(false);
    logger.info('EnhancedDebugPanel: Render count reset', 'debug-panel');
  }, []);

  const handleForceRecovery = useCallback(() => {
    setRenderLoopDetected(false);
    renderCountRef.current = 0;
    lastRenderCountResetRef.current = Date.now();
    logger.info('EnhancedDebugPanel: Forced recovery from render loop', 'debug-panel');
  }, []);

  // Memoized calculations to prevent unnecessary recalculations
  const renderAnalysis = useMemo(() => {
    const timeSinceLastRender = Date.now() - lastRenderTime;
    const componentAge = Math.round((Date.now() - componentMountTimeRef.current) / 1000);
    const renderRate = componentAge > 0 ? (renderCount / componentAge).toFixed(1) : '0';
    
    let frequency = 'LOW';
    if (timeSinceLastRender < 50) frequency = 'CRITICAL';
    else if (timeSinceLastRender < 100) frequency = 'HIGH';
    else if (timeSinceLastRender < 1000) frequency = 'MEDIUM';
    
    const avgInterval = renderHistory.length > 1 
      ? Math.round(renderHistory.reduce((a, b) => a + b, 0) / renderHistory.length)
      : 0;

    return { frequency, renderRate, avgInterval, componentAge };
  }, [lastRenderTime, renderCount, renderHistory]);

  const getPerformanceColor = useCallback((value: number, thresholds: [number, number]) => {
    if (value >= thresholds[1]) return 'text-green-400';
    if (value >= thresholds[0]) return 'text-yellow-400';
    return 'text-red-400';
  }, []);

  const getMemoryColor = useCallback((memory: number) => {
    if (memory < 50) return 'text-green-400';
    if (memory < 100) return 'text-yellow-400';
    return 'text-red-400';
  }, []);

  const getRenderFrequencyColor = useCallback((frequency: string) => {
    switch (frequency) {
      case 'CRITICAL': return 'text-red-500 animate-pulse';
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/95 text-white rounded-lg font-mono text-xs max-w-sm border border-white/20">
      {/* Header */}
      <div 
        className="p-3 cursor-pointer border-b border-white/20 flex justify-between items-center"
        onClick={() => setIsPanelExpanded(!isPanelExpanded)}
      >
        <div className="text-figuro-accent font-bold">
          🔧 Enhanced Debug Panel {renderLoopDetected && '⚠️'}
        </div>
        <div className="text-white/60">
          {isPanelExpanded ? '▼' : '▲'}
        </div>
      </div>
      
      {isPanelExpanded && (
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          {/* Render Loop Warning */}
          {renderLoopDetected && (
            <div className="bg-red-600/20 border border-red-600/40 rounded p-2">
              <div className="text-red-400 text-xs font-bold">🚨 RENDER LOOP DETECTED</div>
              <div className="text-red-300 text-xs">
                Panel updates disabled to prevent performance issues.
              </div>
              <button 
                onClick={handleForceRecovery}
                className="text-xs bg-red-600/20 hover:bg-red-600/40 px-2 py-0.5 rounded mt-1"
              >
                Force Recovery
              </button>
            </div>
          )}

          {/* Render Performance Analysis */}
          <div className="space-y-1">
            <div className="text-white/60 font-semibold">Render Analysis:</div>
            <div className="flex justify-between">
              <span className="text-white/80">Count:</span>
              <span className="text-white">{renderCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Rate:</span>
              <span className="text-white">{renderAnalysis.renderRate}/sec</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Frequency:</span>
              <span className={getRenderFrequencyColor(renderAnalysis.frequency)}>
                {renderAnalysis.frequency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Avg Interval:</span>
              <span className="text-white">{renderAnalysis.avgInterval}ms</span>
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
              <span className={getPerformanceColor(performanceStats.fps, [30, 50])}>
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
          {(renderAnalysis.frequency === 'CRITICAL' || renderAnalysis.frequency === 'HIGH') && !renderLoopDetected && (
            <div className="bg-red-600/20 border border-red-600/40 rounded p-2 mt-2">
              <div className="text-red-400 text-xs font-bold">⚠️ PERFORMANCE ALERT</div>
              <div className="text-red-300 text-xs">
                {renderAnalysis.frequency === 'CRITICAL' ? 
                  'Critical render frequency detected! Component may be in render loop.' :
                  'High render frequency detected. Check for unnecessary re-renders.'
                }
              </div>
              <div className="text-red-300 text-xs mt-1">
                Rate: {renderAnalysis.renderRate} renders/sec
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
