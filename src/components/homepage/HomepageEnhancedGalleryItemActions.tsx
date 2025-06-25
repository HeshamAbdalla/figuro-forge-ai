
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Eye, Download, Trash2, Loader2 } from "lucide-react";
import { BucketImage } from "@/components/gallery/types";

interface HomepageEnhancedGalleryItemActionsProps {
  file: BucketImage;
  isDownloading: boolean;
  isAuthenticated: boolean;
  onView: (url: string, fileName: string, fileType: 'image' | '3d-model' | 'web-icon') => void;
  onDownload: (url: string, name: string) => void;
  onDelete?: (file: BucketImage) => Promise<void>;
}

const HomepageEnhancedGalleryItemActions: React.FC<HomepageEnhancedGalleryItemActionsProps> = ({
  file,
  isDownloading,
  isAuthenticated,
  onView,
  onDownload,
  onDelete
}) => {
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(file.url, file.name, file.type);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(file.url, file.name);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(file);
    }
  };

  const is3DModel = file.type === '3d-model';
  const isWebIcon = file.type === 'web-icon';

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="flex justify-center gap-2">
        {/* View Button */}
        <Button
          onClick={handleView}
          size="sm"
          className="h-8 px-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:scale-105"
        >
          <Eye size={14} className="mr-1.5" />
          {is3DModel ? 'View 3D' : isWebIcon ? 'View Icon' : 'View'}
        </Button>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          size="sm"
          className="h-8 px-3 bg-figuro-accent/20 hover:bg-figuro-accent/30 border border-figuro-accent/30 text-figuro-accent backdrop-blur-sm transition-all duration-200 hover:scale-105 disabled:opacity-50"
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

        {/* Delete Button - Only show for authenticated users */}
        {isAuthenticated && onDelete && (
          <Button
            onClick={handleDelete}
            size="sm"
            className="h-8 px-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:text-red-300"
          >
            <Trash2 size={14} className="mr-1.5" />
            Delete
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default HomepageEnhancedGalleryItemActions;
