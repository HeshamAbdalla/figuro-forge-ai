
import React from 'react';
import { motion } from 'framer-motion';
import { Figurine } from '@/types/figurine';
import SimpleFigurineCard from './SimpleFigurineCard';
import { Skeleton } from '@/components/ui/skeleton';

interface SimpleFigurineGridProps {
  figurines: Figurine[];
  loading: boolean;
  error: string | null;
  onDownload: (figurine: Figurine) => void;
  onViewModel: (figurine: Figurine) => void;
  onTogglePublish?: (figurine: Figurine) => void;
  onUploadModel?: (figurine: Figurine) => void;
}

const SimpleFigurineGrid: React.FC<SimpleFigurineGridProps> = ({
  figurines,
  loading,
  error,
  onDownload,
  onViewModel,
  onTogglePublish,
  onUploadModel
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="glass-panel rounded-lg overflow-hidden">
            <Skeleton className="aspect-square w-full bg-white/10" />
            <div className="p-3">
              <Skeleton className="h-4 w-3/4 bg-white/10 mb-2" />
              <Skeleton className="h-3 w-1/2 bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4 bg-red-900/20 rounded-lg border border-red-900/30">
        <p className="text-destructive font-medium mb-2">Error</p>
        <p className="text-white/70">{error}</p>
      </div>
    );
  }

  if (figurines.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold text-white mb-4">No figurines yet</h3>
        <p className="text-white/60">
          Create your first figurine to see it here.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {figurines.map((figurine, index) => (
        <motion.div
          key={figurine.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <SimpleFigurineCard
            figurine={figurine}
            onDownload={onDownload}
            onViewModel={onViewModel}
            onTogglePublish={onTogglePublish}
            onUploadModel={onUploadModel}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SimpleFigurineGrid;
