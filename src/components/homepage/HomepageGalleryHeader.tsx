
import React from "react";
import AnimatedSection from "@/components/animations/AnimatedSection";

const HomepageGalleryHeader: React.FC = () => {
  return (
    <AnimatedSection delay={0.1} className="flex flex-col items-center mb-16 text-center">
      <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gradient">
        Latest Creations
      </h2>
      <p className="text-white/70 max-w-2xl mx-auto">
        Explore the latest figurines created by our community. Get inspired and start creating your own unique designs.
      </p>
    </AnimatedSection>
  );
};

export default HomepageGalleryHeader;
