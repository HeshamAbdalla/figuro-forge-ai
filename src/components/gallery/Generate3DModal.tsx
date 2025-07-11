
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SlideButton } from '@/components/ui/slide-button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2, Box, AlertTriangle } from 'lucide-react';

interface Generate3DModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (config: any) => Promise<void>;
  isGenerating: boolean;
  imageUrl: string | null;
}

const Generate3DModal: React.FC<Generate3DModalProps> = ({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  imageUrl
}) => {
  // Default progress state
  const progress = {
    status: 'idle' as 'idle' | 'converting' | 'downloading' | 'completed' | 'error',
    progress: 0,
    message: 'Ready to generate 3D model',
    taskId: undefined,
    modelUrl: undefined,
    thumbnailUrl: undefined
  };

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
    onOpenChange(false);
  };

  const handleGenerate = () => {
    if (imageUrl) {
      onGenerate({ imageUrl });
    }
  };

  const isProcessing = isGenerating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                {isGenerating ? 'Converting to 3D...' : 'Ready to generate 3D model'}
              </p>
            </div>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-white/80">Source Image:</p>
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-white/5">
                <img
                  src={imageUrl}
                  alt="Source Image"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress 
                value={75} 
                className="w-full"
              />
              <div className="flex justify-between text-sm text-white/60">
                <span>Progress</span>
                <span>75%</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
              className="border-white/10"
            >
              Cancel
            </Button>
            
            <SlideButton
              onClick={handleGenerate}
              disabled={isProcessing || !imageUrl}
              isLoading={isProcessing}
              loadingText="Generating..."
              icon={<Box className="h-4 w-4" />}
              variant="primary"
            >
              Generate 3D Model
            </SlideButton>
          </div>

          {/* Additional Info */}
          {isProcessing && (
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
