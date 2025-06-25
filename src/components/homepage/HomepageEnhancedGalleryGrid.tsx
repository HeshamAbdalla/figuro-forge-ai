
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { BucketImage } from "@/components/gallery/types";
import HomepageEnhancedGalleryItem from "./HomepageEnhancedGalleryItem";

interface HomepageEnhancedGalleryGridProps {
  images: BucketImage[];
  isDownloading: boolean;
  isAuthenticated: boolean;
  onView: (url: string, fileName: string, fileType: 'image' | '3d-model' | 'web-icon') => void;
  onDownload: (url: string, name: string) => void;
  onNavigateToGallery: () => void;
  onDelete?: (file: BucketImage) => Promise<void>;
}

const HomepageEnhancedGalleryGrid: React.FC<HomepageEnhancedGalleryGridProps> = ({
  images,
  isDownloading,
  isAuthenticated,
  onView,
  onDownload,
  onNavigateToGallery,
  onDelete
}) => {
  // Show only the first 8 items on homepage
  const displayedImages = images.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Gallery Grid */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {displayedImages.map((image, index) => (
          <motion.div
            key={`${image.name}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <HomepageEnhancedGalleryItem
              file={image}
              isDownloading={isDownloading}
              isAuthenticated={isAuthenticated}
              onView={onView}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* View More Button */}
      {images.length > 8 && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button
            onClick={onNavigateToGallery}
            className="bg-figuro-accent hover:bg-figuro-accent-hover px-8 py-3 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-figuro-accent/25"
          >
            View All Creations
            <ArrowRight size={18} className="ml-2" />
          </Button>
          <p className="text-white/60 text-sm mt-3">
            Showing {displayedImages.length} of {images.length} items
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default HomepageEnhancedGalleryGrid;
