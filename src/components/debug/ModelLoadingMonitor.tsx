import React, { useState, useEffect } from 'react';
import { modelQueueManager } from '../model-viewer/utils/modelQueueManager';

interface ModelLoadingMonitorProps {
  visible?: boolean;
}

export const ModelLoadingMonitor: React.FC<ModelLoadingMonitorProps> = ({ 
  visible = process.env.NODE_ENV === 'development' 
}) => {
  const [stats, setStats] = useState({
    loading: 0,
    queued: 0,
    maxConcurrent: 0,
    totalHistory: 0,
    averageFailureRate: 0,
    memoryUsage: 0,
    queueEfficiency: 0
  });

  useEffect(() => {
    if (!visible) return;

    const updateStats = () => {
      const queueStatus = modelQueueManager.getStatus();
      const performanceStats = modelQueueManager.getPerformanceStats();
      
      setStats({
        ...queueStatus,
        memoryUsage: performanceStats.memoryUsage || 0,
        queueEfficiency: performanceStats.queueEfficiency
      });
    };

    // Update immediately
    updateStats();

    // Update every 2 seconds
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  const getStatusColor = () => {
    if (stats.loading > stats.maxConcurrent) return 'text-red-500';
    if (stats.loading > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono">
      <div className="font-bold mb-2">3D Model Loading Monitor</div>
      <div className="space-y-1">
        <div className={`flex justify-between ${getStatusColor()}`}>
          <span>Loading:</span>
          <span>{stats.loading}/{stats.maxConcurrent}</span>
        </div>
        <div className="flex justify-between">
          <span>Queued:</span>
          <span>{stats.queued}</span>
        </div>
        <div className="flex justify-between">
          <span>Memory:</span>
          <span>{stats.memoryUsage.toFixed(1)}MB</span>
        </div>
        <div className="flex justify-between">
          <span>Efficiency:</span>
          <span className={stats.queueEfficiency > 0.8 ? 'text-green-500' : 'text-yellow-500'}>
            {(stats.queueEfficiency * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Cache:</span>
          <span>{stats.totalHistory}</span>
        </div>
      </div>
    </div>
  );
};