
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BucketImage } from "@/components/gallery/types";
import StaggerContainer from "@/components/animations/StaggerContainer";
import AnimatedItem from "@/components/animations/AnimatedItem";
import AnimatedSection from "@/components/animations/AnimatedSection";
import HomepageEnhancedGalleryItem from "./HomepageEnhancedGalleryItem";

interface HomepageEnhancedGalleryGridProps {
  images: BucketImage[];
  isDownloading: boolean;
  isAuthenticated: boolean;
  onView: (url: string, fileName: string, fileType: 'image' | '3d-model') => void;
  onDownload: (url: string, name: string) => void;
  onNavigateToGallery: () => void;
}

const HomepageEnhancedGalleryGrid: React.FC<HomepageEnhancedGalleryGridProps> = ({
  images,
  isDownloading,
  isAuthenticated,
  onView,
  onDownload,
  onNavigateToGallery
}) => {
  // Limit to 8 items for better homepage display
  const limitedImages = images.slice(0, 8);

  // Separate 3D models and regular images for better display
  const models3D = limitedImages.filter(file => file.type === '3d-model');
  const regularImages = limitedImages.filter(file => file.type !== '3d-model');
  
  // Mix them for a balanced display, prioritizing 3D models
  const balancedImages = [
    ...models3D.slice(0, 4),
    ...regularImages.slice(0, 4)
  ].slice(0, 8);

  return (
    <>
      {/* Enhanced stats section */}
      <AnimatedSection delay={0.2} className="text-center mb-8">
        <div className="flex flex-wrap justify-center items-center gap-6 text-white/60">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-figuro-accent" />
            <span className="text-sm">{models3D.length} 3D Models</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live Gallery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{images.length}+ Total Creations</span>
          </div>
        </div>
      </AnimatedSection>

      {/* Enhanced grid with responsive layout */}
      <StaggerContainer 
        staggerDelay={0.1} 
        initialDelay={0.3}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
      >
        {balancedImages.map((file) => (
          <AnimatedItem key={file.id}>
            <HomepageEnhancedGalleryItem
              file={file}
              isDownloading={isDownloading}
              isAuthenticated={isAuthenticated}
              onView={onView}
              onDownload={onDownload}
            />
          </AnimatedItem>
        ))}
      </StaggerContainer>
      
      {/* Enhanced call-to-action */}
      <AnimatedSection delay={0.8} className="flex flex-col items-center mt-12 space-y-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onNavigateToGallery}
            size="lg"
            className="bg-gradient-to-r from-figuro-accent to-purple-600 hover:from-figuro-accent-hover hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-figuro-accent/25 transition-all duration-300"
          >
            Explore Full Gallery 
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
        
        <p className="text-white/50 text-sm max-w-md text-center">
          Discover thousands of AI-generated figurines and 3D models created by our community
        </p>
      </AnimatedSection>
    </>
  );
};

export default HomepageEnhancedGalleryGrid;
