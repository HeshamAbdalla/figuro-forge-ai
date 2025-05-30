
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Box, RefreshCw } from "lucide-react";

interface GalleryHeaderProps {
  onUploadClick?: () => void;
  onRefresh?: () => void;
}

const GalleryHeader: React.FC<GalleryHeaderProps> = ({ onUploadClick, onRefresh }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-16"
    >
      <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gradient">Community Gallery</h1>
      <p className="text-lg text-white/70 max-w-3xl mx-auto">
        See figurines and 3D models created by the community. Upload your own 3D models to share!
      </p>
      
      <div className="flex justify-center gap-4 mt-8">
        {onUploadClick && (
          <Button 
            onClick={onUploadClick}
            className="bg-figuro-accent hover:bg-figuro-accent-hover flex items-center gap-2"
          >
            <Box size={18} />
            Upload 3D Model
          </Button>
        )}
        
        {onRefresh && (
          <Button 
            onClick={onRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default GalleryHeader;
