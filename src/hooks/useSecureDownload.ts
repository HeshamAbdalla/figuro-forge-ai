
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useSecureDownload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const secureDownload = async (imageUrl: string, imageName: string) => {
    // Check if user is authenticated
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }

    setIsDownloading(true);
    
    try {
      console.log('🔄 [SECURE-DOWNLOAD] Starting secure download:', imageName);
      
      // Call the Supabase Edge Function using the supabase client
      const { data, error } = await supabase.functions.invoke('download-image', {
        body: { 
          imageUrl, 
          fileName: imageName 
        },
      });

      if (error) {
        console.error('❌ [SECURE-DOWNLOAD] Edge function error:', error);
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          setAuthPromptOpen(true);
          return;
        }
        throw new Error('Download failed');
      }

      // The edge function should return a blob directly
      // Convert the response to a blob if it's not already
      let blob: Blob;
      
      if (data instanceof Blob) {
        blob = data;
      } else if (data instanceof ArrayBuffer) {
        blob = new Blob([data]);
      } else {
        // If data is some other format, we need to handle it
        console.error('❌ [SECURE-DOWNLOAD] Unexpected data format:', typeof data);
        throw new Error('Unexpected response format');
      }
      
      // Create download link
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = imageName || 'figurine.png';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      console.log('✅ [SECURE-DOWNLOAD] Download completed successfully');
      toast({
        title: "Download started",
        description: `Downloading ${imageName || 'file'}`,
        variant: "default"
      });
    } catch (error) {
      console.error("❌ [SECURE-DOWNLOAD] Error downloading file:", error);
      toast({
        title: "Download failed",
        description: "There was a problem downloading the file",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    secureDownload,
    isDownloading,
    authPromptOpen,
    setAuthPromptOpen,
    isAuthenticated: !!user
  };
};
