
import React from "react";
import { useNavigate } from "react-router-dom";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { useSecureDownload } from "@/hooks/useSecureDownload";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import { useImageViewer } from "@/components/gallery/useImageViewer";
import { useToast } from "@/hooks/use-toast";
import { deleteFigurine } from "@/services/deletionService";
import { BucketImage } from "@/components/gallery/types";
import { SecurityWrapper } from "@/components/security/SecurityWrapper";
import { RLSValidator } from "@/components/security/RLSValidator";
import HomepageEnhancedGalleryHeader from "@/components/homepage/HomepageEnhancedGalleryHeader";
import HomepageGalleryLoading from "@/components/homepage/HomepageGalleryLoading";
import HomepageGalleryEmpty from "@/components/homepage/HomepageGalleryEmpty";
import HomepageEnhancedGalleryGrid from "@/components/homepage/HomepageEnhancedGalleryGrid";
import HomepageGalleryModals from "@/components/homepage/HomepageGalleryModals";

const HomepageGallery: React.FC = () => {
  const {
    files,
    isLoading,
    refreshFiles
  } = useGalleryFiles();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Set up model viewer functionality
  const {
    viewingModel,
    modelViewerOpen,
    setModelViewerOpen,
    onViewModel,
    onCloseModelViewer
  } = useModelViewer();

  // Set up image viewer functionality
  const {
    viewingImage,
    viewingImageName,
    imageViewerOpen,
    setImageViewerOpen,
    onViewImage,
    onCloseImageViewer
  } = useImageViewer();

  // Set up secure download functionality
  const {
    secureDownload,
    isDownloading,
    authPromptOpen,
    setAuthPromptOpen,
    isAuthenticated
  } = useSecureDownload();
  
  const navigateToGallery = () => {
    navigate("/gallery");
  };
  
  const navigateToStudio = () => {
    navigate("/studio");
  };

  // Handle view functionality - route to appropriate viewer
  const handleView = (url: string, fileName: string, fileType: 'image' | '3d-model' | 'web-icon') => {
    if (fileType === '3d-model') {
      onViewModel(url, fileName);
    } else {
      onViewImage(url, fileName);
    }
  };

  // Handle delete functionality with enhanced security
  const handleDelete = async (file: BucketImage): Promise<void> => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete items from your collection.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('🗑️ [HOMEPAGE-GALLERY] Starting secure delete process for file:', file.name);

      // Extract figurine ID from the file path or metadata
      let figurineId: string | null = null;

      // Try to get figurine ID from the full path
      if (file.fullPath) {
        const pathParts = file.fullPath.split('/');
        const filename = pathParts[pathParts.length - 1];
        const idMatch = filename.match(/^([a-f0-9-]{36})/i); // UUID pattern
        if (idMatch) {
          figurineId = idMatch[1];
        }
      }

      // If we can't extract ID from path, try from the file name
      if (!figurineId && file.name) {
        const idMatch = file.name.match(/([a-f0-9-]{36})/i);
        if (idMatch) {
          figurineId = idMatch[1];
        }
      }
      
      if (!figurineId) {
        console.error('❌ [HOMEPAGE-GALLERY] Could not extract figurine ID from file:', file);
        toast({
          title: "Delete Failed",
          description: "Could not identify the item to delete. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('🔍 [HOMEPAGE-GALLERY] Extracted figurine ID:', figurineId);
      const result = await deleteFigurine(figurineId);
      
      if (result.success) {
        toast({
          title: "Item Deleted",
          description: `"${file.name}" has been successfully deleted from your collection.`
        });

        // Refresh the gallery to show updated list
        await refreshFiles();
        console.log('✅ [HOMEPAGE-GALLERY] Gallery refreshed after deletion');
      } else {
        throw new Error(result.error || 'Unknown deletion error');
      }
    } catch (error) {
      console.error('❌ [HOMEPAGE-GALLERY] Delete operation failed:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete the item. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <SecurityWrapper requireAuth={false} minSecurityScore={30}>
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Enhanced background with animated gradients */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-figuro-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDelay: '1s' }} />
        
        <RLSValidator tableName="figurines">
          <div className="container mx-auto relative z-10">
            <HomepageEnhancedGalleryHeader 
              navigateToGallery={navigateToGallery}
              navigateToStudio={navigateToStudio}
            />
            
            {isLoading ? (
              <HomepageGalleryLoading />
            ) : files.length === 0 ? (
              <HomepageGalleryEmpty onNavigateToStudio={navigateToStudio} />
            ) : (
              <HomepageEnhancedGalleryGrid 
                images={files}
                onView={handleView}
                onDelete={handleDelete}
                onDownload={secureDownload}
                isDownloading={isDownloading}
                isAuthenticated={isAuthenticated}
                onNavigateToGallery={navigateToGallery}
              />
            )}
          </div>
        </RLSValidator>
        
        <HomepageGalleryModals 
          modelViewerOpen={modelViewerOpen}
          setModelViewerOpen={setModelViewerOpen}
          viewingModel={viewingModel}
          onCloseModelViewer={onCloseModelViewer}
          imageViewerOpen={imageViewerOpen}
          setImageViewerOpen={setImageViewerOpen}
          viewingImage={viewingImage}
          viewingImageName={viewingImageName}
          onCloseImageViewer={onCloseImageViewer}
          authPromptOpen={authPromptOpen}
          setAuthPromptOpen={setAuthPromptOpen}
        />
      </section>
    </SecurityWrapper>
  );
};

export default HomepageGallery;
