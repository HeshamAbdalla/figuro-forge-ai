
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, Zap, ZapOff } from 'lucide-react';
import { cn } from '@/lib/utils';

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
          width: { ideal: 1920 },
          height: { ideal: 1080 }
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
        <div className="text-red-400 mb-4">{error}</div>
        <Button onClick={startCamera} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-4 space-y-4">
      <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {/* Camera overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-white/50 rounded-lg" />
        </div>

        {/* Camera controls overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={switchCamera}
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <RotateCcw size={20} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFlashEnabled(!flashEnabled)}
            className={cn(
              "bg-black/50 text-white hover:bg-black/70",
              flashEnabled && "bg-yellow-500/70"
            )}
          >
            {flashEnabled ? <Zap size={20} /> : <ZapOff size={20} />}
          </Button>
        </div>
      </div>

      {/* Capture button */}
      <div className="flex justify-center">
        <Button
          onClick={capturePhoto}
          disabled={!isStreaming || isProcessing}
          className="bg-figuro-accent hover:bg-figuro-accent-hover text-white rounded-full w-16 h-16"
        >
          <Camera size={24} />
        </Button>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default MobileCameraStream;
