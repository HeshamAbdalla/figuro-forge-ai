
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BucketImage } from "../types";

export const useGalleryItemState = (file: BucketImage) => {
  const [imageError, setImageError] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailExists, setThumbnailExists] = useState<boolean>(false);
  const [thumbnailChecked, setThumbnailChecked] = useState<boolean>(false);

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

  return {
    imageError,
    thumbnailUrl,
    thumbnailExists,
    thumbnailChecked,
    handleImageError
  };
};
