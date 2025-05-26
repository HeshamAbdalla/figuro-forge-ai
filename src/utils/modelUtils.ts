
import { supabase } from '@/integrations/supabase/client';

export const downloadAndSaveModel = async (
  modelUrl: string, 
  fileName: string,
  thumbnailUrl?: string
): Promise<string | null> => {
  try {
    console.log('🔄 [MODEL_UTILS] Starting model download from:', modelUrl);
    
    // Download the model file
    const response = await fetch(modelUrl);
    if (!response.ok) {
      throw new Error(`Failed to download model: ${response.status}`);
    }
    
    const modelBlob = await response.blob();
    const fileExtension = modelUrl.includes('.glb') ? '.glb' : '.obj';
    const timestamp = Date.now();
    const uniqueFileName = `${fileName}_${timestamp}${fileExtension}`;
    
    console.log('📤 [MODEL_UTILS] Uploading model to storage:', uniqueFileName);
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('models')
      .upload(uniqueFileName, modelBlob, {
        contentType: 'model/gltf-binary',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ [MODEL_UTILS] Storage upload error:', error);
      throw error;
    }

    console.log('✅ [MODEL_UTILS] Model uploaded successfully:', data.path);

    // Get the public URL for the uploaded model
    const { data: publicUrlData } = supabase.storage
      .from('models')
      .getPublicUrl(data.path);

    console.log('🔗 [MODEL_UTILS] Public URL generated:', publicUrlData.publicUrl);
    
    // If we have a thumbnail URL, we could store it separately in the future
    // For now, we just return the model URL as expected
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('❌ [MODEL_UTILS] Error in downloadAndSaveModel:', error);
    return null;
  }
};
