
import React, { useState, useMemo, useRef, useEffect } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { Button } from "@/components/ui/button";
import { Download, Eye, Upload, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import OptimizedModelPreview from "../performance/OptimizedModelPreview";

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

interface VirtualizedGalleryGridProps {
  figurines: GalleryFile[];
  loading: boolean;
  onDownload: (figurine: GalleryFile) => void;
  onViewModel: (figurine: GalleryFile) => void;
  onTogglePublish: (figurine: GalleryFile) => void;
  onUploadModel: (figurine: GalleryFile) => void;
  viewMode: "grid" | "list";
}

const ITEM_SIZE = 280; // Size of each grid item
const GAP = 16; // Gap between items

const GridCell = React.memo(({ 
  columnIndex, 
  rowIndex, 
  style, 
  data 
}: { 
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    figurines: GalleryFile[];
    columnsPerRow: number;
    onDownload: (figurine: GalleryFile) => void;
    onViewModel: (figurine: GalleryFile) => void;
    onTogglePublish: (figurine: GalleryFile) => void;
    onUploadModel: (figurine: GalleryFile) => void;
  };
}) => {
  const { figurines, columnsPerRow, onDownload, onViewModel, onTogglePublish, onUploadModel } = data;
  const index = rowIndex * columnsPerRow + columnIndex;
  const figurine = figurines[index];

  if (!figurine) {
    return <div style={style} />;
  }

  const isTextTo3D = figurine.style === 'text-to-3d' || figurine.title.startsWith('Text-to-3D:');
  const isWebIcon = figurine.file_type === 'web-icon' || figurine.title.startsWith('Web Icon:');
  const is3DModel = figurine.file_type === '3d-model' || !!figurine.model_url;
  const hasModel = !!figurine.model_url;
  const imageUrl = figurine.saved_image_url || figurine.image_url;

  return (
    <div
      style={{
        ...style,
        left: (style.left as number) + GAP / 2,
        top: (style.top as number) + GAP / 2,
        width: (style.width as number) - GAP,
        height: (style.height as number) - GAP,
      }}
    >
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden transition-all duration-200 hover:bg-white/10 hover:border-white/20 h-full flex flex-col">
        {/* Preview Section */}
        <div className="relative bg-gray-800/50 aspect-square">
          {hasModel ? (
            <OptimizedModelPreview
              modelUrl={figurine.model_url!}
              fileName={figurine.title}
            />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={figurine.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700/50">
              <div className="text-center text-white/50">
                <div className="w-8 h-8 bg-white/10 rounded-lg mx-auto mb-2"></div>
                <p className="text-xs">No Preview</p>
              </div>
            </div>
          )}

          {/* Status indicators */}
          <div className="absolute top-2 right-2 flex gap-1">
            {is3DModel && (
              <div className="bg-blue-500/80 text-white text-xs px-1.5 py-0.5 rounded">
                3D
              </div>
            )}
            {isTextTo3D && (
              <div className="bg-purple-500/80 text-white text-xs px-1.5 py-0.5 rounded">
                T2D
              </div>
            )}
            {isWebIcon && (
              <div className="bg-orange-500/80 text-white text-xs px-1.5 py-0.5 rounded">
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
        <div className="p-3 flex-1 flex flex-col">
          <div className="mb-3 flex-1">
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
          <div className="flex gap-1 flex-wrap">
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

            {!isWebIcon && !hasModel && (
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
    </div>
  );
});

GridCell.displayName = 'GridCell';

const VirtualizedGalleryGrid: React.FC<VirtualizedGalleryGridProps> = ({
  figurines,
  loading,
  onDownload,
  onViewModel,
  onTogglePublish,
  onUploadModel,
  viewMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Calculate grid dimensions
  const columnsPerRow = useMemo(() => {
    if (viewMode === "list") return 1;
    return Math.max(1, Math.floor(containerSize.width / (ITEM_SIZE + GAP)));
  }, [containerSize.width, viewMode]);

  const rowCount = Math.ceil(figurines.length / columnsPerRow);

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

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

  if (figurines.length === 0) {
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

  if (containerSize.width === 0) {
    return <div ref={containerRef} className="w-full h-96" />;
  }

  const itemData = {
    figurines,
    columnsPerRow,
    onDownload,
    onViewModel,
    onTogglePublish,
    onUploadModel
  };

  return (
    <div ref={containerRef} className="w-full h-[70vh]">
      <Grid
        columnCount={columnsPerRow}
        columnWidth={ITEM_SIZE + GAP}
        height={containerSize.height}
        rowCount={rowCount}
        rowHeight={ITEM_SIZE + GAP}
        width={containerSize.width}
        itemData={itemData}
        overscanRowCount={1}
        overscanColumnCount={1}
      >
        {GridCell}
      </Grid>
    </div>
  );
};

export default VirtualizedGalleryGrid;
