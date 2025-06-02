
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMobileDevice } from '@/hooks/useMobileDevice';
import MobileCameraStream from './MobileCameraStream';
import CameraImagePreview from './CameraImagePreview';
import { Button } from '@/components/ui/button';
import { Camera, Monitor, AlertCircle } from 'lucide-react';

interface MobileCameraSectionProps {
  onImageCapture: (imageBlob: Blob) => void;
  isProcessing?: boolean;
}

type CameraState = 'idle' | 'streaming' | 'captured';

const MobileCameraSection: React.FC<MobileCameraSectionProps> = ({
  onImageCapture,
  isProcessing = false
}) => {
  const { isMobile, hasCamera, isIOS, isAndroid } = useMobileDevice();
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [capturedImage, setCapturedImage] = useState<{
    blob: Blob;
    url: string;
  } | null>(null);

  const handleStartCamera = () => {
    setCameraState('streaming');
  };

  const handleImageCapture = (imageBlob: Blob) => {
    const imageUrl = URL.createObjectURL(imageBlob);
    setCapturedImage({ blob: imageBlob, url: imageUrl });
    setCameraState('captured');
  };

  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
    }
    setCameraState('streaming');
  };

  const handleConvert = () => {
    if (capturedImage) {
      onImageCapture(capturedImage.blob);
      // Reset camera state
      setCameraState('idle');
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
    }
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
      className="max-w-lg mx-auto space-y-6"
    >
      {/* Device info banner */}
      <div className="glass-panel rounded-lg p-3 text-center">
        <p className="text-sm text-white/70">
          📱 {isIOS ? 'iOS' : isAndroid ? 'Android' : 'Mobile'} Camera Detected
        </p>
      </div>

      {/* Camera states */}
      {cameraState === 'idle' && (
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

      {cameraState === 'streaming' && (
        <MobileCameraStream
          onCapture={handleImageCapture}
          isProcessing={isProcessing}
        />
      )}

      {cameraState === 'captured' && capturedImage && (
        <CameraImagePreview
          imageBlob={capturedImage.blob}
          imageUrl={capturedImage.url}
          onRetake={handleRetake}
          onConvert={handleConvert}
          isConverting={isProcessing}
        />
      )}

      {/* Tips */}
      <div className="glass-panel rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-2">📸 Photo Tips</h4>
        <ul className="text-xs text-white/60 space-y-1">
          <li>• Ensure good lighting for clear details</li>
          <li>• Position object against a plain background</li>
          <li>• Keep the subject centered in frame</li>
          <li>• Avoid shadows and reflections</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default MobileCameraSection;
