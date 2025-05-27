
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2, Box } from 'lucide-react';

interface Generate3DModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: {
    status: 'idle' | 'converting' | 'downloading' | 'completed' | 'error';
    progress: number;
    message: string;
    taskId?: string;
    modelUrl?: string;
    thumbnailUrl?: string;
  };
  onClose: () => void;
}

const Generate3DModal: React.FC<Generate3DModalProps> = ({
  open,
  onOpenChange,
  progress,
  onClose
}) => {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'converting':
      case 'downloading':
        return <Loader2 className="h-8 w-8 animate-spin text-figuro-accent" />;
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Box className="h-8 w-8 text-white/60" />;
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

  const handleClose = () => {
    // Only allow closing if not actively converting or downloading
    if (progress.status !== 'converting' && progress.status !== 'downloading') {
      onClose();
      onOpenChange(false);
    }
  };

  // Prevent closing the modal by clicking outside or escape key during conversion
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && (progress.status === 'converting' || progress.status === 'downloading')) {
      // Don't allow closing during conversion
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-figuro-dark border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <Box className="h-5 w-5" />
            Generate 3D Model
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Icon and Message */}
          <div className="flex flex-col items-center space-y-4 text-center">
            {getStatusIcon()}
            <div>
              <p className={`font-medium ${getStatusColor()}`}>
                {progress.message || 'Preparing 3D generation...'}
              </p>
              {progress.taskId && (
                <p className="text-sm text-white/60 mt-1">
                  Task ID: {progress.taskId}
                </p>
              )}
            </div>
          </div>

          {/* Thumbnail Preview */}
          {progress.thumbnailUrl && (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-white/80">Preview:</p>
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-white/5">
                <img
                  src={progress.thumbnailUrl}
                  alt="3D Model Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.warn('Failed to load thumbnail:', progress.thumbnailUrl);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {(progress.status === 'converting' || progress.status === 'downloading') && (
            <div className="space-y-2">
              <Progress value={progress.progress} className="w-full" />
              <div className="flex justify-between text-sm text-white/60">
                <span>Progress</span>
                <span>{Math.round(progress.progress)}%</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {progress.status === 'error' && (
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-white/10"
              >
                Try Again
              </Button>
            )}
            
            <Button
              onClick={handleClose}
              disabled={progress.status === 'converting' || progress.status === 'downloading'}
              className={
                progress.status === 'completed' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-figuro-accent hover:bg-figuro-accent-hover'
              }
            >
              {progress.status === 'converting' || progress.status === 'downloading' 
                ? 'Generating...' 
                : progress.status === 'completed'
                ? 'Done'
                : 'Close'
              }
            </Button>
          </div>

          {/* Additional Info */}
          {progress.status === 'converting' && (
            <div className="text-center text-sm text-white/60 border-t border-white/10 pt-4">
              <p>This process typically takes 2-5 minutes.</p>
              <p>Please keep this window open.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Generate3DModal;
