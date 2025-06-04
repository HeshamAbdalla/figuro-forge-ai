
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, Eye, Upload, Globe, Lock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import VirtualizedGalleryGrid from "./VirtualizedGalleryGrid";
import { useImageTo3DRecovery } from "@/hooks/useImageTo3DRecovery";
import { useToast } from "@/hooks/use-toast";

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
  onRefresh?: () => void;
  viewMode: "grid" | "list";
}

const ModelPreviewGrid: React.FC<ModelPreviewGridProps> = ({
  figurines,
  loading,
  onDownload,
  onViewModel,
  onTogglePublish,
  onUploadModel,
  onRefresh,
  viewMode
}) => {
  const { runRecovery, isRecovering } = useImageTo3DRecovery();
  const { toast } = useToast();

  // Filter and sort figurines
  const processedFigurines = useMemo(() => {
    const filtered = figurines.filter(figurine => figurine && figurine.id);
    console.log(`📊 [MODEL-PREVIEW-GRID] Processed ${filtered.length} figurines for gallery`);
    
    // Log model availability
    const withModels = filtered.filter(f => f.model_url);
    const withoutModels = filtered.filter(f => !f.model_url);
    
    console.log(`📊 [MODEL-PREVIEW-GRID] Models: ${withModels.length} with URLs, ${withoutModels.length} without URLs`);
    
    return filtered;
  }, [figurines]);

  const handleRecovery = async () => {
    try {
      const result = await runRecovery();
      
      if (result.linked > 0 && onRefresh) {
        // Refresh the gallery to show recovered models
        setTimeout(() => {
          onRefresh();
        }, 1000);
      }
    } catch (error) {
      console.error('❌ [MODEL-PREVIEW-GRID] Recovery error:', error);
    }
  };

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
        <p className="text-white/60 max-w-sm mx-auto mb-6">
          Upload some models or create figurines to see them here. Your creations will appear in this gallery.
        </p>
        
        {/* Recovery action for empty gallery */}
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={handleRecovery}
            disabled={isRecovering}
            variant="outline"
            className="border-white/20 text-white/70 hover:bg-white/10"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRecovering && "animate-spin")} />
            {isRecovering ? 'Searching...' : 'Find Missing Models'}
          </Button>
          <p className="text-xs text-white/50 max-w-xs">
            If you had 3D models that aren't showing up, this will search for and recover them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recovery action in header area */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-white/60">
          {processedFigurines.length} items in gallery
        </div>
        
        <div className="flex gap-2">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          
          <Button
            onClick={handleRecovery}
            disabled={isRecovering}
            variant="outline"
            size="sm"
            className="border-white/20 text-white/70 hover:bg-white/10"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRecovering && "animate-spin")} />
            {isRecovering ? 'Searching...' : 'Find Missing'}
          </Button>
        </div>
      </div>

      <VirtualizedGalleryGrid
        figurines={processedFigurines}
        loading={loading}
        onDownload={onDownload}
        onViewModel={onViewModel}
        onTogglePublish={onTogglePublish}
        onUploadModel={onUploadModel}
        viewMode={viewMode}
      />
    </div>
  );
};

export default ModelPreviewGrid;
