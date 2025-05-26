
import React from "react";
import GalleryItem from "./GalleryItem";
import { Skeleton } from "@/components/ui/skeleton";

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
  onView: (url: string, name: string, type: 'image' | '3d-model') => void;
  onGenerate3D?: (url: string, name: string) => void;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ 
  images, 
  isLoading, 
  onDownload, 
  onView,
  onGenerate3D 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="glass-panel rounded-lg overflow-hidden">
            <Skeleton className="aspect-square w-full bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold text-white mb-4">No files yet</h3>
        <p className="text-white/60">
          Upload some models or create figurines to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((file) => (
        <GalleryItem 
          key={file.id} 
          file={file} 
          onDownload={onDownload}
          onView={onView}
          onGenerate3D={onGenerate3D}
        />
      ))}
    </div>
  );
};

export default GalleryGrid;
