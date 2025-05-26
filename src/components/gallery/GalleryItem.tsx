import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Eye, Box } from "lucide-react";
import { BucketImage } from "./types";
import { useSecureDownload } from "@/hooks/useSecureDownload";
import { supabase } from "@/integrations/supabase/client";
import ModelPreview from "./ModelPreview";

interface GalleryItemProps {
  file: BucketImage;
  onDownload: (url: string, name: string) => void;
  onView: (url: string, name: string, type: 'image' | '3d-model') => void;
  onGenerate3D?: (url: string, name: string) => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ 
  file, 
  onDownload, 
  onView,
  onGenerate3D 
}) => {
  const [imageError, setImageError] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailExists, setThumbnailExists] = useState<boolean>(false);
  const [thumbnailChecked, setThumbnailChecked] = useState<boolean>(false);
  const { secureDownload, isDownloading } = useSecureDownload();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await secureDownload(file.url, file.name);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to original download method
      onDownload(file.url, file.name);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Pass the file type to determine which viewer to use
    onView(file.url, file.name, file.type);
  };

  const handleGenerate3D = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGenerate3D) {
      onGenerate3D(file.url, file.name);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Enhanced thumbnail URL construction and validation
  useEffect(() => {
    const checkThumbnailExists = async () => {
      if (file.type !== '3d-model' || !file.fullPath || thumbnailChecked) {
        return;
      }

      try {
        console.log('🔍 [THUMBNAIL] Checking thumbnail for 3D model:', file.name);
        
        // Extract user ID and base filename from the model path
        const pathParts = file.fullPath.split('/');
        if (pathParts.length < 2) {
          console.warn('⚠️ [THUMBNAIL] Invalid file path structure:', file.fullPath);
          setThumbnailChecked(true);
          return;
        }

        const userId = pathParts[0];
        const fileName = pathParts[pathParts.length - 1];
        const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
        
        console.log('🔍 [THUMBNAIL] Extracted info:', { userId, fileName, fileNameWithoutExt });

        // Try multiple possible thumbnail naming patterns
        const possibleThumbnailPaths = [
          `${userId}/thumbnails/${fileNameWithoutExt}_thumbnail.png`,
          `${userId}/thumbnails/${fileName}_thumbnail.png`,
          `${userId}/thumbnails/${fileNameWithoutExt}.png`,
          // Also check for task-based naming if the filename contains task info
          ...(fileNameWithoutExt.includes('_') ? [
            `${userId}/thumbnails/${fileNameWithoutExt.split('_')[0]}_thumbnail.png`
          ] : [])
        ];

        console.log('🔍 [THUMBNAIL] Checking possible paths:', possibleThumbnailPaths);

        // Check each possible thumbnail path
        for (const thumbnailPath of possibleThumbnailPaths) {
          try {
            const { data, error } = await supabase.storage
              .from('figurine-images')
              .list(thumbnailPath.substring(0, thumbnailPath.lastIndexOf('/')), {
                search: thumbnailPath.substring(thumbnailPath.lastIndexOf('/') + 1)
              });

            if (!error && data && data.length > 0) {
              // Thumbnail file exists, construct the public URL
              const { data: publicUrlData } = supabase.storage
                .from('figurine-images')
                .getPublicUrl(thumbnailPath);
              
              const constructedThumbnailUrl = publicUrlData.publicUrl;
              console.log('✅ [THUMBNAIL] Found thumbnail at:', thumbnailPath);
              console.log('✅ [THUMBNAIL] Thumbnail URL:', constructedThumbnailUrl);
              
              // Verify the thumbnail URL actually returns an image
              try {
                const response = await fetch(constructedThumbnailUrl, { method: 'HEAD' });
                if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
                  setThumbnailUrl(constructedThumbnailUrl);
                  setThumbnailExists(true);
                  setThumbnailChecked(true);
                  return;
                }
              } catch (fetchError) {
                console.warn('⚠️ [THUMBNAIL] Failed to verify thumbnail URL:', fetchError);
              }
            }
          } catch (listError) {
            console.warn('⚠️ [THUMBNAIL] Error checking path:', thumbnailPath, listError);
          }
        }

        console.log('❌ [THUMBNAIL] No valid thumbnail found for:', file.name);
        setThumbnailExists(false);
        setThumbnailChecked(true);
      } catch (error) {
        console.error('❌ [THUMBNAIL] Error checking thumbnail existence:', error);
        setThumbnailExists(false);
        setThumbnailChecked(true);
      }
    };

    checkThumbnailExists();
  }, [file.fullPath, file.type, file.name, thumbnailChecked]);

  const isImage = file.type === 'image';
  const is3DModel = file.type === '3d-model';

  return (
    <div className="glass-panel rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-200">
      <div className="aspect-square relative overflow-hidden bg-white/5">
        {is3DModel ? (
          // Display 3D model directly using ModelPreview
          <ModelPreview 
            modelUrl={file.url} 
            fileName={file.name}
          />
        ) : (
          // Display image as before
          !imageError ? (
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white/60">
                <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded" />
                <p className="text-sm">Preview unavailable</p>
              </div>
            </div>
          )
        )}
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
              onClick={handleView}
              title={is3DModel ? "View in Enhanced 3D Viewer" : "View in Enhanced Image Viewer"}
            >
              <Eye size={16} />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
              onClick={handleDownload}
              disabled={isDownloading}
              title="Download File"
            >
              <Download size={16} />
            </Button>
            
            {isImage && onGenerate3D && (
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                onClick={handleGenerate3D}
                title="Generate 3D Model"
              >
                <Box size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-medium truncate mb-1">{file.name}</h3>
        <p className="text-white/60 text-sm">
          {new Date(file.created_at).toLocaleDateString()}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/80">
            {is3DModel ? '3D Model' : 'Image'}
          </span>
          {is3DModel && thumbnailExists && (
            <span className="text-xs text-green-400">
              Has Preview
            </span>
          )}
          {is3DModel && thumbnailChecked && !thumbnailExists && (
            <span className="text-xs text-yellow-400">
              No Preview
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryItem;
