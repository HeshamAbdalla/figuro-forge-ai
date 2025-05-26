
import React from "react";
import StaggerContainer from "@/components/animations/StaggerContainer";
import AnimatedItem from "@/components/animations/AnimatedItem";
import { Skeleton } from "@/components/ui/skeleton";

const HomepageGalleryLoading: React.FC = () => {
  return (
    <StaggerContainer 
      staggerDelay={0.05} 
      initialDelay={0.2}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5"
    >
      {Array(10).fill(0).map((_, index) => (
        <AnimatedItem key={index}>
          <div className="glass-panel h-48 md:h-40">
            <Skeleton className="h-full w-full bg-white/5 loading-shine" />
          </div>
        </AnimatedItem>
      ))}
    </StaggerContainer>
  );
};

export default HomepageGalleryLoading;
