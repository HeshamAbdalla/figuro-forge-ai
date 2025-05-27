
import { useState } from 'react';
import { ConversionProgress } from '../types/conversion';

export const useConversionProgress = () => {
  const [progress, setProgress] = useState<ConversionProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const updateProgress = (newProgress: Partial<ConversionProgress>) => {
    setProgress(prev => ({ ...prev, ...newProgress }));
  };

  const resetProgress = () => {
    setProgress({
      status: 'idle',
      progress: 0,
      message: ''
    });
  };

  return {
    progress,
    updateProgress,
    resetProgress
  };
};
