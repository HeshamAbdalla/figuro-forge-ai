
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ModelErrorHandlerProps {
  error: Error;
  modelUrl: string;
  fileName: string;
  onRetry?: () => void;
  onReport?: (error: Error, context: any) => void;
}

const ModelErrorHandler: React.FC<ModelErrorHandlerProps> = ({
  error,
  modelUrl,
  fileName,
  onRetry,
  onReport
}) => {
  const handleReport = () => {
    if (onReport) {
      onReport(error, {
        modelUrl,
        fileName,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    }
  };

  const getErrorMessage = () => {
    if (error.message.includes('expired')) {
      return "Model URL has expired";
    }
    if (error.message.includes('CORS')) {
      return "Model blocked by security policy";
    }
    if (error.message.includes('404')) {
      return "Model file not found";
    }
    if (error.message.includes('context')) {
      return "WebGL context error";
    }
    return "Failed to load 3D model";
  };

  const getErrorSuggestion = () => {
    if (error.message.includes('expired')) {
      return "The model URL has expired. Try regenerating the model.";
    }
    if (error.message.includes('CORS')) {
      return "The model is hosted on a server that blocks cross-origin requests.";
    }
    if (error.message.includes('404')) {
      return "The model file could not be found at the specified URL.";
    }
    if (error.message.includes('context')) {
      return "Too many 3D models are active. Try refreshing the page.";
    }
    return "There was an issue loading the 3D model. Try again later.";
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900/30 to-orange-900/20"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(127,29,29,0.2) 0%, rgba(17,24,39,0.3) 50%, rgba(154,52,18,0.2) 100%)',
            'linear-gradient(135deg, rgba(154,52,18,0.2) 0%, rgba(127,29,29,0.2) 50%, rgba(17,24,39,0.3) 100%)',
            'linear-gradient(135deg, rgba(17,24,39,0.3) 0%, rgba(154,52,18,0.2) 50%, rgba(127,29,29,0.2) 100%)'
          ]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Error content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 text-center space-y-4 bg-white/5 backdrop-blur-xl rounded-lg p-6 border border-red-500/20 max-w-sm"
      >
        {/* Error icon */}
        <motion.div
          className="mx-auto w-12 h-12 rounded-lg bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center backdrop-blur-sm border border-red-500/20"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            scale: { duration: 2, repeat: Infinity },
            rotate: { duration: 4, repeat: Infinity }
          }}
        >
          <AlertTriangle className="w-5 h-5 text-red-300" />
        </motion.div>

        {/* Error details */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white">
            {getErrorMessage()}
          </h3>
          
          <p className="text-red-300/80 text-sm">
            {fileName}
          </p>
          
          <p className="text-white/60 text-xs leading-relaxed">
            {getErrorSuggestion()}
          </p>
        </div>

        {/* Action buttons */}
        {onRetry && (
          <motion.button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/30 rounded-lg text-sm font-medium text-white transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={14} />
            Try Again
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default ModelErrorHandler;
