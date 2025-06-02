
import React from "react";
import { AlertTriangle, RefreshCw, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ModelErrorHandlerProps {
  error: string;
  fileName: string;
  onRetry?: () => void;
  modelUrl?: string;
  showDetails?: boolean;
}

const ModelErrorHandler: React.FC<ModelErrorHandlerProps> = ({
  error,
  fileName,
  onRetry,
  modelUrl,
  showDetails = false
}) => {
  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('expired') || errorMessage.includes('Expires')) return 'expired';
    if (errorMessage.includes('404') || errorMessage.includes('not found')) return 'not-found';
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) return 'network';
    if (errorMessage.includes('CORS') || errorMessage.includes('blocked')) return 'cors';
    if (errorMessage.includes('invalid') || errorMessage.includes('format')) return 'format';
    if (errorMessage.includes('fail to load') || errorMessage.includes('failed to load')) return 'load-failed';
    return 'unknown';
  };

  const errorType = getErrorType(error.toLowerCase());

  const getErrorIcon = () => {
    switch (errorType) {
      case 'expired':
        return <AlertTriangle size={16} className="text-orange-400" />;
      case 'not-found':
        return <AlertTriangle size={16} className="text-red-400" />;
      case 'network':
      case 'load-failed':
        return <RefreshCw size={16} className="text-blue-400" />;
      case 'cors':
        return <ExternalLink size={16} className="text-purple-400" />;
      default:
        return <AlertTriangle size={16} className="text-gray-400" />;
    }
  };

  const getErrorBadgeColor = () => {
    switch (errorType) {
      case 'expired':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'not-found':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'network':
      case 'load-failed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cors':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getErrorMessage = () => {
    switch (errorType) {
      case 'expired':
        return 'Model URL expired';
      case 'not-found':
        return 'Model not found';
      case 'network':
        return 'Network error';
      case 'load-failed':
        return 'Failed to load model';
      case 'cors':
        return 'Access blocked';
      default:
        return 'Model error';
    }
  };

  const handleDownload = () => {
    if (modelUrl) {
      const link = document.createElement('a');
      link.href = modelUrl;
      link.download = `${fileName.replace(/\.[^/.]+$/, '')}.glb`;
      link.target = '_blank';
      link.click();
    }
  };

  const getActionButtons = () => {
    const buttons = [];
    
    // Retry button for network/load errors
    if ((errorType === 'network' || errorType === 'load-failed') && onRetry) {
      buttons.push(
        <Button
          key="retry"
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
        >
          <RefreshCw size={12} className="mr-1" />
          Retry
        </Button>
      );
    }
    
    // External link for expired URLs
    if (errorType === 'expired' && modelUrl) {
      buttons.push(
        <Button
          key="open"
          variant="ghost"
          size="sm"
          onClick={() => window.open(modelUrl, '_blank')}
          className="h-6 px-2 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
        >
          <ExternalLink size={12} className="mr-1" />
          Open
        </Button>
      );
    }
    
    // Download button for all cases where we have a model URL
    if (modelUrl) {
      buttons.push(
        <Button
          key="download"
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="h-6 px-2 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10"
        >
          <Download size={12} className="mr-1" />
          Download
        </Button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/30 p-4 text-center">
      <div className="flex items-center gap-2 mb-2">
        {getErrorIcon()}
        <span className="text-sm font-medium text-white/80">Model Error</span>
      </div>
      
      <h3 className="text-sm font-medium text-white/90 mb-2 truncate max-w-full">
        {fileName}
      </h3>
      
      <Badge 
        variant="outline" 
        className={`text-xs mb-3 ${getErrorBadgeColor()}`}
      >
        {getErrorMessage()}
      </Badge>
      
      {showDetails && (
        <div className="text-xs text-white/40 mb-2 break-all max-w-full">
          {error}
        </div>
      )}
      
      {modelUrl && showDetails && (
        <div className="text-xs text-white/30 mb-2 break-all max-w-full">
          {modelUrl.length > 50 ? `${modelUrl.substring(0, 50)}...` : modelUrl}
        </div>
      )}
      
      <div className="flex gap-1 flex-wrap justify-center">
        {getActionButtons()}
      </div>
    </div>
  );
};

export default ModelErrorHandler;
