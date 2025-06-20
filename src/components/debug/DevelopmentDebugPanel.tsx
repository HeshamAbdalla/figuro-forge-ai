
import React, { useState, useEffect } from "react";
import { logger, logManager } from "@/utils/logLevelManager";
import { globalPerformanceMonitor } from "@/components/model-viewer/utils/performanceMonitor";

interface DebugPanelProps {
  visible?: boolean;
}

const DevelopmentDebugPanel: React.FC<DebugPanelProps> = ({ visible = false }) => {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(Date.now());
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [performanceStats, setPerformanceStats] = useState({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0
  });

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !visible) {
    return null;
  }

  // Track renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    setLastRenderTime(Date.now());
  });

  // Update debug info periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentLogs(logManager.getRecentLogs(10));
      setPerformanceStats(globalPerformanceMonitor.getStats());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = () => {
    logManager.clearBuffer();
    setRecentLogs([]);
  };

  const handleSetLogLevel = (level: string) => {
    logManager.setLevel(level as any);
    logger.info(`Log level changed to: ${level}`, 'debug-panel');
  };

  const getRenderFrequency = () => {
    const timeSinceLastRender = Date.now() - lastRenderTime;
    return timeSinceLastRender < 100 ? 'HIGH' : timeSinceLastRender < 1000 ? 'MEDIUM' : 'LOW';
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

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/95 text-white p-4 rounded-lg font-mono text-xs max-w-sm">
      <div className="space-y-2">
        <div className="text-figuro-accent font-bold border-b border-white/20 pb-1">
          🔧 Development Debug Panel
        </div>
        
        {/* Render Stats */}
        <div className="space-y-1">
          <div className="text-white/60">Render Stats:</div>
          <div className="text-white/80">Count: {renderCount}</div>
          <div className={`${getRenderFrequency() === 'HIGH' ? 'text-red-400' : 'text-white/80'}`}>
            Frequency: {getRenderFrequency()}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="space-y-1 border-t border-white/20 pt-2">
          <div className="text-white/60">Performance:</div>
          <div className={getFpsColor(performanceStats.fps)}>
            FPS: {performanceStats.fps.toFixed(1)}
          </div>
          <div className={getMemoryColor(performanceStats.memoryUsage)}>
            Memory: {performanceStats.memoryUsage.toFixed(1)}MB
          </div>
          <div className="text-white/80">
            Render: {performanceStats.renderTime.toFixed(1)}ms
          </div>
        </div>

        {/* Log Level Control */}
        <div className="space-y-1 border-t border-white/20 pt-2">
          <div className="text-white/60">Log Level:</div>
          <select 
            value={logManager.getLevel()} 
            onChange={(e) => handleSetLogLevel(e.target.value)}
            className="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs"
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
            <div className="text-white/60">Recent Logs:</div>
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
          </div>
        </div>

        {/* Warnings */}
        {getRenderFrequency() === 'HIGH' && (
          <div className="bg-red-600/20 border border-red-600/40 rounded p-2 mt-2">
            <div className="text-red-400 text-xs font-bold">⚠️ HIGH RENDER FREQUENCY</div>
            <div className="text-red-300 text-xs">Component is re-rendering too often</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevelopmentDebugPanel;
