
import { useState } from 'react';
import { Figurine } from '@/types/figurine';
import EnhancedModelDialog from '@/components/gallery/enhanced/EnhancedModelDialog';
import EnhancedGalleryView from '@/components/gallery/enhanced/EnhancedGalleryView';
import { useFigurines } from './useFigurines';
import UploadModelModal from '@/components/UploadModelModal';
import { updateFigurinePublicStatus, updateFigurineWithModelUrl } from '@/services/figurineService';
import { useToast } from '@/hooks/use-toast';

const EnhancedFigurineGallery = () => {
  const { figurines, loading, error, refreshFigurines } = useFigurines();
  const [selectedFigurine, setSelectedFigurine] = useState<Figurine | null>(null);
  const [modelViewerOpen, setModelViewerOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (figurine: Figurine) => {
    const isTextTo3D = figurine.style === 'text-to-3d' || figurine.title.startsWith('Text-to-3D:');
    const isWebIcon = figurine.file_type === 'web-icon' || figurine.title.startsWith('Web Icon:');
    
    if (isTextTo3D && figurine.model_url) {
      // Download 3D model for text-to-3D figurines
      try {
        setIsDownloading(true);
        
        const cleanUrl = figurine.model_url.split('?')[0];
        console.log("Starting 3D model download for:", cleanUrl);
        
        const response = await fetch(cleanUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log("Model blob received:", blob.type, blob.size);
        
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `model-${figurine.title.replace(/\s+/g, '-')}-${figurine.id.substring(0, 8)}.glb`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
          title: "Download started",
          description: "Your 3D model is being downloaded",
        });
        
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          setIsDownloading(false);
        }, 1000);
      } catch (error) {
        console.error("Error downloading 3D model:", error);
        setIsDownloading(false);
        toast({
          title: "Download failed",
          description: "There was a problem downloading the 3D model",
          variant: "destructive"
        });
      }
    } else {
      // Download image for traditional figurines and web icons
      const imageUrl = figurine.saved_image_url || figurine.image_url;
      if (!imageUrl) {
        toast({
          title: "Download failed",
          description: "No image available for download",
          variant: "destructive"
        });
        return;
      }
      
      try {
        setIsDownloading(true);
        
        const cleanUrl = imageUrl.split('?')[0];
        console.log("Starting image download for:", cleanUrl);
        
        const response = await fetch(cleanUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log("Image blob received:", blob.type, blob.size);
        
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        const fileExtension = isWebIcon ? 'png' : 'png';
        const prefix = isWebIcon ? 'web-icon' : 'figurine';
        a.download = `${prefix}-${figurine.title.replace(/\s+/g, '-')}-${figurine.id.substring(0, 8)}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
          title: "Download started",
          description: `Your ${isWebIcon ? 'web icon' : 'figurine image'} is being downloaded`,
        });
        
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          setIsDownloading(false);
        }, 1000);
      } catch (error) {
        console.error("Error downloading figurine:", error);
        setIsDownloading(false);
        toast({
          title: "Download failed",
          description: `There was a problem downloading the ${isWebIcon ? 'web icon' : 'figurine image'}`,
          variant: "destructive"
        });
      }
    }
  };

  const handleViewModel = (figurine: Figurine) => {
    if (!figurine.model_url) {
      toast({
        title: "No 3D model",
        description: "This figurine doesn't have a 3D model to view",
        variant: "default"
      });
      return;
    }
    
    // Clean up model URL to prevent cache-busting issues
    let modelUrl = figurine.model_url;
    try {
      const url = new URL(figurine.model_url);
      // Remove cache-busting parameters
      ['t', 'cb', 'cache'].forEach(param => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
        }
      });
      modelUrl = url.toString();
    } catch (e) {
      console.error("Error parsing model URL", e);
    }
    
    setSelectedFigurine({
      ...figurine,
      model_url: modelUrl
    });
    setModelViewerOpen(true);
  };

  const handleTogglePublish = async (figurine: Figurine) => {
    try {
      const newPublicStatus = !figurine.is_public;
      await updateFigurinePublicStatus(figurine.id, newPublicStatus);
      
      toast({
        title: newPublicStatus ? "Figurine published" : "Figurine unpublished",
        description: newPublicStatus 
          ? "Your figurine is now visible in the public gallery" 
          : "Your figurine has been removed from the public gallery"
      });
      
      // Refresh the list to get updated data
      refreshFigurines();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast({
        title: "Error",
        description: "Failed to update the figurine's publish status",
        variant: "destructive"
      });
    }
  };

  const handleUploadModel = (figurine: Figurine) => {
    // Don't allow model upload for web icons
    if (figurine.file_type === 'web-icon') {
      toast({
        title: "Not supported",
        description: "3D model uploads are not supported for web icons",
        variant: "default"
      });
      return;
    }
    
    setSelectedFigurine(figurine);
    setUploadModalOpen(true);
  };

  const handleModelUpload = async (figurineId: string, file: File) => {
    if (!selectedFigurine) return;
    
    try {
      // Create object URL for the uploaded file
      const url = URL.createObjectURL(file);
      
      await updateFigurineWithModelUrl(selectedFigurine.id, url);
      
      toast({
        title: "3D model uploaded",
        description: "The 3D model has been added to your figurine"
      });
      
      // Close the upload modal
      setUploadModalOpen(false);
      
      // Refresh the list to get updated data
      refreshFigurines();
    } catch (error) {
      console.error("Error uploading model:", error);
      toast({
        title: "Upload failed",
        description: "Failed to update the figurine with the model URL",
        variant: "destructive"
      });
    }
  };

  const handleCloseModelViewer = () => {
    setModelViewerOpen(false);
    setSelectedFigurine(null);
  };

  // Toggle performance monitor
  const togglePerformanceMonitor = () => {
    setShowPerformanceMonitor(!showPerformanceMonitor);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <p>Error loading figurines: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Performance Monitor Toggle */}
      <div className="fixed top-4 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePerformanceMonitor}
          className="bg-black/50 border-white/20 text-white hover:bg-black/70"
        >
          {showPerformanceMonitor ? 'Hide' : 'Show'} Performance
        </Button>
      </div>

      <EnhancedGalleryView
        figurines={figurines}
        loading={loading}
        onDownload={handleDownload}
        onViewModel={handleViewModel}
        onTogglePublish={handleTogglePublish}
        onUploadModel={handleUploadModel}
      />

      <EnhancedModelDialog
        open={modelViewerOpen}
        onOpenChange={setModelViewerOpen}
        modelUrl={selectedFigurine?.model_url || null}
        fileName={selectedFigurine?.title}
        onClose={handleCloseModelViewer}
      />

      <UploadModelModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUpload={handleModelUpload}
        figurineId={selectedFigurine?.id || ""}
      />

      {/* Enhanced Performance Monitor */}
      {showPerformanceMonitor && (
        <>
          {/* Import and use the performance monitor */}
          {React.createElement(
            React.lazy(() => import('../gallery/performance/EnhancedPerformanceMonitor')),
            {
              visible: true,
              position: 'bottom-right' as const,
              compact: false
            }
          )}
        </>
      )}
    </>
  );
};

export default EnhancedFigurineGallery;
