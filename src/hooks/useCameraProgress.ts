
import { useState, useEffect } from 'react';

interface CameraProgress {
  status: string;
  progress: number;
  percentage: number;
  message: string;
  taskId?: string;
  thumbnailUrl?: string;
  modelUrl?: string;
}

export const useCameraProgress = (mainProgress: any, displayModelUrl: string | null) => {
  const [cameraProgress, setCameraProgress] = useState<CameraProgress>({
    status: 'idle',
    progress: 0,
    percentage: 0,
    message: 'Ready to capture'
  });

  useEffect(() => {
    if (mainProgress) {
      setCameraProgress({
        status: mainProgress.status || 'idle',
        progress: mainProgress.progress || 0,
        percentage: mainProgress.percentage || 0,
        message: mainProgress.message || 'Processing...',
        taskId: mainProgress.taskId,
        thumbnailUrl: mainProgress.thumbnailUrl,
        modelUrl: mainProgress.modelUrl || displayModelUrl
      });
    }
  }, [mainProgress, displayModelUrl]);

  const resetProgress = () => {
    setCameraProgress({
      status: 'idle',
      progress: 0,
      percentage: 0,
      message: 'Ready to capture'
    });
  };

  return {
    cameraProgress,
    resetProgress
  };
};
