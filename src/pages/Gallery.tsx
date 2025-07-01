import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listFiles } from "@/lib/api";
import { BucketImage } from "@/components/gallery/types";
import PageTransition from "@/components/PageTransition";
import OptimizedGalleryGrid from "@/components/gallery/performance/OptimizedGalleryGrid";
import { useToast } from "@/hooks/use-toast";
import { useModelViewerNavigation } from "@/hooks/useModelViewerNavigation";
import { useFiguroAccount } from "@/hooks/useFiguroAccount";
import { useSecureDownload } from "@/hooks/useSecureDownload";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { webGLContextTracker } from "@/components/model-viewer/utils/resourceManager";
import WebGLSystemMonitor from '@/components/model-viewer/context/WebGLSystemMonitor';

const Gallery: React.FC = () => {
  const [images, setImages] = useState<BucketImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyTextTo3D, setShowOnlyTextTo3D] = useState(false);
  const [maxItems, setMaxItems] = useState<number>(50);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { navigateToModelViewer } = useModelViewerNavigation();
  const { isLoggedIn } = useFiguroAccount();
  const { secureDownload } = useSecureDownload();

  // Fetch images from the bucket
  const { 
    isLoading: queryLoading, 
    error: queryError, 
    data, 
    refetch 
  } = useQuery({
    queryKey: ['bucketImages', debouncedSearchTerm, showOnlyTextTo3D, maxItems],
    queryFn: () => listFiles(debouncedSearchTerm, showOnlyTextTo3D, maxItems),
    refetchOnWindowFocus: false,
    retry: false
  });

  useEffect(() => {
    setLoading(queryLoading);
    if (queryError) {
      setError(`Failed to load files: ${queryError.message}`);
      console.error("Failed to load files:", queryError);
      toast({
        title: "Error loading gallery",
        description: "Failed to load files from the bucket.",
        variant: "destructive"
      });
    } else {
      setError(null);
    }
    if (data) {
      setImages(data);
    }
  }, [data, queryError, queryLoading, toast]);

  // Handlers for download and view actions
  const handleDownload = async (url: string, name: string) => {
    try {
      if (isLoggedIn) {
        await secureDownload(url, name);
      } else {
        // Directly trigger download if not logged in
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
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
      return images;
    }

    return images.filter(img => {
      const matchesSearch = debouncedSearchTerm ? 
        img.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) : true;
      const matchesTextTo3D = showOnlyTextTo3D ? img.fullPath?.includes('figurine-models/') : true;

      return matchesSearch && matchesTextTo3D;
    });
  }, [images, debouncedSearchTerm, showOnlyTextTo3D]);

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
