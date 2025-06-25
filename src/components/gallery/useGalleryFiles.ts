
import { useQuery } from "@tanstack/react-query";
import { fetchPublicFigurines } from "@/services/figurineService";
import { BucketImage } from "./types";

export const useGalleryFiles = () => {
  // Use react-query to manage the gallery files with proper caching and refetching
  const {
    data: files = [],
    isLoading,
    error,
    refetch: refreshFiles,
    isRefetching
  } = useQuery({
    queryKey: ['gallery-files'],
    queryFn: async (): Promise<BucketImage[]> => {
      console.log('🔄 [GALLERY-FILES] Fetching public figurines...');
      
      const figurines = await fetchPublicFigurines();
      
      // Transform figurines to BucketImage format
      const bucketImages: BucketImage[] = figurines.map((figurine) => {
        // Determine the primary URL to display (prioritize saved_image_url, then image_url)
        const displayUrl = figurine.saved_image_url || figurine.image_url;
        
        // Determine file type based on model_url and file_type
        let fileType: 'image' | '3d-model' | 'web-icon' = 'image';
        if (figurine.model_url) {
          fileType = '3d-model';
        } else if (figurine.file_type === 'web-icon') {
          fileType = 'web-icon';
        }
        
        // Create a reasonable file name
        const fileName = figurine.title || `figurine-${figurine.id.substring(0, 8)}`;
        
        // Construct full path for identification
        let fullPath = '';
        if (figurine.saved_image_url && figurine.saved_image_url.includes('supabase.co')) {
          try {
            const url = new URL(figurine.saved_image_url);
            fullPath = url.pathname;
          } catch (e) {
            console.warn('Could not parse saved_image_url:', e);
          }
        }
        
        return {
          id: figurine.id,
          name: fileName,
          url: displayUrl || '',
          type: fileType,
          fullPath: fullPath,
          size: 0, // Not available from figurines
          lastModified: new Date(figurine.updated_at || figurine.created_at).getTime(),
          created_at: figurine.created_at,
          // Store original figurine data for reference
          figurineId: figurine.id,
          userId: figurine.user_id
        };
      });
      
      console.log(`✅ [GALLERY-FILES] Transformed ${figurines.length} figurines to bucket images`);
      return bucketImages;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  return {
    files,
    isLoading: isLoading || isRefetching,
    error: error as Error | null,
    refreshFiles
  };
};
