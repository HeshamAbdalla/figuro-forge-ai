
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const usePublicDownload = () => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const publicDownload = async (downloadUrl: string, fileName: string) => {
    setIsDownloading(true);
    
    try {
      console.log('🔄 [PUBLIC-DOWNLOAD] Starting public download:', fileName);
      
      if (!downloadUrl) {
        throw new Error('No download URL provided');
      }

      // Direct fetch without authentication
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        console.error('❌ [PUBLIC-DOWNLOAD] Fetch error:', response.status);
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create download link
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      console.log('✅ [PUBLIC-DOWNLOAD] Download completed successfully');
      toast({
        title: "Download started",
        description: `Downloading ${fileName || 'file'}`,
        variant: "default"
      });
    } catch (error) {
      console.error("❌ [PUBLIC-DOWNLOAD] Error downloading file:", error);
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
    publicDownload,
    isDownloading
  };
};
