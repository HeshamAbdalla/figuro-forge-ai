
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BucketImage } from "@/components/gallery/types";

export const useGalleryFiles = () => {
  const [images, setImages] = useState<BucketImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Helper function to determine file type based on extension
  const getFileType = (filename: string): 'image' | '3d-model' => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    // Check for common 3D model formats
    if (['glb', 'gltf', 'fbx', 'obj', 'usdz'].includes(extension)) {
      return '3d-model';
    }
    return 'image';
  };
  
  // Recursive function to list files in a folder and its subfolders
  const listFilesRecursively = async (path: string = ''): Promise<BucketImage[]> => {
    try {
      console.log('🔄 [GALLERY] Listing files in path:', path || 'root');
      
      // List files in the current path
      const { data: files, error } = await supabase
        .storage
        .from('figurine-images')
        .list(path, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) {
        console.error('❌ [GALLERY] Error listing files:', error);
        return [];
      }
      
      if (!files || files.length === 0) {
        console.log('ℹ️ [GALLERY] No files found in path:', path || 'root');
        return [];
      }
      
      // Separate folders and files
      const folders = files.filter(item => item.id === null);
      const actualFiles = files.filter(item => item.id !== null);
      
      console.log('📁 [GALLERY] Found folders:', folders.length, 'files:', actualFiles.length);
      
      // Process current path's files
      const processedFiles = await Promise.all(
        actualFiles.map(async (file) => {
          const fullPath = path ? `${path}/${file.name}` : file.name;
          const { data: publicUrlData } = supabase.storage
            .from('figurine-images')
            .getPublicUrl(fullPath);
          
          // Clean URL - don't add cache busters here as they can cause download issues
          const url = publicUrlData.publicUrl;
          
          return {
            name: file.name,
            fullPath: fullPath,
            url: url,
            id: file.id || fullPath,
            created_at: file.created_at || new Date().toISOString(),
            type: getFileType(file.name) // Determine file type based on extension
          };
        })
      );
      
      // Recursively process subfolders
      let filesFromSubFolders: BucketImage[] = [];
      for (const folder of folders) {
        const subPath = path ? `${path}/${folder.name}` : folder.name;
        const subFolderFiles = await listFilesRecursively(subPath);
        filesFromSubFolders = [...filesFromSubFolders, ...subFolderFiles];
      }
      
      // Combine files from current path and subfolders
      return [...processedFiles, ...filesFromSubFolders];
    } catch (error) {
      console.error('❌ [GALLERY] Error in listFilesRecursively:', error);
      return [];
    }
  };

  // Load all images and models from the bucket - made useCallback for better optimization
  const fetchImagesFromBucket = useCallback(async () => {
    console.log('🔄 [GALLERY] Starting gallery files fetch...');
    setIsLoading(true);
    try {
      // Get all files recursively, starting from root
      const allFiles = await listFilesRecursively();
      
      // Sort by creation date (newest first)
      allFiles.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setImages(allFiles);
      console.log(`✅ [GALLERY] Loaded ${allFiles.length} files from gallery`);
    } catch (error) {
      console.error('❌ [GALLERY] Error loading files from bucket:', error);
      toast({
        title: "Error loading gallery",
        description: "Could not load the gallery items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchImagesFromBucket();
    
    // Set up a subscription to listen for storage changes
    const channel = supabase
      .channel('storage-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'storage', table: 'objects', filter: "bucket_id=eq.figurine-images" }, 
          () => {
            // When storage changes, refetch the files
            console.log('🔄 [GALLERY] Storage changed, refetching files...');
            fetchImagesFromBucket();
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchImagesFromBucket]);

  return {
    images,
    isLoading,
    fetchImagesFromBucket
  };
};
