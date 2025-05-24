
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import GalleryItem from "./GalleryItem";
import AnimatedItem from "@/components/animations/AnimatedItem";
import StaggerContainer from "@/components/animations/StaggerContainer";

interface BucketImage {
  name: string;
  url: string;
  id: string;
  created_at: string;
  fullPath?: string;
  type: 'image' | '3d-model';
}

interface GalleryGridProps {
  images: BucketImage[];
  isLoading: boolean;
  onDownload: (url: string, name: string) => void;
  onViewModel: (url: string) => void;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ 
  images, 
  isLoading, 
  onDownload, 
  onViewModel 
}) => {
  if (isLoading) {
    return (
      <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <AnimatedItem key={item}>
            <div className="glass-panel">
              <div className="p-0">
                <div className="aspect-square w-full">
                  <Skeleton className="h-full w-full bg-white/5 loading-shine" />
                </div>
              </div>
            </div>
          </AnimatedItem>
        ))}
      </StaggerContainer>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-white/70 mb-4">No images found in the bucket yet.</p>
        <p className="text-white/50 mb-8">Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((file) => (
        <AnimatedItem key={file.id}>
          <GalleryItem 
            file={file} 
            onDownload={onDownload} 
            onViewModel={onViewModel} 
          />
        </AnimatedItem>
      ))}
    </div>
  );
};

export default GalleryGrid;
