
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/animations/AnimatedSection";

interface HomepageGalleryEmptyProps {
  onNavigateToStudio: () => void;
}

const HomepageGalleryEmpty: React.FC<HomepageGalleryEmptyProps> = ({ onNavigateToStudio }) => {
  return (
    <AnimatedSection delay={0.3} className="text-center py-16">
      <p className="text-white/70">No images found in the gallery yet. Be the first to create one!</p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={onNavigateToStudio}
          className="mt-4 bg-figuro-accent hover:bg-figuro-accent-hover"
        >
          Create Your First Figurine
        </Button>
      </motion.div>
    </AnimatedSection>
  );
};

export default HomepageGalleryEmpty;
