
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { EnhancedModelViewer } from "@/components/model-viewer/EnhancedModelViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Share2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FigurineDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: figurine, isLoading, error } = useQuery({
    queryKey: ['figurine', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('figurines')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!id,
  });

  const handleDownload = async () => {
    if (!figurine?.model_url) {
      toast({
        title: "Download Failed",
        description: "No model file available for download",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(figurine.model_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${figurine.title || 'figurine'}.glb`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your figurine model is being downloaded",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the model file",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: figurine?.title || 'Check out this figurine',
          text: figurine?.prompt || 'Amazing 3D figurine created with Figuro',
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Figurine link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="pt-20 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-96 bg-white/10 rounded-lg mb-6"></div>
              <div className="h-8 bg-white/10 rounded mb-4"></div>
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !figurine) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="pt-20 p-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Figurine Not Found</h1>
            <p className="text-white/70 mb-6">
              The figurine you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      <div className="pt-20 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Model Viewer */}
            <div className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-figuro-accent/20 to-figuro-darker">
                    {figurine.model_url ? (
                      <EnhancedModelViewer
                        modelUrl={figurine.model_url}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">
                        <Eye className="w-12 h-12 mb-2" />
                        <p>No 3D model available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleDownload}
                  disabled={!figurine.model_url}
                  className="flex-1 bg-figuro-accent hover:bg-figuro-accent-hover"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {figurine.title || 'Untitled Figurine'}
                </h1>
                {figurine.prompt && (
                  <p className="text-white/70 text-lg">
                    "{figurine.prompt}"
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {figurine.art_style && (
                  <Badge variant="secondary" className="bg-figuro-accent/20 text-figuro-accent">
                    {figurine.art_style}
                  </Badge>
                )}
                {figurine.status && (
                  <Badge variant="outline" className="border-white/20 text-white/70">
                    {figurine.status}
                  </Badge>
                )}
              </div>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {figurine.created_at && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Created:</span>
                      <span className="text-white">
                        {new Date(figurine.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {figurine.model_url && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Format:</span>
                      <span className="text-white">GLB</span>
                    </div>
                  )}
                  {figurine.user_id && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Type:</span>
                      <span className="text-white">3D Figurine</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigurineDetails;
