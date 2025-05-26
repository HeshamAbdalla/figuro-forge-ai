
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Eye, Box } from "lucide-react";
import { BucketImage } from "../types";

interface GalleryItemOverlayProps {
  file: BucketImage;
  isDownloading: boolean;
  onDownload: (e: React.MouseEvent) => void;
  onView: (e: React.MouseEvent) => void;
  onGenerate3D?: (e: React.MouseEvent) => void;
}

const GalleryItemOverlay: React.FC<GalleryItemOverlayProps> = ({
  file,
  isDownloading,
  onDownload,
  onView,
  onGenerate3D
}) => {
  const isImage = file.type === 'image';
  const is3DModel = file.type === '3d-model';

  return (
    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
          onClick={onView}
          title={is3DModel ? "View in Enhanced 3D Viewer" : "View in Enhanced Image Viewer"}
        >
          <Eye size={16} />
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
          onClick={onDownload}
          disabled={isDownloading}
          title="Download File"
        >
          <Download size={16} />
        </Button>
        
        {isImage && onGenerate3D && (
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
            onClick={onGenerate3D}
            title="Generate 3D Model"
          >
            <Box size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default GalleryItemOverlay;
