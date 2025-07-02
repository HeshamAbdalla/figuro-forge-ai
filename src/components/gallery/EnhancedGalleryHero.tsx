
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Box } from "lucide-react";
import GalleryExploreCards from "./GalleryExploreCards";

interface EnhancedGalleryHeroProps {
  onCategorySelect: (category: string) => void;
  onCreateNew: () => void;
  totalModels: number;
}

const EnhancedGalleryHero: React.FC<EnhancedGalleryHeroProps> = ({
  onCategorySelect,
  onCreateNew,
  totalModels
}) => {
  return (
    <section className="relative py-16 px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/5 via-purple-500/3 to-transparent" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-figuro-accent/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000" />
      
      <div className="container mx-auto relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Main Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Box className="w-8 h-8 text-figuro-accent" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              What would you like to explore?
            </h1>
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          
          <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-3xl mx-auto">
            Discover amazing 3D models created by our community. Browse by category, 
            download your favorites, or create something new.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <Button
              onClick={onCreateNew}
              size="lg"
              className="bg-figuro-accent hover:bg-figuro-accent/80 text-white px-8 py-3 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your Own
            </Button>
            
            <div className="text-white/60 text-sm">
              {totalModels} 3D models available
            </div>
          </div>
        </motion.div>

        {/* Explore Categories Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <GalleryExploreCards onCategorySelect={onCategorySelect} />
        </motion.div>
      </div>
    </section>
  );
};

export default EnhancedGalleryHero;
