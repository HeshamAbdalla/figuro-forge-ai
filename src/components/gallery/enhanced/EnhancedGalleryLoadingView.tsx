
import React from "react";
import { motion } from "framer-motion";
import { Loader2, Download, Upload, Cpu, Sparkles } from "lucide-react";

interface EnhancedGalleryLoadingViewProps {
  progress: number;
  loadingStage?: "downloading" | "processing" | "rendering" | "finalizing";
}

const EnhancedGalleryLoadingView: React.FC<EnhancedGalleryLoadingViewProps> = ({ 
  progress, 
  loadingStage = "processing" 
}) => {
  const getLoadingIcon = () => {
    switch (loadingStage) {
      case "downloading": return Download;
      case "processing": return Cpu;
      case "rendering": return Loader2;
      case "finalizing": return Sparkles;
      default: return Loader2;
    }
  };

  const getLoadingMessage = () => {
    switch (loadingStage) {
      case "downloading": return "Fetching model...";
      case "processing": return "Processing 3D data...";
      case "rendering": return "Preparing preview...";
      case "finalizing": return "Almost ready...";
      default: return "Loading model...";
    }
  };

  const LoadingIcon = getLoadingIcon();

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-purple-900/30 to-blue-900/30"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(88,28,135,0.3) 50%, rgba(30,58,138,0.3) 100%)',
            'linear-gradient(135deg, rgba(30,58,138,0.3) 0%, rgba(17,24,39,0.9) 50%, rgba(88,28,135,0.3) 100%)',
            'linear-gradient(135deg, rgba(88,28,135,0.3) 0%, rgba(30,58,138,0.3) 50%, rgba(17,24,39,0.9) 100%)'
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Glass morphism container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 text-center space-y-4 p-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
      >
        {/* Animated loading icon with enhanced effects */}
        <motion.div
          className="relative mx-auto w-16 h-16"
          animate={{ 
            rotate: loadingStage === "rendering" ? 360 : 0,
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" }
          }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 flex items-center justify-center backdrop-blur-sm border border-purple-500/20 relative overflow-hidden">
            <LoadingIcon className="w-6 h-6 text-purple-300" />
            
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          {/* Rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-400 border-r-purple-400/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Loading text with typing effect */}
        <motion.div className="space-y-2">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-medium text-white"
          >
            {getLoadingMessage()}
          </motion.h3>
          
          {/* Compact progress bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-32 mx-auto"
          >
            <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full relative overflow-hidden"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.max(5, progress)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Progress shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/60 text-xs mt-1 font-medium"
            >
              {Math.round(progress)}%
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
            initial={{ 
              x: Math.random() * 200, 
              y: Math.random() * 200,
              opacity: 0
            }}
            animate={{ 
              y: [null, -15, -30],
              opacity: [0, 1, 0],
              x: [null, Math.random() * 20 - 10]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default EnhancedGalleryLoadingView;
