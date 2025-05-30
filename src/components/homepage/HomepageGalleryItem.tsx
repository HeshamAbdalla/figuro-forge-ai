
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Eye, Download, Loader2, Image, Box } from "lucide-react";
import { BucketImage } from "@/components/gallery/types";
import ModelPreview from "@/components/gallery/ModelPreview";

interface HomepageGalleryItemProps {
  file: BucketImage;
  isDownloading: boolean;
  isAuthenticated: boolean;
  onView: (url: string, fileName: string, fileType: 'image' | '3d-model' | 'web-icon') => void;
  onDownload: (url: string, name: string) => void;
}

const HomepageGalleryItem: React.FC<HomepageGalleryItemProps> = ({
  file,
  isDownloading,
  isAuthenticated,
  onView,
  onDownload
}) => {
  const handleView = () => {
    onView(file.url, file.name, file.type);
  };

  const handleDownload = () => {
    onDownload(file.url, file.name);
  };

  return (
    <motion.div
      className="glass-panel overflow-hidden aspect-square relative group"
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-full h-full">
        {file.type === '3d-model' ? (
          <ModelPreview 
            modelUrl={file.url} 
            fileName={file.name} 
          />
        ) : (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}
      </div>
      <motion.div 
        className="absolute inset-0 backdrop-blur-md bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        <div className="p-4 w-full flex flex-col items-center">
          <div className="flex items-center gap-1 mb-2">
            {file.type === '3d-model' ? (
              <Box size={14} className="text-figuro-accent" />
            ) : (
              <Image size={14} className="text-white/70" />
            )}
            <span className="text-xs text-white/90">
              {file.type === '3d-model' ? "3D Model" : file.type === 'web-icon' ? "Web Icon" : "Image"}
            </span>
          </div>
          
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={handleView}
              size="sm"
              className="w-full bg-figuro-accent hover:bg-figuro-accent-hover h-8 px-3 transform transition-transform hover:scale-105"
            >
              <Eye size={14} className="mr-1.5" /> 
              {file.type === '3d-model' ? 'View Model' : file.type === 'web-icon' ? 'View Icon' : 'View Image'}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              size="sm"
              variant="outline"
              className="w-full border-white/10 h-8 px-3 transform transition-transform hover:scale-105"
            >
              {isDownloading ? (
                <>
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download size={14} className="mr-1.5" />
                  {isAuthenticated ? 'Download' : 'Sign in'}
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HomepageGalleryItem;
