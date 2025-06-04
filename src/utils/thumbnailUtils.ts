
import { supabase } from "@/integrations/supabase/client";

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
    
    // Download the thumbnail
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      throw new Error(`Failed to download thumbnail: ${response.status} ${response.statusText}`);
    }
    
    const thumbnailBlob = await response.blob();
    console.log('✅ [THUMBNAIL] Thumbnail blob downloaded:', {
      size: thumbnailBlob.size,
      type: thumbnailBlob.type
    });
    
    // Validate blob size
    if (thumbnailBlob.size === 0) {
      throw new Error('Downloaded thumbnail file is empty');
    }
    
    // Generate a unique filename with user-specific path
    const filePath = `${userId}/thumbnails/${taskId}_thumb.png`;
    
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
    console.error('❌ [THUMBNAIL] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
};
