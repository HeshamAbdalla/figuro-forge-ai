import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Figurine } from "@/types/figurine";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

interface FuturisticGalleryGridProps {
  figurines: Figurine[];
  loading: boolean;
  viewMode: "grid" | "list";
  onViewModel: (figurine: Figurine) => void;
  onDownload?: (figurine: Figurine) => void;
  onDelete?: (figurine: Figurine) => Promise<void>;
}

const FuturisticGalleryGrid: React.FC<FuturisticGalleryGridProps> = ({
  figurines,
  loading,
  viewMode,
  onViewModel,
  onDownload,
  onDelete
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [figurineToDelete, setFigurineToDelete] = useState<Figurine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteClick = (figurine: Figurine) => {
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

  const handleViewClick = (figurine: Figurine) => {
    // Navigate to the dedicated model workspace page
    navigate(`/model/${figurine.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-figuro-accent mx-auto" />
          <p className="text-white/70">Loading community models...</p>
        </div>
      </div>
    );
  }

  if (figurines.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="bg-white/5 rounded-2xl p-12 max-w-md mx-auto">
          <div className="w-16 h-16 bg-figuro-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-8 h-8 text-figuro-accent" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">No Models Found</h3>
          <p className="text-white/70">
            No public models match your current filters. Try adjusting your search or filters.
          </p>
        </div>
      </motion.div>
    );
  }

  const containerClass = viewMode === "grid" 
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    : "space-y-4";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={containerClass}
      >
        {figurines.map((figurine, index) => (
          <motion.div
            key={figurine.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <Card className="bg-white/5 border-white/10 hover:border-figuro-accent/30 transition-all duration-300 overflow-hidden group">
              {/* Image Preview */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={figurine.image_url}
                  alt={figurine.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                  }}
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleViewClick(figurine)}
                    className="bg-white/20 hover:bg-white/30 text-white border-none"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  
                  {onDownload && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onDownload(figurine)}
                      className="bg-figuro-accent/80 hover:bg-figuro-accent text-white border-none"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}

                  {onDelete && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDeleteClick(figurine)}
                      className="bg-red-600/80 hover:bg-red-600 text-white border-none"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-2">
                  {figurine.title}
                </h3>
                
                {figurine.prompt && (
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">
                    {figurine.prompt}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {figurine.style && (
                      <span className="px-2 py-1 bg-figuro-accent/20 text-figuro-accent text-xs rounded-full">
                        {figurine.style}
                      </span>
                    )}
                    
                    {figurine.model_url && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        3D Model
                      </span>
                    )}
                  </div>

                  <div className="text-white/50 text-xs">
                    {new Date(figurine.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Figurine"
        description="Are you sure you want to delete this figurine? This action cannot be undone."
        itemName={figurineToDelete?.title}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default FuturisticGalleryGrid;
