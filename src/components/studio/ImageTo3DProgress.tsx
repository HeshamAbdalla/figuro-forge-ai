
import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Box, Download, Eye, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  onRetry?: () => void;
}

const ImageTo3DProgress: React.FC<ImageTo3DProgressProps> = ({
  isGenerating,
  progress,
  onViewModel,
  onDownload,
  onCancel,
  onRetry
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

  const getStatusBadge = () => {
    switch (progress.status) {
      case 'converting':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Converting</Badge>;
      case 'downloading':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Downloading</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>;
      default:
        return <Badge className="bg-white/20 text-white/60 border-white/30">Processing</Badge>;
    }
  };

  const isProcessing = isGenerating || progress.status === 'converting' || progress.status === 'downloading';
  const isCompleted = progress.status === 'completed' && progress.modelUrl;
  const isError = progress.status === 'error';

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
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-white">Image to 3D Conversion</h3>
                {getStatusBadge()}
              </div>
              <p className={`text-sm ${getStatusColor()}`}>
                {progress.message || 'Processing your image...'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isError && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-white/20 text-white/70 hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            
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

        {/* Thumbnail Preview */}
        {progress.thumbnailUrl && (
          <div className="flex items-center gap-3">
            <img 
              src={progress.thumbnailUrl} 
              alt="Conversion preview"
              className="w-12 h-12 rounded-lg object-cover border border-white/20"
            />
            <div className="text-sm text-white/70">
              <p>Preview thumbnail</p>
              <p className="text-xs text-white/50">Full model will be available when complete</p>
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
              View in 3D
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

        {/* Error state help text */}
        {isError && (
          <div className="text-xs text-red-400/80 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
            <p className="font-medium mb-1">Conversion failed</p>
            <p>The image-to-3D conversion encountered an error. You can try again or check if your image meets the requirements.</p>
          </div>
        )}

        {/* Task ID for debugging */}
        {progress.taskId && (
          <div className="text-xs text-white/40 font-mono">
            Task: {progress.taskId.substring(0, 8)}...
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ImageTo3DProgress;
