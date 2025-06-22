
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Share,
  Info,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelViewerControlsProps {
  showControls: boolean;
  modelType: 'url' | 'text-to-3d';
  modelStatus?: string;
  autoRotate: boolean;
  showEnvironment: boolean;
  showModelInfo: boolean;
  onAutoRotateToggle: () => void;
  onEnvironmentToggle: () => void;
  onModelInfoToggle: () => void;
  onResetCamera: () => void;
  onShare: () => void;
  onUpload: () => void;
  onDownload: () => void;
  className?: string;
}

const ModelViewerControls: React.FC<ModelViewerControlsProps> = ({
  showControls,
  modelType,
  modelStatus,
  autoRotate,
  showEnvironment,
  showModelInfo,
  onAutoRotateToggle,
  onEnvironmentToggle,
  onModelInfoToggle,
  onResetCamera,
  onShare,
  onUpload,
  onDownload,
  className
}) => {
  if (!showControls) return null;

  return (
    <div className={cn(
      "p-4 border-b border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10",
      className
    )}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gradient">3D Model Viewer</h3>
          </div>
          
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {modelType === 'text-to-3d' ? 'Text-to-3D' : 'Model'}
          </Badge>
          
          {modelStatus && (
            <Badge 
              className={cn(
                "border",
                modelStatus === 'completed' && "bg-green-500/20 text-green-400 border-green-500/30",
                modelStatus === 'processing' && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                modelStatus === 'failed' && "bg-red-500/20 text-red-400 border-red-500/30"
              )}
            >
              {modelStatus}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onModelInfoToggle}
            className="hover:bg-white/10"
            aria-label="Toggle model information"
          >
            <Info className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onAutoRotateToggle}
            className="hover:bg-white/10"
            aria-label={autoRotate ? "Stop auto rotation" : "Start auto rotation"}
          >
            <RotateCcw className={cn(
              "w-4 h-4",
              autoRotate && "animate-spin"
            )} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onEnvironmentToggle}
            className="hover:bg-white/10"
            aria-label={showEnvironment ? "Hide environment" : "Show environment"}
          >
            {showEnvironment ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="hover:bg-white/10"
            aria-label="Share model"
          >
            <Share className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetCamera}
            className="hover:bg-white/10"
            aria-label="Reset camera position"
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onUpload}
            className="hover:bg-white/10"
            aria-label="Upload custom model"
          >
            <Upload className="w-4 h-4" />
          </Button>

          <Button
            onClick={onDownload}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            aria-label="Download 3D model"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModelViewerControls;
