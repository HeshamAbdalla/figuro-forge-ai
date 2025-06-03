
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Users } from "lucide-react";
import AnimatedSection from "@/components/animations/AnimatedSection";

const HomepageEnhancedGalleryHeader: React.FC = () => {
  return (
    <AnimatedSection delay={0.1} className="flex flex-col items-center mb-16 text-center">
      {/* Enhanced badge */}
      <motion.div
        className="inline-flex items-center gap-2 bg-gradient-to-r from-figuro-accent/10 to-purple-500/10 border border-figuro-accent/20 rounded-full px-6 py-3 mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Sparkles size={18} className="text-figuro-accent" />
        <span className="text-figuro-accent text-sm font-medium">
          Latest Community Creations
        </span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </motion.div>

      {/* Enhanced title */}
      <motion.h2 
        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <span className="text-white">Incredible </span>
        <span className="text-gradient bg-gradient-to-r from-figuro-accent via-purple-400 to-blue-400 bg-clip-text text-transparent">
          AI Creations
        </span>
      </motion.h2>
      
      {/* Enhanced description */}
      <motion.p 
        className="text-white/70 max-w-3xl mx-auto text-lg leading-relaxed mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        Explore stunning 3D figurines and artwork created by our community using AI. 
        From fantasy characters to modern designs, discover endless inspiration for your next creation.
      </motion.p>

      {/* Enhanced stats */}
      <motion.div
        className="flex flex-wrap justify-center items-center gap-8 text-white/60"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-sm font-medium">AI-Powered</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-blue-400" />
          <span className="text-sm font-medium">Community Driven</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-figuro-accent rounded-full animate-pulse" />
          <span className="text-sm font-medium">Updated Daily</span>
        </div>
      </motion.div>
    </AnimatedSection>
  );
};

export default HomepageEnhancedGalleryHeader;
