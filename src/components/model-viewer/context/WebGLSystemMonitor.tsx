
import React, { useState, useEffect } from 'react';
import { smartWebGLManager } from './SmartWebGLManager';
import { smartBatchLoader } from './SmartBatchLoader';
import { modelQueueManager } from '../utils/modelQueueManager';

interface WebGLSystemMonitorProps {
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const WebGLSystemMonitor: React.FC<WebGLSystemMonitorProps> = ({ 
  visible = true, 
  position = 'bottom-right' 
}) => {
  const [contextStats, setContextStats] = useState(smartWebGLManager.getStats());
  const [batchStats, setBatchStats] = useState(smartBatchLoader.getStats());
  const [queueStats, setQueueStats] = useState(modelQueueManager.getQueueStats());
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [isHealthy, setIsHealthy] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setContextStats(smartWebGLManager.getStats());
      setBatchStats(smartBatchLoader.getStats());
      setQueueStats(modelQueueManager.getQueueStats());

      // Check memory usage if available
      if (typeof performance !== 'undefined' && performance.memory) {
        const memoryUsageMB = performance.memory.usedJSHeapSize / (1024 * 1024);
        setMemoryUsage(memoryUsageMB);
      }

      // Determine system health
      const healthy = contextStats.canCreate && 
                     contextStats.queued < 5 && 
                     batchStats.pending < 10 &&
                     memoryUsage < 500;
      setIsHealthy(healthy);
    }, 1000);

    return () => clearInterval(interval);
  }, [contextStats.canCreate, contextStats.queued, batchStats.pending, memoryUsage]);

  if (!visible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 bg-black/90 text-white p-3 rounded-lg text-xs font-mono space-y-1 border border-white/20 backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
        <span className="font-semibold">WebGL System</span>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="text-blue-300">
          <span className="text-white/60">Contexts:</span> {contextStats.active}/{contextStats.max}
        </div>
        <div className="text-blue-300">
          <span className="text-white/60">Queue:</span> {contextStats.queued}
        </div>
        <div className="text-yellow-300">
          <span className="text-white/60">Batch:</span> {batchStats.pending}P/{batchStats.active}A
        </div>
        <div className="text-green-300">
          <span className="text-white/60">Models:</span> {queueStats.loading}L/{queueStats.queued}Q
        </div>
        {memoryUsage > 0 && (
          <div className={`${memoryUsage > 400 ? 'text-red-300' : 'text-green-300'}`}>
            <span className="text-white/60">Memory:</span> {memoryUsage.toFixed(1)}MB
          </div>
        )}
        <div className="text-xs text-white/50 pt-1">
          Status: {isHealthy ? 'Healthy' : 'Degraded'}
        </div>
      </div>
    </div>
  );
};

export default WebGLSystemMonitor;
