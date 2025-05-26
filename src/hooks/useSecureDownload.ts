
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

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
      // Call our secure download endpoint
      const response = await fetch('/api/download-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl, 
          fileName: imageName 
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthPromptOpen(true);
          return;
        }
        throw new Error('Download failed');
      }

      // Get the blob from response
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

      toast({
        title: "Download started",
        description: `Downloading ${imageName || 'file'}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error downloading file:", error);
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
