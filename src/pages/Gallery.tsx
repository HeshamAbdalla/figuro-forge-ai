
import React, { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { BucketImage } from "@/components/gallery/types";
import PageTransition from "@/components/PageTransition";
import OptimizedGalleryGrid from "@/components/gallery/performance/OptimizedGalleryGrid";
import { useToast } from "@/hooks/use-toast";
import { useModelViewerNavigation } from "@/hooks/useModelViewerNavigation";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import WebGLSystemMonitor from '@/components/model-viewer/context/WebGLSystemMonitor';

const Gallery: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyTextTo3D, setShowOnlyTextTo3D] = useState(false);
  const [maxItems, setMaxItems] = useState<number>(50);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { navigateToModelViewer } = useModelViewerNavigation();
  
  // Use the existing gallery files hook
  const { files: images, isLoading: loading, error, refreshFiles } = useGalleryFiles();

  // Simple debounce implementation
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState(searchTerm);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handlers for download and view actions
  const handleDownload = async (url: string, name: string) => {
    try {
      // Directly trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      toast({
        title: "Download failed",
        description: "There was an error initiating the download.",
        variant: "destructive"
      });
    }
  };

  const handleView = useCallback((url: string, name: string, type: 'image' | '3d-model' | 'web-icon') => {
    console.log(`Gallery: handleView called for ${name} of type ${type}`);
    
    if (type === '3d-model') {
      navigateToModelViewer({
        modelUrl: url,
        fileName: name,
        returnUrl: '/gallery'
      });
    } else {
      // For images, open in a new tab
      window.open(url, '_blank');
    }
  }, [navigateToModelViewer]);

  const handleGenerate3D = (url: string, name: string) => {
    navigate(`/generate-3d?url=${encodeURIComponent(url)}&name=${name}`);
  };

  // Filter images based on search term
  const filteredImages = React.useMemo(() => {
    if (!debouncedSearchTerm && !showOnlyTextTo3D) {
      return images.slice(0, maxItems);
    }

    let filtered = images;
    
    if (debouncedSearchTerm) {
      filtered = filtered.filter(img => 
        img.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    if (showOnlyTextTo3D) {
      filtered = filtered.filter(img => 
        img.fullPath?.includes('figurine-models/') || 
        img.name.toLowerCase().includes('text-to-3d')
      );
    }

    return filtered.slice(0, maxItems);
  }, [images, debouncedSearchTerm, showOnlyTextTo3D, maxItems]);

  return (
    <PageTransition>
      <Helmet>
        <title>Figuro 3D Model Gallery</title>
        <meta name="description" content="Explore a diverse gallery of 3D models and digital creations on Figuro." />
        <meta property="og:title" content="Figuro 3D Model Gallery" />
        <meta property="og:description" content="Discover amazing 3D models and digital art in Figuro's online gallery." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      
      <div className="min-h-screen bg-figuro-dark">
        <header className="bg-figuro-darker p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold text-white">3D Model Gallery</h1>
            <div className="flex items-center space-x-4">
              <Input
                type="search"
                placeholder="Search models..."
                className="bg-gray-800 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-figuro-accent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>
        
        <section className="container mx-auto mt-6 px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="textTo3DOnly" className="text-white/80">
                Text-to-3D Only
              </Label>
              <Switch
                id="textTo3DOnly"
                checked={showOnlyTextTo3D}
                onCheckedChange={(checked) => {
                  setShowOnlyTextTo3D(checked);
                }}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Label htmlFor="maxItems" className="text-white/80">
                Max Items: {maxItems}
              </Label>
              <Slider
                id="maxItems"
                defaultValue={[maxItems]}
                max={200}
                step={10}
                onValueChange={(value) => setMaxItems(value[0])}
                className="w-[200px]"
              />
            </div>
          </div>
          <Separator className="bg-white/10" />
        </section>
        
        <main className="container mx-auto px-4 py-8">
          <OptimizedGalleryGrid
            images={filteredImages}
            isLoading={loading}
            onDownload={handleDownload}
            onView={handleView}
            onGenerate3D={handleGenerate3D}
            showPerformanceMonitor={true}
          />
        </main>
        
        {/* Add WebGL System Monitor */}
        <WebGLSystemMonitor 
          visible={true}
          position="bottom-left"
        />
      </div>
    </PageTransition>
  );
};

export default Gallery;
