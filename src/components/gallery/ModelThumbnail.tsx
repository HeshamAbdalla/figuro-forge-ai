
import React from "react";
import { Box, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModelThumbnailProps {
  thumbnailUrl?: string | null;
  fileName: string;
  onViewClick: () => void;
}

const ModelThumbnail: React.FC<ModelThumbnailProps> = ({ 
  thumbnailUrl, 
  fileName, 
  onViewClick 
}) => {
  return (
    <div className="w-full h-full relative bg-gray-800 flex items-center justify-center group">
      {thumbnailUrl ? (
        <img 
          src={thumbnailUrl}
          alt={`${fileName} thumbnail`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-white/60">
          <Box size={48} className="mb-2" />
          <span className="text-xs text-center px-2">3D Model</span>
        </div>
      )}
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <Button
          onClick={onViewClick}
          className="bg-figuro-accent hover:bg-figuro-accent-hover"
        >
          <Eye size={16} className="mr-2" />
          View 3D Model
        </Button>
      </div>
    </div>
  );
};

export default ModelThumbnail;
