
import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Box, Download, Eye } from 'lucide-react';

interface ConversionProgress {
  status: 'idle' | 'converting' | 'downloading' | 'completed' | 'error';
  progress: number;
  message: string;
  taskId?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
}

interface ImageTo3DProgressProps {
  isGenerating: boolean;
  progress: ConversionProgress;
  onViewModel?: (url: string) => void;
  onDownload?: (url: string) => void;
  onCancel?: () => void;
}

const ImageTo3DProgress: React.FC<ImageTo3DProgressProps> = ({
  isGenerating,
  progress,
  onViewModel,
  onDownload,
  onCancel
}) => {
  if (!isGenerating && progress.status === 'idle') {
    return null;
  }

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'converting':
      case 'downloading':
        return <Loader2 className="h-5 w-5 animate-spin text-figuro-accent" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Box className="h-5 w-5 text-white/60" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'converting':
      case 'downloading':
        return 'text-figuro-accent';
      default:
        return 'text-white/80';
    }
  };

  const isProcessing = isGenerating || progress.status === 'converting' || progress.status === 'downloading';
  const isCompleted = progress.status === 'completed' && progress.modelUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-4 backdrop-blur-md border border-white/20"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-medium text-white">3D Model Generation</h3>
              <p className={`text-sm ${getStatusColor()}`}>
                {progress.message || 'Processing...'}
              </p>
            </div>
          </div>
          
          {isProcessing && onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="border-white/20 text-white/70 hover:bg-white/10"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <Progress 
              value={progress.progress} 
              className="w-full"
            />
            <div className="flex justify-between text-sm text-white/60">
              <span>Progress</span>
              <span>{progress.progress}%</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isCompleted && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewModel?.(progress.modelUrl!)}
              className="flex-1 border-white/20 hover:bg-white/10"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Model
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload?.(progress.modelUrl!)}
              className="flex-1 border-white/20 hover:bg-white/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        )}

        {/* Task ID for debugging */}
        {progress.taskId && (
          <div className="text-xs text-white/40 font-mono">
            Task ID: {progress.taskId}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ImageTo3DProgress;
