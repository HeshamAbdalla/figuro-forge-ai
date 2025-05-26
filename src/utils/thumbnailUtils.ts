
import { supabase } from "@/integrations/supabase/client";
import { tryLoadWithCorsProxies } from "./corsProxy";

/**
 * Downloads a thumbnail from an external URL and saves it to Supabase storage
 * @param thumbnailUrl External URL of the thumbnail
 * @param taskId The task ID to use for naming
 * @returns The storage URL of the saved thumbnail
 */
export const downloadAndSaveThumbnail = async (thumbnailUrl: string, taskId: string): Promise<string | null> => {
  try {
    console.log('🔄 [THUMBNAIL] Starting thumbnail download and save process');
    console.log(`🔄 [THUMBNAIL] Downloading thumbnail from: ${thumbnailUrl}`);
    
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('❌ [THUMBNAIL] No authenticated session found');
      throw new Error('Authentication required to save thumbnails');
    }
    
    const userId = session.user.id;
    console.log('✅ [THUMBNAIL] Authenticated user for thumbnail save:', userId);
    
    // Use CORS proxy to download the thumbnail
    console.log('🔄 [THUMBNAIL] Starting thumbnail download with CORS proxy...');
    
    const thumbnailBlob = await new Promise<Blob>((resolve, reject) => {
      tryLoadWithCorsProxies(
        thumbnailUrl,
        async (workingUrl: string) => {
          try {
            console.log(`🔄 [THUMBNAIL] Downloading from working URL: ${workingUrl.substring(0, 100)}...`);
            const response = await fetch(workingUrl);
            if (!response.ok) {
              throw new Error(`Failed to download thumbnail: ${response.status} ${response.statusText}`);
            }
            const blob = await response.blob();
            console.log(`✅ [THUMBNAIL] Downloaded blob: ${blob.size} bytes, type: ${blob.type}`);
            resolve(blob);
          } catch (error) {
            console.error(`❌ [THUMBNAIL] Download failed from working URL:`, error);
            reject(error);
          }
        },
        (error: Error) => {
          console.error(`❌ [THUMBNAIL] All CORS proxy attempts failed:`, error);
          reject(new Error(`Failed to download thumbnail via CORS proxies: ${error.message}`));
        }
      );
    });
    
    console.log('✅ [THUMBNAIL] Thumbnail blob downloaded:', {
      size: thumbnailBlob.size,
      type: thumbnailBlob.type
    });
    
    // Validate blob size
    if (thumbnailBlob.size === 0) {
      throw new Error('Downloaded thumbnail file is empty');
    }
    
    // Generate a unique filename with user-specific path
    const filePath = `${userId}/thumbnails/${taskId}_thumbnail.png`;
    
    console.log('🔄 [THUMBNAIL] Uploading to storage path:', filePath);
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('figurine-images')
      .upload(filePath, thumbnailBlob, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (error) {
      console.error('❌ [THUMBNAIL] Storage upload error:', error);
      throw new Error(`Failed to save thumbnail to storage: ${error.message}`);
    }
    
    console.log('✅ [THUMBNAIL] Upload successful, data:', data);
    
    // Get the public URL of the saved thumbnail
    const { data: publicUrlData } = supabase.storage
      .from('figurine-images')
      .getPublicUrl(filePath);
      
    const publicUrl = publicUrlData.publicUrl;
    console.log('✅ [THUMBNAIL] Public URL generated:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ [THUMBNAIL] Failed to download and save thumbnail:', error);
    throw error; // Re-throw to handle in calling code
  }
};
