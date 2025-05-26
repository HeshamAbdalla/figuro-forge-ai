
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BucketImage } from "@/components/gallery/types";
import StaggerContainer from "@/components/animations/StaggerContainer";
import AnimatedItem from "@/components/animations/AnimatedItem";
import AnimatedSection from "@/components/animations/AnimatedSection";
import HomepageGalleryItem from "./HomepageGalleryItem";

interface HomepageGalleryGridProps {
  images: BucketImage[];
  isDownloading: boolean;
  isAuthenticated: boolean;
  onView: (url: string, fileName: string, fileType: 'image' | '3d-model') => void;
  onDownload: (url: string, name: string) => void;
  onNavigateToGallery: () => void;
}

const HomepageGalleryGrid: React.FC<HomepageGalleryGridProps> = ({
  images,
  isDownloading,
  isAuthenticated,
  onView,
  onDownload,
  onNavigateToGallery
}) => {
  // Limit to 10 items for homepage display
  const limitedImages = images.slice(0, 10);

  return (
    <>
      <StaggerContainer 
        staggerDelay={0.08} 
        initialDelay={0.3}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5"
      >
        {limitedImages.map((file) => (
          <AnimatedItem key={file.id}>
            <HomepageGalleryItem
              file={file}
              isDownloading={isDownloading}
              isAuthenticated={isAuthenticated}
              onView={onView}
              onDownload={onDownload}
            />
          </AnimatedItem>
        ))}
      </StaggerContainer>
      
      <AnimatedSection delay={0.6} className="flex justify-center mt-12">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onNavigateToGallery}
            className="bg-figuro-accent hover:bg-figuro-accent-hover flex items-center gap-2"
          >
            View Full Gallery <ArrowRight size={16} />
          </Button>
        </motion.div>
      </AnimatedSection>
    </>
  );
};

export default HomepageGalleryGrid;
