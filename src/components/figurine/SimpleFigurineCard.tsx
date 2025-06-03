
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download, Box, Upload, GalleryHorizontal, Sparkles, ImageIcon } from 'lucide-react';
import { Figurine } from '@/types/figurine';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface SimpleFigurineCardProps {
  figurine: Figurine;
  onDownload: (figurine: Figurine) => void;
  onViewModel: (figurine: Figurine) => void;
  onTogglePublish?: (figurine: Figurine) => void;
  onUploadModel?: (figurine: Figurine) => void;
}

const SimpleFigurineCard: React.FC<SimpleFigurineCardProps> = ({ 
  figurine, 
  onDownload, 
  onViewModel, 
  onTogglePublish, 
  onUploadModel 
}) => {
  const [imageError, setImageError] = useState(false);

  // Determine if this is a text-to-3D model
  const isTextTo3D = figurine.style === 'text-to-3d' || figurine.title.startsWith('Text-to-3D:');
  const isWebIcon = figurine.file_type === 'web-icon' || figurine.title.includes('web-icon');

  // Clean image URL to prevent cache-busting issues
  const cleanImageUrl = useMemo(() => {
    try {
      if (!figurine.saved_image_url && !figurine.image_url) return '';
      
      const url = new URL(figurine.saved_image_url || figurine.image_url);
      // Remove cache-busting parameters
      ['t', 'cb', 'cache'].forEach(param => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
        }
      });
      return url.toString();
    } catch (e) {
      return figurine.saved_image_url || figurine.image_url;
    }
  }, [figurine.saved_image_url, figurine.image_url]);

  // Get display title (clean up text-to-3D titles)
  const displayTitle = useMemo(() => {
    if (isTextTo3D && figurine.title.startsWith('Text-to-3D: ')) {
      return figurine.title.replace('Text-to-3D: ', '');
    }
    return figurine.title;
  }, [figurine.title, isTextTo3D]);

  const handleImageError = () => {
    setImageError(true);
  };

  const renderPreview = () => {
    // For text-to-3D models, show 3D icon if no image
    if (isTextTo3D && (!cleanImageUrl || imageError)) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-figuro-accent/20 to-figuro-accent/10">
          <div className="text-center">
            <Box size={48} className="text-figuro-accent mx-auto mb-3" />
            <p className="text-figuro-accent font-medium text-sm">3D Model</p>
            <p className="text-white/60 text-xs mt-1">Click to view in 3D</p>
          </div>
        </div>
      );
    }

    // For web icons, show icon placeholder if no image
    if (isWebIcon && (!cleanImageUrl || imageError)) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-500/10">
          <div className="text-center">
            <ImageIcon size={48} className="text-purple-400 mx-auto mb-3" />
            <p className="text-purple-400 font-medium text-sm">Web Icon</p>
          </div>
        </div>
      );
    }

    // Show image if available
    if (cleanImageUrl && !imageError) {
      return (
        <img 
          src={cleanImageUrl}
          alt={displayTitle}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy" 
          onError={handleImageError}
        />
      );
    }

    // Fallback for regular figurines
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <div className="text-center text-white/60">
          <ImageIcon size={32} className="mx-auto mb-2" />
          <p className="text-xs">No preview available</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="glass-panel overflow-hidden h-full group hover:scale-105 transition-transform duration-200">
      <CardHeader className="p-3 border-b border-white/10">
        <CardTitle className="text-sm font-medium truncate flex items-center justify-between">
          <span className="flex items-center gap-2">
            {isTextTo3D && (
              <Sparkles size={14} className="text-figuro-accent flex-shrink-0" title="Text-to-3D Generated" />
            )}
            <span className="truncate">{displayTitle}</span>
            {figurine.model_url && (
              <Box size={14} className="text-figuro-accent flex-shrink-0" title="3D Model Available" />
            )}
          </span>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {isTextTo3D && (
              <Badge variant="secondary" className="text-xs bg-figuro-accent/20 text-figuro-accent">
                3D
              </Badge>
            )}
            {isWebIcon && (
              <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">
                Icon
              </Badge>
            )}
            {figurine.is_public && (
              <Badge variant="secondary" className="text-xs">Published</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <AspectRatio ratio={1} className="bg-black/20">
          {renderPreview()}
        </AspectRatio>
      </CardContent>
      
      <CardFooter className="p-2 gap-1 flex flex-wrap justify-between">
        <span className="text-xs text-white/50 italic">
          {new Date(figurine.created_at).toLocaleDateString()}
        </span>
        <div className="flex gap-1 flex-wrap">
          {/* Download button */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent border-white/10"
            onClick={() => onDownload(figurine)}
            title={isTextTo3D ? "Download 3D Model" : isWebIcon ? "Download Web Icon" : "Download Image"}
          >
            <Download size={14} />
          </Button>
          
          {/* Publish/unpublish button - only for traditional figurines */}
          {onTogglePublish && !isTextTo3D && !isWebIcon && (
            <Button
              variant="outline"
              size="icon"
              className={`h-8 w-8 bg-transparent border-white/10 ${figurine.is_public ? 'text-green-400' : ''}`}
              onClick={() => onTogglePublish(figurine)}
              title={figurine.is_public ? "Remove from Gallery" : "Publish to Gallery"}
            >
              <GalleryHorizontal size={14} />
            </Button>
          )}
          
          {/* Upload model button - only for traditional figurines without models */}
          {onUploadModel && !figurine.model_url && !isTextTo3D && !isWebIcon && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent border-white/10"
              onClick={() => onUploadModel(figurine)}
              title="Upload 3D Model"
            >
              <Upload size={14} />
            </Button>
          )}
          
          {/* View 3D model button - available when model exists */}
          {figurine.model_url && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent border-white/10"
              onClick={() => onViewModel(figurine)}
              title="View 3D model"
            >
              <Eye size={14} />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SimpleFigurineCard;
