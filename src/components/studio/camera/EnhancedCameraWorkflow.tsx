
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMobileDevice } from '@/hooks/useMobileDevice';
import MobileCameraStream from './MobileCameraStream';
import CameraImagePreview from './CameraImagePreview';
import CameraModelPreview from './CameraModelPreview';
import { Button } from '@/components/ui/button';
import { Camera, Monitor, AlertCircle, CheckCircle } from 'lucide-react';

interface EnhancedCameraWorkflowProps {
  onImageCapture: (imageBlob: Blob) => void;
  isProcessing?: boolean;
  progress: {
    status: string;
    progress: number;
    percentage: number;
    message: string;
    taskId?: string;
    thumbnailUrl?: string;
    modelUrl?: string;
  };
}

type WorkflowState = 'start' | 'streaming' | 'captured' | 'converting' | 'completed';

const EnhancedCameraWorkflow: React.FC<EnhancedCameraWorkflowProps> = ({
  onImageCapture,
  isProcessing = false,
  progress
}) => {
  const { isMobile, hasCamera, isIOS, isAndroid } = useMobileDevice();
  const [workflowState, setWorkflowState] = useState<WorkflowState>('start');
  const [capturedImage, setCapturedImage] = useState<{
    blob: Blob;
    url: string;
  } | null>(null);

  // Update workflow state based on processing status
  useEffect(() => {
    if (isProcessing) {
      setWorkflowState('converting');
    } else if (progress.status === 'completed' && progress.modelUrl) {
      setWorkflowState('completed');
    } else if (progress.status === 'error') {
      // Reset to captured state on error
      if (capturedImage) {
        setWorkflowState('captured');
      } else {
        setWorkflowState('start');
      }
    }
  }, [isProcessing, progress.status, progress.modelUrl, capturedImage]);

  const handleStartCamera = () => {
    setWorkflowState('streaming');
  };

  const handleImageCapture = (imageBlob: Blob) => {
    const imageUrl = URL.createObjectURL(imageBlob);
    setCapturedImage({ blob: imageBlob, url: imageUrl });
    setWorkflowState('captured');
  };

  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
    }
    setWorkflowState('streaming');
  };

  const handleConvert = () => {
    if (capturedImage) {
      onImageCapture(capturedImage.blob);
      setWorkflowState('converting');
    }
  };

  const handleRetakeFromPreview = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
    }
    setWorkflowState('start');
  };

  const handleStartOver = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
    }
    setWorkflowState('start');
  };

  // Desktop fallback
  if (!isMobile || !hasCamera) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center py-16"
      >
        <div className="glass-panel rounded-xl p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-figuro-accent/20 to-purple-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Monitor className="w-8 h-8 text-figuro-accent" />
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-4">
            {!hasCamera ? 'No Camera Detected' : 'Mobile Device Required'}
          </h3>
          
          <p className="text-white/70 mb-6">
            {!hasCamera 
              ? 'Your device doesn\'t have a camera or camera access is not available.'
              : 'The camera feature is optimized for mobile devices. Please use a smartphone or tablet to take photos.'
            }
          </p>
          
          <div className="flex items-center gap-2 text-sm text-white/50 bg-white/5 rounded-lg p-3">
            <AlertCircle size={16} />
            <span>
              Tip: Use the "Image to 3D" tab to upload photos from your device
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Device info banner */}
      <div className="glass-panel rounded-lg p-3 text-center">
        <p className="text-sm text-white/70">
          📱 {isIOS ? 'iOS' : isAndroid ? 'Android' : 'Mobile'} Camera Detected
        </p>
      </div>

      {/* Main workflow area - responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left column - Camera/Image area */}
        <div className="space-y-4">
          {workflowState === 'start' && (
            <div className="glass-panel rounded-xl p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-figuro-accent/20 to-purple-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Camera className="w-10 h-10 text-figuro-accent" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-4">
                Take a Photo
              </h3>
              
              <p className="text-white/70 mb-6">
                Capture an object to create a 3D model. Position your subject clearly in the frame for best results.
              </p>
              
              <Button
                onClick={handleStartCamera}
                className="bg-figuro-accent hover:bg-figuro-accent-hover text-white"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Camera
              </Button>
            </div>
          )}

          {workflowState === 'streaming' && (
            <MobileCameraStream
              onCapture={handleImageCapture}
              isProcessing={isProcessing}
            />
          )}

          {(workflowState === 'captured' || workflowState === 'converting') && capturedImage && (
            <CameraImagePreview
              imageBlob={capturedImage.blob}
              imageUrl={capturedImage.url}
              onRetake={handleRetake}
              onConvert={handleConvert}
              isConverting={isProcessing || workflowState === 'converting'}
            />
          )}

          {workflowState === 'completed' && (
            <div className="glass-panel rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                3D Model Created!
              </h3>
              
              <p className="text-white/70 mb-4">
                Your photo has been successfully converted to a 3D model and saved to your collection.
              </p>
              
              <Button
                onClick={handleStartOver}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Another Photo
              </Button>
            </div>
          )}
        </div>

        {/* Right column - 3D Model Preview */}
        <div>
          <CameraModelPreview
            modelUrl={progress.modelUrl || null}
            isConverting={isProcessing || workflowState === 'converting'}
            progress={progress}
            onRetakePhoto={handleRetakeFromPreview}
          />
        </div>
      </div>

      {/* Tips section */}
      <div className="glass-panel rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-2">📸 Photo Tips for Best Results</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <ul className="text-xs text-white/60 space-y-1">
            <li>• Ensure good lighting for clear details</li>
            <li>• Position object against a plain background</li>
          </ul>
          <ul className="text-xs text-white/60 space-y-1">
            <li>• Keep the subject centered in frame</li>
            <li>• Avoid shadows and reflections</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedCameraWorkflow;
