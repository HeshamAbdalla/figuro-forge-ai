
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Box, Image as ImageIcon, Sparkles } from "lucide-react";
import { BucketImage } from "@/components/gallery/types";
import HomepageEnhancedModelPreview from "./HomepageEnhancedModelPreview";
import HomepageEnhancedGalleryItemActions from "./HomepageEnhancedGalleryItemActions";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

interface HomepageEnhancedGalleryItemProps {
  file: BucketImage;
  isDownloading: boolean;
  isAuthenticated: boolean;
  onView: (url: string, fileName: string, fileType: 'image' | '3d-model' | 'web-icon') => void;
  onDownload: (url: string, name: string) => void;
  onDelete?: (file: BucketImage) => Promise<void>;
}

const HomepageEnhancedGalleryItem: React.FC<HomepageEnhancedGalleryItemProps> = ({
  file,
  isDownloading,
  isAuthenticated,
  onView,
  onDownload,
  onDelete
}) => {
  const [imageError, setImageError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDeleteClick = async (fileToDelete: BucketImage) => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(file);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isImage = file.type === 'image';
  const is3DModel = file.type === '3d-model';
  const isWebIcon = file.type === 'web-icon';
  const isTextTo3DFile = file.fullPath?.includes('figurine-models/') || false;

  const renderPreview = () => {
    if (is3DModel) {
      return (
        <HomepageEnhancedModelPreview 
          modelUrl={file.url} 
          fileName={file.name}
        />
      );
    }

    if (!imageError) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={handleImageError}
          loading="lazy"
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <div className="text-center text-white/60">
          <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-white/20 rounded"></div>
          </div>
          <p className="text-sm font-medium">Preview unavailable</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.div
        className="group relative overflow-hidden aspect-square"
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Main card with glass morphism */}
        <div className="relative w-full h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          
          {/* Preview area */}
          <div className="relative w-full h-full">
            {renderPreview()}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Type badges */}
            <div className="absolute top-3 left-3 z-10 flex gap-2">
              {isTextTo3DFile && (
                <Badge className="bg-figuro-accent/90 text-white text-xs px-2 py-1 backdrop-blur-sm">
                  <Sparkles size={10} className="mr-1" />
                  Text-to-3D
                </Badge>
              )}
              {isWebIcon && (
                <Badge className="bg-purple-500/90 text-white text-xs px-2 py-1 backdrop-blur-sm">
                  Web Icon
                </Badge>
              )}
              {is3DModel && !isTextTo3DFile && (
                <Badge className="bg-blue-500/90 text-white text-xs px-2 py-1 backdrop-blur-sm">
                  <Box size={10} className="mr-1" />
                  3D Model
                </Badge>
              )}
            </div>
            
            {/* Enhanced Quick Action Bar */}
            <HomepageEnhancedGalleryItemActions
              file={file}
              isDownloading={isDownloading}
              isAuthenticated={isAuthenticated}
              onView={onView}
              onDownload={onDownload}
              onDelete={onDelete ? handleDeleteClick : undefined}
            />
          </div>
          
          {/* Subtle border glow */}
          <div className="absolute inset-0 rounded-xl border border-figuro-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
        
        {/* Enhanced file info footer */}
        <motion.div
          className="absolute bottom-16 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            {is3DModel ? (
              <Box size={14} className="text-figuro-accent flex-shrink-0" />
            ) : isWebIcon ? (
              <Sparkles size={14} className="text-purple-400 flex-shrink-0" />
            ) : (
              <ImageIcon size={14} className="text-white/70 flex-shrink-0" />
            )}
            <span className="text-white text-xs font-medium truncate">
              {file.name}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        description={`Are you sure you want to delete this ${is3DModel ? '3D model' : isWebIcon ? 'web icon' : 'image'}? This action cannot be undone.`}
        itemName={file.name}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default HomepageEnhancedGalleryItem;
