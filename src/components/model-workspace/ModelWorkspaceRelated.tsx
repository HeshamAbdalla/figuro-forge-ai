
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Figurine } from "@/types/figurine";

interface ModelWorkspaceRelatedProps {
  figurine: Figurine;
}

const ModelWorkspaceRelated: React.FC<ModelWorkspaceRelatedProps> = ({ figurine }) => {
  const [relatedModels, setRelatedModels] = useState<Figurine[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRelatedModels();
  }, [figurine]);

  const fetchRelatedModels = async () => {
    try {
      // Fetch related models based on style or similar prompts
      const { data: figurinesData } = await supabase
        .from('figurines')
        .select('*')
        .eq('style', figurine.style)
        .eq('is_public', true)
        .neq('id', figurine.id)
        .limit(3);

      const { data: conversionsData } = await supabase
        .from('conversion_tasks')
        .select('*')
        .eq('art_style', figurine.style)
        .eq('status', 'SUCCEEDED')
        .neq('id', figurine.id)
        .limit(2);

      const processedConversions = (conversionsData || []).map(conversion => ({
        id: conversion.id,
        title: `Text-to-3D: ${conversion.prompt?.substring(0, 30) || 'Generated'}...`,
        prompt: conversion.prompt || "",
        style: conversion.art_style || "isometric",
        image_url: conversion.local_thumbnail_url || conversion.thumbnail_url || "",
        saved_image_url: conversion.local_thumbnail_url || conversion.thumbnail_url,
        model_url: conversion.local_model_url || conversion.model_url,
        created_at: conversion.created_at,
        user_id: conversion.user_id,
        is_public: true,
        file_type: '3d-model' as const,
        metadata: { conversion_type: 'text-to-3d' }
      })) as Figurine[];

      // Process figurines data to ensure proper typing
      const processedFigurines = (figurinesData || []).map(fig => ({
        ...fig,
        file_type: (fig.file_type as Figurine['file_type']) || 'image'
      })) as Figurine[];

      const allRelated = [...processedFigurines, ...processedConversions];
      setRelatedModels(allRelated.slice(0, 4));
    } catch (error) {
      console.error('Error fetching related models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelClick = (modelId: string) => {
    navigate(`/model/${modelId}`);
  };

  return (
    <Card className="bg-gray-900/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-figuro-accent" />
          Related Models
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : relatedModels.length > 0 ? (
          <div className="space-y-3">
            {relatedModels.map((model) => (
              <div
                key={model.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => handleModelClick(model.id)}
              >
                <img
                  src={model.image_url}
                  alt={model.title}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-medium truncate">
                    {model.title}
                  </h4>
                  <p className="text-white/60 text-xs truncate">
                    {model.style}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/40" />
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
              onClick={() => navigate('/gallery')}
            >
              View All Models
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No related models found</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-white/20 text-white hover:bg-white/10"
              onClick={() => navigate('/gallery')}
            >
              Explore Gallery
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelWorkspaceRelated;
