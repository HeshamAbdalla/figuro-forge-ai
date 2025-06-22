
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye, EyeOff } from 'lucide-react';
import { TextTo3DModelInfo, UrlModelInfo } from '../types/ModelViewerTypes';

interface ModelViewerOverlayProps {
  modelInfo: TextTo3DModelInfo | UrlModelInfo;
  showControls: boolean;
  showEnvironment: boolean;
  isLoading: boolean;
  onEnvironmentToggle: () => void;
  onDownload: () => void;
}

const ModelViewerOverlay: React.FC<ModelViewerOverlayProps> = ({
  modelInfo,
  showControls,
  showEnvironment,
  isLoading,
  onEnvironmentToggle,
  onDownload
}) => {
  if (!showControls || isLoading) return null;

  const getDisplayText = () => {
    if (modelInfo.type === 'text-to-3d') {
      return modelInfo.prompt?.substring(0, 30) || 'AI Generated';
    }
    return modelInfo.fileName?.substring(0, 30) || 'Model';
  };

  const shouldTruncate = () => {
    if (modelInfo.type === 'text-to-3d') {
      return (modelInfo.prompt?.length || 0) > 30;
    }
    return (modelInfo.fileName?.length || 0) > 30;
  };

  return (
    <div className="absolute bottom-4 left-4 right-4">
      <div className="glass-panel p-3 rounded-xl backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-blue-400/30 text-blue-400">
              {getDisplayText()}
              {shouldTruncate() && '...'}
            </Badge>
            
            {modelInfo.type === 'text-to-3d' && modelInfo.progress !== undefined && modelInfo.progress < 100 && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                {modelInfo.progress}%
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEnvironmentToggle}
              className="hover:bg-white/10 text-white/70"
              aria-label={showEnvironment ? "Hide environment" : "Show environment"}
            >
              {showEnvironment ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
    </div>
  );
};

export default ModelViewerOverlay;
