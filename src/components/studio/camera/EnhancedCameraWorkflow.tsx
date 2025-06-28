
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMobileDevice } from '@/hooks/useMobileDevice';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import MobileCameraStream from './MobileCameraStream';
import CameraImagePreview from './CameraImagePreview';
import CameraModelPreview from './CameraModelPreview';
import { Button } from '@/components/ui/button';
import { Camera, Monitor, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

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

type WorkflowState = 'start' | 'streaming' | 'captured' | 'converting' | 'completed' | 'error';

const EnhancedCameraWorkflow: React.FC<EnhancedCameraWorkflowProps> = ({
  onImageCapture,
  isProcessing = false,
  progress
}) => {
  const { isMobile: deviceIsMobile, hasCamera, isIOS, isAndroid } = useMobileDevice();
  const { isMobile, isTablet } = useResponsiveLayout();
  const [workflowState, setWorkflowState] = useState<WorkflowState>('start');
  const [capturedImage, setCapturedImage] = useState<{
    blob: Blob;
    url: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Update workflow state based on processing status
  useEffect(() => {
    if (isProcessing) {
      setWorkflowState('converting');
      setErrorMessage('');
    } else if (progress.status === 'completed' && progress.modelUrl) {
      setWorkflowState('completed');
      setErrorMessage('');
    } else if (progress.status === 'error') {
      setWorkflowState('error');
      setErrorMessage(progress.message || 'An error occurred during conversion');
    }
  }, [isProcessing, progress.status, progress.modelUrl, progress.message]);

  const handleStartCamera = () => {
    setWorkflowState('streaming');
    setErrorMessage('');
  };

  const handleImageCapture = (imageBlob: Blob) => {
    const imageUrl = URL.createObjectURL(imageBlob);
    setCapturedImage({ blob: imageBlob, url: imageUrl });
    setWorkflowState('captured');
    setErrorMessage('');
  };

  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
    }
    setWorkflowState('streaming');
    setErrorMessage('');
  };

  const handleConvert = () => {
    if (capturedImage) {
      try {
        onImageCapture(capturedImage.blob);
        setWorkflowState('converting');
        setErrorMessage('');
      } catch (error) {
        console.error('Error starting conversion:', error);
        setErrorMessage('Failed to start conversion. Please try again.');
        setWorkflowState('error');
      }
    }
  };

  const handleRetakeFromPreview = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
    }
    setWorkflowState('start');
    setErrorMessage('');
  };

  const handleStartOver = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
    }
    setWorkflowState('start');
    setErrorMessage('');
  };

  const handleRetryFromError = () => {
    setErrorMessage('');
    if (capturedImage) {
      setWorkflowState('captured');
    } else {
      setWorkflowState('start');
    }
  };

  // Desktop fallback
  if (!deviceIsMobile || !hasCamera) {
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
      className={`space-y-4 ${isMobile ? 'max-w-none' : 'max-w-4xl mx-auto space-y-6'}`}
    >
      {/* Device info banner */}
      <div className="glass-panel rounded-lg p-3 text-center">
        <p className="text-sm text-white/70">
          📱 {isIOS ? 'iOS' : isAndroid ? 'Android' : 'Mobile'} Camera Detected
        </p>
      </div>

      {/* Responsive workflow area */}
      <div className={isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}>
        
        {/* Camera/Image area */}
        <div className="space-y-4">
          {workflowState === 'start' && (
            <div className="glass-panel rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-figuro-accent/20 to-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Camera className="w-8 h-8 text-figuro-accent" />
              </div>
              
              <h3 className={`font-semibold text-white mb-3 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Take a Photo
              </h3>
              
              <p className="text-white/70 mb-6 text-sm">
                Capture an object to create a 3D model. Position your subject clearly in the frame for best results.
              </p>
              
              <Button
                onClick={handleStartCamera}
                className="bg-figuro-accent hover:bg-figuro-accent-hover text-white w-full"
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
              <div className="w-12 h-12 bg-green-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                3D Model Created!
              </h3>
              
              <p className="text-white/70 mb-4 text-sm">
                Your photo has been successfully converted to a 3D model and saved to your collection.
              </p>
              
              <Button
                onClick={handleStartOver}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Another Photo
              </Button>
            </div>
          )}

          {workflowState === 'error' && (
            <div className="glass-panel rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                Conversion Failed
              </h3>
              
              <p className="text-white/70 mb-4 text-sm">
                {errorMessage || 'An error occurred while converting your photo to 3D.'}
              </p>
              
              <div className={`gap-3 ${isMobile ? 'space-y-2' : 'flex justify-center'}`}>
                <Button
                  onClick={handleRetryFromError}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={handleStartOver}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take New Photo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 3D Model Preview - Hidden on mobile */}
        {!isMobile && (
          <div>
            <CameraModelPreview
              modelUrl={progress.modelUrl || null}
              isConverting={isProcessing || workflowState === 'converting'}
              progress={progress}
              onRetakePhoto={handleRetakeFromPreview}
            />
          </div>
        )}
      </div>

      {/* Enhanced tips section */}
      <div className="glass-panel rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-2">📸 Photo Tips for Best Results</h4>
        <div className={isMobile ? 'space-y-1' : 'grid grid-cols-1 md:grid-cols-2 gap-2'}>
          <ul className="text-xs text-white/60 space-y-1">
            <li>• Ensure good lighting for clear details</li>
            <li>• Position object against a plain background</li>
          </ul>
          <ul className="text-xs text-white/60 space-y-1">
            <li>• Keep the subject centered in frame</li>
            <li>• Avoid shadows and reflections</li>
          </ul>
        </div>
        
        {workflowState === 'error' && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-400">
              <strong>Troubleshooting:</strong> If conversion keeps failing, try taking a new photo with better lighting or a simpler background.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedCameraWorkflow;
