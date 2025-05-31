
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Download, ExternalLink, Wifi, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EnhancedErrorViewProps {
  errorMessage: string | null;
  displayModelUrl: string | null;
  onRetry?: () => void;
  onDownload?: () => void;
}

const EnhancedErrorView: React.FC<EnhancedErrorViewProps> = ({ 
  errorMessage, 
  displayModelUrl, 
  onRetry,
  onDownload 
}) => {
  const getErrorType = (error: string) => {
    if (error.includes('CORS') || error.includes('Cross-Origin')) return 'cors';
    if (error.includes('network') || error.includes('fetch')) return 'network';
    if (error.includes('404') || error.includes('not found')) return 'not-found';
    if (error.includes('timeout')) return 'timeout';
    if (error.includes('format') || error.includes('invalid')) return 'format';
    return 'unknown';
  };

  const errorType = errorMessage ? getErrorType(errorMessage.toLowerCase()) : 'unknown';

  const getErrorConfig = () => {
    switch (errorType) {
      case 'cors':
        return {
          icon: Shield,
          color: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          title: 'Access Restricted',
          description: 'The model is protected by CORS policy. Try downloading instead.',
          suggestion: 'Download the model to view it locally'
        };
      case 'network':
        return {
          icon: Wifi,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          title: 'Connection Issue',
          description: 'Unable to load the model due to network problems.',
          suggestion: 'Check your connection and try again'
        };
      case 'not-found':
        return {
          icon: AlertTriangle,
          color: 'from-red-500 to-pink-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          title: 'Model Not Found',
          description: 'The 3D model could not be located.',
          suggestion: 'The model may have been moved or deleted'
        };
      case 'timeout':
        return {
          icon: RefreshCw,
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          title: 'Loading Timeout',
          description: 'The model is taking too long to load.',
          suggestion: 'Try again or check your internet connection'
        };
      case 'format':
        return {
          icon: AlertTriangle,
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30',
          title: 'Format Error',
          description: 'The model format is not supported or corrupted.',
          suggestion: 'Ensure the model is in GLB format'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          title: 'Loading Failed',
          description: 'An unexpected error occurred while loading the model.',
          suggestion: 'Try refreshing or contact support if the issue persists'
        };
    }
  };

  const config = getErrorConfig();
  const ErrorIcon = config.icon;

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className={`text-center space-y-6 max-w-md ${config.bgColor} ${config.borderColor} border rounded-2xl p-8 backdrop-blur-sm`}
      >
        {/* Animated Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="relative mx-auto"
        >
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center relative overflow-hidden`}>
            <ErrorIcon className="w-8 h-8 text-white relative z-10" />
            
            {/* Pulse Effect */}
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} opacity-30`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Error Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-white">{config.title}</h3>
          
          <div className="space-y-2">
            <p className="text-white/80">{config.description}</p>
            {errorMessage && (
              <Badge variant="outline" className={`${config.borderColor} text-white/70 bg-white/5`}>
                {errorMessage}
              </Badge>
            )}
          </div>
          
          <p className="text-white/60 text-sm">{config.suggestion}</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col space-y-3"
        >
          {displayModelUrl && (
            <Button
              onClick={onDownload || (() => {
                const a = document.createElement('a');
                a.href = displayModelUrl;
                a.download = 'model.glb';
                a.click();
              })}
              className={`w-full bg-gradient-to-r ${config.color} hover:scale-105 transition-all duration-200 text-white border-0`}
            >
              <Download size={16} className="mr-2" />
              Download Model
            </Button>
          )}
          
          {(errorType === 'network' || errorType === 'timeout') && onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className={`w-full ${config.borderColor} text-white/80 hover:bg-white/5 hover:scale-105 transition-all duration-200`}
            >
              <RefreshCw size={16} className="mr-2" />
              Try Again
            </Button>
          )}
          
          {errorType === 'cors' && displayModelUrl && (
            <Button
              variant="ghost"
              onClick={() => window.open(displayModelUrl, '_blank')}
              className="w-full text-white/60 hover:text-white hover:bg-white/5 hover:scale-105 transition-all duration-200"
            >
              <ExternalLink size={16} className="mr-2" />
              Open in New Tab
            </Button>
          )}
        </motion.div>

        {/* Helpful Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/40 text-xs space-y-1"
        >
          <p>💡 Most issues are temporary and resolve quickly</p>
          {displayModelUrl && <p>🔗 The download option usually works even when preview fails</p>}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EnhancedErrorView;
