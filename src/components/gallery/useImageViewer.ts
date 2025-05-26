
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useImageViewer = () => {
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageName, setViewingImageName] = useState<string | undefined>(undefined);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const { toast } = useToast();

  // Handle closing image viewer and cleaning up resources
  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setViewingImage(null);
    setViewingImageName(undefined);
  };

  // Handle opening image viewer
  const handleViewImage = (imageUrl: string, fileName?: string) => {
    // First make sure the URL is valid
    if (!imageUrl || typeof imageUrl !== 'string') {
      toast({
        title: "Invalid image",
        description: "The image URL is invalid or missing.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Opening image viewer with URL:", imageUrl, "fileName:", fileName);
    
    // First close any existing viewer to clean up resources
    if (imageViewerOpen) {
      handleCloseImageViewer();
      
      // Small timeout to ensure cleanup before opening new image
      setTimeout(() => {
        setViewingImage(imageUrl);
        setViewingImageName(fileName);
        setImageViewerOpen(true);
      }, 200);
    } else {
      setViewingImage(imageUrl);
      setViewingImageName(fileName);
      setImageViewerOpen(true);
    }
  };
  
  return {
    viewingImage,
    viewingImageName,
    imageViewerOpen,
    setImageViewerOpen,
    handleViewImage,
    handleCloseImageViewer
  };
};
