
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download, Box, Upload, GalleryHorizontal, Sparkles } from 'lucide-react';
import { Figurine } from '@/types/figurine';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface FigurineCardProps {
  figurine: Figurine;
  onDownload: (figurine: Figurine) => void;
  onViewModel: (figurine: Figurine) => void;
  onTogglePublish?: (figurine: Figurine) => void;
  onUploadModel?: (figurine: Figurine) => void;
}

const FigurineCard = ({ 
  figurine, 
  onDownload, 
  onViewModel, 
  onTogglePublish, 
  onUploadModel 
}: FigurineCardProps) => {
  const [imageError, setImageError] = React.useState(false);
  const { targetRef, isIntersecting, wasEverVisible } = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 0.1,
    once: true
  });

  // Determine if this is a text-to-3D model
  const isTextTo3D = figurine.style === 'text-to-3d' || figurine.title.startsWith('Text-to-3D:');

  // Clean image URL to prevent cache-busting issues
  const cleanImageUrl = React.useMemo(() => {
    try {
      if (!figurine.saved_image_url && !figurine.image_url) return '';
      
      const url = new URL(figurine.saved_image_url || figurine.image_url);
      // Remove all cache-busting parameters
      ['t', 'cb', 'cache'].forEach(param => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
        }
      });
      return url.toString();
    } catch (e) {
      // If URL parsing fails, return the original
      return figurine.saved_image_url || figurine.image_url;
    }
  }, [figurine.saved_image_url, figurine.image_url]);

  // Get display title (clean up text-to-3D titles)
  const displayTitle = React.useMemo(() => {
    if (isTextTo3D && figurine.title.startsWith('Text-to-3D: ')) {
      return figurine.title.replace('Text-to-3D: ', '');
    }
    return figurine.title;
  }, [figurine.title, isTextTo3D]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      ref={targetRef as React.RefObject<HTMLDivElement>}
    >
      <Card className="glass-panel overflow-hidden h-full">
        <CardHeader className="p-3 border-b border-white/10">
          <CardTitle className="text-sm font-medium truncate flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isTextTo3D && (
                <span title="Text-to-3D Generated">
                  <Sparkles size={14} className="text-figuro-accent" />
                </span>
              )}
              <span className="truncate">{displayTitle}</span>
              {figurine.model_url && (
                <span title="3D Model Available">
                  <Box size={14} className="text-figuro-accent flex-shrink-0" />
                </span>
              )}
            </span>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {isTextTo3D && (
                <Badge variant="secondary" className="text-xs bg-figuro-accent/20 text-figuro-accent">
                  3D
                </Badge>
              )}
              {figurine.is_public && (
                <Badge variant="secondary" className="text-xs">Published</Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full">
            <AspectRatio ratio={1} className="bg-black/20">
              {!imageError && cleanImageUrl ? (
                <img 
                  src={cleanImageUrl}
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                  loading="lazy" 
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 p-2">
                  {isTextTo3D ? (
                    <div className="text-center">
                      <Box size={32} className="text-figuro-accent mx-auto mb-2" />
                      <p className="text-white/60 text-xs">
                        3D Model Generated
                      </p>
                    </div>
                  ) : (
                    <p className="text-white/60 text-xs text-center">
                      Unable to load image
                    </p>
                  )}
                </div>
              )}
            </AspectRatio>
          </div>
        </CardContent>
        <CardFooter className="p-2 gap-1 flex flex-wrap justify-between">
          <span className="text-xs text-white/50 italic">
            {new Date(figurine.created_at).toLocaleDateString()}
          </span>
          <div className="flex gap-1 flex-wrap">
            {/* Download button - always available for images, models need special handling */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent border-white/10"
              onClick={() => onDownload(figurine)}
              title={isTextTo3D ? "Download 3D Model" : "Download Image"}
            >
              <Download size={14} />
            </Button>
            
            {/* Publish/unpublish button - only for traditional figurines for now */}
            {onTogglePublish && !isTextTo3D && (
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
            {onUploadModel && !figurine.model_url && !isTextTo3D && (
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
    </motion.div>
  );
};

export default FigurineCard;
