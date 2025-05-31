
import React, { useState, useMemo } from "react";
import { Figurine } from "@/types/figurine";
import { Button } from "@/components/ui/button";
import { Download, Eye, Upload, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import OptimizedModelPreview from "../performance/OptimizedModelPreview";

interface ModelPreviewGridProps {
  figurines: Figurine[];
  loading: boolean;
  onDownload: (figurine: Figurine) => void;
  onViewModel: (figurine: Figurine) => void;
  onTogglePublish: (figurine: Figurine) => void;
  onUploadModel: (figurine: Figurine) => void;
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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Filter and sort figurines
  const processedFigurines = useMemo(() => {
    return figurines.filter(figurine => figurine && figurine.id);
  }, [figurines]);

  const handleImageError = (figurineId: string) => {
    setImageErrors(prev => new Set(prev).add(figurineId));
  };

  const FigurineCard = ({ figurine }: { figurine: Figurine }) => {
    const isTextTo3D = figurine.style === 'text-to-3d' || figurine.title.startsWith('Text-to-3D:');
    const isWebIcon = figurine.file_type === 'web-icon' || figurine.title.startsWith('Web Icon:');
    const hasModel = !!figurine.model_url;
    const imageUrl = figurine.saved_image_url || figurine.image_url;
    const hasImageError = imageErrors.has(figurine.id);

    return (
      <div className={cn(
        "bg-white/5 rounded-lg border border-white/10 overflow-hidden transition-all duration-200 hover:bg-white/10 hover:border-white/20",
        viewMode === "list" ? "flex items-center" : "flex flex-col"
      )}>
        {/* Preview Section */}
        <div className={cn(
          "relative bg-gray-800/50",
          viewMode === "list" ? "w-32 h-32 flex-shrink-0" : "aspect-square w-full"
        )}>
          {hasModel && !hasImageError ? (
            <OptimizedModelPreview
              modelUrl={figurine.model_url!}
              fileName={figurine.title}
            />
          ) : imageUrl && !hasImageError ? (
            <img
              src={imageUrl}
              alt={figurine.title}
              className="w-full h-full object-cover"
              onError={() => handleImageError(figurine.id)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700/50">
              <div className="text-center text-white/50">
                <div className="w-8 h-8 bg-white/10 rounded-lg mx-auto mb-2"></div>
                <p className="text-xs">No Preview</p>
              </div>
            </div>
          )}

          {/* Overlay for status indicators */}
          <div className="absolute top-2 right-2 flex gap-1">
            {isTextTo3D && (
              <div className="bg-blue-500/80 text-white text-xs px-1.5 py-0.5 rounded">
                3D
              </div>
            )}
            {isWebIcon && (
              <div className="bg-purple-500/80 text-white text-xs px-1.5 py-0.5 rounded">
                ICON
              </div>
            )}
            {figurine.is_public ? (
              <Globe size={12} className="text-green-400" />
            ) : (
              <Lock size={12} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className={cn(
          "p-3",
          viewMode === "list" ? "flex-1 flex items-center justify-between" : "flex-1"
        )}>
          <div className={cn(viewMode === "list" ? "flex-1" : "mb-3")}>
            <h3 className="font-medium text-white text-sm truncate mb-1">
              {figurine.title}
            </h3>
            <p className="text-xs text-white/60 truncate">
              {new Date(figurine.created_at).toLocaleDateString()}
            </p>
            {figurine.style && (
              <p className="text-xs text-white/40 capitalize mt-1">
                {figurine.style.replace('-', ' ')}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className={cn(
            "flex gap-1",
            viewMode === "list" ? "flex-row" : "flex-wrap"
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload(figurine)}
              className="h-8 px-2 text-white/70 hover:text-white hover:bg-white/10"
              title="Download"
            >
              <Download size={14} />
            </Button>

            {hasModel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModel(figurine)}
                className="h-8 px-2 text-white/70 hover:text-white hover:bg-white/10"
                title="View 3D Model"
              >
                <Eye size={14} />
              </Button>
            )}

            {!isWebIcon && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUploadModel(figurine)}
                className="h-8 px-2 text-white/70 hover:text-white hover:bg-white/10"
                title="Upload 3D Model"
              >
                <Upload size={14} />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePublish(figurine)}
              className={cn(
                "h-8 px-2 hover:bg-white/10",
                figurine.is_public ? "text-green-400 hover:text-green-300" : "text-white/70 hover:text-white"
              )}
              title={figurine.is_public ? "Make Private" : "Make Public"}
            >
              {figurine.is_public ? <Globe size={14} /> : <Lock size={14} />}
            </Button>
          </div>
        </div>
      </div>
    );
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
        <h3 className="text-lg font-medium text-white mb-2">No figurines yet</h3>
        <p className="text-white/60 max-w-sm mx-auto">
          Start creating your first figurine to see it here. Your creations will appear in this gallery.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "gap-4",
      viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "flex flex-col"
    )}>
      {processedFigurines.map((figurine) => (
        <FigurineCard key={figurine.id} figurine={figurine} />
      ))}
    </div>
  );
};

export default ModelPreviewGrid;
