
import React from "react";
import { motion } from "framer-motion";
import { Loader2, Download, Upload, Cpu } from "lucide-react";

interface EnhancedLoadingViewProps {
  progress: number;
  loadingStage?: "downloading" | "processing" | "rendering" | "finalizing";
}

const EnhancedLoadingView: React.FC<EnhancedLoadingViewProps> = ({ 
  progress, 
  loadingStage = "processing" 
}) => {
  const getLoadingIcon = () => {
    switch (loadingStage) {
      case "downloading": return Download;
      case "processing": return Cpu;
      case "rendering": return Loader2;
      case "finalizing": return Upload;
      default: return Loader2;
    }
  };

  const getLoadingMessage = () => {
    switch (loadingStage) {
      case "downloading": return "Downloading model...";
      case "processing": return "Processing 3D data...";
      case "rendering": return "Preparing for display...";
      case "finalizing": return "Almost ready...";
      default: return "Loading 3D model...";
    }
  };

  const LoadingIcon = getLoadingIcon();

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 p-8"
      >
        {/* Animated Loading Icon */}
        <motion.div
          className="relative mx-auto"
          animate={{ 
            rotate: loadingStage === "rendering" ? 360 : 0,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-figuro-accent/20 to-figuro-light/20 flex items-center justify-center backdrop-blur-sm border border-figuro-accent/30">
            <LoadingIcon className="w-8 h-8 text-figuro-accent" />
          </div>
          
          {/* Rotating Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-figuro-accent border-r-figuro-accent/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Loading Text */}
        <div className="space-y-3">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold text-white"
          >
            {getLoadingMessage()}
          </motion.h3>
          
          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <div className="w-80 h-3 bg-white/10 rounded-full overflow-hidden mx-auto backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-figuro-accent via-figuro-light to-figuro-accent rounded-full relative overflow-hidden"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.max(5, progress)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 text-sm font-medium"
            >
              {Math.round(progress)}% complete
            </motion.p>
          </motion.div>
        </div>

        {/* Loading Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/50 text-xs max-w-md mx-auto"
        >
          <p>💡 Tip: Large models may take a moment to load. Your patience ensures the best quality!</p>
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-figuro-accent/30 rounded-full"
              initial={{ 
                x: Math.random() * 400, 
                y: Math.random() * 400,
                opacity: 0
              }}
              animate={{ 
                y: [null, -20, -40],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedLoadingView;
