
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
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAuthPromptOpen(true);
        return;
      }

      // Make direct fetch request to the edge function to get the blob response
      const response = await fetch(`https://cwjxbwqdfejhmiixoiym.supabase.co/functions/v1/download-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3anhid3FkZmVqaG1paXhvaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTg0MDksImV4cCI6MjA2MzQ3NDQwOX0.g_-L7Bsv0cnEjSLNXEjrDdYYdxtV7yiHFYUV3_Ww3PI',
        },
        body: JSON.stringify({ 
          imageUrl, 
          fileName: imageName 
        }),
      });

      if (!response.ok) {
        console.error('❌ [SECURE-DOWNLOAD] Edge function error:', response.status);
        if (response.status === 401) {
          setAuthPromptOpen(true);
          return;
        }
        throw new Error('Download failed');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
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
