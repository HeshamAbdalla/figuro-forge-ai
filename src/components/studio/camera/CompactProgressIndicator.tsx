
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CompactProgressIndicatorProps {
  isGenerating: boolean;
  progress: {
    status: string;
    progress: number;
    percentage: number;
    message: string;
    modelUrl?: string;
  };
  className?: string;
}

const CompactProgressIndicator: React.FC<CompactProgressIndicatorProps> = ({
  isGenerating,
  progress,
  className = ""
}) => {
  if (!isGenerating && !progress.modelUrl && progress.status !== 'error') {
    return null;
  }

  const getStatusIcon = () => {
    if (progress.status === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
    if (progress.status === 'completed' && progress.modelUrl) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    if (isGenerating) {
      return <Loader2 className="w-4 h-4 text-figuro-accent animate-spin" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (progress.status === 'error') return 'border-red-400/30 bg-red-400/10';
    if (progress.status === 'completed') return 'border-green-400/30 bg-green-400/10';
    return 'border-figuro-accent/30 bg-figuro-accent/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}
    >
      <div className={`rounded-xl border ${getStatusColor()} backdrop-blur-sm p-3`}>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {progress.status === 'error' ? 'Conversion Failed' :
               progress.status === 'completed' ? '3D Model Ready' :
               'Generating 3D Model'}
            </p>
            <p className="text-xs text-white/70 truncate">
              {progress.message || 'Processing...'}
            </p>
          </div>
          {isGenerating && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 relative">
                <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-white/20"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 14}`}
                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - (progress.progress || 0) / 100)}`}
                    className="text-figuro-accent transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {Math.round(progress.progress || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CompactProgressIndicator;
