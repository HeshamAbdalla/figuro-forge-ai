
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Figurine } from '@/types/figurine';
import { useToast } from '@/hooks/use-toast';
import { validateAndCleanUrl, prioritizeUrls } from '@/utils/urlValidationUtils';

export const useFigurines = () => {
  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFigurines = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setFigurines([]);
        setLoading(false);
        return;
      }
      
      console.log('🔄 [FIGURINES] Fetching figurines and text-to-3D models...');
      
      // Fetch traditional figurines
      const { data: figurinesData, error: figurinesError } = await supabase
        .from('figurines')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
          
      if (figurinesError) throw figurinesError;
      
      // Fetch text-to-3D conversion tasks (completed ones)
      const { data: conversionData, error: conversionError } = await supabase
        .from('conversion_tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'SUCCEEDED')
        .order('created_at', { ascending: false });
      
      if (conversionError) {
        console.warn('Failed to fetch conversion tasks:', conversionError);
      }
      
      console.log('✅ [FIGURINES] Fetched data:', {
        figurines: figurinesData?.length || 0,
        conversions: conversionData?.length || 0
      });
      
      // Process traditional figurines with enhanced URL validation
      const processedFigurines = (figurinesData || []).map(figurine => {
        const imageValidation = validateAndCleanUrl(figurine.image_url);
        const savedImageValidation = validateAndCleanUrl(figurine.saved_image_url);
        const modelValidation = validateAndCleanUrl(figurine.model_url);
        
        // Log any URL validation issues
        if (!imageValidation.isValid && figurine.image_url) {
          console.warn(`Invalid image URL for figurine ${figurine.id}:`, imageValidation.error);
        }
        if (!modelValidation.isValid && figurine.model_url) {
          console.warn(`Invalid model URL for figurine ${figurine.id}:`, modelValidation.error);
        }
        
        // Valid art styles from the Figurine type
        const validStyles: Figurine['style'][] = ['isometric', 'anime', 'pixar', 'steampunk', 'lowpoly', 'cyberpunk', 'realistic', 'chibi', 'text-to-3d'];
        const validStyle = validStyles.includes(figurine.style as Figurine['style']) 
          ? figurine.style as Figurine['style']
          : 'isometric' as const;
        
        return {
          id: figurine.id,
          title: figurine.title || "Untitled Figurine",
          prompt: figurine.prompt || "",
          style: validStyle,
          image_url: imageValidation.isValid ? imageValidation.cleanUrl : (figurine.image_url || ""),
          saved_image_url: savedImageValidation.isValid ? savedImageValidation.cleanUrl : figurine.saved_image_url,
          model_url: modelValidation.isValid ? modelValidation.cleanUrl : figurine.model_url,
          created_at: figurine.created_at || new Date().toISOString(),
          user_id: figurine.user_id,
          is_public: figurine.is_public || false,
          file_type: (figurine.file_type as Figurine['file_type']) || 'image',
          metadata: (figurine.metadata as Record<string, any>) || {}
        };
      });
      
      // Process text-to-3D conversions with enhanced URL prioritization and validation
      const processedConversions = (conversionData || []).map(conversion => {
        // Enhanced URL prioritization: local URLs first, then validate
        const prioritizedModelUrl = prioritizeUrls([
          conversion.local_model_url,
          conversion.model_url
        ]);
        
        const prioritizedThumbnailUrl = prioritizeUrls([
          conversion.local_thumbnail_url,
          conversion.thumbnail_url
        ]);
        
        console.log(`Processing conversion ${conversion.id}:`, {
          local_model_url: conversion.local_model_url,
          model_url: conversion.model_url,
          prioritized_model_url: prioritizedModelUrl,
          local_thumbnail_url: conversion.local_thumbnail_url,
          thumbnail_url: conversion.thumbnail_url,
          prioritized_thumbnail_url: prioritizedThumbnailUrl
        });
        
        // Valid art styles from the Figurine type
        const validStyles: Figurine['style'][] = ['isometric', 'anime', 'pixar', 'steampunk', 'lowpoly', 'cyberpunk', 'realistic', 'chibi', 'text-to-3d'];
        const validStyle = validStyles.includes(conversion.art_style as Figurine['style'])
          ? conversion.art_style as Figurine['style']
          : 'text-to-3d' as const;
        
        return {
          id: conversion.id,
          title: `Text-to-3D: ${conversion.prompt?.substring(0, 30) || 'Generated Model'}${conversion.prompt && conversion.prompt.length > 30 ? '...' : ''}`,
          prompt: conversion.prompt || "",
          style: validStyle,
          image_url: prioritizedThumbnailUrl || "",
          saved_image_url: prioritizedThumbnailUrl,
          model_url: prioritizedModelUrl,
          created_at: conversion.created_at || new Date().toISOString(),
          user_id: conversion.user_id,
          is_public: false,
          file_type: '3d-model' as const,
          metadata: {
            conversion_type: 'text-to-3d',
            art_style: conversion.art_style,
            generation_mode: conversion.generation_mode,
            topology_type: conversion.topology_type
          }
        };
      });
      
      // Combine and sort by creation date
      const allFigurines = [...processedFigurines, ...processedConversions];
      allFigurines.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setFigurines(allFigurines);
      setError(null);
      
      console.log(`✅ [FIGURINES] Combined ${allFigurines.length} total items`);
      
      // Log model availability statistics
      const modelsWithUrls = allFigurines.filter(f => f.model_url);
      const validModels = modelsWithUrls.filter(f => {
        const validation = validateAndCleanUrl(f.model_url);
        return validation.isValid;
      });
      
      console.log('📊 [FIGURINES] Model URL statistics:', {
        total: allFigurines.length,
        withModelUrls: modelsWithUrls.length,
        validModelUrls: validModels.length,
        invalidModelUrls: modelsWithUrls.length - validModels.length,
        localModels: validModels.filter(f => {
          const validation = validateAndCleanUrl(f.model_url);
          return validation.isLocal;
        }).length
      });
      
    } catch (err: any) {
      console.error('Error fetching figurines:', err);
      setError('Failed to load your figurines');
      toast({
        title: "Error loading figurines",
        description: err.message || "Could not load your figurines",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
    
  useEffect(() => {
    fetchFigurines();
    
    // Subscribe to changes in both tables
    const figurinesSubscription = supabase
      .channel('figurines-channel')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'figurines' }, 
          () => {
            console.log("Figurines table changed, refreshing data");
            fetchFigurines();
          }
      )
      .subscribe();
      
    const conversionsSubscription = supabase
      .channel('conversions-channel')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'conversion_tasks' }, 
          (payload: { new?: any; old?: any; eventType?: string }) => {
            // Only refresh when a task is completed
            if (payload.new && payload.new.status === 'SUCCEEDED') {
              console.log("Text-to-3D conversion completed, refreshing data");
              fetchFigurines();
            }
          }
      )
      .subscribe();
      
    return () => {
      figurinesSubscription.unsubscribe();
      conversionsSubscription.unsubscribe();
    };
  }, [fetchFigurines]);

  return { figurines, loading, error, refreshFigurines: fetchFigurines };
};
