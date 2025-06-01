
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Box, RefreshCw } from "lucide-react";

interface GalleryHeaderProps {
  onUploadClick?: () => void;
  onRefresh?: () => void;
  onCreateNew?: () => void;
}

const GalleryHeader: React.FC<GalleryHeaderProps> = ({ 
  onUploadClick, 
  onRefresh, 
  onCreateNew 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10 flex flex-wrap justify-between items-center"
    >
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Community Gallery</h1>
        <p className="text-white/70">View and manage your 3D models and images with enhanced preview capabilities.</p>
      </div>
      
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        {onCreateNew && (
          <Button 
            onClick={onCreateNew}
            className="bg-figuro-accent hover:bg-figuro-accent-hover flex items-center gap-2"
          >
            <Box size={18} />
            Create New Model
          </Button>
        )}
        
        {onUploadClick && (
          <Button 
            onClick={onUploadClick}
            variant="outline"
            className="flex items-center gap-2"
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
