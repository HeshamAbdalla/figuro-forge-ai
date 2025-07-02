
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Figurine } from '@/types/figurine';
import { validateAndCleanUrl } from '@/utils/urlValidationUtils';
import { modelManager } from '@/utils/modelManager';

interface ShowcaseModel extends Figurine {
  position: [number, number, number];
  scale: number;
  rotationSpeed: number;
  floatAmplitude: number;
  floatSpeed: number;
  color: string;
}

export const useShowcaseModels = () => {
  const [models, setModels] = useState<ShowcaseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded predefined positions and animation settings for 8 models total
  const modelConfigs = [
    {
      position: [-3, 2, 0] as [number, number, number],
      scale: 0.8,
      rotationSpeed: 0.5,
      floatAmplitude: 0.3,
      floatSpeed: 1.2,
      color: '#9b87f5'
    },
    {
      position: [3, -1, -1] as [number, number, number],
      scale: 1.0,
      rotationSpeed: -0.3,
      floatAmplitude: 0.4,
      floatSpeed: 0.8,
      color: '#f59e0b'
    },
    {
      position: [0, -2, 1] as [number, number, number],
      scale: 0.6,
      rotationSpeed: 0.7,
      floatAmplitude: 0.2,
      floatSpeed: 1.5,
      color: '#ef4444'
    },
    {
      position: [-2, -1, -2] as [number, number, number],
      scale: 0.9,
      rotationSpeed: -0.4,
      floatAmplitude: 0.5,
      floatSpeed: 1.0,
      color: '#10b981'
    },
    {
      position: [2, 2, 2] as [number, number, number],
      scale: 0.7,
      rotationSpeed: 0.6,
      floatAmplitude: 0.3,
      floatSpeed: 1.3,
      color: '#8b5cf6'
    },
    // New model configurations
    {
      position: [-4, 1, 3] as [number, number, number],
      scale: 0.85,
      rotationSpeed: -0.25,
      floatAmplitude: 0.35,
      floatSpeed: 0.9,
      color: '#06b6d4'
    },
    {
      position: [4, -3, 0] as [number, number, number],
      scale: 1.1,
      rotationSpeed: 0.45,
      floatAmplitude: 0.4,
      floatSpeed: 1.1,
      color: '#ec4899'
    },
    {
      position: [0, 3, -3] as [number, number, number],
      scale: 0.75,
      rotationSpeed: -0.35,
      floatAmplitude: 0.25,
      floatSpeed: 1.4,
      color: '#f97316'
    }
  ];

  useEffect(() => {
    const fetchShowcaseModels = async () => {
      try {
        console.log('🔄 [SHOWCASE-MODELS] Fetching models for 3D showcase...');
        
        // Fetch figurines with 3D models - increased limit
        const { data: figurinesData, error: figurinesError } = await supabase
          .from('figurines')
          .select('*')
          .eq('is_public', true)
          .eq('file_type', 'image')
          .not('model_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(8); // Increased from 5 to 8

        if (figurinesError) {
          console.error('❌ [SHOWCASE-MODELS] Error fetching figurines:', figurinesError);
          throw figurinesError;
        }

        // Fetch conversion tasks with completed 3D models - increased limit
        const { data: conversionsData, error: conversionsError } = await supabase
          .from('conversion_tasks')
          .select('*')
          .eq('status', 'SUCCEEDED')
          .not('local_model_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(8); // Increased from 5 to 8

        if (conversionsError) {
          console.warn('⚠️ [SHOWCASE-MODELS] Error fetching conversions:', conversionsError);
        }

        // Process and combine data
        const allModels: Figurine[] = [];

        // Process figurines
        if (figurinesData) {
          figurinesData.forEach(figurine => {
            const modelValidation = validateAndCleanUrl(figurine.model_url);
            if (modelValidation.isValid) {
              allModels.push({
                ...figurine,
                model_url: modelValidation.cleanUrl,
                file_type: 'image' as const,
                metadata: (figurine.metadata && typeof figurine.metadata === 'object' && !Array.isArray(figurine.metadata)) 
                  ? figurine.metadata as Record<string, any>
                  : {}
              });
            }
          });
        }

        // Process conversions
        if (conversionsData) {
          conversionsData.forEach(conversion => {
            // Prioritize local model URL over remote
            const modelUrl = conversion.local_model_url || conversion.model_url;
            const thumbnailUrl = conversion.local_thumbnail_url || conversion.thumbnail_url;
            
            if (modelUrl) {
              const modelValidation = validateAndCleanUrl(modelUrl);
              const thumbnailValidation = validateAndCleanUrl(thumbnailUrl);
              
              if (modelValidation.isValid) {
                allModels.push({
                  id: conversion.id,
                  title: `3D Model: ${conversion.prompt?.substring(0, 30) || 'Generated'}${conversion.prompt && conversion.prompt.length > 30 ? '...' : ''}`,
                  prompt: conversion.prompt || '',
                  style: (conversion.art_style as Figurine['style']) || 'text-to-3d',
                  image_url: thumbnailValidation.isValid ? thumbnailValidation.cleanUrl : '',
                  saved_image_url: thumbnailValidation.isValid ? thumbnailValidation.cleanUrl : null,
                  model_url: modelValidation.cleanUrl,
                  created_at: conversion.created_at || new Date().toISOString(),
                  user_id: conversion.user_id,
                  is_public: true,
                  file_type: '3d-model' as const,
                  metadata: {
                    conversion_type: 'text-to-3d',
                    creator_name: 'Community Member'
                  }
                });
              }
            }
          });
        }

        // Filter and limit to available models - increased to 6
        const validModels = allModels
          .filter(model => model.model_url && model.model_url.trim() !== '')
          .slice(0, 6); // Increased from 3 to 6 models

        console.log('✅ [SHOWCASE-MODELS] Found valid models:', validModels.length);

        // Assign positions and animation configs
        const configuredModels: ShowcaseModel[] = validModels.map((model, index) => ({
          ...model,
          ...modelConfigs[index % modelConfigs.length]
        }));

        setModels(configuredModels);
        setLoading(false);

      } catch (err) {
        console.error('❌ [SHOWCASE-MODELS] Failed to fetch showcase models:', err);
        setError(err instanceof Error ? err.message : 'Failed to load showcase models');
        setLoading(false);
      }
    };

    fetchShowcaseModels();

    // Cleanup function to clear model cache when component unmounts
    return () => {
      console.log('🧹 [SHOWCASE-MODELS] Cleaning up model cache...');
      modelManager.clearCache();
    };
  }, []);

  return { models, loading, error };
};
