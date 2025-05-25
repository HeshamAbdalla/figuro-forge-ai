
import { supabase } from "@/integrations/supabase/client";
import { tryLoadWithCorsProxies } from "./corsProxy";

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
    
    // Use CORS proxy to download the model file
    console.log('🔄 [MODEL] Starting file download with CORS proxy...');
    
    const modelBlob = await new Promise<Blob>((resolve, reject) => {
      tryLoadWithCorsProxies(
        modelUrl,
        async (workingUrl: string) => {
          try {
            console.log(`🔄 [MODEL] Downloading from working URL: ${workingUrl.substring(0, 100)}...`);
            const response = await fetch(workingUrl);
            if (!response.ok) {
              throw new Error(`Failed to download model: ${response.status} ${response.statusText}`);
            }
            const blob = await response.blob();
            console.log(`✅ [MODEL] Downloaded blob: ${blob.size} bytes, type: ${blob.type}`);
            resolve(blob);
          } catch (error) {
            console.error(`❌ [MODEL] Download failed from working URL:`, error);
            reject(error);
          }
        },
        (error: Error) => {
          console.error(`❌ [MODEL] All CORS proxy attempts failed:`, error);
          reject(new Error(`Failed to download model via CORS proxies: ${error.message}`));
        }
      );
    });
    
    console.log('✅ [MODEL] Model blob downloaded:', {
      size: modelBlob.size,
      type: modelBlob.type
    });
    
    // Validate blob size
    if (modelBlob.size === 0) {
      throw new Error('Downloaded model file is empty');
    }
    
    // Validate blob type (should be a binary file)
    if (modelBlob.type && !modelBlob.type.includes('application/') && !modelBlob.type.includes('model/')) {
      console.warn('⚠️ [MODEL] Unexpected blob type:', modelBlob.type);
    }
    
    // Generate a unique filename with the correct extension and user-specific path
    const extension = modelUrl.split('.').pop()?.toLowerCase() || 'glb';
    const cleanFilename = filename.replace(/\s+/g, '_');
    const filePath = `${userId}/models/${cleanFilename}_${Date.now()}.${extension}`;
    
    console.log('🔄 [MODEL] Uploading to storage path:', filePath);
    
    // Check if storage bucket exists and is accessible
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        console.error('❌ [MODEL] Error listing buckets:', bucketError);
        throw new Error(`Storage bucket access error: ${bucketError.message}`);
      }
      
      const targetBucket = buckets?.find(bucket => bucket.name === 'figurine-images');
      if (!targetBucket) {
        throw new Error('Storage bucket "figurine-images" not found');
      }
      
      console.log('✅ [MODEL] Storage bucket verified');
    } catch (bucketError) {
      console.error('❌ [MODEL] Bucket verification failed:', bucketError);
      throw bucketError;
    }
    
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
      } else if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        console.log('🔄 [MODEL] Bucket might not exist, attempting to create and retry...');
        throw new Error(`Storage bucket not found: ${error.message}`);
      } else {
        throw new Error(`Failed to save model to storage: ${error.message}`);
      }
    }
    
    console.log('✅ [MODEL] Upload successful, data:', data);
    
    // Get the public URL of the saved model
    const { data: publicUrlData } = supabase.storage
      .from('figurine-images')
      .getPublicUrl(filePath);
      
    const publicUrl = publicUrlData.publicUrl;
    console.log('✅ [MODEL] Public URL generated:', publicUrl);
    
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
      
      // Additional verification - check if the specific file exists
      const uploadedFile = fileData?.find(file => file.name.includes(cleanFilename));
      if (!uploadedFile) {
        console.error('❌ [MODEL] Uploaded file not found in verification');
        throw new Error('Model upload verification failed - file not found');
      } else {
        console.log('✅ [MODEL] File verification confirmed:', uploadedFile.name);
      }
    }
    
    // Test the public URL accessibility
    try {
      console.log('🔍 [MODEL] Testing public URL accessibility...');
      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
        console.warn('⚠️ [MODEL] Public URL may not be immediately accessible:', testResponse.status);
      } else {
        console.log('✅ [MODEL] Public URL is accessible');
      }
    } catch (testError) {
      console.warn('⚠️ [MODEL] Could not test public URL accessibility:', testError);
      // Don't throw error here as the file might be accessible but not immediately
    }
    
    return publicUrl;
  } catch (error) {
    console.error('❌ [MODEL] Failed to download and save model:', error);
    console.error('❌ [MODEL] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Provide more specific error context
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('CORS') || error.message.includes('proxy')) {
        throw new Error(`Network error downloading model: ${error.message}`);
      } else if (error.message.includes('storage')) {
        throw new Error(`Storage error saving model: ${error.message}`);
      } else if (error.message.includes('auth')) {
        throw new Error(`Authentication error: ${error.message}`);
      }
    }
    
    throw error; // Re-throw to handle in calling code
  }
};
