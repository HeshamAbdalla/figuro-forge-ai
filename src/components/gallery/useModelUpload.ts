
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useModelUpload = (onFilesUpdated: () => void) => {
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const [customModelFile, setCustomModelFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const handleModelUpload = (url: string, file: File) => {
    setCustomModelUrl(url);
    setCustomModelFile(file);
    
    // Upload to storage 
    const uploadModel = async () => {
      try {
        console.log('🔄 [MODEL] Starting model upload process...');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          throw new Error('Authentication required to upload models');
        }
        
        const userId = session.user.id;
        console.log('✅ [MODEL] Authenticated user for model upload:', userId);
        
        const fileExt = file.name.split('.').pop();
        // Use user-specific path structure that matches RLS policies
        const filePath = `${userId}/models/${Date.now()}.${fileExt}`;
        
        console.log('🔄 [MODEL] Uploading to path:', filePath);
        console.log('🔄 [MODEL] File details:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        const { error: uploadError } = await supabase.storage
          .from('figurine-images')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('❌ [MODEL] Upload error:', uploadError);
          throw uploadError;
        }
        
        const { data } = supabase.storage
          .from('figurine-images')
          .getPublicUrl(filePath);
          
        console.log('✅ [MODEL] Model uploaded successfully:', data.publicUrl);
        
        toast({
          title: "Model uploaded",
          description: `Your 3D model has been uploaded to the gallery`,
        });
        
        // Refresh the gallery
        onFilesUpdated();
      } catch (error) {
        console.error('❌ [MODEL] Error uploading model:', error);
        toast({
          title: "Upload failed",
          description: "There was an error uploading your model",
          variant: "destructive"
        });
      }
    };
    
    uploadModel();
  };
  
  return {
    customModelUrl,
    customModelFile,
    handleModelUpload
  };
};
