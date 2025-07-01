
import React from "react";
import { motion } from "framer-motion";
import { Figurine } from "@/types/figurine";
import Enhanced3DModelCard from "./Enhanced3DModelCard";
import { Loader2, Box } from "lucide-react";

interface Enhanced3DGalleryGridProps {
  figurines: Figurine[];
  loading: boolean;
  onView: (figurine: Figurine) => void;
  onDownload: (figurine: Figurine) => void;
  onShare?: (figurine: Figurine) => void;
}

const Enhanced3DGalleryGrid: React.FC<Enhanced3DGalleryGridProps> = ({
  figurines,
  loading,
  onView,
  onDownload,
  onShare
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-900/50 rounded-lg border border-white/10 overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-gray-800/50" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-700/50 rounded" />
              <div className="h-4 bg-gray-700/30 rounded w-2/3" />
              <div className="h-3 bg-gray-700/30 rounded w-1/2" />
            </div>
          </div>
        ))}
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
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl p-12 max-w-md mx-auto border border-white/10">
          <div className="w-16 h-16 bg-figuro-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Box className="w-8 h-8 text-figuro-accent" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">No 3D Models Found</h3>
          <p className="text-white/70 leading-relaxed">
            No 3D models match your current filters. Try adjusting your search criteria or explore different categories.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {figurines.map((figurine, index) => (
        <motion.div
          key={figurine.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        >
          <Enhanced3DModelCard
            figurine={figurine}
            onView={onView}
            onDownload={onDownload}
            onShare={onShare}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Enhanced3DGalleryGrid;
