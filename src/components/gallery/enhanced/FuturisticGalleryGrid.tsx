
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Box, Eye, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Figurine } from '@/types/figurine';
import EnhancedModelDialog from './EnhancedModelDialog';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';

interface FuturisticGalleryGridProps {
  figurines: Figurine[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onViewModel: (figurine: Figurine) => void;
  onDelete?: (figurine: Figurine) => Promise<void>;
}

const FuturisticGalleryGrid: React.FC<FuturisticGalleryGridProps> = ({
  figurines,
  loading,
  viewMode,
  onViewModel,
  onDelete
}) => {
  const [selectedFigurine, setSelectedFigurine] = useState<Figurine | null>(null);
  const [modelViewerOpen, setModelViewerOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [figurineToDelete, setFigurineToDelete] = useState<Figurine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewModel = (figurine: Figurine) => {
    if (!figurine.model_url) {
      return;
    }
    setSelectedFigurine(figurine);
    setModelViewerOpen(true);
  };

  const handleDeleteClick = (figurine: Figurine) => {
    setFigurineToDelete(figurine);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!figurineToDelete || !onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(figurineToDelete);
      setShowDeleteModal(false);
      setFigurineToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-figuro-accent" />
          <p className="text-white/60">Loading your collection...</p>
        </div>
      </div>
    );
  }

  if (figurines.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-white/60 mb-4">
          <p>No figurines found in your collection.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
        {figurines.map((figurine, index) => {
          const isTextTo3D = figurine.style === 'text-to-3d' || figurine.title.startsWith('Text-to-3D:');
          const isWebIcon = figurine.file_type === 'web-icon';
          const imageUrl = figurine.saved_image_url || figurine.image_url;
          
          return (
            <motion.div
              key={figurine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative overflow-hidden aspect-square bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {/* Image/Preview */}
              <div className="relative w-full h-full">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={figurine.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                    <div className="text-center text-white/60">
                      <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded-lg flex items-center justify-center">
                        {isTextTo3D ? (
                          <Box size={24} className="text-figuro-accent" />
                        ) : (
                          <Sparkles size={24} className="text-white/40" />
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {isTextTo3D ? '3D Model' : 'Preview unavailable'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Type badges */}
                <div className="absolute top-3 left-3 z-10 flex gap-2">
                  {isTextTo3D && (
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
                  {figurine.model_url && !isTextTo3D && (
                    <Badge className="bg-blue-500/90 text-white text-xs px-2 py-1 backdrop-blur-sm">
                      <Box size={10} className="mr-1" />
                      3D Model
                    </Badge>
                  )}
                </div>

                {/* Enhanced Action Bar */}
                <motion.div
                  className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <div className="flex justify-center gap-2">
                    {/* View Button */}
                    {figurine.model_url && (
                      <Button
                        onClick={() => handleViewModel(figurine)}
                        size="sm"
                        className="h-8 px-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:scale-105"
                      >
                        <Eye size={14} className="mr-1.5" />
                        View 3D
                      </Button>
                    )}

                    {/* Download Button */}
                    <Button
                      onClick={() => {
                        // Handle download logic here if needed
                        console.log('Download figurine:', figurine.title);
                      }}
                      size="sm"
                      className="h-8 px-3 bg-figuro-accent/20 hover:bg-figuro-accent/30 border border-figuro-accent/30 text-figuro-accent backdrop-blur-sm transition-all duration-200 hover:scale-105"
                    >
                      <Download size={14} className="mr-1.5" />
                      Download
                    </Button>

                    {/* Delete Button */}
                    {onDelete && (
                      <Button
                        onClick={() => handleDeleteClick(figurine)}
                        size="sm"
                        className="h-8 px-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:text-red-300"
                      >
                        <Trash2 size={14} className="mr-1.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </motion.div>

                {/* File info footer */}
                <motion.div
                  className="absolute bottom-16 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2">
                    {figurine.model_url ? (
                      <Box size={14} className="text-figuro-accent flex-shrink-0" />
                    ) : isWebIcon ? (
                      <Sparkles size={14} className="text-purple-400 flex-shrink-0" />
                    ) : (
                      <Sparkles size={14} className="text-white/70 flex-shrink-0" />
                    )}
                    <span className="text-white text-xs font-medium truncate">
                      {figurine.title}
                    </span>
                  </div>
                </motion.div>

                {/* Subtle border glow */}
                <div className="absolute inset-0 rounded-xl border border-figuro-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Model Viewer Dialog */}
      <EnhancedModelDialog
        open={modelViewerOpen}
        onOpenChange={setModelViewerOpen}
        modelUrl={selectedFigurine?.model_url || null}
        fileName={selectedFigurine?.title}
        onClose={() => {
          setModelViewerOpen(false);
          setSelectedFigurine(null);
        }}
      />

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Figurine"
        description={`Are you sure you want to delete this ${figurineToDelete?.model_url ? '3D model' : figurineToDelete?.file_type === 'web-icon' ? 'web icon' : 'figurine'}? This action cannot be undone.`}
        itemName={figurineToDelete?.title}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default FuturisticGalleryGrid;
