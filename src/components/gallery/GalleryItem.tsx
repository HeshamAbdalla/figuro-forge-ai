
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Eye, Box } from "lucide-react";
import { BucketImage } from "./types";
import { useSecureDownload } from "@/hooks/useSecureDownload";

interface GalleryItemProps {
  file: BucketImage;
  onDownload: (url: string, name: string) => void;
  onViewModel: (url: string) => void;
  onGenerate3D?: (url: string, name: string) => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ 
  file, 
  onDownload, 
  onViewModel,
  onGenerate3D 
}) => {
  const [imageError, setImageError] = useState(false);
  const { downloadFile, isDownloading } = useSecureDownload();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await downloadFile(file.url, file.name);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to original download method
      onDownload(file.url, file.name);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewModel(file.url);
  };

  const handleGenerate3D = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGenerate3D) {
      onGenerate3D(file.url, file.name);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const isImage = file.type === 'image';
  const is3DModel = file.type === '3d-model';

  return (
    <div className="glass-panel rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-200">
      <div className="aspect-square relative overflow-hidden bg-white/5">
        {!imageError ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white/60">
              {is3DModel ? (
                <Box className="w-12 h-12 mx-auto mb-2" />
              ) : (
                <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded" />
              )}
              <p className="text-sm">Preview unavailable</p>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
              onClick={handleView}
            >
              <Eye size={16} />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download size={16} />
            </Button>
            
            {isImage && onGenerate3D && (
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                onClick={handleGenerate3D}
                title="Generate 3D Model"
              >
                <Box size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-medium truncate mb-1">{file.name}</h3>
        <p className="text-white/60 text-sm">
          {new Date(file.created_at).toLocaleDateString()}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/80">
            {is3DModel ? '3D Model' : 'Image'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GalleryItem;
