
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Eye, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import EnhancedModelViewer from '@/components/model-viewer/EnhancedModelViewer';
import { useModelViewer } from '@/components/gallery/useModelViewer';

interface CameraModelPreviewProps {
  modelUrl: string | null;
  isConverting: boolean;
  progress: {
    status: string;
    progress: number;
    percentage: number;
    message: string;
    taskId?: string;
    thumbnailUrl?: string;
  };
  onRetakePhoto: () => void;
  className?: string;
}

const CameraModelPreview: React.FC<CameraModelPreviewProps> = ({
  modelUrl,
  isConverting,
  progress,
  onRetakePhoto,
  className = ""
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const { onViewModel } = useModelViewer();

  // Show success animation when conversion completes
  useEffect(() => {
    if (progress.status === 'completed' && modelUrl) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [progress.status, modelUrl]);

  const handleDownload = () => {
    if (modelUrl) {
      const link = document.createElement('a');
      link.href = modelUrl;
      link.download = `camera-3d-model-${Date.now()}.glb`;
      link.click();
    }
  };

  const handleViewModel = () => {
    if (modelUrl) {
      onViewModel(modelUrl, `Camera Capture ${Date.now()}`);
    }
  };

  return (
    <div className={`glass-panel rounded-xl p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">3D Model Preview</h3>
        {progress.status === 'completed' && modelUrl && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewModel}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Eye size={16} className="mr-2" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Model Preview Area */}
      <div className="relative aspect-square rounded-lg overflow-hidden">
        <EnhancedModelViewer 
          modelUrl={modelUrl}
          isLoading={isConverting}
          progress={progress.percentage}
          errorMessage={progress.status === 'error' ? progress.message : undefined}
          variant="compact"
          showControls={!!modelUrl && !isConverting}
          autoRotate={true}
          className="h-full"
        />
        
        {/* Success overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-lg"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="bg-green-500 text-white rounded-full p-4"
              >
                <CheckCircle size={32} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Thumbnail overlay during conversion */}
        {isConverting && progress.thumbnailUrl && (
          <div className="absolute bottom-4 right-4">
            <img 
              src={progress.thumbnailUrl} 
              alt="Conversion preview"
              className="w-16 h-16 rounded-lg object-cover border border-white/20"
            />
          </div>
        )}
      </div>

      {/* Status and Actions */}
      <div className="space-y-3">
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {isConverting ? (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-sm text-white/70">Converting to 3D...</span>
            </>
          ) : modelUrl ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-white/70">3D model ready</span>
            </>
          ) : progress.status === 'error' ? (
            <>
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-sm text-red-400">Conversion failed</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-white/30 rounded-full" />
              <span className="text-sm text-white/50">Waiting for photo</span>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onRetakePhoto}
            disabled={isConverting}
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RotateCcw size={16} className="mr-2" />
            Take New Photo
          </Button>
          
          {modelUrl && (
            <Button
              onClick={handleViewModel}
              className="flex-1 bg-figuro-accent hover:bg-figuro-accent-hover"
            >
              <Eye size={16} className="mr-2" />
              View Model
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModelPreview;
