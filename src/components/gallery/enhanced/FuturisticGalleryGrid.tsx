import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Play, Calendar, User, Sparkles, Zap, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Figurine } from "@/types/figurine";
import FigurineModelDialog from "@/components/figurine/FigurineModelDialog";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

interface FuturisticGalleryGridProps {
  figurines: Figurine[];
  loading: boolean;
  viewMode: "grid" | "list";
  onViewModel: (figurine: Figurine) => void;
  onDelete?: (figurine: Figurine) => Promise<void>;
}

// Helper function to get the best display title
const getDisplayTitle = (figurine: Figurine | null): string => {
  // Handle null figurine case
  if (!figurine) {
    return 'Unknown Item';
  }
  
  // First priority: use the prompt if it exists and isn't empty
  if (figurine.prompt && figurine.prompt.trim()) {
    return figurine.prompt.trim();
  }
  
  // Second priority: clean up the title
  let cleanTitle = figurine.title;
  
  // Remove common prefixes for text-to-3D models
  if (cleanTitle.startsWith('Text-to-3D: ')) {
    cleanTitle = cleanTitle.replace('Text-to-3D: ', '');
  }
  
  // Remove generic "3D Model - " prefixes
  if (cleanTitle.startsWith('3D Model - ')) {
    cleanTitle = cleanTitle.replace('3D Model - ', '');
  }
  
  return cleanTitle || 'Untitled Model';
};

const FuturisticGalleryGrid: React.FC<FuturisticGalleryGridProps> = ({
  figurines,
  loading,
  viewMode,
  onViewModel,
  onDelete
}) => {
  const [selectedFigurine, setSelectedFigurine] = useState<Figurine | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [figurineToDelete, setFigurineToDelete] = useState<Figurine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewModel = (figurine: Figurine) => {
    setSelectedFigurine(figurine);
  };

  const handleDeleteClick = (figurine: Figurine, e: React.MouseEvent) => {
    e.stopPropagation();
    setFigurineToDelete(figurine);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!figurineToDelete || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(figurineToDelete);
      setDeleteModalOpen(false);
      setFigurineToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    img.src = "/placeholder.svg";
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel rounded-2xl overflow-hidden border border-white/10"
          >
            <div className="aspect-square bg-gradient-to-br from-white/5 to-white/10 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-white/10 rounded animate-pulse" />
              <div className="h-3 bg-white/5 rounded animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (figurines.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-figuro-accent/20 to-purple-500/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-figuro-accent" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-4">No models found</h3>
        <p className="text-white/60 max-w-md mx-auto">
          Try adjusting your search filters or be the first to share your amazing 3D creations with the community!
        </p>
      </motion.div>
    );
  }

  const gridCols = viewMode === "list" 
    ? "grid-cols-1" 
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <>
      <div className={cn("grid gap-6", gridCols)}>
        <AnimatePresence>
          {figurines.map((figurine, index) => {
            const displayTitle = getDisplayTitle(figurine);
            
            return (
              <motion.div
                key={figurine.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100
                }}
                className={cn(
                  "group relative glass-panel rounded-2xl overflow-hidden border border-white/10",
                  "hover:border-figuro-accent/30 hover:shadow-glow transition-all duration-500",
                  "transform hover:scale-105 hover:-translate-y-2",
                  viewMode === "list" && "flex flex-row h-32"
                )}
                onMouseEnter={() => setHoveredId(figurine.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image section */}
                <div className={cn(
                  "relative overflow-hidden",
                  viewMode === "list" ? "w-32 h-32 flex-shrink-0" : "aspect-square"
                )}>
                  <img
                    src={figurine.saved_image_url || figurine.image_url || "/placeholder.svg"}
                    alt={displayTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={handleImageError}
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Delete button - only show if onDelete prop is provided */}
                  {onDelete && (
                    <motion.div
                      className="absolute top-3 right-3 z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: hoveredId === figurine.id ? 1 : 0,
                        scale: hoveredId === figurine.id ? 1 : 0.8
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        onClick={(e) => handleDeleteClick(figurine, e)}
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0 bg-red-600/80 hover:bg-red-600 backdrop-blur-sm border border-red-500/30"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </motion.div>
                  )}
                  
                  {/* Floating action button */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: hoveredId === figurine.id ? 1 : 0,
                      scale: hoveredId === figurine.id ? 1 : 0.8
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      onClick={() => handleViewModel(figurine)}
                      className="bg-figuro-accent/90 hover:bg-figuro-accent text-white rounded-full w-14 h-14 shadow-glow"
                    >
                      {figurine.model_url ? <Play className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </Button>
                  </motion.div>

                  {/* Type badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {figurine.metadata?.conversion_type === 'text-to-3d' && (
                      <Badge className="bg-figuro-accent/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        <Zap className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                    {figurine.model_url && (
                      <Badge className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        3D
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content section */}
                <div className={cn(
                  "p-4 flex-1",
                  viewMode === "list" && "flex flex-col justify-center"
                )}>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-figuro-accent transition-colors duration-200">
                      {displayTitle}
                    </h3>
                    
                    {/* Show original title as subtitle if we're displaying the prompt */}
                    {figurine.prompt && figurine.prompt.trim() && figurine.prompt !== figurine.title && viewMode === "grid" && (
                      <p className="text-white/40 text-xs line-clamp-1 leading-relaxed">
                        {figurine.title.replace('Text-to-3D: ', '')}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-white/40 pt-2">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-20">
                          {figurine.metadata?.creator_name || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(figurine.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Futuristic border effect */}
                <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-figuro-accent/0 via-figuro-accent/20 to-figuro-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Model viewer dialog */}
      {selectedFigurine && (
        <FigurineModelDialog
          figurine={selectedFigurine}
          isOpen={!!selectedFigurine}
          onClose={() => setSelectedFigurine(null)}
        />
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Figurine"
        description="Are you sure you want to delete this figurine? This action cannot be undone and will permanently remove the figurine and all associated files."
        itemName={getDisplayTitle(figurineToDelete)}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default FuturisticGalleryGrid;
