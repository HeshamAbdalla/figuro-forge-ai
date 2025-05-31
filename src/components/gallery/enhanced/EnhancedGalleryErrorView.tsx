
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Download, ExternalLink, Wifi, Shield, Box } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnhancedGalleryErrorViewProps {
  errorMessage: string | null;
  displayModelUrl: string | null;
  onRetry?: () => void;
  onDownload?: () => void;
}

const EnhancedGalleryErrorView: React.FC<EnhancedGalleryErrorViewProps> = ({ 
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
          borderColor: 'border-orange-500/20',
          title: 'Access Blocked',
          description: 'Model is protected by security policy.',
          suggestion: 'Try downloading for offline viewing'
        };
      case 'network':
        return {
          icon: Wifi,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          title: 'Connection Issue',
          description: 'Unable to reach the model.',
          suggestion: 'Check connection and retry'
        };
      case 'not-found':
        return {
          icon: Box,
          color: 'from-red-500 to-pink-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          title: 'Model Not Found',
          description: 'The 3D model is missing.',
          suggestion: 'File may have been moved'
        };
      case 'timeout':
        return {
          icon: RefreshCw,
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          title: 'Loading Timeout',
          description: 'Model took too long to load.',
          suggestion: 'Try again or check connection'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          title: 'Preview Failed',
          description: 'Unable to display the model.',
          suggestion: 'Download may still work'
        };
    }
  };

  const config = getErrorConfig();
  const ErrorIcon = config.icon;

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle animated background */}
      <motion.div
        className={`absolute inset-0 ${config.bgColor} opacity-50`}
        animate={{
          background: [
            `radial-gradient(circle at 20% 20%, ${config.bgColor.replace('bg-', 'rgb(').replace('/10', ' / 0.1)')} 0%, transparent 50%)`,
            `radial-gradient(circle at 80% 80%, ${config.bgColor.replace('bg-', 'rgb(').replace('/10', ' / 0.1)')} 0%, transparent 50%)`,
            `radial-gradient(circle at 20% 20%, ${config.bgColor.replace('bg-', 'rgb(').replace('/10', ' / 0.1)')} 0%, transparent 50%)`
          ]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Glass morphism container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className={`relative z-10 text-center space-y-3 max-w-xs bg-white/5 backdrop-blur-xl rounded-lg p-4 border ${config.borderColor}`}
      >
        {/* Animated error icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="mx-auto relative"
        >
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center relative overflow-hidden`}>
            <ErrorIcon className="w-5 h-5 text-white relative z-10" />
            
            {/* Pulse effect */}
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} opacity-30`}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Error content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h3 className="font-semibold text-white text-sm">{config.title}</h3>
          <p className="text-white/70 text-xs">{config.description}</p>
          <p className="text-white/50 text-xs">{config.suggestion}</p>
        </motion.div>

        {/* Compact action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-2"
        >
          {displayModelUrl && (
            <Button
              size="sm"
              onClick={onDownload || (() => {
                const a = document.createElement('a');
                a.href = displayModelUrl;
                a.download = 'model.glb';
                a.click();
              })}
              className={`h-7 px-3 text-xs bg-gradient-to-r ${config.color} hover:scale-105 transition-all duration-200 text-white border-0`}
            >
              <Download size={12} className="mr-1" />
              Download
            </Button>
          )}
          
          {(errorType === 'network' || errorType === 'timeout') && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className={`h-7 px-3 text-xs ${config.borderColor} text-white/70 hover:bg-white/10 hover:scale-105 transition-all duration-200`}
            >
              <RefreshCw size={12} className="mr-1" />
              Retry
            </Button>
          )}
        </motion.div>

        {/* Helpful tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/40 text-xs"
        >
          💡 {errorType === 'cors' ? 'Download usually works' : 'Issues are often temporary'}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EnhancedGalleryErrorView;
