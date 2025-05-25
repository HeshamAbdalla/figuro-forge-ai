
import { supabase } from "@/integrations/supabase/client";

// Save image to storage and get public URL with proper user-based path structure
export const saveImageToStorage = async (imageBlob: Blob, figurineId: string): Promise<string | null> => {
  try {
    console.log('🔄 [STORAGE] Starting image save process for figurineId:', figurineId);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('❌ [STORAGE] No authenticated session found');
      throw new Error('Authentication required to save images');
    }
    
    const userId = session.user.id;
    console.log('✅ [STORAGE] Authenticated user:', userId);
    
    // Use user-specific folder path to align with RLS policies
    const filePath = `${userId}/${figurineId}.png`;
    console.log('🔄 [STORAGE] Using file path:', filePath);
    
    // Upload image to storage
    const { data, error } = await supabase.storage
      .from('figurine-images')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (error) {
      console.error('❌ [STORAGE] Upload error:', error);
      
      // If the bucket doesn't exist, try to create it
      if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        console.log('🔄 [STORAGE] Attempting to create bucket...');
        try {
          // The bucket should already exist from our SQL migration
          // but let's retry the upload
          const { data: retryData, error: retryError } = await supabase.storage
            .from('figurine-images')
            .upload(filePath, imageBlob, {
              contentType: 'image/png',
              upsert: true
            });
            
          if (retryError) {
            console.error('❌ [STORAGE] Retry upload failed:', retryError);
            throw retryError;
          }
          
          console.log('✅ [STORAGE] Retry upload successful');
        } catch (bucketError) {
          console.error('❌ [STORAGE] Bucket creation/retry failed:', bucketError);
          throw bucketError;
        }
      } else {
        throw error;
      }
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('figurine-images')
      .getPublicUrl(filePath);
      
    const publicUrl = publicUrlData.publicUrl;
    console.log('✅ [STORAGE] Image saved successfully:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ [STORAGE] Failed to save image to storage:', error);
    throw error; // Re-throw to handle in calling code
  }
};
