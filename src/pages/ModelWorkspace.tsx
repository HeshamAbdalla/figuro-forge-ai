
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Figurine } from "@/types/figurine";
import { useResponsiveMobile } from "@/hooks/useResponsiveMobile";

// Desktop Components
import ModelWorkspaceHeader from "@/components/model-workspace/ModelWorkspaceHeader";
import ModelWorkspaceInfo from "@/components/model-workspace/ModelWorkspaceInfo";
import ModelWorkspaceActions from "@/components/model-workspace/ModelWorkspaceActions";
import ModelWorkspaceSpecs from "@/components/model-workspace/ModelWorkspaceSpecs";
import ModelWorkspaceRelated from "@/components/model-workspace/ModelWorkspaceRelated";

// Mobile Components  
import MobileModelWorkspaceHeader from "@/components/model-workspace/MobileModelWorkspaceHeader";
import ResponsiveModelViewer from "@/components/model-workspace/ResponsiveModelViewer";
import MobileModelInfo from "@/components/model-workspace/MobileModelInfo";
import MobileActionBar from "@/components/model-workspace/MobileActionBar";

// Shared Components
import ModelViewer from "@/components/model-viewer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ModelWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile, isTablet } = useResponsiveMobile();
  
  const [figurine, setFigurine] = useState<Figurine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Model ID is required");
      setLoading(false);
      return;
    }

    fetchFigurine();
  }, [id]);

  const fetchFigurine = async () => {
    try {
      setLoading(true);
      
      // First try to get from figurines table
      const { data: figurineData, error: figurineError } = await supabase
        .from('figurines')
        .select('*')
        .eq('id', id)
        .single();

      if (figurineData) {
        // Ensure proper typing for figurine data
        const processedFigurine: Figurine = {
          ...figurineData,
          file_type: (figurineData.file_type as Figurine['file_type']) || 'image',
          metadata: (figurineData.metadata as Record<string, any>) || {}
        };
        setFigurine(processedFigurine);
      } else {
        // If not found in figurines, try conversion_tasks
        const { data: conversionData, error: conversionError } = await supabase
          .from('conversion_tasks')
          .select('*')
          .eq('id', id)
          .single();

        if (conversionData) {
          // Valid art styles from the Figurine type
          const validStyles: Figurine['style'][] = ['isometric', 'anime', 'pixar', 'steampunk', 'lowpoly', 'cyberpunk', 'realistic', 'chibi', 'text-to-3d'];
          
          // Ensure art_style matches allowed values or fallback to isometric
          const validStyle = validStyles.includes(conversionData.art_style as Figurine['style']) 
            ? conversionData.art_style as Figurine['style']
            : 'isometric' as const;

          // Transform conversion task to figurine format
          const transformedFigurine: Figurine = {
            id: conversionData.id,
            title: `Text-to-3D: ${conversionData.prompt?.substring(0, 50) || 'Generated Model'}`,
            prompt: conversionData.prompt || "",
            style: validStyle,
            image_url: conversionData.local_thumbnail_url || conversionData.thumbnail_url || "",
            saved_image_url: conversionData.local_thumbnail_url || conversionData.thumbnail_url,
            model_url: conversionData.local_model_url || conversionData.model_url,
            created_at: conversionData.created_at,
            user_id: conversionData.user_id,
            is_public: true,
            file_type: '3d-model' as const,
            metadata: {
              conversion_type: 'text-to-3d',
              art_style: conversionData.art_style,
              generation_mode: conversionData.generation_mode,
              topology_type: conversionData.topology_type
            }
          };
          setFigurine(transformedFigurine);
        } else {
          throw new Error("Model not found");
        }
      }
    } catch (err) {
      console.error('Error fetching figurine:', err);
      setError(err instanceof Error ? err.message : "Failed to load model");
      toast({
        title: "Error",
        description: "Failed to load model details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!figurine) return;

    try {
      const downloadUrl = figurine.model_url || figurine.image_url;
      if (!downloadUrl) {
        toast({
          title: "Download Error",
          description: "No download URL available",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${figurine.title.replace(/\s+/g, '-')}.${figurine.model_url ? 'glb' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your model is being downloaded"
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the model",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: figurine?.title,
          text: figurine?.prompt,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Model link copied to clipboard"
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Model removed from your favorites" : "Model added to your favorites"
    });
  };

  const handleBack = () => navigate('/gallery');

  if (loading) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-figuro-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading model...</p>
        </div>
      </div>
    );
  }

  if (error || !figurine) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Model Not Found</h2>
          <p className="text-white/70 mb-6">{error || "The requested model could not be found."}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <MobileModelWorkspaceHeader 
          figurine={figurine}
          onBack={handleBack}
          onDownload={handleDownload}
          onShare={handleShare}
          onLike={handleLike}
          isLiked={isLiked}
        />
        
        <div className="pb-20"> {/* Bottom padding for action bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 p-4"
          >
            {/* 3D/2D Viewer */}
            <ResponsiveModelViewer
              modelUrl={figurine.model_url}
              imageUrl={figurine.image_url}
              title={figurine.title}
            />
            
            {/* Model Information */}
            <MobileModelInfo figurine={figurine} />
          </motion.div>
        </div>

        <MobileActionBar
          figurine={figurine}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      </div>
    );
  }

  // Tablet Layout (hybrid approach)
  if (isTablet) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <ModelWorkspaceHeader 
          figurine={figurine}
          onBack={handleBack}
        />
        
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
            {/* Main 3D Viewer - Full width on tablet */}
            <div className="lg:col-span-2">
              <ResponsiveModelViewer
                modelUrl={figurine.model_url}
                imageUrl={figurine.image_url}
                title={figurine.title}
                className="h-[60vh] lg:h-full"
              />
            </div>

            {/* Sidebar - Info and Actions */}
            <div className="lg:col-span-1 space-y-4 overflow-y-auto">
              <ModelWorkspaceInfo figurine={figurine} />
              <ModelWorkspaceActions 
                figurine={figurine}
                onDownload={handleDownload}
                onShare={handleShare}
              />
              <ModelWorkspaceSpecs figurine={figurine} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout (existing layout)
  return (
    <div className="min-h-screen bg-figuro-dark">
      <ModelWorkspaceHeader 
        figurine={figurine}
        onBack={handleBack}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Left Sidebar - Model Info */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            <ModelWorkspaceInfo figurine={figurine} />
            <ModelWorkspaceSpecs figurine={figurine} />
          </div>

          {/* Main 3D Viewer */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-gray-900/50 border-white/10 overflow-hidden">
              <div className="h-full relative">
                {figurine.model_url ? (
                  <ModelViewer
                    modelUrl={figurine.model_url}
                    isLoading={false}
                    variant="gallery"
                    showControls={true}
                    autoRotate={true}
                    fillHeight={true}
                    className="w-full h-full [&_.glass-panel]:bg-transparent [&_.glass-panel]:border-0 [&_.glass-panel]:rounded-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-center">
                      <img 
                        src={figurine.image_url} 
                        alt={figurine.title}
                        className="max-w-md max-h-96 mx-auto rounded-lg shadow-2xl"
                      />
                      <p className="text-white/60 mt-4">Image Preview</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Actions & Related */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            <ModelWorkspaceActions 
              figurine={figurine}
              onDownload={handleDownload}
              onShare={handleShare}
            />
            <ModelWorkspaceRelated figurine={figurine} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelWorkspace;
