
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Download, Crop, Palette, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraImagePreviewProps {
  imageBlob: Blob;
  imageUrl: string;
  onRetake: () => void;
  onConvert: () => void;
  onEnhance?: (enhancedBlob: Blob) => void;
  isConverting?: boolean;
}

const CameraImagePreview: React.FC<CameraImagePreviewProps> = ({
  imageBlob,
  imageUrl,
  onRetake,
  onConvert,
  onEnhance,
  isConverting = false
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementOptions, setEnhancementOptions] = useState({
    removeBackground: false,
    adjustBrightness: false,
    enhanceColors: false
  });

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `camera-capture-${Date.now()}.jpg`;
    link.click();
  };

  const handleEnhancement = async () => {
    if (!onEnhance) return;
    
    setIsEnhancing(true);
    try {
      // For now, just pass through the original blob
      // In a real implementation, you would apply the selected enhancements
      onEnhance(imageBlob);
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 space-y-4">
      {/* Image Preview */}
      <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt="Captured photo"
          className="w-full h-full object-cover"
        />
        
        {/* Processing overlay */}
        {(isConverting || isEnhancing) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">
                {isConverting ? 'Converting to 3D...' : 'Enhancing image...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Enhancement Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">Enhancement Options</h3>
        <div className="grid grid-cols-1 gap-2">
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={enhancementOptions.removeBackground}
              onChange={(e) => setEnhancementOptions(prev => ({
                ...prev,
                removeBackground: e.target.checked
              }))}
              className="rounded"
            />
            Remove background
          </label>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={enhancementOptions.adjustBrightness}
              onChange={(e) => setEnhancementOptions(prev => ({
                ...prev,
                adjustBrightness: e.target.checked
              }))}
              className="rounded"
            />
            Adjust brightness
          </label>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={enhancementOptions.enhanceColors}
              onChange={(e) => setEnhancementOptions(prev => ({
                ...prev,
                enhanceColors: e.target.checked
              }))}
              className="rounded"
            />
            Enhance colors
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onRetake}
          disabled={isConverting || isEnhancing}
          className="flex-1"
        >
          <RotateCcw size={16} className="mr-2" />
          Retake
        </Button>
        
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={isConverting || isEnhancing}
        >
          <Download size={16} />
        </Button>

        {onEnhance && Object.values(enhancementOptions).some(Boolean) && (
          <Button
            variant="outline"
            onClick={handleEnhancement}
            disabled={isConverting || isEnhancing}
          >
            <Palette size={16} className="mr-2" />
            Enhance
          </Button>
        )}
        
        <Button
          onClick={onConvert}
          disabled={isConverting || isEnhancing}
          className="flex-1 bg-figuro-accent hover:bg-figuro-accent-hover"
        >
          <Check size={16} className="mr-2" />
          Convert to 3D
        </Button>
      </div>
    </div>
  );
};

export default CameraImagePreview;
