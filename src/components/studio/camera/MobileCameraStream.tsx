
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, Zap, ZapOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface MobileCameraStreamProps {
  onCapture: (imageBlob: Blob) => void;
  isProcessing?: boolean;
}

const MobileCameraStream: React.FC<MobileCameraStreamProps> = ({
  onCapture,
  isProcessing = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { isMobile } = useResponsiveLayout();
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);

  const startCamera = async () => {
    try {
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: isMobile ? 1280 : 1920 },
          height: { ideal: isMobile ? 720 : 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(current => current === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  useEffect(() => {
    if (facingMode) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  if (error) {
    return (
      <div className="glass-panel rounded-xl p-6 text-center">
        <div className="text-red-400 mb-4 text-sm">{error}</div>
        <Button onClick={startCamera} variant="outline" className="w-full">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-3 space-y-4">
      <div className={`relative bg-black rounded-lg overflow-hidden ${isMobile ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {/* Camera overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`border-2 border-white/50 rounded-lg ${isMobile ? 'w-48 h-48' : 'w-64 h-64'}`} />
        </div>

        {/* Camera controls overlay */}
        <div className="absolute top-3 left-3 right-3 flex justify-between">
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "icon"}
            onClick={switchCamera}
            className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
          >
            <RotateCcw size={isMobile ? 16 : 20} />
          </Button>
          
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "icon"}
            onClick={() => setFlashEnabled(!flashEnabled)}
            className={cn(
              "bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm",
              flashEnabled && "bg-yellow-500/70"
            )}
          >
            {flashEnabled ? <Zap size={isMobile ? 16 : 20} /> : <ZapOff size={isMobile ? 16 : 20} />}
          </Button>
        </div>

        {/* Touch-friendly capture area overlay for mobile */}
        {isMobile && (
          <div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto"
            onTouchStart={(e) => e.preventDefault()}
          >
            <div className="p-2">
              <Button
                onClick={capturePhoto}
                disabled={!isStreaming || isProcessing}
                className="bg-figuro-accent hover:bg-figuro-accent-hover text-white rounded-full w-16 h-16 p-0 shadow-lg"
              >
                <Camera size={28} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop capture button */}
      {!isMobile && (
        <div className="flex justify-center">
          <Button
            onClick={capturePhoto}
            disabled={!isStreaming || isProcessing}
            className="bg-figuro-accent hover:bg-figuro-accent-hover text-white rounded-full w-16 h-16"
          >
            <Camera size={24} />
          </Button>
        </div>
      )}

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default MobileCameraStream;
