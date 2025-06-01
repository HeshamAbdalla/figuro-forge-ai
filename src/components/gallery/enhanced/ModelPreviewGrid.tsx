
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, Eye, Upload, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import VirtualizedGalleryGrid from "./VirtualizedGalleryGrid";

interface GalleryFile {
  id: string;
  title: string;
  style?: string;
  image_url?: string;
  saved_image_url?: string;
  model_url?: string | null;
  created_at: string;
  is_public?: boolean;
  file_type?: string;
}

interface ModelPreviewGridProps {
  figurines: GalleryFile[];
  loading: boolean;
  onDownload: (figurine: GalleryFile) => void;
  onViewModel: (figurine: GalleryFile) => void;
  onTogglePublish: (figurine: GalleryFile) => void;
  onUploadModel: (figurine: GalleryFile) => void;
  viewMode: "grid" | "list";
}

const ModelPreviewGrid: React.FC<ModelPreviewGridProps> = ({
  figurines,
  loading,
  onDownload,
  onViewModel,
  onTogglePublish,
  onUploadModel,
  viewMode
}) => {
  // Filter and sort figurines
  const processedFigurines = useMemo(() => {
    const filtered = figurines.filter(figurine => figurine && figurine.id);
    console.log(`Processed ${filtered.length} figurines for optimized gallery`);
    return filtered;
  }, [figurines]);

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            <div className="aspect-square bg-gray-700/50 animate-pulse"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-700/50 rounded mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-700/30 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (processedFigurines.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-white/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <Eye size={24} className="text-white/50" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No files yet</h3>
        <p className="text-white/60 max-w-sm mx-auto">
          Upload some models or create figurines to see them here. Your creations will appear in this gallery.
        </p>
      </div>
    );
  }

  return (
    <VirtualizedGalleryGrid
      figurines={processedFigurines}
      loading={loading}
      onDownload={onDownload}
      onViewModel={onViewModel}
      onTogglePublish={onTogglePublish}
      onUploadModel={onUploadModel}
      viewMode={viewMode}
    />
  );
};

export default ModelPreviewGrid;
