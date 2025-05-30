import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BucketImage } from "@/components/gallery/types";

export const useGalleryFiles = () => {
  const [files, setFiles] = useState<BucketImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Helper function to determine file type based on extension and metadata
  const getFileType = (filename: string, metadata?: any): 'image' | '3d-model' | 'web-icon' => {
    // Check metadata first for web icons
    if (metadata?.file_type === 'web-icon') {
      return 'web-icon';
    }
    
    // Check filename patterns for web icons
    if (filename.toLowerCase().includes('web-icon') || filename.toLowerCase().includes('icon')) {
      return 'web-icon';
    }
    
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    // Check for common 3D model formats
    if (['glb', 'gltf', 'fbx', 'obj', 'usdz'].includes(extension)) {
      return '3d-model';
    }
    return 'image';
  };

  // Helper function to extract task ID from filename or path
  const extractTaskId = (fullPath: string, fileName: string): string | null => {
    // Try to extract task ID from different naming patterns
    const patterns = [
      /([a-f0-9-]{36})/, // UUID pattern
      /task_([^_]+)/, // task_id pattern
      /(\d+)_/, // numeric ID at start
    ];

    for (const pattern of patterns) {
      const match = fileName.match(pattern) || fullPath.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Fallback: use filename without extension as task ID
    return fileName.replace(/\.[^/.]+$/, "");
  };

  // Function to associate thumbnails with their corresponding 3D models
  const associateFilesWithThumbnails = (allFiles: BucketImage[]): BucketImage[] => {
    console.log('🔄 [GALLERY] Starting file association process...');
    
    // Separate files by type and location
    const models = allFiles.filter(file => file.type === '3d-model');
    const thumbnails = allFiles.filter(file => 
      file.type === 'image' && 
      (file.fullPath?.includes('/thumbnails/') || file.name.includes('_thumbnail'))
    );
    const regularImages = allFiles.filter(file => 
      file.type === 'image' && 
      !file.fullPath?.includes('/thumbnails/') && 
      !file.name.includes('_thumbnail')
    );
    const webIcons = allFiles.filter(file => file.type === 'web-icon');

    console.log('📊 [GALLERY] File breakdown:', {
      models: models.length,
      thumbnails: thumbnails.length,
      regularImages: regularImages.length,
      webIcons: webIcons.length
    });

    // Create a map of task IDs to thumbnails for faster lookup
    const thumbnailMap = new Map<string, BucketImage>();
    thumbnails.forEach(thumbnail => {
      const taskId = extractTaskId(thumbnail.fullPath || '', thumbnail.name);
      if (taskId) {
        thumbnailMap.set(taskId, thumbnail);
        console.log('🔗 [GALLERY] Mapped thumbnail:', taskId, '→', thumbnail.name);
      }
    });

    // Associate models with their thumbnails
    const modelsWithThumbnails = models.map(model => {
      const taskId = extractTaskId(model.fullPath || '', model.name);
      if (taskId && thumbnailMap.has(taskId)) {
        const thumbnail = thumbnailMap.get(taskId);
        console.log('✅ [GALLERY] Associated model with thumbnail:', model.name, '←→', thumbnail?.name);
        return {
          ...model,
          thumbnailUrl: thumbnail?.url
        };
      }
      console.log('⚠️ [GALLERY] No thumbnail found for model:', model.name);
      return model;
    });

    // Return models (with thumbnails), regular images, and web icons (not standalone thumbnails)
    const finalFiles = [...modelsWithThumbnails, ...regularImages, ...webIcons];
    
    console.log('✅ [GALLERY] File association complete. Final count:', finalFiles.length);
    console.log('📋 [GALLERY] Filtered out', thumbnails.length, 'standalone thumbnails');
    
    return finalFiles;
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

  // Function to list files from the figurine-models bucket (text-to-3D models)
  const listModelFiles = async (): Promise<BucketImage[]> => {
    try {
      console.log('🔄 [GALLERY] Fetching text-to-3D models from figurine-models bucket...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('ℹ️ [GALLERY] No authenticated user, skipping model files');
        return [];
      }
      
      // List files in user's folder in the figurine-models bucket
      const userPath = `${session.user.id}`;
      const { data: folders, error: foldersError } = await supabase
        .storage
        .from('figurine-models')
        .list(userPath, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (foldersError) {
        console.warn('⚠️ [GALLERY] Error listing model folders:', foldersError);
        return [];
      }
      
      if (!folders || folders.length === 0) {
        console.log('ℹ️ [GALLERY] No model folders found for user');
        return [];
      }
      
      let allModelFiles: BucketImage[] = [];
      
      // Check both models and thumbnails subfolders
      for (const folder of folders) {
        if (folder.name === 'models' || folder.name === 'thumbnails') {
          const folderPath = `${userPath}/${folder.name}`;
          
          const { data: files, error: filesError } = await supabase
            .storage
            .from('figurine-models')
            .list(folderPath, {
              limit: 100,
              sortBy: { column: 'created_at', order: 'desc' }
            });
            
          if (filesError) {
            console.warn(`⚠️ [GALLERY] Error listing files in ${folderPath}:`, filesError);
            continue;
          }
          
          if (files && files.length > 0) {
            const processedFiles = files
              .filter(file => file.id !== null) // Only actual files, not folders
              .map(file => {
                const fullPath = `${folderPath}/${file.name}`;
                const { data: publicUrlData } = supabase.storage
                  .from('figurine-models')
                  .getPublicUrl(fullPath);
                
                return {
                  name: file.name,
                  fullPath: fullPath,
                  url: publicUrlData.publicUrl,
                  id: file.id || fullPath,
                  created_at: file.created_at || new Date().toISOString(),
                  type: getFileType(file.name) as 'image' | '3d-model' | 'web-icon'
                };
              });
            
            allModelFiles = [...allModelFiles, ...processedFiles];
          }
        }
      }
      
      console.log(`✅ [GALLERY] Found ${allModelFiles.length} model files`);
      return allModelFiles;
    } catch (error) {
      console.error('❌ [GALLERY] Error fetching model files:', error);
      return [];
    }
  };

  // Function to load figurines from the database (including web icons)
  const loadFigurinesFromDatabase = async (): Promise<BucketImage[]> => {
    try {
      console.log('🔄 [GALLERY] Fetching figurines from database...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('ℹ️ [GALLERY] No authenticated user, skipping database figurines');
        return [];
      }
      
      const { data: figurines, error } = await supabase
        .from('figurines')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ [GALLERY] Error fetching figurines:', error);
        return [];
      }
      
      if (!figurines || figurines.length === 0) {
        console.log('ℹ️ [GALLERY] No figurines found for user');
        return [];
      }
      
      // Convert figurines to BucketImage format
      const figurineFiles: BucketImage[] = figurines.map(figurine => {
        const imageUrl = figurine.saved_image_url || figurine.image_url;
        // Check if this is a web icon by looking at file_type or style
        const fileType = figurine.file_type || (figurine.file_type === 'web-icon' ? 'web-icon' : 'image');
        
        // Safely convert metadata from Json to Record<string, any>
        let metadata: Record<string, any> = {};
        if (figurine.metadata) {
          try {
            if (typeof figurine.metadata === 'string') {
              metadata = JSON.parse(figurine.metadata);
            } else if (typeof figurine.metadata === 'object') {
              metadata = figurine.metadata as Record<string, any>;
            }
          } catch (e) {
            console.warn('Failed to parse metadata for figurine:', figurine.id);
            metadata = {};
          }
        }
        
        return {
          name: `${figurine.title || 'Untitled'}.png`,
          fullPath: `figurines/${figurine.id}`,
          url: imageUrl,
          id: figurine.id,
          created_at: figurine.created_at,
          type: fileType as 'image' | '3d-model' | 'web-icon',
          metadata: metadata
        };
      });
      
      console.log(`✅ [GALLERY] Found ${figurineFiles.length} figurines from database`);
      return figurineFiles;
    } catch (error) {
      console.error('❌ [GALLERY] Error fetching figurines from database:', error);
      return [];
    }
  };

  // Load all images, models, and web icons from all sources - made useCallback for better optimization
  const fetchImagesFromBucket = useCallback(async () => {
    console.log('🔄 [GALLERY] Starting gallery files fetch...');
    setIsLoading(true);
    setError(null);
    try {
      // Get all files from all sources in parallel
      const [imageFiles, modelFiles, figurineFiles] = await Promise.all([
        listFilesRecursively(), // From figurine-images bucket
        listModelFiles(),        // From figurine-models bucket
        loadFigurinesFromDatabase() // From figurines table (includes web icons)
      ]);
      
      // Combine all files, prioritizing database figurines (to avoid duplicates)
      const allFiles = [...figurineFiles, ...imageFiles, ...modelFiles];
      
      // Remove duplicates based on URL (prioritize database entries)
      const uniqueFiles = allFiles.filter((file, index, self) => 
        index === self.findIndex(f => f.url === file.url)
      );
      
      // Associate files with thumbnails and filter out standalone thumbnails
      const associatedFiles = associateFilesWithThumbnails(uniqueFiles);
      
      // Sort by creation date (newest first)
      associatedFiles.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setFiles(associatedFiles);
      console.log(`✅ [GALLERY] Loaded ${associatedFiles.length} files from gallery`);
    } catch (error) {
      console.error('❌ [GALLERY] Error loading files from buckets:', error);
      const errorMessage = "Could not load the gallery items. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error loading gallery",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchImagesFromBucket();
    
    // Set up subscriptions to listen for storage changes in both buckets
    const imagesChannel = supabase
      .channel('storage-images-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'storage', table: 'objects', filter: "bucket_id=eq.figurine-images" }, 
          () => {
            console.log('🔄 [GALLERY] Figurine-images storage changed, refetching files...');
            fetchImagesFromBucket();
          }
      )
      .subscribe();
      
    const modelsChannel = supabase
      .channel('storage-models-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'storage', table: 'objects', filter: "bucket_id=eq.figurine-models" }, 
          () => {
            console.log('🔄 [GALLERY] Figurine-models storage changed, refetching files...');
            fetchImagesFromBucket();
          }
      )
      .subscribe();
      
    // Listen for figurines table changes (web icons and other figurines)
    const figurinesChannel = supabase
      .channel('figurines-changes')
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'figurines' },
          () => {
            console.log('🔄 [GALLERY] Figurines table changed, refetching files...');
            fetchImagesFromBucket();
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(imagesChannel);
      supabase.removeChannel(modelsChannel);
      supabase.removeChannel(figurinesChannel);
    };
  }, [fetchImagesFromBucket]);

  return {
    files,
    isLoading,
    error,
    refetch: fetchImagesFromBucket
  };
};
