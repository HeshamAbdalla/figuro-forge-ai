
import React, { useState } from "react";
import { BucketImage } from "../types";
import { useSecureDownload } from "@/hooks/useSecureDownload";
import { Eye, Download, Sparkles, Play, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GalleryItemFooter from "./GalleryItemFooter";
import EnhancedThumbnailPreview from "./EnhancedThumbnailPreview";

interface ThumbnailBasedGalleryItemProps {
  file: BucketImage & { thumbnailUrl?: string };
  onDownload: (url: string, name: string) => void;
  onView: (url: string, name: string, type: 'image' | '3d-model' | 'web-icon') => void;
  onGenerate3D?: (url: string, name: string) => void;
  onPreview3D?: (url: string, name: string) => void;
}

const ThumbnailBasedGalleryItem: React.FC<ThumbnailBasedGalleryItemProps> = ({ 
  file, 
  onDownload, 
  onView,
  onGenerate3D,
  onPreview3D
}) => {
  const [imageError, setImageError] = useState(false);
  const { secureDownload, isDownloading } = useSecureDownload();

  // Check if this is a text-to-3D generated file
  const isTextTo3DFile = file.fullPath?.includes('figurine-models/') || false;
  const isImage = file.type === 'image';
  const is3DModel = file.type === '3d-model';
  const isWebIcon = file.type === 'web-icon';

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await secureDownload(file.url, file.name);
    } catch (error) {
      console.error('Download failed:', error);
      onDownload(file.url, file.name);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(file.url, file.name, file.type);
  };

  const handlePreview3D = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview3D && is3DModel) {
      onPreview3D(file.url, file.name);
    }
  };

  const handleGenerate3D = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGenerate3D && !isWebIcon) {
      onGenerate3D(file.url, file.name);
    }
  };

  // Determine what to display in the preview area
  const renderPreview = () => {
    if (is3DModel) {
      return (
        <EnhancedThumbnailPreview
          fileName={file.name}
          fullPath={file.fullPath || file.name}
          onPreview3D={() => onPreview3D?.(file.url, file.name)}
          className="w-full h-full"
        />
      );
    }

    // For images and web icons, display normally
    if (!imageError) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
      );
    }

    // Error state
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-white/60">
          <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded" />
          <p className="text-sm">Preview unavailable</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`glass-panel rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-200 ${
      isTextTo3DFile ? 'ring-1 ring-figuro-accent/30' : 
      isWebIcon ? 'ring-1 ring-purple-500/30' : ''
    }`}>
      <div className="relative">
        <div className="aspect-square relative overflow-hidden bg-white/5">
          {renderPreview()}
        </div>
        
        {/* Overlay with action buttons */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex gap-2">
            {/* Download button */}
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/10 backdrop-blur-sm border-0 hover:bg-white/20"
              onClick={handleDownload}
              disabled={isDownloading}
              title={is3DModel ? "Download 3D Model" : isWebIcon ? "Download Web Icon" : "Download Image"}
            >
              <Download size={14} />
            </Button>
            
            {/* View/Preview button */}
            {is3DModel ? (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/10 backdrop-blur-sm border-0 hover:bg-white/20"
                onClick={handlePreview3D}
                title="Preview 3D Model"
              >
                <Play size={14} />
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/10 backdrop-blur-sm border-0 hover:bg-white/20"
                onClick={handleView}
                title={isWebIcon ? "View Web Icon" : "View Image"}
              >
                <Eye size={14} />
              </Button>
            )}
            
            {/* Generate 3D button for regular images only */}
            {onGenerate3D && isImage && !isWebIcon && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/10 backdrop-blur-sm border-0 hover:bg-white/20"
                onClick={handleGenerate3D}
                title="Convert to 3D"
              >
                <Sparkles size={14} />
              </Button>
            )}
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex gap-2">
          {isTextTo3DFile && (
            <Badge className="bg-figuro-accent/80 text-white text-xs px-2 py-1">
              Text-to-3D
            </Badge>
          )}
          {is3DModel && (
            <Badge className="bg-blue-500/80 text-white text-xs px-2 py-1">
              3D Model
            </Badge>
          )}
          {isWebIcon && (
            <Badge className="bg-purple-500/80 text-white text-xs px-2 py-1">
              Web Icon
            </Badge>
          )}
        </div>
      </div>
      
      <GalleryItemFooter file={file} />
    </div>
  );
};

export default ThumbnailBasedGalleryItem;
