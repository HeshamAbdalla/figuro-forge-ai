
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Box, User, Sparkles, TrendingUp } from "lucide-react";

interface PersonalGalleryHeroProps {
  totalModels: number;
  onCreateNew: () => void;
}

const PersonalGalleryHero: React.FC<PersonalGalleryHeroProps> = ({
  totalModels,
  onCreateNew
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-figuro-dark via-gray-900 to-purple-900/20 py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-figuro-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient bg-gradient-to-r from-white via-figuro-accent to-purple-400 bg-clip-text text-transparent">
              My
            </span>
            <br />
            <span className="text-white">Figurines</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/70 mb-8 leading-relaxed">
            Your personal collection of 3D models and figurines. Manage, view, and share
            <br className="hidden md:block" />
            your AI-generated creations with advanced tools and controls.
          </p>

          {/* Stats badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Badge className="glass-panel px-4 py-2 text-sm font-medium bg-white/10 text-white border-white/20">
                <User className="w-4 h-4 mr-2" />
                {totalModels} Personal Models
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Badge className="glass-panel px-4 py-2 text-sm font-medium bg-figuro-accent/20 text-figuro-accent border-figuro-accent/30">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Powered
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Badge className="glass-panel px-4 py-2 text-sm font-medium bg-purple-500/20 text-purple-400 border-purple-500/30">
                <TrendingUp className="w-4 h-4 mr-2" />
                Your Collection
              </Badge>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={onCreateNew}
              size="lg"
              className="bg-gradient-to-r from-figuro-accent to-purple-600 hover:from-figuro-accent-hover hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Box className="w-5 h-5 mr-3" />
              Create New Figurine
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PersonalGalleryHero;
