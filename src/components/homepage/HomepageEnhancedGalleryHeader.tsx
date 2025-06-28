
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";

interface HomepageEnhancedGalleryHeaderProps {
  navigateToGallery: () => void;
  navigateToStudio: () => void;
}

const HomepageEnhancedGalleryHeader: React.FC<HomepageEnhancedGalleryHeaderProps> = ({
  navigateToGallery,
  navigateToStudio
}) => {
  return (
    <div className="text-center mb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          Your <span className="text-figuro-accent">Creative</span> Gallery
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          Discover the latest creations from our community. From stunning figurines to innovative 3D models.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={navigateToStudio}
              className="bg-figuro-accent hover:bg-figuro-accent-hover text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-figuro-accent/25"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={navigateToGallery}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:border-figuro-accent/50 px-8 py-3 rounded-full font-medium transition-all duration-300"
            >
              <Eye className="w-5 h-5 mr-2" />
              View All
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomepageEnhancedGalleryHeader;
