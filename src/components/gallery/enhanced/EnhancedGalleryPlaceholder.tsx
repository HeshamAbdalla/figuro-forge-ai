
import React from "react";
import { motion } from "framer-motion";
import { Box, Sparkles, Loader2 } from "lucide-react";

interface EnhancedGalleryPlaceholderProps {
  fileName: string;
  message?: string;
  isLoading?: boolean;
}

const EnhancedGalleryPlaceholder: React.FC<EnhancedGalleryPlaceholderProps> = ({ 
  fileName,
  message,
  isLoading = false
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-purple-900/20 to-blue-900/20"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(31,41,55,0.3) 0%, rgba(88,28,135,0.2) 50%, rgba(30,58,138,0.2) 100%)',
            'linear-gradient(135deg, rgba(30,58,138,0.2) 0%, rgba(31,41,55,0.3) 50%, rgba(88,28,135,0.2) 100%)',
            'linear-gradient(135deg, rgba(88,28,135,0.2) 0%, rgba(30,58,138,0.2) 50%, rgba(31,41,55,0.3) 100%)'
          ]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Glass morphism container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 text-center space-y-3 bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10"
      >
        {/* Animated icon with enhanced effects */}
        <motion.div
          className="relative mx-auto"
          animate={isLoading ? { 
            rotate: 360,
            scale: [1, 1.1, 1]
          } : {
            scale: [1, 1.05, 1]
          }}
          transition={isLoading ? { 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          } : {
            scale: { duration: 3, repeat: Infinity }
          }}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center backdrop-blur-sm border border-purple-500/20 relative overflow-hidden">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-purple-300" />
            ) : (
              <Box className="w-5 h-5 text-purple-300" />
            )}
            
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          {/* Floating sparkles for non-loading state */}
          {!isLoading && (
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    x: Math.random() * 48, 
                    y: Math.random() * 48,
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{ 
                    y: [null, -10, -20],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: "easeOut"
                  }}
                >
                  <Sparkles size={8} className="text-purple-400/60" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Content with typing animation */}
        <motion.div className="space-y-1">
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-white truncate max-w-full"
          >
            {fileName}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-xs"
          >
            {message || (isLoading ? "Loading 3D Model..." : "3D Model")}
          </motion.p>
        </motion.div>

        {/* Pulse indicator for loading */}
        {isLoading && (
          <motion.div
            className="flex justify-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-purple-400/60 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Subtle border glow */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, transparent, rgba(139, 92, 246, 0.05), transparent)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default EnhancedGalleryPlaceholder;
