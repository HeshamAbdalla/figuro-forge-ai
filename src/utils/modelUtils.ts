
import { supabase } from "@/integrations/supabase/client";

/**
 * Downloads a 3D model from an external URL and saves it to Supabase storage
 * @param modelUrl External URL of the 3D model
 * @param filename Name to save the file as (without extension)
 * @returns The storage URL of the saved model
 */
export const downloadAndSaveModel = async (modelUrl: string, filename: string): Promise<string | null> => {
  try {
    console.log('🔄 [MODEL] Starting model download and save process');
    console.log(`🔄 [MODEL] Downloading model from: ${modelUrl}`);
    
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('❌ [MODEL] No authenticated session found');
      throw new Error('Authentication required to save models');
    }
    
    const userId = session.user.id;
    console.log('✅ [MODEL] Authenticated user for model save:', userId);
    
    // Download the model file from the external URL
    const response = await fetch(modelUrl);
    if (!response.ok) {
      throw new Error(`Failed to download model: ${response.status} ${response.statusText}`);
    }
    
    // Get the model file as a blob
    const modelBlob = await response.blob();
    console.log('✅ [MODEL] Model blob downloaded:', {
      size: modelBlob.size,
      type: modelBlob.type
    });
    
    // Generate a unique filename with the correct extension and user-specific path
    const extension = modelUrl.split('.').pop()?.toLowerCase() || 'glb';
    const cleanFilename = filename.replace(/\s+/g, '_');
    const filePath = `${userId}/models/${cleanFilename}_${Date.now()}.${extension}`;
    
    console.log('🔄 [MODEL] Uploading to storage path:', filePath);
    
    // Upload to Supabase storage using the same bucket as images
    const { data, error } = await supabase.storage
      .from('figurine-images')
      .upload(filePath, modelBlob, {
        contentType: 'model/gltf-binary',
        upsert: true
      });
      
    if (error) {
      console.error('❌ [MODEL] Storage upload error:', error);
      
      // More specific error handling similar to image storage
      if (error.message?.includes('row-level security')) {
        console.error('❌ [MODEL] RLS Policy violation - checking session state');
        
        // Re-verify authentication state
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.error('❌ [MODEL] Session state during error:', {
          hasSession: !!currentSession,
          hasUser: !!currentSession?.user,
          userId: currentSession?.user?.id
        });
        
        throw new Error(`Model storage RLS policy violation: ${error.message}`);
      } else {
        throw new Error(`Failed to save model to storage: ${error.message}`);
      }
    }
    
    // Get the public URL of the saved model
    const { data: publicUrlData } = supabase.storage
      .from('figurine-images')
      .getPublicUrl(filePath);
      
    const publicUrl = publicUrlData.publicUrl;
    console.log('✅ [MODEL] Model saved to storage successfully:', publicUrl);
    
    // Verify the file was actually uploaded by checking if it exists
    const { data: fileData, error: fileError } = await supabase.storage
      .from('figurine-images')
      .list(`${userId}/models`, {
        limit: 100,
        search: `${cleanFilename}_`
      });
      
    if (fileError) {
      console.warn('⚠️ [MODEL] Could not verify model upload:', fileError);
    } else {
      console.log('✅ [MODEL] Model file verification successful:', fileData?.length);
    }
    
    return publicUrl;
  } catch (error) {
    console.error('❌ [MODEL] Failed to download and save model:', error);
    console.error('❌ [MODEL] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error; // Re-throw to handle in calling code
  }
};
