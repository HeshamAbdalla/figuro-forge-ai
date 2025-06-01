
import React from "react";
import { AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
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
    if (errorMessage.includes('expired')) return 'expired';
    if (errorMessage.includes('404') || errorMessage.includes('not found')) return 'not-found';
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) return 'network';
    if (errorMessage.includes('CORS') || errorMessage.includes('blocked')) return 'cors';
    if (errorMessage.includes('invalid') || errorMessage.includes('format')) return 'format';
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
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cors':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getActionButton = () => {
    if (errorType === 'network' && onRetry) {
      return (
        <Button
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
    
    if (errorType === 'expired' && modelUrl) {
      return (
        <Button
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
    
    return null;
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
        {error}
      </Badge>
      
      {showDetails && modelUrl && (
        <div className="text-xs text-white/40 mb-2 break-all max-w-full">
          {modelUrl.length > 50 ? `${modelUrl.substring(0, 50)}...` : modelUrl}
        </div>
      )}
      
      {getActionButton()}
    </div>
  );
};

export default ModelErrorHandler;
